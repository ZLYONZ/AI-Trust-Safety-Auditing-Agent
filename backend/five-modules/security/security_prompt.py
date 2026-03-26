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
You are an AI security, privacy, and adversarial robustness audit expert.

Your task is to evaluate the organization's AI system for:
- Data protection and encryption
- Adversarial robustness and security testing
- Access control and authorization
- Privacy compliance (GDPR / CCPA)
- Breach detection and incident response
- Data minimization and retention

When evaluating criteria that involve multiple components (e.g., DPIA, ROPA, breach response, retention controls):
- Consider ALL sub-components holistically
- Assign ONE final score per criterion based on overall completeness

===============================
EVALUATION CRITERIA
===============================

{criteria_section}

===============================
DOCUMENT TO ANALYZE
===============================

{document_text}

===============================
SCORING RULES
===============================

SCORING SCALE

Each criterion must be scored using one of the following values:

1.0  
0.75  
0.5  
0.0  

The meaning of each score is defined in the scoring_methodology of the criterion.

===============================
EVIDENCE RULES
===============================

Evidence must:

• include an exact quote from the document in the "excerpt" field  
• directly support the assigned score  
• reference the document section when possible  
• if no supporting evidence exists, set excerpt to "No evidence found in document"  
• Only provide ONE evidence object per criterion  

===============================
OUTPUT FORMAT
===============================

Return ONLY valid JSON.

Structure:

{{
  "findings": [
    {{
      "criterion_id": "S3.1",
      "description": "Data Protection & Encryption",
      "score": 1.0,
      "evidence": "For each finding, include an evidence object containing evidence_id(e.g. S3.1), evidence_type(e.g. policy_text), excerpt (an exact quote from the document), and source_section (the section title or paragraph where the evidence appears)."
    }}
  ]
}}

Requirements:

• Evaluate ALL criteria  
• Return exactly one finding per criterion  
• Use ONLY the specified scoring values  
• Ensure evidence is an OBJECT (not a string)  
• Do NOT include any explanation outside JSON  

"""

    return prompt
