import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
    getOverview,
    getForecastHistory,
} from "../services/api";

import {
    IndianRupee,
    Store,
    Package,
    RefreshCw,
    TrendingUp,
    Activity,
} from "lucide-react";

import StatCard from "../components/StatCard";
import Loading from "../components/Loading";

import "./Dashboard.css";


function Dashboard() {

    const [overview, setOverview] = useState(null);

    const [latestForecast, setLatestForecast] = useState(null);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState(null);

    const [lastUpdated, setLastUpdated] = useState(null);


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
    // LOAD DASHBOARD DATA
    // ============================================================

    const loadDashboard = async (
        showRefreshState = false
    ) => {

        try {

            if (showRefreshState) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(null);


            const [
                overviewResponse,
                historyResponse,
            ] = await Promise.all([
                getOverview(),
                getForecastHistory(),
            ]);


            setOverview(
                overviewResponse?.overview || null
            );


            /*
                History is used only for the small
                "Latest Forecast" summary card.

                The detailed forecast results remain
                inside Forecast History.
            */

            const history =
                historyResponse?.history ||
                historyResponse?.forecasts ||
                historyResponse?.data ||
                [];


            setLatestForecast(
                Array.isArray(history) &&
                history.length > 0
                    ? history[0]
                    : null
            );


            setLastUpdated(
                new Date()
            );

        } catch (err) {

            console.error(
                "Dashboard error:",
                err
            );

            setError(
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="dashboard">

                <Loading
                    message="Loading dashboard"
                    description="Preparing business intelligence data..."
                />

            </div>

        );

    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <div className="dashboard">

                <div className="dashboard-error">

                    <div>

                        <strong>
                            Unable to load dashboard
                        </strong>

                        <p>
                            We couldn't retrieve the latest
                            dashboard data.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="retry-button"
                        onClick={() =>
                            loadDashboard(true)
                        }
                    >

                        <RefreshCw size={15} />

                        Retry

                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="dashboard">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="page-header">

                <div className="page-header-left">

                    <p className="eyebrow">
                        BUSINESS INTELLIGENCE
                    </p>


                    <h1>
                        Executive Dashboard
                    </h1>


                    <p className="page-description">
                        Monitor sales performance, demand trends
                        and business activity across your organization.
                    </p>

                </div>


                <button
                    type="button"
                    className="refresh-button"
                    onClick={() =>
                        loadDashboard(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "spin"
                                : ""
                        }
                    />


                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </header>


            {/* ====================================================
                KPI CARDS
            ==================================================== */}

            <section className="kpi-grid">

                <StatCard
                    title="Total Historical Sales"
                    value={formatCurrency(
                        overview?.total_historical_sales
                    )}
                    subtitle="Total recorded revenue"
                    trend="+0.9%"
                    trendLabel="Recent sales growth"
                    icon={
                        <IndianRupee
                            size={20}
                        />
                    }
                />


                <StatCard
                    title="Average Weekly Sales"
                    value={formatCurrency(
                        overview?.average_weekly_sales
                    )}
                    subtitle="Average weekly revenue"
                    trend="Growing"
                    trendLabel="Positive weekly momentum"
                    icon={
                        <span className="trend-card-icon">
                            ↗
                        </span>
                    }
                />


                <StatCard
                    title="Active Stores"
                    value={
                        overview?.total_stores ||
                        0
                    }
                    subtitle="Stores in the system"
                    icon={
                        <Store
                            size={20}
                        />
                    }
                />


                <StatCard
                    title="Departments"
                    value={
                        overview?.total_departments ||
                        0
                    }
                    subtitle="Available departments"
                    icon={
                        <Package
                            size={20}
                        />
                    }
                />

            </section>


            {/* ====================================================
                FORECAST QUICK ACCESS
            ==================================================== */}

            <section className="dashboard-feature-grid">


                {/* =================================================
                    LATEST FORECAST
                ================================================= */}

                <div className="dashboard-feature-card">

                    <div className="dashboard-feature-header">

                        <div>

                            <span className="dashboard-feature-label">
                                LATEST FORECAST
                            </span>

                            <h2>
                                Latest Forecast
                            </h2>

                        </div>


                        <div className="dashboard-feature-icon">

                            <TrendingUp
                                size={19}
                            />

                        </div>

                    </div>


                    {latestForecast ? (

                        <div className="latest-forecast-content">


                            <div className="latest-forecast-entity">

                                <strong>
                                    {latestForecast.store_name ||
                                        latestForecast.store ||
                                        latestForecast.store_id ||
                                        "Forecast Record"}
                                </strong>

                                <span>
                                    {latestForecast.department_name ||
                                        latestForecast.department ||
                                        latestForecast.department_id ||
                                        "Sales Forecast"}
                                </span>

                            </div>


                            <div className="latest-forecast-details">

                                <div>

                                    <span>
                                        Forecast Horizon
                                    </span>

                                    <strong>
                                        {latestForecast.horizon
                                            ? `${latestForecast.horizon} Weeks`
                                            : "Available"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong className="forecast-ready">
                                        Completed
                                    </strong>

                                </div>

                            </div>


                            <NavLink
                                to="/history"
                                className="feature-link"
                            >
                                View Forecast History →
                            </NavLink>

                        </div>

                    ) : (

                        <div className="no-forecast">

                            <strong>
                                No forecasts yet
                            </strong>

                            <p>
                                Generate your first sales forecast
                                to see it here.
                            </p>


                            <NavLink
                                to="/forecast"
                                className="feature-link"
                            >
                                Generate Forecast →
                            </NavLink>

                        </div>

                    )}

                </div>


                {/* =================================================
                    FORECASTING ENGINE
                ================================================= */}

                <div className="dashboard-feature-card">

                    <div className="dashboard-feature-header">

                        <div>

                            <span className="dashboard-feature-label">
                                FORECASTING ENGINE
                            </span>

                            <h2>
                                Forecasting Engine
                            </h2>

                        </div>


                        <div className="dashboard-feature-icon">

                            <Activity
                                size={19}
                            />

                        </div>

                    </div>


                    <div className="engine-status">

                        <div className="engine-status-row">

                            <span className="status-indicator">
                            </span>

                            <strong>
                                Ready
                            </strong>

                        </div>


                        <p>
                            Machine learning forecasting model
                            is available for generating future sales
                            estimates.
                        </p>

                    </div>


                    <NavLink
                        to="/forecast"
                        className="generate-forecast-button"
                    >

                        <TrendingUp
                            size={16}
                        />

                        Generate Forecast

                    </NavLink>

                </div>

            </section>


            {/* ====================================================
                FOOTER
            ==================================================== */}

            <div className="dashboard-footer">

                <span>
                    Sales Forecast Intelligence Platform
                </span>


                {lastUpdated && (

                    <span>

                        Last updated{" "}

                        {lastUpdated.toLocaleTimeString(
                            "en-IN",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}{" "}

                        IST

                    </span>

                )}

            </div>

        </div>

    );

}


export default Dashboard;
