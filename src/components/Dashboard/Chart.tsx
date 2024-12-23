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
        ? "bg-black/40 border border-white/10 backdrop-blur-md"
        : "bg-white/40 border border-black/10 backdrop-blur-md"
    )}>
      <h3 className={cn(
        "text-lg font-semibold mb-4",
        isDark ? "text-white/90" : "text-black"
      )}>AI Interactions</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? "#ffffff20" : "#00000020"} 
          />
          <XAxis 
            dataKey="name" 
            stroke={isDark ? "#ffffff90" : "#00000090"} 
          />
          <YAxis 
            stroke={isDark ? "#ffffff90" : "#00000090"} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
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

