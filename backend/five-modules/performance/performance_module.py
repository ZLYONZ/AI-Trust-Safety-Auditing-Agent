from openai import OpenAI
from llm_utils import call_llm_json

from performance_rules import PERFORMANCE_CRITERIA
from performance_prompt import build_prompt
from performance_schema import PerformanceFinding, PerformanceResult, Evidence
from performance_scoring import calculate_module_score, determine_severity, determine_risk_level

client = OpenAI()
MODEL = "gpt-5.4-mini"


class PerformanceModule:

    def run(self, document_text):
        prompt = build_prompt(document_text, PERFORMANCE_CRITERIA)

        data = call_llm_json(
            client, MODEL,
            system_prompt="You are an AI model performance and monitoring auditor. Return ONLY JSON.",
            user_prompt=prompt,
        )

        findings = []
        for item in data["findings"]:
            finding = PerformanceFinding(
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
                    c["scoring_methodology"]["weight"] for c in PERFORMANCE_CRITERIA
                    if c["criterion_id"] == item["criterion_id"]
                ),
            )
            findings.append(finding)

        module_score = calculate_module_score(findings)
        return PerformanceResult(
            module_id="M5_ACCURACY",
            module_score=module_score,
            pass_threshold=0.75,
            risk_level=determine_risk_level(module_score),
            findings=findings,
        )