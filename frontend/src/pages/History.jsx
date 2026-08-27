import { useEffect, useState } from "react";

import {
    getForecastHistory,
    getForecastById,
    deleteForecast,
} from "../services/api";

import {
    History as HistoryIcon,
    Eye,
    Trash2,
    X,
    CalendarDays,
    Store,
    Layers3,
    Loader2,
    AlertCircle,
} from "lucide-react";

import "./History.css";


function History() {

    const [history, setHistory] =
        useState([]);

    const [selectedForecast, setSelectedForecast] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    const [error, setError] =
        useState("");

    const [deletingId, setDeletingId] =
        useState(null);


    // ========================================================
    // LOAD HISTORY
    // ========================================================

    const loadHistory = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await getForecastHistory();

            setHistory(
                response.forecasts ||
                response.history ||
                []
            );

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to load forecast history."
            );

        }

        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadHistory();

    }, []);


    // ========================================================
    // VIEW FORECAST
    // ========================================================

    const handleView = async (
        id
    ) => {

        try {

            setLoadingDetails(true);

            setError("");

            const response =
                await getForecastById(id);

            setSelectedForecast(
                response.forecast ||
                response
            );

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to load forecast details."
            );

        }

        finally {

            setLoadingDetails(false);

        }

    };


    // ========================================================
    // DELETE FORECAST
    // ========================================================

    const handleDelete = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Delete this forecast from history?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setDeletingId(id);

            setError("");

            await deleteForecast(id);

            setHistory(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !== id
                    )
            );

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to delete forecast."
            );

        }

        finally {

            setDeletingId(null);

        }

    };


    // ========================================================
    // FORMAT CURRENCY
    // ========================================================

    const formatCurrency = (
        value
    ) => {

        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        )}`;

    };


    // ========================================================
    // FORMAT FORECAST TYPE
    // ========================================================

    const formatForecastType = (
        type
    ) => {

        if (
            type ===
            "historical_ml"
        ) {

            return "Historical ML";

        }


        if (
            type ===
            "cold_start_new_store"
        ) {

            return "New Store";

        }


        if (
            type ===
            "cold_start_new_department"
        ) {

            return "New Department";

        }


        return type || "Forecast";

    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="history-loading">

                <Loader2
                    size={20}
                    className="spin"
                />

                Loading forecast history...

            </div>

        );

    }


    return (

        <div className="history-page">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="history-header">

                <div>

                    <p className="eyebrow">
                        FORECAST RECORDS
                    </p>

                    <h1>
                        Forecast History
                    </h1>

                    <p>
                        Review forecasts generated
                        by the forecasting system.
                    </p>

                </div>

                <div className="history-count">

                    <HistoryIcon
                        size={17}
                    />

                    {history.length} Records

                </div>

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

                <div className="history-error">

                    <AlertCircle
                        size={18}
                    />

                    {error}

                </div>

            )}


            {/* ================================================= */}
            {/* EMPTY STATE */}
            {/* ================================================= */}

            {history.length === 0 && !error && (

                <div className="empty-history">

                    <div className="empty-icon">

                        <HistoryIcon
                            size={26}
                        />

                    </div>

                    <h2>
                        No Forecasts Yet
                    </h2>

                    <p>
                        Generate your first forecast
                        to see it appear here.
                    </p>

                </div>

            )}


            {/* ================================================= */}
            {/* HISTORY TABLE */}
            {/* ================================================= */}

            {history.length > 0 && (

                <section className="history-card">

                    <div className="history-table-wrapper">

                        <table className="history-table">

                            <thead>

                                <tr>

                                    <th>
                                        Store
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Forecast Type
                                    </th>

                                    <th>
                                        Horizon
                                    </th>

                                    <th>
                                        Expected Sales
                                    </th>

                                    <th>
                                        Generated
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {history.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            {/* STORE */}

                                            <td>

                                                <div className="entity-cell">

                                                    <div className="entity-icon">

                                                        <Store
                                                            size={15}
                                                        />

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.store_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.store_id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>

                                                <div className="entity-cell">

                                                    <div className="entity-icon">

                                                        <Layers3
                                                            size={15}
                                                        />

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.department_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.department_id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* TYPE */}

                                            <td>

                                                <span
                                                    className={
                                                        `type-badge ${
                                                            item.forecast_type ===
                                                            "historical_ml"
                                                                ? "historical"
                                                                : "cold-start"
                                                        }`
                                                    }
                                                >

                                                    {
                                                        formatForecastType(
                                                            item.forecast_type
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* HORIZON */}

                                            <td>

                                                <span className="horizon-cell">

                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    {
                                                        item.horizon
                                                    }{" "}
                                                    weeks

                                                </span>

                                            </td>


                                            {/* SALES */}

                                            <td>

                                                <strong className="history-sales">

                                                    {
                                                        formatCurrency(
                                                            item.total_expected_sales
                                                        )
                                                    }

                                                </strong>

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                <span className="created-date">

                                                    {
                                                        item.created_at
                                                            ? new Date(
                                                                item.created_at
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    dateStyle:
                                                                        "medium",
                                                                    timeStyle:
                                                                        "short",
                                                                }
                                                            )
                                                            : "—"
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="history-actions">

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            handleView(
                                                                item.id
                                                            )
                                                        }
                                                        title="View forecast"
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                    </button>


                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            item.id
                                                        }
                                                        title="Delete forecast"
                                                    >

                                                        {deletingId ===
                                                        item.id ? (

                                                            <Loader2
                                                                size={16}
                                                                className="spin"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={16}
                                                            />

                                                        )}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* ================================================= */}
            {/* DETAILS MODAL */}
            {/* ================================================= */}

            {selectedForecast && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedForecast(
                            null
                        )
                    }
                >

                    <div
                        className="forecast-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>

                                <p className="eyebrow">
                                    FORECAST DETAILS
                                </p>

                                <h2>
                                    {
                                        selectedForecast.store_name
                                    }
                                    {" — "}
                                    {
                                        selectedForecast.department_name
                                    }
                                </h2>

                            </div>


                            <button
                                className="close-button"
                                onClick={() =>
                                    setSelectedForecast(
                                        null
                                    )
                                }
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        <div className="modal-summary">

                            <div>

                                <span>
                                    Forecast Type
                                </span>

                                <strong>
                                    {
                                        formatForecastType(
                                            selectedForecast.forecast_type
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total Expected
                                </span>

                                <strong>
                                    {
                                        formatCurrency(
                                            selectedForecast.total_expected_sales
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Average Weekly
                                </span>

                                <strong>
                                    {
                                        formatCurrency(
                                            selectedForecast.average_weekly_sales
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="modal-table">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Week
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Forecast
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {selectedForecast.forecast?.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id ||
                                                    item.week_number
                                                }
                                            >

                                                <td>
                                                    Week{" "}
                                                    {
                                                        item.week_number
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.forecast_date ||
                                                        item.date
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            formatCurrency(
                                                                item.forecast_value ??
                                                                item.forecast
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* DETAILS LOADING */}
            {/* ================================================= */}

            {loadingDetails && (

                <div className="details-loading">

                    <Loader2
                        size={18}
                        className="spin"
                    />

                    Loading forecast details...

                </div>

            )}

        </div>

    );
}


export default History;