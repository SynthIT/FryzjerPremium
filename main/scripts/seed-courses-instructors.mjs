/**
 * Seed: 2 firmy (po 3 instruktorów), 10 użytkowników-instruktorów,
 * 5 kategorii (course), 20 kursów (ratio 3:1 firmy:indywidualni).
 * Wymaga: zalogowany admin (user1@seed.test / Test123!@#) i działający serwer na localhost:3000.
 * Uruchom: node scripts/seed-courses-instructors.mjs
 */

const BASE = "http://localhost:3000";

const INSTRUCTORS = [
  { imie: "Mieszko", nazwisko: "Kopernik" },
  { imie: "Bolesław", nazwisko: "Curie" },
  { imie: "Kazimierz", nazwisko: "Wałęsa" },
  { imie: "Anna", nazwisko: "Skłodowska" },
  { imie: "Stefan", nazwisko: "Banach" },
  { imie: "Maria", nazwisko: "Rejewska" },
  { imie: "Zbigniew", nazwisko: "Nożyczki" },
  { imie: "Ewa", nazwisko: "Włosów" },
  { imie: "Stanisław", nazwisko: "Fryzjer" },
  { imie: "Helena", nazwisko: "Strzyż" },
];

const CATEGORY_NAMES = [
  "Strzyżenie",
  "Koloryzacja",
  "Stylizacja",
  "Kursy zaawansowane",
  "Kursy men",
];

