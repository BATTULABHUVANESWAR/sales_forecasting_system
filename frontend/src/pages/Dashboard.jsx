import { useEffect, useState } from "react";

import {
    getOverview,
    getStoreAnalytics,
    getDepartmentAnalytics,
    getSalesTrend,
} from "../services/api";

import {
    TrendingUp,
    Store,
    Package,
    IndianRupee,
} from "lucide-react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import "./Dashboard.css";


function Dashboard() {

    const [overview, setOverview] =
        useState(null);

    const [stores, setStores] =
        useState([]);

    const [departments, setDepartments] =
        useState([]);

    const [trend, setTrend] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


    // ============================================================
    // LOAD DASHBOARD DATA
    // ============================================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

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
                    overviewData.overview
                );


                setStores(
                    storeData.stores || []
                );


                setDepartments(
                    departmentData.departments || []
                );


                setTrend(
                    trendData.trend || []
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

            }

        };


        loadDashboard();

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
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                Loading dashboard...

            </div>

        );

    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (

            <div className="dashboard-error">

                {error}

            </div>

        );

    }


    // ============================================================
    // DASHBOARD
    // ============================================================

    return (

        <div className="dashboard">


            {/* ====================================================
                PAGE HEADER
            ==================================================== */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        BUSINESS INTELLIGENCE
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p className="page-description">
                        Monitor sales performance and
                        historical demand trends.
                    </p>

                </div>


                <div className="system-status">

                    <span className="status-dot"></span>

                    System Online

                </div>

            </div>



            {/* ====================================================
                KPI CARDS
            ==================================================== */}

            <div className="kpi-grid">


                {/* TOTAL SALES */}

                <div className="kpi-card">

                    <div className="kpi-icon">

                        <IndianRupee
                            size={20}
                        />

                    </div>


                    <div>

                        <p>
                            Total Historical Sales
                        </p>

                        <h2>
                            {formatCurrency(
                                overview?.total_historical_sales
                            )}
                        </h2>

                    </div>

                </div>



                {/* AVERAGE SALES */}

                <div className="kpi-card">

                    <div className="kpi-icon">

                        <TrendingUp
                            size={20}
                        />

                    </div>


                    <div>

                        <p>
                            Average Weekly Sales
                        </p>

                        <h2>
                            {formatCurrency(
                                overview?.average_weekly_sales
                            )}
                        </h2>

                    </div>

                </div>



                {/* STORES */}

                <div className="kpi-card">

                    <div className="kpi-icon">

                        <Store
                            size={20}
                        />

                    </div>


                    <div>

                        <p>
                            Active Stores
                        </p>

                        <h2>
                            {
                                overview?.total_stores ||
                                0
                            }
                        </h2>

                    </div>

                </div>



                {/* DEPARTMENTS */}

                <div className="kpi-card">

                    <div className="kpi-icon">

                        <Package
                            size={20}
                        />

                    </div>


                    <div>

                        <p>
                            Departments
                        </p>

                        <h2>
                            {
                                overview?.total_departments ||
                                0
                            }
                        </h2>

                    </div>

                </div>

            </div>



            {/* ====================================================
                SALES TREND
            ==================================================== */}

            <section className="dashboard-card trend-card">

                <div className="section-heading">

                    <div>

                        <h2>
                            Sales Trend
                        </h2>

                        <p>
                            Historical weekly sales
                        </p>

                    </div>

                </div>


                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={trend}
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
                                dataKey="sales"
                                strokeWidth={2}
                                dot={false}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </section>



            {/* ====================================================
                PERFORMANCE
            ==================================================== */}

            <div className="performance-grid">


                {/* ==================================================
                    TOP STORES
                ================================================== */}

                <section className="dashboard-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Top Stores
                            </h2>

                            <p>
                                Highest historical sales
                            </p>

                        </div>

                    </div>


                    <div className="ranking-list">

                        {stores
                            .slice(0, 5)
                            .map(
                                (
                                    store,
                                    index
                                ) => (

                                    <div
                                        className="ranking-row"
                                        key={
                                            store.store_id
                                        }
                                    >


                                        {/* RANK */}

                                        <span className="rank">

                                            {index + 1}

                                        </span>



                                        {/* STORE */}

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
                                                        store.store_id
                                                    }

                                                    {" · "}

                                                    Type{" "}

                                                    {
                                                        store.store_type ||
                                                        "—"
                                                    }

                                                </span>

                                            </div>


                                            {/* SALES */}

                                            <strong className="ranking-sales">

                                                {
                                                    formatCurrency(
                                                        store.total_sales
                                                    )
                                                }

                                            </strong>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                </section>



                {/* ==================================================
                    TOP DEPARTMENTS
                ================================================== */}

                <section className="dashboard-card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Top Departments
                            </h2>

                            <p>
                                Highest historical sales
                            </p>

                        </div>

                    </div>


                    <div className="ranking-list">

                        {departments
                            .slice(0, 5)
                            .map(
                                (
                                    department,
                                    index
                                ) => (

                                    <div
                                        className="ranking-row"
                                        key={
                                            department.department_id
                                        }
                                    >


                                        {/* RANK */}

                                        <span className="rank">

                                            {index + 1}

                                        </span>



                                        {/* DEPARTMENT */}

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


                                            {/* SALES */}

                                            <strong className="ranking-sales">

                                                {
                                                    formatCurrency(
                                                        department.total_sales
                                                    )
                                                }

                                            </strong>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                </section>

            </div>

        </div>

    );

}


export default Dashboard;