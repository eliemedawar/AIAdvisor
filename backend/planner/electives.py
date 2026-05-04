from __future__ import annotations

# Official elective course lists for AUB CCE curriculum.
# Each entry: {"code": str, "name": str, "credits": int}

ELECTIVE_LISTS: dict[str, list[dict]] = {
    # ── Humanities & Social Sciences ────────────────────────────────────────
    "hss": [
        # Cultures and Histories
        {"code": "CVSP 201", "name": "Civilization Sequence I", "credits": 3},
        {"code": "CVSP 202", "name": "Civilization Sequence II", "credits": 3},
        {"code": "HIST 201", "name": "History of the Islamic World", "credits": 3},
        {"code": "HIST 202", "name": "History of the Modern Middle East", "credits": 3},
        {"code": "HIST 203", "name": "Modern European History", "credits": 3},
        {"code": "HIST 211", "name": "History of Science and Technology", "credits": 3},
        {"code": "PHIL 201", "name": "Introduction to Philosophy", "credits": 3},
        {"code": "PHIL 202", "name": "Ethics and Society", "credits": 3},
        {"code": "PHIL 226", "name": "Logic and Reasoning", "credits": 3},
        {"code": "ENGL 201", "name": "Introduction to Literature", "credits": 3},
        {"code": "ENGL 204", "name": "Survey of World Literature", "credits": 3},
        {"code": "ENGL 210", "name": "Creative Writing", "credits": 3},
        {"code": "AHIS 201", "name": "Survey of Western Art", "credits": 3},
        {"code": "AHIS 203", "name": "Survey of Middle Eastern Art", "credits": 3},
        {"code": "ARCH 201", "name": "Introduction to Architecture", "credits": 3},
        # Societies and Individuals
        {"code": "PSPA 201", "name": "Introduction to Political Science", "credits": 3},
        {"code": "PSPA 202", "name": "Governance and Public Policy", "credits": 3},
        {"code": "SOAN 201", "name": "Introduction to Sociology", "credits": 3},
        {"code": "SOAN 203", "name": "Introduction to Anthropology", "credits": 3},
        {"code": "ECON 211", "name": "Principles of Microeconomics", "credits": 3},
        {"code": "MCOM 201", "name": "Communication and Society", "credits": 3},
        {"code": "MCOM 202", "name": "Communication Theory", "credits": 3},
    ],

    # ── Science Electives ───────────────────────────────────────────────────
    "science": [
        {"code": "BIOL 201", "name": "General Biology I", "credits": 3},
        {"code": "BIOL 202", "name": "General Biology II", "credits": 3},
        {"code": "BIOL 210", "name": "Ecology", "credits": 3},
        {"code": "CHEM 201", "name": "General Chemistry I", "credits": 3},
        {"code": "CHEM 207", "name": "Organic Chemistry I", "credits": 3},
        {"code": "CHEM 211", "name": "Analytical Chemistry", "credits": 3},
        {"code": "GEOL 201", "name": "Physical Geology", "credits": 3},
        {"code": "GEOL 205", "name": "Environmental Geology", "credits": 3},
        {"code": "GEOL 211", "name": "Geomorphology", "credits": 3},
        {"code": "MAUD 204", "name": "Environmental Measurements", "credits": 3},
        {"code": "PHYL 246", "name": "Human Physiology", "credits": 3},
        {"code": "PHYS 212", "name": "Physics III: Modern Physics", "credits": 3},
        {"code": "PHYS 217", "name": "Introduction to Modern Physics", "credits": 3},
        {"code": "PHYS 223", "name": "Waves and Acoustics", "credits": 3},
        {"code": "PHYS 235", "name": "Thermodynamics", "credits": 3},
        {"code": "PHYS 236", "name": "Statistical Physics", "credits": 3},
    ],

    # ── Arabic Language ─────────────────────────────────────────────────────
    "arabic": [
        {"code": "ARAB 201", "name": "Arabic Language I", "credits": 3},
        {"code": "ARAB 202", "name": "Arabic Language II", "credits": 3},
        {"code": "ARAB 203", "name": "Arabic Language III", "credits": 3},
        {"code": "ARAB 204", "name": "Arabic Language IV", "credits": 3},
        {"code": "ARAB 205", "name": "Arabic Language V", "credits": 3},
        {"code": "ARAB 206", "name": "Arabic Language VI", "credits": 3},
        {"code": "ARAB 207", "name": "Arabic Language VII", "credits": 3},
        {"code": "ARAB 223", "name": "Technical Arabic", "credits": 3},
    ],

    # ── CCE Focus Area Restricted Electives (Areas 1 + 2 + 3) ───────────────
    "cce_restricted": [
        # Area 1 — Hardware and Embedded Systems
        {"code": "EECE 412", "name": "Digital Integrated Circuits", "credits": 3},
        {"code": "EECE 420", "name": "Digital Systems Design II", "credits": 3},
        {"code": "EECE 422", "name": "Parallel Computer Architecture and Programming", "credits": 3},
        {"code": "EECE 423", "name": "Reconfigurable Computing", "credits": 3},
        {"code": "EECE 425", "name": "Embedded Microprocessor System Design", "credits": 3},
        # Area 2 — Communications and Signal Processing
        {"code": "EECE 451", "name": "Mobile Networks and Applications", "credits": 3},
        {"code": "EECE 455", "name": "Cryptography and Networks Security", "credits": 3},
        {"code": "EECE 491", "name": "Digital Signal Processing", "credits": 3},
        # Area 3 — Software and Computing
        {"code": "EECE 331", "name": "Design and Analysis of Algorithms", "credits": 3},
        {"code": "EECE 332", "name": "Object-Oriented and Effective Java Programming", "credits": 3},
        {"code": "EECE 334", "name": "Programming Language Design and Implementation", "credits": 3},
        {"code": "EECE 338", "name": "Theory of Computation", "credits": 3},
        {"code": "EECE 430", "name": "Software Engineering", "credits": 3},
        {"code": "EECE 432", "name": "Operating Systems", "credits": 3},
        {"code": "EECE 433", "name": "Database Systems", "credits": 3},
        {"code": "EECE 437", "name": "Software Architecture and Design Fundamentals", "credits": 3},
    ],

    # ── Math Electives ──────────────────────────────────────────────────────
    "math_elective": [
        {"code": "MATH 210", "name": "Applied Mathematics", "credits": 3},
        {"code": "MATH 224", "name": "Complex Analysis", "credits": 3},
        {"code": "MATH 227", "name": "Numerical Analysis", "credits": 3},
        {"code": "MATH 251", "name": "Combinatorics", "credits": 3},
        {"code": "MATH 261", "name": "Graph Theory", "credits": 3},
    ],

    # ── EECE Elective (upper-level, not in core) ────────────────────────────
    "eece_elective": [
        {"code": "EECE 370", "name": "Electric Machines and Power Fundamentals", "credits": 3},
        {"code": "EECE 460", "name": "Control Systems", "credits": 3},
        {"code": "EECE 461", "name": "Instrumentation", "credits": 3},
        {"code": "EECE 471", "name": "Fundamentals of Power Systems Analysis", "credits": 3},
        {"code": "EECE 473", "name": "Power Electronics", "credits": 3},
        {"code": "EECE 474", "name": "Electric Drives", "credits": 3},
        {"code": "EECE 476", "name": "Power System Protection and Switchgear", "credits": 3},
        {"code": "EECE 481", "name": "Applications of Electromagnetic Fields", "credits": 3},
        {"code": "EECE 490", "name": "Introduction to Machine Learning", "credits": 3},
        {"code": "EECE 491", "name": "Digital Signal Processing", "credits": 3},
    ],

    # ── Technical Electives (pre-approved cross-department) ─────────────────
    # Course names pending confirmation from official AUB catalog
    "technical": [],

    # ── EECE Restricted Laboratory ──────────────────────────────────────────
    "restricted_lab": [
        {"code": "EECE 412L", "name": "VLSI Computer Aided Design Lab", "credits": 1},
        {"code": "EECE 430L", "name": "Web, Mobile, and Application Development Lab", "credits": 2},
        {"code": "EECE 431L", "name": "Programming Contest Lab", "credits": 1},
        {"code": "EECE 434L", "name": "Software Prototyping Lab", "credits": 1},
        {"code": "EECE 435L", "name": "Software Tools Laboratory", "credits": 1},
        {"code": "EECE 442L", "name": "Communications Laboratory", "credits": 1},
        {"code": "EECE 451L", "name": "Internetworking Laboratory", "credits": 1},
    ],

    # ── EECE Elective Laboratory ────────────────────────────────────────────
    "elective_lab": [
        {"code": "EECE 412L", "name": "VLSI Computer Aided Design Lab", "credits": 1},
        {"code": "EECE 430L", "name": "Web, Mobile, and Application Development Lab", "credits": 2},
        {"code": "EECE 431L", "name": "Programming Contest Lab", "credits": 1},
        {"code": "EECE 434L", "name": "Software Prototyping Lab", "credits": 1},
        {"code": "EECE 435L", "name": "Software Tools Laboratory", "credits": 1},
        {"code": "EECE 442L", "name": "Communications Laboratory", "credits": 1},
        {"code": "EECE 451L", "name": "Internetworking Laboratory", "credits": 1},
    ],
}

# Maps a placeholder code to its requirement type key in ELECTIVE_LISTS.
PLACEHOLDER_TO_REQUIREMENT: dict[str, str] = {
    "HSS Elective": "hss",
    "Science Elective": "science",
    "ARAB": "arabic",
    "EECE 3xx/4xx": "cce_restricted",
    "MATH Elective": "math_elective",
    "EECE Elective": "eece_elective",
    "EECE Restricted Laboratory": "restricted_lab",
    "Technical Elective": "technical",
    "EECE Elective Laboratory": "elective_lab",
}


def get_requirement_type(placeholder_code: str) -> str:
    """Return the requirement type key for a placeholder code, or empty string."""
    return PLACEHOLDER_TO_REQUIREMENT.get(placeholder_code, "")
