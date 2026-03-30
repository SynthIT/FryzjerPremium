import { Courses } from "@/lib/types/coursesTypes";
import { formatLocaleDateTime } from "@/lib/dateFormat";
import { Products } from "@/lib/types/productTypes";
import { OrderList, Users } from "@/lib/types/userTypes";
import Link from "next/link";


export default function AdminOrderEntry({ order }: { order: OrderList }) {
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

    return (
        <tr className="border-1">
            <td className="text-md p-2 m-2">
                {formatLocaleDateTime(order.createdAt ?? null)}
            </td>
            <td className="text-md p-2 m-2">{order.numer_zamowienia}</td>
            <td className="text-md p-2 m-2">{order.email ?? (order.user! as Users).email}</td>
            <td className="text-md p-2 m-2">{order.produkty ? order.produkty.map((product) => (product.pozycja as Products).nazwa).join(", ") : "Brak produktów"}</td>
            <td className="text-md p-2 m-2">{order.kursy ? order.kursy.map((course) => (course.pozycja as Courses).nazwa).join(", ") : "Brak kursów"}</td>
            <td className="text-md p-2 m-2">{order.suma} zł </td>
            <td className="text-md p-2 m-2">{order.status}</td>
            <td className="items-center justify-center">
                <Link href={`/admin/orders/${order.numer_zamowienia}`} className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md p-1 px-2 mr-4">Szczegóły</Link>
                
                <button disabled={enabledDelete} onClick={handleDelete} className={enabledDelete ? enabledDeleteClasses : disabledDeleteClasses}>Usuń</button></td>
        </tr>
    )
}