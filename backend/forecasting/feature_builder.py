import pandas as pd
import numpy as np


# ============================================================
# MODEL FEATURE DEFINITIONS
# ============================================================

FEATURES = [

    # Entity
    "Store",
    "Dept",
    "Type",
    "Size",

    # Calendar
    "Year",
    "Month",
    "Week",
    "Quarter",
    "IsHoliday",

    # Historical demand
    "Lag_1",
    "Lag_2",
    "Lag_4",
    "Lag_8",

    # Rolling demand
    "Rolling_Mean_4",
    "Rolling_Mean_8",
    "Rolling_Mean_12",

    # Aggregate demand context
    "Store_Average_Sales",
    "Department_Average_Sales",
    "StoreDept_Average_Sales"
]


# ============================================================
# STORE TYPE ENCODING
# ============================================================

TYPE_MAPPING = {
    "A": 0,
    "B": 1,
    "C": 2
}


# ============================================================
# CALENDAR FEATURES
# ============================================================

def add_calendar_features(df):
    """
    Add calendar-based features from Date.
    """

    df = df.copy()

    df["Date"] = pd.to_datetime(
        df["Date"]
    )

    df["Year"] = (
        df["Date"].dt.year
    )

    df["Month"] = (
        df["Date"].dt.month
    )

    df["Week"] = (
        df["Date"]
        .dt.isocalendar()
        .week
        .astype(int)
    )

    df["Quarter"] = (
        df["Date"].dt.quarter
    )

    return df


# ============================================================
# LAG FEATURES
# ============================================================

def add_lag_features(
    df,
    group_columns=("Store", "Dept"),
    target_column="Weekly_Sales"
):
    """
    Create leakage-safe historical lag features.

    The current week's sales are never used to
    construct the current week's lag values.
    """

    df = df.copy()

    df = df.sort_values(
        list(group_columns) + ["Date"]
    )

    group = df.groupby(
        list(group_columns)
    )[target_column]

    df["Lag_1"] = group.shift(1)

    df["Lag_2"] = group.shift(2)

    df["Lag_4"] = group.shift(4)

    df["Lag_8"] = group.shift(8)

    return df


# ============================================================
# ROLLING FEATURES
# ============================================================

def add_rolling_features(
    df,
    group_columns=("Store", "Dept"),
    target_column="Weekly_Sales"
):
    """
    Create leakage-safe rolling averages.

    Shift happens BEFORE rolling calculation.
    """

    df = df.copy()

    df = df.sort_values(
        list(group_columns) + ["Date"]
    )

    group = df.groupby(
        list(group_columns)
    )[target_column]

    shifted_sales = group.shift(1)

    grouped_shifted = shifted_sales.groupby(
        [
            df[column]
            for column in group_columns
        ]
    )

    for window in [4, 8, 12]:

        df[
            f"Rolling_Mean_{window}"
        ] = (

            grouped_shifted

            .transform(

                lambda x:
                x.rolling(
                    window=window,
                    min_periods=1
                ).mean()
            )
        )

    return df


# ============================================================
# AGGREGATE DEMAND FEATURES
# ============================================================

def add_aggregate_features(df):
    """
    Create historical demand-context features.

    All calculations use previous observations only.
    """

    df = df.copy()

    df = df.sort_values(
        [
            "Store",
            "Dept",
            "Date"
        ]
    )


    # --------------------------------------------------------
    # Store average
    # --------------------------------------------------------

    df["Store_Average_Sales"] = (

        df.groupby(
            "Store"
        )["Weekly_Sales"]

        .transform(

            lambda x:
            x.shift(1)
            .expanding()
            .mean()
        )
    )


    # --------------------------------------------------------
    # Department average
    # --------------------------------------------------------

    df["Department_Average_Sales"] = (

        df.groupby(
            "Dept"
        )["Weekly_Sales"]

        .transform(

            lambda x:
            x.shift(1)
            .expanding()
            .mean()
        )
    )


    # --------------------------------------------------------
    # Store + Department average
    # --------------------------------------------------------

    df["StoreDept_Average_Sales"] = (

        df.groupby(
            [
                "Store",
                "Dept"
            ]
        )["Weekly_Sales"]

        .transform(

            lambda x:
            x.shift(1)
            .expanding()
            .mean()
        )
    )


    return df


# ============================================================
# BUILD ALL FEATURES
# ============================================================

def build_features(df):
    """
    Complete feature-engineering pipeline.

    Input:
        Raw historical dataframe.

    Output:
        Dataframe containing calendar,
        lag, rolling and aggregate features.
    """

    df = df.copy()


    # --------------------------------------------------------
    # Sort first
    # --------------------------------------------------------

    df["Date"] = pd.to_datetime(
        df["Date"]
    )

    df = df.sort_values(
        [
            "Store",
            "Dept",
            "Date"
        ]
    ).reset_index(
        drop=True
    )


    # --------------------------------------------------------
    # Calendar
    # --------------------------------------------------------

    df = add_calendar_features(
        df
    )


    # --------------------------------------------------------
    # Lag
    # --------------------------------------------------------

    df = add_lag_features(
        df
    )


    # --------------------------------------------------------
    # Rolling
    # --------------------------------------------------------

    df = add_rolling_features(
        df
    )


    # --------------------------------------------------------
    # Aggregate demand
    # --------------------------------------------------------

    df = add_aggregate_features(
        df
    )


    return df


# ============================================================
# PREPARE MODEL INPUT
# ============================================================

def prepare_model_input(
    row
):
    """
    Convert a single forecast row into
    the exact feature structure expected
    by the trained model.
    """

    if isinstance(
        row,
        dict
    ):

        data = pd.DataFrame(
            [row]
        )

    elif isinstance(
        row,
        pd.Series
    ):

        data = pd.DataFrame(
            [row]
        )

    else:

        data = row.copy()


    # --------------------------------------------------------
    # Encode Store Type
    # --------------------------------------------------------

    if "Type" in data.columns:

        if data["Type"].dtype == object:

            data["Type"] = (
                data["Type"]
                .map(TYPE_MAPPING)
                .fillna(-1)
            )


    # --------------------------------------------------------
    # Ensure feature order
    # --------------------------------------------------------

    missing = [
        column
        for column in FEATURES
        if column not in data.columns
    ]


    if missing:

        raise ValueError(
            "Missing model features: "
            +
            ", ".join(missing)
        )


    data = data[
        FEATURES
    ]


    # --------------------------------------------------------
    # Convert numeric values
    # --------------------------------------------------------

    for column in FEATURES:

        data[column] = pd.to_numeric(
            data[column],
            errors="coerce"
        )


    return data


# ============================================================
# VALIDATE FEATURES
# ============================================================

def validate_features(df):
    """
    Verify that all required model features
    exist in a dataframe.
    """

    missing = [
        column
        for column in FEATURES
        if column not in df.columns
    ]


    if missing:

        raise ValueError(
            "Missing required features: "
            +
            ", ".join(missing)
        )


    return True


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        "FEATURE BUILDER"
    )

    print(
        "==========================================\n"
    )


    print(
        "Required model features:"
    )


    for feature in FEATURES:

        print(
            "  ✓",
            feature
        )


    print(
        "\nTotal features:",
        len(FEATURES)
    )


    print(
        "\nFeature builder loaded successfully."
    )