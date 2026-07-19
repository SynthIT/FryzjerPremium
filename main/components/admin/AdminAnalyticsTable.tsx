import { MonthlyAmount, months } from "@/lib/analists/analists";
import { useMemo } from "react";

export default function AdminAnalyticsTable({
    data,
    config,
}: {
    data: MonthlyAmount[];
    config: number;
}) {
    const { monthKeys, rows } = useMemo(() => {
        const now = new Date();
        const currentYm = now.getFullYear() * 12 + now.getMonth();
        const monthKeys = Array.from({ length: config }, (_, i) => {
            return currentYm - config + 1 + i;
        });

        const byName = new Map<string, Map<number, number>>();
        for (const item of data) {
            let map = byName.get(item.name);
            if (!map) {
                map = new Map();
                byName.set(item.name, map);
            }
            map.set(item.ym, (map.get(item.ym) ?? 0) + item.value);
        }

        const rows = Array.from(byName.entries()).map(([name, valuesByYm]) => ({
            name,
            values: monthKeys.map((ym) => valuesByYm.get(ym) ?? 0),
        }));

        return { monthKeys, rows };
    }, [data, config]);

    if (rows.length === 0) {
        return (
            <p className="p-4 text-sm text-muted-foreground">
                Brak danych sprzedaży w wybranym okresie.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="px-2 py-2 text-left">Nazwa</th>
                        {monthKeys.map((ym) => {
                            const monthIdx = ((ym % 12) + 12) % 12;
                            return (
                                <th key={ym} className="px-2 py-2 text-center">
                                    {months[monthIdx]}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.name} className="border-b border-gray-100">
                            <td className="px-2 py-2 text-left">{row.name}</td>
                            {row.values.map((value, index) => (
                                <td key={index} className="px-2 py-2 text-center">
                                    {value > 0 ? value : "—"}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
