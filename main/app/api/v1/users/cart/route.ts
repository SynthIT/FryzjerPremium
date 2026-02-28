import { NextRequest, NextResponse } from "next/server";
import { addAndUpdateOrderToUser, retriveUserCartOrders, retriveUserCartOrdersByEmail } from "@/lib/crud/users/users";
import { Cart, CartItem } from "@/lib/types/cartTypes";
import { OrderList } from "@/lib/types/userTypes";

import { createHash, randomBytes } from "crypto";
import { Product } from "@/lib/models/Products";
import { Orders } from "@/lib/models/Users";
import { verifyJWT } from "@/lib/admin_utils";
import { Course } from "@/lib/models/Courses";

/** Cache odpowiedzi POST /cart – deduplikacja przy podwójnym mount (np. Strict Mode). TTL 3s. */
const cartPostCache = new Map<string, { response: Response; at: number }>();
const CART_POST_CACHE_TTL_MS = 3000;

function getCartPostCacheKey(userId: string | undefined, email: string | undefined, koszyk: Cart): string {
    const user = userId ?? email ?? "anon";
    const bodyHash = createHash("sha256").update(JSON.stringify(koszyk)).digest("hex");
    return `${user}-${bodyHash}`;
}

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
    const body = await request.json();
    const { userId, email, koszyk }: { userId?: string, email?: string, koszyk: Cart } = body;
    if (!koszyk) {
        return NextResponse.json({ error: "Nie podano koszyka" }, { status: 400 });
    }

    const cacheKey = getCartPostCacheKey(userId ?? user?._id, email ?? user?.email, koszyk);
    const now = Date.now();
    const cached = cartPostCache.get(cacheKey);
    if (cached && now - cached.at < CART_POST_CACHE_TTL_MS) {
        return cached.response;
    }

    const changedEntries: { reason: string, item: CartItem }[] = [];
    const refProducts = [];
    const refCourses = [];
    const updatedCart: CartItem[] = [];
    for (const item of koszyk.items) {
        try {
            if (item.type === "produkt") {
                const product = await Product.findOne({ sku: item.object.sku, aktywne: true }).orFail();
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
            } else if (item.type === "kursy") {
                const course = await Course.findOne({ slug: item.object.slug, aktywne: true }).orFail();
                refCourses.push(course._id);
                updatedCart.push(item);
            }
        } catch (_) {
            changedEntries.push({ reason: "Wynik w koszyku jest już niedostępny", item });
            continue;
        }
    }
    if (val && user) {
        if (userId != user._id) {
            return NextResponse.json({ error: "Nie możesz dodać koszyka do innego użytkownika" }, { status: 400 });
        }
        const existingOrders = await retriveUserCartOrders(user._id as string);
        if (!existingOrders) {
            const order: OrderList = {
                user: user._id as string,
                email: user.email,
                numer_zamowienia: createOrderNumber(),
                status: "w_koszyku",
                produkty: refProducts,
                kursy: refCourses,
                sposob_dostawy: null,
                suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            }
            const cart = await addAndUpdateOrderToUser(user._id as string, order);
            if (!cart) {
                return NextResponse.json({ error: "Nie udało się utworzyć koszyka" }, { status: 400 });
            }
            const res = NextResponse.json({ status: 0, koszyk: { id: order.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
            cartPostCache.set(cacheKey, { response: res.clone(), at: now });
            return res;
        }
        const updatedOrder = await Orders.findOneAndUpdate({ _id: existingOrders._id }, { $set: { produkty: refProducts, kursy: refCourses, sposob_dostawy: null, suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0) } }, { new: true });
        if (!updatedOrder) {
            return NextResponse.json({ error: "Nie udało się zaktualizować koszyka" }, { status: 400 });
        }
        const resUser = NextResponse.json({ status: 0, koszyk: { id: updatedOrder.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
        cartPostCache.set(cacheKey, { response: resUser.clone(), at: now });
        return resUser;
    }
    if (!email) {
        return NextResponse.json({ error: "Wystąpił nieokreślony błąd." }, { status: 500 });
    }
    const existingOrders = await retriveUserCartOrdersByEmail(email);
    if (!existingOrders) {
        const order: OrderList = {
            user: null,
            email: email,
            numer_zamowienia: createOrderNumber(),
            status: "w_koszyku",
            produkty: refProducts,
            kursy: refCourses,
            sposob_dostawy: null,
            suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
        const cart = await addAndUpdateOrderToUser(email, order);
        if (!cart) {
            return NextResponse.json({ error: "Nie udało się utworzyć koszyka" }, { status: 400 });
        }
        const resEmail = NextResponse.json({ status: 0, koszyk: { id: order.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
        cartPostCache.set(cacheKey, { response: resEmail.clone(), at: now });
        return resEmail;
    }
    const updatedOrder = await Orders.findOneAndUpdate({ _id: existingOrders._id }, { $set: { produkty: refProducts, kursy: refCourses, sposob_dostawy: null, suma: koszyk.items.reduce((sum, item) => sum + item.price * item.quantity, 0) } }, { new: true }).populate("produkty").populate("kursy").populate("sposob_dostawy");
    if (!updatedOrder) {
        return NextResponse.json({ error: "Nie udało się zaktualizować koszyka" }, { status: 400 });
    }
    const resFinal = NextResponse.json({ status: 0, koszyk: { id: updatedOrder.numer_zamowienia, items: updatedCart }, changedEntries: changedEntries ?? '' });
    cartPostCache.set(cacheKey, { response: resFinal.clone(), at: now });
    return resFinal;
}
