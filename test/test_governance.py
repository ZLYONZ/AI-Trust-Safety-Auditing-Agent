from modules.governance.governance_module import GovernanceModule
from modules.governance.document_loader import load_document

doc = load_document("sample_ai_policy.pdf")

module = GovernanceModule()

result = module.run(doc)

print(result.json(indent=2))
