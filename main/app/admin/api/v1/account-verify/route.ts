import { checkRequestAuth } from "@/lib/admin_utils";
import {
    collectAccountVerifies,
    reviewAccountVerify,
} from "@/lib/crud/accountVerify/accountVerify";
import { LogService } from "@/lib/log_service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:users"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    const requests = await collectAccountVerifies();
    return NextResponse.json({ status: 0, requests }, { status: 200 });
}

export async function PUT(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:users"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    try {
        const body = await req.json();
        const id = body?.id as string | undefined;
        const action = body?.action as "zaakceptowane" | "odrzucone" | undefined;
        const powod = body?.powod_odrzucenia as string | undefined;

        if (!id || (action !== "zaakceptowane" && action !== "odrzucone")) {
            return NextResponse.json(
                { status: 1, error: "Nieprawidłowe dane." },
                { status: 400 },
            );
        }

        const result = await reviewAccountVerify(id, action, powod);
        if (!result.ok) {
            return NextResponse.json(
                { status: 1, error: result.error },
                { status: 400 },
            );
        }

        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(
            `Weryfikacja konta ${result.doc.email}: ${action}${powod ? ` (${powod})` : ""}`,
        );

        return NextResponse.json({
            status: 0,
            message:
                action === "zaakceptowane"
                    ? "Wniosek zaakceptowany."
                    : "Wniosek odrzucony.",
            request: result.doc,
        });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas rozpatrywania wniosku." },
            { status: 500 },
        );
    }
}
