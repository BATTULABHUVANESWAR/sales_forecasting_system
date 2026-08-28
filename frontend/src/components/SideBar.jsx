import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    TrendingUp,
    History,
    BarChart2,
    Circle,
    X,
} from "lucide-react";

import { logout } from "../services/auth";
import { useNavigate } from "react-router-dom";

import "./Layout.css";


/* ============================================================
   SIDEBAR
   ============================================================ */

function SideBar({
    mobileMenuOpen,
    closeMobileMenu,
}) {

    const navigate = useNavigate();

    const handleLogout = () => {

        logout();

        navigate("/login", {
            replace: true
        });
    };

    const getNavClass = ({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`;


    return (

        <aside
            className={`sidebar ${
                mobileMenuOpen
                    ? "mobile-open"
                    : ""
            }`}
        >

            {/* =================================================
                BRAND
            ================================================= */}

            <div className="brand">

                <img
                    src="/salespulse-icon-64.png"
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


                {/* MOBILE CLOSE BUTTON */}

                <button
                    type="button"
                    className="mobile-sidebar-close"
                    onClick={closeMobileMenu}
                    aria-label="Close navigation"
                >

                    <X size={18} />

                </button>

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
                        onClick={closeMobileMenu}
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
                        onClick={closeMobileMenu}
                    >

                        <TrendingUp size={18} />

                        <span>
                            Generate Forecast
                        </span>

                    </NavLink>


                    <NavLink
                        to="/history"
                        className={getNavClass}
                        onClick={closeMobileMenu}
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
                        onClick={closeMobileMenu}
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

                <div className="sidebar-user">

                    <div className="sidebar-user-avatar">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="sidebar-user-info">

                        <strong>
                            {user?.name || "User"}
                        </strong>

                        <span>
                            {user?.email || ""}
                        </span>

                    </div>

                </div>

                <button
                    type="button"
                    className="bottom-item"
                    onClick={handleLogout}
                >
                    <LogOut size={17} />

                    <span>
                        Logout
                    </span>
                </button>

            </div>

        </aside>

    );

}


export default SideBar;