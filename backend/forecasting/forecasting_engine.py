import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from huggingface_hub import hf_hub_download

from .feature_builder import (
    FEATURES,
    prepare_model_input
)


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    .parent
)


# ============================================================
# HUGGING FACE MODEL REPOSITORY
# ============================================================

HF_REPO_ID = (
    "Bhuvi18/business-sales-forecast-models"
)

HF_MODEL_FILENAME = (
    "random_forest_model.joblib"
)


# Local cache path. The downloaded model is kept here so the
# backend does not download it again on every request.

LOCAL_MODEL_DIR = (
    PROJECT_ROOT
    / "backend"
    / "models"
)

LOCAL_MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

LOCAL_MODEL_PATH = (
    LOCAL_MODEL_DIR
    / HF_MODEL_FILENAME
)


# ============================================================
# HUGGING FACE HISTORICAL DATA
# ============================================================

HF_DATA_FILENAME = (
    "ml_features.csv"
)

LOCAL_DATA_DIR = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "processed"
)

LOCAL_DATA_DIR.mkdir(
    parents=True,
    exist_ok=True
)

LOCAL_DATA_PATH = (
    LOCAL_DATA_DIR
    / HF_DATA_FILENAME
)


# ============================================================
# LOAD MODEL FROM HUGGING FACE
# ============================================================

def load_model():

    # Use the local cached copy when available.
    if LOCAL_MODEL_PATH.exists():

        print(
            f"Loading model from local cache: "
            f"{LOCAL_MODEL_PATH}"
        )

        return joblib.load(
            LOCAL_MODEL_PATH
        )


    print(
        "Model not found locally."
    )

    print(
        "Downloading model from Hugging Face:"
    )

    print(
        f"{HF_REPO_ID}/{HF_MODEL_FILENAME}"
    )


    downloaded_path = hf_hub_download(

        repo_id=
            HF_REPO_ID,

        filename=
            HF_MODEL_FILENAME,

        local_dir=
            LOCAL_MODEL_DIR
    )


    # hf_hub_download may return the exact cached path.
    # Load from that path directly.

    print(
        f"Model downloaded to: "
        f"{downloaded_path}"
    )


    return joblib.load(
        downloaded_path
    )


model = load_model()


# ============================================================
# LOAD HISTORICAL DATA FROM HUGGING FACE
# ============================================================

def load_historical_data():

    # Use local cache when it already exists.
    if LOCAL_DATA_PATH.exists():

        print(
            f"Loading historical data from local cache: "
            f"{LOCAL_DATA_PATH}"
        )

        return pd.read_csv(
            LOCAL_DATA_PATH
        )


    print(
        "Historical data not found locally."
    )

    print(
        "Downloading ml_features.csv from Hugging Face:"
    )

    print(
        f"{HF_REPO_ID}/{HF_DATA_FILENAME}"
    )


    downloaded_path = hf_hub_download(

        repo_id=
            HF_REPO_ID,

        filename=
            HF_DATA_FILENAME,

        local_dir=
            LOCAL_DATA_DIR
    )


    print(
        f"Historical data downloaded to: "
        f"{downloaded_path}"
    )


    return pd.read_csv(
        downloaded_path
    )


history = load_historical_data()


history["Date"] = pd.to_datetime(
    history["Date"]
)


history = history.sort_values(
    [
        "Store",
        "Dept",
        "Date"
    ]
).reset_index(
    drop=True
)


# ============================================================
# STORE TYPE ENCODING
# ============================================================

TYPE_MAPPING = {
    "A": 0,
    "B": 1,
    "C": 2
}


# ============================================================
# GET ENTITY HISTORY
# ============================================================

def get_entity_history(
    store,
    department
):

    entity = history[
        (history["Store"] == store)
        &
        (history["Dept"] == department)
    ].copy()


    return entity.sort_values(
        "Date"
    )


# ============================================================
# FORECAST SALES
# ============================================================

