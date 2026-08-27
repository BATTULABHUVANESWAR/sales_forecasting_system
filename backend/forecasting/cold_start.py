import pandas as pd
import numpy as np
from pathlib import Path

from huggingface_hub import hf_hub_download
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
# HUGGING FACE RUNTIME DATA
# ============================================================

HF_REPO_ID = (
    "Bhuvi18/business-sales-forecast-models"
)

HF_DATA_FILENAME = (
    "forecasting_history.csv"
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
# LOAD HISTORICAL DATA FROM HUGGING FACE
# ============================================================

def load_historical_data():

    # Use local cached copy if available.
    if LOCAL_DATA_PATH.exists():

        print(
            f"Loading historical data from local cache: "
            f"{LOCAL_DATA_PATH}"
        )

        return pd.read_csv(
            LOCAL_DATA_PATH,
            dtype={
                "Store": "int16",
                "Dept": "int16",
                "Weekly_Sales": "float32",
                "Size": "int32",
                "Type": "category",
            },
            parse_dates=["Date"],
        )


    print(
        "Historical data not found locally."
    )

    print(
        "Downloading forecasting_history.csv "
        "from Hugging Face:"
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
        downloaded_path,
        dtype={
            "Store": "int16",
            "Dept": "int16",
            "Weekly_Sales": "float32",
            "Size": "int32",
            "Type": "category",
        },
        parse_dates=["Date"],
    )


history = load_historical_data()


# ============================================================
# HELPER
# ============================================================

def safe_mean(series):

    values = pd.to_numeric(
        series,
        errors="coerce"
    ).dropna()

    if len(values) == 0:
        return 0.0

    return float(values.mean())


# ============================================================
# NEW DEPARTMENT — EXISTING STORE
# ============================================================

def forecast_new_department(
    store,
    department,
    horizon=4
):
    """
    Estimate sales for a department that does not
    have sufficient historical sales inside an existing store.

    Strategy:
        1. Find the store's historical departments.
        2. Calculate their typical demand.
        3. Find the target department's historical demand
           across other stores if available.
        4. Combine the two signals.
    """

    if horizon not in [1, 4, 8, 12]:

        raise ValueError(
            "Horizon must be 1, 4, 8, or 12 weeks."
        )


    # --------------------------------------------------------
    # Store history
    # --------------------------------------------------------

    store_data = history[
        history["Store"] == store
    ].copy()


    if store_data.empty:

        raise ValueError(
            f"Store {store} does not exist."
        )


    # --------------------------------------------------------
    # Target department across all stores
    # --------------------------------------------------------

    department_data = history[
        history["Dept"] == department
    ].copy()


    # --------------------------------------------------------
    # Store-level baseline
    # --------------------------------------------------------

    store_average = safe_mean(
        store_data["Weekly_Sales"]
    )


    # --------------------------------------------------------
    # Department-level baseline
    # --------------------------------------------------------

    if not department_data.empty:

        department_average = safe_mean(
            department_data["Weekly_Sales"]
        )

    else:

        department_average = store_average


    # --------------------------------------------------------
    # Existing departments inside store
    # --------------------------------------------------------

    department_means = (
        store_data
        .groupby("Dept")["Weekly_Sales"]
        .mean()
    )


    if len(department_means) > 0:

        store_department_baseline = safe_mean(
            department_means
        )

    else:

        store_department_baseline = store_average


    # --------------------------------------------------------
    # Combine signals
    # --------------------------------------------------------

    baseline = np.mean(
        [
            store_department_baseline,
            department_average
        ]
    )


    baseline = max(
        0,
        baseline
    )


    # --------------------------------------------------------
    # Generate simple horizon forecast
    # --------------------------------------------------------

    forecasts = []

    last_date = history["Date"].max()


    for week in range(
        1,
        horizon + 1
    ):

        future_date = (
            last_date
            +
            pd.Timedelta(
                weeks=week
            )
        )


        # Small seasonal adjustment using
        # historical month averages when possible.

        month = future_date.month


        monthly_data = department_data[
            department_data["Date"].dt.month == month
        ]


        if not monthly_data.empty:

            seasonal_average = safe_mean(
                monthly_data["Weekly_Sales"]
            )

            prediction = np.mean(
                [
                    baseline,
                    seasonal_average
                ]
            )

        else:

            prediction = baseline


        forecasts.append(
            {
                "week_number":
                    week,

                "date":
                    future_date.strftime(
                        "%Y-%m-%d"
                    ),

                "forecast":
                    round(
                        max(
                            0,
                            prediction
                        ),
                        2
                    )
            }
        )


    return pd.DataFrame(
        forecasts
    )


# ============================================================
# NEW STORE
# ============================================================

def forecast_new_store(
    store_type,
    store_size,
    department,
    horizon=4
):
    """
    Estimate sales for a new store that has no historical sales.

    Comparable stores are selected using:
        - Store Type
        - Store Size
        - Department
    """

    if horizon not in [1, 4, 8, 12]:

        raise ValueError(
            "Horizon must be 1, 4, 8, or 12 weeks."
        )


    # --------------------------------------------------------
    # Department history
    # --------------------------------------------------------

    department_data = history[
        history["Dept"] == department
    ].copy()


    # --------------------------------------------------------
    # First preference:
    # Same store type + department
    # --------------------------------------------------------

    comparable = department_data[
        department_data["Type"] == store_type
    ].copy()


    # --------------------------------------------------------
    # If no matching type,
    # use department across all stores
    # --------------------------------------------------------

    if comparable.empty:

        comparable = department_data.copy()


    # --------------------------------------------------------
    # Size similarity
    # --------------------------------------------------------

    if not comparable.empty:

        comparable = comparable.copy()

        comparable["Size_Difference"] = (
            abs(
                comparable["Size"]
                - store_size
            )
        )


        # Keep the closest 10% of observations
        # by store size, with at least one observation.

        number_to_keep = max(
            1,
            int(
                len(comparable) * 0.10
            )
        )


        comparable = (
            comparable
            .sort_values(
                "Size_Difference"
            )
            .head(
                number_to_keep
            )
        )


    # --------------------------------------------------------
    # Calculate baseline
    # --------------------------------------------------------

    if not comparable.empty:

        baseline = safe_mean(
            comparable["Weekly_Sales"]
        )

    else:

        # Absolute fallback:
        # overall sales average.

        baseline = safe_mean(
            history["Weekly_Sales"]
        )


    baseline = max(
        0,
        baseline
    )


    # --------------------------------------------------------
    # Generate forecast
    # --------------------------------------------------------

    forecasts = []

    last_date = history["Date"].max()


    for week in range(
        1,
        horizon + 1
    ):

        future_date = (
            last_date
            +
            pd.Timedelta(
                weeks=week
            )
        )


        month = future_date.month


        monthly_comparable = comparable[
            comparable["Date"].dt.month == month
        ]


        if not monthly_comparable.empty:

            prediction = safe_mean(
                monthly_comparable[
                    "Weekly_Sales"
                ]
            )

        else:

            prediction = baseline


        forecasts.append(
            {
                "week_number":
                    week,

                "date":
                    future_date.strftime(
                        "%Y-%m-%d"
                    ),

                "forecast":
                    round(
                        max(
                            0,
                            prediction
                        ),
                        2
                    )
            }
        )


    return pd.DataFrame(
        forecasts
    )


# ============================================================
# UNIFIED COLD-START FUNCTION
# ============================================================

def cold_start_forecast(
    store=None,
    department=None,
    store_type=None,
    store_size=None,
    new_store=False,
    new_department=False,
    horizon=4
):
    """
    Unified cold-start entry point.

    Examples:

        New department:
            new_department=True

        New store:
            new_store=True
    """

    if new_store:

        if store_type is None:
            raise ValueError(
                "Store type is required for a new store."
            )

        if store_size is None:
            raise ValueError(
                "Store size is required for a new store."
            )

        if department is None:
            raise ValueError(
                "Department is required for a new store."
            )


        return forecast_new_store(
            store_type=store_type,
            store_size=store_size,
            department=department,
            horizon=horizon
        )


    if new_department:

        if store is None:
            raise ValueError(
                "Existing store is required for a new department."
            )

        if department is None:
            raise ValueError(
                "Department is required."
            )


        return forecast_new_department(
            store=store,
            department=department,
            horizon=horizon
        )


    raise ValueError(
        "Specify either new_store=True "
        "or new_department=True."
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        "COLD-START FORECASTING"
    )

    print(
        "==========================================\n"
    )


    # --------------------------------------------------------
    # TEST 1 — New Department
    # --------------------------------------------------------

    print(
        "TEST 1: NEW DEPARTMENT"
    )

    print(
        "Existing Store: 1"
    )

    print(
        "Department: 10"
    )


    result_department = (
        cold_start_forecast(
            store=1,
            department=10,
            new_department=True,
            horizon=4
        )
    )


    print(
        result_department.to_string(
            index=False
        )
    )


    # --------------------------------------------------------
    # TEST 2 — New Store
    # --------------------------------------------------------

    print(
        "\nTEST 2: NEW STORE"
    )

    print(
        "Store Type: A"
    )

    print(
        "Store Size: 150000"
    )

    print(
        "Department: 1"
    )


    result_store = (
        cold_start_forecast(
            store_type="A",
            store_size=150000,
            department=1,
            new_store=True,
            horizon=4
        )
    )


    print(
        result_store.to_string(
            index=False
        )
    )


    print(
        "\nCold-start testing completed!"
    )