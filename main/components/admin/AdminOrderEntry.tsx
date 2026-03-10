import { Courses } from "@/lib/types/coursesTypes";
import { Products } from "@/lib/types/productTypes";
import { OrderList, Users } from "@/lib/types/userTypes";


export default function AdminOrderEntry({ order }: { order: OrderList }) {
    return (
        <tr className="border-1">
            <td className="text-md p-2 m-2">{((order.createdAt as any))}</td>
            <td className="text-md p-2 m-2">{order.numer_zamowienia}</td>
            <td className="text-md p-2 m-2">{order.email ?? (order.user! as Users).email}</td>
            <td className="text-md p-2 m-2">{order.produkty ? order.produkty.map((product) => (product as Products).nazwa).join(", ") : "Brak produktów"}</td>
            <td className="text-md p-2 m-2">{order.kursy ? order.kursy.map((course) => (course as Courses).nazwa).join(", ") : "Brak kursów"}</td>
            <td className="text-md p-2 m-2">{order.suma} zł </td>
            <td className="text-md p-2 m-2">{order.status}</td>
            <td></td>
        </tr>
    )
}