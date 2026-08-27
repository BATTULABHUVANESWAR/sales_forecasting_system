import pandas as pd
from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

# This file is located at:
# Business-Sales-Forecasting-System/ml/prepare_data.py

PROJECT_ROOT = Path(__file__).resolve().parent.parent

RAW_DATA = PROJECT_ROOT / "backend" / "data" / "raw"
MASTER_DATA = PROJECT_ROOT / "backend" / "data" / "master"
PROCESSED_DATA = PROJECT_ROOT / "backend" / "data" / "processed"

# Create processed directory if it does not exist
PROCESSED_DATA.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n==========================================")
print("LOADING DATA")
print("==========================================")

train = pd.read_csv(
    RAW_DATA / "train.csv"
)

features = pd.read_csv(
    RAW_DATA / "features.csv"
)

stores = pd.read_csv(
    RAW_DATA / "stores.csv"
)

store_master = pd.read_csv(
    MASTER_DATA / "store_master.csv"
)

department_master = pd.read_csv(
    MASTER_DATA / "department_master.csv"
)


train["Date"] = pd.to_datetime(
    train["Date"]
)

features["Date"] = pd.to_datetime(
    features["Date"]
)


print("Train rows:", len(train))
print("Features rows:", len(features))
print("Stores:", len(stores))
print("Store master:", len(store_master))
print("Department master:", len(department_master))


# ============================================================
# 2. MERGE ORIGINAL DATA
# ============================================================

print("\nMerging original datasets...")

df = train.merge(
    features,
    on=["Store", "Date"],
    how="left",
    suffixes=("", "_feature")
)


df = df.merge(
    stores,
    on="Store",
    how="left"
)


# ============================================================
# 3. ADD BUSINESS-FACING STORE INFORMATION
# ============================================================

print("Adding store master data...")

df = df.merge(
    store_master[
        [
            "source_store_id",
            "store_id",
            "store_name"
        ]
    ],
    left_on="Store",
    right_on="source_store_id",
    how="left"
)


# ============================================================
# 4. ADD BUSINESS-FACING DEPARTMENT INFORMATION
# ============================================================

print("Adding department master data...")

df = df.merge(
    department_master[
        [
            "source_department_id",
            "department_id",
            "department_name",
            "department_category"
        ]
    ],
    left_on="Dept",
    right_on="source_department_id",
    how="left"
)


# ============================================================
# 5. VERIFY MASTER-DATA MAPPING
# ============================================================

print("\nChecking master-data mappings...")

missing_store_names = df["store_name"].isna().sum()

missing_department_names = (
    df["department_name"].isna().sum()
)


if missing_store_names > 0:

    print(
        f"WARNING: {missing_store_names} rows "
        "have no store-name mapping."
    )

else:

    print("✓ All stores mapped successfully.")


if missing_department_names > 0:

    print(
        f"WARNING: {missing_department_names} rows "
        "have no department-name mapping."
    )

else:

    print("✓ All departments mapped successfully.")


# ============================================================
# 6. SORT BY ENTITY + DATE
# ============================================================

df = df.sort_values(
    [
        "Store",
        "Dept",
        "Date"
    ]
).reset_index(drop=True)


# ============================================================
# 7. CALENDAR FEATURES
# ============================================================

print("\nCreating calendar features...")

df["Year"] = (
    df["Date"].dt.year
)

df["Month"] = (
    df["Date"].dt.month
)

df["Week"] = (
    df["Date"]
    .dt.isocalendar()
    .week
    .astype(int)
)

df["Quarter"] = (
    df["Date"].dt.quarter
)


# ============================================================
# 8. LAG FEATURES
# ============================================================

print("Creating lag features...")

group = df.groupby(
    [
        "Store",
        "Dept"
    ]
)["Weekly_Sales"]


df["Lag_1"] = group.shift(1)

df["Lag_2"] = group.shift(2)

df["Lag_4"] = group.shift(4)

df["Lag_8"] = group.shift(8)


# ============================================================
# 9. LEAKAGE-SAFE ROLLING FEATURES
# ============================================================

print("Creating rolling features...")

# Shift first so the current week's sales
# can never enter its own features.

shifted_sales = group.shift(1)


for window in [4, 8, 12]:

    df[
        f"Rolling_Mean_{window}"
    ] = (

        shifted_sales

        .groupby(
            [
                df["Store"],
                df["Dept"]
            ]
        )

        .transform(

            lambda x:
            x.rolling(
                window=window,
                min_periods=1
            ).mean()
        )
    )


