import { checkRequestAuth } from "@/lib/admin_utils";
import { getWaybill, isApaczkaDryMode } from "@/lib/apaczka/client";
import { getOrderByNumerZamowienia } from "@/lib/crud/orders/orders";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /admin/api/v1/orders/waybill?nrzam=...
 * Pobiera list przewozowy z Apaczka (base64), dekoduje do PDF i oddaje w odpowiedzi.
 * Bez zapisu do Vercel Blob / cache — świeże przy każdym żądaniu.
 */
export async function GET(request: NextRequest) {
    const { val, mess } = await checkRequestAuth(request, [
        "admin:orders",
        "admin:users",
    ]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    const nrzam = request.nextUrl.searchParams.get("nrzam");
    if (!nrzam) {
        return NextResponse.json(
            { status: 1, error: "Brak numeru zamówienia" },
            { status: 400 },
        );
    }

    const order = await getOrderByNumerZamowienia(nrzam);
    if (!order) {
        return NextResponse.json(
            { status: 1, error: "Zamówienie nie znalezione" },
            { status: 404 },
        );
    }

    if (!order.apaczka) {
        return NextResponse.json(
            { status: 1, error: "Zamówienie nie ma danych Apaczka (brak dostawy kurierskiej)" },
            { status: 400 },
        );
    }

    const apaczkaOrderId =
        order.apaczka.order_id ||
        (isApaczkaDryMode() ? `DRY-${nrzam}` : null);

    if (!apaczkaOrderId) {
        return NextResponse.json(
            {
                status: 1,
                error:
                    "Brak Apaczka order_id — najpierw wyślij przesyłkę (order_send)",
            },
            { status: 400 },
        );
    }

    const result = await getWaybill(apaczkaOrderId, {
        nrzam,
        waybillNumber: order.apaczka.waybill_number,
    });

    if (result.status !== 200 || !result.response?.waybill) {
        return NextResponse.json(
            {
                status: 1,
                error: result.message || "Nie udało się pobrać listu przewozowego",
            },
            { status: 502 },
        );
    }

    const pdf = Buffer.from(result.response.waybill, "base64");
    const filename = `list-przewozowy-${nrzam}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "no-store",
            "Content-Length": String(pdf.byteLength),
        },
    });
}
