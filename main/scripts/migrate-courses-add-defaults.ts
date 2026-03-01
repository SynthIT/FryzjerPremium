/**
 * Migracja: dopisuje brakujące pola (ze schematu Course) do wszystkich istniejących dokumentów.
 * Uruchom z folderu main: npx tsx scripts/migrate-courses-add-defaults.ts
 * (wczytuje .env.local z bieżącego katalogu)
 */

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import { Course } from "../lib/models/Courses";

const DEFAULTS: Record<string, unknown> = {
    lekcje: [],
    media: [],
    ocena: 0,
    opinie: [],
    vat: 23,
    liczbaZapisanych: 0,
    czegoSieNauczysz: [],
    gwarancjaDni: 0,
    zawartoscKursu: [],
    wymagania: [],
    jezyk: "polski",
    certyfikat: false,
    // opcjonalne – dopisujemy brakujące klucze, żeby każdy dokument miał te pola
    dozywotniDostep: undefined,
    materialyDoPobrania: undefined,
    aktywne: undefined,
    czasTrwania: undefined,
    poziom: undefined,
    liczbaLekcji: undefined,
    instruktor: undefined,
    krotkiOpis: undefined,
    max_uczestnicy: undefined,
    data_rozpoczecia: undefined,
    godzina_rozpoczecia: undefined,
    godzina_zakonczenia: undefined,
    adres: undefined,
};

async function main() {
    const uri =
        process.env.NODE_ENV === "development" ? process.env.MONGO_URI_DEV : process.env.MONGO_URI;
    if (!uri) {
        console.error("Brak MONGO_URI lub MONGO_URI_DEV w .env.local");
        process.exit(1);
    }

    await mongoose.connect(uri, { maxIdleTimeMS: 10000, maxPoolSize: 10 });
    console.log("Połączono z MongoDB");

    const courses = await Course.find().lean();
    console.log(`Znaleziono ${courses.length} kursów.\n`);

    let updated = 0;
    for (const doc of courses) {
        const id = (doc as { _id: unknown })._id;
        const updates: Record<string, unknown> = {};
        for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
            if (!(key in doc)) {
                if (defaultValue !== undefined) {
                    updates[key] = defaultValue;
                } else {
                    updates[key] = null;
                }
            }
        }
        if (Object.keys(updates).length > 0) {
            await Course.updateOne({ _id: id! }, { $set: updates });
            const nazwa = (doc as { nazwa?: string }).nazwa ?? String(id);
            console.log("  zaktualizowano:", nazwa);
            updated++;
        }
    }

    console.log(`\nGotowe. Zaktualizowano ${updated} z ${courses.length} kursów.`);
    await mongoose.connection.close();
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    mongoose.connection.close().catch(() => { });
    process.exit(1);
});