function slug(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function media(name, path = "") {
  return {
    nazwa: name,
    slug: slug(name),
    typ: "image",
    alt: name,
    path: path || "/img/" + Math.random().toString(36).slice(2, 10),
  };
}

function lekcja(tytul, opis = "Opis lekcji", dlugosc = "10 min") {
  return { tytul, opis, dlugosc };
}

async function main() {
  const loginRes = await fetch(BASE + "/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "x@gmail.com",
      password: "x!",
    }),
    redirect: "manual",
  });
  if (!loginRes.ok) {
    throw new Error("Login failed: " + (await loginRes.text()));
  }
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const cookie = setCookie
    .split(",")
    .map((c) => c.split(";")[0].trim())
    .join("; ");
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  // --- 1. Rejestracja 10 instruktorów ---
  const instructorIds = [];
  const instructorNames = [];
  for (let i = 0; i < INSTRUCTORS.length; i++) {
    const { imie, nazwisko } = INSTRUCTORS[i];
    const email = `instruktor${i + 1}@seed.test`;
    const haslo = "Instruktor123!@#";
    const body = {
      imie,
      nazwisko,
      email,
      haslo,
      nr_domu: "1",
      ulica: "ul. Szkoleniowa",
      miasto: "Warszawa",
      kraj: "Polska",
      kod_pocztowy: "00-001",
      telefon: "+48123456789",
    };
    const r = await fetch(BASE + "/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.status === 201 && d.user && d.user._id) {
      instructorIds.push(d.user._id);
      instructorNames.push(`${imie} ${nazwisko}`);
      console.log("Zarejestrowano instruktora:", imie, nazwisko, email);
    } else {
      console.log("Błąd rejestracji", i + 1, d.error || d);
    }
  }
  if (instructorIds.length !== 10) {
    console.log(instructorIds);
    throw new Error("Nie udało się zarejestrować 10 instruktorów. Upewnij się, że adresy instrukto*@seed.test nie istnieją.");
  }

  // --- 2. Utworzenie 2 firm (z przypisaniem po 3 instruktorów) + 1 firma „indywidualni” ---
  const firmPayloads = [
    {
      nazwa: "Akademia Fryzjerstwa Premium",
      slug: "akademia-fryzjerstwa-premium",
      logo: media("Logo Akademii", "/img/akademia"),
      opis: "Firma szkoleniowa nr 1.",
      strona_internetowa: "https://akademia-fryzjerstwa.pl",
      instruktorzy: instructorIds.slice(0, 3),
    },
    {
      nazwa: "Studio Szkoleń Fryzjerskich",
      slug: "studio-szkolen-fryzjerskich",
      logo: media("Logo Studio", "/img/studio"),
      opis: "Firma szkoleniowa nr 2.",
      strona_internetowa: "https://studio-szkolen.pl",
      instruktorzy: instructorIds.slice(3, 6),
    },
  ];

  const firmIds = [];
  for (const payload of firmPayloads) {
    const r = await fetch(BASE + "/admin/api/v1/firmy", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (r.status === 201 || d.status === 0) {
      const list = await fetch(BASE + "/admin/api/v1/firmy", { headers }).then((x) => x.json());
      const last = list.firmy?.find((f) => f.slug === payload.slug) || list.firmy?.slice(-1)[0];
      if (last) firmIds.push(last._id);
    }
    console.log("Firma:", payload.nazwa, r.status);
  }
  const gr = await fetch(BASE + "/admin/api/v1/firmy", { headers });
  const fr = await gr.json();
  const allFirmy = fr.firmy || [];
  const f1 = allFirmy.find((f) => f.slug === "akademia-fryzjerstwa-premium");
  const f2 = allFirmy.find((f) => f.slug === "studio-szkolen-fryzjerskich");
  if (f1) firmIds[0] = f1._id;
  if (f2) firmIds[1] = f2._id;

  const r3 = await fetch(BASE + "/admin/api/v1/firmy", {
    method: "POST",
    headers,
    body: JSON.stringify({
      nazwa: "Instruktorzy niezależni",
      slug: "instruktorzy-niezalezni",
      logo: media("Logo niezależni", "/img/niezalezni"),
      opis: "Indywidualni instruktorzy.",
      strona_internetowa: null,
      instruktorzy: instructorIds.slice(6, 10),
    }),
  });
  const list3 = await fetch(BASE + "/admin/api/v1/firmy", { headers }).then((x) => x.json());
  const f3 = (list3.firmy || []).find((f) => f.slug === "instruktorzy-niezalezni");
  const firm3Id = f3 ? f3._id : list3.firmy?.slice(-1)[0]?._id;
  if (firm3Id) firmIds.push(firm3Id);
  console.log("Firma 3 (niezależni):", r3.status);

  // --- 3. Utworzenie 5 kategorii (wszystkie pola zod bez _id, __v, createdAt, updatedAt) ---
  const categoryIds = [];
  for (const nazwa of CATEGORY_NAMES) {
    const payload = {
      nazwa,
      slug: slug(nazwa),
      kategoria: "Szkolenia",
      type: "course",
    };
    const r = await fetch(BASE + "/admin/api/v1/category", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (r.status === 200 && !d.error) {
      const gc = await fetch(BASE + "/admin/api/v1/category", { headers }).then((x) => x.json());
      const parsed = typeof gc.categories === "string" ? JSON.parse(gc.categories) : gc.categories || [];
      const cat = parsed.find((c) => c.nazwa === nazwa);
      if (cat) categoryIds.push(cat._id);
    }
    console.log("Kategoria:", nazwa, r.status);
  }
  const gcat = await fetch(BASE + "/admin/api/v1/category", { headers }).then((x) => x.json());
  const allCats = typeof gcat.categories === "string" ? JSON.parse(gcat.categories) : gcat.categories || [];
  const courseCats = allCats.filter((c) => c.type === "course");
  while (categoryIds.length < 5 && courseCats.length) {
    categoryIds.push(courseCats[categoryIds.length]._id);
  }

  // --- 4. Utworzenie 20 kursów: 15 firmy (3:1), 5 indywidualni; wszystkie pola zod wypełnione ---
  const coursePayload = (opts) => {
    const {
      nazwa,
      slugStr,
      cena = 299,
      firmaId,
      instruktorName,
      kategoriaIds,
    } = opts;
    return {
      slug: slugStr,
      nazwa,
      cena,
      prowizja: 10,
      prowizja_typ: "procent",
      prowizja_vat: "netto",
      kategoria: kategoriaIds,
      lekcje: [
        lekcja("Wprowadzenie", "Wprowadzenie do kursu", "15 min"),
        lekcja("Część praktyczna", "Ćwiczenia", "45 min"),
      ],
      firma: firmaId,
      media: [media("Główne zdjęcie kursu"), media("Galeria 1")],
      promocje: null,
      opis: "Pełny opis kursu. Zawiera materiały teoretyczne i praktyczne.",
      ocena: 0,
      opinie: null,
      vat: 23,
      sku: null,
      liczbaZapisanych: 0,
      czegoSieNauczysz: ["Techniki podstawowe", "Praca z klientem", "Stylizacja"],
      gwarancjaDni: 30,
      zawartoscKursu: ["Wideo", "PDF", "Zadania"],
      wymagania: ["Podstawowa znajomość fryzjerstwa"],
      dozywotniDostep: true,
      materialyDoPobrania: true,
      aktywne: true,
      czasTrwania: "8h",
      poziom: "średniozaawansowany",
      liczbaLekcji: 12,
      instruktor: instruktorName,
      jezyk: "polski",
      certyfikat: true,
      krotkiOpis: "Krótki opis kursu.",
    };
  };

  let courseIndex = 0;
  for (let i = 0; i < 15; i++) {
    const firmaId = firmIds[i % 2];
    const instrName = i < 6 ? instructorNames[i % 3] : instructorNames[3 + (i % 3)];
    const nazwa = `Kurs firmowy ${i + 1}`;
    const slugStr = slug(nazwa) + "-" + (courseIndex + 1);
    const payload = coursePayload({
      nazwa,
      slugStr,
      cena: 199 + i * 20,
      firmaId,
      instruktorName: instrName,
      kategoriaIds: [categoryIds[i % 5]],
    });
    const r = await fetch(BASE + "/admin/api/v1/courses", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    console.log("Kurs", courseIndex + 1, r.status, d.error || "OK");
    courseIndex++;
  }

  for (let i = 0; i < 5; i++) {
    const instrName = instructorNames[6 + (i % 4)];
    const nazwa = `Kurs indywidualny ${i + 1}`;
    const slugStr = slug(nazwa) + "-" + (courseIndex + 1);
    const payload = coursePayload({
      nazwa,
      slugStr,
      cena: 249 + i * 25,
      firmaId: firm3Id,
      instruktorName: instrName,
      kategoriaIds: [categoryIds[i % 5]],
    });
    const r = await fetch(BASE + "/admin/api/v1/courses", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    console.log("Kurs", courseIndex + 1, "(indywidualny)", r.status, d.error || "OK");
    courseIndex++;
  }

  console.log("\nGotowe: 2 firmy (po 3 instr.), 1 firma niezależnych (4 instr.), 10 instruktorów, 5 kategorii, 20 kursów (15 firmowych, 5 indywidualnych).");
  console.log("Logowania instruktorów: instruktor1@seed.test … instruktor10@seed.test, hasło: Instruktor123!@#");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
