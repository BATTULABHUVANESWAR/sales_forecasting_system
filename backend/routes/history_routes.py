from flask import Blueprint, jsonify

from backend.database.database import (
    get_forecast_history,
    get_forecast_by_id,
    delete_forecast
)

from backend.auth_utils import (
    get_current_user_id
)


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

    user_id = get_current_user_id()

    if user_id is None:

        return jsonify({
            "success": False,
            "error": "Authentication required."
        }), 401

    records = get_forecast_history(
        user_id
    )

    return jsonify({
        "success": True,
        "history": records
    })


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

    user_id = get_current_user_id()

    if user_id is None:

        return jsonify({
            "success": False,
            "error": "Authentication required."
        }), 401

    result = get_forecast_by_id(
        forecast_id,
        user_id
    )

    if result is None:

        return jsonify({
            "success": False,
            "error": "Forecast not found."
        }), 404

    return jsonify({
        "success": True,
        "forecast": result
    })


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

    user_id = get_current_user_id()

    if user_id is None:

        return jsonify({
            "success": False,
            "error": "Authentication required."
        }), 401

    deleted = delete_forecast(
        forecast_id,
        user_id
    )

    if not deleted:

        return jsonify({
            "success": False,
            "error": "Forecast not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Forecast deleted successfully."
    })