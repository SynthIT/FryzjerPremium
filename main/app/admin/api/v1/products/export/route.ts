import { checkRequestAuth } from "@/lib/admin_utils";
import { collectProducts } from "@/lib/crud/products/product";
import { Products, Warianty } from "@/lib/types/productTypes";
import { NextRequest, NextResponse } from "next/server";

function csvEscape(value: unknown): string {
    const s = String(value ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function specToFlatString(
    spec: Array<{ key: string; value: string }> | null | undefined,
): string {
    if (!spec || !Array.isArray(spec) || spec.length === 0) return "";
    return spec
        .filter((x) => x && typeof x.key === "string" && typeof x.value === "string")
        .map((x) => `${x.key}:${x.value}`)
        .join("|");
}

export async function GET(req: NextRequest) {
    const { val, mess } = await checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 },
        );
    }

    const products: Products[] = JSON.parse(await collectProducts());

    const header = [
        "name",
        "slug",
        "baseSlug",
        "variantSlug",
        "sku",
        "ean",
        "variantType",
        "specyfikacja_variant",
    ];

    const lines: string[] = [header.join(",")];

    for (const p of products) {
        const variants = (p.wariant ?? []) as Warianty[];
        if (!variants || variants.length === 0) {
            lines.push(
                [
                    csvEscape(p.nazwa),
                    csvEscape(p.slug),
                    csvEscape(p.slug),
                    "",
                    csvEscape(p.sku),
                    csvEscape(p.kod_ean ?? ""),
                    "",
                    "",
                ].join(","),
            );
            continue;
        }

        for (const v of variants) {
            const variantSlug = v.slug || "";
            const combinedSlug = variantSlug ? `${p.slug}-${variantSlug}` : p.slug;
            const combinedName = v.nazwa ? `${p.nazwa} - ${v.nazwa}` : p.nazwa;

            lines.push(
                [
                    csvEscape(combinedName),
                    csvEscape(combinedSlug),
                    csvEscape(p.slug),
                    csvEscape(variantSlug),
                    csvEscape(p.sku),
                    csvEscape(p.kod_ean ?? ""),
                    csvEscape(v.typ ?? ""),
                    csvEscape(specToFlatString(v.specyfikacja)),
                ].join(","),
            );
        }
    }

    const csv = `${lines.join("\n")}\n`;
    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=\"products-variants.csv\"",
        },
    });
}

