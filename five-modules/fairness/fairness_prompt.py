def build_prompt(document_text, criteria):

    criteria_section = ""

    for c in criteria:

        criteria_section += f"""
Criterion ID: {c["criterion_id"]}
Description: {c["description"]}

Check Methods:
{c["check_methods"]}

Pass Criteria:
{c["pass_criteria"]}

Evidence Requirements:
{c["evidence_requirements"]}

Scoring Methodology:
{c["scoring_methodology"]}

Weight: {c["scoring_methodology"]["weight"]}
"""

    prompt = f"""
You are an AI fairness and bias audit expert.

Your task is to evaluate the organization's AI system for fairness, bias, and compliance with regulations such as GDPR and CCPA.

==============================
EVALUATION CRITERIA
==============================

{criteria_section}

==============================
DOCUMENT TO ANALYZE
==============================

{document_text}

==============================
SCORING RULES
==============================

SCORING SCALE

Each criterion must be scored using one of the following values:

1.0
0.75
0.5
0.0

The meaning of each score is defined in the scoring_methodology of the criterion.

==============================
EVIDENCE RULES
==============================

Evidence must:

• include an exact quote from the document in the "excerpt" field  
• directly support the assigned score  
• reference the document section when possible  
• if no supporting evidence exists, set excerpt to "No evidence found in document"  
• Only provide ONE evidence object per criterion  

==============================
OUTPUT FORMAT
==============================

Return ONLY valid JSON.

Structure:

{{
  "findings":[
    {{
      "criterion_id":"F2.1",
      "description":"Fairness Metrics & Special Category Data",
      "score":1.0,
      "evidence":"For each finding, include an evidence object containing evidence_id(e.g. F2.1), evidence_type(e.g. policy_text), excerpt (an exact quote from the document), and source_section (the section title or paragraph where the evidence appears)."
    }}
  ]
}}

Requirements:

• Evaluate ALL criteria  
• Return exactly one finding per criterion  
• Do NOT include explanations outside JSON  
"""

    return prompt
