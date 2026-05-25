import { Courses } from "@/lib/types/coursesTypes";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { Products } from "@/lib/types/productTypes";
import { OrderList, Users } from "@/lib/types/userTypes";
import Link from "next/link";


export default function AdminOrderEntry({ order }: { order: OrderList }) {
    console.log(order);
    const handleDelete = async () => {
        const res = await fetch(`/api/v1/orders/${order.numer_zamowienia}`, {
            method: "DELETE",
            credentials: "include"
        });
        const result = await res.json();
        if (result.status === 0) {
            alert("Zamówienie zostało usunięte");
        }
    }
    const enabledDelete = order.status !== "zrealizowane" && order.status !== "w_realizacji";
    const enabledDeleteClasses = "text-red-500 hover:text-red-600 border border-red-500 rounded-md p-1 px-2"
    const disabledDeleteClasses = "text-gray-500 border border-gray-500 rounded-md p-1 px-2"

    const products = order.produkty ? order.produkty.slice(0, 4).map((product) => {
        if (!product.pozycja)
            return "Produkt został usunięty"
        return (product.pozycja as Products).nazwa;
    }
    ).join(", ") + (order.produkty.length > 4 ? " +" + (order.produkty.length - 4) + " więcej..." : "") : "Brak produktów";
    const courses = order.kursy ? order.kursy.slice(0, 4).map((course) => {
        if (!course.pozycja)
            return "Kurs został usunięty"
        return (course.pozycja as Courses).nazwa;
    }
    ).join(", ") + (order.kursy.length > 4 ? " +" + (order.kursy.length - 4) + " więcej..." : "") : "Brak kursów";

    return (
        <tr className="border-1">
            <td className="text-md p-2 m-2">
                {formatLocaleDateTime(order.createdAt ?? null)}
            </td>
            <td className="text-md p-2 m-2">{order.numer_zamowienia}</td>
            <td className="text-md p-2 m-2">{order.email ?? (order.user! as Users).email}</td>
            <td className="text-md p-2 m-2">{products}</td>
            <td className="text-md p-2 m-2">{courses}</td>
            <td className="text-md p-2 m-2">{order.suma.toFixed(2)} zł </td>
            <td className="text-md p-2 m-2">{order.status}</td>
            <td className="items-center justify-center">
                <Link href={`/admin/orders/${order.numer_zamowienia}`} className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md p-1 px-2 mr-4">Szczegóły</Link>

                <button disabled={enabledDelete} onClick={handleDelete} className={enabledDelete ? enabledDeleteClasses : disabledDeleteClasses}>Usuń</button></td>
        </tr>
    )
}