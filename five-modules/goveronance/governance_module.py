from openai import OpenAI
import json

from governance_rules import GOVERNANCE_CRITERIA
from governance_prompt import build_prompt
from governance_schema import GovernanceFinding, GovernanceResult, Evidence
from governance_scoring import (
    calculate_module_score,
    determine_severity,
    determine_risk_level
)

client = OpenAI()


class GovernanceModule:

    def run(self, document_text):

        # -----------------------------
        # 1 Build Prompt
        # -----------------------------
        prompt = build_prompt(document_text, GOVERNANCE_CRITERIA)

        # -----------------------------
        # 2 Call LLM
        # -----------------------------
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI governance and compliance auditor. Return ONLY JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        llm_output = response.choices[0].message.content

        print("LLM RAW OUTPUT:")
        print(llm_output)

        # -----------------------------
        # 3 Parse JSON
        # -----------------------------
        data = json.loads(llm_output)

        findings = []

        for item in data["findings"]:

            finding = GovernanceFinding(
                criterion_id=item["criterion_id"],
                description=item["description"],
                score=float(item["score"]),
                evidence=Evidence(
                    evidence_id=item["evidence"]["evidence_id"],
                    evidence_type=item["evidence"]["evidence_type"],
                    excerpt=item["evidence"]["excerpt"],
                    source_section=item["evidence"]["source_section"]
                ),
                severity=determine_severity(float(item["score"])),
                weight=next(
                    c["scoring_methodology"]["weight"] for c in GOVERNANCE_CRITERIA
                    if c["criterion_id"] == item["criterion_id"]
                )
            )

            findings.append(finding)

        # -----------------------------
        # 4 Calculate Module Score
        # -----------------------------
        module_score = calculate_module_score(findings)

        severity = determine_severity(module_score)

        risk_level = determine_risk_level(module_score)

        # -----------------------------
        # 5 Build Result
        # -----------------------------
        result = GovernanceResult(
            module_id="M1 GOVERNANCE",
            module_score=module_score,
            pass_threshold=0.75,
            risk_level=risk_level,
            findings=findings
        )

        return result
