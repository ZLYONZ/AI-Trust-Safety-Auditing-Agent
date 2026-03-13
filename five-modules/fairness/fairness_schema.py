from pydantic import BaseModel
from typing import List


class Finding(BaseModel):
    criterion: str
    status: str
    evidence: str
    risk_level: str


class FairnessResult(BaseModel):
    module: str
    score: int
    risk_level: str
    findings: List[Finding]
