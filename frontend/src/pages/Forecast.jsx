import { useEffect, useState } from "react";

import {
    getStores,
    getDepartments,
    getForecast,
} from "../services/api";

import {
    TrendingUp,
    CalendarDays,
    Store,
    Layers3,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Plus,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import "./Forecast.css";


function Forecast() {

    // ============================================================
    // DATA
    // ============================================================

    const [stores, setStores] =
        useState([]);

    const [departments, setDepartments] =
        useState([]);


    // ============================================================
    // FORECAST MODE
    // ============================================================

    const [mode, setMode] =
        useState("existing");


    // ============================================================
    // FORM
    // ============================================================

    const [storeId, setStoreId] =
        useState("");

    const [departmentId, setDepartmentId] =
        useState("");

    const [horizon, setHorizon] =
        useState(4);


    // New Store

    const [newStoreName, setNewStoreName] =
        useState("");

    const [newStoreType, setNewStoreType] =
        useState("A");

    const [newStoreSize, setNewStoreSize] =
        useState("");


    // New Department

    const [newDepartmentName, setNewDepartmentName] =
        useState("");

    const [newDepartmentCategory, setNewDepartmentCategory] =
        useState("Food & Essentials");


    // ============================================================
    // RESULT
    // ============================================================

    const [forecastResult, setForecastResult] =
        useState(null);


    // ============================================================
    // STATES
    // ============================================================

    const [loading, setLoading] =
        useState(true);

    const [forecasting, setForecasting] =
        useState(false);

    const [error, setError] =
        useState("");


    // ============================================================
    // LOAD MASTER DATA
    // ============================================================

    useEffect(() => {

        const loadMasterData =
            async () => {

                try {

                    const [
                        storesResponse,
                        departmentsResponse,
                    ] = await Promise.all([
                        getStores(),
                        getDepartments(),
                    ]);


                    const storeList =
                        storesResponse.stores || [];

                    const departmentList =
                        departmentsResponse.departments || [];


                    setStores(storeList);

                    setDepartments(
                        departmentList
                    );


                    if (
                        storeList.length > 0
                    ) {

                        setStoreId(
                            storeList[0].store_id
                        );

                    }


                    if (
                        departmentList.length > 0
                    ) {

                        setDepartmentId(
                            departmentList[0].department_id
                        );

                    }

                }

                catch (err) {

                    console.error(err);

                    setError(
                        "Unable to load stores and departments."
                    );

                }

                finally {

                    setLoading(false);

                }

            };


        loadMasterData();

    }, []);


    // ============================================================
    // CHANGE MODE
    // ============================================================

    const changeMode = (
        newMode
    ) => {

        setMode(newMode);

        setError("");

        setForecastResult(null);

    };


    // ============================================================
    // VALIDATE FORM
    // ============================================================

    const validateForm = () => {

        if (
            mode === "existing"
        ) {

            if (
                !storeId ||
                !departmentId
            ) {

                return "Please select a store and department.";

            }

        }


        if (
            mode === "new_store"
        ) {

            if (
                !newStoreName.trim()
            ) {

                return "Please enter the new store name.";

            }


            if (
                !newStoreSize ||
                Number(newStoreSize) <= 0
            ) {

                return "Please enter a valid store size.";

            }


            if (
                !departmentId
            ) {

                return "Please select a department.";

            }

        }


        if (
            mode === "new_department"
        ) {

            if (
                !storeId
            ) {

                return "Please select a store.";

            }


            if (
                !newDepartmentName.trim()
            ) {

                return "Please enter the new department name.";

            }


            if (
                !newDepartmentCategory
            ) {

                return "Please select a category.";

            }

        }


        return null;

    };


    // ============================================================
    // GENERATE FORECAST
    // ============================================================

    const handleForecast =
        async () => {

            const validationError =
                validateForm();


            if (
                validationError
            ) {

                setError(
                    validationError
                );

                return;

            }


            try {

                setForecasting(true);

                setError("");

                setForecastResult(null);


                let request;


                // ------------------------------------------------
                // EXISTING BUSINESS
                // ------------------------------------------------

                if (
                    mode === "existing"
                ) {

                    request = {

                        store_id:
                            storeId,

                        department_id:
                            departmentId,

                        horizon:
                            Number(horizon),

                    };

                }


                // ------------------------------------------------
                // NEW STORE
                // ------------------------------------------------

                else if (
                    mode === "new_store"
                ) {

                    request = {

                        store_id:
                            "NEW",

                        department_id:
                            departmentId,

                        horizon:
                            Number(horizon),

                        store_name:
                            newStoreName.trim(),

                        store_type:
                            newStoreType,

                        store_size:
                            Number(newStoreSize),

                    };

                }


                // ------------------------------------------------
                // NEW DEPARTMENT
                // ------------------------------------------------

                else {

                    request = {

                        store_id:
                            storeId,

                        department_id:
                            "NEW",

                        horizon:
                            Number(horizon),

                        department_name:
                            newDepartmentName.trim(),

                        department_category:
                            newDepartmentCategory,

                    };

                }


                const result =
                    await getForecast(
                        request
                    );


                setForecastResult(
                    result
                );

            }

            catch (err) {

                console.error(
                    "Forecast error:",
                    err
                );

                console.error(
                    "SERVER RESPONSE:",
                    err?.response?.data
                );

                setError(
                    err?.response?.data?.error ||
                    err?.response?.data?.details ||
                    err?.message ||
                    "Unable to generate forecast."
                );

            }

            finally {

                setForecasting(false);

            }

        };


    // ============================================================
    // FORMAT CURRENCY
    // ============================================================

    const formatCurrency =
        (value) => {

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
    // FORECAST TYPE LABEL
    // ============================================================

    const getForecastTypeLabel =
        (type) => {

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

                return "Cold Start — New Store";

            }


            if (
                type ===
                "cold_start_new_department"
            ) {

                return "Cold Start — New Department";

            }


            return type ||
                "Forecast";

        };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="forecast-loading">

                <Loader2
                    size={20}
                    className="spin"
                />

                Loading forecasting system...

            </div>

        );

    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="forecast-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="forecast-header">

                <div>

                    <p className="eyebrow">
                        DEMAND FORECASTING
                    </p>

                    <h1>
                        Sales Forecast
                    </h1>

                    <p>
                        Forecast future sales for existing
                        or newly introduced business entities.
                    </p>

                </div>


                <div className="forecast-status">

                    <span></span>

                    Forecast Engine Ready

                </div>

            </div>



            {/* ====================================================
                FORECAST MODE
            ==================================================== */}

            <section className="forecast-card">

                <div className="forecast-card-heading">

                    <div className="heading-icon">

                        <TrendingUp
                            size={20}
                        />

                    </div>


                    <div>

                        <h2>
                            What would you like to forecast?
                        </h2>

                        <p>
                            Choose the business scenario
                            before generating your forecast.
                        </p>

                    </div>

                </div>


                <div className="forecast-mode-grid">


                    {/* EXISTING */}

                    <button
                        type="button"
                        className={
                            `mode-card ${
                                mode === "existing"
                                    ? "selected"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            changeMode(
                                "existing"
                            )
                        }
                    >

                        <Store
                            size={20}
                        />

                        <strong>
                            Existing Business
                        </strong>

                        <span>
                            Forecast an existing
                            store and department.
                        </span>

                    </button>



                    {/* NEW STORE */}

                    <button
                        type="button"
                        className={
                            `mode-card ${
                                mode === "new_store"
                                    ? "selected"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            changeMode(
                                "new_store"
                            )
                        }
                    >

                        <Plus
                            size={20}
                        />

                        <strong>
                            New Store
                        </strong>

                        <span>
                            Forecast sales for a
                            store with no history.
                        </span>

                    </button>



                    {/* NEW DEPARTMENT */}

                    <button
                        type="button"
                        className={
                            `mode-card ${
                                mode === "new_department"
                                    ? "selected"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            changeMode(
                                "new_department"
                            )
                        }
                    >

                        <Layers3
                            size={20}
                        />

                        <strong>
                            New Department
                        </strong>

                        <span>
                            Forecast a department
                            with no sales history.
                        </span>

                    </button>

                </div>



                {/* =================================================
                    EXISTING BUSINESS FORM
                ================================================= */}

                {mode === "existing" && (

                    <div className="scenario-section">

                        <div className="scenario-title">

                            <h3>
                                Existing Business
                            </h3>

                            <p>
                                Select an existing store,
                                department and forecast horizon.
                            </p>

                        </div>


                        <div className="forecast-form">


                            {/* STORE */}

                            <div className="form-group">

                                <label>

                                    <Store
                                        size={15}
                                    />

                                    Store

                                </label>


                                <select
                                    value={storeId}
                                    onChange={(
                                        event
                                    ) =>
                                        setStoreId(
                                            event.target.value
                                        )
                                    }
                                >

                                    {stores.map(
                                        (store) => (

                                            <option
                                                key={
                                                    store.store_id
                                                }
                                                value={
                                                    store.store_id
                                                }
                                            >

                                                {
                                                    store.store_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>



                            {/* DEPARTMENT */}

                            <div className="form-group">

                                <label>

                                    <Layers3
                                        size={15}
                                    />

                                    Department

                                </label>


                                <select
                                    value={departmentId}
                                    onChange={(
                                        event
                                    ) =>
                                        setDepartmentId(
                                            event.target.value
                                        )
                                    }
                                >

                                    {departments.map(
                                        (department) => (

                                            <option
                                                key={
                                                    department.department_id
                                                }
                                                value={
                                                    department.department_id
                                                }
                                            >

                                                {
                                                    department.department_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>



                            {/* HORIZON */}

                            <div className="form-group">

                                <label>

                                    <CalendarDays
                                        size={15}
                                    />

                                    Forecast Horizon

                                </label>


                                <select
                                    value={horizon}
                                    onChange={(
                                        event
                                    ) =>
                                        setHorizon(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={1}>
                                        1 Week
                                    </option>

                                    <option value={4}>
                                        4 Weeks
                                    </option>

                                    <option value={8}>
                                        8 Weeks
                                    </option>

                                    <option value={12}>
                                        12 Weeks
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                )}



                {/* =================================================
                    NEW STORE FORM
                ================================================= */}

                {mode === "new_store" && (

                    <div className="scenario-section">

                        <div className="scenario-title">

                            <h3>
                                Add New Store Forecast
                            </h3>

                            <p>
                                No historical sales are required.
                                The cold-start engine will estimate
                                future demand.
                            </p>

                        </div>


                        <div className="forecast-form">


                            {/* STORE NAME */}

                            <div className="form-group">

                                <label>
                                    <Store size={15} />

                                    Store Name
                                </label>


                                <input
                                    type="text"
                                    value={
                                        newStoreName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewStoreName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. New City Center"
                                />

                            </div>



                            {/* STORE TYPE */}

                            <div className="form-group">

                                <label>
                                    Store Type
                                </label>


                                <select
                                    value={
                                        newStoreType
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewStoreType(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="A">
                                        Type A — Large
                                    </option>

                                    <option value="B">
                                        Type B — Medium
                                    </option>

                                    <option value="C">
                                        Type C — Small
                                    </option>

                                </select>

                            </div>



                            {/* STORE SIZE */}

                            <div className="form-group">

                                <label>
                                    Store Size
                                </label>


                                <input
                                    type="number"
                                    value={
                                        newStoreSize
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewStoreSize(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 180000"
                                    min="1"
                                />

                            </div>



                            {/* DEPARTMENT */}

                            <div className="form-group">

                                <label>
                                    <Layers3
                                        size={15}
                                    />

                                    Department
                                </label>


                                <select
                                    value={
                                        departmentId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDepartmentId(
                                            event.target.value
                                        )
                                    }
                                >

                                    {departments.map(
                                        (department) => (

                                            <option
                                                key={
                                                    department.department_id
                                                }
                                                value={
                                                    department.department_id
                                                }
                                            >

                                                {
                                                    department.department_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>



                            {/* HORIZON */}

                            <div className="form-group">

                                <label>
                                    <CalendarDays
                                        size={15}
                                    />

                                    Forecast Horizon
                                </label>


                                <select
                                    value={
                                        horizon
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setHorizon(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={1}>
                                        1 Week
                                    </option>

                                    <option value={4}>
                                        4 Weeks
                                    </option>

                                    <option value={8}>
                                        8 Weeks
                                    </option>

                                    <option value={12}>
                                        12 Weeks
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                )}



                {/* =================================================
                    NEW DEPARTMENT FORM
                ================================================= */}

                {mode === "new_department" && (

                    <div className="scenario-section">

                        <div className="scenario-title">

                            <h3>
                                Add New Department Forecast
                            </h3>

                            <p>
                                Forecast a newly introduced
                                department without historical sales.
                            </p>

                        </div>


                        <div className="forecast-form">


                            {/* STORE */}

                            <div className="form-group">

                                <label>
                                    <Store
                                        size={15}
                                    />

                                    Store
                                </label>


                                <select
                                    value={
                                        storeId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setStoreId(
                                            event.target.value
                                        )
                                    }
                                >

                                    {stores.map(
                                        (store) => (

                                            <option
                                                key={
                                                    store.store_id
                                                }
                                                value={
                                                    store.store_id
                                                }
                                            >

                                                {
                                                    store.store_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>



                            {/* DEPARTMENT NAME */}

                            <div className="form-group">

                                <label>
                                    <Layers3
                                        size={15}
                                    />

                                    Department Name
                                </label>


                                <input
                                    type="text"
                                    value={
                                        newDepartmentName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewDepartmentName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Fashion Accessories"
                                />

                            </div>



                            {/* CATEGORY */}

                            <div className="form-group">

                                <label>
                                    Category
                                </label>


                                <select
                                    value={
                                        newDepartmentCategory
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewDepartmentCategory(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option>
                                        Food & Essentials
                                    </option>

                                    <option>
                                        Consumer Electronics
                                    </option>

                                    <option>
                                        Home
                                    </option>

                                    <option>
                                        Fashion
                                    </option>

                                    <option>
                                        Beauty & Personal Care
                                    </option>

                                    <option>
                                        Sports & Recreation
                                    </option>

                                    <option>
                                        General Retail
                                    </option>

                                    <option>
                                        Health & Wellness
                                    </option>

                                    <option>
                                        Pet & Animal Care
                                    </option>

                                    <option>
                                        Home & Garden
                                    </option>

                                </select>

                            </div>



                            {/* HORIZON */}

                            <div className="form-group">

                                <label>
                                    <CalendarDays
                                        size={15}
                                    />

                                    Forecast Horizon
                                </label>


                                <select
                                    value={
                                        horizon
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setHorizon(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                >

                                    <option value={1}>
                                        1 Week
                                    </option>

                                    <option value={4}>
                                        4 Weeks
                                    </option>

                                    <option value={8}>
                                        8 Weeks
                                    </option>

                                    <option value={12}>
                                        12 Weeks
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                )}



                {/* =================================================
                    GENERATE
                ================================================= */}

                <button
                    className="generate-button"
                    onClick={
                        handleForecast
                    }
                    disabled={
                        forecasting
                    }
                >

                    {forecasting ? (

                        <>

                            <Loader2
                                size={18}
                                className="spin"
                            />

                            Generating Forecast...

                        </>

                    ) : (

                        <>

                            <TrendingUp
                                size={18}
                            />

                            Generate Forecast

                        </>

                    )}

                </button>

            </section>



            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="forecast-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}



            {/* ====================================================
                RESULTS
            ==================================================== */}

            {forecastResult && (

                <div className="forecast-results">


                    {/* =================================================
                        RESULT HEADER
                    ================================================= */}

                    <div className="result-header">

                        <div>

                            <p className="eyebrow">
                                FORECAST RESULT
                            </p>

                            <h2>

                                {
                                    forecastResult.store?.name ||
                                    newStoreName ||
                                    "Store"
                                }

                                {" — "}

                                {
                                    forecastResult.department?.name ||
                                    newDepartmentName ||
                                    "Department"
                                }

                            </h2>

                        </div>


                        <div className="forecast-type">

                            <CheckCircle2
                                size={16}
                            />

                            {
                                getForecastTypeLabel(
                                    forecastResult.forecast_type
                                )
                            }

                        </div>

                    </div>



                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <div className="result-kpis">


                        <div className="result-kpi">

                            <span>
                                Expected Sales
                            </span>

                            <strong>

                                {
                                    formatCurrency(
                                        forecastResult.summary
                                            ?.total_expected_sales
                                    )
                                }

                            </strong>

                        </div>



                        <div className="result-kpi">

                            <span>
                                Average Weekly
                            </span>

                            <strong>

                                {
                                    formatCurrency(
                                        forecastResult.summary
                                            ?.average_weekly_sales
                                    )
                                }

                            </strong>

                        </div>



                        <div className="result-kpi">

                            <span>
                                Peak Week
                            </span>

                            <strong>

                                Week{" "}
                                {
                                    forecastResult.summary
                                        ?.peak_week
                                }

                            </strong>

                            <small>

                                {
                                    formatCurrency(
                                        forecastResult.summary
                                            ?.peak_sales
                                    )
                                }

                            </small>

                        </div>



                        <div className="result-kpi">

                            <span>
                                Lowest Week
                            </span>

                            <strong>

                                Week{" "}
                                {
                                    forecastResult.summary
                                        ?.lowest_week
                                }

                            </strong>

                            <small>

                                {
                                    formatCurrency(
                                        forecastResult.summary
                                            ?.lowest_sales
                                    )
                                }

                            </small>

                        </div>

                    </div>



                    {/* =================================================
                        CHART
                    ================================================= */}

                    <section className="forecast-card chart-card">

                        <div className="forecast-card-heading">

                            <div>

                                <h2>
                                    Weekly Forecast
                                </h2>

                                <p>
                                    Expected sales for the
                                    selected horizon.
                                </p>

                            </div>

                        </div>


                        <div className="forecast-chart">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={
                                        forecastResult.forecast
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="date"
                                    />

                                    <YAxis />

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) =>
                                            formatCurrency(
                                                value
                                            )
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="forecast"
                                        strokeWidth={3}
                                        dot={{
                                            r: 4,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    </section>



                    {/* =================================================
                        BREAKDOWN
                    ================================================= */}

                    <section className="forecast-card">

                        <div className="forecast-card-heading">

                            <div>

                                <h2>
                                    Forecast Breakdown
                                </h2>

                                <p>
                                    Weekly expected sales.
                                </p>

                            </div>

                        </div>


                        <div className="forecast-table-wrapper">

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
                                            Expected Sales
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        forecastResult.forecast?.map(
                                            (item) => (

                                                <tr
                                                    key={
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
                                                            item.date
                                                        }
                                                    </td>

                                                    <td className="sales-value">

                                                        {
                                                            formatCurrency(
                                                                item.forecast
                                                            )
                                                        }

                                                    </td>

                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    </section>

                </div>

            )}

        </div>

    );

}


export default Forecast;