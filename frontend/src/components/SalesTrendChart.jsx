import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


function SalesTrendChart({
    data = [],
    height = 320,
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
                className="sales-trend-empty"
                style={{
                    height,
                }}
            >

                <span>
                    No sales trend data available.
                </span>

            </div>

        );

    }


    return (

        <div
            className="sales-trend-chart"
            style={{
                width: "100%",
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
                        right: 12,
                        left: 0,
                        bottom: 5,
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
                        width={65}
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
                        dataKey="sales"
                        name="Sales"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#ffffff",
                        }}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}


export default SalesTrendChart;