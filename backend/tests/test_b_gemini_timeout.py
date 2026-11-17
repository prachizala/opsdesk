import time
import pytest
from backend.services.intent_classifier import suggest_ticket_intent


def test_gemini_sdk_http_options_timeout_and_fallback(monkeypatch):
    """
    Lane B3: Verifies that Gemini intent classification passes timeout directly into
    the SDK client http_options, and falls back safely to regex or Unclassified on timeout
    without making real API calls or requiring secrets.
    """
    monkeypatch.setenv("GEMINI_API_KEY", "mock-test-key")
    monkeypatch.setenv("GEMINI_TIMEOUT_SECONDS", "0.1")

    client_init_kwargs = {}

    class MockHangingClient:
        def __init__(self, *args, **kwargs):
            client_init_kwargs.update(kwargs)
            self.models = self

        def generate_content(self, *args, **kwargs):
            time.sleep(1.0)
            return None

    import sys
    class MockGenaiModule:
        Client = MockHangingClient
        types = type("Types", (), {
            "GenerateContentConfig": lambda **kwargs: None,
            "HttpOptions": lambda **kwargs: kwargs
        })

    monkeypatch.setitem(sys.modules, "google.genai", MockGenaiModule)

    # 1. Text with no regex match: forces Gemini branch, times out, yields fallback_unclassified
    t0 = time.perf_counter()
    intent, source = suggest_ticket_intent("Inquiry regarding trip details", "Can someone please check status?")
    elapsed = time.perf_counter() - t0

    print(f"\n[RAW B3 RESULT] Fallback intent={intent}, source={source}, elapsed={elapsed:.3f}s")
    assert intent == "Unclassified"
    assert source == "fallback_unclassified"
    assert elapsed < 0.8, f"Timeout took too long: {elapsed:.2f}s"

    # Verify timeout was passed directly into SDK client http_options (in ms)
    assert "http_options" in client_init_kwargs
    assert client_init_kwargs["http_options"]["timeout"] == 100  # 0.1s * 1000 = 100ms

    # 2. Text with regex match: resolves via regex without touching Gemini
    intent_regex, source_regex = suggest_ticket_intent("Urgent Refund Request", "Please refund my booking")
    assert intent_regex == "Refund Request"
    assert source_regex == "regex_rule"
