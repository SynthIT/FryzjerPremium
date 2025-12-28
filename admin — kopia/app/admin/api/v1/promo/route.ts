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
    const { val, user, mess } = checkRequestAuth(req, [
        "admin:products",
        "admin:promo",
    ]);
    if (!val) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${mess} dla użytkownika ${user?.email}`);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const promos = await collectPromo();
    return NextResponse.json({ status: 0, promos: JSON.parse(promos) });
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req, [
        "admin:products",
        "admin:promo",
    ]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
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
            path: req.url,
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
            path: req.url,
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
    const { val, mess } = checkRequestAuth(req, [
        "admin:products",
        "admin:promo",
    ]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const productData = await req.json();
    try {
        const res = await updatePromo(productData);
        new LogService({
            path: req.url,
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
            path: req.url,

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
    const { val, mess } = checkRequestAuth(req, [
        "admin:products",
        "admin:promo",
    ]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const productData = await req.json();
    try {
        const res = await createPromo(productData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Promocja: ${res?._id} została dodana`);
        return NextResponse.json(
            { status: 0, message: "Promocja została dodana" },
            { status: 201 }
        );
    } catch (e) {
        new LogService({
            path: req.url,
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
