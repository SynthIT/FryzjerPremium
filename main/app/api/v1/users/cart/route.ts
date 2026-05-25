import { NextRequest, NextResponse } from "next/server";
import {
    addAndUpdateOrderToUser,
    addAndUpdateOrderToUserByEmail,
    retriveUserCartOrders,
    retriveUserCartOrdersByEmail,
} from "@/lib/crud/users/users";
import { Cart, CartItem } from "@/lib/types/cartTypes";
import { OrderList } from "@/lib/types/userTypes";
import { Types } from "mongoose";
import { createHash, randomBytes } from "crypto";
import { Orders } from "@/lib/models/Users";
import { verifyJWT } from "@/lib/admin_utils";
import {
    cartOrderSuma,
    validateCartItems,
    type CartItemChange,
} from "@/lib/cart/validateCartItems";

/** Pola do faktury w zamówieniu (tylko polskie klucze – zgodne z orderDaneSchema w Mongo). */
const DANE_KEYS = [
    "imie",
    "nazwisko",
    "email",
    "nr_domu",
    "nr_lokalu",
    "ulica",
    "miasto",
    "kraj",
    "kod_pocztowy",
    "telefon",
    "nip",
    "faktura",
    "osoba_prywatna",
] as const;
const ENGLISH_TO_POLISH: Record<string, string> = {
    firstName: "imie",
    lastName: "nazwisko",
    phone: "telefon",
    street: "ulica",
    city: "miasto",
    postalCode: "kod_pocztowy",
    country: "kraj",
};

function normalizeDane(
    raw: Partial<import("@/lib/types/userTypes").Users> | undefined,
): Record<string, unknown> | undefined {
    if (!raw || typeof raw !== "object") return undefined;
    const out: Record<string, unknown> = {};
    for (const key of DANE_KEYS) {
        const v = (raw as Record<string, unknown>)[key];
        if (v !== undefined && v !== "") out[key] = v;
    }
    for (const [en, pl] of Object.entries(ENGLISH_TO_POLISH)) {
        const v = (raw as Record<string, unknown>)[en];
        if (v !== undefined && v !== "" && out[pl] === undefined) out[pl] = v;
    }
    return Object.keys(out).length ? out : undefined;
}

/** Współbieżne POST z tym samym body (np. React Strict Mode) — jedna walidacja, bez cache odpowiedzi. */
const inFlightCartPost = new Map<
    string,
    Promise<{
        status: number;
        body: Record<string, unknown>;
    }>
>();

function getCartPostKey(userId: string, koszyk: Cart): string {
    const bodyHash = createHash("sha256")
        .update(JSON.stringify(koszyk))
        .digest("hex");
    return `${userId}:${bodyHash}`;
}

function createOrderNumber() {
    const h = randomBytes(8).toString("hex");
    const a = new Date();
    const d =
        `${h}-${a.getDate() < 10 ? `0${a.getDate()}` : a.getDate()}` +
        `${a.getMonth() < 9 ? `0${a.getMonth() + 1}` : a.getMonth() + 1}` +
        `${a.getFullYear()}`;
    return d;
}

function jsonCartResponse(
    orderId: string,
    items: CartItem[],
    changedEntries: CartItemChange[],
) {
    return {
        status: 0,
        koszyk: { id: orderId, items },
        changedEntries: changedEntries.length ? changedEntries : [],
    };
}

