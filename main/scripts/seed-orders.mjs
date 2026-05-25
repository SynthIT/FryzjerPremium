/**
 * Seed ~40 zamówień z losowymi datami (ostatni rok → dziś).
 * Produkty/kursy: ObjectId z istniejących rekordów.
 * numer_zamowienia: ten sam algorytm co w koszyku (cart/route.ts).
 * createdAt = utworzenie koszyka; data_zamowienia = opłacenie (+10–50 min).
 *
 * Uruchom z folderu main:
 *   node scripts/seed-orders.mjs
 *
 * Wczytuje ../.env.local (MONGO_URI_DEV lub MONGO_URI).
 */

import path from "path";
import { fileURLToPath } from "url";
import { randomBytes, randomInt } from "crypto";
import { config } from "dotenv";
import mongoosePkg from "mongoose";

const { Schema, model, models, default: mongoose, Types } = mongoosePkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env.local") });

const ORDER_COUNT = 40;

const STATUSES = [
  "w_realizacji",
  "wyslane",
  "zrealizowane",
  "opłacone",
  "w_realizacji",
  "wyslane",
  "zrealizowane",
];

const IMIONA = [
  "Anna",
  "Jan",
  "Maria",
  "Piotr",
  "Katarzyna",
  "Tomasz",
  "Agnieszka",
  "Michał",
  "Ewa",
  "Paweł",
];
const NAZWISKA = [
  "Kowalska",
  "Nowak",
  "Wiśniewski",
  "Wójcik",
  "Kowalczyk",
  "Kamińska",
  "Lewandowski",
  "Zieliński",
  "Szymańska",
  "Woźniak",
];
const ULICE = [
  "Kwiatowa",
  "Polna",
  "Lipowa",
  "Słoneczna",
  "Leśna",
  "Ogrodowa",
  "Krótka",
  "Długa",
];
const MIASTA = [
  "Warszawa",
  "Kraków",
  "Gdańsk",
  "Wrocław",
  "Poznań",
  "Łódź",
  "Szczecin",
  "Lublin",
];

/** Jak w app/api/v1/users/cart/route.ts — createOrderNumber */
function createOrderNumber(forDate) {
  const h = randomBytes(8).toString("hex");
  const a = forDate;
  const d =
    `${h}-${a.getDate() < 10 ? `0${a.getDate()}` : a.getDate()}` +
    `${a.getMonth() < 9 ? `0${a.getMonth() + 1}` : a.getMonth() + 1}` +
    `${a.getFullYear()}`;
  return d;
}

/** Jak lib/cart/pricing.ts — linePriceBrutto */
function linePriceBrutto(cenaNetto, vat, wariant, promocje) {
  let base = cenaNetto;
  if (wariant?.nadpisuje_cene && wariant.nowa_cena != null) {
    base = wariant.nowa_cena;
  }
  if (promocje?.procent != null && promocje.procent !== 0) {
    base = base * ((100 - promocje.procent) / 100);
  }
  if (promocje?.special?.obniza_cene && promocje.special.obnizka) {
    base = base - (base * promocje.special.obnizka) / 100;
  }
  if (promocje?.special?.zmienia_cene && promocje.special.nowa_cena != null) {
    base = promocje.special.nowa_cena;
  }
  return Math.round((base + (base * vat) / 100) * 100) / 100;
}

function pick(arr) {
  return arr[randomInt(arr.length)];
}

