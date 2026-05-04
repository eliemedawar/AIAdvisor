from __future__ import annotations

import json
import os
import re

_JSON_PATH = os.path.join(os.path.dirname(__file__), "curricula.json")

with open(_JSON_PATH, encoding="utf-8") as _f:
    CURRICULA: dict = json.load(_f)

# A real course code always contains three or more consecutive digits (e.g. "EECE 310", "MATH 201").
# Placeholder codes like "HSS Elective", "EECE 3xx/4xx", "ARAB" do not.
_REAL_CODE_RE = re.compile(r"\d{3}")


def is_placeholder(code: str) -> bool:
    """Return True when the code is an elective/placeholder slot, not a fixed course."""
    return not bool(_REAL_CODE_RE.search(code))
