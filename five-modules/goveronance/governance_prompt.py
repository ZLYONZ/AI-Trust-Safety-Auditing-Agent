def build_prompt(document_text, criteria):

    criteria_text = "\n".join([f"{i+1}. {c}" for i, c in enumerate(criteria)])

    prompt = f"""
You are an AI governance auditor.

Evaluate the organization’s AI governance structure based on the following governance criteria:

{criteria_text}

Document:
{document_text}


For EACH governance criterion determine:

criterion
status (compliant / partial / non-compliant)
evidence (quote the exact sentence from the document)
risk_level (low / medium / high)


IMPORTANT:

1. Evaluate EACH criterion separately.
2. The evidence MUST be an exact quote from the document.
3. Do not summarize the evidence.
4. If no evidence exists, write "No evidence found in document".
5. Return EXACTLY one finding per criterion.
6. Return ONLY JSON.


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
