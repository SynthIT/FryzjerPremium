import { Courses } from "@/lib/types/coursesTypes";
import { OrderList } from "@/lib/types/orderTypes";
import { Products } from "@/lib/types/productTypes";
import Image from "next/image";

function labelForPozycja(pozycja: unknown): string {
    if (pozycja && typeof pozycja === "object" && "nazwa" in pozycja) {
        return String((pozycja as { nazwa?: string }).nazwa ?? "—");
    }
    if (typeof pozycja === "string") return pozycja;
    return "—";
}

export default function TableOrderComponent({
    order,
    type,
}: {
    order: OrderList;
    type: "products" | "courses";
}) {
    const rows = type === "products" ? order.produkty : order.kursy;
    if (!rows?.length) return null;


    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white/80">
            <table className="min-w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/80">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-800">Lp.</th>
                        <th className="px-4 py-3 font-semibold text-gray-800">Zdjęcie</th>
                        <th className="px-4 py-3 font-semibold text-gray-800">Pozycja</th>
                        <th className="px-4 py-3 font-semibold text-gray-800">Ilość</th>
                        <th className="px-4 py-3 font-semibold text-gray-800">Cena</th>
                        <th className="px-4 py-3 font-semibold text-gray-800">Suma</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        const pozycja = row.pozycja as Products | Courses;
                        const cena = pozycja.cena * (1 + pozycja.vat / 100)
                        return (
                            <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="px-4 py-3 text-center text-gray-700">{i + 1}</td>
                                <td className="px-4 py-3 text-gray-700">
                                    {pozycja?.media?.[0]?.path ? (
                                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[rgba(212,196,176,0.35)] bg-[#f8f6f3]">
                                            <Image
                                                src={pozycja.media[0].path}
                                                alt={pozycja.nazwa}
                                                fill
                                                className="object-cover"
                                                sizes="64px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f8f6f3] text-xs text-gray-400">
                                            Brak
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{labelForPozycja(row.pozycja)}</td>
                                <td className="px-4 py-3 text-gray-700">{row.ilosc}</td>
                                <td className="px-4 py-3 text-gray-700">{cena?.toFixed?.(2) ?? cena} zł</td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {((cena ?? 0) * (row.ilosc ?? 0)).toFixed?.(2)} zł
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
