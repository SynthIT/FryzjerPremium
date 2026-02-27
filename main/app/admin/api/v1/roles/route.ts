import {
    collectRoles,
    createRole,
    deleteRoleByName,
    updateRole,
} from "@/lib/crud/users/roles";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";
import { roleSchema } from "@/lib/types/userTypes";

export async function GET(req: NextRequest) {
    const roles = await collectRoles();
    return NextResponse.json({ status: 0, roles: JSON.parse(roles) });
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:roles", "admin:users"]);
    if (!val) {
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
        const doc = await deleteRoleByName(slug);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Rola: ${doc?._id} - (${doc?.nazwa}) została usunięta`);
        return NextResponse.json({
            status: 0,
            message: "Rola została usunięta",
        });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania roli" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:roles", "admin:users"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    try {
        const roleData = await req.json();
        const ok = roleSchema.parse(roleData);
        const res = await updateRole(ok);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Rola: ${res?._id} - (${res?.nazwa}) została zedytowana`);
        return NextResponse.json({
            status: 0,
            message: `Rola (${res?.nazwa}) zaktualizowana`,
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
            { status: 1, error: "Błąd podczas aktualizacji roli" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:users", "admin:roles"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    try {
        const roleData = await req.json();
        const ok = roleSchema.parse(roleData);
        const res = await createRole(ok);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Rola: ${res?._id} została dodana`);
        return NextResponse.json(
            { status: 0, message: "Rola została dodana" },
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
            { status: 1, error: "Błąd podczas aktualizacji rola" },
            { status: 500 }
        );
    }
}
