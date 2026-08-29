import os

import requests

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Configurable via env var since Google renames/retires Gemini models
# fairly often. If this stops working, check ai.google.dev for the
# current flash model name and update GEMINI_MODEL on Render - no code
# change needed.
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)


def _call_gemini(prompt: str) -> str:

    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured on the server. "
            "Add it as an environment variable/secret."
        )

    response = requests.post(
        GEMINI_URL,
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY
        },
        json={
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        },
        timeout=30
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Gemini API error ({response.status_code}): "
            f"{response.text[:300]}"
        )

    data = response.json()

    try:
        return (
            data["candidates"][0]["content"]["parts"][0]["text"]
            .strip()
        )
    except (KeyError, IndexError, TypeError):
        raise RuntimeError("Unexpected response shape from Gemini API.")


def _format_feedback_fields(item: dict) -> str:

    labels = [
        ("Service", "service"),
        ("Waiting time", "waiting"),
        ("Staff", "staff"),
        ("Office", "office"),
        ("Parking", "parking")
    ]

    lines = []

    for label, key in labels:

        value = item.get(key)

        if value:
            lines.append(f"{label}: {value}")

    return "\n".join(lines)


def generate_improvement(item: dict) -> str:
    """One short, actionable improvement suggestion for a single piece
    of negative feedback."""

    fields = _format_feedback_fields(item)
    comment = item.get("comment") or "(no comment left)"

    prompt = (
        "You are a customer experience analyst for SLTMobitel, a telecom "
        "company. A customer left the following negative feedback about "
        "one of the branches:\n\n"
        f"{fields}\n"
        f"Comment: {comment}\n\n"
        "In 2-3 concise, specific sentences, suggest one practical "
        "improvement the branch or service team could make to address "
        "this. Avoid generic advice like 'improve customer service' - "
        "be concrete about what to actually change."
    )

    return _call_gemini(prompt)


def generate_negative_summary(items: list) -> str:
    """One overall summary + top recommendations across a batch of
    negative feedback entries."""

    # Cap how many entries go into the prompt so it stays a reasonable
    # size and cost even if there's a lot of negative feedback in range.
    capped = items[:60]

    lines = []

    for item in capped:

        fields = _format_feedback_fields(item).replace("\n", ", ")
        comment = item.get("comment") or ""

        lines.append(f"- {fields}. Comment: {comment}")

    joined = "\n".join(lines)

    note = ""
    if len(items) > len(capped):
        note = (
            f"\n(Showing the {len(capped)} most relevant of "
            f"{len(items)} total negative entries.)"
        )

    prompt = (
        "You are a customer experience analyst for SLTMobitel, a telecom "
        "company. Below is a list of negative customer feedback entries "
        f"from a selected period:{note}\n\n"
        f"{joined}\n\n"
        "Write a concise summary (3-5 sentences) of the main recurring "
        "problems, followed by a short bullet list of the top 3 concrete "
        "improvements SLTMobitel should prioritize."
    )

    return _call_gemini(prompt)
