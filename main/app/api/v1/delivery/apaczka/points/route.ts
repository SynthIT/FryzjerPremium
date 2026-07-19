import { NextRequest, NextResponse } from "next/server";
import { getPoints, isApaczkaDryMode } from "@/lib/apaczka/client";

/** GET ?type=INPOST&city=&postal_code= — punkty odbioru Apaczka. */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = (searchParams.get("type") || "INPOST").toUpperCase();
        const city = searchParams.get("city") || undefined;
        const postal_code = searchParams.get("postal_code") || undefined;

        const result = await getPoints(type, {
            country_code: "PL",
            city,
            postal_code,
        });

        if (result.status !== 200) {
            return NextResponse.json(
                { status: 1, error: result.message || "Błąd punktów" },
                { status: 400 },
            );
        }

        const pointsMap = result.response.points ?? {};
        const points = Object.entries(pointsMap).map(([id, p]) => ({
            id,
            ...p,
            foreign_address_id: p.foreign_address_id || id,
        }));

        return NextResponse.json({
            status: 0,
            dry: isApaczkaDryMode(),
            type,
            points,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { status: 1, error: "Nie udało się pobrać punktów" },
            { status: 500 },
        );
    }
}
