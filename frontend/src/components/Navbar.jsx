import { useEffect, useState } from "react";

import {
    Activity,
    Clock3,
} from "lucide-react";

import { getHealth } from "../services/api";

import "./Layout.css";


function Navbar() {

    const [systemStatus, setSystemStatus] =
        useState("checking");


    const [currentTime, setCurrentTime] =
        useState(new Date());


    // ============================================================
    // LIVE CLOCK
    // ============================================================

    useEffect(() => {

        const timer = setInterval(() => {

            setCurrentTime(
                new Date()
            );

        }, 1000);


        return () => {

            clearInterval(timer);

        };

    }, []);


    // ============================================================
    // API HEALTH CHECK
    // ============================================================

    useEffect(() => {

        let mounted = true;


        const checkHealth = async () => {

            try {

                await getHealth();

                if (mounted) {

                    setSystemStatus(
                        "online"
                    );

                }

            }

            catch (error) {

                console.error(
                    "Health check failed:",
                    error
                );

                if (mounted) {

                    setSystemStatus(
                        "offline"
                    );

                }

            }

        };


        checkHealth();


        // Check periodically so the indicator
        // reflects the actual backend state.

        const healthTimer =
            setInterval(
                checkHealth,
                30000
            );


        return () => {

            mounted = false;

            clearInterval(
                healthTimer
            );

        };

    }, []);


    // ============================================================
    // DATE / TIME
    // ============================================================

    const formattedDate =
        currentTime.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );


    const formattedTime =
        currentTime.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }
        );


    // ============================================================
    // STATUS TEXT
    // ============================================================

    const statusText = {

        checking: "Connecting...",

        online: "System Online",

        offline: "System Offline",

    };


    return (

        <header className="top-navbar">


            {/* ====================================================
                LEFT
            ==================================================== */}

            <div className="navbar-context">

                <div className="navbar-context-icon">

                    <Activity
                        size={17}
                    />

                </div>


                <div>

                    <strong>
                        Sales Intelligence
                    </strong>

                    <span>
                        Business forecasting platform
                    </span>

                </div>

            </div>


            {/* ====================================================
                RIGHT
            ==================================================== */}

            <div className="navbar-actions">


                {/* SYSTEM STATUS */}

                <div
                    className={
                        `navbar-system-status ${
                            systemStatus
                        }`
                    }
                >

                    <span
                        className="navbar-status-dot"
                    ></span>

                    <span>
                        {
                            statusText[
                                systemStatus
                            ]
                        }
                    </span>

                </div>


                {/* TIME */}

                <div className="navbar-time">

                    <Clock3
                        size={14}
                    />

                    <span>
                        {formattedDate}
                    </span>

                    <span className="navbar-time-divider">
                        •
                    </span>

                    <span>
                        {formattedTime} IST
                    </span>

                </div>

            </div>

        </header>

    );

}


export default Navbar;