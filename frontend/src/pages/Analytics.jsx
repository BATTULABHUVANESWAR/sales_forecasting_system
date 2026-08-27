import { useEffect, useMemo, useState } from "react";
import {
    Activity, BarChart3, Package, RefreshCw, Store, TrendingUp
} from "lucide-react";
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import {
    getOverview, getStoreAnalytics,
    getDepartmentAnalytics, getSalesTrend
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

    const loadAnalytics = async (manual = false) => {
        try {
            manual ? setRefreshing(true) : setLoading(true);
            setError("");

            const [o, s, d, t] = await Promise.all([
                getOverview(),
                getStoreAnalytics(),
                getDepartmentAnalytics(),
                getSalesTrend(),
            ]);

            setOverview(o?.overview || {});
            setStores(s?.stores || []);
            setDepartments(d?.departments || []);
            setTrend(t?.trend || []);
        } catch (err) {
            console.error("Analytics loading failed:", err);
            setError("Unable to load analytics data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const currency = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
        })}`;

    const trendData = useMemo(() => trend.map(item => ({
        ...item,
        label: new Date(`${item.date}T00:00:00`).toLocaleDateString(
            "en-IN", { day: "2-digit", month: "short" }
        ),
    })), [trend]);

    const topStores = useMemo(() => stores.slice(0, 8), [stores]);
    const topDepartments = useMemo(
        () => departments.slice(0, 8),
        [departments]
    );

    if (loading) {
        return (
            <div className="analytics-page-state">
                <RefreshCw size={20} className="spin" />
                Loading business analytics...
            </div>
        );
    }

    if (error && !overview?.total_historical_sales) {
        return (
            <div className="analytics-page">
                <div className="analytics-error">
                    <Activity size={20} />
                    <div>
                        <strong>Unable to load analytics</strong>
                        <p>{error}</p>
                    </div>
                    <button onClick={() => loadAnalytics(true)}>
                        <RefreshCw size={15} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <header className="analytics-header">
                <div>
                    <p className="eyebrow">BUSINESS INTELLIGENCE</p>
                    <h1>Analytics</h1>
                    <p>Understand sales performance across stores, departments, and time.</p>
                </div>

                <button
                    className="analytics-refresh"
                    onClick={() => loadAnalytics(true)}
                    disabled={refreshing}
                >
                    <RefreshCw size={15} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </header>

            {error && <div className="analytics-inline-error">
                <Activity size={15} /> {error}
            </div>}

            <section className="analytics-kpi-grid">
                <div className="analytics-kpi">
                    <div className="analytics-kpi-icon"><BarChart3 size={19} /></div>
                    <div><span>Total Historical Sales</span>
                        <strong>{currency(overview.total_historical_sales)}</strong>
                        <small>Recorded historical revenue</small>
                    </div>
                </div>

                <div className="analytics-kpi">
                    <div className="analytics-kpi-icon"><TrendingUp size={19} /></div>
                    <div><span>Average Weekly Sales</span>
                        <strong>{currency(overview.average_weekly_sales)}</strong>
                        <small>Average weekly revenue</small>
                    </div>
                </div>

                <div className="analytics-kpi">
                    <div className="analytics-kpi-icon"><Store size={19} /></div>
                    <div><span>Active Stores</span>
                        <strong>{overview.total_stores || 0}</strong>
                        <small>Stores in historical data</small>
                    </div>
                </div>

                <div className="analytics-kpi">
                    <div className="analytics-kpi-icon"><Package size={19} /></div>
                    <div><span>Departments</span>
                        <strong>{overview.total_departments || 0}</strong>
                        <small>Departments in historical data</small>
                    </div>
                </div>
            </section>

            <section className="analytics-card">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Historical Sales Trend</h2>
                        <p>Latest 52 recorded periods.</p>
                    </div>
                    <span className="analytics-card-meta">52 periods</span>
                </div>

                <div className="analytics-chart trend-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 10 }}
                                interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10 }}
                                tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                            <Tooltip
                                formatter={value => currency(value)}
                                labelFormatter={label => `Period: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="analytics-two-column">
                <div className="analytics-card">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Top Stores</h2>
                            <p>Ranked by total historical sales.</p>
                        </div>
                    </div>

                    <div className="analytics-chart small-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topStores} layout="vertical"
                                margin={{ left: 5, right: 15 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 9 }}
                                    tickFormatter={v => `₹${(v / 1000000).toFixed(0)}M`} />
                                <YAxis type="category" dataKey="store_name"
                                    width={100} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={value => currency(value)} />
                                <Bar dataKey="total_sales" fill="#2563eb" radius={[0, 5, 5, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-section-heading">
                        <div>
                            <h2>Top Departments</h2>
                            <p>Ranked by total historical sales.</p>
                        </div>
                    </div>

                    <div className="analytics-chart small-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topDepartments} layout="vertical"
                                margin={{ left: 5, right: 15 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 9 }}
                                    tickFormatter={v => `₹${(v / 1000000).toFixed(0)}M`} />
                                <YAxis type="category" dataKey="department_name"
                                    width={110} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={value => currency(value)} />
                                <Bar dataKey="total_sales" fill="#7c3aed" radius={[0, 5, 5, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            <section className="analytics-card">
                <div className="analytics-section-heading">
                    <div>
                        <h2>Business Snapshot</h2>
                        <p>Key observations from the historical dataset.</p>
                    </div>
                </div>

                <div className="analytics-insights">
                    <div className="analytics-insight">
                        <Store size={17} />
                        <div><span>Leading Store</span>
                            <strong>{topStores[0]?.store_name || "—"}</strong>
                            <small>{topStores[0] ? currency(topStores[0].total_sales) : "No data"}</small>
                        </div>
                    </div>

                    <div className="analytics-insight">
                        <Package size={17} />
                        <div><span>Leading Department</span>
                            <strong>{topDepartments[0]?.department_name || "—"}</strong>
                            <small>{topDepartments[0] ? currency(topDepartments[0].total_sales) : "No data"}</small>
                        </div>
                    </div>

                    <div className="analytics-insight">
                        <TrendingUp size={17} />
                        <div><span>Average Weekly Sales</span>
                            <strong>{currency(overview.average_weekly_sales)}</strong>
                            <small>Across historical records</small>
                        </div>
                    </div>

                    <div className="analytics-insight">
                        <BarChart3 size={17} />
                        <div><span>Trend Coverage</span>
                            <strong>{trend.length}</strong>
                            <small>Latest periods available</small>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="analytics-footer">
                <span>Sales Forecast Intelligence Platform</span>
                <span>Analytics from historical sales data</span>
            </footer>
        </div>
    );
}

export default Analytics;
