"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
    value: number;
    direction?: "up" | "down";
    delay?: number;
    decimalPlaces?: number;
    startValue?: number;
    className?: string;
}

export function NumberTicker({
    value,
    direction = "up",
    delay = 0,
    decimalPlaces = 0,
    startValue = 0,
    className,
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimatedRef = useRef(false);
    const motionValue = useMotionValue(direction === "down" ? value : startValue);
    const springValue = useSpring(motionValue, {
        damping: 60,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const animateToTarget = () => {
        if (hasAnimatedRef.current) return;
        hasAnimatedRef.current = true;
        motionValue.set(direction === "down" ? startValue : value);
    };

    useEffect(() => {
        if (isInView) {
            const timer = window.setTimeout(animateToTarget, delay * 1000);
            return () => window.clearTimeout(timer);
        }
    }, [isInView, delay, value, direction, startValue, motionValue]);

    useEffect(() => {
        const fallbackTimer = window.setTimeout(
            animateToTarget,
            Math.max(delay * 1000 + 900, 900)
        );

        return () => window.clearTimeout(fallbackTimer);
    }, [delay, value, direction, startValue, motionValue]);

    useEffect(
        () =>
            springValue.on("change", (latest) => {
                if (ref.current) {
                    ref.current.textContent = Intl.NumberFormat("en-US", {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces,
                    }).format(Number(latest.toFixed(decimalPlaces)));
                }
            }),
        [springValue, decimalPlaces]
    );

    return (
        <span
            ref={ref}
            className={cn(
                "inline-block tabular-nums tracking-wider",
                className
            )}
        >
            {startValue}
        </span>
    );
}
