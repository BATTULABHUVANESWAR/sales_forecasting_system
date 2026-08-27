import { useState } from "react";

import {
    Menu,
    X,
} from "lucide-react";

import SideBar from "./SideBar";
import Navbar from "./Navbar";

import "./Layout.css";


function Layout({ children }) {

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);


    const closeMobileMenu = () => {

        setMobileMenuOpen(false);

    };


    return (

        <div className="app-shell">


            {/* ====================================================
                MOBILE OVERLAY
            ==================================================== */}

            {mobileMenuOpen && (

                <div
                    className="mobile-overlay"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />

            )}


            {/* ====================================================
                SIDEBAR
            ==================================================== */}

            <SideBar
                mobileMenuOpen={
                    mobileMenuOpen
                }
                closeMobileMenu={
                    closeMobileMenu
                }
            />


            {/* ====================================================
                MAIN AREA
            ==================================================== */}

            <div className="main-area">


                {/* =================================================
                    MOBILE MENU BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={() =>
                        setMobileMenuOpen(
                            (current) =>
                                !current
                        )
                    }
                    aria-label={
                        mobileMenuOpen
                            ? "Close navigation"
                            : "Open navigation"
                    }
                >

                    {mobileMenuOpen ? (

                        <X size={20} />

                    ) : (

                        <Menu size={20} />

                    )}

                </button>


                <Navbar />


                <main className="main-content">

                    {children}

                </main>

            </div>

        </div>

    );

}


export default Layout;