import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


function ForecastChart({
    data = [],
    height = 350,
}) {

    const formatCurrency = (value) => {

        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 0,
            }
        )}`;

    };


    if (!data.length) {

        return (

            <div
                className="forecast-chart-empty"
                style={{
                    height,
                }}
            >

                <span>
                    Generate a forecast to view results.
                </span>

            </div>

        );

    }


    return (

        <div
            className="forecast-chart"
            style={{
                height,
            }}
        >

            <ResponsiveContainer
                width="100%"
                height="100%"
            >

                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 18,
                        left: 5,
                        bottom: 10,
                    }}
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#edf1f5"
                    />


                    <XAxis
                        dataKey="date"
                        tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={9}
                    />


                    <YAxis
                        tick={{
                            fontSize: 11,
                            fill: "#94a3b8",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                        tickFormatter={(value) =>
                            `₹${Number(
                                value || 0
                            ).toLocaleString(
                                "en-IN",
                                {
                                    notation: "compact",
                                    maximumFractionDigits: 1,
                                }
                            )}`
                        }
                    />


                    <Tooltip
                        cursor={{
                            stroke: "#cbd5e1",
                            strokeDasharray: "4 4",
                        }}
                        contentStyle={{
                            border:
                                "1px solid #e2e8f0",

                            borderRadius: "9px",

                            background: "#ffffff",

                            boxShadow:
                                "0 8px 20px rgba(15, 23, 42, 0.08)",

                            fontSize: "12px",
                        }}
                        labelStyle={{
                            color: "#475569",

                            fontWeight: 600,

                            marginBottom: "4px",
                        }}
                        formatter={(value) =>
                            formatCurrency(value)
                        }
                    />


                    <Line
                        type="monotone"
                        dataKey="forecast"
                        name="Forecast"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{
                            r: 3,
                            strokeWidth: 2,
                            fill: "#ffffff",
                        }}
                        activeDot={{
                            r: 5,
                            strokeWidth: 2,
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}


export default ForecastChart;