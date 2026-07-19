import { NextResponse } from "next/server";
import { isApaczkaDryMode } from "@/lib/apaczka/client";
import { getServiceStructureCached } from "@/lib/apaczka/structureCache";

/** GET — struktura serwisów Apaczka (service_structure), cache 24h. */
export async function GET() {
    try {
        const result = await getServiceStructureCached();
        if (result.status !== 200) {
            return NextResponse.json(
                { status: 1, error: result.message || "Błąd Apaczka" },
                { status: 400 },
            );
        }
        return NextResponse.json({
            status: 0,
            dry: isApaczkaDryMode(),
            services: result.response.services ?? [],
            points_type: result.response.points_type ?? [],
            options: result.response.options ?? {},
            package_type: result.response.package_type ?? {},
            pickup_type: result.response.pickup_type ?? {},
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { status: 1, error: "Nie udało się pobrać serwisów dostawy" },
            { status: 500 },
        );
    }
}
