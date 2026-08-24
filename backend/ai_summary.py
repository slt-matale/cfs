def generate_ai_summary(feedback):
    if not feedback:
        return {
            "summary": "No customer feedback available.",
            "total_feedback": 0,
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }

    positive = 0
    neutral = 0
    negative = 0

    for item in feedback:
        sentiment = item.get("sentiment")

        if sentiment == "Positive":
            positive += 1
        elif sentiment == "Negative":
            negative += 1
        else:
            neutral += 1

    total = len(feedback)

    if positive > negative:
        overall = "Overall customer feedback is positive."
    elif negative > positive:
        overall = "Overall customer feedback is negative."
    else:
        overall = "Overall customer feedback is mixed."

    return {
        "summary": overall,
        "total_feedback": total,
        "positive": positive,
        "neutral": neutral,
        "negative": negative
    }