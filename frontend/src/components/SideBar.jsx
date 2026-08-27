import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, History, BarChart3, BarChart2, Settings, LogOut, Circle } from "lucide-react";
import "./Layout.css";

function SideBar() {
    const getNavClass = ({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`;

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-icon"><BarChart3 size={21} /></div>
                <div className="brand-text">
                    <strong>Sales Forecast</strong>
                    <span>Intelligence Platform</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">MAIN</div>
                    <NavLink to="/" end className={getNavClass}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">FORECASTING</div>
                    <NavLink to="/forecast" className={getNavClass}>
                        <TrendingUp size={18} />
                        <span>Generate Forecast</span>
                    </NavLink>
                    <NavLink to="/history" className={getNavClass}>
                        <History size={18} />
                        <span>Forecast History</span>
                    </NavLink>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">ANALYTICS</div>
                    <NavLink to="/analytics" className={getNavClass}>
                        <BarChart2 size={18} />
                        <span>Analytics</span>
                    </NavLink>
                </div>
            </nav>

            <div className="sidebar-bottom">
                <div className="system-status">
                    <Circle size={8} fill="currentColor" />
                    <span>System Online</span>
                </div>

                <button type="button" className="bottom-item">
                    <Settings size={18} />
                    <span>Settings</span>
                </button>

                <button type="button" className="bottom-item">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default SideBar;
