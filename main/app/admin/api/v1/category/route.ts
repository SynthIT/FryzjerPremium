import { checkRequestAuth } from "@/lib/admin_utils";
import {
    collectCategories,
    createCategory,
    deleteCatBySlug,
    updateCategory,
} from "@/lib/crud/categories/category";
import { LogService } from "@/lib/log_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cat = await collectCategories();
        return NextResponse.json({
            status: 0,
            categories: JSON.stringify(cat),
        });
    } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`Błąd podczas pobierania kategorii: ${error}`);
        return NextResponse.json({ status: 1 }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:categories",
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
            { status: 401 },
        );
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug produktu do usunięcia" },
            { status: 500 },
        );
    }
    try {
        const p = await deleteCatBySlug(slug);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kategoria: ${p?._id} - (${p.nazwa}) została usunięta`);
        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:categories",
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
            { status: 401 },
        );
    }
    const catData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", catData);
    try {
        const res = await updateCategory(catData);
        new LogService({
            path: req.url,
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
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:categories",
    ]);
    if (!val) {
        console.log(mess);
        console.log(val);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${mess} dla użytkownika ${user?.email}`);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }
    const catData = await req.json();
    try {
        const res = await createCategory(catData);
        if (typeof res === "object" && "error" in res) {
            return NextResponse.json(
                { status: 1, error: res.error },
                { status: 500 },
            );
        }
        console.log(res);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kategoria: ${res?._id} - (${res.nazwa}) została dodana`);
        return NextResponse.json({
            status: 200,
            message: `Kategoria (${res?.nazwa}) została dodana`,
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
            { status: 1, error: "Błąd podczas dodawania kategorii" },
            { status: 500 },
        );
    }
}
