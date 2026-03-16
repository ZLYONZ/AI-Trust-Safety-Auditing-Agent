def build_prompt(document_text, criteria):

    criteria_section = ""

    for c in criteria:

        criteria_section += f"""
Criterion ID: {c["id"]}
Description: {c["description"]}

Check Method:
{c["check_method"]}

Pass Criteria:
{c["pass_criteria"]}

Evidence Requirements:
{c["evidence_requirements"]}

Scoring Methodology:
{c["scoring_method"]}

Weight: {c["weight"]}
"""

    prompt = f"""
You are an AI governance compliance auditor.

Your task is to evaluate the organization's AI governance practices based on the following evaluation criteria.

========================
EVALUATION CRITERIA
========================

{criteria_section}

========================
DOCUMENT TO ANALYZE
========================

{document_text}

========================
SCORING RULES
========================

SCORING SCALE

Each criterion must be scored using one of the following values:

1.0
0.75
0.5
0.0

The meaning of each score is defined in the scoring_method of the criterion.


========================
EVIDENCE RULES
========================


Evidence must:

• include an exact quote from the document in the "excerpt" field
• directly support the assigned score
• reference the document section when possible
• if no supporting evidence exists, set excerpt to "No evidence found in document"
• Only provide ONE evidence object per criterion.


========================
OUTPUT FORMAT
========================

Return ONLY valid JSON.

Structure:

{{
 "findings":[
  {{
   "criterion_id":"G1.1",
   "description":"AI Governance Policy",
   "score":1.0,
   "evidence":{
  "evidence_id": "G1.1-E1",
  "evidence_type": "policy_text",
  "excerpt": "exact quote from document",
  "source_section": "section title or paragraph"
}
  }}
 ]
}}

Requirements:

• Evaluate ALL criteria
• Return exactly one finding per criterion
• Do NOT include explanations outside JSON
"""

    return prompt
