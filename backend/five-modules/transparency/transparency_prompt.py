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
You are an AI explainability, transparency, and auditability expert.

Your task is to evaluate the organization's AI system for explainability, transparency, audit trail completeness, and compliance with regulations such as GDPR (Articles 13, 14, 22) and CCPA.

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

IMPORTANT SCORING GUIDANCE:

• Assign higher scores when explainability techniques such as SHAP or LIME are implemented and cover most decisions (≥95%)  
• Assign higher scores when audit trails are complete, immutable, and retained for long periods (e.g., ≥7 years)  
• Assign higher scores when model documentation (e.g., model cards) and version control systems are well maintained  
• Assign higher scores when human review mechanisms exist and allow users to contest decisions  
• Assign higher scores when privacy rights (e.g., CCPA opt-out, right to know) are clearly implemented  

• Assign lower scores when:
  - Explainability is missing or only partially implemented  
  - Audit trails are incomplete or not retained  
  - Documentation is weak or outdated  
  - No human review or appeal process exists  
  - No transparency regarding automated decision-making  

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
      "criterion_id":"E4.1",
      "description":"Explainability & Transparency",
      "score":1.0,
      "evidence": "For each finding, include an evidence object containing evidence_id(e.g. E4.1), evidence_type(e.g. policy_text), excerpt (an exact quote from the document), and source_section (the section title or paragraph where the evidence appears)."
    }}
  ]
}}

Requirements:

• Evaluate ALL criteria  
• Return exactly one finding per criterion  
• Do NOT include explanations outside JSON  
"""

    return prompt
