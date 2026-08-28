import jwt
import os

from flask import request


SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "change-this-secret-key"
)


# ============================================================
# GET LOGGED-IN USER ID
# ============================================================

def get_current_user_id():

    header = request.headers.get(
        "Authorization",
        ""
    )

    if not header.startswith("Bearer "):

        return None

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

        return payload.get(
            "user_id"
        )

    except Exception:

        return None