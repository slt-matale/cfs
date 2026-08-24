from transformers import pipeline


# Load AI sentiment model
sentiment_model = pipeline(
    "sentiment-analysis"
)


def analyze_comment(comment):

    if not comment:
        return "Neutral"

    result = sentiment_model(comment)[0]

    if result["label"] == "POSITIVE":
        return "Positive"

    return "Negative"


# Compatibility function for app.py
def analysis(comment):

    return analyze_comment(comment)