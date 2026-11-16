import os
import re
import json
from typing import Tuple

INTENT_TAXONOMY = [
    "Refund Request",
    "Cancellation Inconvenience",
    "Date Amendment",
    "Bedding / Room Preference",
    "Voucher Resend",
    "Emergency Check-in Assist",
    "Unclassified"
]

# Explicit Regex Precedence Rules:
# The order in this list determines precedence when a text matches multiple patterns.
#
# DESIGN RATIONALE FOR ORDER:
# 1. "Refund Request" is evaluated FIRST:
#    In travel operations, messages like "refund for my cancelled flight" contain both 'refund' and 'cancel'.
#    The primary operational requirement is the financial reimbursement; cancellation is merely the cause.
#    Therefore, financial resolution takes precedence over administrative cancellation.
# 2. "Cancellation Inconvenience" is SECOND:
#    If no explicit refund is requested, voiding/cancelling the reservation is the next most urgent inventory action.
# 3. "Date Amendment" is THIRD:
#    Modification of travel dates precedes on-property preferences.
# 4. "Bedding / Room Preference" is FOURTH:
#    Specific room configuration requests at the property.
# 5. "Voucher Resend" is FIFTH:
#    Document re-issuance requests.
REGEX_PRECEDENCE = [
    (
        "Refund Request",
        re.compile(r"\b(refund\w*|reimburse\w*|money\s*back|payout\w*)\b", re.IGNORECASE)
    ),
    (
        "Cancellation Inconvenience",
        re.compile(r"\b(cancel\w*|void\w*)\b", re.IGNORECASE)
    ),
    (
        "Date Amendment",
        re.compile(r"\b(reschedul\w*|amend\w*|postpone\w*|date\s*change\w*)\b", re.IGNORECASE)
    ),
    (
        "Bedding / Room Preference",
        re.compile(r"\b(bed\w*|twin|king|smoking|room\s*type\w*|high\s*floor)\b", re.IGNORECASE)
    ),
    (
        "Voucher Resend",
        re.compile(r"\b(voucher\w*|ticket\s*copy|itinerary\s*pdf)\b", re.IGNORECASE)
    )
]

def suggest_ticket_intent(subject: str, body: str) -> Tuple[str, str]:
    """
    Suggests an intent classification for a ticket.
    This is an auto-suggestion for the agent UI; the agent retains authority to override.
    
    Returns:
      (suggested_intent, classification_source)
      where classification_source is 'regex_rule', 'gemini_model', or 'fallback_unclassified'.
    """
    text = f"{subject} {body}"

    # Step 1: Deterministic regex evaluation in strict precedence order
    for intent_name, pattern in REGEX_PRECEDENCE:
        if pattern.search(text):
            return intent_name, "regex_rule"

    # Step 2: Fallback to Gemini structured call via google-genai SDK with strict timeout
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    timeout_sec = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "3.0"))

    if not api_key:
        return "Unclassified", "fallback_unclassified"

    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError

    def _call_gemini():
        from google import genai
        from google.genai import types

        # Pass timeout directly into SDK client HTTP options (in milliseconds)
        timeout_ms = int(timeout_sec * 1000)
        http_opts = None
        if hasattr(types, "HttpOptions"):
            try:
                http_opts = types.HttpOptions(timeout=timeout_ms)
            except Exception:
                http_opts = {"timeout": timeout_ms}
        else:
            http_opts = {"timeout": timeout_ms}

        try:
            client = genai.Client(api_key=api_key, http_options=http_opts)
        except Exception:
            client = genai.Client(api_key=api_key)

        prompt = f"""
        Analyze this B2B travel support message and suggest the single best matching category from this taxonomy:
        {INTENT_TAXONOMY[:-1]}
        
        Subject: {subject}
        Body: {body}
        
        Respond with valid JSON matching this schema:
        {{"suggested_intent": "CategoryName", "confidence": 0.0 to 1.0}}
        """

        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        return response.text

    executor = ThreadPoolExecutor(max_workers=1)
    try:
        future = executor.submit(_call_gemini)
        response_text = future.result(timeout=timeout_sec)

        data = json.loads(response_text)
        confidence = float(data.get("confidence", 0.0))
        suggested = data.get("suggested_intent", "")

        # Strict validation: confidence must be >= 0.70 and within approved taxonomy
        if confidence >= 0.70 and suggested in INTENT_TAXONOMY and suggested != "Unclassified":
            return suggested, "gemini_model"

        return "Unclassified", "fallback_unclassified"

    except Exception:
        # On any API error, timeout, network failure, or parsing error, return fallback
        return "Unclassified", "fallback_unclassified"
    finally:
        try:
            executor.shutdown(wait=False, cancel_futures=True)
        except Exception:
            pass
