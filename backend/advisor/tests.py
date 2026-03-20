"""Quick sanity tests for advisor API (orchestration + merge). Mock-based tests for memory and orchestration."""
from __future__ import annotations

from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from advisor.models import Conversation
from advisor.services.memory import (
    MAX_SUMMARY_TOTAL_CHARS,
    build_conversation_summary,
)
from advisor.services.clarifier import ClarifierOutput
from advisor.services.orchestration import get_advisor_reply
from advisor.services.types import RouterOutput


class AdvisorMessagesSanityTest(TestCase):
    """Sanity: POST messages that trigger 1 agent and 2–3 agents; API returns normal assistant reply."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="sanity@test.edu",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        self.conv = Conversation.objects.create(user=self.user, title="Sanity")

    def test_one_agent_message_returns_assistant_reply(self):
        """One message (e.g. scheduling) -> 201 and one assistant reply."""
        resp = self.client.post(
            f"/api/advisor/conversations/{self.conv.pk}/messages/",
            {"content": "What's due this week?"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertIsInstance(resp.data, dict)
        messages = resp.data.get("messages") or []
        self.assertIsInstance(messages, list)
        self.assertEqual(len(messages), 2)
        user_msg = next(m for m in messages if m["role"] == "user")
        assistant_msg = next(m for m in messages if m["role"] == "assistant")
        self.assertEqual(user_msg["content"], "What's due this week?")
        self.assertIsInstance(assistant_msg["content"], str)
        self.assertGreater(len(assistant_msg["content"].strip()), 0)

    def test_multi_agent_message_returns_assistant_reply(self):
        """Message that can trigger 2–3 agents -> 201 and one assistant reply."""
        resp = self.client.post(
            f"/api/advisor/conversations/{self.conv.pk}/messages/",
            {
                "content": "What do I have due soon, and how can I improve my GPA?"
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertIsInstance(resp.data, dict)
        messages = resp.data.get("messages") or []
        self.assertIsInstance(messages, list)
        self.assertEqual(len(messages), 2)
        assistant_msg = next(m for m in messages if m["role"] == "assistant")
        self.assertIsInstance(assistant_msg["content"], str)
        self.assertGreater(len(assistant_msg["content"].strip()), 0)


class ConversationSummaryMemoryTest(TestCase):
    """Tests for build_conversation_summary (strict limits, deterministic)."""

    def test_empty_messages_returns_placeholder(self):
        self.assertEqual(
            build_conversation_summary([]),
            "(No conversation yet.)",
        )

    def test_respects_max_total_chars(self):
        long = "x" * 100
        messages = [{"role": "user", "content": long}, {"role": "assistant", "content": long}] * 5
        out = build_conversation_summary(messages, max_total_chars=80)
        self.assertLessEqual(len(out), 84)

    def test_includes_last_messages(self):
        messages = [
            {"role": "user", "content": "First"},
            {"role": "assistant", "content": "One"},
            {"role": "user", "content": "Second"},
        ]
        out = build_conversation_summary(messages, max_total_chars=500)
        self.assertIn("First", out)
        self.assertIn("One", out)
        self.assertIn("Second", out)

    def test_trims_per_message_chars(self):
        messages = [{"role": "user", "content": "a" * 200}]
        out = build_conversation_summary(
            messages,
            max_message_chars=50,
            max_total_chars=500,
        )
        self.assertLessEqual(len(out.split("\n")[0]), 50 + 10)

    def test_default_total_cap(self):
        messages = [{"role": "user", "content": "word " * 200}]
        out = build_conversation_summary(messages)
        self.assertLessEqual(len(out), MAX_SUMMARY_TOTAL_CHARS + 10)


class OrchestrationMockTest(TestCase):
    """Mock-based tests: get_advisor_reply with mocked router and LLM."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="mock@test.edu",
            password="testpass123",
        )
        self.conv = Conversation.objects.create(user=self.user, title="Mock")
        self.conv.messages.create(role="user", content="What is due?")

    @patch("advisor.services.orchestration.run_router")
    @patch("advisor.services.agents.call_llm")
    def test_returns_merged_reply_when_one_agent_mocked(
        self,
        mock_call_llm,
        mock_run_router,
    ):
        mock_run_router.return_value = RouterOutput(agents=["scheduling"], confidence=0.9)
        mock_call_llm.return_value = "You have 2 assignments due this week."
        reply = get_advisor_reply(self.user, self.conv)
        self.assertIn("You have 2 assignments due this week.", reply)
        mock_run_router.assert_called_once()
        mock_call_llm.assert_called()

    @patch("advisor.services.orchestration.run_router")
    @patch("advisor.services.agents.call_llm")
    def test_returns_merged_reply_when_two_agents_mocked(
        self,
        mock_call_llm,
        mock_run_router,
    ):
        mock_run_router.return_value = RouterOutput(
            agents=["scheduling", "advisor"],
            confidence=0.85,
        )
        def side_effect(system, messages, **kwargs):
            if "scheduling" in (system or "").lower() or "Scheduling" in system:
                return "Assignment A due Friday."
            return "Focus on consistency to improve GPA."
        mock_call_llm.side_effect = side_effect
        reply = get_advisor_reply(self.user, self.conv)
        self.assertIn("Assignment A due Friday.", reply)
        self.assertIn("Focus on consistency", reply)
        mock_run_router.assert_called_once()

    @patch("advisor.services.orchestration.run_clarifier")
    @patch("advisor.services.orchestration.run_router")
    def test_router_receives_conversation_summary(self, mock_run_router, mock_run_clarifier):
        mock_run_clarifier.return_value = ClarifierOutput(action="proceed", question=None, reason="")
        mock_run_router.return_value = RouterOutput(agents=["advisor"], confidence=0.9)
        with patch("advisor.services.agents.call_llm") as mock_agent_llm:
            mock_agent_llm.return_value = "Advice here."
            get_advisor_reply(self.user, self.conv)
        call_kw = mock_run_router.call_args[1]
        self.assertIn("conversation_summary", call_kw)
        summary = call_kw["conversation_summary"]
        self.assertIn("What is due?", summary)

    @patch("advisor.services.router.call_llm")
    @patch("advisor.services.agents.call_llm")
    def test_router_llm_called_with_summary_in_content(
        self,
        mock_agent_llm,
        mock_router_llm,
    ):
        mock_router_llm.return_value = '{"agents":["scheduling"],"confidence":0.9}'
        mock_agent_llm.return_value = "Scheduling reply."
        get_advisor_reply(self.user, self.conv)
        self.assertTrue(mock_router_llm.called)
        args = mock_router_llm.call_args[0]
        self.assertEqual(len(args), 2)
        messages_arg = args[1]
        self.assertEqual(len(messages_arg), 1)
        content = getattr(messages_arg[0], "content", None) or str(messages_arg[0])
        self.assertIn("Conversation summary:", content)
        self.assertIn("What is due?", content)

    @patch("advisor.services.orchestration.run_clarifier")
    @patch("advisor.services.orchestration.run_router")
    @patch("advisor.services.agents.call_llm")
    def test_agent_system_prompt_contains_conversation_summary(
        self,
        mock_call_llm,
        mock_run_router,
        mock_run_clarifier,
    ):
        mock_run_clarifier.return_value = ClarifierOutput(action="proceed", question=None, reason="")
        mock_run_router.return_value = RouterOutput(agents=["advisor"], confidence=0.9)
        mock_call_llm.return_value = "Advice text."
        get_advisor_reply(self.user, self.conv)
        system_prompt = mock_call_llm.call_args[0][0]
        self.assertIn("Conversation summary:", system_prompt)
        self.assertIn("What is due?", system_prompt)


