"""
llm_utils.py
------------
Shared helpers for all five audit modules.

Handles:
- Stripping markdown fences (```json ... ```) that gpt-3.5-turbo adds
- Retrying up to MAX_RETRIES times when the model returns empty / non-JSON
- Raising a clear RuntimeError with the raw output on final failure
"""

import json
import re
import time

MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds between retries


def call_llm_json(client, model: str, system_prompt: str, user_prompt: str) -> dict:
    """
    Call the OpenAI chat API and return parsed JSON.
    Retries up to MAX_RETRIES times on empty or malformed responses.
    """
    last_error: Exception | None = None
    raw: str = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                # Ask for JSON explicitly when supported
                # (gpt-3.5-turbo-1106+ supports response_format)
                **({"response_format": {"type": "json_object"}}
                   if _supports_json_mode(model) else {}),
            )

            raw = (response.choices[0].message.content or "").strip()
            print(f"LLM RAW OUTPUT (attempt {attempt}):")
            print(raw)

            if not raw:
                raise ValueError("LLM returned an empty response.")

            return _parse_json(raw)

        except (ValueError, json.JSONDecodeError) as exc:
            last_error = exc
            print(f"[llm_utils] JSON parse failed on attempt {attempt}: {exc}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY)

        except Exception as exc:
            # Network / rate-limit / auth errors — re-raise immediately
            raise

    raise RuntimeError(
        f"LLM returned invalid JSON after {MAX_RETRIES} attempts.\n"
        f"Last raw output:\n{raw}\n"
        f"Last error: {last_error}"
    )


def _parse_json(raw: str) -> dict:
    """Strip markdown fences and parse JSON."""
    # Remove ```json ... ``` or ``` ... ``` wrappers
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```\s*$", "", cleaned, flags=re.MULTILINE)
    cleaned = cleaned.strip()

    if not cleaned:
        raise ValueError("JSON content is empty after stripping markdown fences.")

    return json.loads(cleaned)


def _supports_json_mode(model: str) -> bool:
    """
    Models that support response_format=json_object.
    gpt-3.5-turbo-0125 and later do; plain gpt-3.5-turbo may not.
    """
    json_mode_models = {
        "gpt-4o", "gpt-4o-mini",
        "gpt-4-turbo", "gpt-4-turbo-preview",
        "gpt-3.5-turbo-0125", "gpt-3.5-turbo-1106",
        "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano",
        "gpt-5.4", "gpt-5.4-mini",
    }
    return model in json_mode_models