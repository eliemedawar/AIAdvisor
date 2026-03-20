"""
Clarifier agent: asks one short clarifying question when the user request is ambiguous.
Runs only when router confidence is low or router selected only advisor. Does not answer requests.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Literal

from langchain_core.messages import HumanMessage

from pydantic import BaseModel, Field

from .llm import call_llm

logger = logging.getLogger(__name__)

CLARIFIER_MAX_TOKENS = 200

CLARIFIER_SYSTEM_PROMPT = """You are a clarifier. You are NOT an advisor. You do NOT answer the student's request.

You only decide:
1. Whether the user message is ambiguous (e.g. "what about next week?" without context).
2. If ambiguous, output ONE concise clarifying question.

Rules:
- Only ask a question if necessary to understand the request. If the intent is clear, use action "proceed".
- Prefer asking about missing timeframe, course, or topic.
- Never provide advice. Never invent academic rules.
- The question must be short (max 20 words).
- Output ONLY valid JSON matching this schema: {"action": "ask_question" | "proceed", "question": "..." or null, "reason": "..."}

Example when ambiguous:
{"action":"ask_question","question":"Do you mean next week's assignments or next week's classes?","reason":"timeframe and topic unclear"}

Example when clear:
{"action":"proceed","question":null,"reason":"user asked clearly about assignments due this week"}"""


class ClarifierOutput(BaseModel):
    """Schema for clarifier LLM response. On parse failure we proceed."""

    action: Literal["ask_question", "proceed"] = Field(
        description="Whether to ask a clarifying question or proceed to specialists",
    )
    question: str | None = Field(default=None, description="Clarifying question if action is ask_question")
    reason: str = Field(default="", description="Short reason for the decision")


def run_clarifier(
    messages: list[dict[str, Any]],
    conversation_summary: str,
    *,
    request_id: str | None = None,
) -> ClarifierOutput:
    """
    Decide if the user request is ambiguous; if so return one short clarifying question.
    Does not modify context, does not save to DB. Uses at most CLARIFIER_MAX_TOKENS output.
    On parse failure returns action="proceed".
    """
    log_extra = {"request_id": request_id} if request_id else {}
    logger.info("clarifier_start", extra=log_extra)

    if not messages:
        logger.info("clarifier_proceed reason=no_messages", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="no messages")

    # Build user content: summary + last few messages
    parts = [f"Conversation summary:\n{conversation_summary}", "\nLatest messages:"]
    for m in messages[-6:]:
        role = (m.get("role") or "user").strip().lower()
        label = "Assistant" if role == "assistant" else "User"
        content = (m.get("content") or "").strip()[:300]
        parts.append(f"{label}: {content}")
    user_content = "\n".join(parts)
    user_message = HumanMessage(content=user_content)

    try:
        raw = call_llm(
            CLARIFIER_SYSTEM_PROMPT,
            [user_message],
            request_id=request_id,
            max_tokens=CLARIFIER_MAX_TOKENS,
        )
    except Exception as e:
        logger.warning("clarifier failed, proceeding: %s", e, extra=log_extra)
        logger.info("clarifier_proceed reason=call_failed", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="clarifier call failed")

    text = (raw or "").strip()
    # Extract JSON
    start = text.find("{")
    if start == -1:
        logger.info("clarifier_proceed reason=no_json", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="no json")
    depth = 0
    end = -1
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    if end == -1:
        logger.info("clarifier_proceed reason=invalid_json", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="invalid json")
    json_str = text[start : end + 1]
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        logger.info("clarifier_proceed reason=json_decode_error", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="json decode error")
    try:
        out = ClarifierOutput.model_validate(data)
    except Exception:
        logger.info("clarifier_proceed reason=validation_error", extra=log_extra)
        return ClarifierOutput(action="proceed", question=None, reason="validation error")

    if out.action == "ask_question" and out.question and out.question.strip():
        logger.info(
            "clarifier_asked_question question=%s reason=%s",
            out.question[:80],
            out.reason,
            extra=log_extra,
        )
        return out
    logger.info("clarifier_proceed reason=%s", out.reason or "action_proceed", extra=log_extra)
    return out
