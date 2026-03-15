import { Courses } from "@/lib/types/coursesTypes";
import { Products } from "@/lib/types/productTypes";
import { OrderList, Users } from "@/lib/types/userTypes";
import Link from "next/link";


export default function AdminOrderEntry({ order }: { order: OrderList }) {
    return (
        <tr className="border-1">
            <td className="text-md p-2 m-2">{((order.createdAt as any))}</td>
            <td className="text-md p-2 m-2">{order.numer_zamowienia}</td>
            <td className="text-md p-2 m-2">{order.email ?? (order.user! as Users).email}</td>
            <td className="text-md p-2 m-2">{order.produkty ? order.produkty.map((product) => (product.pozycja as Products).nazwa).join(", ") : "Brak produktów"}</td>
            <td className="text-md p-2 m-2">{order.kursy ? order.kursy.map((course) => (course.pozycja as Courses).nazwa).join(", ") : "Brak kursów"}</td>
            <td className="text-md p-2 m-2">{order.suma} zł </td>
            <td className="text-md p-2 m-2">{order.status}</td>
            <td><Link href={`/admin/orders/${order.numer_zamowienia}`} className="text-blue-500 hover:text-blue-600 border border-blue-500 rounded-md p-1 px-2">Szczegóły</Link></td>
        </tr>
    )
}