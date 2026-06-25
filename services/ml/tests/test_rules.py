from app.rules import score_checkin_rules, score_epds_rules
from app.schemas import CheckInRequest


def test_high_risk_checkin() -> None:
    result = score_checkin_rules(
        CheckInRequest(
            bpSystolic=166,
            bpDiastolic=112,
            bloodSugar=214,
            bodyTemp=38.2,
            heartRate=124,
            symptoms=["severe headache"],
        )
    )

    assert result.level == "High"
    assert result.score == 100


def test_epds_flag() -> None:
    total, flagged, severity = score_epds_rules([1, 1, 2, 2, 1, 1, 1, 2, 1, 0])

    assert total == 12
    assert flagged is True
    assert severity == "Possible"

