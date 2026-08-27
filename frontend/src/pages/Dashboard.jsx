import { useEffect, useMemo, useState } from "react";

import {
    getOverview,
    getStoreAnalytics,
    getDepartmentAnalytics,
    getSalesTrend,
} from "../services/api";

import {
    TrendingUp,
    TrendingDown,
    Store,
    Package,
    IndianRupee,
    RefreshCw,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import SalesTrendChart from "../components/SalesTrendChart";
import ForecastChart from "../components/ForecastChart";

import "./Dashboard.css";


function Dashboard() {

    const [overview, setOverview] = useState(null);

    const [stores, setStores] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [trend, setTrend] = useState([]);

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
                overviewData,
                storeData,
                departmentData,
                trendData,
            ] = await Promise.all([

                getOverview(),

                getStoreAnalytics(),

                getDepartmentAnalytics(),

                getSalesTrend(),

            ]);


            setOverview(
                overviewData?.overview || null
            );


            setStores(
                storeData?.stores || []
            );


            setDepartments(
                departmentData?.departments || []
            );


            setTrend(
                trendData?.trend || []
            );


            setLastUpdated(
                new Date()
            );

        }

        catch (err) {

            console.error(
                "Dashboard error:",
                err
            );

            setError(
                "Unable to load dashboard data."
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

        loadDashboard();

        const refreshTimer = setInterval(() => {

        loadDashboard(true);

    }, 60000);


    return () => {

        clearInterval(refreshTimer);
    }

    }, []);


    // ============================================================
    // TREND ANALYSIS
    // ============================================================

    const trendAnalysis = useMemo(() => {

        if (
            !trend ||
            trend.length < 2
        ) {

            return {

                direction: "neutral",

                percentage: 0,

                label: "Not enough data",

            };

        }


        const previous =
            Number(
                trend[
                    trend.length - 2
                ]?.sales || 0
            );


        const latest =
            Number(
                trend[
                    trend.length - 1
                ]?.sales || 0
            );


        if (previous === 0) {

            return {

                direction: "neutral",

                percentage: 0,

                label: "No comparison available",

            };

        }


        const percentage =
            (
                (latest - previous) /
                previous
            ) * 100;


        return {

            direction:
                percentage >= 0
                    ? "up"
                    : "down",

            percentage:
                Math.abs(percentage),

            label:
                percentage >= 0
                    ? "Recent sales increased"
                    : "Recent sales decreased",

        };

    }, [trend]);


    // ============================================================
    // DATA FRESHNESS
    // ============================================================

    const freshnessLabel = useMemo(() => {

        if (!lastUpdated) {
            return "Not updated yet";
        }

        return lastUpdated.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }
        );

    }, [lastUpdated]);


    // ============================================================
    // TOP STORE
    // ============================================================

    const topStore = useMemo(() => {

        if (!stores.length) {

            return null;

        }


        return stores.reduce(
            (best, current) => {

                return Number(
                    current?.total_sales || 0
                ) >
                Number(
                    best?.total_sales || 0
                )
                    ? current
                    : best;

            },
            stores[0]
        );

    }, [stores]);


    // ============================================================
    // TOP DEPARTMENT
    // ============================================================

    const topDepartment = useMemo(() => {

        if (!departments.length) {

            return null;

        }


        return departments.reduce(
            (best, current) => {

                return Number(
                    current?.total_sales || 0
                ) >
                Number(
                    best?.total_sales || 0
                )
                    ? current
                    : best;

            },
            departments[0]
        );

    }, [departments]);


    // ============================================================
    // MAX STORE SALES
    // ============================================================

    const maxStoreSales = useMemo(() => {

        return Math.max(

            ...stores.map(
                (store) =>
                    Number(
                        store?.total_sales || 0
                    )
            ),

            1

        );

    }, [stores]);


    // ============================================================
    // MAX DEPARTMENT SALES
    // ============================================================

    const maxDepartmentSales = useMemo(() => {

        return Math.max(

            ...departments.map(
                (department) =>
                    Number(
                        department?.total_sales || 0
                    )
            ),

            1

        );

    }, [departments]);


    // ============================================================
    // BUSINESS INSIGHTS
    // ============================================================

    const insights = useMemo(() => {

        const result = [];


        if (
            trendAnalysis.direction === "up"
        ) {

            result.push({

                type: "positive",

                icon:
                    <ArrowUpRight
                        size={16}
                    />,

                title:
                    "Sales momentum is positive",

                text:
                    `Recent weekly sales increased by ${trendAnalysis.percentage.toFixed(
                        1
                    )}% compared with the previous period.`,

            });

        }


        else if (
            trendAnalysis.direction === "down"
        ) {

            result.push({

                type: "warning",

                icon:
                    <ArrowDownRight
                        size={16}
                    />,

                title:
                    "Recent sales declined",

                text:
                    `Recent weekly sales decreased by ${trendAnalysis.percentage.toFixed(
                        1
                    )}% compared with the previous period.`,

            });

        }


        if (topStore) {

            result.push({

                type: "info",

                icon:
                    <Store
                        size={16}
                    />,

                title:
                    "Leading store",

                text:
                    `${
                        topStore.store_name ||
                        topStore.store_id
                    } currently has the highest historical sales.`,

            });

        }


        if (topDepartment) {

            result.push({

                type: "info",

                icon:
                    <Package
                        size={16}
                    />,

                title:
                    "Leading department",

                text:
                    `${
                        topDepartment.department_name ||
                        topDepartment.department_id
                    } currently contributes the highest historical sales.`,

            });

        }


        return result.slice(
            0,
            3
        );

    }, [
        trendAnalysis,
        topStore,
        topDepartment,
    ]);


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

                    <div className="error-icon">

                        <Activity
                            size={22}
                        />

                    </div>


                    <div>

                        <strong>
                            Unable to load dashboard
                        </strong>

                        <p>
                            We couldn't retrieve the latest
                            analytics data.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="retry-button"
                        onClick={() =>
                            loadDashboard(true)
                        }
                    >

                        <RefreshCw
                            size={15}
                        />

                        Retry

                    </button>

                </div>

            </div>

        );

    }


    // ============================================================
    // DASHBOARD
    // ============================================================

    return (

        <div className="dashboard">


            {/* ================================================= */}
            {/* PAGE HEADER */}
            {/* ================================================= */}

            <header className="page-header">

                <div className="page-header-left">

                    <p className="eyebrow">
                        BUSINESS INTELLIGENCE
                    </p>


                    <h1>
                        Executive Dashboard
                    </h1>


                    <p className="page-description">
                        Monitor sales performance,
                        demand trends and business activity
                        across your organization.
                    </p>

                </div>


                <div className="page-header-right">

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

                </div>

            </header>


            {/* ================================================= */}
            {/* KPI CARDS */}
            {/* ================================================= */}

            <section className="kpi-grid">


                {/* ========================================================
                    TOTAL SALES
                ======================================================== */}

                <StatCard
                    title="Total Historical Sales"
                    value={formatCurrency(
                    overview?.total_historical_sales
                    )}
                    subtitle="Total recorded revenue"
                    icon={
                        <IndianRupee
                            size={19}
                        />
                    }
                    trend={
                        trendAnalysis.direction === "neutral"
                        ? null
                        : `${
                        trendAnalysis.direction === "up"
                            ? "+"
                            : "-"
                        }${trendAnalysis.percentage.toFixed(1)}%`
                    }
                    trendType={
                        trendAnalysis.direction === "down"
                            ? "negative"
                            : trendAnalysis.direction === "neutral"
                            ? "neutral"
                            : "positive"
                    }
                    trendLabel={
                        trendAnalysis.direction === "up"
                            ? "Recent sales growth"
                            : trendAnalysis.direction === "down"
                            ? "Recent sales decline"
                            : "Trend unavailable"
                    }
                />


                {/* ========================================================
                    WEEKLY SALES
                ======================================================== */}

               <StatCard
                    title="Average Weekly Sales"
                    value={formatCurrency(
                        overview?.average_weekly_sales
                    )}
                    subtitle="Average weekly revenue"
                    icon={
                        <TrendingUp
                            size={19}
                        />
                    }
                    trend={
                        trendAnalysis.direction === "neutral"
                            ? null
                            : trendAnalysis.direction === "up"
                                ? "Growing"
                                : "Declining"
                    }
                    trendType={
                        trendAnalysis.direction === "down"
                            ? "negative"
                            : trendAnalysis.direction === "neutral"
                                ? "neutral"
                                : "positive"
                    }
                    trendLabel={
                        trendAnalysis.direction === "up"
                            ? "Positive recent momentum"
                            : trendAnalysis.direction === "down"
                                ? "Monitor recent performance"
                                : "Trend unavailable"
                    }
                />


                {/* ========================================================
                    STORES
                ======================================================== */}

                <StatCard
                    title="Active Stores"
                    value={
                        overview?.total_stores || 0
                    }
                    subtitle="Stores in the system"
                    icon={
                        <Store
                        size={19}
                        />
                    }
                />


                {/* ========================================================
                    DEPARTMENTS
                ======================================================== */}

                <StatCard
                    title="Departments"
                    value={
                         overview?.total_departments || 0
                    }
                    subtitle="Available departments"
                    icon={
                        <Package
                            size={19}
                        />
                    }
                />

            </section>

            {/* ================================================= */}
            {/* SALES PERFORMANCE */}
            {/* ================================================= */}

            <section className="dashboard-card trend-card">


                <div className="section-heading">

                    <div>

                        <div className="section-title-row">

                            <h2>
                                Sales Performance
                            </h2>


                            <span className="live-badge">

                                <Activity
                                    size={12}
                                />

                                Historical

                            </span>

                        </div>


                        <p>
                            Weekly historical sales trend
                        </p>

                    </div>


                    <div className="trend-summary">

                        {trendAnalysis.direction === "up" ? (

                            <TrendingUp
                                size={17}
                            />

                        ) : trendAnalysis.direction === "down" ? (

                            <TrendingDown
                                size={17}
                            />

                        ) : (

                            <Activity
                                size={17}
                            />

                        )}


                        <div>

                            <strong>
                                {trendAnalysis.percentage.toFixed(
                                    1
                                )}%
                            </strong>


                            <span>
                                recent change
                            </span>

                        </div>

                    </div>

                </div>


                <div className="chart-container">

                    <SalesTrendChart
                        data={trend}
                        height={360}
                    />

                </div>

            </section>


            {/* ================================================= */}
            {/* PERFORMANCE GRID */}
            {/* ================================================= */}

            <section className="performance-grid">


                {/* ================================================= */}
                {/* TOP STORES */}
                {/* ================================================= */}

                <div className="dashboard-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Top Stores
                            </h2>

                            <p>
                                Highest historical sales
                            </p>

                        </div>


                        <Store
                            size={19}
                        />

                    </div>


                    <div className="ranking-list">

                        {stores.length ? (

                            stores
                                .slice(0, 5)
                                .map(
                                    (
                                        store,
                                        index
                                    ) => {

                                        const sales =
                                            Number(
                                                store?.total_sales ||
                                                0
                                            );


                                        const width =
                                            (
                                                sales /
                                                maxStoreSales
                                            ) *
                                            100;


                                        return (

                                            <div
                                                className="ranking-row"
                                                key={
                                                    store.store_id
                                                }
                                            >

                                                <div className="rank">
                                                    {index + 1}
                                                </div>


                                                <div className="ranking-info">

                                                    <div className="ranking-main">

                                                        <strong>
                                                            {
                                                                store.store_name ||
                                                                store.store_id
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                store.store_type ||
                                                                "Store"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="ranking-progress">

                                                        <div
                                                            className="ranking-progress-fill"
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>


                                                <strong className="ranking-sales">

                                                    {formatCurrency(
                                                        sales
                                                    )}

                                                </strong>

                                            </div>

                                        );

                                    }
                                )

                        ) : (

                            <div className="empty-ranking">

                                No store data available.

                            </div>

                        )}

                    </div>

                </div>


                {/* ================================================= */}
                {/* TOP DEPARTMENTS */}
                {/* ================================================= */}

                <div className="dashboard-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Top Departments
                            </h2>

                            <p>
                                Highest historical sales
                            </p>

                        </div>


                        <Package
                            size={19}
                        />

                    </div>


                    <div className="ranking-list">

                        {departments.length ? (

                            departments
                                .slice(0, 5)
                                .map(
                                    (
                                        department,
                                        index
                                    ) => {

                                        const sales =
                                            Number(
                                                department?.total_sales ||
                                                0
                                            );


                                        const width =
                                            (
                                                sales /
                                                maxDepartmentSales
                                            ) *
                                            100;


                                        return (

                                            <div
                                                className="ranking-row"
                                                key={
                                                    department.department_id
                                                }
                                            >

                                                <div className="rank">
                                                    {index + 1}
                                                </div>


                                                <div className="ranking-info">

                                                    <div className="ranking-main">

                                                        <strong>
                                                            {
                                                                department.department_name ||
                                                                department.department_id
                                                            }
                                                        </strong>


                                                        <span>
                                                            {
                                                                department.department_category ||
                                                                "General"
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="ranking-progress">

                                                        <div
                                                            className="ranking-progress-fill"
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>


                                                <strong className="ranking-sales">

                                                    {formatCurrency(
                                                        sales
                                                    )}

                                                </strong>

                                            </div>

                                        );

                                    }
                                )

                        ) : (

                            <div className="empty-ranking">

                                No department data available.

                            </div>

                        )}

                    </div>

                </div>

            </section>


            {/* ================================================= */}
            {/* BUSINESS INSIGHTS */}
            {/* ================================================= */}

            <section className="dashboard-card insights-card">

                <div className="section-heading">

                    <div>

                        <h2>
                            Business Insights
                        </h2>


                        <p>
                            Automatically generated from current
                            dashboard data
                        </p>

                    </div>


                    <Activity
                        size={19}
                    />

                </div>


                <div className="insights-grid">

                    {insights.length ? (

                        insights.map(
                            (
                                insight,
                                index
                            ) => (

                                <div
                                    className={`insight-item ${insight.type}`}
                                    key={index}
                                >

                                    <div className="insight-icon">

                                        {insight.icon}

                                    </div>


                                    <div>

                                        <strong>
                                            {insight.title}
                                        </strong>


                                        <p>
                                            {insight.text}
                                        </p>

                                    </div>

                                </div>

                            )
                        )

                    ) : (

                        <div className="empty-state">

                            <Activity
                                size={20}
                            />

                            <span>
                                More data is required to generate
                                business insights.
                            </span>

                        </div>

                    )}

                </div>

            </section>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="dashboard-footer">

                <div className="dashboard-footer-brand">

                    <Activity size={13} />

                    <span>
                        Sales Forecast Intelligence Platform
                    </span>

                </div>


                <div className="dashboard-footer-status">

                    <span className="footer-live-dot"></span>

                    <span>
                        Auto-refresh: 60s
                    </span>


        {lastUpdated && (

            <>

                <span className="footer-divider">
                    •
                </span>

                <span>
                    Updated{" "}
                    {lastUpdated.toLocaleTimeString(
                        "en-IN",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        }
                    )}{" "}
                    IST
                </span>

            </>

        )}

    </div>

</div>

        </div>

    );

}


export default Dashboard;