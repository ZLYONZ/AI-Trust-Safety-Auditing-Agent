from five-modules.governance.governance_module import GovernanceModule
from five-modules.governance.document_loader import load_document

doc = load_document("sample_ai_policy.pdf")

module = GovernanceModule()

result = module.run(doc)

print(result.model_dump())
