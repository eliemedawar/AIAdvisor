"""
Deterministic merge of specialist agent replies.
If one agent ran, return its reply as-is. If multiple, stitch with plain section headers.
"""
from __future__ import annotations

# Only applied to multi-agent merged output; single-agent replies are never trimmed.
MAX_MERGED_LENGTH = 3000

# Display labels for each agent in merged output (plain headings, no markdown)
AGENT_LABELS: dict[str, str] = {
    "scheduling": "Scheduling & deadlines",
    "advisor": "Academic advice",
    "course_progress": "Course progress",
}


def merge_agent_replies(replies: dict[str, str]) -> str:
    """
    Merge specialist replies into a single response.
    - If exactly one agent ran, return its reply as-is with NO length trimming.
    - If 2–3 agents ran, use intro "Here's a breakdown:\n" and plain headings (Label:\n).
      Trim combined output to MAX_MERGED_LENGTH chars.
    """
    if not replies:
        return "I couldn't generate a response for that. Please try again."
    if len(replies) == 1:
        # Return the full reply — never cut off with "..." here.
        return next(iter(replies.values())).strip()

    parts = ["Here's a breakdown:\n"]
    for agent_name, text in replies.items():
        label = AGENT_LABELS.get(agent_name, agent_name.replace("_", " ").title())
        content = (text or "").strip()
        parts.append(f"{label}:\n{content}\n")
    out = "\n".join(parts).strip()
    return _trim_output(out)


def _trim_output(s: str, max_len: int = MAX_MERGED_LENGTH) -> str:
    """Trim multi-agent combined text to max_len (hard safety cap)."""
    s = (s or "").strip()
    if len(s) <= max_len:
        return s
    return s[:max_len].rstrip()
