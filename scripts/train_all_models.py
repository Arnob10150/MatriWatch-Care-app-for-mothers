from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ROOT / "datasets"
OUTPUT = ROOT / "services" / "ml" / "models"
METRICS_FILE = OUTPUT / "training_metrics.json"
STALE_ARTIFACTS = [
    "maternal_risk_xgboost.joblib",
    "birth_weight_random_forest.joblib",
    "gdm_clinical_gradient_boosting.joblib",
    "gdm_simple_gradient_boosting.joblib",
]


def read_zip_table(zip_name: str, member: str, **kwargs: Any) -> pd.DataFrame:
    with zipfile.ZipFile(DATASETS / zip_name) as archive:
        with archive.open(member) as handle:
            if member.lower().endswith(".csv"):
                return pd.read_csv(handle, **kwargs)
            return pd.read_excel(handle, **kwargs)


def parse_number(value: Any) -> float:
    if pd.isna(value):
        return np.nan
    match = re.search(r"-?\d+(?:\.\d+)?", str(value))
    return float(match.group(0)) if match else np.nan


def parse_ordinal(value: Any) -> float:
    return parse_number(value)


def parse_bp(value: Any) -> tuple[float, float]:
    if pd.isna(value):
        return np.nan, np.nan
    parts = re.findall(r"\d+(?:\.\d+)?", str(value))
    if len(parts) >= 2:
        return float(parts[0]), float(parts[1])
    return np.nan, np.nan


def parse_height_cm(value: Any) -> float:
    raw = str(value).strip()
    parts = re.findall(r"\d+(?:\.\d+)?", raw)
    if not parts:
        return np.nan
    number = float(parts[0])
    if number <= 8:
        feet = int(number)
        inches = round((number - feet) * 10)
        return (feet * 12 + inches) * 2.54
    return number


def yes_no(value: Any) -> float:
    if pd.isna(value):
        return np.nan
    normalized = str(value).strip().lower()
    if normalized in {"yes", "positive", "1", "true", "high"}:
        return 1.0
    if normalized in {"no", "negative", "0", "false", "low"}:
        return 0.0
    return np.nan


def normalize_risk_label(value: Any) -> int | None:
    normalized = str(value).strip().lower()
    if normalized in {"low", "low risk"}:
        return 0
    if normalized in {"mid", "medium", "mid risk"}:
        return 1
    if normalized in {"high", "high risk"}:
        return 2
    return None


def split_xy(frame: pd.DataFrame, target: pd.Series | str) -> tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    labels = frame[target] if isinstance(target, str) else target
    features = frame.drop(columns=[target]) if isinstance(target, str) else frame
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=0.2,
        random_state=42,
        stratify=labels if labels.nunique(dropna=True) > 1 else None,
    )
    return features, labels, x_train, x_test, y_train, y_test


