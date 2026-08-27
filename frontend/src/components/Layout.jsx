import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    TrendingUp,
    History,
    Settings,
    LogOut,
    BarChart3,
} from "lucide-react";

import "./Layout.css";


function Layout({ children }) {

    return (

        <div className="app-shell">

            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="brand">

                    <div className="brand-icon">

                        <BarChart3
                            size={22}
                        />

                    </div>

                    <div className="brand-text">

                        <strong>
                            Sales
                        </strong>

                        <span>
                            Forecast
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive
                                    ? "active"
                                    : ""
                            }`
                        }
                    >

                        <LayoutDashboard
                            size={18}
                        />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    <NavLink
                        to="/forecast"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive
                                    ? "active"
                                    : ""
                            }`
                        }
                    >

                        <TrendingUp
                            size={18}
                        />

                        <span>
                            Forecast
                        </span>

                    </NavLink>


                    <NavLink
                        to="/history"
                        className={({ isActive }) =>
                            `nav-item ${
                                isActive
                                    ? "active"
                                    : ""
                            }`
                        }
                    >

                        <History
                            size={18}
                        />

                        <span>
                            History
                        </span>

                    </NavLink>

                </nav>


                {/* BOTTOM NAV */}

                <div className="sidebar-bottom">

                    <button className="bottom-item">

                        <Settings
                            size={18}
                        />

                        <span>
                            Settings
                        </span>

                    </button>


                    <button className="bottom-item">

                        <LogOut
                            size={18}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* ================================================= */}
            {/* MAIN CONTENT */}
            {/* ================================================= */}

            <main className="main-content">

                {children}

            </main>

        </div>

    );
}


export default Layout;