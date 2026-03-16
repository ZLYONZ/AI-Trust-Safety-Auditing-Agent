from pydantic import BaseModel
from typing import List


class GovernanceFinding(BaseModel):

    criterion_id: str

    description: str

    score: float

    evidence: str

    severity: str

    weight: float


class GovernanceResult(BaseModel):

    module_id: str

    module_score: float

    pass_threshold: float

    risk_level: str

    findings: List[GovernanceFinding]
