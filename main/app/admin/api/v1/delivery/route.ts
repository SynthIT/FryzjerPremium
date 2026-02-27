import {
    getDeliveryMethods,
    createDeliveryMethod,
    deleteDeliveryMethodBySlug,
    updateDeliveryMethod,
} from "@/lib/crud/delivery/delivery";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";

export async function GET(req: NextRequest) {
    try {
        const deliveries = await getDeliveryMethods();
        return NextResponse.json({ status: 0, delivery: JSON.stringify(deliveries) });
    } catch (error) {
        return NextResponse.json({ status: 1, error: "Błąd podczas pobierania dostaw", details: `${error}` }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:delivery"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug dostawy do usunięcia" },
            { status: 500 },
        );
    }
    try {
        const doc = await deleteDeliveryMethodBySlug(slug);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(
            `Dostawa: ${doc?._id} - (${doc?.nazwa}) została usunięta`,
        );
        return NextResponse.json({ status: 0, message: "Dostawa usunięta" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania dostawy" },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:delivery"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const deliveryData = await req.json();
    try {
        const res = await updateDeliveryMethod(deliveryData._id, deliveryData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Dostawa: ${res?._id} - (${res?.nazwa}) została zedytowana`);
        return NextResponse.json({ status: 0, message: "Dostawa została zedytowana" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json({ status: 1, error: "Błąd podczas aktualizacji dostawy" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:delivery"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const deliveryData = await req.json();
    try {
        const res = await createDeliveryMethod(deliveryData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Dostawa: ${res?._id} została dodana`);
        return NextResponse.json(
            { status: 201, error: "Dostawa została dodana" },
            { status: 201 },
        );
    } catch (e) {
        console.error("Błąd podczas dodawania dostawy:", e);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas dodawania dostawy" },
            { status: 500 },
        );
    }
}
