import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    TrendingUp,
    History,
    BarChart3,
    BarChart2,
    Store,
    Package,
    Brain,
    Settings,
    LogOut,
    Circle,
    X,
} from "lucide-react";

import "./Layout.css";


function SideBar({
    mobileMenuOpen,
    closeMobileMenu,
}) {


    const getNavClass = ({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`;


    const handleNavigation = () => {

        if (closeMobileMenu) {

            closeMobileMenu();

        }

    };


    return (

        <aside
            className={
                `sidebar ${
                    mobileMenuOpen
                        ? "mobile-open"
                        : ""
                }`
            }
        >


            {/* ====================================================
                BRAND
            ==================================================== */}

            <div className="brand">

                <div className="brand-icon">

                    <BarChart3
                        size={21}
                    />

                </div>


                <div className="brand-text">

                    <strong>
                        Sales Forecast
                    </strong>

                    <span>
                        Intelligence Platform
                    </span>

                </div>


                {/* MOBILE CLOSE */}

                <button
                    type="button"
                    className="mobile-sidebar-close"
                    onClick={
                        closeMobileMenu
                    }
                    aria-label="Close navigation"
                >

                    <X size={18} />

                </button>

            </div>


            {/* ====================================================
                NAVIGATION
            ==================================================== */}

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
                        className={
                            getNavClass
                        }
                        onClick={
                            handleNavigation
                        }
                    >

                        <LayoutDashboard
                            size={18}
                        />

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
                        className={
                            getNavClass
                        }
                        onClick={
                            handleNavigation
                        }
                    >

                        <TrendingUp
                            size={18}
                        />

                        <span>
                            Generate Forecast
                        </span>

                    </NavLink>


                    <NavLink
                        to="/history"
                        className={
                            getNavClass
                        }
                        onClick={
                            handleNavigation
                        }
                    >

                        <History
                            size={18}
                        />

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


                    <div className="nav-item disabled">

                        <BarChart2
                            size={18}
                        />

                        <span>
                            Analytics
                        </span>

                        <span className="coming-soon">
                            Soon
                        </span>

                    </div>

                </div>


                {/* =================================================
                    MANAGEMENT
                ================================================= */}

                <div className="nav-section">

                    <div className="nav-section-title">
                        MANAGEMENT
                    </div>


                    <div className="nav-item disabled">

                        <Store
                            size={18}
                        />

                        <span>
                            Stores
                        </span>

                        <span className="coming-soon">
                            Soon
                        </span>

                    </div>


                    <div className="nav-item disabled">

                        <Package
                            size={18}
                        />

                        <span>
                            Departments
                        </span>

                        <span className="coming-soon">
                            Soon
                        </span>

                    </div>

                </div>


                {/* =================================================
                    INTELLIGENCE
                ================================================= */}

                <div className="nav-section">

                    <div className="nav-section-title">
                        INTELLIGENCE
                    </div>


                    <div className="nav-item disabled">

                        <Brain
                            size={18}
                        />

                        <span>
                            Model Performance
                        </span>

                        <span className="coming-soon">
                            Soon
                        </span>

                    </div>

                </div>

            </nav>


            {/* ====================================================
                BOTTOM
            ==================================================== */}

            <div className="sidebar-bottom">


                {/* SYSTEM STATUS */}

                <div className="system-status">

                    <Circle
                        size={8}
                        fill="currentColor"
                    />

                    <span>
                        System Online
                    </span>

                </div>


                {/* SETTINGS */}

                <NavLink
                    to="/settings"
                    className={
                        getNavClass
                    }
                    onClick={
                        handleNavigation
                    }
                >

                    <Settings
                        size={18}
                    />

                    <span>
                        Settings
                    </span>

                </NavLink>


                {/* LOGOUT */}

                <button
                    type="button"
                    className="bottom-item"
                >

                    <LogOut
                        size={18}
                    />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>

    );

}


export default SideBar;