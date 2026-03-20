"""
Router: decides which specialist agent(s) to run from conversation history.
Uses last N messages (not just latest) and strict Pydantic parsing with fallback.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from langchain_core.messages import HumanMessage

from .llm import call_llm
from .memory import build_conversation_summary
from .prompts import ROUTER_SYSTEM_PROMPT
from .types import RouterOutput, VALID_AGENT_NAMES

logger = logging.getLogger(__name__)

# How many messages to include for router (pairs of user/assistant)
ROUTER_MAX_MESSAGES = 6
# Trim each message to this many chars to avoid blowing tokens
ROUTER_MESSAGE_CAP = 500

FALLBACK_AGENTS: list[str] = ["advisor"]


def _trim(s: str, cap: int = ROUTER_MESSAGE_CAP) -> str:
    s = (s or "").strip()
    if len(s) <= cap:
        return s
    return s[: cap - 3] + "..."


def build_router_conversation_text(messages: list[dict[str, Any]]) -> str:
    """
    Build a single text blob for the router from the last N messages.
    Each message is "User: ..." or "Assistant: ..." with content trimmed.
    """
    if not messages:
        return "(No conversation yet.)"
    # Last N messages (most recent last)
    recent = messages[-ROUTER_MAX_MESSAGES:]
    parts = []
    for m in recent:
        role = (m.get("role") or "user").strip().lower()
        label = "Assistant" if role == "assistant" else "User"
        content = _trim(m.get("content") or "", ROUTER_MESSAGE_CAP)
        parts.append(f"{label}: {content}")
    return "\n\n".join(parts)


def run_router(
    messages: list[dict[str, Any]],
    *,
    request_id: str | None = None,
    conversation_summary: str | None = None,
) -> RouterOutput:
    """
    Call the router LLM with the conversation view, parse JSON, validate with Pydantic.
    - If JSON parsing fails -> fallback to ["advisor"].
    - If Pydantic validation fails -> fallback to ["advisor"].
    - If confidence < 0.5 -> fallback to ["advisor"].
    Router never returns duplicate agent names.
    """
    log_extra = {"request_id": request_id} if request_id else {}
    logger.info("run_router", extra=log_extra)

    summary = conversation_summary if conversation_summary else build_conversation_summary(messages)
    conversation_text = build_router_conversation_text(messages)
    router_input = f"Conversation summary:\n{summary}\n\nLatest messages:\n{conversation_text}"
    user_message = HumanMessage(content=router_input)
    raw = call_llm(ROUTER_SYSTEM_PROMPT, [user_message], request_id=request_id)

    # Log raw output before validation (for debugging)
    text = (raw or "").strip()
    logger.debug("router raw output: %s", text[:500] + "..." if len(text) > 500 else text, extra=log_extra)

    # Extract JSON: find outermost {...} that contains "agents"
    start = text.find("{")
    if start == -1:
        logger.warning("router: no JSON object found, fallback to advisor", extra=log_extra)
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=0.0)
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
    if end == -1 or '"agents"' not in text[start : end + 1]:
        logger.warning("router: invalid or missing agents in JSON, fallback to advisor", extra=log_extra)
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=0.0)
    text = text[start : end + 1]

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning("router: JSON decode error %s, fallback to advisor", e, extra=log_extra)
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=0.0)

    try:
        out = RouterOutput.model_validate(data)
    except Exception as e:
        logger.warning("router: Pydantic validation error %s, fallback to advisor", e, extra=log_extra)
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=0.0)

    # Confidence < 0.5 -> full fallback to advisor
    if out.confidence < 0.5:
        logger.info("router: confidence %.2f < 0.5, fallback to advisor", out.confidence, extra=log_extra)
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=out.confidence)

    # Keep only valid agent names and remove duplicates (order preserved)
    valid_agents = list(dict.fromkeys(a for a in out.agents if a in VALID_AGENT_NAMES))
    if not valid_agents:
        return RouterOutput(agents=FALLBACK_AGENTS, confidence=out.confidence)

    return RouterOutput(agents=valid_agents, confidence=out.confidence)
