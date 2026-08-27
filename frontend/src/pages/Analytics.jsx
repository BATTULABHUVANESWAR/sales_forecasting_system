import { useEffect, useMemo, useState } from "react";

import {
    Activity,
    BarChart3,
    Package,
    RefreshCw,
    Store,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import {
    getOverview,
    getStoreAnalytics,
    getDepartmentAnalytics,
    getSalesTrend,
} from "../services/api";

import "./Analytics.css";


function Analytics() {

    const [overview, setOverview] = useState({});

    const [stores, setStores] = useState([]);

    const [departments, setDepartments] = useState([]);

    const [trend, setTrend] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");


    // ============================================================
    // LOAD ANALYTICS DATA
    // ============================================================

    const loadAnalytics = async (
        manual = false
    ) => {

        try {

            if (manual) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");


            const [
                overviewResponse,
                storeResponse,
                departmentResponse,
                trendResponse,
            ] = await Promise.all([

                getOverview(),

                getStoreAnalytics(),

                getDepartmentAnalytics(),

                getSalesTrend(),

            ]);


            setOverview(
                overviewResponse?.overview || {}
            );


            setStores(
                storeResponse?.stores || []
            );


            setDepartments(
                departmentResponse?.departments || []
            );


            setTrend(
                trendResponse?.trend || []
            );

        }

        catch (err) {

            console.error(
                "Analytics loading failed:",
                err
            );

            setError(
                "Unable to load analytics data."
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

        loadAnalytics();

    }, []);


    // ============================================================
    // FORMAT CURRENCY
    // ============================================================

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


    // ============================================================
    // TREND DATA
    // ============================================================

    const trendData = useMemo(() => {

        return trend.map(
            (item) => ({

                ...item,

                label:
                    new Date(
                        `${item.date}T00:00:00`
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                        }
                    ),

            })
        );

    }, [trend]);


    // ============================================================
    // TOP DATA
    // ============================================================

    const topStores = useMemo(

        () =>
            stores.slice(
                0,
                8
            ),

        [stores]

    );


    const topDepartments = useMemo(

        () =>
            departments.slice(
                0,
                8
            ),

        [departments]

    );


    // ============================================================
    // TREND ANALYSIS
    // ============================================================

    const trendAnalysis = useMemo(() => {

        if (
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


        if (
            previous === 0
        ) {

            return {

                direction: "neutral",

                percentage: 0,

                label:
                    "No comparison available",

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
                Math.abs(
                    percentage
                ),

            label:
                percentage >= 0
                    ? "Recent sales increased"
                    : "Recent sales decreased",

        };

    }, [trend]);


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="analytics-page-state">

                <RefreshCw
                    size={20}
                    className="spin"
                />

                <span>
                    Loading business analytics...
                </span>

            </div>

        );

    }


    // ============================================================
    // ERROR
    // ============================================================

    if (
        error &&
        !overview?.total_historical_sales
    ) {

        return (

            <div className="analytics-page">

                <div className="analytics-error">

                    <Activity
                        size={20}
                    />


                    <div>

                        <strong>
                            Unable to load analytics
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            loadAnalytics(true)
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


    return (

        <div className="analytics-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="analytics-header">

                <div>

                    <p className="eyebrow">
                        BUSINESS INTELLIGENCE
                    </p>


                    <h1>
                        Analytics
                    </h1>


                    <p>
                        Explore detailed sales performance
                        across stores, departments and time.
                    </p>

                </div>


                <button
                    type="button"
                    className="analytics-refresh"
                    onClick={() =>
                        loadAnalytics(true)
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
                        : "Refresh Data"
                    }

                </button>

            </header>


            {/* ====================================================
                ERROR
            ==================================================== */}

            {error && (

                <div className="analytics-inline-error">

                    <Activity
                        size={15}
                    />

                    {error}

                </div>

            )}


            {/* ====================================================
                OVERVIEW
            ==================================================== */}

            <section className="analytics-kpi-grid">


                <div className="analytics-kpi">

                    <div className="analytics-kpi-icon">

                        <BarChart3
                            size={19}
                        />

                    </div>


                    <div>

                        <span>
                            Total Historical Sales
                        </span>

                        <strong>
                            {formatCurrency(
                                overview.total_historical_sales
                            )}
                        </strong>

                        <small>
                            Recorded historical revenue
                        </small>

                    </div>

                </div>


                <div className="analytics-kpi">

                    <div className="analytics-kpi-icon">

                        <TrendingUp
                            size={19}
                        />

                    </div>


                    <div>

                        <span>
                            Average Weekly Sales
                        </span>

                        <strong>
                            {formatCurrency(
                                overview.average_weekly_sales
                            )}
                        </strong>

                        <small>
                            Average weekly revenue
                        </small>

                    </div>

                </div>


                <div className="analytics-kpi">

                    <div className="analytics-kpi-icon">

                        <Store
                            size={19}
                        />

                    </div>


                    <div>

                        <span>
                            Active Stores
                        </span>

                        <strong>
                            {overview.total_stores || 0}
                        </strong>

                        <small>
                            Stores in historical data
                        </small>

                    </div>

                </div>


                <div className="analytics-kpi">

                    <div className="analytics-kpi-icon">

                        <Package
                            size={19}
                        />

                    </div>


                    <div>

                        <span>
                            Departments
                        </span>

                        <strong>
                            {overview.total_departments || 0}
                        </strong>

                        <small>
                            Departments in historical data
                        </small>

                    </div>

                </div>

            </section>


            {/* ====================================================
                SALES PERFORMANCE
            ==================================================== */}

            <section className="analytics-card">

                <div className="analytics-section-heading">

                    <div>

                        <div className="analytics-title-row">

                            <h2>
                                Sales Performance
                            </h2>


                            <span
                                className={
                                    `analytics-trend-badge ${
                                        trendAnalysis.direction
                                    }`
                                }
                            >

                                {trendAnalysis.direction === "up" ? (

                                    <TrendingUp
                                        size={12}
                                    />

                                ) : trendAnalysis.direction === "down" ? (

                                    <TrendingDown
                                        size={12}
                                    />

                                ) : (

                                    <Activity
                                        size={12}
                                    />

                                )}

                                {trendAnalysis.percentage.toFixed(
                                    1
                                )}%

                            </span>

                        </div>


                        <p>
                            Historical weekly sales performance
                            across the recorded period.
                        </p>

                    </div>


                    <span className="analytics-card-meta">

                        {trend.length} periods

                    </span>

                </div>


                <div className="analytics-chart trend-chart">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={trendData}
                            margin={{
                                top: 10,
                                right: 15,
                                left: 5,
                                bottom: 5,
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />


                            <XAxis
                                dataKey="label"
                                tick={{
                                    fontSize: 10,
                                }}
                                interval="preserveStartEnd"
                            />


                            <YAxis
                                tick={{
                                    fontSize: 10,
                                }}
                                tickFormatter={
                                    (value) =>
                                        `₹${(
                                            value /
                                            100000
                                        ).toFixed(0)}L`
                                }
                            />


                            <Tooltip
                                formatter={
                                    (value) =>
                                        formatCurrency(
                                            value
                                        )
                                }
                                labelFormatter={
                                    (label) =>
                                        `Period: ${label}`
                                }
                            />


                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{
                                    r: 5,
                                }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </section>


            {/* ====================================================
                TOP PERFORMANCE
            ==================================================== */}

            <section className="analytics-two-column">


                {/* TOP STORES */}

                <div className="analytics-card">

                    <div className="analytics-section-heading">

                        <div>

                            <h2>
                                Top Stores
                            </h2>

                            <p>
                                Ranked by total historical sales.
                            </p>

                        </div>


                        <Store
                            size={19}
                            className="analytics-heading-icon"
                        />

                    </div>


                    <div className="analytics-chart small-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={topStores}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 18,
                                    left: 4,
                                    bottom: 0,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />


                                <XAxis
                                    type="number"
                                    tick={{
                                        fontSize: 9,
                                    }}
                                    tickFormatter={
                                        (value) =>
                                            `₹${(
                                                value /
                                                1000000
                                            ).toFixed(0)}M`
                                    }
                                />


                                <YAxis
                                    type="category"
                                    dataKey="store_name"
                                    width={100}
                                    tick={{
                                        fontSize: 10,
                                    }}
                                />


                                <Tooltip
                                    formatter={
                                        (value) =>
                                            formatCurrency(
                                                value
                                            )
                                    }
                                />


                                <Bar
                                    dataKey="total_sales"
                                    fill="#2563eb"
                                    radius={[
                                        0,
                                        5,
                                        5,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* TOP DEPARTMENTS */}

                <div className="analytics-card">

                    <div className="analytics-section-heading">

                        <div>

                            <h2>
                                Top Departments
                            </h2>

                            <p>
                                Ranked by total historical sales.
                            </p>

                        </div>


                        <Package
                            size={19}
                            className="analytics-heading-icon"
                        />

                    </div>


                    <div className="analytics-chart small-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={topDepartments}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 18,
                                    left: 4,
                                    bottom: 0,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                />


                                <XAxis
                                    type="number"
                                    tick={{
                                        fontSize: 9,
                                    }}
                                    tickFormatter={
                                        (value) =>
                                            `₹${(
                                                value /
                                                1000000
                                            ).toFixed(0)}M`
                                    }
                                />


                                <YAxis
                                    type="category"
                                    dataKey="department_name"
                                    width={110}
                                    tick={{
                                        fontSize: 10,
                                    }}
                                />


                                <Tooltip
                                    formatter={
                                        (value) =>
                                            formatCurrency(
                                                value
                                            )
                                    }
                                />


                                <Bar
                                    dataKey="total_sales"
                                    fill="#7c3aed"
                                    radius={[
                                        0,
                                        5,
                                        5,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </section>


            {/* ====================================================
                BUSINESS SNAPSHOT
            ==================================================== */}

            <section className="analytics-card">

                <div className="analytics-section-heading">

                    <div>

                        <h2>
                            Business Snapshot
                        </h2>

                        <p>
                            Key observations from the
                            historical sales dataset.
                        </p>

                    </div>


                    <Activity
                        size={19}
                        className="analytics-heading-icon"
                    />

                </div>


                <div className="analytics-insights">


                    <div className="analytics-insight">

                        <Store
                            size={17}
                        />


                        <div>

                            <span>
                                Leading Store
                            </span>

                            <strong>
                                {
                                    topStores[0]
                                        ?.store_name ||
                                    "—"
                                }
                            </strong>

                            <small>
                                {
                                    topStores[0]
                                        ? formatCurrency(
                                            topStores[0]
                                                .total_sales
                                        )
                                        : "No data"
                                }
                            </small>

                        </div>

                    </div>


                    <div className="analytics-insight">

                        <Package
                            size={17}
                        />


                        <div>

                            <span>
                                Leading Department
                            </span>

                            <strong>
                                {
                                    topDepartments[0]
                                        ?.department_name ||
                                    "—"
                                }
                            </strong>

                            <small>
                                {
                                    topDepartments[0]
                                        ? formatCurrency(
                                            topDepartments[0]
                                                .total_sales
                                        )
                                        : "No data"
                                }
                            </small>

                        </div>

                    </div>


                    <div className="analytics-insight">

                        <TrendingUp
                            size={17}
                        />


                        <div>

                            <span>
                                Sales Trend
                            </span>

                            <strong>
                                {
                                    trendAnalysis.direction ===
                                    "up"
                                        ? "Growing"
                                        : trendAnalysis.direction ===
                                          "down"
                                            ? "Declining"
                                            : "Stable"
                                }
                            </strong>

                            <small>
                                {
                                    trendAnalysis.percentage.toFixed(
                                        1
                                    )
                                }
                                % recent change
                            </small>

                        </div>

                    </div>


                    <div className="analytics-insight">

                        <BarChart3
                            size={17}
                        />


                        <div>

                            <span>
                                Trend Coverage
                            </span>

                            <strong>
                                {trend.length} weeks
                            </strong>

                            <small>
                                weekly historical periods analyzed
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* ====================================================
                FOOTER
            ==================================================== */}

            <footer className="analytics-footer">

                <span>
                    Sales Forecast Intelligence Platform
                </span>

                <span>
                    Detailed historical analysis
                </span>

            </footer>

        </div>

    );

}


export default Analytics;