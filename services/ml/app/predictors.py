from __future__ import annotations

from typing import Any

import pandas as pd

from .model_registry import registry
from .rules import classify_score, score_checkin_rules, score_symptoms_rules
from .schemas import (
    BinaryRiskResponse,
    CheckInRequest,
    FetalHealthRequest,
    FetalHealthResponse,
    GdmRequest,
    ScoreResponse,
    SymptomRequest,
    SymptomResponse,
)


def _as_probability(model: Any, frame: pd.DataFrame) -> list[float] | None:
    if not hasattr(model, "predict_proba"):
        return None
    probabilities = model.predict_proba(frame)
    if len(probabilities) == 0:
        return None
    return [float(value) for value in probabilities[0]]


def _blood_sugar_mmol(value: float) -> float:
    return value / 18.0182 if value > 40 else value


def _body_temp_f(value: float) -> float:
    return (value * 9 / 5) + 32 if value <= 60 else value


def score_checkin(payload: CheckInRequest) -> ScoreResponse:
    rules = score_checkin_rules(payload)
    bundle = registry.load_first_joblib("maternal_risk_classifier.joblib", "maternal_risk_xgboost.joblib")
    if not bundle:
        return rules

    try:
        model = bundle["model"]
        frame = pd.DataFrame(
            [
                {
                    "age": payload.age,
                    "bp_systolic": payload.bpSystolic,
                    "bp_diastolic": payload.bpDiastolic,
                    "blood_sugar_mmol": _blood_sugar_mmol(payload.bloodSugar),
                    "body_temp_f": _body_temp_f(payload.bodyTemp),
                    "heart_rate": payload.heartRate,
                    "bmi": None,
                    "previous_complications": None,
                    "preexisting_diabetes": None,
                    "gestational_diabetes": None,
                    "mental_health": None,
                }
            ]
        )
        probabilities = _as_probability(model, frame)
        if not probabilities or len(probabilities) < 3:
            return rules

        expected_score = round((probabilities[1] * 50) + (probabilities[2] * 100))
        score = max(rules.score, int(expected_score))
        level = classify_score(score)
        reasons = [
            "Trained maternal risk model evaluated vitals against Dataset1 and Dataset3 patterns",
            f"Model probabilities Low/Mid/High: {probabilities[0]:.2f}/{probabilities[1]:.2f}/{probabilities[2]:.2f}",
        ]
        if rules.level != "Low":
            reasons.extend(rules.reasons)

        return ScoreResponse(
            level=level,
            score=max(0, min(100, score)),
            reasons=reasons,
            model="maternal-risk-hist-gradient-boosting-v2+rules",
        )
    except Exception:
        return rules


def triage_symptoms(payload: SymptomRequest) -> SymptomResponse:
    rules = score_symptoms_rules(payload)
    severity_bundle = registry.load_first_joblib("symptom_severity_tfidf_logreg.joblib")
    disease_bundle = registry.load_first_joblib("symptom_disease_tfidf_logreg.joblib")
    if not severity_bundle and not disease_bundle:
        return rules

    text = ", ".join(payload.symptoms)
    reasons = list(rules.reasons)
    severity: str | None = None
    condition: str | None = None
    score = rules.score

    try:
        if severity_bundle:
            severity = str(severity_bundle["model"].predict([text])[0])
            if severity.lower() == "severe":
                score = max(score, 80)
            elif severity.lower() == "moderate":
                score = max(score, 50)
            reasons.append(f"Symptom severity model predicted {severity}")
        if disease_bundle:
            condition = str(disease_bundle["model"].predict([text])[0])
            reasons.append(f"Text triage model matched likely condition: {condition}")
    except Exception:
        return rules

    return SymptomResponse(
        level=classify_score(score),
        score=max(0, min(100, score)),
        reasons=reasons,
        condition=condition,
        severity=severity,
        model="symptom-tfidf-logreg-v1+rules",
    )


