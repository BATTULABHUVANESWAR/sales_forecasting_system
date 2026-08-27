import { useEffect, useMemo, useState } from "react";

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
    RefreshCw,
    Search,
    TrendingUp,
} from "lucide-react";

import "./History.css";


function History() {

    // ============================================================
    // DATA
    // ============================================================

    const [history, setHistory] = useState([]);

    const [selectedForecast, setSelectedForecast] =
        useState(null);


    // ============================================================
    // UI STATES
    // ============================================================

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    const [error, setError] = useState("");

    const [deletingId, setDeletingId] =
        useState(null);


    // ============================================================
    // FILTERS
    // ============================================================

    const [searchTerm, setSearchTerm] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [horizonFilter, setHorizonFilter] =
        useState("all");


    // ============================================================
    // LOAD HISTORY
    // ============================================================

    const loadHistory = async (
        showRefreshing = false
    ) => {

        try {

            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await getForecastHistory();

            const records =
                response.forecasts ||
                response.history ||
                [];

            setHistory(
                Array.isArray(records)
                    ? records
                    : []
            );

        }

        catch (err) {

            console.error(
                "History error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                "Unable to load forecast history."
            );

        }

        finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadHistory();

    }, []);


    // ============================================================
    // VIEW FORECAST
    // ============================================================

    const handleView = async (id) => {

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

            console.error(
                "Forecast details error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                "Unable to load forecast details."
            );

        }

        finally {

            setLoadingDetails(false);

        }

    };


    // ============================================================
    // DELETE FORECAST
    // ============================================================

    const handleDelete = async (id) => {

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


            if (
                selectedForecast?.id === id
            ) {

                setSelectedForecast(null);

            }

        }

        catch (err) {

            console.error(
                "Delete history error:",
                err
            );

            setError(
                err?.response?.data?.error ||
                "Unable to delete forecast."
            );

        }

        finally {

            setDeletingId(null);

        }

    };


    // ============================================================
    // FORMAT CURRENCY
    // ============================================================

    const formatCurrency = (value) => {

        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        )}`;

    };


    // ============================================================
    // FORMAT FORECAST TYPE
    // ============================================================

    const formatForecastType = (type) => {

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


    // ============================================================
    // TYPE CLASS
    // ============================================================

    const getTypeClass = (type) => {

        if (
            type ===
            "historical_ml"
        ) {

            return "historical";

        }

        return "cold-start";

    };


    // ============================================================
    // FILTER HISTORY
    // ============================================================

    const filteredHistory = useMemo(() => {

        const query =
            searchTerm
                .trim()
                .toLowerCase();


        return history.filter(
            (item) => {

                const matchesSearch =
                    !query ||
                    String(
                        item.store_name || ""
                    )
                        .toLowerCase()
                        .includes(query) ||

                    String(
                        item.department_name || ""
                    )
                        .toLowerCase()
                        .includes(query) ||

                    String(
                        item.store_id || ""
                    )
                        .toLowerCase()
                        .includes(query) ||

                    String(
                        item.department_id || ""
                    )
                        .toLowerCase()
                        .includes(query);


                const matchesType =
                    typeFilter === "all" ||
                    item.forecast_type ===
                        typeFilter;

                const matchesHorizon =
                    horizonFilter === "all" ||
                    Number(item.horizon) ===
                        Number(horizonFilter);


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesHorizon
                );

            }
        );

    }, [
        history,
        searchTerm,
        typeFilter,
        horizonFilter,
    ]);


    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    const clearFilters = () => {

        setSearchTerm("");
        setTypeFilter("all");
        setHorizonFilter("all");

    };


    // ============================================================
    // LOADING
    // ============================================================

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


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="history-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="history-header">

                <div>

                    <p className="eyebrow">
                        FORECAST RECORDS
                    </p>

                    <h1>
                        Forecast History
                    </h1>

                    <p>
                        Review and manage forecasts
                        generated by the system.
                    </p>

                </div>


                <div className="history-header-actions">

                    <div className="history-count">

                        <HistoryIcon
                            size={17}
                        />

                        {history.length} Records

                    </div>


                    <button
                        className="history-refresh"
                        onClick={() =>
                            loadHistory(true)
                        }
                        disabled={refreshing}
                        title="Refresh history"
                    >

                        <RefreshCw
                            size={15}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </div>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="history-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ====================================================
                FILTER BAR
            ==================================================== */}

            {history.length > 0 && (

                <div className="history-toolbar">


                    {/* SEARCH */}

                    <div className="history-search">

                        <Search
                            size={16}
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search store or department..."
                        />

                    </div>


                    {/* TYPE */}

                    <select
                        className="history-filter"
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            All Forecasts
                        </option>

                        <option value="historical_ml">
                            Historical ML
                        </option>

                        <option value="cold_start_new_store">
                            New Store
                        </option>

                        <option value="cold_start_new_department">
                            New Department
                        </option>

                    </select>


                    {/* HORIZON */}

                    <select
                        className="history-filter"
                        value={horizonFilter}
                        onChange={(event) =>
                            setHorizonFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="all">
                            All Horizons
                        </option>

                        <option value="1">
                            1 Week
                        </option>

                        <option value="4">
                            4 Weeks
                        </option>

                        <option value="8">
                            8 Weeks
                        </option>

                        <option value="12">
                            12 Weeks
                        </option>

                    </select>


                    {(searchTerm ||
                        typeFilter !== "all" ||
                        horizonFilter !== "all") && (

                        <button
                            type="button"
                            className="history-clear-filters"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    )}


                    <div className="history-filter-count">

                        Showing{" "}
                        <strong>
                            {filteredHistory.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {history.length}
                        </strong>

                    </div>

                </div>

            )}


            {/* ====================================================
                EMPTY STATE
            ==================================================== */}

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


            {/* ====================================================
                NO FILTER RESULTS
            ==================================================== */}

            {history.length > 0 &&
                filteredHistory.length === 0 && (

                <div className="empty-history">

                    <div className="empty-icon">

                        <Search
                            size={25}
                        />

                    </div>

                    <h2>
                        No Matching Forecasts
                    </h2>

                    <p>
                        Try changing your search,
                        forecast type, or horizon filter.
                    </p>

                </div>

            )}


            {/* ====================================================
                HISTORY TABLE
            ==================================================== */}

            {filteredHistory.length > 0 && (

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

                                {filteredHistory.map(
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
                                                            item.store_name ||
                                                            "Unknown Store"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.store_id ||
                                                            "—"
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
                                                            item.department_name ||
                                                            "Unknown Department"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.department_id ||
                                                            "—"
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
                                                        getTypeClass(
                                                            item.forecast_type
                                                        )
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
                                                    item.horizon ||
                                                    0
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


                                                {/* VIEW */}

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


                                                {/* DELETE */}

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

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>

            )}


            {/* ====================================================
                DETAILS MODAL
            ==================================================== */}

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


                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <p className="eyebrow">
                                    FORECAST DETAILS
                                </p>

                                <h2>

                                    {
                                        selectedForecast.store_name ||
                                        "Store"
                                    }

                                    {" — "}

                                    {
                                        selectedForecast.department_name ||
                                        "Department"
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
                                title="Close"
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        {/* MODAL SUMMARY */}

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


                        {/* MODAL EXTRA INFO */}

                        <div className="modal-context">

                            <div>

                                <Store
                                    size={15}
                                />

                                <span>
                                    {
                                        selectedForecast.store_name ||
                                        "Store"
                                    }
                                </span>

                            </div>


                            <div>

                                <Layers3
                                    size={15}
                                />

                                <span>
                                    {
                                        selectedForecast.department_name ||
                                        "Department"
                                    }
                                </span>

                            </div>


                            <div>

                                <CalendarDays
                                    size={15}
                                />

                                <span>
                                    {
                                        selectedForecast.horizon ||
                                        0
                                    }{" "}
                                    weeks
                                </span>

                            </div>

                        </div>


                        {/* FORECAST TABLE */}

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

                                    {
                                        selectedForecast.forecast?.map(
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
                                                        item.date ||
                                                        "—"
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

                                        ))
                                    }

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                DETAILS LOADING
            ==================================================== */}

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