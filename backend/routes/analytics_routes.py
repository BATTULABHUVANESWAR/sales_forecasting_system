from flask import Blueprint, jsonify

import pandas as pd

from pathlib import Path

from huggingface_hub import hf_hub_download


# ============================================================
# BLUEPRINT
# ============================================================

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics"
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

MASTER_DATA = (
    PROJECT_ROOT
    / "data"
    / "master"
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
# LOAD DATA
# ============================================================

def load_historical_data():

    # Use local cache when available.
    if LOCAL_DATA_PATH.exists():

        print(
            f"Loading forecasting history from local cache: "
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
        "Forecasting history not found locally."
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
        f"Forecasting history downloaded to: "
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


store_master = pd.read_csv(
    MASTER_DATA
    / "store_master.csv"
)

department_master = pd.read_csv(
    MASTER_DATA
    / "department_master.csv"
)


# ============================================================
# STORE LOOKUP
# ============================================================

store_lookup = (
    store_master[
        [
            "source_store_id",
            "store_id",
            "store_name",
            "store_type",
            "store_size"
        ]
    ]
    .copy()
)

store_lookup[
    "source_store_id"
] = store_lookup[
    "source_store_id"
].astype(int)


# ============================================================
# DEPARTMENT LOOKUP
# ============================================================

department_lookup = (
    department_master[
        [
            "source_department_id",
            "department_id",
            "department_name",
            "department_category"
        ]
    ]
    .copy()
)

department_lookup[
    "source_department_id"
] = department_lookup[
    "source_department_id"
].astype(int)


# ============================================================
# OVERVIEW
# ============================================================

@analytics_bp.route(
    "/overview",
    methods=["GET"]
)
def overview():

    total_sales = float(
        history[
            "Weekly_Sales"
        ].sum()
    )

    average_sales = float(
        history[
            "Weekly_Sales"
        ].mean()
    )

    total_stores = int(
        history[
            "Store"
        ].nunique()
    )

    total_departments = int(
        history[
            "Dept"
        ].nunique()
    )

    return jsonify(
        {
            "success": True,

            "overview": {
                "total_historical_sales":
                    round(
                        total_sales,
                        2
                    ),

                "average_weekly_sales":
                    round(
                        average_sales,
                        2
                    ),

                "total_stores":
                    total_stores,

                "total_departments":
                    total_departments
            }
        }
    )


# ============================================================
# STORE ANALYTICS
# ============================================================

@analytics_bp.route(
    "/stores",
    methods=["GET"]
)
def store_analytics():

    grouped = (
        history
        .groupby("Store")
        .agg(
            total_sales=(
                "Weekly_Sales",
                "sum"
            ),

            average_weekly_sales=(
                "Weekly_Sales",
                "mean"
            ),

            records=(
                "Weekly_Sales",
                "count"
            )
        )
        .reset_index()
    )


    grouped[
        "Store"
    ] = grouped[
        "Store"
    ].astype(int)


    # --------------------------------------------------------
    # ADD MASTER STORE INFORMATION
    # --------------------------------------------------------

    grouped = grouped.merge(
        store_lookup,
        left_on="Store",
        right_on="source_store_id",
        how="left"
    )


    grouped = grouped.sort_values(
        "total_sales",
        ascending=False
    )


    stores = []


    for _, row in grouped.iterrows():

        stores.append(
            {
                "store_id":
                    str(
                        row["store_id"]
                    ),

                "store_name":
                    str(
                        row["store_name"]
                    ),

                "store_type":
                    str(
                        row["store_type"]
                    ),

                "store_size":
                    int(
                        row["store_size"]
                    ),

                "total_sales":
                    float(
                        round(
                            row["total_sales"],
                            2
                        )
                    ),

                "average_weekly_sales":
                    float(
                        round(
                            row[
                                "average_weekly_sales"
                            ],
                            2
                        )
                    ),

                "records":
                    int(
                        row["records"]
                    )
            }
        )


    return jsonify(
        {
            "success": True,
            "stores": stores
        }
    )


# ============================================================
# DEPARTMENT ANALYTICS
# ============================================================

@analytics_bp.route(
    "/departments",
    methods=["GET"]
)
def department_analytics():

    grouped = (
        history
        .groupby("Dept")
        .agg(
            total_sales=(
                "Weekly_Sales",
                "sum"
            ),

            average_weekly_sales=(
                "Weekly_Sales",
                "mean"
            ),

            records=(
                "Weekly_Sales",
                "count"
            )
        )
        .reset_index()
    )


    grouped[
        "Dept"
    ] = grouped[
        "Dept"
    ].astype(int)


    # --------------------------------------------------------
    # ADD MASTER DEPARTMENT INFORMATION
    # --------------------------------------------------------

    grouped = grouped.merge(
        department_lookup,
        left_on="Dept",
        right_on="source_department_id",
        how="left"
    )


    grouped = grouped.sort_values(
        "total_sales",
        ascending=False
    )


    departments = []


    for _, row in grouped.iterrows():

        departments.append(
            {
                "department_id":
                    str(
                        row[
                            "department_id"
                        ]
                    ),

                "department_name":
                    str(
                        row[
                            "department_name"
                        ]
                    ),

                "department_category":
                    str(
                        row[
                            "department_category"
                        ]
                    ),

                "total_sales":
                    float(
                        round(
                            row[
                                "total_sales"
                            ],
                            2
                        )
                    ),

                "average_weekly_sales":
                    float(
                        round(
                            row[
                                "average_weekly_sales"
                            ],
                            2
                        )
                    ),

                "records":
                    int(
                        row["records"]
                    )
            }
        )


    return jsonify(
        {
            "success": True,

            "departments":
                departments
        }
    )


# ============================================================
# STORE + DEPARTMENT ANALYTICS
# ============================================================

@analytics_bp.route(
    "/store-department",
    methods=["GET"]
)
def store_department_analytics():

    grouped = (
        history
        .groupby(
            [
                "Store",
                "Dept"
            ]
        )
        .agg(
            total_sales=(
                "Weekly_Sales",
                "sum"
            ),

            average_weekly_sales=(
                "Weekly_Sales",
                "mean"
            ),

            records=(
                "Weekly_Sales",
                "count"
            )
        )
        .reset_index()
    )


    grouped[
        "Store"
    ] = grouped[
        "Store"
    ].astype(int)


    grouped[
        "Dept"
    ] = grouped[
        "Dept"
    ].astype(int)


    # --------------------------------------------------------
    # STORE NAMES
    # --------------------------------------------------------

    grouped = grouped.merge(
        store_lookup,
        left_on="Store",
        right_on="source_store_id",
        how="left"
    )


    # --------------------------------------------------------
    # DEPARTMENT NAMES
    # --------------------------------------------------------

    grouped = grouped.merge(
        department_lookup,
        left_on="Dept",
        right_on="source_department_id",
        how="left",
        suffixes=(
            "_store",
            "_department"
        )
    )


    grouped = grouped.sort_values(
        "total_sales",
        ascending=False
    )


    combinations = []


    for _, row in grouped.iterrows():

        combinations.append(
            {
                "store_id":
                    str(
                        row[
                            "store_id"
                        ]
                    ),

                "store_name":
                    str(
                        row[
                            "store_name"
                        ]
                    ),

                "department_id":
                    str(
                        row[
                            "department_id"
                        ]
                    ),

                "department_name":
                    str(
                        row[
                            "department_name"
                        ]
                    ),

                "department_category":
                    str(
                        row[
                            "department_category"
                        ]
                    ),

                "total_sales":
                    float(
                        round(
                            row[
                                "total_sales"
                            ],
                            2
                        )
                    ),

                "average_weekly_sales":
                    float(
                        round(
                            row[
                                "average_weekly_sales"
                            ],
                            2
                        )
                    ),

                "records":
                    int(
                        row["records"]
                    )
            }
        )


    return jsonify(
        {
            "success": True,

            "store_departments":
                combinations
        }
    )


# ============================================================
# SALES TREND
# ============================================================

@analytics_bp.route(
    "/trend",
    methods=["GET"]
)
def sales_trend():

    trend = (
        history
        .groupby("Date")
        ["Weekly_Sales"]
        .sum()
        .reset_index()
    )


    trend[
        "Date"
    ] = pd.to_datetime(
        trend["Date"]
    )


    trend = trend.sort_values(
        "Date"
    )


    # Keep the response manageable
    trend = trend.tail(
        52
    )


    records = []


    for _, row in trend.iterrows():

        records.append(
            {
                "date":
                    row[
                        "Date"
                    ].strftime(
                        "%Y-%m-%d"
                    ),

                "sales":
                    float(
                        round(
                            row[
                                "Weekly_Sales"
                            ],
                            2
                        )
                    )
            }
        )


    return jsonify(
        {
            "success": True,

            "trend":
                records
        }
    )