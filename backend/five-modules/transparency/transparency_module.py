from openai import OpenAI
from llm_utils import call_llm_json

from transparency_rules import TRANSPARENCY_CRITERIA
from transparency_prompt import build_prompt
from transparency_schema import TransparencyFinding, TransparencyResult, Evidence
from transparency_scoring import calculate_module_score, determine_severity, determine_risk_level

client = OpenAI()
MODEL = "gpt-3.5-turbo"


class TransparencyModule:

    def run(self, document_text):
        prompt = build_prompt(document_text, TRANSPARENCY_CRITERIA)

        data = call_llm_json(
            client, MODEL,
            system_prompt="You are an AI explainability and transparency auditor. Return ONLY JSON.",
            user_prompt=prompt,
        )

        findings = []
        for item in data["findings"]:
            finding = TransparencyFinding(
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
                    c["scoring_methodology"]["weight"] for c in TRANSPARENCY_CRITERIA
                    if c["criterion_id"] == item["criterion_id"]
                ),
            )
            findings.append(finding)

        module_score = calculate_module_score(findings)
        return TransparencyResult(
            module_id="M4_EXPLAINABILITY",
            module_score=module_score,
            pass_threshold=0.75,
            risk_level=determine_risk_level(module_score),
            findings=findings,
        )