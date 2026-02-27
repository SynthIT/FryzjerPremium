import {
    collectProducents,
    createProducent,
    deleteProducentBySlug,
    updateProducent,
} from "@/lib/crud/producent/producent";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const producents = await collectProducents();
        const parsedProducents = JSON.parse(producents);
        return NextResponse.json({
            status: 0,
            producents: Array.isArray(parsedProducents) ? parsedProducents : []
        });
    } catch (error) {
        console.error("Błąd podczas pobierania producentów:", error);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`Błąd podczas pobierania producentów: ${error}`);
        return NextResponse.json(
            { status: 0, producents: [] },
            { status: 200 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:producent",
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
                path: req.url,
                kind: "log",
                position: "admin",
                http: req.method,
            }).log(`Produkt: ${doc._id} - (${doc.nazwa}) został usunięty`);
        }
        const backupinfo = new LogService({
            path: req.url,
            http: req.method,
            kind: "backup",
            position: "api",
            payload: JSON.stringify(products),
            operation: "DELETION",
        });
        new LogService({
            path: req.url,
            kind: "warn",
            position: "api",
            http: req.method,
        }).log(
            `Uwaga, z powodu usuniecia produktów, został utworzony plik z backupem znajduje się w ${backupinfo.file}`
        );
        backupinfo.backup();

        new LogService({
            path: req.url,
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
            path: req.url,
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
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:producent",
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

    const prodData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", prodData);
    try {
        const res = await updateProducent(prodData);
        new LogService({
            path: req.url,
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

export async function POST(req: NextRequest) {
    const { val, user, mess } = await checkRequestAuth(req, [
        "admin:products",
        "admin:producent",
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

    const prodData = await req.json();
    try {
        const res = await createProducent(prodData);
        new LogService({
            path: req.url,
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
