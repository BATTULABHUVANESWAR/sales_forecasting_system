from flask import Blueprint, jsonify

from backend.database.database import (
    get_forecast_history,
    get_forecast_by_id,
    delete_forecast
)


# ============================================================
# BLUEPRINT
# ============================================================

history_bp = Blueprint(
    "history",
    __name__,
    url_prefix="/api/history"
)


# ============================================================
# GET HISTORY
# ============================================================

@history_bp.route(
    "",
    methods=["GET"]
)
def history():

    records = (
        get_forecast_history()
    )


    return jsonify(
        {
            "success": True,

            "history":
                records
        }
    )


# ============================================================
# GET SINGLE FORECAST
# ============================================================

@history_bp.route(
    "/<int:forecast_id>",
    methods=["GET"]
)
def single_forecast(
    forecast_id
):

    result = (
        get_forecast_by_id(
            forecast_id
        )
    )


    if result is None:

        return jsonify(
            {
                "success": False,

                "error":
                    "Forecast not found."
            }
        ), 404


    return jsonify(
        {
            "success": True,

            "forecast":
                result
        }
    )


# ============================================================
# DELETE FORECAST
# ============================================================

@history_bp.route(
    "/<int:forecast_id>",
    methods=["DELETE"]
)
def remove_forecast(
    forecast_id
):

    deleted = (
        delete_forecast(
            forecast_id
        )
    )


    if not deleted:

        return jsonify(
            {
                "success": False,

                "error":
                    "Forecast not found."
            }
        ), 404


    return jsonify(
        {
            "success": True,

            "message":
                "Forecast deleted successfully."
        }
    )