import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
];

export default function Chart() {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "p-4 rounded-xl h-[400px] relative z-10",
      isDark
        ? "bg-white/5 backdrop-blur-lg border border-white/10"
        : "bg-black/5 backdrop-blur-lg border border-black/10"
    )}>
      <h3 className={cn(
        "text-lg font-semibold mb-4",
        isDark ? "text-white" : "text-black"
      )}>AI Interactions</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? "#ffffff10" : "#00000010"} 
          />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? "#ffffff60" : "#00000060"} 
          />
          <YAxis 
            stroke={isDark ? "#ffffff60" : "#00000060"} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#000000' : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}
            labelStyle={{ color: isDark ? '#ffffff' : '#000000' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ fill: '#8b5cf6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

