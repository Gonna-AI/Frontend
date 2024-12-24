import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface AnalogClockProps {
  time: Date;
  size?: number;
}

export default function AnalogClock({ time, size = 24 }: AnalogClockProps) {
  const { isDark } = useTheme();
  const center = size / 2;
  const strokeWidth = size * 0.08;

  // Calculate hand angles
  const minuteAngle = ((time.getMinutes() + time.getSeconds() / 60) * 360) / 60;
  const hourAngle = ((time.getHours() % 12 + time.getMinutes() / 60) * 360) / 12;

  // Calculate hand lengths
  const hourLength = size * 0.35;
  const minuteLength = size * 0.45;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Hour hand */}
      <line
        x1={center}
        y1={center}
        x2={center + Math.sin((hourAngle * Math.PI) / 180) * hourLength}
        y2={center - Math.cos((hourAngle * Math.PI) / 180) * hourLength}
        stroke={isDark ? "white" : "black"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Minute hand */}
      <line
        x1={center}
        y1={center}
        x2={center + Math.sin((minuteAngle * Math.PI) / 180) * minuteLength}
        y2={center - Math.cos((minuteAngle * Math.PI) / 180) * minuteLength}
        stroke={isDark ? "white" : "black"}
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle
        cx={center}
        cy={center}
        r={strokeWidth * 0.4}
        fill={isDark ? "white" : "black"}
      />
    </svg>
  );
} 