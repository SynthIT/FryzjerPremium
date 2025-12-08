import path from "path";
import { Category } from "../models/Products";
import * as fs from "fs";

export async function saveCategoryFile() {
    const r: Record<string, Array<{ nazwa: string; image: string }>> = {};
    const file = path.join(process.cwd(), "data", "kategorie.json");
    const kategorie = await Category.find();
    kategorie.forEach((val) => {
        (r[val.slug] ??= []).push({ nazwa: val.nazwa, image: val.image });
    });
    fs.writeFileSync(file, JSON.stringify(r));
}

export function readFromfile(): Record<string, string[]> {
    const dane = fs.readFileSync(path.join(process.cwd(), "data", "kategorie.json")).toString();
    return JSON.parse(dane);
}
