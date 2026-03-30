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
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        const pozycja = row.pozycja as Products | Courses;
                        return (
                            <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="px-4 py-3 text-gray-700 text-center">{i + 1}</td>
                                <td className="px-4 py-3 text-gray-700"><Image src={pozycja.media[0].path} alt={pozycja.nazwa} width={100} height={100} /></td>
                                <td className="px-4 py-3 text-gray-700">{labelForPozycja(row.pozycja)}</td>
                                <td className="px-4 py-3 text-gray-700">{row.ilosc}</td>
                                <td className="px-4 py-3 text-gray-700">{row.cena?.toFixed?.(2) ?? row.cena} zł</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}
