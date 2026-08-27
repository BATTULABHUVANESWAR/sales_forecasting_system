from flask import Blueprint, jsonify

import pandas as pd

from pathlib import Path


# ============================================================
# BLUEPRINT
# ============================================================

department_bp = Blueprint(
    "departments",
    __name__,
    url_prefix="/api/departments"
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
# LOAD DEPARTMENT MASTER
# ============================================================

department_master = pd.read_csv(
    MASTER_DATA
    / "department_master.csv"
)


# ============================================================
# GET ALL DEPARTMENTS
# ============================================================

@department_bp.route(
    "",
    methods=["GET"]
)
def get_departments():

    departments = []

    for _, row in department_master.iterrows():

        departments.append(
            {
                "department_id":
                    str(
                        row["department_id"]
                    ),

                "department_name":
                    str(
                        row["department_name"]
                    ),

                "department_category":
                    str(
                        row["department_category"]
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