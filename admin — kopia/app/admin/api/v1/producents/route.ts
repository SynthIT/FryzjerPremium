import {
    checkRequestAuth,
    collectProducents,
    createProducent,
    deleteProducentBySlug,
    updateProducent,
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
    const cat = await collectProducents();
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
        const { products, producent } = await deleteProducentBySlug(slug);
        for (const doc of products) {
            new LogService({
                kind: "log",
                position: "admin",
                http: req.method,
            }).log(`Produkt: ${doc._id} - (${doc.nazwa}) został usunięty`);
        }
        const backupinfo = new LogService({
            http: req.method,
            kind: "backup",
            position: "api",
            payload: JSON.stringify(products),
            operation: "DELETION",
        });
        new LogService({ kind: "warn", position: "api", http: req.method }).log(
            `Uwaga, z powodu usuniecia produktów, został utworzony plik z backupem znajduje się w ${backupinfo.file}`
        );
        backupinfo.backup();

        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(
            `Producent (${producent.nazwa}) usunięty i ${products.length} skojarzonych z nim`
        );
        return NextResponse.json({
            status: 0,
            message: `Producent (${producent.nazwa}) usunięty i ${products.length} skojarzonych z nim`,
        });
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
    const prodData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", prodData);
    try {
        const res = await updateProducent(prodData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Producent: ${res?._id} - (${res.nazwa}) został zedytowany`);
        return NextResponse.json({
            status: 200,
            message: `Producent (${res?.nazwa}) zaktualizowany`,
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
    const prodData = await req.json();
    try {
        const res = await createProducent(prodData);
        new LogService({
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Producent: ${res?._id} - (${res.nazwa}) został dodany`);
        return NextResponse.json(
            { status: 201, error: "Producent został dodany" },
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
