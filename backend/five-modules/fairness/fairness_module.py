from openai import OpenAI
from llm_utils import call_llm_json

from fairness_rules import FAIRNESS_CRULES
from fairness_prompt import build_prompt
from fairness_schema import FairnessFinding, FairnessResult, Evidence
from fairness_scoring import calculate_module_score, determine_severity, determine_risk_level

client = OpenAI()
MODEL = "gpt-5.4-mini"


class FairnessModule:

    def run(self, document_text):
        prompt = build_prompt(document_text, FAIRNESS_CRULES)

        data = call_llm_json(
            client, MODEL,
            system_prompt="You are an AI fairness and bias auditor. Return ONLY JSON.",
            user_prompt=prompt,
        )

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
                    source_section=item["evidence"]["source_section"],
                ),
                severity=determine_severity(float(item["score"])),
                weight=next(
                    c["scoring_methodology"]["weight"] for c in FAIRNESS_CRULES
                    if c["criterion_id"] == item["criterion_id"]
                ),
            )
            findings.append(finding)

        module_score = calculate_module_score(findings)
        return FairnessResult(
            module_id="M2_FAIRNESS",
            module_score=module_score,
            pass_threshold=0.75,
            risk_level=determine_risk_level(module_score),
            findings=findings,
        )