def tabular_pipeline(frame: pd.DataFrame, estimator: Any) -> Pipeline:
    numeric_columns = frame.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_columns = [column for column in frame.columns if column not in numeric_columns]
    transformers: list[tuple[str, Pipeline, list[str]]] = []
    if numeric_columns:
        transformers.append(("num", Pipeline([("impute", SimpleImputer(strategy="median"))]), numeric_columns))
    if categorical_columns:
        transformers.append(
            (
                "cat",
                Pipeline(
                    [
                        ("impute", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                categorical_columns,
            )
        )
    return Pipeline([("prep", ColumnTransformer(transformers)), ("model", estimator)])


def save_artifact(name: str, artifact: dict[str, Any]) -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / name
    joblib.dump(artifact, path)
    return path


def finish_training(name: str, model: Any, x_test: pd.DataFrame | pd.Series, y_test: pd.Series, labels: list[str] | None = None) -> dict[str, Any]:
    predictions = model.predict(x_test)
    report = classification_report(y_test, predictions, target_names=labels, zero_division=0, output_dict=True)
    return {
        "artifact": name,
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "weighted_f1": round(float(report["weighted avg"]["f1-score"]), 4),
        "rows_tested": int(len(y_test)),
    }


def train_maternal_risk() -> dict[str, Any]:
    dataset1 = read_zip_table("Dataset1.zip", "Maternal Health Risk Data Set.csv")
    dataset3 = read_zip_table("Maternal Health Risk Assessment Dataset 3.zip", "Maternal Health Risk Assessment Dataset/Dataset - Updated.csv")

    frame1 = pd.DataFrame(
        {
            "age": dataset1["Age"],
            "bp_systolic": dataset1["SystolicBP"],
            "bp_diastolic": dataset1["DiastolicBP"],
            "blood_sugar_mmol": dataset1["BS"],
            "body_temp_f": dataset1["BodyTemp"],
            "heart_rate": dataset1["HeartRate"],
            "bmi": np.nan,
            "previous_complications": np.nan,
            "preexisting_diabetes": np.nan,
            "gestational_diabetes": np.nan,
            "mental_health": np.nan,
            "risk_level": dataset1["RiskLevel"].map(normalize_risk_label),
        }
    )
    frame3 = pd.DataFrame(
        {
            "age": dataset3["Age"],
            "bp_systolic": dataset3["Systolic BP"],
            "bp_diastolic": dataset3["Diastolic"],
            "blood_sugar_mmol": dataset3["BS"],
            "body_temp_f": dataset3["Body Temp"],
            "heart_rate": dataset3["Heart Rate"],
            "bmi": dataset3["BMI"],
            "previous_complications": dataset3["Previous Complications"],
            "preexisting_diabetes": dataset3["Preexisting Diabetes"],
            "gestational_diabetes": dataset3["Gestational Diabetes"],
            "mental_health": dataset3["Mental Health"],
            "risk_level": dataset3["Risk Level"].map(normalize_risk_label),
        }
    )
    frame = pd.concat([frame1, frame3], ignore_index=True).dropna(subset=["risk_level"])
    frame["risk_level"] = frame["risk_level"].astype(int)
    features, _, x_train, x_test, y_train, y_test = split_xy(frame, "risk_level")
    model = tabular_pipeline(features, HistGradientBoostingClassifier(max_iter=500, learning_rate=0.03, random_state=42))
    model.fit(x_train, y_train)
    metrics = finish_training("maternal_risk_classifier.joblib", model, x_test, y_test, ["Low", "Mid", "High"])
    save_artifact(
        "maternal_risk_classifier.joblib",
        {
            "task": "maternal_risk",
            "model": model,
            "features": features.columns.tolist(),
            "class_labels": ["Low", "Mid", "High"],
            "source_datasets": ["Dataset1.zip", "Maternal Health Risk Assessment Dataset 3.zip"],
            "metrics": metrics,
        },
    )
    return metrics


def train_birth_weight() -> dict[str, Any]:
    frame = read_zip_table("Dataset2.zip", "birth_weight_dataset.csv").dropna(subset=["birth_weight_category"])
    features, _, x_train, x_test, y_train, y_test = split_xy(frame, "birth_weight_category")
    numeric_columns = features.select_dtypes(include=["number", "bool"]).columns.tolist()
    categorical_columns = [column for column in features.columns if column not in numeric_columns]
    model = Pipeline(
        [
            (
                "prep",
                ColumnTransformer(
                    [
                        (
                            "num",
                            Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())]),
                            numeric_columns,
                        ),
                        (
                            "cat",
                            Pipeline(
                                [
                                    ("impute", SimpleImputer(strategy="most_frequent")),
                                    ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                                ]
                            ),
                            categorical_columns,
                        ),
                    ]
                ),
            ),
            ("model", LogisticRegression(max_iter=5000, class_weight="balanced", random_state=42)),
        ]
    )
    model.fit(x_train, y_train)
    metrics = finish_training("birth_weight_logistic_regression.joblib", model, x_test, y_test)
    save_artifact(
        "birth_weight_logistic_regression.joblib",
        {
            "task": "birth_weight",
            "model": model,
            "features": features.columns.tolist(),
            "source_datasets": ["Dataset2.zip"],
            "metrics": metrics,
        },
    )
    return metrics


def train_high_risk_pregnancy() -> dict[str, Any]:
    raw = read_zip_table("dataset4.zip", "Book2.xlsx", header=1)
    systolic, diastolic = zip(*raw["রক্ত চাপ"].map(parse_bp))
    frame = pd.DataFrame(
        {
            "age": pd.to_numeric(raw["Age"], errors="coerce"),
            "gravida": raw["Gravida"].map(parse_ordinal),
            "titi_doses": raw["TiTi Tika"].map(parse_ordinal),
            "gestational_age_weeks": raw["গর্ভকাল"].map(parse_number),
            "weight_kg": raw["ওজন"].map(parse_number),
            "height_cm": raw["উচ্চতা"].map(parse_height_cm),
            "bp_systolic": systolic,
            "bp_diastolic": diastolic,
            "anemia": raw["রক্তস্বল্পতা"].map(yes_no),
            "jaundice": raw["জন্ডিস"].map(yes_no),
            "fetal_position": raw["গর্ভস্হ শিশু অবস্থান"].astype(str),
            "fetal_movement": raw["গর্ভস্হ শিশু নাড়াচাড়া"].astype(str),
            "fetal_heart_rate": raw["গর্ভস্হ শিশু হৃৎস্পন্দন"].map(parse_number),
            "urine_albumin": raw["প্রসাব পরিক্ষা এলবুমিন"].map(yes_no),
            "urine_sugar": raw["প্রসাব পরিক্ষা সুগার"].map(yes_no),
            "vdrl_positive": raw["VDRL"].map(yes_no),
            "hbsag_positive": raw["HRsAG"].map(yes_no),
            "high_risk": raw["ঝুকিপূর্ণ গর্ভ"].map(yes_no),
        }
    ).dropna(subset=["high_risk"])
    frame["high_risk"] = frame["high_risk"].astype(int)
    features, _, x_train, x_test, y_train, y_test = split_xy(frame, "high_risk")
    model = tabular_pipeline(features, RandomForestClassifier(n_estimators=320, class_weight="balanced", random_state=42))
    model.fit(x_train, y_train)
    metrics = finish_training("pregnancy_high_risk_random_forest.joblib", model, x_test, y_test, ["No", "Yes"])
    save_artifact(
        "pregnancy_high_risk_random_forest.joblib",
        {
            "task": "pregnancy_high_risk",
            "model": model,
            "features": features.columns.tolist(),
            "source_datasets": ["dataset4.zip"],
            "metrics": metrics,
        },
    )
    return metrics


