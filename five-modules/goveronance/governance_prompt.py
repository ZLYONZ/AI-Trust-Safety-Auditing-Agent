def build_prompt(document_text):

    prompt = f"""
You are an AI governance auditor.

Evaluate the organization's AI governance structure based on:

- ISO 42001
- GDPR
- NIST AI RMF

Document:
{document_text}


For each governance criterion determine:

criterion
status (full / partial / missing)
evidence (quote the exact sentence from the document)
risk_level (low / medium / high)


IMPORTANT:

1. The evidence MUST be an exact quote from the document.
2. Do not summarize the evidence.
3. If no evidence exists, write "No evidence found in document".
4. Return ONLY JSON.

Format:

{{
 "findings":[
  {{
   "criterion":"...",
   "status":"compliant | partial | non-compliant",
   "evidence":"exact quote from document",
   "risk_level":"low | medium | high"
  }}
 ]
}}

"""

    return prompt
