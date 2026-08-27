import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from xgboost import XGBRegressor


# ============================================================
# 1. PROJECT PATHS
# ============================================================

# This file is located at:
# Business-Sales-Forecasting-System/ml/train_models.py

PROJECT_ROOT = Path(__file__).resolve().parent.parent

PROCESSED_DATA = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "processed"
)

MODEL_DIR = (
    PROJECT_ROOT
    / "backend"
    / "models"
)

RESULTS_DIR = (
    PROJECT_ROOT
    / "backend"
    / "results"
)


# Create directories if necessary

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. LOAD PROCESSED DATA
# ============================================================

print("\n==========================================")
print("LOADING PROCESSED DATA")
print("==========================================")

train_df = pd.read_csv(
    PROCESSED_DATA / "ml_train.csv"
)

test_df = pd.read_csv(
    PROCESSED_DATA / "ml_test.csv"
)

print(
    "Training rows:",
    len(train_df)
)

print(
    "Testing rows:",
    len(test_df)
)


# ============================================================
# 3. TARGET + FEATURES
# ============================================================

TARGET = "Weekly_Sales"


FEATURES = [

    # Entity
    "Store",
    "Dept",
    "Type",
    "Size",

    # Calendar
    "Year",
    "Month",
    "Week",
    "Quarter",
    "IsHoliday",

    # Historical demand
    "Lag_1",
    "Lag_2",
    "Lag_4",
    "Lag_8",

    # Rolling demand
    "Rolling_Mean_4",
    "Rolling_Mean_8",
    "Rolling_Mean_12",

    # Aggregate demand context
    "Store_Average_Sales",
    "Department_Average_Sales",
    "StoreDept_Average_Sales"
]


# ============================================================
# 4. ENCODE STORE TYPE
# ============================================================

print("\nEncoding store type...")


TYPE_MAPPING = {
    "A": 0,
    "B": 1,
    "C": 2
}


train_df["Type"] = (
    train_df["Type"]
    .map(TYPE_MAPPING)
    .fillna(-1)
)


test_df["Type"] = (
    test_df["Type"]
    .map(TYPE_MAPPING)
    .fillna(-1)
)


# ============================================================
# 5. CREATE TRAIN / TEST DATA
# ============================================================

X_train = train_df[
    FEATURES
]

y_train = train_df[
    TARGET
]


X_test = test_df[
    FEATURES
]

y_test = test_df[
    TARGET
]


print("\nFeatures:", len(FEATURES))

print(
    "Training shape:",
    X_train.shape
)

print(
    "Testing shape:",
    X_test.shape
)


# ============================================================
# 6. RESULTS STORAGE
# ============================================================

results = []


# ============================================================
# 7. MODEL EVALUATION FUNCTION
# ============================================================

def evaluate_model(
    name,
    model,
    Xtr,
    ytr,
    Xte,
    yte
):

    print("\n------------------------------------------")

    print(
        "Training:",
        name
    )

    print("------------------------------------------")


    # Train

    model.fit(
        Xtr,
        ytr
    )


    # Predict

    predictions = model.predict(
        Xte
    )


    # Metrics

    mae = mean_absolute_error(
        yte,
        predictions
    )


    rmse = np.sqrt(
        mean_squared_error(
            yte,
            predictions
        )
    )


    r2 = r2_score(
        yte,
        predictions
    )


    # Store results

    results.append(
        {
            "Model": name,

            "MAE": mae,

            "RMSE": rmse,

            "R2": r2
        }
    )


    # Display

    print(
        "MAE :",
        round(mae, 2)
    )

    print(
        "RMSE:",
        round(rmse, 2)
    )

    print(
        "R²  :",
        round(r2, 4)
    )


    return model


# ============================================================
# 8. LINEAR REGRESSION
# ============================================================

linear_model = evaluate_model(

    "Linear Regression",

    LinearRegression(),

    X_train,
    y_train,

    X_test,
    y_test
)


joblib.dump(
    linear_model,

    MODEL_DIR
    / "linear_regression_model.joblib"
)


print(
    "✓ Linear Regression saved."
)


# ============================================================
# 9. RANDOM FOREST
# ============================================================

random_forest_model = evaluate_model(

    "Random Forest",

    RandomForestRegressor(

        n_estimators=40,

        max_depth=16,

        min_samples_leaf=2,

        n_jobs=-1,

        random_state=42
    ),

    X_train,
    y_train,

    X_test,
    y_test
)


joblib.dump(
    random_forest_model,

    MODEL_DIR
    / "random_forest_model.joblib"
)


