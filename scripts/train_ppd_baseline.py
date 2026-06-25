from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "datasets" / "current_ppd" / "PPD_dataset_v2.csv"
OUTPUT = ROOT / "services" / "ml" / "models" / "current_ppd" / "ppd_epds_random_forest_baseline.joblib"


def main() -> None:
    frame = pd.read_csv(DATASET)
    features = frame[["Age", "PHQ9 Score", "EPDS Score"]].copy()
    labels = frame["EPDS Result"].astype(str)

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels,
    )

    model = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    print(classification_report(y_test, predictions))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, OUTPUT)
    print(f"Saved {OUTPUT}")


if __name__ == "__main__":
    main()

