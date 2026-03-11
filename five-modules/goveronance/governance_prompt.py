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
status (compliant / partial / non-compliant)
evidence
risk_level (low / medium / high)

Return structured findings.
"""

    return prompt
