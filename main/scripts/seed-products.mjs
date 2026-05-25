/**
 * Seed produktów z wariantami + kategorie (type: product) i producenci, jeśli nie istnieją.
 *
 * Media:
 * - path: losowy „folder/plik” (łańcuch), np. /uploads/a3f2/b7c9d1e2.png
 * - nazwa: jak nazwa produktu (obcięta do 25 znaków, min. 3 — inaczej image-{nr}.png)
 * - kolejne zdjęcia: image-2.png, image-3.png, …
 *
 * Uruchom z folderu main:
 *   node scripts/seed-products.mjs
 *
 * Wczytuje ../.env.local (MONGO_URI_DEV lub MONGO_URI); fallback: mongodb://127.0.0.1:27017/fryzjerpremium
 */

import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import { config } from "dotenv";
import mongoosePkg from "mongoose";

const { Schema, model, models, default: mongoose } = mongoosePkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env.local") });

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Jak w sklepie: `finalPrice` liczy brutto = netto + netto * VAT% (domyślnie 23). */
const VAT_PCT = 23;

/**
 * Netto do pola `cena` / `nowa_cena` / `cena_skupu`, tak aby po VAT kwota brutto
 * (toFixed(2)) miała „sklepową” końcówkę (.99, .39, .19, .00 itd.).
 */
function netFromTargetGross(brutto) {
  return Math.round((brutto / (1 + VAT_PCT / 100)) * 100) / 100;
}

function randomMediaPath() {
  const id = randomBytes(16).toString("hex");
  const dir = id.slice(0, 6);
  return `/uploads/${dir}/${id}.png`;
}

/** nazwa pliku w sensie pola `media.nazwa` (3–25 znaków wg schematu) */
function mediaNazwa(productName, ordinal) {
  const base = String(productName).trim();
  if (ordinal === 1 && base.length >= 3) {
    return base.length <= 25 ? base : base.slice(0, 25);
  }
  return `image-${ordinal}.png`;
}

const wariantPropsSchema = new Schema(
  {
    name: { type: String, required: true },
    val: { type: String, required: true },
    hex: String,
  },
  { _id: false },
);

const wariantySchema = new Schema(
  {
    nazwa: { type: String, required: true },
    slug: { type: String, required: true },
    typ: {
      type: String,
      enum: ["kolor", "rozmiar", "objetosc", "specjalna", "hurt"],
    },
    ilosc: { type: Number, min: 0, required: true, default: 0 },
    kolory: { type: wariantPropsSchema },
    rozmiary: { type: wariantPropsSchema },
    objetosc: { type: Number },
    nadpisuje_cene: { type: Boolean },
    inna_cena_skupu: { type: Boolean },
    cena_skupu: { type: Number },
    permisje: { type: Number },
    nowa_cena: Number,
  },
  { _id: true },
);

