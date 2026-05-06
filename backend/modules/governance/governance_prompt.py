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
You are an AI governance, risk management, and regulatory compliance auditor.

Your task is to evaluate the organization's AI governance framework, risk management practices, and compliance with global standards such as ISO 42001, NIST AI RMF, SOX 404, and GDPR (Articles 24, 30, 35).

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

• Assign higher scores when:
  - AI governance policies are board-approved, comprehensive, and aligned with ISO 42001  
  - Risk management systems identify ≥5 risks, include mitigation controls, and are monitored quarterly (NIST AI RMF aligned)  
  - SOX 404 controls are well documented, mapped to COSO, and regularly tested  
  - AI system inventory is complete and updated regularly  
  - Training programs cover ≥80% personnel with strong assessment performance  
  - ROPA (GDPR Article 30) includes all required fields and is recently updated  
  - DPIA governance includes DPO consultation, committee oversight, and remediation tracking  

• Assign lower scores when:
  - Governance policies are missing or not approved  
  - Risk management is incomplete or not monitored  
  - Controls are undocumented or not tested  
  - AI systems are not fully inventoried  
  - Training coverage is low or ineffective  
  - ROPA documentation is incomplete or outdated  
  - DPIA governance processes are missing or weak  

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
      "criterion_id":"G1.1",
      "description":"AI Governance Policy",
      "score":1.0,
      "evidence": "For each finding, include an evidence object containing evidence_id(e.g. G1.1), evidence_type(e.g. policy_text), excerpt (an exact quote from the document), and source_section (the section title or paragraph where the evidence appears)."
    }}
  ]
}}

Requirements:

• Evaluate ALL criteria  
• Return exactly one finding per criterion  
• Do NOT include explanations outside JSON  
"""

    return prompt
