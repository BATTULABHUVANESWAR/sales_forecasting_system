from flask import Blueprint, jsonify

from backend.auth import token_required

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
@token_required
def history(user_id):

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
@token_required
def single_forecast(
    user_id,
    forecast_id
):

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
@token_required
def remove_forecast(
    user_id,
    forecast_id
):

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