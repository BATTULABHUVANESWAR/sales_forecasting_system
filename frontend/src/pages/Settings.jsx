import {
    Settings as SettingsIcon,
    Brain,
    Server,
    Database,
    Cloud,
    CheckCircle2,
    Info,
    SlidersHorizontal,
} from "lucide-react";

import "./Settings.css";


function Settings() {

    return (

        <div className="settings-page">


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header className="settings-header">

                <div>

                    <p className="eyebrow">
                        SYSTEM CONFIGURATION
                    </p>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        View and manage forecasting system
                        configuration and service status.
                    </p>

                </div>


                <div className="settings-status">

                    <span className="settings-status-dot"></span>

                    System Operational

                </div>

            </header>



            {/* ====================================================
                FORECASTING
            ==================================================== */}

            <section className="settings-section">

                <div className="settings-section-heading">

                    <div className="settings-section-icon">

                        <SlidersHorizontal
                            size={18}
                        />

                    </div>

                    <div>

                        <h2>
                            Forecasting Configuration
                        </h2>

                        <p>
                            Current forecasting engine configuration.
                        </p>

                    </div>

                </div>


                <div className="settings-grid">

                    <div className="setting-item">

                        <div>

                            <strong>
                                Forecast Engine
                            </strong>

                            <span>
                                Primary machine learning engine
                            </span>

                        </div>

                        <div className="setting-value">
                            Random Forest
                        </div>

                    </div>


                    <div className="setting-item">

                        <div>

                            <strong>
                                Forecast Frequency
                            </strong>

                            <span>
                                Prediction granularity
                            </span>

                        </div>

                        <div className="setting-value">
                            Weekly
                        </div>

                    </div>


                    <div className="setting-item">

                        <div>

                            <strong>
                                Supported Horizon
                            </strong>

                            <span>
                                Available forecast periods
                            </span>

                        </div>

                        <div className="setting-value">
                            1–12 Weeks
                        </div>

                    </div>


                    <div className="setting-item">

                        <div>

                            <strong>
                                Cold-Start Forecasting
                            </strong>

                            <span>
                                Forecasting for new entities
                            </span>

                        </div>

                        <span className="status-badge enabled">

                            <CheckCircle2
                                size={13}
                            />

                            Enabled

                        </span>

                    </div>

                </div>

            </section>



            {/* ====================================================
                SERVICES
            ==================================================== */}

            <section className="settings-section">

                <div className="settings-section-heading">

                    <div className="settings-section-icon">

                        <Server
                            size={18}
                        />

                    </div>

                    <div>

                        <h2>
                            Service Status
                        </h2>

                        <p>
                            Current availability of connected
                            application services.
                        </p>

                    </div>

                </div>


                <div className="service-grid">


                    <div className="service-card">

                        <div className="service-card-top">

                            <div className="service-icon">

                                <Server
                                    size={18}
                                />

                            </div>

                            <span className="service-online">

                                <span></span>

                                Online

                            </span>

                        </div>


                        <strong>
                            Backend API
                        </strong>

                        <p>
                            Flask forecasting API
                        </p>

                    </div>



                    <div className="service-card">

                        <div className="service-card-top">

                            <div className="service-icon">

                                <Brain
                                    size={18}
                                />

                            </div>

                            <span className="service-online">

                                <span></span>

                                Ready

                            </span>

                        </div>


                        <strong>
                            ML Model
                        </strong>

                        <p>
                            Random Forest forecasting model
                        </p>

                    </div>



                    <div className="service-card">

                        <div className="service-card-top">

                            <div className="service-icon">

                                <Database
                                    size={18}
                                />

                            </div>

                            <span className="service-online">

                                <span></span>

                                Ready

                            </span>

                        </div>


                        <strong>
                            Data Layer
                        </strong>

                        <p>
                            Business sales and master data
                        </p>

                    </div>



                    <div className="service-card">

                        <div className="service-card-top">

                            <div className="service-icon">

                                <Cloud
                                    size={18}
                                />

                            </div>

                            <span className="service-online">

                                <span></span>

                                Connected

                            </span>

                        </div>


                        <strong>
                            Model Repository
                        </strong>

                        <p>
                            Hugging Face model storage
                        </p>

                    </div>

                </div>

            </section>



            {/* ====================================================
                MODEL INFORMATION
            ==================================================== */}

            <section className="settings-section">

                <div className="settings-section-heading">

                    <div className="settings-section-icon">

                        <Brain
                            size={18}
                        />

                    </div>

                    <div>

                        <h2>
                            Model Information
                        </h2>

                        <p>
                            Information about the forecasting
                            model used by the platform.
                        </p>

                    </div>

                </div>


                <div className="model-info">

                    <div className="model-main">

                        <div className="model-icon">

                            <Brain
                                size={23}
                            />

                        </div>


                        <div>

                            <strong>
                                Random Forest Regressor
                            </strong>

                            <span>
                                Weekly Business Sales Forecasting
                            </span>

                        </div>

                    </div>


                    <div className="model-tags">

                        <span>
                            Machine Learning
                        </span>

                        <span>
                            Regression
                        </span>

                        <span>
                            Weekly Forecasting
                        </span>

                        <span>
                            Cold Start
                        </span>

                    </div>

                </div>

            </section>



            {/* ====================================================
                APPLICATION INFORMATION
            ==================================================== */}

            <section className="settings-section">

                <div className="settings-section-heading">

                    <div className="settings-section-icon">

                        <Info
                            size={18}
                        />

                    </div>

                    <div>

                        <h2>
                            Application Information
                        </h2>

                        <p>
                            General information about this deployment.
                        </p>

                    </div>

                </div>


                <div className="application-info">

                    <div>

                        <span>
                            Application
                        </span>

                        <strong>
                            Sales Forecast Intelligence Platform
                        </strong>

                    </div>


                    <div>

                        <span>
                            Version
                        </span>

                        <strong>
                            1.0.0
                        </strong>

                    </div>


                    <div>

                        <span>
                            Environment
                        </span>

                        <strong>
                            Production
                        </strong>

                    </div>


                    <div>

                        <span>
                            Forecasting Frequency
                        </span>

                        <strong>
                            Weekly
                        </strong>

                    </div>

                </div>

            </section>



            {/* ====================================================
                FOOTER NOTE
            ==================================================== */}

            <div className="settings-note">

                <Info
                    size={15}
                />

                <span>
                    These settings describe the current deployed
                    forecasting configuration. Model training and
                    dataset changes are managed through the backend
                    pipeline.
                </span>

            </div>


        </div>

    );

}


export default Settings;