import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    TrendingUp,
    History,
    BarChart2,
    Store,
    Package,
    Brain,
    Settings,
    LogOut,
    Circle,
} from "lucide-react";

import "./Layout.css";


/* ============================================================
   SIDEBAR
   ============================================================ */

function SideBar() {

    const getNavClass = ({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`;


    return (

        <aside className="sidebar">

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="brand">

                <img src="/salespulse-icon-64.png"
                     alt="SalesPulse"
                     className="salespulse-logo-image"
                 />


                <div className="brand-text">

                    <strong>
                        SalesPulse
                    </strong>

                    <span>
                        Sales Forecasting & Intelligence
                    </span>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-nav">


                {/* =================================================
                    MAIN
                ================================================= */}

                <div className="nav-section">

                    <div className="nav-section-title">
                        MAIN
                    </div>


                    <NavLink
                        to="/"
                        end
                        className={getNavClass}
                    >

                        <LayoutDashboard size={18} />

                        <span>
                            Dashboard
                        </span>

                    </NavLink>

                </div>


                {/* =================================================
                    FORECASTING
                ================================================= */}

                <div className="nav-section">

                    <div className="nav-section-title">
                        FORECASTING
                    </div>


                    <NavLink
                        to="/forecast"
                        className={getNavClass}
                    >

                        <TrendingUp size={18} />

                        <span>
                            Generate Forecast
                        </span>

                    </NavLink>


                    <NavLink
                        to="/history"
                        className={getNavClass}
                    >

                        <History size={18} />

                        <span>
                            Forecast History
                        </span>

                    </NavLink>

                </div>


                {/* =================================================
                    ANALYTICS
                ================================================= */}

                <div className="nav-section">

                    <div className="nav-section-title">
                        ANALYTICS
                    </div>


                    <NavLink
                        to="/analytics"
                        className={getNavClass}
                    >

                        <BarChart2 size={18} />

                        <span>
                            Analytics
                        </span>

                    </NavLink>

                </div>

            </nav>


            {/* =================================================
                BOTTOM
            ================================================= */}

            <div className="sidebar-bottom">


                <div className="system-status">

                    <Circle
                        size={8}
                        fill="currentColor"
                    />

                    <span>
                        System Online
                    </span>

                </div>

            </div>

        </aside>

    );

}


export default SideBar;