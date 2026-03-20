"""
Lightweight conversation summary for router and agents.
Deterministic, strict character limits (no LLM). Injected into router and agent prompts.
"""
from __future__ import annotations

from typing import Any

# Strict token/char limits (~100 tokens ≈ 400 chars)
MAX_SUMMARY_MESSAGES = 6
MAX_SUMMARY_MESSAGE_CHARS = 70
MAX_SUMMARY_TOTAL_CHARS = 400


def build_conversation_summary(
    messages: list[dict[str, Any]],
    *,
    max_messages: int = MAX_SUMMARY_MESSAGES,
    max_message_chars: int = MAX_SUMMARY_MESSAGE_CHARS,
    max_total_chars: int = MAX_SUMMARY_TOTAL_CHARS,
) -> str:
    """
    Build a short, deterministic summary from the last N messages.
    Each message is "User: ..." or "Assistant: ..." with content trimmed per message
    and total length capped. Used to inject conversation memory into router and agents.
    """
    if not messages:
        return "(No conversation yet.)"
    recent = messages[-max_messages:]
    parts = []
    for m in recent:
        role = (m.get("role") or "user").strip().lower()
        label = "Assistant" if role == "assistant" else "User"
        content = (m.get("content") or "").strip()
        if len(content) > max_message_chars:
            content = content[: max_message_chars - 3] + "..."
        if content:
            parts.append(f"{label}: {content}")
    out = "\n".join(parts)
    if len(out) > max_total_chars:
        out = out[: max_total_chars - 4] + "...\n"
    return out
