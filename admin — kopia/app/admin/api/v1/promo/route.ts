import {
    collectPromo,
    createPromo,
    deletePromoBySlug,
    updatePromo,
} from "@/lib/crud/promocje/promocje";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";

export async function GET(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    const products = await collectPromo();
    return NextResponse.json(JSON.parse(products));
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug produktu do usunięcia" },
            { status: 500 }
        );
    }
    try {
        const doc = await deletePromoBySlug(slug);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Promocje: ${doc?._id} - (${doc?.nazwa}) została usunięta`);
        return NextResponse.json({
            status: 0,
            message: "Promocja została usunięta",
        });
    } catch (e) {
        new LogService({
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania promocji" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const productData = await req.json();
    try {
        const res = await updatePromo(productData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Promocja: ${res?._id} - (${res?.nazwa}) została zedytowana`);
        return NextResponse.json({
            status: 0,
            message: `Promocja (${res?.nazwa}) zaktualizowana`,
        });
    } catch (e) {
        console.log(e);
        new LogService({
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji promocji" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const productData = await req.json();
    try {
        const res = await createPromo(productData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Promocja: ${res?._id} została dodana`);
        return NextResponse.json(
            { status: 201, error: "Promocja została dodana" },
            { status: 201 }
        );
    } catch (e) {
        new LogService({
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 }
        );
    }
}
