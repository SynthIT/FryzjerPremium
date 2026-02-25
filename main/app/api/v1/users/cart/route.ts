import { NextRequest, NextResponse } from "next/server";
import { addAndUpdateOrderToUser, createOrder, retriveUserCartOrders } from "@/lib/crud/users/users";
import { Cart, CartItem } from "@/lib/types/cartTypes";
import { OrderList } from "@/lib/types/userTypes";

import { randomBytes } from "crypto";
import { Product } from "@/lib/models/Products";
import { getDeliveryMethods } from "@/lib/crud/delivery/delivery";
import { Orders } from "@/lib/models/Users";
import { verifyJWT } from "@/lib/admin_utils";

function createOrderNumber() {
    const h = randomBytes(2 ** 3).toString("hex");
    const a = new Date();
    const d =
        `${h}-${a.getDate() < 9 ? `0${a.getDate() + 1}` : a.getDate() + 1}` +
        `${a.getMonth() < 9 ? `0${a.getMonth()}` : a.getMonth() + 1}` +
        `${a.getFullYear()}`;
    return d;
}
export async function GET(request: NextRequest) {
    const { val, user } = await verifyJWT(request);
    if (!val && !user) {

    }
    const cart = await retriveUserCartOrders(user?._id as string);
    if (!cart) {
        return NextResponse.json({ error: "Nie udało się pobrać koszyka" }, { status: 400 });
    }
    return NextResponse.json({ status: 0, koszyk: cart });
}

export async function POST(request: NextRequest) {
    const { val, user } = await verifyJWT(request);
    if (val && user) {
        const body = await request.json();
        const { userId, koszyk }: { userId: string, koszyk: Cart } = body;
        if (!koszyk) {
            return NextResponse.json({ error: "Nie podano koszyka" }, { status: 400 });
        }

        const changedEntries: { reason: string, item: CartItem }[] = [];
        const refProducts = [];
        const updatedCart: CartItem[] = [];

        for (const item of koszyk.items) {
            try {
                const product = await Product.findOne({ sku: item.product.sku, aktywne: true }).orFail();
                if (item.quantity > product.ilosc) {
                    item.quantity = product.ilosc;
                    refProducts.push(product._id);
                    updatedCart.push(item);
                    changedEntries.push({ reason: "Brak dostępnej ilości produktu, nastąpiło automatyczne zmniejszenie ilości produktu z koszyka", item });
                    continue;
                }
                if (item.wariant && product.wariant) {
                    const wslug = item.wariant.slug;
                    const wariant = product.wariant.find((w) => w.slug === wslug);
                    if (!wariant) {
                        if (wslug === "pdostw") {
                            refProducts.push(product._id);
                            updatedCart.push(item);
                            continue;
                        }
                        changedEntries.push({ reason: `Wariant nie jest już dostępny => ${item.wariant.nazwa}. Produkt, został usunięty z koszyka`, item });
                        continue;
                    }
                    if (item.wariant.nowa_cena && item.price !== wariant.nowa_cena) {
                        changedEntries.push({ reason: `Cena wariantu została zmieniona => ${item.wariant.nazwa}. Nastąpiło automatyczne zaktualizowanie ceny wariantu w koszyku`, item });
                        item.price = wariant.nowa_cena!;
                    }
                    if (item.quantity > wariant.ilosc) {
                        item.quantity = wariant.ilosc;
                        refProducts.push(product._id);
                        updatedCart.push(item);
                        changedEntries.push({ reason: `Brak dostępnej ilości produktu, nastąpiło automatyczne zmniejszenie ilości produktu z koszyka`, item });
                        continue;
                    }
                }
                refProducts.push(product._id);
                updatedCart.push(item);
            } catch (_) {
                changedEntries.push({ reason: "Produkt niedostępny", item });
                continue;
            }
        }
        console.log(updatedCart);
        console.log(changedEntries);
        const deliveryMethod = await getDeliveryMethods();
        const existingOrder = await Orders.findOne({ numer_zamowienia: koszyk.id });
        if (existingOrder) {
            await Orders
                .findOneAndUpdate(
                    { _id: existingOrder._id },
                    {
                        $set:
                        {
                            produkty: refProducts,
                            suma: Math.round(koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
                        }
                    }, { new: true });
            return NextResponse.json({ status: 0, koszyk: { id: existingOrder.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
        }
        if (!userId) {
            const order: OrderList = {
                user: "",
                email: "",
                numer_zamowienia: createOrderNumber(),
                status: "w_koszyku",
                produkty: updatedCart,
                sposob_dostawy: deliveryMethod[0]._id as unknown as string,
                suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            }
            const cart = await createOrder(order);
            if (!cart) {
                return NextResponse.json({ error: "Nie udało się utworzyć koszyka" }, { status: 400 });
            }
            return NextResponse.json({ status: 0, koszyk: { id: order.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
        }
        const existingOrders = await retriveUserCartOrders(userId);
        if (!existingOrders) {
            const order: OrderList = {
                user: "",
                email: "",
                numer_zamowienia: createOrderNumber(),
                status: "w_koszyku",
                produkty: refProducts,
                sposob_dostawy: deliveryMethod[0]._id as unknown as string,
                suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            }
            const cart = await addAndUpdateOrderToUser(userId, order);
            if (!cart) {
                return NextResponse.json({ error: "Nie udało się utworzyć koszyka" }, { status: 400 });
            }
            return NextResponse.json({ status: 0, koszyk: { id: order.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
        }
    }}