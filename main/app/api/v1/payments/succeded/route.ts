import { NextRequest, NextResponse } from "next/server";
import { getPaymentIntentByPaymentIntentId } from "@/lib/payments/utils";
import { getOrderByNumerZamowienia, updateOrder } from "@/lib/crud/orders/orders";
import { put } from "@vercel/blob";
import { generatePDF, generateTicket } from "@/lib/pdf/utils";
import { appendFile, mkdirSync } from "fs";


export async function GET(req: NextRequest) {
    const { protocol, host, searchParams } = new URL(req.url);
    const payment_intent = searchParams.get("payment_intent");
    if (!payment_intent) {
        return NextResponse.json({ error: "Payment intent not found" }, { status: 400 });
    }
    const payment = await getPaymentIntentByPaymentIntentId(payment_intent);
    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 400 });
    }
    const { koszyk_id } = payment.metadata;
    if (!koszyk_id) {
        return NextResponse.json({ error: "Koszyk ID not found" }, { status: 400 });
    }
    const order = await getOrderByNumerZamowienia(koszyk_id);
    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }
    const code = Math.floor(Math.random() * 1000000 + 1);
    const data_zamowienia = new Date();
    const faktura = await generatePDF({...order, data_zamowienia: data_zamowienia});
    let bilet;
    let ticket: string;
    let pathfile: string;
    if (order.kursy.length > 0) {
        bilet = await generateTicket(req, order);
    }
    if (process.env.NODE_ENV !== "development") {
        pathfile = `faktury/FV-${order.numer_zamowienia}/invoice.pdf`;
        ticket = `bilety/${order.numer_zamowienia}/ticket.pdf`;
        const fakturaBlob = await put(pathfile, faktura, { access: "public" });
        pathfile = fakturaBlob.url;
        if (bilet) {
            const ticketBlob = await put(ticket, bilet, { access: "public" });
            ticket = ticketBlob.url;
        }
    } else {
        pathfile = `./data/faktury/FV-${order.numer_zamowienia}`
        ticket = `./data/bilety/${order.numer_zamowienia}`
        mkdirSync(pathfile, { recursive: true })
        mkdirSync(ticket, { recursive: true })
        appendFile(pathfile + "/invoice.pdf", faktura, (err) => console.error(err))
        if (bilet) {
            appendFile(ticket + "/ticket.pdf", bilet, (err) => console.error(err))
        }
    }
    const updatedOrder = await updateOrder({
        ...order,
        status: "w_realizacji",
        nr_faktury: `FV/${order.numer_zamowienia}`,
        data_zamowienia: data_zamowienia,
        pliki: [
            { typ: "faktura", nazwa: "invoice.pdf", url: pathfile },
            { typ: "bilet", nazwa: "ticket.pdf", url: ticket }
        ], code: code
    });
    if (!updatedOrder) {
        return NextResponse.json({ error: "Order not updated" }, { status: 400 });
    }
    const response = NextResponse.json({ status: 200, message: "Order updated successfully" }, { status: 302 });
    response.headers.set("Location", `${protocol}//${host}/zamowienie/${updatedOrder.numer_zamowienia}`);
    return response;
}