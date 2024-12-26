import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface ChartProps {
  monthlyData: Array<{
    month: string;
    count: number;
  }>;
}

export default function Chart({ monthlyData }: ChartProps) {
  const { isDark } = useTheme();

  // Format month strings to be more readable
  const formattedData = monthlyData.map(item => ({
    name: new Date(item.month + '-01').toLocaleString('default', { month: 'short' }),
    value: item.count
  }));

  return (
    <div className={cn(
      "rounded-xl overflow-hidden",
      isDark 
        ? "bg-black/20 border border-white/10" 
        : "bg-white/10 border border-black/10",
      "h-[400px]"
    )}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-black"
          )}>
            AI Interactions
          </h3>
          <div className={cn(
            "text-sm",
            isDark ? "text-white/60" : "text-black/60"
          )}>
            Last 6 months
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#ffffff10" : "#00000010"}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={isDark ? "#ffffff60" : "#00000060"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              stroke={isDark ? "#ffffff60" : "#00000060"}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
              }}
              labelStyle={{
                color: isDark ? '#ffffff80' : '#00000080',
                fontSize: '12px',
                fontWeight: 500,
                marginBottom: '4px'
              }}
              itemStyle={{
                color: isDark ? '#ffffffcc' : '#000000cc',
                fontSize: '14px',
                fontWeight: 600
              }}
              cursor={{
                stroke: isDark ? '#ffffff20' : '#00000020',
                strokeWidth: 1
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isDark ? "#8b5cf6" : "#7c3aed"}
              strokeWidth={2.5}
              dot={{
                fill: isDark ? "#8b5cf6" : "#7c3aed",
                r: 4,
                strokeWidth: 2,
                stroke: isDark ? "#000000" : "#ffffff"
              }}
              activeDot={{
                r: 6,
                stroke: isDark ? "#ffffff40" : "#00000040",
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}