class ClarifierIntegrationTest(TestCase):
    """Clarifier: ambiguous message gets a question; clear message runs specialists."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="clarifier@test.edu",
            password="testpass123",
        )

    @patch("advisor.services.orchestration.run_router")
    @patch("advisor.services.orchestration.run_clarifier")
    @patch("advisor.services.agents.call_llm")
    def test_ambiguous_message_returns_clarifying_question(
        self,
        mock_agent_llm,
        mock_run_clarifier,
        mock_run_router,
    ):
        """Input 'what about next week?' -> assistant reply is a clarifying question."""
        self.conv = Conversation.objects.create(user=self.user, title="Clarifier")
        self.conv.messages.create(role="user", content="what about next week?")
        mock_run_router.return_value = RouterOutput(agents=["advisor"], confidence=0.4)
        mock_run_clarifier.return_value = ClarifierOutput(
            action="ask_question",
            question="Do you mean next week's assignments or next week's classes?",
            reason="timeframe and topic unclear",
        )
        reply = get_advisor_reply(self.user, self.conv)
        self.assertIn("?", reply)
        self.assertIn("next week", reply.lower())
        mock_run_clarifier.assert_called_once()
        mock_agent_llm.assert_not_called()

    @patch("advisor.services.orchestration.run_clarifier")
    @patch("advisor.services.orchestration.run_router")
    @patch("advisor.services.agents.call_llm")
    def test_clear_message_runs_specialists_not_clarifier(
        self,
        mock_call_llm,
        mock_run_router,
        mock_run_clarifier,
    ):
        """Input 'what assignments are due this week?' -> clarifier not triggered, specialists run."""
        self.conv = Conversation.objects.create(user=self.user, title="Clear")
        self.conv.messages.create(role="user", content="what assignments are due this week?")
        mock_run_router.return_value = RouterOutput(agents=["scheduling"], confidence=0.9)
        mock_call_llm.return_value = "Assignment A due Friday; Assignment B due Sunday."
        reply = get_advisor_reply(self.user, self.conv)
        self.assertIn("Assignment A", reply)
        self.assertIn("Friday", reply)
        mock_run_clarifier.assert_not_called()
