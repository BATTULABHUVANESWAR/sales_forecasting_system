from flask import Blueprint, request, jsonify

import jwt
import os

from datetime import datetime, timedelta

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from backend.database.database import (
    create_user,
    get_user_by_email,
    get_user_by_id
)


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "change-this-secret-key"
)


# ============================================================
# REGISTER
# ============================================================

@auth_bp.route(
    "/register",
    methods=["POST"]
)
def register():

    data = request.get_json() or {}

    name = str(
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    if not name or not email or not password:

        return jsonify({
            "success": False,
            "error": "Name, email and password are required."
        }), 400


    if len(password) < 6:

        return jsonify({
            "success": False,
            "error": "Password must contain at least 6 characters."
        }), 400


    password_hash = generate_password_hash(
        password
    )


    user_id = create_user(
        name,
        email,
        password_hash
    )


    if user_id is None:

        return jsonify({
            "success": False,
            "error": "An account with this email already exists."
        }), 409


    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json() or {}

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )


    user = get_user_by_email(
        email
    )


    if user is None:

        return jsonify({
            "success": False,
            "error": "Invalid email or password."
        }), 401


    if not check_password_hash(
        user["password_hash"],
        password
    ):

        return jsonify({
            "success": False,
            "error": "Invalid email or password."
        }), 401


    token = jwt.encode(
        {
            "user_id": user["id"],
            "exp": datetime.utcnow()
                    + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm="HS256"
    )


    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })


# ============================================================
# CURRENT USER
# ============================================================

@auth_bp.route(
    "/me",
    methods=["GET"]
)
def me():

    header = request.headers.get(
        "Authorization",
        ""
    )


    if not header.startswith("Bearer "):

        return jsonify({
            "success": False,
            "error": "Authentication required."
        }), 401


    token = header.split(
        " ",
        1
    )[1]


    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user = get_user_by_id(
            payload["user_id"]
        )


        if user is None:

            raise Exception()


        return jsonify({
            "success": True,
            "user": user
        })


    except Exception:

        return jsonify({
            "success": False,
            "error": "Invalid or expired token."
        }), 401