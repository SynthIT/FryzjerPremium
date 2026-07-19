import { getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";
import { getUserByEmail } from "@/lib/crud/users/users";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const editEmailBody = z.object({
    email: z.string().email().max(320),
    id: z.string().min(3).max(100),
});

export async function POST(req: NextRequest) {
    try {
        const scope = req.nextUrl.searchParams.get("scope");
        if (!scope) {
            return NextResponse.json({ error: "Źle skonfigurowany link" }, { status: 401 });
        }
        switch (scope) {
            case "email": {
                const parsed = editEmailBody.safeParse(await req.json());
                if (!parsed.success) {
                    return NextResponse.json(
                        { error: "Błędne dane", details: parsed.error.message },
                        { status: 400 },
                    );
                }
                const { email, id } = parsed.data;

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