# ============================================================
# 10. HISTORICAL STORE AVERAGE
# ============================================================

print("Creating store-level demand context...")

df["Store_Average_Sales"] = (

    df.groupby(
        "Store"
    )["Weekly_Sales"]

    .transform(

        lambda x:
        x.shift(1)
        .expanding()
        .mean()
    )
)


# ============================================================
# 11. HISTORICAL DEPARTMENT AVERAGE
# ============================================================

print("Creating department-level demand context...")

df["Department_Average_Sales"] = (

    df.groupby(
        "Dept"
    )["Weekly_Sales"]

    .transform(

        lambda x:
        x.shift(1)
        .expanding()
        .mean()
    )
)


# ============================================================
# 12. HISTORICAL STORE-DEPARTMENT AVERAGE
# ============================================================

print("Creating store-department demand context...")

df["StoreDept_Average_Sales"] = (

    df.groupby(
        [
            "Store",
            "Dept"
        ]
    )["Weekly_Sales"]

    .transform(

        lambda x:
        x.shift(1)
        .expanding()
        .mean()
    )
)


# ============================================================
# 13. DEFINE ML FEATURES
# ============================================================

feature_columns = [

    # --------------------------------------------------------
    # ENTITY
    # --------------------------------------------------------

    "Store",
    "Dept",
    "Type",
    "Size",


    # --------------------------------------------------------
    # CALENDAR
    # --------------------------------------------------------

    "Year",
    "Month",
    "Week",
    "Quarter",
    "IsHoliday",


    # --------------------------------------------------------
    # HISTORICAL DEMAND
    # --------------------------------------------------------

    "Lag_1",
    "Lag_2",
    "Lag_4",
    "Lag_8",


    # --------------------------------------------------------
    # ROLLING DEMAND
    # --------------------------------------------------------

    "Rolling_Mean_4",
    "Rolling_Mean_8",
    "Rolling_Mean_12",


    # --------------------------------------------------------
    # AGGREGATE DEMAND CONTEXT
    # --------------------------------------------------------

    "Store_Average_Sales",
    "Department_Average_Sales",
    "StoreDept_Average_Sales"
]


# ============================================================
# 14. CREATE ML DATASET
# ============================================================

print("\nCreating ML dataset...")

model_df = df[
    [
        "Date",
        "Weekly_Sales"
    ]
    +
    feature_columns
].copy()


# ============================================================
# 15. REMOVE INSUFFICIENT-HISTORY ROWS
# ============================================================

model_df = model_df.dropna(
    subset=[
        "Lag_8",

        "Rolling_Mean_4",
        "Rolling_Mean_8",
        "Rolling_Mean_12",

        "Store_Average_Sales",
        "Department_Average_Sales",
        "StoreDept_Average_Sales"
    ]
).reset_index(drop=True)


# ============================================================
# 16. TIME-BASED TRAIN / TEST SPLIT
# ============================================================

print("Creating time-based train/test split...")

model_df = model_df.sort_values(
    "Date"
).reset_index(drop=True)


cutoff = model_df[
    "Date"
].quantile(0.80)


train_df = model_df[
    model_df["Date"] < cutoff
].copy()


test_df = model_df[
    model_df["Date"] >= cutoff
].copy()


# ============================================================
# 17. SAVE PROCESSED DATA
# ============================================================

print("\nSaving processed datasets...")

model_df.to_csv(
    PROCESSED_DATA /
    "ml_features.csv",
    index=False
)


train_df.to_csv(
    PROCESSED_DATA /
    "ml_train.csv",
    index=False
)


test_df.to_csv(
    PROCESSED_DATA /
    "ml_test.csv",
    index=False
)


# ============================================================
# 18. FINAL REPORT
# ============================================================

print("\n==========================================")
print("FEATURE ENGINEERING COMPLETE")
print("==========================================")

print(
    f"\nFull ML dataset : {model_df.shape}"
)

print(
    f"Training set    : {train_df.shape}"
)

print(
    f"Test set        : {test_df.shape}"
)

print(
    f"Time cutoff     : {cutoff.date()}"
)


print("\nFeature columns:")

for column in feature_columns:

    print(
        f"  ✓ {column}"
    )


print("\nFiles created:")

print(
    PROCESSED_DATA /
    "ml_features.csv"
)

print(
    PROCESSED_DATA /
    "ml_train.csv"
)

print(
    PROCESSED_DATA /
    "ml_test.csv"
)


print("\n==========================================")
print("DONE")
print("==========================================")