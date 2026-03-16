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

Score each criterion using the following numeric scale:

1.0 → Fully compliant (all requirements satisfied)

0.75 → Minor gaps (requirements mostly satisfied)

0.5 → Significant gaps (major elements missing)

0.0 → Missing or incomplete


========================
EVIDENCE RULES
========================

Evidence must:

• be an exact quote from the document  
• directly support the score  
• if no evidence exists, return "No evidence found in document"


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
   "evidence":"exact quote from document"
  }}
 ]
}}

Requirements:

• Evaluate ALL criteria
• Return exactly one finding per criterion
• Do NOT include explanations outside JSON
"""

    return prompt
