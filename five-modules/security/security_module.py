from openai import OpenAI
import json

from security_schema import SecurityResult, Finding
from security_prompt import build_prompt
from security_rules import SECURITY_CRITERIA

client = OpenAI()


class SecurityModule:

    def run(self, document_text):

        prompt = build_prompt(document_text, SECURITY_CRITERIA)

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": """
You are an AI security and adversarial robustness auditor.

Evaluate the document against the security criteria.

Return ONLY JSON in this format:

{
 "findings":[
  {
   "criterion":"...",
   "status":"compliant | partial | non-compliant",
   "evidence":"exact quote from document",
   "risk_level":"low | medium | high"
  }
 ]
}
"""
                },
                {"role": "user", "content": prompt}
            ]
        )

        analysis = response.choices[0].message.content

        print("LLM RAW OUTPUT:")
        print(analysis)

        data = json.loads(analysis)

        findings = []

        for item in data["findings"]:
            findings.append(
                Finding(
                    criterion=item["criterion"],
                    status=item["status"],
                    evidence=item["evidence"],
                    risk_level=item["risk_level"]
                )
            )

        # -------- calculate score --------

        score_map = {
            "compliant": 100,
            "partial": 50,
            "non-compliant": 0
        }

        scores = [score_map[f.status] for f in findings]
        score = int(sum(scores) / len(scores))

        # -------- calculate overall risk --------

        if score >= 80:
            risk = "low"
        elif score >= 50:
            risk = "medium"
        else:
            risk = "high"

        result = SecurityResult(
            module="security_adversarial",
            score=score,
            risk_level=risk,
            findings=findings
        )

        return result