async function persistCartOrder(params: {
    userId: string;
    isLoggedIn: boolean;
    userMongoId?: string;
    userEmail?: string;
    dane?: Partial<import("@/lib/types/userTypes").Users>;
    refProducts: import("@/lib/types/userTypes").DetailedOrderEntry[];
    refCourses: import("@/lib/types/userTypes").DetailedOrderEntry[];
    updatedCart: CartItem[];
    changedEntries: CartItemChange[];
}): Promise<{ status: number; body: Record<string, unknown> }> {
    const {
        userId,
        isLoggedIn,
        userMongoId,
        userEmail,
        dane,
        refProducts,
        refCourses,
        updatedCart,
        changedEntries,
    } = params;

    const suma = cartOrderSuma(updatedCart);
    const normalizedDane = normalizeDane(dane);

    if (isLoggedIn && userMongoId && userEmail) {
        const existingOrders = await retriveUserCartOrders(userMongoId);
        if (!existingOrders) {
            const order: OrderList = {
                user: userMongoId,
                email: userEmail,
                dane: normalizedDane ?? {},
                numer_zamowienia: createOrderNumber(),
                status: "w_koszyku",
                produkty: refProducts,
                kursy: refCourses,
                sposob_dostawy: null,
                suma,
            };
            const cart = await addAndUpdateOrderToUser(userMongoId, order);
            if (!cart) {
                return {
                    status: 400,
                    body: { error: "Nie udało się utworzyć koszyka" },
                };
            }
            return {
                status: 200,
                body: jsonCartResponse(
                    order.numer_zamowienia,
                    updatedCart,
                    changedEntries,
                ),
            };
        }

        const updatePayload: Record<string, unknown> = {
            produkty: refProducts,
            kursy: refCourses,
            sposob_dostawy: null,
            suma,
        };
        if (normalizedDane) updatePayload.dane = normalizedDane;

        const updatedOrder = await Orders.findOneAndUpdate(
            { _id: existingOrders._id },
            { $set: updatePayload },
            { returnDocument: "after" },
        );
        if (!updatedOrder) {
            return {
                status: 400,
                body: { error: "Nie udało się zaktualizować koszyka" },
            };
        }
        return {
            status: 200,
            body: jsonCartResponse(
                updatedOrder.numer_zamowienia,
                updatedCart,
                changedEntries,
            ),
        };
    }

    const existingOrders = await retriveUserCartOrdersByEmail(userId);
    if (!existingOrders) {
        const order: OrderList = {
            user: null,
            email: userId,
            dane: normalizedDane ?? {},
            numer_zamowienia: createOrderNumber(),
            status: "w_koszyku",
            produkty: refProducts,
            kursy: refCourses,
            sposob_dostawy: null,
            suma,
        };
        const cart = await addAndUpdateOrderToUserByEmail(userId, order);
        if (!cart) {
            return {
                status: 400,
                body: { error: "Nie udało się utworzyć koszyka" },
            };
        }
        return {
            status: 200,
            body: jsonCartResponse(
                order.numer_zamowienia,
                updatedCart,
                changedEntries,
            ),
        };
    }

    const updatePayload: Record<string, unknown> = {
        produkty: refProducts,
        kursy: refCourses,
        sposob_dostawy: null,
        suma,
    };
    if (normalizedDane) updatePayload.dane = normalizedDane;

    const updatedOrder = await Orders.findOneAndUpdate(
        { _id: existingOrders._id },
        { $set: updatePayload },
        { returnDocument: "after" },
    )
        .populate("produkty")
        .populate("kursy")
        .populate("sposob_dostawy");

    if (!updatedOrder) {
        return {
            status: 400,
            body: { error: "Nie udało się zaktualizować koszyka" },
        };
    }
    return {
        status: 200,
        body: jsonCartResponse(
            updatedOrder.numer_zamowienia,
            updatedCart,
            changedEntries,
        ),
    };
}

type CartPostBody = {
    userId: string;
    koszyk: Cart;
    dane?: Partial<import("@/lib/types/userTypes").Users>;
};

async function processCartPost(
    request: NextRequest,
    body: CartPostBody,
): Promise<{ status: number; body: Record<string, unknown> }> {
    const { val, user } = await verifyJWT(request);
    const { userId, koszyk, dane } = body;

    if (!koszyk?.items) {
        return { status: 400, body: { error: "Nie podano koszyka" } };
    }

    if (val && user && userId !== user._id?.toString()) {
        return {
            status: 400,
            body: { error: "Nie możesz dodać koszyka do innego użytkownika" },
        };
    }

    if (Types.ObjectId.isValid(userId) && !val) {
        return {
            status: 500,
            body: {
                error: "Wystąpił nieoczekiwany błąd podczas tworzenia zamówienia",
            },
        };
    }

    const { updatedCart, refProducts, refCourses, changedEntries } =
        await validateCartItems(koszyk);

    return persistCartOrder({
        userId,
        isLoggedIn: Boolean(val && user),
        userMongoId: user?._id as string | undefined,
        userEmail: user?.email,
        dane,
        refProducts,
        refCourses,
        updatedCart,
        changedEntries,
    });
}

export async function GET(request: NextRequest) {
    const { val, user } = await verifyJWT(request);
    if (!val || !user?._id) {
        return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
    const cart = await retriveUserCartOrders(user._id as string);
    if (!cart) {
        return NextResponse.json(
            { error: "Nie udało się pobrać koszyka" },
            { status: 400 },
        );
    }
    return NextResponse.json({ status: 0, koszyk: cart });
}

export async function POST(request: NextRequest) {
    const body = (await request.json()) as CartPostBody;
    const cacheKey = getCartPostKey(
        body.userId ?? "",
        body.koszyk ?? { id: "", items: [] },
    );

    let pending = inFlightCartPost.get(cacheKey);
    if (!pending) {
        pending = processCartPost(request, body).finally(() => {
            inFlightCartPost.delete(cacheKey);
        });
        inFlightCartPost.set(cacheKey, pending);
    }

    const result = await pending;
    return NextResponse.json(result.body, { status: result.status });
}
