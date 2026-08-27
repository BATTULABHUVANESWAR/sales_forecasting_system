from flask import Blueprint, request, jsonify

import pandas as pd
import numpy as np

from pathlib import Path


# ============================================================
# FORECASTING ENGINE
# ============================================================

from backend.forecasting.forecasting_engine import (
    forecast_sales
)

from backend.forecasting.cold_start import (
    cold_start_forecast
)


# ============================================================
# DATABASE
# ============================================================

from backend.database.database import (
    save_forecast
)


# ============================================================
# BLUEPRINT
# ============================================================

forecasting_bp = Blueprint(
    "forecasting",
    __name__,
    url_prefix="/api/forecast"
)


# ============================================================
# PROJECT PATHS
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


PROCESSED_DATA = (
    PROJECT_ROOT
    / "data"
    / "processed"
)


# ============================================================
# LOAD MASTER DATA
# ============================================================

store_master = pd.read_csv(
    MASTER_DATA
    / "store_master.csv"
)


department_master = pd.read_csv(
    MASTER_DATA
    / "department_master.csv"
)


# ============================================================
# LOAD HISTORICAL DATA
# ============================================================

history = pd.read_csv(
    PROCESSED_DATA
    / "ml_features.csv"
)


# ============================================================
# FIND STORE
# ============================================================

def get_store(
    store_id
):

    result = store_master[
        store_master[
            "store_id"
        ].astype(str)
        ==
        str(store_id)
    ]

    if result.empty:

        return None

    return result.iloc[0]


# ============================================================
# FIND DEPARTMENT
# ============================================================

def get_department(
    department_id
):

    result = department_master[
        department_master[
            "department_id"
        ].astype(str)
        ==
        str(department_id)
    ]

    if result.empty:

        return None

    return result.iloc[0]


# ============================================================
# CHECK STORE + DEPARTMENT HISTORY
# ============================================================

def has_history(
    source_store_id,
    source_department_id
):

    result = history[
        (
            history["Store"]
            ==
            int(source_store_id)
        )
        &
        (
            history["Dept"]
            ==
            int(source_department_id)
        )
    ]

    return len(result) >= 8


# ============================================================
# CHECK STORE HISTORY
# ============================================================

def store_has_history(
    source_store_id
):

    result = history[
        history["Store"]
        ==
        int(source_store_id)
    ]

    return not result.empty


# ============================================================
# FORECAST ENDPOINT
# ============================================================

