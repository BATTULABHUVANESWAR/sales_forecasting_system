import sqlite3

from pathlib import Path
from datetime import datetime


# ============================================================
# PROJECT PATH
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

DATABASE_DIR = (
    PROJECT_ROOT
    / "data"
    / "database"
)

DATABASE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


DATABASE_PATH = (
    DATABASE_DIR
    / "forecast_history.db"
)


# ============================================================
# DATABASE CONNECTION
# ============================================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = (
        sqlite3.Row
    )

    return connection


# ============================================================
# INITIALIZE DATABASE
# ============================================================

def initialize_database():

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS forecasts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            store_id TEXT NOT NULL,

            store_name TEXT NOT NULL,

            department_id TEXT NOT NULL,

            department_name TEXT NOT NULL,

            forecast_type TEXT NOT NULL,

            horizon INTEGER NOT NULL,

            total_expected_sales REAL,

            average_weekly_sales REAL,

            peak_week INTEGER,

            peak_sales REAL,

            lowest_week INTEGER,

            lowest_sales REAL,

            created_at TEXT NOT NULL

        )
        """
    )


    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS forecast_values (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            forecast_id INTEGER NOT NULL,

            week_number INTEGER NOT NULL,

            forecast_date TEXT NOT NULL,

            forecast_value REAL NOT NULL,

            FOREIGN KEY (
                forecast_id
            )
            REFERENCES forecasts(id)

        )
        """
    )


    connection.commit()

    connection.close()


# ============================================================
# SAVE FORECAST
# ============================================================

def save_forecast(
    store_id,
    store_name,
    department_id,
    department_name,
    forecast_type,
    horizon,
    forecast_records,
    summary
):

    connection = get_connection()

    cursor = connection.cursor()


    created_at = (
        datetime.now()
        .isoformat()
    )


    # --------------------------------------------------------
    # Main forecast record
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO forecasts (

            store_id,
            store_name,
            department_id,
            department_name,
            forecast_type,
            horizon,
            total_expected_sales,
            average_weekly_sales,
            peak_week,
            peak_sales,
            lowest_week,
            lowest_sales,
            created_at

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,

        (
            store_id,
            store_name,
            department_id,
            department_name,
            forecast_type,
            horizon,

            summary[
                "total_expected_sales"
            ],

            summary[
                "average_weekly_sales"
            ],

            summary[
                "peak_week"
            ],

            summary[
                "peak_sales"
            ],

            summary[
                "lowest_week"
            ],

            summary[
                "lowest_sales"
            ],

            created_at
        )
    )


    forecast_id = (
        cursor.lastrowid
    )


    # --------------------------------------------------------
    # Individual forecast values
    # --------------------------------------------------------

    for item in forecast_records:

        cursor.execute(
            """
            INSERT INTO forecast_values (

                forecast_id,
                week_number,
                forecast_date,
                forecast_value

            )

            VALUES (?, ?, ?, ?)
            """,

            (
                forecast_id,

                item[
                    "week_number"
                ],

                item[
                    "date"
                ],

                item[
                    "forecast"
                ]
            )
        )


    connection.commit()

    connection.close()


    return forecast_id


# ============================================================
# GET FORECAST HISTORY
# ============================================================

def get_forecast_history(
    limit=50
):

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *

        FROM forecasts

        ORDER BY created_at DESC

        LIMIT ?
        """,

        (
            limit,
        )
    )


    rows = cursor.fetchall()

    connection.close()


    return [
        dict(row)
        for row in rows
    ]


# ============================================================
# GET SINGLE FORECAST
# ============================================================

def get_forecast_by_id(
    forecast_id
):

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *

        FROM forecasts

        WHERE id = ?
        """,

        (
            forecast_id,
        )
    )


    forecast = cursor.fetchone()


    if forecast is None:

        connection.close()

        return None


    cursor.execute(
        """
        SELECT *

        FROM forecast_values

        WHERE forecast_id = ?

        ORDER BY week_number
        """,

        (
            forecast_id,
        )
    )


    values = cursor.fetchall()


    connection.close()


    result = dict(
        forecast
    )


    result[
        "forecast"
    ] = [
        dict(row)
        for row in values
    ]


    return result


# ============================================================
# DELETE FORECAST
# ============================================================

def delete_forecast(
    forecast_id
):

    connection = get_connection()

    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM forecast_values

        WHERE forecast_id = ?
        """,

        (
            forecast_id,
        )
    )


    cursor.execute(
        """
        DELETE FROM forecasts

        WHERE id = ?
        """,

        (
            forecast_id,
        )
    )


    deleted = (
        cursor.rowcount
        > 0
    )


    connection.commit()

    connection.close()


    return deleted


# ============================================================
# INITIALIZE WHEN MODULE LOADS
# ============================================================

initialize_database()