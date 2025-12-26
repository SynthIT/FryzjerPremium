import {
    checkRequestAuth,
    collectCategories,
    createCategory,
    deleteCatBySlug,
    updateCategory,
} from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    const cat = await collectCategories();
    return NextResponse.json(JSON.parse(cat));
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
        const p = await deleteCatBySlug(slug);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kategoria: ${p?._id} - (${p.nazwa}) została usunięta`);
        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (e) {
        new LogService({
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const catData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", catData);
    try {
        const res = await updateCategory(catData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kategoria: ${res?._id} - (${res.nazwa}) została zedytowana`);
        return NextResponse.json({
            status: 200,
            message: `Kategoria (${res?.nazwa}) zaktualizowana`,
        });
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

export async function POST(req: NextRequest) {
    const catData = await req.json();
    try {
        const res = await createCategory(catData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kategoria: ${res?._id} - (${res.nazwa}) została dodana`);
        return NextResponse.json(
            { status: 201, error: "Błąd podczas aktualizacji produktu" },
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
