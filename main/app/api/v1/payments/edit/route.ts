import { getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";
import { getUserByEmail } from "@/lib/crud/users/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const param = req.url.split("?")[1];
        const params = new URLSearchParams(param);
        if (!params.get("scope")) {
            return NextResponse.json({ error: "Źle skonfigurowany link" }, { status: 401 });
        }
        switch (params.get("scope")) {
            case "email": {
                const { email, id } = await req.json();
                const order_details = await getOrderByNumerZamowienia(id);
                const user = await getUserByEmail(email);
                if (!order_details) {
                    return NextResponse.json({ error: "Zamówienie nieznalezione" }, { status: 404 });
                }
                if (user) {
                    return NextResponse.json({ error: "Użytkownik o takim emailu już istnieje, nie można zmienić adresu email." }, { status: 400 });
                }
                await updateOrder({ ...order_details, email: email });
                return NextResponse.json({ status: 0, message: "Zamówienie zaktualizowane" });
            }
            default:
                return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}