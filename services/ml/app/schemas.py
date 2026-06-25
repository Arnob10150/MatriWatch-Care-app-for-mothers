from typing import Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["Low", "Mid", "High"]


class CheckInRequest(BaseModel):
    age: int | None = None
    gestationalAgeWeeks: int | None = None
    bpSystolic: float = Field(..., ge=0)
    bpDiastolic: float = Field(..., ge=0)
    bloodSugar: float = Field(..., ge=0)
    bodyTemp: float = Field(..., ge=0)
    heartRate: float = Field(..., ge=0)
    symptoms: list[str] = Field(default_factory=list)
    notes: str | None = None


class ScoreResponse(BaseModel):
    level: RiskLevel
    score: int
    reasons: list[str]
    model: str


class EpdsRequest(BaseModel):
    responses: list[int] = Field(..., min_length=10, max_length=10)
    age: int | None = None
    deliveryHistory: str | None = None


class EpdsResponse(BaseModel):
    totalScore: int
    flagged: bool
    severity: Literal["Minimal", "Possible", "Probable", "Urgent"]
    model: str


class SymptomRequest(BaseModel):
    symptoms: list[str]
    pregnant: bool = True
    postpartumWeeks: int | None = None


class SymptomResponse(BaseModel):
    level: RiskLevel
    score: int
    reasons: list[str]
    condition: str | None = None
    severity: str | None = None
    model: str | None = None


class HealthResponse(BaseModel):
    ok: bool
    models: list[str]


class GdmRequest(BaseModel):
    age: float
    pregnancyNo: float | None = None
    weight: float | None = None
    height: float | None = None
    bmi: float | None = None
    heredity: int | None = None
    ogtt: float | None = None
    systolicBp: float | None = None
    diastolicBp: float | None = None
    insulin: float | None = None


class BinaryRiskResponse(BaseModel):
    positive: bool
    probability: float
    level: RiskLevel
    reasons: list[str]
    model: str


class FetalHealthRequest(BaseModel):
    baselineValue: float
    accelerations: float = 0
    fetalMovement: float = 0
    uterineContractions: float = 0
    lightDecelerations: float = 0
    severeDecelerations: float = 0
    prolongedDecelerations: float = 0
    abnormalShortTermVariability: float = 0
    meanShortTermVariability: float = 0
    abnormalLongTermVariabilityPercent: float = 0
    meanLongTermVariability: float = 0


class FetalHealthResponse(BaseModel):
    classification: str
    probability: float
    level: RiskLevel
    reasons: list[str]
    model: str
