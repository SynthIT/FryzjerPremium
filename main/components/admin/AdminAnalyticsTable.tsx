import { MonthlyAmount, months } from "@/lib/analists/analists";
import React, { useMemo } from "react";

const curr = [1, 3, 6]

export default function AdminAnalyticsTable({ data, config }: { data: MonthlyAmount[], config: number }) {

    const rows = useMemo(() => {
        const rows: { name: string, values: number[] }[] = [];
        data.forEach((item, index) => {
            const row = rows.find((row) => row.name === item.name);
            if (row) {
                row.values.push(item.value);
            } else {
                rows.push({ name: item.name, values: [item.value] });
            }
        })
        return rows;
    }, [data]);

    console.log(rows);
    console.log(data);

    return (
        <table>
            <thead>
                <tr>
                    <th className="text-left w-1/6"> Nazwa</th>
                    {Array.from({ length: config }).map((_, index) => {
                        const month = data[index].ym % 12;
                        const width = index === config - 1 ? " w-1/6" : "";
                        const monthName = month - index < 0 ? months[11 + month - index + 1] : months[month - index];
                        return (
                            <React.Fragment key={index}>
                                <th className={"text-center" + width}>Sprzedaż w miesiącu {monthName}</th>
                            </React.Fragment>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.name}>
                        <td className="text-left">{row.name}</td>
                        {row.values.map((value, index) => (
                            <td key={index} className="text-center">{value ? value : "-"}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}