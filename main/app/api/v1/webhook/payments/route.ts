import { getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";
import { generatePDF, generateTicket } from "@/lib/pdf/utils";
import { put } from "@vercel/blob";
import { appendFile, mkdirSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
        return NextResponse.json({}, { status: 401 });
    }
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (error) {
        console.error("Error constructing event:", error);
        return NextResponse.json({}, { status: 401 });
    }
    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const order = await getOrderByNumerZamowienia(paymentIntent.metadata.koszyk_id);
            if (!order) {
                return NextResponse.json({}, { status: 404 });
            }
            const code = Math.floor(Math.random() * 1000000 + 1);
            const data_zamowienia = new Date();
            const potwierdzenie = await generatePDF({ ...order, data_zamowienia: data_zamowienia });
            let bilet;
            let ticket: string;
            let pathfile: string;
            if (order.kursy.length > 0) {
                bilet = await generateTicket(req, order);
            }
            if (process.env.NODE_ENV !== "development") {
                pathfile = `potwierdzenia/PV-${order.numer_zamowienia}/potwierdzenie.pdf`;
                ticket = `bilety/${order.numer_zamowienia}/bilet.pdf`;
                const potwierdzenieBlob = await put(pathfile, potwierdzenie, { access: "public" });
                pathfile = potwierdzenieBlob.url;
                if (bilet) {
                    const ticketBlob = await put(ticket, bilet, { access: "public" });
                    ticket = ticketBlob.url;
                }
            } else {
                pathfile = `./data/potwierdzenia/PV-${order.numer_zamowienia}`
                ticket = `./data/bilety/${order.numer_zamowienia}`
                mkdirSync(pathfile, { recursive: true })
                mkdirSync(ticket, { recursive: true })
                appendFile(pathfile + "/potwierdzenie.pdf", potwierdzenie, (err) => console.error(err))
                if (bilet) {
                    appendFile(ticket + "/bilet.pdf", bilet, (err) => console.error(err))
                }
            }
            const updatedOrder = await updateOrder({
                ...order,
                status: "w_realizacji",
                nr_faktury: `FV/${order.numer_zamowienia}`,
                data_zamowienia: data_zamowienia,
                pliki: [
                    { typ: "potwierdzenie", nazwa: "potwierdzenie.pdf", url: pathfile },
                    { typ: "bilet", nazwa: "bilet.pdf", url: ticket }
                ], code: code
            });
            if (!updatedOrder) {
                return NextResponse.json({}, { status: 400 });
            }
            break;
        case "charge.failed":
        case "payment_intent.payment_failed":
            const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
            const orderFailed = await getOrderByNumerZamowienia(paymentIntentFailed.metadata.koszyk_id);
            if (!orderFailed) {
                return NextResponse.json({}, { status: 404 });
            }
            await updateOrder({
                ...orderFailed,
                status: "nieudana",
            });
            return NextResponse.json({ failed: true }, { status: 402 });
        default:
            console.log("Unhandled event type:", event.type);
            break;
    }
    return NextResponse.json({ done: true }, { status: 200 });
}