const mediaProductSchema = new Schema(
  {
    nazwa: { type: String, required: true, minlength: 3, maxlength: 25 },
    slug: { type: String, required: true },
    typ: { type: String, enum: ["video", "image", "pdf", "other"] },
    alt: { type: String, required: true },
    path: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

const producentsSchema = new Schema(
  {
    nazwa: { type: String, required: true, unique: true },
    slug: String,
    strona_internetowa: String,
  },
  { timestamps: false },
);

const categoriesSchema = new Schema(
  {
    nazwa: { type: String, required: true, unique: true, default: "Brak nazwy" },
    slug: { type: String, required: true },
    type: { type: String, enum: ["product", "course"] },
    kategoria: { type: String },
    image: { type: mediaProductSchema },
  },
  { timestamps: true },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nazwa: { type: String, required: true, unique: true },
    cena_skupu: { type: Number, required: true },
    cena: { type: Number, required: true },
    dostepnosc: { type: String, required: true },
    kategoria: { type: [Schema.Types.ObjectId], required: true, ref: "Categories" },
    producent: { type: Schema.Types.ObjectId, required: true, ref: "Producents" },
    media: { type: [mediaProductSchema], default: [] },
    promocje: { type: Schema.Types.ObjectId, ref: "Promos" },
    opis: { type: String, required: true },
    ilosc: { type: Number, min: 0, required: true, default: 0 },
    czas_wysylki: { type: Number, required: true, min: 1 },
    kod_produkcyjny: { type: String, required: true },
    ocena: { type: Number, required: true, default: 0 },
    opinie: { type: [], default: [] },
    vat: { type: Number, required: true, default: 23 },
    wariant: { type: [wariantySchema] },
    sku: { type: String, required: true, unique: true },
    kod_ean: String,
    aktywne: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Producent = models.Producents || model("Producents", producentsSchema);
const Category = models.Categories || model("Categories", categoriesSchema);
const Product = models.Products || model("Products", productSchema);

async function ensureProducent(nazwa) {
  const existing = await Producent.findOne({ nazwa });
  if (existing) return existing;
  return Producent.create({
    nazwa,
    slug: slugify(nazwa),
    strona_internetowa: "https://example.com",
  });
}

async function ensureCategory({ nazwa, slug, kategoria }) {
  const s = slug || slugify(nazwa);
  let doc = await Category.findOne({ type: "product", $or: [{ slug: s }, { nazwa }] });
  if (doc) return doc;
  return Category.create({
    nazwa,
    slug: s,
    type: "product",
    kategoria: kategoria ?? nazwa,
  });
}

function buildMediaForProduct(nazwa, count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const nazwaMedia = mediaNazwa(nazwa, i);
    list.push({
      nazwa: nazwaMedia,
      slug: slugify(nazwaMedia) || `img-${i}`,
      typ: "image",
      alt: nazwa,
      path: randomMediaPath(),
    });
  }
  return list;
}

/**
 * Warianty do zapisu w Mongo — zgodnie z panelem admin:
 * - pierwszy wariant = domyślny (cena z produktu, bez nadpisuje_cene);
 * - jego `ilosc` = `ilosc` produktu (stan magazynowy; w UI nie edytuje się osobno);
 * - kolejne warianty mają własny stan (`ilosc` w seedzie lub 0).
 */
function buildWarianty(stanMagazynowy, raw = []) {
  if (!raw.length) return [];

  return raw.map((w, index) => {
    const base = { ...w };
    if (index === 0) {
      base.ilosc = stanMagazynowy;
      delete base.nadpisuje_cene;
      delete base.nowa_cena;
      delete base.inna_cena_skupu;
      delete base.cena_skupu;
      return base;
    }
    base.ilosc =
      typeof w.ilosc === "number" && w.ilosc >= 0 ? w.ilosc : 0;
    return base;
  });
}

const CATEGORY_SEEDS = [
  { nazwa: "Kosmetyki do włosów", slug: "kosmetyki-do-wlosow", kategoria: "Pielęgnacja" },
  { nazwa: "Narzędzia fryzjerskie", slug: "narzedzia-fryzjerskie", kategoria: "Salon" },
  { nazwa: "Farby i oksydanty", slug: "farby-i-oksydanty", kategoria: "Koloryzacja" },
];

const PRODUCENT_SEEDS = ["SalonPro", "HairLux"];

/**
 * Zasady seeda (zgodnie z modelem katalogu i panelem admin):
 * - Nazwa produktu: bez objętości, koloru, rozmiaru, hurtu — to idzie do wariantów.
 * - Pierwszy wariant = domyślny (cena z produktu); bez nadpisuje_cene / nowa_cena.
 * - Stan: pole `ilosc` na produkcie = stan magazynowy; pierwszy wariant dostaje tę samą
 *   wartość (w edycji nie zmienia się osobno — tylko „Stan magazynowy” u góry).
 * - Kolejne warianty: własne `ilosc` w seedzie (osobny stan per wariant).
 * - Kolejne warianty mogą nadpisywać cenę (inny rozmiar, kolor premium, itd.).
 * - Typ „hurt”: zawsze nadpisuje cenę (nowa_cena); osobny stan opcjonalnie.
 * - Produkty bez wariantów — `wariant: []`, tylko `ilosc` produktu.
 * - `cena` / `nowa_cena` / `cena_skupu` — netto (netFromTargetGross przy VAT 23%).
 */
const PRODUCT_SEEDS = [
  {
    nazwa: "Szampon regenerujący",
    cena: netFromTargetGross(61.99),
    cena_skupu: netFromTargetGross(27.99),
    dostepnosc: "duza",
    categorySlug: "kosmetyki-do-wlosow",
    producentName: "SalonPro",
    opis: "Delikatne mycie, regeneracja zniszczonych włosów. Cena podstawowa dotyczy pojemności 300 ml.",
    ilosc: 120,
    czas_wysylki: 2,
    imageCount: 2,
    wariant: [
      {
        nazwa: "300 ml",
        slug: "obj-300",
        typ: "objetosc",
        objetosc: 300,
      },
      {
        nazwa: "250 ml",
        slug: "obj-250",
        typ: "objetosc",
        objetosc: 250,
        ilosc: 48,
        nadpisuje_cene: true,
        nowa_cena: netFromTargetGross(54.99),
      },
      {
        nazwa: "500 ml",
        slug: "obj-500",
        typ: "objetosc",
        objetosc: 500,
        ilosc: 22,
        nadpisuje_cene: true,
        nowa_cena: netFromTargetGross(98.99),
        inna_cena_skupu: true,
        cena_skupu: netFromTargetGross(47.99),
      },
    ],
  },
  {
    nazwa: "Maszynka fade premium",
    cena: netFromTargetGross(355.99),
    cena_skupu: netFromTargetGross(172.99),
    dostepnosc: "ograniczona",
    categorySlug: "narzedzia-fryzjerskie",
    producentName: "HairLux",
    opis: "Profesjonalna maszynka do fade i konturów.",
    ilosc: 15,
    czas_wysylki: 3,
    imageCount: 1,
    wariant: [
      {
        nazwa: "Czarna",
        slug: "kolor-czarna",
        typ: "kolor",
        kolory: { name: "Kolor obudowy", val: "Czarny", hex: "#111111" },
      },
      {
        nazwa: "Srebrna",
        slug: "kolor-srebrna",
        typ: "kolor",
        kolory: { name: "Kolor obudowy", val: "Srebrny", hex: "#c0c0c0" },
        ilosc: 7,
        nadpisuje_cene: true,
        nowa_cena: netFromTargetGross(367.99),
      },
    ],
  },
  {
    nazwa: "Nożyczki fryzjerskie",
    cena: netFromTargetGross(244.99),
    cena_skupu: netFromTargetGross(117.99),
    dostepnosc: "duza",
    categorySlug: "narzedzia-fryzjerskie",
    producentName: "SalonPro",
    opis: "Stal japońska. Cena podstawowa dotyczy długości 6 cali.",
    ilosc: 40,
    czas_wysylki: 1,
    imageCount: 3,
    wariant: [
      {
        nazwa: "6 cali",
        slug: "rozmiar-6cali",
        typ: "rozmiar",
        rozmiary: { name: "Długość", val: "6 cali" },
      },
      {
        nazwa: "7 cali",
        slug: "rozmiar-7cali",
        typ: "rozmiar",
        rozmiary: { name: "Długość", val: "7 cali" },
        ilosc: 18,
        nadpisuje_cene: true,
        nowa_cena: netFromTargetGross(257.99),
      },
    ],
  },
  {
    nazwa: "Farba kremowa – seria naturalna",
    cena: netFromTargetGross(42.39),
    cena_skupu: netFromTargetGross(17.39),
    dostepnosc: "mała",
    categorySlug: "farby-i-oksydanty",
    producentName: "HairLux",
    opis: "Kremowa farba trwała, tuba 100 ml. Detal: pierwszy wariant; hurt — ta sama pozycja z niższą ceną dla B2B (bez określonej ilości w nazwie).",
    ilosc: 80,
    czas_wysylki: 2,
    imageCount: 2,
    wariant: [
      {
        nazwa: "Naturalny blond",
        slug: "kolor-naturalny-blond",
        typ: "kolor",
        kolory: { name: "Odcień", val: "Naturalny blond", hex: "#d4a574" },
      },
      {
        nazwa: "Naturalny blond — hurt",
        slug: "hurt-naturalny-blond",
        typ: "hurt",
        ilosc: 200,
        permisje: 0,
        nadpisuje_cene: true,
        nowa_cena: netFromTargetGross(33.89),
        inna_cena_skupu: true,
        cena_skupu: netFromTargetGross(13.69),
      },
    ],
  },
  {
    nazwa: "Krzesło fryzjerskie hydrauliczne",
    cena: netFromTargetGross(899.99),
    cena_skupu: netFromTargetGross(639.99),
    dostepnosc: "ograniczona",
    categorySlug: "narzedzia-fryzjerskie",
    producentName: "SalonPro",
    opis: "Fotel barberski z podnóżkiem i stabilną bazą. Jedna konfiguracja — bez wariantów.",
    ilosc: 6,
    czas_wysylki: 5,
    imageCount: 2,
    wariant: [],
  },
];

async function main() {
  const uri =
    process.env.MONGO_URI_DEV ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/fryzjerpremium";

  await mongoose.connect(uri, { maxIdleTimeMS: 10000, maxPoolSize: 10 });
  console.log("Połączono z MongoDB");

  const catBySlug = new Map();
  for (const c of CATEGORY_SEEDS) {
    const doc = await ensureCategory(c);
    catBySlug.set(c.slug, doc._id);
    console.log("Kategoria:", doc.nazwa, "→", String(doc._id));
  }

  const prodByName = new Map();
  for (const name of PRODUCENT_SEEDS) {
    const doc = await ensureProducent(name);
    prodByName.set(name, doc._id);
    console.log("Producent:", doc.nazwa, "→", String(doc._id));
  }

  const stamp = Date.now().toString(36);

  for (let i = 0; i < PRODUCT_SEEDS.length; i++) {
    const p = PRODUCT_SEEDS[i];
    const baseSlug = slugify(p.nazwa);
    const slug = `${baseSlug}-${stamp}-${i}`;
    const sku = `SEED-${stamp}-${i}`;
    const kod = `KP-${stamp}-${i}`;

    const exists = await Product.findOne({
      $or: [{ slug: baseSlug }, { nazwa: p.nazwa }, { sku }],
    });
    if (exists) {
      console.log("Pomijam (już jest podobny):", p.nazwa);
      continue;
    }

    const kategoriaId = catBySlug.get(p.categorySlug);
    if (!kategoriaId) {
      console.warn("Brak kategorii dla slug:", p.categorySlug);
      continue;
    }

    const producentId = prodByName.get(p.producentName);
    if (!producentId) {
      console.warn("Brak producenta:", p.producentName);
      continue;
    }

    const media = buildMediaForProduct(p.nazwa, p.imageCount ?? 1);
    const wariant = buildWarianty(p.ilosc, p.wariant ?? []);

    await Product.create({
      slug,
      nazwa: p.nazwa,
      cena_skupu: p.cena_skupu,
      cena: p.cena,
      dostepnosc: p.dostepnosc,
      kategoria: [kategoriaId],
      producent: producentId,
      media,
      opis: p.opis,
      ilosc: p.ilosc,
      czas_wysylki: p.czas_wysylki,
      kod_produkcyjny: kod,
      ocena: 0,
      vat: 23,
      sku,
      wariant,
      aktywne: true,
    });

    const wariantInfo =
      wariant.length > 0
        ? ` | warianty: ${wariant.length} (pierwszy stan=${wariant[0].ilosc})`
        : "";
    console.log("Dodano produkt:", p.nazwa, "| slug:", slug, "| sku:", sku, wariantInfo);
  }

  await mongoose.connection.close();
  console.log("Gotowe.");
}

main().catch((err) => {
  console.error(err);
  mongoose.connection.close().catch(() => {});
  process.exit(1);
});
