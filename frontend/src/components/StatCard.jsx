function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
    trendType = "positive",
}) {

    return (

        <div className="stat-card">


            {/* ====================================================
                TOP
            ==================================================== */}

            <div className="stat-card-top">

                <div className="stat-card-icon">

                    {icon}

                </div>


                {trend && (

                    <div
                        className={
                            `stat-card-trend ${trendType}`
                        }
                    >

                        {trend}

                    </div>

                )}

            </div>



            {/* ====================================================
                CONTENT
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

                    <p
                        className={
                            `stat-card-trend-label ${trendType}`
                        }
                    >

                        {trendLabel}

                    </p>

                )}

            </div>

        </div>

    );

}


export default StatCard;