import jwt
import os

from functools import wraps
from flask import request, jsonify


SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "change-this-secret-key"
)


def token_required(function):

    @wraps(function)
    def decorated(*args, **kwargs):

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

            user_id = payload.get(
                "user_id"
            )

            if not user_id:

                raise Exception()


        except jwt.ExpiredSignatureError:

            return jsonify({
                "success": False,
                "error": "Token has expired. Please login again."
            }), 401


        except Exception:

            return jsonify({
                "success": False,
                "error": "Invalid authentication token."
            }), 401


        return function(
            user_id,
            *args,
            **kwargs
        )


    return decorated