function randomDateBetween(start, end) {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function orderSuma(produkty, kursy) {
  const lines = [...produkty, ...kursy];
  const raw = lines.reduce((s, l) => s + l.ilosc * l.cena, 0);
  return Math.round(raw * 100) / 100;
}

function buildDane(email) {
  const imie = pick(IMIONA);
  const nazwisko = pick(NAZWISKA);
  return {
    imie,
    nazwisko,
    email,
    nr_domu: String(randomInt(1, 120)),
    nr_lokalu: randomInt(0, 3) === 0 ? String(randomInt(1, 40)) : undefined,
    ulica: `${pick(ULICE)} ${randomInt(1, 50)}`,
    miasto: pick(MIASTA),
    kraj: "Polska",
    kod_pocztowy: `${randomInt(10, 99)}-${randomInt(100, 999)}`,
    telefon: `+48 ${randomInt(500, 799)} ${randomInt(100, 999)} ${randomInt(100, 999)}`,
    faktura: randomInt(0, 1) === 1,
    osoba_prywatna: true,
  };
}

function buildProductLine(product) {
  const warianty = product.wariant ?? [];
  const wariant =
    warianty.length > 0 ? pick(warianty) : undefined;
  const cena = linePriceBrutto(
    product.cena,
    product.vat ?? 23,
    wariant,
    product.promocje ?? null,
  );
  const line = {
    ilosc: randomInt(1, 4),
    cena,
    pozycja: product._id,
  };
  if (wariant?.slug) line.wariant = wariant.slug;
  return line;
}

function buildCourseLine(course) {
  const cena = linePriceBrutto(
    course.cena,
    course.vat ?? 23,
    undefined,
    course.promocje ?? null,
  );
  return {
    ilosc: 1,
    cena,
    pozycja: course._id,
  };
}

// —— Schematy (minimalne, zgodne z modelem aplikacji) ——

const orderDaneSchema = new Schema(
  {
    imie: String,
    nazwisko: String,
    email: String,
    nr_domu: String,
    nr_lokalu: String,
    ulica: String,
    miasto: String,
    kraj: String,
    kod_pocztowy: String,
    telefon: String,
    nip: String,
    faktura: { type: Boolean, default: false },
    osoba_prywatna: { type: Boolean, default: true },
  },
  { _id: false },
);

const detailedProductOrderEntrySchema = new Schema(
  {
    ilosc: { type: Number, required: true },
    cena: { type: Number, required: true },
    pozycja: { type: Types.ObjectId, ref: "Products", required: true },
    wariant: String,
  },
  { _id: false },
);

const detailedCourseOrderEntrySchema = new Schema(
  {
    ilosc: { type: Number, required: true },
    cena: { type: Number, required: true },
    pozycja: { type: Types.ObjectId, ref: "Courses", required: true },
  },
  { _id: false },
);

const schemaOrderList = new Schema(
  {
    user: { type: Types.ObjectId, ref: "Users" },
    email: { type: String, required: true },
    dane: { type: orderDaneSchema },
    numer_zamowienia: { type: String, required: true, unique: true },
    nr_faktury: String,
    nr_faktury_kor: [String],
    status: { type: String, default: "w_koszyku" },
    sposob_dostawy: { type: Types.ObjectId, ref: "Deliveries" },
    produkty: { type: [detailedProductOrderEntrySchema], default: [] },
    kursy: { type: [detailedCourseOrderEntrySchema], default: [] },
    code: Number,
    suma: Number,
    data_zamowienia: Date,
    data_wystawienia_faktury: Date,
    data_wyslania: Date,
    data_zrealizowania: Date,
    data_anulowania: Date,
  },
  { timestamps: true, autoIndex: false },
);

const Orders =
  models.Orders ?? model("Orders", schemaOrderList);

const Product =
  models.Products ??
  model(
    "Products",
    new Schema({}, { strict: false, collection: "products" }),
  );

const Course =
  models.Courses ??
  model(
    "Courses",
    new Schema({}, { strict: false, collection: "courses" }),
  );

const User =
  models.Users ??
  model(
    "Users",
    new Schema({}, { strict: false, collection: "users" }),
  );

const Delivery =
  models.Deliveries ??
  model(
    "Deliveries",
    new Schema({}, { strict: false, collection: "deliveries" }),
  );

async function main() {
  const uri =
    process.env.MONGO_URI_DEV ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/fryzjerpremium";

  await mongoose.connect(uri);
  console.log("Połączono z MongoDB");

  const [products, courses, users, deliveries, existingCount] =
    await Promise.all([
      Product.find({ aktywne: { $ne: false } })
        .select("_id cena vat wariant promocje nazwa")
        .lean(),
      Course.find({}).select("_id cena vat promocje nazwa").lean(),
      User.find({}).select("_id email imie nazwisko").limit(50).lean(),
      Delivery.find({}).select("_id nazwa").lean(),
      Orders.countDocuments(),
    ]);

  if (products.length === 0 && courses.length === 0) {
    console.error(
      "Brak produktów i kursów w bazie. Uruchom najpierw seed-products / seed-courses.",
    );
    process.exit(1);
  }

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);

  const usedNumbers = new Set();
  const docs = [];

  for (let i = 0; i < ORDER_COUNT; i++) {
    const createdAt = randomDateBetween(yearAgo, today);
    const payDelayMin = 10 + randomInt(0, 41);
    const data_zamowienia = addMinutes(createdAt, payDelayMin);

    let numer_zamowienia;
    do {
      numer_zamowienia = createOrderNumber(createdAt);
    } while (usedNumbers.has(numer_zamowienia));
    usedNumbers.add(numer_zamowienia);

    const hasProducts = products.length > 0 && randomInt(0, 10) !== 0;
    const hasCourses =
      courses.length > 0 &&
      (hasProducts ? randomInt(0, 3) === 0 : true);

    const produkty = [];
    const kursy = [];

    if (hasProducts) {
      const count = randomInt(1, Math.min(3, products.length));
      const picked = new Set();
      while (picked.size < count) {
        picked.add(randomInt(0, products.length));
      }
      for (const idx of picked) {
        produkty.push(buildProductLine(products[idx]));
      }
    }

    if (hasCourses) {
      const count = randomInt(1, Math.min(2, courses.length));
      const picked = new Set();
      while (picked.size < count) {
        picked.add(randomInt(0, courses.length));
      }
      for (const idx of picked) {
        kursy.push(buildCourseLine(courses[idx]));
      }
    }

    if (produkty.length === 0 && kursy.length === 0) {
      if (products.length > 0) produkty.push(buildProductLine(pick(products)));
      else kursy.push(buildCourseLine(pick(courses)));
    }

    const suma = orderSuma(produkty, kursy);
    const status = pick(STATUSES);

    const guestUser =
      users.length > 0 && randomInt(0, 2) > 0 ? pick(users) : null;
    const email =
      guestUser?.email ??
      `zamowienie.seed+${randomBytes(4).toString("hex")}@example.test`;

    const doc = {
      email,
      dane: buildDane(email),
      numer_zamowienia,
      status,
      produkty,
      kursy,
      suma,
      code: randomInt(100_000, 999_999),
      data_zamowienia,
      nr_faktury: `FV/${numer_zamowienia}`,
      data_wystawienia_faktury: addMinutes(data_zamowienia, randomInt(5, 90)),
      createdAt,
      updatedAt: data_zamowienia,
    };

    if (guestUser?._id) doc.user = guestUser._id;

    if (produkty.length > 0 && deliveries.length > 0) {
      doc.sposob_dostawy = pick(deliveries)._id;
    }

    if (status === "wyslane" || status === "zrealizowane") {
      doc.data_wyslania = addDays(data_zamowienia, randomInt(1, 5));
    }
    if (status === "zrealizowane") {
      doc.data_zrealizowania = addDays(
        doc.data_wyslania ?? data_zamowienia,
        randomInt(1, 7),
      );
    }

    docs.push(doc);
  }

  const inserted = await Orders.insertMany(docs, { ordered: false });
  console.log(
    `Dodano ${inserted.length} zamówień (wcześniej w kolekcji: ${existingCount}).`,
  );
  console.log(
    "Zakres dat utworzenia:",
    yearAgo.toISOString().slice(0, 10),
    "→",
    today.toISOString().slice(0, 10),
  );

  await mongoose.connection.close();
  console.log("Gotowe.");
}

main().catch((err) => {
  console.error(err);
  mongoose.connection.close().catch(() => {});
  process.exit(1);
});