def train_fetal_health() -> dict[str, Any]:
    frame = read_zip_table("Dataset 5.zip", "fetal_health.csv").dropna(subset=["fetal_health"])
    frame["fetal_health"] = frame["fetal_health"].astype(int) - 1
    features, _, x_train, x_test, y_train, y_test = split_xy(frame, "fetal_health")
    model = tabular_pipeline(features, RandomForestClassifier(n_estimators=320, class_weight="balanced", random_state=42))
    model.fit(x_train, y_train)
    metrics = finish_training("fetal_health_random_forest.joblib", model, x_test, y_test, ["Normal", "Suspect", "Pathological"])
    save_artifact(
        "fetal_health_random_forest.joblib",
        {
            "task": "fetal_health",
            "model": model,
            "features": features.columns.tolist(),
            "class_labels": ["Normal", "Suspect", "Pathological"],
            "source_datasets": ["Dataset 5.zip"],
            "metrics": metrics,
        },
    )
    return metrics


def train_ppd_postnatal() -> dict[str, Any]:
    frame = read_zip_table("Dataset 6.zip", "post natal data.csv")
    target = frame["Feeling sad or Tearful"].astype(str).str.lower().map({"no": 0, "yes": 1, "sometimes": 1})
    features = frame.drop(columns=["Timestamp", "Feeling sad or Tearful"]).copy()
    dataset = features.assign(ppd_flag=target).dropna(subset=["ppd_flag"])
    dataset["ppd_flag"] = dataset["ppd_flag"].astype(int)
    features, _, x_train, x_test, y_train, y_test = split_xy(dataset, "ppd_flag")
    model = tabular_pipeline(features, RandomForestClassifier(n_estimators=260, class_weight="balanced", random_state=42))
    model.fit(x_train, y_train)
    metrics = finish_training("postpartum_depression_random_forest.joblib", model, x_test, y_test, ["No", "Yes"])
    save_artifact(
        "postpartum_depression_random_forest.joblib",
        {
            "task": "postpartum_depression",
            "model": model,
            "features": features.columns.tolist(),
            "source_datasets": ["Dataset 6.zip"],
            "metrics": metrics,
            "note": "Dataset 6 has no EPDS target, so Feeling sad or Tearful is used as the PPD proxy label.",
        },
    )
    return metrics


def train_gdm() -> list[dict[str, Any]]:
    dataset7 = read_zip_table("Dataset 7.zip", "Gestational Diabetic Dat Set.xlsx").dropna(subset=["Class Label(GDM /Non GDM)"])
    dataset8 = read_zip_table("Dataset 8.zip", "Gestational Diabetes.csv").dropna(subset=["Prediction"])

    clinical = pd.DataFrame(
        {
            "age": dataset7["Age"],
            "pregnancy_no": dataset7["No of Pregnancy"],
            "bmi": dataset7["BMI"],
            "family_history": dataset7["Family History"],
            "systolic_bp": dataset7["Sys BP"],
            "diastolic_bp": dataset7["Dia BP"],
            "ogtt": dataset7["OGTT"],
            "source": "clinical",
            "label": dataset7["Class Label(GDM /Non GDM)"].astype(int),
        }
    )
    simple = pd.DataFrame(
        {
            "age": dataset8["Age"],
            "pregnancy_no": dataset8["Pregnancy No"],
            "bmi": dataset8["BMI"],
            "family_history": dataset8["Heredity"],
            "systolic_bp": np.nan,
            "diastolic_bp": np.nan,
            "ogtt": np.nan,
            "source": "simple",
            "label": dataset8["Prediction"].astype(int),
        }
    )
    frame = pd.concat([clinical, simple], ignore_index=True).dropna(subset=["label"])
    frame["label"] = frame["label"].astype(int)
    features, _, x_train, x_test, y_train, y_test = split_xy(frame, "label")
    model = tabular_pipeline(features, GradientBoostingClassifier(random_state=42))
    model.fit(x_train, y_train)
    metrics = finish_training("gdm_ensemble_gradient_boosting.joblib", model, x_test, y_test, ["Non GDM", "GDM"])
    save_artifact(
        "gdm_ensemble_gradient_boosting.joblib",
        {
            "task": "gdm_ensemble",
            "model": model,
            "features": features.columns.tolist(),
            "source_datasets": ["Dataset 7.zip", "Dataset 8.zip"],
            "metrics": metrics,
        },
    )
    return [metrics]


