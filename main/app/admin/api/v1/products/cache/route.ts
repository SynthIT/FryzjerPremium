import { checkRequestAuth } from "@/lib/admin_utils";
import { collectProducts } from "@/lib/crud/products/product";
import { access, writeFileSync, constants, rmSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(req: NextRequest) {
    const { val } = checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    let result = "";
    const products = await collectProducts();
    access(path.join(process.cwd(), "data", "produkty.json"), constants.F_OK, (err) => {
        if (err) {
            writeFileSync(path.join(process.cwd(), "data", "produkty.json"), products, "utf8");
            result = "Pomyślnie naprawiono plik cache";
        } else {
            rmSync(path.join(process.cwd(), "data", "produkty.json"));
            writeFileSync(path.join(process.cwd(), "data", "produkty.json"), products, "utf8");
            result = "Pomyślnie naprawiono plik cache";
        }
    });
    return NextResponse.json({ status: result !== "" ? 0 : 1, response: result !== "" ? result : "Błąd podczas naprawiania pliku cache" });
}
