# MatriWatch Datasets

This folder separates datasets by source and module.

## Included Now

- `current_ppd/PPD_dataset_v2.csv` - Existing local postpartum depression research dataset.
- `current_ppd/PPD_Data Dictionary_v2.csv` - Existing local data dictionary.
- `Dataset1.zip` through `Dataset 10.zip` plus `dataset4.zip` and `Maternal Health Risk Assessment Dataset 3.zip` - local training inputs for the MatriWatch model pipeline.

## Train Local Models

Run from the project root:

```bash
npm run train:models
```

Outputs are written to `services/ml/models/`:

- `maternal_risk_classifier.joblib`
- `pregnancy_high_risk_random_forest.joblib`
- `fetal_health_random_forest.joblib`
- `postpartum_depression_random_forest.joblib`
- `gdm_ensemble_gradient_boosting.joblib`
- `birth_weight_logistic_regression.joblib`
- `symptom_severity_tfidf_logreg.joblib`
- `symptom_disease_tfidf_logreg.joblib`
- `training_metrics.json`

## Download Targets

Run the downloader from the project root:

```bash
npm run download:datasets
```

Kaggle datasets require the Kaggle API token. Put `kaggle.json` in `~/.kaggle/` or set `KAGGLE_USERNAME` and `KAGGLE_KEY` in the environment.

Mendeley datasets are listed with source pages in `manifest.json`. If public direct file download is not available through the script, download from the listed Mendeley page and keep the files under the matching `datasets/raw/mendeley/*` folder.

## Module Map

- Risk classification: vitals to Low, Mid, High.
- High-risk pregnancy and fetal monitoring: high-risk pregnancy labels and CTG fetal health classes.
- Postpartum depression: EPDS responses and PPD labels.
- Gestational diabetes: glucose, insulin, BMI, age to GDM label.
- Symptom checker: symptom combinations and severity.
