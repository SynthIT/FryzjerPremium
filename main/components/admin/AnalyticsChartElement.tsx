"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type ChartPoint = { name: string; value: number; ym?: number };

function mergeChartSeries(
    produkty: ChartPoint[],
    kursy: ChartPoint[],
): { name: string; ym: number; produkty?: number; kursy?: number }[] {
    const byYm = new Map<
        number,
        { name: string; ym: number; produkty?: number; kursy?: number }
    >();
    for (const p of produkty) {
        const ym = p.ym ?? 0;
        const row = byYm.get(ym) ?? { name: p.name, ym };
        row.produkty = p.value;
        byYm.set(ym, row);
    }
    for (const k of kursy) {
        const ym = k.ym ?? 0;
        const row = byYm.get(ym) ?? { name: k.name, ym };
        row.kursy = k.value;
        byYm.set(ym, row);
    }
    return Array.from(byYm.values()).sort((a, b) => a.ym - b.ym);
}

function useChartSize() {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => {
            const width = Math.floor(el.clientWidth);
            const height = Math.floor(el.clientHeight);
            if (width > 0 && height > 0) {
                setSize((prev) =>
                    prev.width === width && prev.height === height
                        ? prev
                        : { width, height },
                );
            }
        };

        const raf = requestAnimationFrame(update);
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, []);

    return { ref, size };
}

export default function AnalyticsChartElement({
    title,
    produkty,
    kursy,
    className = "",
    showTitle = true,
}: {
    title: string;
    produkty: ChartPoint[];
    kursy: ChartPoint[];
    className?: string;
    showTitle?: boolean;
}) {
    const { ref, size } = useChartSize();
    const uid = useId().replace(/:/g, "");
    const gradProdukty = `colorProdukty-${uid}`;
    const gradKursy = `colorKursy-${uid}`;
    const data = useMemo(
        () => mergeChartSeries(produkty, kursy),
        [produkty, kursy],
    );

    return (
        <div className={`flex w-full min-w-0 flex-col ${className}`.trim()}>
            {showTitle ? (
                <h2 className="mb-2 shrink-0 text-base font-medium">{title}</h2>
            ) : null}
            <div
                ref={ref}
                className="h-[220px] w-full min-w-0 shrink-0 sm:h-[260px]">
                {size.width > 0 && size.height > 0 ? (
                    <AreaChart
                        width={size.width}
                        height={size.height}
                        data={data}
                        margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                        <defs>
                            <linearGradient
                                id={gradProdukty}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#8884d8"
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#8884d8"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                            <linearGradient
                                id={gradKursy}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="#82ca9d"
                                    stopOpacity={0.5}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#82ca9d"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            width={44}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) =>
                                v >= 1000
                                    ? `${(v / 1000).toFixed(0)}k`
                                    : String(v)
                            }
                        />
                        <Area
                            type="monotone"
                            dataKey="produkty"
                            name="Produkty"
                            stroke="#8884d8"
                            dot={{ fill: "#8884d8" }}
                            fill={`url(#${gradProdukty})`}
                        />
                        <Area
                            type="monotone"
                            dataKey="kursy"
                            name="Kursy"
                            stroke="#82ca9d"
                            dot={{ fill: "#82ca9d" }}
                            fill={`url(#${gradKursy})`}
                        />
                        <Tooltip />
                        <Legend />
                    </AreaChart>
                ) : null}
            </div>
        </div>
    );
}
