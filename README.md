# MatriWatch

MatriWatch is an AI-powered maternal and postpartum care platform for mothers, community health workers, and low-resource clinics. It combines an Expo mobile app, a Next.js clinic dashboard, a FastAPI ML service, shared TypeScript clinical rules, Supabase database schema, and trained maternal-health model artifacts.

The app focuses on daily check-ins, vital signs, symptom triage, EPDS screening, postpartum depression flags, real-time clinic alerts, and recovery trend monitoring.

## Repository Description

AI-powered maternal health monitoring app for mothers and clinics, with Expo mobile check-ins, a Next.js dashboard, Supabase workflows, FastAPI risk scoring, and trained ML models for maternal risk, postpartum depression, fetal health, GDM, birth-weight risk, and symptom triage.

## Main Features

- Mother mobile app for daily vitals, symptoms, EPDS screening, and recovery tracking.
- Clinic dashboard for patient monitoring, risk badges, alert review, and trends.
- FastAPI ML service for check-in scoring and model-backed predictions.
- Shared TypeScript rule engine for offline/local fallback scoring.
- Supabase schema, RLS policies, and Edge Function scoring workflow.
- Dataset downloader and local training scripts for reproducible model artifacts.
- Research bundle with PPD reports, ROC curves, confusion matrices, SHAP plots, and model checkpoints.

## Tech Stack

- Frontend dashboard: Next.js 14 App Router, React, TypeScript, Tailwind CSS.
- Mobile app: Expo React Native, Expo Router, TypeScript.
- API layer: Node/TypeScript API server plus generated OpenAPI clients.
- ML service: FastAPI, scikit-learn, pandas, joblib, PyTorch checkpoints for current PPD research models.
- Database and automation: Supabase PostgreSQL, RLS, Edge Functions.
- Monorepo tooling: npm workspaces.

## Workspace Layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js clinic dashboard. |
| `apps/mobile` | Expo app for mothers. |
| `apps/api-server` | TypeScript API server routes. |
| `packages/shared` | Shared EPDS scoring, risk rules, types, and mock data. |
| `packages/api-spec` | OpenAPI contract and client generation config. |
| `packages/api-client-react` | Generated React API client. |
| `packages/db` | Database schema package. |
| `services/ml` | FastAPI service, rules, predictors, model registry, trained artifacts. |
| `supabase` | SQL migration and Edge Function for score check-ins. |
| `datasets` | Local training datasets, manifest, and dataset notes. |
| `docs/current-research` | PPD research reports and visual outputs. |
| `scripts` | Dataset download, training, and report-generation scripts. |

## Quick Start

Install JavaScript dependencies:

```bash
npm install
```

Run the clinic dashboard:

```bash
npm run dev:web
```

Run the ML service:

```bash
pip install -r services/ml/requirements.txt
npm run dev:ml
```

Run the Expo mobile app:

```bash
npm run dev:mobile
```

Run ML tests:

```bash
npm run ml:test
```

Build the web dashboard:

```bash
npm run build:web
```

Type-check the TypeScript workspaces:

```bash
npm run typecheck
```

## Environment Variables

The apps can run with demo data and local rule fallbacks. For live Supabase and ML integration, create a local `.env` from `.env.example` and provide:

```bash
NEXT_PUBLIC_MATRIWATCH_ML_URL=http://localhost:8000
EXPO_PUBLIC_MATRIWATCH_ML_URL=http://localhost:8000
EXPO_PUBLIC_MATRIWATCH_API_URL=http://localhost:3000/api
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_MOTHER_ID=...
```

Use `NEXT_PUBLIC_MATRIWATCH_ML_URL` for the clinic dashboard API proxy and `EXPO_PUBLIC_MATRIWATCH_ML_URL` for the mobile app to call FastAPI directly.

## Data Flow

1. A mother submits a daily check-in from the Expo app.
2. The check-in is saved to Supabase.
3. A Supabase Edge Function calls the FastAPI `/score/checkin` endpoint.
4. The ML service combines trained-model outputs with clinical safety rules.
5. The score and risk level are written back to the database.
6. High-risk cases create alerts.
7. The clinic dashboard updates patient risk, alert, and trend views.

## Model Inventory and Accuracy

The latest local training metrics are stored in `services/ml/models/training_metrics.json`. Accuracy and weighted F1 are reported on held-out test splits from the included local datasets.