print(
    "✓ Random Forest saved."
)


# ============================================================
# 10. XGBOOST
# ============================================================

print(
    "\nPreparing XGBoost training sample..."
)


# XGBoost is computationally heavier,
# so we use a representative sample.

sample_size = min(
    100000,
    len(train_df)
)


xgb_sample = train_df.sample(
    n=sample_size,
    random_state=42
)


X_xgb = xgb_sample[
    FEATURES
]


y_xgb = xgb_sample[
    TARGET
]


print(
    "XGBoost training rows:",
    len(xgb_sample)
)


xgb_model = evaluate_model(

    "XGBoost",

    XGBRegressor(

        n_estimators=80,

        max_depth=6,

        learning_rate=0.08,

        subsample=0.85,

        colsample_bytree=0.9,

        objective="reg:squarederror",

        tree_method="hist",

        n_jobs=-1,

        random_state=42
    ),

    X_xgb,
    y_xgb,

    X_test,
    y_test
)


joblib.dump(
    xgb_model,

    MODEL_DIR
    / "xgboost_model.joblib"
)


print(
    "✓ XGBoost saved."
)


# ============================================================
# 11. ARTIFICIAL NEURAL NETWORK
# ============================================================

print(
    "\nPreparing ANN data..."
)


scaler = StandardScaler()


X_ann_train = scaler.fit_transform(
    X_xgb
)


X_ann_test = scaler.transform(
    X_test
)


ann_model = evaluate_model(

    "ANN",

    MLPRegressor(

        hidden_layer_sizes=(
            64,
            32
        ),

        max_iter=30,

        early_stopping=True,

        validation_fraction=0.1,

        batch_size=512,

        random_state=42
    ),

    X_ann_train,
    y_xgb,

    X_ann_test,
    y_test
)


joblib.dump(
    ann_model,

    MODEL_DIR
    / "ann_model.joblib"
)


joblib.dump(
    scaler,

    MODEL_DIR
    / "ann_scaler.joblib"
)


print(
    "✓ ANN saved."
)


# ============================================================
# 12. MODEL COMPARISON
# ============================================================

results_df = pd.DataFrame(
    results
)


results_df = results_df.sort_values(
    "R2",
    ascending=False
).reset_index(
    drop=True
)


# ============================================================
# 13. SAVE MODEL RESULTS
# ============================================================

results_path = (
    RESULTS_DIR
    / "model_results.csv"
)


results_df.to_csv(
    results_path,
    index=False
)


# ============================================================
# 14. DETERMINE BEST MODEL
# ============================================================

best_model_name = (
    results_df
    .iloc[0]
    ["Model"]
)


best_r2 = (
    results_df
    .iloc[0]
    ["R2"]
)


# ============================================================
# 15. SAVE EVALUATION REPORT
# ============================================================

report_path = (
    RESULTS_DIR
    / "evaluation_report.txt"
)


with open(
    report_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "BUSINESS SALES & DEMAND FORECASTING SYSTEM\n"
    )

    file.write(
        "MODEL EVALUATION REPORT\n"
    )

    file.write(
        "==========================================\n\n"
    )


    file.write(
        results_df.to_string(
            index=False
        )
    )


    file.write(
        "\n\n"
    )


    file.write(
        f"Best Model: {best_model_name}\n"
    )


    file.write(
        f"Best R2: {best_r2:.6f}\n"
    )


    file.write(
        "\nEvaluation method:\n"
    )

    file.write(
        "Time-based train/test split\n"
    )


# ============================================================
# 16. FINAL OUTPUT
# ============================================================

print("\n\n==========================================")
print("FINAL MODEL COMPARISON")
print("==========================================\n")


print(
    results_df.to_string(
        index=False
    )
)


print("\n==========================================")

print(
    "BEST MODEL:",
    best_model_name
)

print(
    "BEST R²:",
    round(best_r2, 4)
)


print(
    "\n=========================================="
)

print(
    "MODEL FILES"
)

print(
    "=========================================="
)


print(
    MODEL_DIR
    / "linear_regression_model.joblib"
)

print(
    MODEL_DIR
    / "random_forest_model.joblib"
)

print(
    MODEL_DIR
    / "xgboost_model.joblib"
)

print(
    MODEL_DIR
    / "ann_model.joblib"
)

print(
    MODEL_DIR
    / "ann_scaler.joblib"
)


print(
    "\nResults:"
)

print(
    results_path
)


print(
    "\nEvaluation report:"
)

print(
    report_path
)


print("\n==========================================")
print("MODEL TRAINING COMPLETE")
print("==========================================")