def score_gdm(payload: GdmRequest) -> BinaryRiskResponse:
    bundle = registry.load_first_joblib("gdm_ensemble_gradient_boosting.joblib", "gdm_simple_gradient_boosting.joblib")
    if not bundle:
        probability = 0.0
        reasons: list[str] = []
        if payload.bmi is not None and payload.bmi >= 30:
            probability += 0.25
            reasons.append("BMI is in an elevated range")
        if payload.heredity:
            probability += 0.25
            reasons.append("Family history/heredity reported")
        if payload.ogtt is not None and payload.ogtt >= 140:
            probability += 0.35
            reasons.append("OGTT is elevated")
        probability = min(0.95, probability)
        return BinaryRiskResponse(
            positive=probability >= 0.5,
            probability=round(probability, 3),
            level=classify_score(round(probability * 100)),
            reasons=reasons or ["GDM fallback rules did not find a major risk signal"],
            model="gdm-rule-fallback-v1",
        )

    frame = pd.DataFrame(
        [
            {
                "age": payload.age,
                "pregnancy_no": payload.pregnancyNo,
                "bmi": payload.bmi,
                "family_history": payload.heredity,
                "systolic_bp": payload.systolicBp,
                "diastolic_bp": payload.diastolicBp,
                "ogtt": payload.ogtt,
                "source": "clinical" if payload.ogtt is not None or payload.systolicBp is not None else "simple",
            }
        ]
    )
    probabilities = _as_probability(bundle["model"], frame) or [1.0, 0.0]
    positive_probability = float(probabilities[-1])
    return BinaryRiskResponse(
        positive=positive_probability >= 0.5,
        probability=round(positive_probability, 3),
        level=classify_score(round(positive_probability * 100)),
        reasons=["GDM ensemble evaluated shared Dataset7 and Dataset8 risk features"],
        model="gdm-ensemble-gradient-boosting-v2",
    )


def score_fetal_health(payload: FetalHealthRequest) -> FetalHealthResponse:
    bundle = registry.load_first_joblib("fetal_health_random_forest.joblib")
    if not bundle:
        level = "High" if payload.baselineValue < 110 or payload.baselineValue > 160 else "Low"
        return FetalHealthResponse(
            classification="Needs review" if level == "High" else "Normal",
            probability=1.0 if level == "High" else 0.2,
            level=level,
            reasons=["Fallback fetal heart baseline rule used because the trained CTG model is not available"],
            model="fetal-rule-fallback-v1",
        )

    frame = pd.DataFrame(
        [
            {
                "baseline value": payload.baselineValue,
                "accelerations": payload.accelerations,
                "fetal_movement": payload.fetalMovement,
                "uterine_contractions": payload.uterineContractions,
                "light_decelerations": payload.lightDecelerations,
                "severe_decelerations": payload.severeDecelerations,
                "prolongued_decelerations": payload.prolongedDecelerations,
                "abnormal_short_term_variability": payload.abnormalShortTermVariability,
                "mean_value_of_short_term_variability": payload.meanShortTermVariability,
                "percentage_of_time_with_abnormal_long_term_variability": payload.abnormalLongTermVariabilityPercent,
                "mean_value_of_long_term_variability": payload.meanLongTermVariability,
            }
        ]
    )
    model = bundle["model"]
    prediction = int(model.predict(frame)[0])
    labels = bundle.get("class_labels", ["Normal", "Suspect", "Pathological"])
    probabilities = _as_probability(model, frame) or [0.0, 0.0, 1.0]
    confidence = max(probabilities)
    classification = labels[prediction] if prediction < len(labels) else str(prediction)
    risk_score = 20 if classification == "Normal" else 55 if classification == "Suspect" else 90
    return FetalHealthResponse(
        classification=classification,
        probability=round(confidence, 3),
        level=classify_score(risk_score),
        reasons=["CTG fetal health model evaluated cardiotocography features"],
        model="fetal-health-random-forest-v1",
    )
