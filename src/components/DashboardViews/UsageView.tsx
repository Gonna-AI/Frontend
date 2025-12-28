import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import DateRangePicker from './DateRangePicker';

const data = [
    { name: 'Dec 1', voice: 120, text: 45, tokens: 2400 },
    { name: 'Dec 5', voice: 132, text: 55, tokens: 1800 },
    { name: 'Dec 10', voice: 101, text: 80, tokens: 2200 },
    { name: 'Dec 15', voice: 134, text: 60, tokens: 2600 },
    { name: 'Dec 20', voice: 90, text: 90, tokens: 3000 },
    { name: 'Dec 25', voice: 230, text: 30, tokens: 1500 },
    { name: 'Dec 28', voice: 150, text: 40, tokens: 2100 },
];

function Card({ title, value, subtitle, subtitle2, isDark }: any) {
    return (
        <div className={cn(
            "p-6 rounded-xl border flex flex-col justify-between h-40",
            isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
        )}>
            <div>
                <h3 className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-black/60")}>{title}</h3>
                <div className={cn("text-4xl font-semibold mt-2", isDark ? "text-white" : "text-black")}>{value}</div>
            </div>
            <div>
                <p className={cn("text-xs font-medium", isDark ? "text-white" : "text-black")}>{subtitle}</p>
                {subtitle2 && <p className={cn("text-xs", isDark ? "text-white/40" : "text-black/40")}>{subtitle2}</p>}
            </div>
        </div>
    );
}

export default function UsageView({ isDark = true }: { isDark?: boolean }) {
    const [dateRange, setDateRange] = useState({
        start: new Date(2025, 10, 28),
        end: new Date(2025, 11, 28)
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>API Usage Dashboard</h1>
                    </div>
                    <p className={cn("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        Monitor your API usage, credits, and detailed call logs
                    </p>
                </div>

                <DateRangePicker
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onChange={(start, end) => setDateRange({ start, end })}
                    isDark={isDark}
                />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    title="Current Balance"
                    value="50 credits"
                    subtitle="Available credits"
                    subtitle2="Prepaid balance"
                    isDark={isDark}
                />
                <Card
                    title="Requests"
                    value="152"
                    subtitle="API requests made"
                    subtitle2="11/28/2025 - 12/28/2025"
                    isDark={isDark}
                />
                <Card
                    title="Spend"
                    value="340 credits"
                    subtitle="Total API cost"
                    subtitle2="11/28/2025 - 12/28/2025"
                    isDark={isDark}
                />
            </div>

            {/* Chart */}
            <div className={cn(
                "p-6 rounded-xl border min-h-[400px]",
                isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
            )}>
                <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-black")}>API Usage Over Time</h3>
                <p className={cn("text-sm mb-6", isDark ? "text-white/40" : "text-black/40")}>Daily breakdown of usage by type</p>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke={isDark ? "#666" : "#999"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke={isDark ? "#666" : "#999"}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#000' : '#fff',
                                    borderColor: isDark ? '#333' : '#ddd',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="voice" name="Voice Minutes" stackId="a" fill="#3b82f6" barSize={20} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="text" name="Text Messages" stackId="a" fill="#10b981" barSize={20} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="tokens" name="LLM Tokens (1k)" stackId="a" fill="#f59e0b" barSize={20} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className={cn(
                "p-8 rounded-xl border min-h-[300px] flex flex-col",
                isDark ? "bg-black/40 border-white/10" : "bg-white border-black/10"
            )}>
                <h3 className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-black")}>Detailed API Call Logs</h3>
                <p className={cn("text-sm mb-6", isDark ? "text-white/40" : "text-black/40")}>Complete history of all API requests</p>

                <div className={cn(
                    "flex-1 flex flex-col items-center justify-center border-dashed border-2 rounded-lg py-12",
                    isDark ? "border-white/5" : "border-black/5"
                )}>
                    <p className={cn("text-sm font-medium", isDark ? "text-white/40" : "text-black/40")}>No API calls yet</p>
                    <p className={cn("text-xs mt-1", isDark ? "text-white/20" : "text-black/20")}>Your API usage will appear here once you make your first call</p>
                </div>
            </div>
        </div>
    );
}
