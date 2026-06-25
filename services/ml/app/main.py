from __future__ import annotations

from fastapi import FastAPI

from .model_registry import registry
from .predictors import (
    score_checkin as score_checkin_with_models,
    score_fetal_health,
    score_gdm,
    triage_symptoms as triage_symptoms_with_models,
)
from .rules import score_epds_rules
from .schemas import (
    BinaryRiskResponse,
    CheckInRequest,
    EpdsRequest,
    EpdsResponse,
    FetalHealthRequest,
    FetalHealthResponse,
    GdmRequest,
    HealthResponse,
    ScoreResponse,
    SymptomRequest,
    SymptomResponse,
)

app = FastAPI(
    title="MatriWatch ML Service",
    version="0.1.0",
    description="Risk scoring API for maternal vitals, EPDS screening, and symptom triage.",
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(ok=True, models=registry.discover())


@app.get("/models")
def models() -> dict[str, list[str]]:
    return {"available": registry.discover()}


@app.post("/score/checkin", response_model=ScoreResponse)
def score_checkin(payload: CheckInRequest) -> ScoreResponse:
    return score_checkin_with_models(payload)


@app.post("/score/epds", response_model=EpdsResponse)
def score_epds(payload: EpdsRequest) -> EpdsResponse:
    total, flagged, severity = score_epds_rules(payload.responses)
    return EpdsResponse(
        totalScore=total,
        flagged=flagged,
        severity=severity,
        model="epds-threshold-v1",
    )


@app.post("/triage/symptoms", response_model=SymptomResponse)
def triage_symptoms(payload: SymptomRequest) -> SymptomResponse:
    return triage_symptoms_with_models(payload)


@app.post("/score/gdm", response_model=BinaryRiskResponse)
def score_gdm_endpoint(payload: GdmRequest) -> BinaryRiskResponse:
    return score_gdm(payload)


@app.post("/score/fetal-health", response_model=FetalHealthResponse)
def score_fetal_health_endpoint(payload: FetalHealthRequest) -> FetalHealthResponse:
    return score_fetal_health(payload)
