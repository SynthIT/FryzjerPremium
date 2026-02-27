import {
    collectFirmy,
    createFirma,
    deleteFirmaBySlug,
    updateFirma,
} from "@/lib/crud/firmy/firma";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";

export async function GET(req: NextRequest) {
    try {
        const firmy = await collectFirmy();
        const parsedFirmy = JSON.parse(firmy);
        return NextResponse.json(
            { status: 0, firmy: parsedFirmy },
            { status: 200 },
        );
    } catch (error) {
        console.error("Błąd podczas pobierania firm:", error);
        return NextResponse.json({ status: 1 }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:companies", "admin:users"]);
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
            { status: 1, error: "Brak slug firmy do usunięcia" },
            { status: 500 },
        );
    }
    try {
        const doc = await deleteFirmaBySlug(slug);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(
            `Firma: ${doc?.firma?._id} - (${doc?.firma?.nazwa}) została usunięta`,
        );
        return NextResponse.json({ status: 0, message: "Firma usunięta" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania firmy" },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:companies", "admin:users"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const firmaData = await req.json();
    try {
        const res = await updateFirma(firmaData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Firma: ${res?._id} - (${res?.nazwa}) została zedytowana`);
        return NextResponse.json({
            status: 0,
            message: `Firma (${res?.nazwa}) zaktualizowana`,
        });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji firmy" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:companies", "admin:users"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const firmaData = await req.json();
    try {
        const res = await createFirma(firmaData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Firma: ${res?._id} została dodana`);
        return NextResponse.json(
            { status: 201, error: "Firma została dodana" },
            { status: 201 },
        );
    } catch (e) {
        console.log(e);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas dodawania firmy" },
            { status: 500 },
        );
    }
}