| Model artifact | Model family | Task | Accuracy | Weighted F1 | Test rows |
| --- | --- | --- | ---: | ---: | ---: |
| `maternal_risk_classifier.joblib` | HistGradientBoostingClassifier | Low/Mid/High maternal risk from vitals and demographics | 91.61% | 91.64% | 441 |
| `birth_weight_logistic_regression.joblib` | LogisticRegression | Birth-weight risk category support | 92.50% | 92.66% | 40 |
| `pregnancy_high_risk_random_forest.joblib` | RandomForestClassifier | High-risk pregnancy classification | 93.50% | 93.40% | 200 |
| `fetal_health_random_forest.joblib` | RandomForestClassifier | CTG-style fetal health classification | 93.19% | 92.88% | 426 |
| `postpartum_depression_random_forest.joblib` | RandomForestClassifier | Postpartum depression proxy flag | 97.01% | 97.00% | 301 |
| `gdm_ensemble_gradient_boosting.joblib` | GradientBoostingClassifier | Gestational diabetes risk | 94.27% | 94.28% | 908 |
| `symptom_severity_tfidf_logreg.joblib` | TF-IDF + LogisticRegression | Clinical symptom severity triage | 100.00% | 100.00% | 200 |
| `symptom_disease_tfidf_logreg.joblib` | TF-IDF + LogisticRegression | Symptom-to-condition triage support | 95.42% | 95.44% | 240 |

Important model notes:

- The symptom severity model uses a clinically derived target from symptom and condition danger signs. The original Dataset 9 `Severity` column was retained as source data, but it was not learnable from the available features.
- The postpartum depression random forest uses Dataset 6 with `Feeling sad or Tearful` as a proxy label because that dataset does not include an EPDS target.
- Rule thresholds remain active in the production scoring path so obvious clinical danger signs are not hidden by model uncertainty.

## Current PPD Research Models

The repository also includes the current postpartum depression research bundle:

| Artifact | Role |
| --- | --- |
| `services/ml/models/current_ppd/ppd_cnn_phq9_best.pth` | PHQ-9 neural checkpoint. |
| `services/ml/models/current_ppd/ppd_cnn_epds_best.pth` | EPDS neural checkpoint. |
| `services/ml/models/current_ppd/ppd_phq9_taskadaptive_svm.joblib` | PHQ-9 task-adaptive SVM artifact. |
| `services/ml/models/current_ppd/ppd_epds_taskadaptive_svm.joblib` | EPDS task-adaptive SVM artifact. |
| `services/ml/models/current_ppd/ppd_phq9_enriched_fusion_svm.joblib` | PHQ-9 enriched fusion SVM artifact. |
| `services/ml/models/current_ppd/ppd_epds_enriched_fusion_svm.joblib` | EPDS enriched fusion SVM artifact. |

Supporting research assets are in `docs/current-research`, including methodology and results reports, confusion matrices, ROC plots, SHAP summary, feature importance, training curves, and dataset overview visuals.

## Dataset Setup

The included local PPD dataset lives in:

- `datasets/current_ppd/PPD_dataset_v2.csv`
- `datasets/current_ppd/PPD_Data Dictionary_v2.csv`

The repository also includes the local training zips used by `npm run train:models`:

- Dataset1 and Maternal Health Risk Assessment Dataset 3: maternal risk classifier.
- Dataset2: birth-weight risk classifier.
- Dataset4: high-risk pregnancy classifier.
- Dataset5: fetal CTG classifier.
- Dataset6: postpartum proxy classifier.
- Dataset7 and Dataset8: gestational diabetes classifier.
- Dataset9 and Dataset10: symptom severity and disease triage classifiers.

To fetch public datasets listed in `datasets/manifest.json`, configure Kaggle credentials and run:

```bash
npm run download:datasets
```

Kaggle requires a token from your Kaggle account at `~/.kaggle/kaggle.json` or the `KAGGLE_USERNAME` and `KAGGLE_KEY` environment variables. Mendeley datasets are tracked in the manifest and the downloader records their source pages; some Mendeley file downloads may require the web UI or an API token.

## Train Local Models

Train all local model artifacts from the zipped datasets:

```bash
npm run train:models
```

The script reads the included dataset zips and writes trained artifacts plus metrics to `services/ml/models/`.

## Build Phases

- Phase 1: Daily check-ins, EPDS questionnaire, Supabase auth/RLS, rule-based risk flags, and clinic dashboard.
- Phase 2: Trained maternal risk classifier, PPD model integration, GDM detector, symptom triage, and dashboard trend charts.
- Phase 3: Offline mode, wearable integrations, community health worker portal, population analytics, push notifications, and Bangla language support.

## Disclaimer

MatriWatch is a research and prototype decision-support system. It is not a replacement for professional medical diagnosis, emergency care, or local clinical protocols. Model outputs should be reviewed by qualified health workers before clinical action.
