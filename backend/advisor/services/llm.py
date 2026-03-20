"""
LLM service: single entry point for chat completions with timeout, retry, and safe defaults.
"""
from __future__ import annotations

import logging
import os
from typing import Iterable, Sequence

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

# Defaults
DEFAULT_MODEL = "gpt-4.1-mini"
DEFAULT_TEMPERATURE = 0.3
DEFAULT_MAX_TOKENS = 800
DEFAULT_TIMEOUT_SECONDS = 60


class LLMServiceError(Exception):
    """Raised when the LLM service fails after retries (e.g. timeout, API error)."""
    pass


def _build_chat_history(
    system_prompt: str,
    messages: Iterable[BaseMessage] | None = None,
) -> list[BaseMessage]:
    history: list[BaseMessage] = [SystemMessage(content=system_prompt)]
    if messages:
        history.extend(messages)
    return history


def call_llm(
    system_prompt: str,
    messages: Sequence[BaseMessage] | None = None,
    model: str = DEFAULT_MODEL,
    *,
    temperature: float = DEFAULT_TEMPERATURE,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    request_id: str | None = None,
) -> str:
    """
    Call the chat model once and return text content.
    Uses one automatic retry on transient errors.
    All backend LLM calls should go through this function.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise LLMServiceError("OPENAI_API_KEY is not set in the environment.")

    chat_history = _build_chat_history(system_prompt, messages)
    message_count = len(chat_history)
    log_extra = {"request_id": request_id} if request_id else {}
    logger.info(
        "call_llm: model=%s message_count=%s",
        model,
        message_count,
        extra=log_extra,
    )

    llm = ChatOpenAI(
        model=model,
        api_key=api_key,
        temperature=temperature,
        max_tokens=max_tokens,
        request_timeout=timeout_seconds,
    )

    last_error: Exception | None = None
    for attempt in (1, 2):
        try:
            response = llm.invoke(chat_history)
            return response.content
        except Exception as e:
            last_error = e
            # Retry on transient-looking errors (timeout, rate limit, server error)
            is_transient = (
                "timeout" in str(e).lower()
                or "429" in str(e)
                or "503" in str(e)
                or "500" in str(e)
                or "502" in str(e)
            )
            if attempt == 1 and is_transient:
                logger.warning(
                    "call_llm retry after transient error: %s",
                    e,
                    extra=log_extra,
                )
                continue
            break

    logger.exception(
        "call_llm failed: %s",
        last_error,
        extra=log_extra,
    )
    raise LLMServiceError(f"LLM call failed: {last_error!s}") from last_error


def make_human(message: str) -> HumanMessage:
    """Convenience helper for building human messages."""
    return HumanMessage(content=message)
