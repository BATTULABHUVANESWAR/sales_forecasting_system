---
library_name: scikit-learn
tags:
- sales-forecasting
- machine-learning
- xgboost
- random-forest
- regression
- business-intelligence
- demand-forecasting
---

# Business Sales & Revenue Forecasting — ML Models

This repository contains the trained machine learning model artifacts used by the **Business Sales & Revenue Forecasting System**.

The models are used by the Flask backend to generate weekly sales forecasts for stores and departments.

## Project

**Business Sales & Revenue Forecasting System**

The complete application combines:

- React frontend
- Flask backend
- Machine learning forecasting
- Cold-start forecasting
- Store and department master data
- Analytics
- Forecast history

The application supports forecasting for both established and newly introduced business entities.

---

## Model Files

| File | Purpose |
|---|---|
| `xgboost_model.joblib` | XGBoost regression model used for sales forecasting |
| `random_forest_model.joblib` | Random Forest regression model |
| `linear_regression_model.joblib` | Linear Regression baseline model |
| `ann_model.joblib` | Artificial Neural Network regression model |
| `ann_scaler.joblib` | StandardScaler used to preprocess ANN inputs |

---

## Forecasting Approach

The system uses different strategies depending on data availability.

### 1. Historical ML Forecasting

For an existing store and department with sufficient historical sales:

```text
Historical Sales
       ↓
Feature Engineering
       ↓
Lag Features
Rolling Features
Calendar Features
Store/Department Features
       ↓
Machine Learning Model
       ↓
Weekly Sales Forecast