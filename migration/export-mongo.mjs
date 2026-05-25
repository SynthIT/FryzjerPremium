/**
 * Eksport kolekcji MongoDB do ./data/*.json
 * Użycie: MONGODB_URI="..." node export-mongo.mjs
 */
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "data");

const COLLECTIONS = [
    "producents",
    "categories",
    "promos",
    "products",
    "roles",
    "users",
    "courses",
    "orders",
    "deliveries",
    "notifications",
];

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("Ustaw MONGODB_URI");
    process.exit(1);
}

await mongoose.connect(uri);
await mkdir(OUT_DIR, { recursive: true });

const db = mongoose.connection.db;
for (const name of COLLECTIONS) {
    try {
        const docs = await db.collection(name).find({}).toArray();
        const path = join(OUT_DIR, `${name}.json`);
        await writeFile(path, JSON.stringify(docs, null, 2), "utf8");
        console.log(`${name}: ${docs.length} dokumentów → ${path}`);
    } catch (e) {
        console.warn(`${name}: pominięto (${e.message})`);
    }
}

await mongoose.disconnect();
console.log("Eksport zakończony.");
