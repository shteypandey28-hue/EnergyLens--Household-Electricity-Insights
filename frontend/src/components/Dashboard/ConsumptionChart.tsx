import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface DataPoint {
    date: string;
    usage: number;
}

interface ConsumptionChartProps {
    data: DataPoint[];
    timeRange?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500"></div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {payload[0].value.toFixed(2)} <span className="text-xs text-gray-500">kWh</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data, timeRange = '7d' }) => {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                    <defs>
                        <linearGradient id="colorUsageGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#84cc16" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                        strokeOpacity={0.3}
                        className="dark:stroke-gray-700"
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                        dy={15}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                        dx={-10}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                            stroke: 'url(#strokeGradient)',
                            strokeWidth: 2,
                            strokeDasharray: '5 5'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="usage"
                        stroke="url(#strokeGradient)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorUsageGradient)"
                        animationDuration={800}
                        animationEasing="ease-in-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
