from flask import Flask, jsonify
from flask_cors import CORS


# ============================================================
# ROUTES
# ============================================================

from backend.routes.store_routes import (
    store_bp
)

from backend.routes.department_routes import (
    department_bp
)

from backend.routes.forecasting_routes import (
    forecasting_bp
)

from backend.routes.analytics_routes import (
    analytics_bp
)

from backend.routes.history_routes import (
    history_bp
)


# ============================================================
# APPLICATION
# ============================================================

app = Flask(
    __name__
)

CORS(
    app
)


# ============================================================
# REGISTER BLUEPRINTS
# ============================================================

app.register_blueprint(
    store_bp
)

app.register_blueprint(
    department_bp
)

app.register_blueprint(
    forecasting_bp
)

app.register_blueprint(
    analytics_bp
)

app.register_blueprint(
    history_bp
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify(
        {
            "success": True,

            "status": "ok",

            "message":
                "Business Sales Forecasting API is running"
        }
    )


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        " BUSINESS SALES & DEMAND FORECASTING API"
    )

    print(
        "=========================================="
    )

    print(
        "\nServer:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print(
        "\nAvailable endpoints:"
    )

    print(
        "GET    /api/health"
    )

    print(
        "GET    /api/stores"
    )

    print(
        "GET    /api/departments"
    )

    print(
        "POST   /api/forecast"
    )

    print(
        "GET    /api/analytics/overview"
    )

    print(
        "GET    /api/analytics/stores"
    )

    print(
        "GET    /api/analytics/departments"
    )

    print(
        "GET    /api/analytics/store-department"
    )

    print(
        "GET    /api/analytics/trend"
    )

    print(
        "GET    /api/history"
    )

    print(
        "GET    /api/history/<id>"
    )

    print(
        "DELETE /api/history/<id>"
    )

    print(
        "\n==========================================\n"
    )


    app.run(

        host="0.0.0.0",

        port=5000,

        debug=False
    )