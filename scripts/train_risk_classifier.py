from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "services" / "ml" / "models" / "maternal_risk_xgboost.joblib"

DEFAULT_COLUMNS = {
    "age": "Age",
    "systolic": "SystolicBP",
    "diastolic": "DiastolicBP",
    "blood_sugar": "BS",
    "body_temp": "BodyTemp",
    "heart_rate": "HeartRate",
    "label": "RiskLevel",
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Train MatriWatch maternal risk classifier.")
    parser.add_argument("csv", type=Path, help="CSV file from the maternal health risk dataset")
    args = parser.parse_args()

    frame = pd.read_csv(args.csv)
    missing = [column for column in DEFAULT_COLUMNS.values() if column not in frame.columns]
    if missing:
        raise SystemExit(f"Missing expected columns: {missing}")

    feature_columns = [
        DEFAULT_COLUMNS["age"],
        DEFAULT_COLUMNS["systolic"],
        DEFAULT_COLUMNS["diastolic"],
        DEFAULT_COLUMNS["blood_sugar"],
        DEFAULT_COLUMNS["body_temp"],
        DEFAULT_COLUMNS["heart_rate"],
    ]
    label_column = DEFAULT_COLUMNS["label"]

    label_map = {"low risk": 0, "mid risk": 1, "high risk": 2, "Low": 0, "Mid": 1, "High": 2}
    labels = frame[label_column].map(lambda value: label_map.get(str(value), label_map.get(str(value).lower())))

    if labels.isna().any():
        raise SystemExit("Unknown risk labels found. Update label_map in scripts/train_risk_classifier.py.")

    x_train, x_test, y_train, y_test = train_test_split(
        frame[feature_columns],
        labels.astype(int),
        test_size=0.2,
        random_state=42,
        stratify=labels,
    )

    model = XGBClassifier(
        objective="multi:softprob",
        num_class=3,
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    print(classification_report(y_test, predictions, target_names=["Low", "Mid", "High"]))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "features": feature_columns}, OUTPUT)
    print(f"Saved {OUTPUT}")


if __name__ == "__main__":
    main()

