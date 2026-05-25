/**
 * Szkielet importu JSON → Supabase (service role).
 * Wymaga: npm install @supabase/supabase-js (w folderze migration lub main)
 *
 * SUPABASE_URL=...
 * SUPABASE_SERVICE_ROLE_KEY=...
 * node import-supabase.mjs
 */
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error("Ustaw SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(url, key);

/** Konwersja _id Mongo → mongo_id + pola relacyjne — uzupełnij przed produkcją. */
function mapProduct(doc) {
    return {
        mongo_id: String(doc._id),
        slug: doc.slug,
        nazwa: doc.nazwa,
        cena_skupu: doc.cena_skupu,
        cena: doc.cena,
        dostepnosc: doc.dostepnosc,
        opis: doc.opis,
        ilosc: doc.ilosc,
        czas_wysylki: doc.czas_wysylki,
        kod_produkcyjny: doc.kod_produkcyjny,
        ocena: doc.ocena,
        vat: doc.vat ?? 23,
        sku: doc.sku,
        kod_ean: doc.kod_ean ?? null,
        aktywne: doc.aktywne ?? true,
        media: doc.media ?? [],
        wariant: doc.wariant ?? [],
        specyfikacja: doc.specyfikacja ?? [],
        // producent_id, kategoria_ids, promocje_id — wymagają mapy mongo_id → uuid
    };
}

async function importFile(table, mapper = (x) => x) {
    const path = join(DATA_DIR, `${table}.json`);
    try {
        const raw = await readFile(path, "utf8");
        const rows = JSON.parse(raw).map(mapper);
        if (!rows.length) return;
        const { error } = await supabase.from(table).upsert(rows, { onConflict: "mongo_id" });
        if (error) throw error;
        console.log(`${table}: ${rows.length} wierszy`);
    } catch (e) {
        if (e.code === "ENOENT") console.warn(`Brak pliku ${path}`);
        else console.error(`${table}:`, e.message);
    }
}

// Kolejność zgodna z README
await importFile("producents");
await importFile("categories");
await importFile("promos");
await importFile("products", mapProduct);

console.log("Import zakończony (szkielet — uzupełnij FK i pozostałe tabele).");