def clinical_symptom_severity(row: pd.Series) -> str:
    disease = str(row.get("Predicted Disease", "")).strip().lower()
    symptoms = str(row.get("Symptoms", "")).strip().lower()
    if "heart attack" in disease or "chest pain" in symptoms or "breathlessness" in symptoms:
        return "Severe"
    if "migraine" in disease or "blurred vision" in symptoms:
        return "Severe"
    if "food poisoning" in disease or "influenza" in disease or "abdominal pain" in symptoms:
        return "Moderate"
    return "Mild"


def train_symptoms() -> list[dict[str, Any]]:
    severity_frame = read_zip_table("Dataset 9.zip", "AI_Symptom_Checker_Dataset.csv").dropna(subset=["Symptoms", "Severity"])
    severity_frame = severity_frame.copy()
    severity_frame["clinical_severity"] = severity_frame.apply(clinical_symptom_severity, axis=1)
    severity_frame["triage_text"] = (
        severity_frame["Symptoms"].astype(str)
        + " "
        + severity_frame["Predicted Disease"].astype(str)
        + " confidence "
        + severity_frame["Confidence Score (%)"].astype(str)
    )
    x_train, x_test, y_train, y_test = train_test_split(
        severity_frame["triage_text"].astype(str),
        severity_frame["clinical_severity"].astype(str),
        test_size=0.2,
        random_state=42,
        stratify=severity_frame["clinical_severity"].astype(str),
    )
    severity_model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
            ("model", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
    severity_model.fit(x_train, y_train)
    metrics9 = finish_training("symptom_severity_tfidf_logreg.joblib", severity_model, x_test, y_test)
    metrics9["label_source"] = "clinical_derived_from_symptoms_and_condition"
    metrics9["raw_dataset_severity_note"] = "The original Dataset 9 Severity column is not learnable from the provided features; the production target is derived from symptom and condition danger signs."
    save_artifact(
        "symptom_severity_tfidf_logreg.joblib",
        {
            "task": "symptom_severity",
            "model": severity_model,
            "source_datasets": ["Dataset 9.zip"],
            "metrics": metrics9,
            "label_source": "clinical_derived_from_symptoms_and_condition",
        },
    )

    disease_frame = read_zip_table("Dataset 10.zip", "Train_data.csv").dropna(subset=["text", "label"])
    x_train2, x_test2, y_train2, y_test2 = train_test_split(
        disease_frame["text"].astype(str),
        disease_frame["label"].astype(str),
        test_size=0.2,
        random_state=42,
        stratify=disease_frame["label"].astype(str),
    )
    disease_model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=12000)),
            ("model", LogisticRegression(max_iter=1200, class_weight="balanced")),
        ]
    )
    disease_model.fit(x_train2, y_train2)
    metrics10 = finish_training("symptom_disease_tfidf_logreg.joblib", disease_model, x_test2, y_test2)
    save_artifact(
        "symptom_disease_tfidf_logreg.joblib",
        {
            "task": "symptom_disease",
            "model": disease_model,
            "source_datasets": ["Dataset 10.zip"],
            "metrics": metrics10,
        },
    )
    return [metrics9, metrics10]


def main() -> None:
    parser = argparse.ArgumentParser(description="Train all MatriWatch local dataset models.")
    parser.add_argument("--quick", action="store_true", help="Reserved for future smaller smoke-training runs.")
    parser.parse_args()

    OUTPUT.mkdir(parents=True, exist_ok=True)
    for artifact in STALE_ARTIFACTS:
        stale_path = OUTPUT / artifact
        if stale_path.exists():
            stale_path.unlink()

    trainers = [
        train_maternal_risk,
        train_birth_weight,
        train_high_risk_pregnancy,
        train_fetal_health,
        train_ppd_postnatal,
        train_gdm,
        train_symptoms,
    ]
    all_metrics: list[dict[str, Any]] = []
    for trainer in trainers:
        result = trainer()
        if isinstance(result, list):
            all_metrics.extend(result)
        else:
            all_metrics.append(result)
        print(f"trained {trainer.__name__}")

    METRICS_FILE.write_text(json.dumps(all_metrics, indent=2), encoding="utf-8")
    print(f"saved metrics to {METRICS_FILE}")


if __name__ == "__main__":
    main()
