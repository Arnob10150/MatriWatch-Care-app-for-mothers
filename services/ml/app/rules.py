from __future__ import annotations

from .schemas import CheckInRequest, ScoreResponse, SymptomRequest, SymptomResponse

HIGH_RISK_SYMPTOMS = {
    "severe headache",
    "blurred vision",
    "heavy bleeding",
    "seizure",
    "chest pain",
    "shortness of breath",
    "reduced fetal movement",
    "suicidal thoughts",
}

MID_RISK_SYMPTOMS = {
    "dizziness",
    "swelling",
    "fever",
    "vomiting",
    "abdominal pain",
    "sad mood",
    "poor sleep",
}


def classify_score(score: int) -> str:
    if score >= 70:
        return "High"
    if score >= 35:
        return "Mid"
    return "Low"


def score_checkin_rules(payload: CheckInRequest) -> ScoreResponse:
    score = 0
    reasons: list[str] = []

    if payload.bpSystolic >= 160 or payload.bpDiastolic >= 110:
        score += 45
        reasons.append("Severe hypertension range blood pressure")
    elif payload.bpSystolic >= 140 or payload.bpDiastolic >= 90:
        score += 25
        reasons.append("Elevated blood pressure")

    if payload.bloodSugar >= 200:
        score += 30
        reasons.append("Very high blood sugar")
    elif payload.bloodSugar >= 140:
        score += 18
        reasons.append("Elevated blood sugar")

    if payload.bodyTemp >= 38:
        score += 18
        reasons.append("Fever detected")

    if payload.heartRate >= 120:
        score += 20
        reasons.append("Very high heart rate")
    elif payload.heartRate >= 105:
        score += 10
        reasons.append("Elevated heart rate")

    if payload.age is not None and (payload.age < 18 or payload.age > 35):
        score += 8
        reasons.append("Age is outside the lower-risk pregnancy range")

    for symptom in payload.symptoms:
        normalized = symptom.strip().lower()
        if normalized in HIGH_RISK_SYMPTOMS:
            score += 30
            reasons.append(f"High-risk symptom reported: {symptom}")
        elif normalized in MID_RISK_SYMPTOMS:
            score += 12
            reasons.append(f"Symptom needs follow-up: {symptom}")

    bounded = max(0, min(100, score))

    return ScoreResponse(
        level=classify_score(bounded),
        score=bounded,
        reasons=reasons or ["Vitals are within configured MVP thresholds"],
        model="mvp-rule-engine-v1",
    )


def score_symptoms_rules(payload: SymptomRequest) -> SymptomResponse:
    checkin = CheckInRequest(
        bpSystolic=110,
        bpDiastolic=70,
        bloodSugar=95,
        bodyTemp=36.8,
        heartRate=82,
        symptoms=payload.symptoms,
    )
    result = score_checkin_rules(checkin)
    return SymptomResponse(level=result.level, score=result.score, reasons=result.reasons)


def score_epds_rules(responses: list[int]) -> tuple[int, bool, str]:
    total = sum(responses)
    self_harm_flag = responses[9] > 0

    if self_harm_flag or total >= 20:
        return total, True, "Urgent"
    if total >= 13:
        return total, True, "Probable"
    if total >= 10:
        return total, True, "Possible"
    return total, False, "Minimal"

