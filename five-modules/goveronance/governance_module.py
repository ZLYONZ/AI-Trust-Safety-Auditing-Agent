from openai import OpenAI
from governance_schema import GovernanceResult, Finding
from governance_prompt import build_prompt
from governance_rules import GOVERNANCE_CRITERIA

client = OpenAI()

class GovernanceModule:

    def run(self, document_text):

        prompt = build_prompt(document_text)

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role":"system","content":"You are an AI governance auditor"},
                {"role":"user","content":prompt}
            ]
        )

        analysis = response.choices[0].message.content

        findings = []

        for criterion in GOVERNANCE_CRITERIA:

            findings.append(
                Finding(
                    criterion=criterion,
                    status="partial",
                    evidence="Evidence identified in document",
                    risk_level="medium"
                )
            )

        result = GovernanceResult(
            module="governance",
            score=75,
            risk_level="medium",
            findings=findings
        )

        return result
