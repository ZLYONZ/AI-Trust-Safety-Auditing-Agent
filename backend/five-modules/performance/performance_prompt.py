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
You are an AI model performance, accuracy, and monitoring audit expert.

Your task is to evaluate the organization's AI system for model performance, data accuracy, drift monitoring, retraining governance, and compliance with regulatory standards such as:

• NIST (Valid & Reliable AI)
• COSO Monitoring Principles
• GDPR Article 5(1)(d) (Accuracy Principle)
• GDPR Article 16 (Right to Rectification)
• CCPA §1798.106 (Right to Correct)

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
  - Model validation is comprehensive (e.g., confusion matrix, ROC/PR, ≥20% holdout)
  - Accuracy is high (≥95%) and validated with ground truth
  - Personal data inference accuracy is explicitly validated
  - Drift monitoring is continuous (daily) with defined thresholds (5%, 10%, 15%)
  - Automated drift response mechanisms (e.g., retraining triggers) exist
  - Performance dashboards are regularly updated and include materiality analysis
  - Data subject correction processes meet GDPR (30 days) and CCPA (45 days) timelines
  - Correction request patterns are analyzed for systemic issues
  - Retraining is triggered based on detected error patterns

• Assign lower scores when:
  - Model validation is incomplete or missing key metrics
  - Accuracy is not validated or below acceptable thresholds
  - Personal data inference accuracy is not assessed
  - Drift monitoring is ad-hoc or absent
  - No clear thresholds or alerts for performance degradation
  - No retraining governance or response to drift
  - Dashboards are missing, outdated, or lack key metrics
  - No correction process or timelines not met
  - No linkage between correction requests and model improvement

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
      "criterion_id":"A5.1",
      "description":"Model Validation & Accuracy",
      "score":1.0,
      "evidence": "For each finding, include an evidence object containing evidence_id(e.g. A5.1), evidence_type(e.g. policy_text), excerpt (an exact quote from the document), and source_section (the section title or paragraph where the evidence appears)."
    }}
  ]
}}

Requirements:

• Evaluate ALL criteria  
• Return exactly one finding per criterion  
• Do NOT include explanations outside JSON  
"""

    return prompt
