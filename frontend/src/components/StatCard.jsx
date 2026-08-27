function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
}) {

    return (

        <div className="stat-card">

            {/* ====================================================
                TOP ROW
            ==================================================== */}

            <div className="stat-card-top">

                {/* ICON — TOP LEFT */}

                <div
                    className="stat-card-icon"
                    aria-hidden="true"
                >
                    {icon}
                </div>


                {/* TREND — TOP RIGHT */}

                {trend && (

                    <span className="stat-card-trend-badge">
                        {trend}
                    </span>

                )}

            </div>


            {/* ====================================================
                CARD CONTENT
            ==================================================== */}

            <div className="stat-card-content">

                <p className="stat-card-title">
                    {title}
                </p>


                <h3 className="stat-card-value">
                    {value}
                </h3>


                {subtitle && (

                    <p className="stat-card-subtitle">
                        {subtitle}
                    </p>

                )}


                {trendLabel && (

                    <p className="stat-card-trend-label">
                        {trendLabel}
                    </p>

                )}

            </div>

        </div>

    );

}


export default StatCard;