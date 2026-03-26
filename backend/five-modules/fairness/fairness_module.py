from openai import OpenAI
import json

from fairness_rules import FAIRNESS_CRULES
from fairness_prompt import build_prompt
from fairness_schema import FairnessFinding, FairnessResult, Evidence
from fairness_scoring import (
    calculate_module_score,
    determine_severity,
    determine_risk_level
)

client = OpenAI()


class FairnessModule:

    def run(self, document_text):

        # -----------------------------
        # 1 Build Prompt
        # -----------------------------
        prompt = build_prompt(document_text, FAIRNESS_CRULES)

        # -----------------------------
        # 2 Call LLM
        # -----------------------------
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI fairness and bias auditor. Return ONLY JSON."
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

            finding = FairnessFinding(
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
                    c["scoring_methodology"]["weight"] for c in FAIRNESS_CRULES
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
        result = FairnessResult(
            module_id="M2 FAIRNESS",
            module_score=module_score,
            pass_threshold=0.75,
            risk_level=risk_level,
            findings=findings
        )

        return result