@forecasting_bp.route(
    "",
    methods=["POST"]
)
def forecast():

    try:

        # ====================================================
        # REQUEST
        # ====================================================

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Request body is required."
                }
            ), 400


        # ====================================================
        # INPUTS
        # ====================================================

        store_id = data.get(
            "store_id"
        )


        department_id = data.get(
            "department_id"
        )


        try:

            horizon = int(
                data.get(
                    "horizon",
                    4
                )
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify(
                {
                    "success": False,

                    "error":
                        "horizon must be an integer."
                }
            ), 400


        # ====================================================
        # VALIDATION
        # ====================================================

        if not store_id:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "store_id is required."
                }
            ), 400


        if not department_id:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "department_id is required."
                }
            ), 400


        if horizon not in [
            1,
            4,
            8,
            12
        ]:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "horizon must be 1, 4, 8, or 12."
                }
            ), 400


        # ====================================================
        # DETERMINE FORECAST SCENARIO
        # ====================================================

        is_new_store = (
            str(store_id).strip().upper() == "NEW"
        )

        is_new_department = (
            str(department_id).strip().upper() == "NEW"
        )

        if is_new_store and is_new_department:

            return jsonify(
                {
                    "success": False,
                    "error":
                        "New store and new department cannot be forecast together in one request."
                }
            ), 400


        # ====================================================
        # NEW STORE
        # ====================================================

        if is_new_store:

            new_store_name = data.get(
                "store_name"
            )

            new_store_type = data.get(
                "store_type"
            )

            new_store_size = data.get(
                "store_size"
            )


            if not new_store_name:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "store_name is required for a new store."
                    }
                ), 400


            if new_store_type not in [
                "A",
                "B",
                "C"
            ]:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "store_type must be A, B, or C."
                    }
                ), 400


            try:

                new_store_size = float(
                    new_store_size
                )

            except (
                TypeError,
                ValueError
            ):

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "store_size must be a valid number."
                    }
                ), 400


            if new_store_size <= 0:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "store_size must be greater than zero."
                    }
                ), 400


            # A new store still needs an existing department
            # whose historical demand can be used by the
            # cold-start strategy.

            department = get_department(
                department_id
            )


            if department is None:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "Department not found."
                    }
                ), 404


            source_department = int(
                department[
                    "source_department_id"
                ]
            )


            result = cold_start_forecast(

                store_type=
                    new_store_type,

                store_size=
                    new_store_size,

                department=
                    source_department,

                new_store=True,

                horizon=
                    horizon
            )


            forecast_type = (
                "cold_start_new_store"
            )


            # Temporary business-facing store object.
            # It is intentionally not added to store_master.csv.

            store = {

                "store_id":
                    "NEW",

                "store_name":
                    str(
                        new_store_name
                    ),

                "store_type":
                    str(
                        new_store_type
                    ),

                "store_size":
                    new_store_size

            }


        # ====================================================
        # NEW DEPARTMENT
        # ====================================================

        elif is_new_department:

            new_department_name = data.get(
                "department_name"
            )

            new_department_category = data.get(
                "department_category"
            )


            if not new_department_name:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "department_name is required for a new department."
                    }
                ), 400


            if not new_department_category:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "department_category is required for a new department."
                    }
                ), 400


            # The store must already exist.

            store = get_store(
                store_id
            )


            if store is None:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "Store not found."
                    }
                ), 404


            source_store = int(
                store[
                    "source_store_id"
                ]
            )


            # Find an existing department from the same
            # business category to act as the historical
            # demand reference for the cold-start strategy.

            category_matches = (
                department_master[
                    department_master[
                        "department_category"
                    ].astype(str).str.strip()
                    ==
                    str(
                        new_department_category
                    ).strip()
                ]
            )


            if category_matches.empty:

                representative_department = (
                    department_master.iloc[0]
                )

            else:

                representative_department = (
                    category_matches.iloc[0]
                )


            source_department = int(
                representative_department[
                    "source_department_id"
                ]
            )


            result = cold_start_forecast(

                store=
                    source_store,

                department=
                    source_department,

                new_department=True,

                horizon=
                    horizon
            )


            forecast_type = (
                "cold_start_new_department"
            )


            # Temporary business-facing department object.
            # It is intentionally not added to department_master.csv.

            department = {

                "department_id":
                    "NEW",

                "department_name":
                    str(
                        new_department_name
                    ),

                "department_category":
                    str(
                        new_department_category
                    )

            }


        # ====================================================
        # EXISTING STORE + EXISTING DEPARTMENT
        # ====================================================

        else:

            store = get_store(
                store_id
            )


            if store is None:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "Store not found."
                    }
                ), 404


            department = get_department(
                department_id
            )


            if department is None:

                return jsonify(
                    {
                        "success": False,
                        "error":
                            "Department not found."
                    }
                ), 404


            source_store = int(
                store[
                    "source_store_id"
                ]
            )


            source_department = int(
                department[
                    "source_department_id"
                ]
            )


            established = has_history(
                source_store,
                source_department
            )


            # ------------------------------------------------
            # Existing Store + Existing Department
            # ------------------------------------------------

            if established:

                result = forecast_sales(

                    store=
                        source_store,

                    department=
                        source_department,

                    horizon=
                        horizon
                )


                forecast_type = (
                    "historical_ml"
                )


            # ------------------------------------------------
            # Existing Store + No Department History
            # ------------------------------------------------

            else:

                existing_store = (
                    store_has_history(
                        source_store
                    )
                )


                if existing_store:

                    result = cold_start_forecast(

                        store=
                            source_store,

                        department=
                            source_department,

                        new_department=True,

                        horizon=
                            horizon
                    )


                    forecast_type = (
                        "cold_start_new_department"
                    )


                # ------------------------------------------------
                # Existing master store with no history at all
                # ------------------------------------------------

                else:

                    result = cold_start_forecast(

                        store_type=
                            store[
                                "store_type"
                            ],

                        store_size=float(
                            store[
                                "store_size"
                            ]
                        ),

                        department=
                            source_department,

                        new_store=True,

                        horizon=
                            horizon
                    )


                    forecast_type = (
                        "cold_start_new_store"
                    )

        # ====================================================
        # NORMALIZE RESULT
        # ====================================================

        if isinstance(
            result,
            pd.DataFrame
        ):

            forecast_records = (
                result.to_dict(
                    orient="records"
                )
            )

        else:

            forecast_records = result


        if not forecast_records:

            return jsonify(
                {
                    "success": False,

                    "error":
                        "Forecast generation returned no results."
                }
            ), 500


        # ====================================================
        # CLEAN FORECAST RECORDS
        # ====================================================

        clean_forecast_records = []


        for item in forecast_records:

            clean_forecast_records.append(
                {
                    "week_number":
                        int(
                            item[
                                "week_number"
                            ]
                        ),

                    "date":
                        str(
                            item[
                                "date"
                            ]
                        ),

                    "forecast":
                        float(
                            item[
                                "forecast"
                            ]
                        )
                }
            )


        # ====================================================
        # VALUES
        # ====================================================

        values = [

            item["forecast"]

            for item
            in clean_forecast_records
        ]


        # ====================================================
        # SUMMARY
        # ====================================================

        total_sales = sum(
            values
        )


        average_sales = (
            total_sales
            /
            len(values)
            if values
            else 0
        )


        peak_index = int(
            np.argmax(
                values
            )
        )


        lowest_index = int(
            np.argmin(
                values
            )
        )


        summary = {

            "total_expected_sales":
                float(
                    round(
                        total_sales,
                        2
                    )
                ),

            "average_weekly_sales":
                float(
                    round(
                        average_sales,
                        2
                    )
                ),

            "peak_week":
                int(
                    peak_index + 1
                ),

            "peak_sales":
                float(
                    round(
                        values[
                            peak_index
                        ],
                        2
                    )
                ),

            "lowest_week":
                int(
                    lowest_index + 1
                ),

            "lowest_sales":
                float(
                    round(
                        values[
                            lowest_index
                        ],
                        2
                    )
                )
        }


        # ====================================================
        # SAVE FORECAST
        # ====================================================

        forecast_id = save_forecast(

            store_id=str(
                store[
                    "store_id"
                ]
            ),

            store_name=str(
                store[
                    "store_name"
                ]
            ),

            department_id=str(
                department[
                    "department_id"
                ]
            ),

            department_name=str(
                department[
                    "department_name"
                ]
            ),

            forecast_type=str(
                forecast_type
            ),

            horizon=int(
                horizon
            ),

            forecast_records=
                clean_forecast_records,

            summary=summary
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify(
            {

                "success": True,

                "forecast_id":
                    int(
                        forecast_id
                    ),

                "forecast_type":
                    str(
                        forecast_type
                    ),

                "store": {

                    "id":
                        str(
                            store[
                                "store_id"
                            ]
                        ),

                    "name":
                        str(
                            store[
                                "store_name"
                            ]
                        ),

                    "type":
                        str(
                            store[
                                "store_type"
                            ]
                        ),

                    "size":
                        int(
                            store[
                                "store_size"
                            ]
                        )
                },

                "department": {

                    "id":
                        str(
                            department[
                                "department_id"
                            ]
                        ),

                    "name":
                        str(
                            department[
                                "department_name"
                            ]
                        ),

                    "category":
                        str(
                            department[
                                "department_category"
                            ]
                        )
                },

                "horizon":
                    int(
                        horizon
                    ),

                "forecast":
                    clean_forecast_records,

                "summary":
                    summary
            }
        )


    # ========================================================
    # ERRORS
    # ========================================================

    except ValueError as error:

        return jsonify(
            {
                "success": False,

                "error":
                    str(error)
            }
        ), 400


    except Exception as error:

        print(
            "\nSERVER ERROR:"
        )

        print(
            repr(error)
        )


        return jsonify(
            {
                "success": False,

                "error":
                    "Internal server error.",

                "details":
                    str(error)
            }
        ), 500