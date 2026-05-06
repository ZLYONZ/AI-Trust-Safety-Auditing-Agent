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
You are a Certified Public Accountant (CPA) and internal controls specialist conducting
an audit of an Accounting Information System (AIS) against financial compliance standards
including GAAP, IFRS, SOX (Sarbanes-Oxley Act), COSO Internal Control Framework,
and PCAOB Auditing Standards.

Your task is to evaluate the organization's financial controls documentation across
six critical areas: Segregation of Duties, Journal Entry Controls, Bank Reconciliation,
Financial Reporting Accuracy, Fraud Detection, and Audit Trail Completeness.

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
1.0, 0.75, 0.5, 0.25, 0.0

IMPORTANT SCORING GUIDANCE:

• Assign score 1.0 when:
  - Controls are comprehensively documented and formally approved
  - Evidence of consistent enforcement and regular review exists
  - Full compliance with GAAP/IFRS/SOX/COSO requirements demonstrated

• Assign score 0.75 when:
  - Controls are well-documented with minor gaps
  - Regular reviews occur but not always on schedule
  - Mostly compliant with occasional exceptions

• Assign score 0.5 when:
  - Partial controls exist but significant gaps remain
  - Documentation is incomplete or controls are inconsistently applied
  - Basic compliance framework without full enforcement

• Assign score 0.25 when:
  - Minimal evidence of control awareness
  - Informal or undocumented practices that suggest some control consciousness
  - Source is informal (README, blog post) mentioning the topic in passing

• Assign score 0.0 when:
  - No evidence of the control exists in the document
  - The document is purely technical code with no policy or control documentation
  - The document is clearly not an accounting or financial controls document

==============================
EVIDENCE RULES
==============================

Evidence must:
• Include an exact quote from the document in the "excerpt" field
• Directly support the assigned score
• Reference the document section when possible
• If no supporting evidence exists, set excerpt to "No evidence found in document"
• Only provide ONE evidence object per criterion

==============================
OUTPUT FORMAT
==============================

Return ONLY valid JSON.

Structure:

{{
  "findings": [
    {{
      "criterion_id": "F6.1",
      "description": "Segregation of Duties Controls",
      "score": 1.0,
      "evidence": {{
        "evidence_id": "F6.1",
        "evidence_type": "policy_text",
        "excerpt": "exact quote from document",
        "source_section": "section title where evidence appears"
      }}
    }}
  ]
}}

Requirements:
• Evaluate ALL 6 criteria (F6.1 through F6.6)
• Return exactly one finding per criterion
• Do NOT include explanations outside JSON
"""

    return prompt