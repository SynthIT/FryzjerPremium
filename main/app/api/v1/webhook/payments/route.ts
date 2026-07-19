import { getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";
import { Products } from "@/lib/types/productTypes";
import { reduceProductQuantity } from "@/lib/crud/products/product";
import { generatePDF, generateTicket } from "@/lib/pdf/utils";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { notificationsType } from "@/lib/types/notificationsTypes";
import { Notifications } from "@/lib/models/Notifications";
import { OrderList } from "@/lib/types/orderTypes";
import { dispatchApaczkaAfterPayment } from "@/lib/apaczka/dispatchAfterPayment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function markOrderFailed(koszykId: string | undefined) {
    if (!koszykId) return;
    const orderFailed = await getOrderByNumerZamowienia(koszykId);
    if (!orderFailed) return;
    if (orderFailed.status !== "w_koszyku") return;
    await updateOrder({
        ...orderFailed,
        status: "nieudana",
    } as OrderList);
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
        return NextResponse.json({ error: "Brak podpisu" }, { status: 401 });
    }
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (error) {
        console.error("Error constructing event:", error);
        return NextResponse.json({ error: "Nieprawidłowy podpis" }, { status: 401 });
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const koszykId = paymentIntent.metadata?.koszyk_id;
            if (!koszykId) {
                console.error("payment_intent.succeeded bez koszyk_id");
                return NextResponse.json({ error: "Brak koszyk_id" }, { status: 400 });
            }

            const order = await getOrderByNumerZamowienia(koszykId);
            if (!order) {
                return NextResponse.json({ error: "Zamówienie nie znalezione" }, { status: 404 });
            }

            // Idempotencja — nie odejmuj stanów ponownie przy ponownym webhooku.
            if (order.status !== "w_koszyku" && order.status !== "nieudana") {
                return NextResponse.json({ done: true }, { status: 200 });
            }

            for (const item of order.produkty) {
                const productId = (item.pozycja as Products)?._id;
                if (!productId) continue;
                await reduceProductQuantity(
                    String(productId),
                    item.ilosc,
                    item.wariant,
                );
            }

            const notificationsPayload: notificationsType = {
                nazwa: "Nowe zamówienie",
                typ: "Nowe zamówienie",
                tresc: `Nowe zamówienie ${order.numer_zamowienia} o wartości ${Number(order.suma).toFixed(2)} zł. Więcej informacji na stronie zamówienia.`,
                link: `/admin/orders/${order.numer_zamowienia}`,
                czy_przeczytane: false,
                czy_aktywne: true,
            };
            await Notifications.create(notificationsPayload);

            const code = Math.floor(Math.random() * 1000000 + 1);
            const data_zamowienia = new Date();
            const potwierdzenie = await generatePDF({
                ...order,
                data_zamowienia,
            } as OrderList);

            const hasCourses = Array.isArray(order.kursy) && order.kursy.length > 0;
            let bilet: Buffer | undefined;
            if (hasCourses) {
                const ticketBytes = await generateTicket(req, order as OrderList);
                bilet = Buffer.isBuffer(ticketBytes)
                    ? ticketBytes
                    : Buffer.from(ticketBytes);
            }

            let pathfile: string;
            let ticketUrl: string | undefined;

            if (process.env.NODE_ENV !== "development") {
                pathfile = `potwierdzenia/PV-${order.numer_zamowienia}/potwierdzenie.pdf`;
                const potwierdzenieBlob = await put(pathfile, potwierdzenie, {
                    access: "public",
                });
                pathfile = potwierdzenieBlob.url;
                if (bilet) {
                    const ticketPath = `bilety/${order.numer_zamowienia}/bilet.pdf`;
                    const ticketBlob = await put(ticketPath, bilet, {
                        access: "public",
                    });
                    ticketUrl = ticketBlob.url;
                }
            } else {
                const potwierdzenieDir = `./data/potwierdzenia/PV-${order.numer_zamowienia}`;
                await mkdir(potwierdzenieDir, { recursive: true });
                pathfile = `${potwierdzenieDir}/potwierdzenie.pdf`;
                await writeFile(pathfile, potwierdzenie);
                if (bilet) {
                    const ticketDir = `./data/bilety/${order.numer_zamowienia}`;
                    await mkdir(ticketDir, { recursive: true });
                    ticketUrl = `${ticketDir}/bilet.pdf`;
                    await writeFile(ticketUrl, bilet);
                }
            }

            const pliki: { typ: "potwierdzenie" | "bilet"; nazwa: string; url: string }[] = [
                { typ: "potwierdzenie", nazwa: "potwierdzenie.pdf", url: pathfile },
            ];
            if (ticketUrl) {
                pliki.push({ typ: "bilet", nazwa: "bilet.pdf", url: ticketUrl });
            }

            // Nadanie Apaczka tylko gdy są produkty + wybór dostawy (nie dla samych kursów)
            let apaczka = order.apaczka ?? null;
            if (order.produkty?.length > 0 && order.apaczka) {
                try {
                    const sent = await dispatchApaczkaAfterPayment(order as OrderList);
                    if (sent) {
                        apaczka = {
                            ...order.apaczka,
                            order_id: sent.order_id,
                            waybill_number: sent.waybill_number,
                            tracking_url: sent.tracking_url,
                            dry: sent.dry,
                        };
                    }
                } catch (err) {
                    console.error("Apaczka order_send error:", err);
                }
            }

            const updatedOrder = await updateOrder({
                ...order,
                status: "w_realizacji",
                nr_faktury: `FV/${order.numer_zamowienia}`,
                data_zamowienia,
                data_wyslania: apaczka?.order_id ? data_zamowienia : order.data_wyslania,
                pliki,
                code,
                apaczka,
            } as OrderList);

            if (!updatedOrder) {
                return NextResponse.json({ error: "Nie udało się zaktualizować zamówienia" }, { status: 400 });
            }
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
            await markOrderFailed(paymentIntentFailed.metadata?.koszyk_id);
            break;
        }
        case "charge.failed": {
            const charge = event.data.object as Stripe.Charge;
            const piRef = charge.payment_intent;
            const piId =
                typeof piRef === "string" ? piRef : piRef?.id;
            if (piId) {
                try {
                    const pi = await stripe.paymentIntents.retrieve(piId);
                    await markOrderFailed(pi.metadata?.koszyk_id);
                } catch (error) {
                    console.error("charge.failed: nie udało się pobrać PaymentIntent", error);
                }
            }
            break;
        }
        default:
            console.log("Unhandled event type:", event.type);
            break;
    }
    return NextResponse.json({ done: true }, { status: 200 });
}