def forecast_sales(
    store,
    department,
    horizon=4
):

    # --------------------------------------------------------
    # Validate horizon
    # --------------------------------------------------------

    if horizon not in [
        1,
        4,
        8,
        12
    ]:

        raise ValueError(
            "Horizon must be 1, 4, 8, or 12 weeks."
        )


    # --------------------------------------------------------
    # Get historical entity
    # --------------------------------------------------------

    entity = get_entity_history(
        store,
        department
    )


    if entity.empty:

        raise ValueError(
            f"No historical data found for "
            f"Store {store}, Department {department}."
        )


    if len(entity) < 8:

        raise ValueError(
            f"Not enough historical data for "
            f"Store {store}, Department {department}."
        )


    # --------------------------------------------------------
    # Store information
    # --------------------------------------------------------

    store_type = entity[
        "Type"
    ].iloc[-1]


    store_size = entity[
        "Size"
    ].iloc[-1]


    # --------------------------------------------------------
    # Historical sales
    # --------------------------------------------------------

    sales_history = list(
        entity[
            "Weekly_Sales"
        ].astype(float)
    )


    # --------------------------------------------------------
    # Last historical date
    # --------------------------------------------------------

    last_date = (
        entity["Date"]
        .max()
    )


    # --------------------------------------------------------
    # Store history
    # --------------------------------------------------------

    store_history = history[
        history["Store"] == store
    ]


    # --------------------------------------------------------
    # Department history
    # --------------------------------------------------------

    department_history = history[
        history["Dept"] == department
    ]


    # --------------------------------------------------------
    # Forecast results
    # --------------------------------------------------------

    forecasts = []


    # ========================================================
    # RECURSIVE FORECASTING
    # ========================================================

    for step in range(
        1,
        horizon + 1
    ):

        # ----------------------------------------------------
        # Future date
        # ----------------------------------------------------

        future_date = (

            last_date

            +

            pd.Timedelta(
                weeks=step
            )
        )


        year = (
            future_date.year
        )


        month = (
            future_date.month
        )


        week = int(
            future_date
            .isocalendar()
            .week
        )


        quarter = (
            future_date.quarter
        )


        # ----------------------------------------------------
        # Future holiday
        # ----------------------------------------------------
        #
        # Currently defaulted to 0.
        # We can later connect a holiday calendar.
        # ----------------------------------------------------

        is_holiday = 0


        # ----------------------------------------------------
        # LAGS
        # ----------------------------------------------------

        lag_1 = sales_history[-1]

        lag_2 = sales_history[-2]

        lag_4 = sales_history[-4]

        lag_8 = sales_history[-8]


        # ----------------------------------------------------
        # ROLLING FEATURES
        # ----------------------------------------------------

        rolling_4 = np.mean(
            sales_history[-4:]
        )


        rolling_8 = np.mean(
            sales_history[-8:]
        )


        rolling_12 = np.mean(
            sales_history[-12:]
        )


        # ----------------------------------------------------
        # AGGREGATE FEATURES
        # ----------------------------------------------------

        store_average = (
            store_history[
                "Weekly_Sales"
            ].mean()
        )


        department_average = (
            department_history[
                "Weekly_Sales"
            ].mean()
        )


        store_department_average = (
            np.mean(
                sales_history
            )
        )


        # ----------------------------------------------------
        # BUILD FORECAST ROW
        # ----------------------------------------------------

        forecast_row = {

            "Store":
                store,

            "Dept":
                department,

            "Type":
                store_type,

            "Size":
                store_size,

            "Year":
                year,

            "Month":
                month,

            "Week":
                week,

            "Quarter":
                quarter,

            "IsHoliday":
                is_holiday,

            "Lag_1":
                lag_1,

            "Lag_2":
                lag_2,

            "Lag_4":
                lag_4,

            "Lag_8":
                lag_8,

            "Rolling_Mean_4":
                rolling_4,

            "Rolling_Mean_8":
                rolling_8,

            "Rolling_Mean_12":
                rolling_12,

            "Store_Average_Sales":
                store_average,

            "Department_Average_Sales":
                department_average,

            "StoreDept_Average_Sales":
                store_department_average
        }


        # ----------------------------------------------------
        # PREPARE MODEL INPUT
        # ----------------------------------------------------

        input_data = prepare_model_input(
            forecast_row
        )


        # ----------------------------------------------------
        # PREDICT
        # ----------------------------------------------------

        prediction = (
            model.predict(
                input_data
            )[0]
        )


        prediction = max(
            0,
            float(prediction)
        )


        # ----------------------------------------------------
        # RECURSIVE UPDATE
        # ----------------------------------------------------

        sales_history.append(
            prediction
        )


        # ----------------------------------------------------
        # SAVE RESULT
        # ----------------------------------------------------

        forecasts.append(
            {

                "week_number":
                    step,

                "date":
                    future_date.strftime(
                        "%Y-%m-%d"
                    ),

                "forecast":
                    round(
                        prediction,
                        2
                    )
            }
        )


    # ========================================================
    # RETURN
    # ========================================================

    return pd.DataFrame(
        forecasts
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        "BUSINESS SALES FORECASTING ENGINE"
    )

    print(
        "==========================================\n"
    )


    STORE = 1

    DEPARTMENT = 1

    HORIZON = 4


    result = forecast_sales(

        store=STORE,

        department=DEPARTMENT,

        horizon=HORIZON
    )


    print(
        "Forecast Result:\n"
    )


    print(
        result.to_string(
            index=False
        )
    )


    total_sales = (
        result[
            "forecast"
        ].sum()
    )


    average_sales = (
        result[
            "forecast"
        ].mean()
    )


    print(
        "\nTotal Expected Sales: ₹",
        round(
            total_sales,
            2
        )
    )


    print(
        "Average Weekly Sales: ₹",
        round(
            average_sales,
            2
        )
    )


    print(
        "\nForecast completed!"
    )