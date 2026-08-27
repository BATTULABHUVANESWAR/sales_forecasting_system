from flask import Blueprint, jsonify

import pandas as pd

from pathlib import Path


# ============================================================
# BLUEPRINT
# ============================================================

store_bp = Blueprint(
    "stores",
    __name__,
    url_prefix="/api/stores"
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
# LOAD STORE MASTER
# ============================================================

store_master = pd.read_csv(
    MASTER_DATA
    / "store_master.csv"
)


# ============================================================
# GET ALL STORES
# ============================================================

@store_bp.route(
    "",
    methods=["GET"]
)
def get_stores():

    stores = []

    for _, row in store_master.iterrows():

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
                    )
            }
        )

    return jsonify(
        {
            "success": True,
            "stores": stores
        }
    )