import sqlite3

from pathlib import Path
from datetime import datetime


# ============================================================
# PROJECT PATHS
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

    connection.row_factory = sqlite3.Row

    # Enable foreign keys
    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


# ============================================================
# INITIALIZE DATABASE
# ============================================================

def initialize_database():

    connection = get_connection()
    cursor = connection.cursor()

    # --------------------------------------------------------
    # Users
    # --------------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT NOT NULL UNIQUE,

            password_hash TEXT NOT NULL,

            created_at TEXT NOT NULL

        )
        """
    )

    # --------------------------------------------------------
    # Forecast master table
    # --------------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS forecasts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER,

            store_id TEXT NOT NULL,

            store_name TEXT NOT NULL,

            department_id TEXT NOT NULL,

            department_name TEXT NOT NULL,

            forecast_type TEXT NOT NULL,

            horizon INTEGER NOT NULL,

            total_expected_sales REAL NOT NULL,

            average_weekly_sales REAL NOT NULL,

            peak_week INTEGER NOT NULL,

            peak_sales REAL NOT NULL,

            lowest_week INTEGER NOT NULL,

            lowest_sales REAL NOT NULL,

            created_at TEXT NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)

        )
        """
    )

    # --------------------------------------------------------
    # Migration for old databases
    # --------------------------------------------------------

    cursor.execute(
        "PRAGMA table_info(forecasts)"
    )

    columns = [
        row["name"]
        for row in cursor.fetchall()
    ]

    if "user_id" not in columns:

        cursor.execute(
            """
            ALTER TABLE forecasts
            ADD COLUMN user_id INTEGER
            """
        )

    # --------------------------------------------------------
    # Individual forecast values
    # --------------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS forecast_values (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            forecast_id INTEGER NOT NULL,

            week_number INTEGER NOT NULL,

            forecast_date TEXT NOT NULL,

            forecast_value REAL NOT NULL,

            FOREIGN KEY (forecast_id)
                REFERENCES forecasts(id)
                ON DELETE CASCADE

        )
        """
    )

    connection.commit()
    connection.close()


# ============================================================
# CREATE USER
# ============================================================

def create_user(
    name,
    email,
    password_hash
):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users (
                name,
                email,
                password_hash,
                created_at
            )

            VALUES (?, ?, ?, ?)
            """,
            (
                str(name),
                str(email),
                str(password_hash),
                datetime.now().isoformat()
            )
        )

        user_id = cursor.lastrowid

        connection.commit()

        return user_id

    except sqlite3.IntegrityError:

        connection.rollback()

        return None

    finally:

        connection.close()


# ============================================================
# GET USER BY EMAIL
# ============================================================

def get_user_by_email(email):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (str(email),)
    )

    user = cursor.fetchone()

    connection.close()

    if user is None:
        return None

    return dict(user)


# ============================================================
# GET USER BY ID
# ============================================================

def get_user_by_id(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
        """,
        (int(user_id),)
    )

    user = cursor.fetchone()

    connection.close()

    if user is None:
        return None

    return dict(user)


# ============================================================
# SAVE FORECAST
# ============================================================

def save_forecast(
    user_id,
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

    created_at = datetime.now().isoformat()

    # --------------------------------------------------------
    # Main forecast
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO forecasts (

            user_id,

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

        VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?
        )
        """,

        (
            int(user_id),

            str(store_id),
            str(store_name),

            str(department_id),
            str(department_name),

            str(forecast_type),
            int(horizon),

            float(
                summary["total_expected_sales"]
            ),

            float(
                summary["average_weekly_sales"]
            ),

            int(
                summary["peak_week"]
            ),

            float(
                summary["peak_sales"]
            ),

            int(
                summary["lowest_week"]
            ),

            float(
                summary["lowest_sales"]
            ),

            created_at
        )
    )

    forecast_id = cursor.lastrowid

    # --------------------------------------------------------
    # Weekly forecast values
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

                int(
                    item["week_number"]
                ),

                str(
                    item["date"]
                ),

                float(
                    item["forecast"]
                )
            )
        )

    connection.commit()
    connection.close()

    return forecast_id


# ============================================================
# GET USER FORECAST HISTORY
# ============================================================

def get_forecast_history(
    user_id,
    limit=50
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *

        FROM forecasts

        WHERE user_id = ?

        ORDER BY created_at DESC

        LIMIT ?
        """,

        (
            int(user_id),
            int(limit)
        )
    )

    rows = cursor.fetchall()

    connection.close()

    return [
        dict(row)
        for row in rows
    ]


# ============================================================
# GET SINGLE USER FORECAST
# ============================================================

def get_forecast_by_id(
    forecast_id,
    user_id
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *

        FROM forecasts

        WHERE id = ?

        AND user_id = ?
        """,

        (
            int(forecast_id),
            int(user_id)
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
            int(forecast_id),
        )
    )

    values = cursor.fetchall()

    connection.close()

    result = dict(forecast)

    result["forecast"] = [
        dict(row)
        for row in values
    ]

    return result


# ============================================================
# DELETE USER FORECAST
# ============================================================

def delete_forecast(
    forecast_id,
    user_id
):

    connection = get_connection()
    cursor = connection.cursor()

    # Weekly values
    cursor.execute(
        """
        DELETE FROM forecast_values

        WHERE forecast_id = ?

        AND forecast_id IN (

            SELECT id
            FROM forecasts
            WHERE id = ?
            AND user_id = ?

        )
        """,

        (
            int(forecast_id),
            int(forecast_id),
            int(user_id)
        )
    )

    # Main forecast
    cursor.execute(
        """
        DELETE FROM forecasts

        WHERE id = ?

        AND user_id = ?
        """,

        (
            int(forecast_id),
            int(user_id)
        )
    )

    deleted = cursor.rowcount > 0

    connection.commit()
    connection.close()

    return deleted


# ============================================================
# INITIALIZE
# ============================================================

initialize_database()