from openai import OpenAI
import json

from governance_schema import GovernanceResult, Finding
from governance_prompt import build_prompt
from governance_rules import GOVERNANCE_CRITERIA

client = OpenAI()

class GovernanceModule:

    def run(self, document_text):

        prompt = build_prompt(document_text, GOVERNANCE_CRITERIA)

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": """
You are an AI governance auditor.

Evaluate the document against the governance criteria.

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

        print(data)

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

        result = GovernanceResult(
            module="governance",
            score=score,
            risk_level=risk,
            findings=findings
        )

        return result
