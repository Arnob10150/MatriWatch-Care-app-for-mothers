# MatriWatch Architecture

## Runtime Components

1. Expo mobile app collects maternal vitals, symptoms, and EPDS responses.
2. Supabase stores authenticated mother, clinic, staff, check-in, EPDS, and alert records with RLS.
3. Supabase Edge Function scores new check-ins by calling the FastAPI ML service.
4. FastAPI returns risk level, risk score, and reasons.
5. Next.js clinic dashboard displays active patients, alerts, PPD flags, and trend charts.

## MVP Scoring

The MVP uses deterministic threshold rules in `packages/shared/src/risk.ts` and `services/ml/app/rules.py`. These rules are intentionally mirrored so the mobile app can show instant offline feedback while the backend remains the source of truth.

## AI Upgrade Path

- Train `maternal_risk_xgboost.joblib` with `scripts/train_risk_classifier.py`.
- Keep model feature contracts beside model files as JSON.
- Update `services/ml/app/model_registry.py` to route requests to trained models when available.
- Keep rule-based scoring as a fallback for offline mode and model outages.

