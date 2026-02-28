/**
 * Seed 5 dodatkowych kursów z dużą różnorodnością:
 * - zróżnicowane lekcje (liczba, tytuły, opisy, długości),
 * - różne opisy, ceny, wymagania, czegoSieNauczysz, zawartoscKursu.
 *
 * Wymaga: działający serwer na localhost:3000 i konto admin (logowanie w skrypcie).
 * Uruchom: node scripts/seed-courses-varied.mjs
 */

const BASE = "http://localhost:3000";

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

// —— Dane 5 kursów (duża różnorodność) ——
const VARIED_COURSES = [
  {
    nazwa: "Koloryzacja od A do Z – pełny warsztat",
    cena: 89,
    krotkiOpis: "Intensywny warsztat koloryzacji w jeden weekend. Dla początkujących.",
    opis: `Kurs przeznaczony jest dla osób, które chcą w krótkim czasie opanować podstawy koloryzacji włosów. Pracujemy na modelach, w małych grupach. Każdy uczestnik wykonuje pełną koloryzację pod okiem instruktora. Omawiamy dobór kolorów do karnacji, techniki nakładania, zabezpieczenie skóry i ubrań. Nie wymagamy wcześniejszego doświadczenia – wystarczy chęć nauki i podstawowa znajomość fryzjerstwa. Materiały w cenie kursu.`,
    czasTrwania: "2 dni po 6h",
    poziom: "początkujący",
    liczbaLekcji: 6,
    gwarancjaDni: 14,
    dozywotniDostep: false,
    materialyDoPobrania: true,
    certyfikat: true,
    jezyk: "polski",
    wymagania: [
      "Ukończone 18 lat",
      "Chęć nauki koloryzacji",
    ],
    czegoSieNauczysz: [
      "Dobór koloru do karnacji i typu włosów",
      "Bezpieczne nakładanie farby",
      "Mycie i pielęgnacja po koloryzacji",
      "Podstawy korekty koloru",
    ],
    zawartoscKursu: [
      "6 lekcji wideo",
      "PDF: karta kolorystyczna",
      "Ćwiczenia do wykonania w domu",
    ],
    lekcje: [
      { tytul: "Wprowadzenie do koloryzacji", opis: "Teoria koloru, typy farb, narzędzia.", dlugosc: "25 min", rozdzial: "Teoria" },
      { tytul: "Dobór koloru", opis: "Jak dobrać odcień do karnacji i oczekiwań klienta.", dlugosc: "20 min", rozdzial: "Teoria" },
      { tytul: "Przygotowanie stanowiska i klienta", opis: "Zabezpieczenie ubrań, skóry, mieszanie farby.", dlugosc: "15 min", rozdzial: "Praktyka" },
      { tytul: "Koloryzacja na modelu – część 1", opis: "Nakładanie farby od nasady, równomierna aplikacja.", dlugosc: "45 min", rozdzial: "Praktyka" },
      { tytul: "Koloryzacja na modelu – część 2", opis: "Spłukiwanie, pielęgnacja, omówienie efektu.", dlugosc: "30 min", rozdzial: "Praktyka" },
      { tytul: "Pytania i podsumowanie", opis: "Q&A, typowe błędy, dalsze kroki.", dlugosc: "20 min", rozdzial: "Zakończenie" },
    ],
  },
  {
    nazwa: "Zaawansowane techniki strzyżenia męskiego",
    cena: 599,
    krotkiOpis: "Dla fryzjerów z doświadczeniem: brzytwa, maszynka, precyzyjne linie.",
    opis: `Kurs dla osób z minimum rocznym doświadczeniem w strzyżeniu męskim. Skupiamy się na technikach zaawansowanych: strzyżenie brzytwą, degradacja maszynką, ostre linie i przejścia, styling na mokro i na sucho. Pracujemy na żywych modelach; każdy uczestnik wykonuje pełne strzyżenie w kilku wariantach. W cenie: materiały, certyfikat, dostęp do nagrań przez 12 miesięcy. Liczba miejsc ograniczona.`,
    czasTrwania: "24h (3 dni)",
    poziom: "zaawansowany",
    liczbaLekcji: 18,
    gwarancjaDni: 30,
    dozywotniDostep: true,
    materialyDoPobrania: true,
    certyfikat: true,
    jezyk: "polski",
    wymagania: [
      "Minimum 1 rok doświadczenia w strzyżeniu męskim",
      "Własna maszynka i nożyczki",
      "Znajomość podstawowych technik",
    ],
    czegoSieNauczysz: [
      "Strzyżenie brzytwą na mokro",
      "Precyzyjna degradacja maszynką (od 0,5 do 4 mm)",
      "Ostre linie (fade, undercut, skin fade)",
      "Stylizacja i finiszowanie",
      "Praca z trudnymi typami włosów",
      "Komunikacja z klientem przy wymagających oczekiwaniach",
    ],
    zawartoscKursu: [
      "18 lekcji wideo w pełnej rozdzielczości",
      "Skrypt PDF (80 stron)",
      "Karty technik do wydruku",
      "Dostęp do zamkniętej grupy na 12 miesięcy",
      "2 sesje Q&A online po kursie",
    ],
    lekcje: [
      { tytul: "Omówienie narzędzi i stanowiska", opis: "Brzytwa, maszynki, nożyczki, kosmetyki.", dlugosc: "30 min", rozdzial: "Wprowadzenie" },
      { tytul: "Bezpieczeństwo przy brzytwie", opis: "Prawidłowe trzymanie, kąty, pielęgnacja ostrza.", dlugosc: "25 min", rozdzial: "Wprowadzenie" },
      { tytul: "Strzyżenie brzytwą – technika podstawowa", opis: "Praca na mokro, kierunek cięcia.", dlugosc: "40 min", rozdzial: "Brzytwa" },
      { tytul: "Strzyżenie brzytwą – zaawansowane", opis: "Przejścia, linie, finisz.", dlugosc: "50 min", rozdzial: "Brzytwa" },
      { tytul: "Degradacja maszynką – od zera", opis: "Ustawienia, sekwencja, równomierność.", dlugosc: "45 min", rozdzial: "Maszynka" },
      { tytul: "Skin fade krok po kroku", opis: "Pełna procedura na modelu.", dlugosc: "55 min", rozdzial: "Maszynka" },
      { tytul: "Undercut i ostre linie", opis: "Wyznaczanie linii, utrwalanie kształtu.", dlugosc: "40 min", rozdzial: "Linie" },
      { tytul: "Stylizacja i finisz", opis: "Żele, woski, suszenie.", dlugosc: "35 min", rozdzial: "Finisz" },
      { tytul: "Praca z trudnymi włosami", opis: "Kręcone, cienkie, mieszane.", dlugosc: "30 min", rozdzial: "Specjalne przypadki" },
      { tytul: "Podsumowanie i certyfikat", opis: "Pytania, zalecenia, wręczenie certyfikatów.", dlugosc: "20 min", rozdzial: "Zakończenie" },
    ],
  },
  {
    nazwa: "Stylizacja okolicznościowa – ślub, sesje, pokazy",
    cena: 349,
    krotkiOpis: "Upinki, warkocze, przedłużanie – dla fryzjerów i wizażystów.",
    opis: `Kurs dla fryzjerów i osób z branży beauty, które chcą oferować stylizacje na wielkie wyjścia: śluby, komunie, sesje zdjęciowe, pokazy mody. Uczymy klasycznych upinek, warkoczy (francuski, holenderski, wodospad), pracy z przedłużaniami i wpinanymi pasemkami. Dużo praktyki na modelkach; każdy uczestnik wykonuje minimum dwie pełne stylizacje. W cenie: materiały, kawa, certyfikat.`,
    czasTrwania: "16h (2 dni)",
    poziom: "średniozaawansowany",
    liczbaLekcji: 12,
    gwarancjaDni: 21,
    dozywotniDostep: true,
    materialyDoPobrania: true,
    certyfikat: true,
    jezyk: "polski",
    wymagania: [
      "Podstawy fryzjerstwa (strzyżenie, stylizacja)",
      "Umiejętność pracy z włosami na głowie",
    ],
    czegoSieNauczysz: [
      "Klasyczna upinka ślubna krok po kroku",
      "Warkocz francuski i holenderski",
      "Warkocz wodospad i wianek",
      "Praca z przedłużaniami i wpinankami",
      "Dobór ozdób i kosmetyków",
      "Współpraca z wizażystą i fotografem",
    ],
    zawartoscKursu: [
      "12 lekcji wideo",
      "PDF: schematy upinek (20 stron)",
      "Lista polecanych produktów",
      "Dostęp do grupy Facebook – 6 miesięcy",
    ],
    lekcje: [
      { tytul: "Wprowadzenie – trendy i narzędzia", opis: "Przegląd trendów, spine’y, gumki, lakiery.", dlugosc: "20 min", rozdzial: "Wprowadzenie" },
      { tytul: "Przygotowanie włosów do stylizacji", opis: "Mycie, odżywka, suszenie, backcombing.", dlugosc: "25 min", rozdzial: "Przygotowanie" },
      { tytul: "Warkocz francuski – technika", opis: "Pleczenie od nasady, równomierne pasemka.", dlugosc: "35 min", rozdzial: "Warkocze" },
      { tytul: "Warkocz holenderski i wodospad", opis: "Różnice, kiedy stosować, ćwiczenia.", dlugosc: "40 min", rozdzial: "Warkocze" },
      { tytul: "Wianek z warkocza", opis: "Okrążenie głowy, mocowanie, ozdoby.", dlugosc: "30 min", rozdzial: "Warkocze" },
      { tytul: "Upinka ślubna – baza", opis: "Kok, podbicie, mocowanie.", dlugosc: "45 min", rozdzial: "Upinki" },
      { tytul: "Upinka ślubna – wersja z warkoczem", opis: "Połączenie plecionki z kokiem.", dlugosc: "50 min", rozdzial: "Upinki" },
      { tytul: "Przedłużania i wpinanki", opis: "Jak dobrać, jak wpiąć, styling.", dlugosc: "35 min", rozdzial: "Dodatki" },
      { tytul: "Sesja zdjęciowa – współpraca", opis: "Czas, planowanie, współpraca z ekipą.", dlugosc: "25 min", rozdzial: "Praktyka" },
      { tytul: "Praktyka na modelce – stylizacja 1", opis: "Pełna stylizacja od zera.", dlugosc: "60 min", rozdzial: "Praktyka" },
      { tytul: "Praktyka na modelce – stylizacja 2", opis: "Druga stylizacja, inny wariant.", dlugosc: "60 min", rozdzial: "Praktyka" },
      { tytul: "Podsumowanie i pytania", opis: "Q&A, certyfikaty.", dlugosc: "15 min", rozdzial: "Zakończenie" },
    ],
  },
  {
    nazwa: "Masterclass: koloryzacja kreatywna i balayage",
    cena: 1299,
    krotkiOpis: "Najwyższy poziom: balayage, ombre, kolory fantasy, korekty.",
    opis: `Kurs dla doświadczonych kolorystów (min. 2 lata w zawodzie), którzy chcą wejść na poziom master: balayage ręczny i pędzlem, ombre, kolory fantasy (pastelowe, neonowe), trudne korekty koloru, rozjaśnianie na ciemnych włosach bez brzydkich przejść. Pracujemy na modelach w małej grupie (max 8 osób). W cenie: materiały premium, obiad, certyfikat, 2 konsultacje online po kursie. Dostęp do nagrań dożywotnio.`,
    czasTrwania: "40h (5 dni)",
    poziom: "ekspert",
    liczbaLekcji: 22,
    gwarancjaDni: 60,
    dozywotniDostep: true,
    materialyDoPobrania: true,
    certyfikat: true,
    jezyk: "polski",
    wymagania: [
      "Minimum 2 lata doświadczenia w koloryzacji",
      "Znajomość podstawowych technik rozjaśniania",
      "Portfolio (przynajmniej 10 zdjęć prac)",
    ],
    czegoSieNauczysz: [
      "Balayage ręczny – pełna procedura",
      "Balayage pędzlem – precyzja i szybkość",
      "Ombre klasyczne i odwrócone",
      "Kolory pastelowe i fantasy (róż, fiolet, błękit)",
      "Rozjaśnianie ciemnych włosów bez pasemek",
      "Korekty po nieudanych farbowaniach",
      "Pielęgnacja po rozjaśnianiu",
      "Cennikowanie i sprzedaż usług premium",
    ],
    zawartoscKursu: [
      "22 lekcje wideo 4K",
      "Skrypt PDF (120 stron) z tabelami rozjaśniania",
      "Karty kolorów i receptury",
      "Dostęp do grupy masterclass – 24 miesiące",
      "2 indywidualne konsultacje online (po 45 min)",
      "Certyfikat Masterclass",
    ],
    lekcje: [
      { tytul: "Wprowadzenie do balayage", opis: "Historia, filozofia, kiedy stosować.", dlugosc: "30 min", rozdzial: "Teoria" },
      { tytul: "Dobór koloru i analiza włosa", opis: "Poziomy, odcień, porowatość.", dlugosc: "35 min", rozdzial: "Teoria" },
      { tytul: "Balayage ręczny – technika", opis: "Nakładanie ręką, gradient, kontrola.", dlugosc: "50 min", rozdzial: "Balayage" },
      { tytul: "Balayage ręczny – praktyka na modelu", opis: "Pełna procedura od mycia do finiszu.", dlugosc: "90 min", rozdzial: "Balayage" },
      { tytul: "Balayage pędzlem", opis: "Rodzaje pędzli, ruch, równomierność.", dlugosc: "40 min", rozdzial: "Balayage" },
      { tytul: "Balayage pędzlem – praktyka", opis: "Ćwiczenia na modelu.", dlugosc: "75 min", rozdzial: "Balayage" },
      { tytul: "Ombre klasyczne", opis: "Linia przejścia, rozmycie.", dlugosc: "45 min", rozdzial: "Ombre" },
      { tytul: "Ombre odwrócone i sombre", opis: "Różnice, kiedy co stosować.", dlugosc: "40 min", rozdzial: "Ombre" },
      { tytul: "Kolory pastelowe – przygotowanie bazy", opis: "Rozjaśnianie do 10, tonowanie.", dlugosc: "50 min", rozdzial: "Kreatywna" },
      { tytul: "Róż, fiolet, błękit – receptury", opis: "Mieszanie, utrwalanie, pielęgnacja.", dlugosc: "45 min", rozdzial: "Kreatywna" },
      { tytul: "Ciemne włosy – rozjaśnianie bez pasemek", opis: "Wieloetapowe rozjaśnianie.", dlugosc: "55 min", rozdzial: "Trudne przypadki" },
      { tytul: "Korekta po nieudanej koloryzacji", opis: "Analiza, plan, wykonanie.", dlugosc: "50 min", rozdzial: "Trudne przypadki" },
      { tytul: "Pielęgnacja i sprzedaż", opis: "Odżywki, maski, upsell.", dlugosc: "30 min", rozdzial: "Biznes" },
      { tytul: "Podsumowanie i certyfikat", opis: "Pytania, wręczenie certyfikatów.", dlugosc: "25 min", rozdzial: "Zakończenie" },
    ],
  },
  {
    nazwa: "Fryzjerstwo męskie – kurs kompaktowy weekendowy",
    cena: 2499,
    krotkiOpis: "Najwyższa półka: od zera do samodzielnego strzyżenia w 3 dni.",
    opis: `Intensywny kurs dla osób bez doświadczenia, które chcą w jeden długi weekend (piątek–niedziela) opanować pełne strzyżenie męskie: maszynka, nożyczki, brzytwa. Program obejmuje teorię, demonstracje i wiele godzin praktyki na modelach. Po kursie uczestnik potrafi wykonać klasyczne strzyżenie męskie oraz podstawowy fade. W cenie: wszystkie materiały, pełne wyżywienie, nocleg (2 noce), certyfikat, 3-miesięczny dostęp do nagrań i grupy wsparcia. Maksymalnie 6 osób.`,
    czasTrwania: "32h (3 dni)",
    poziom: "początkujący",
    liczbaLekcji: 14,
    gwarancjaDni: 90,
    dozywotniDostep: false,
    materialyDoPobrania: true,
    certyfikat: true,
    jezyk: "polski",
    wymagania: [
      "Ukończone 18 lat",
      "Brak wymaganego doświadczenia – kurs od zera",
      "Chęć intensywnej pracy przez 3 dni",
    ],
    czegoSieNauczysz: [
      "Praca maszynką (ustawienia, kierunki, sekwencje)",
      "Strzyżenie nożyczkami – podstawy",
      "Łączenie maszynki z nożyczkami",
      "Klasyczne strzyżenie męskie od A do Z",
      "Podstawowy fade (degradacja)",
      "Strzyżenie brzytwą na mokro – wprowadzenie",
      "Stylizacja i finisz",
      "Higiena i dezynfekcja narzędzi",
    ],
    zawartoscKursu: [
      "14 lekcji wideo (nagrania z kursu)",
      "Skrypt PDF (60 stron)",
      "Karta technik na ścianę",
      "3 miesiące dostępu do grupy i nagrań",
      "Certyfikat ukończenia",
      "Materiały i narzędzia w cenie",
    ],
    lekcje: [
      { tytul: "Dzień 1: Narzędzia i bezpieczeństwo", opis: "Maszynki, nożyczki, brzytwa, dezynfekcja.", dlugosc: "45 min", rozdzial: "Dzień 1" },
      { tytul: "Dzień 1: Maszynka – ustawienia i chwyt", opis: "Ćwiczenia na główce treningowej.", dlugosc: "60 min", rozdzial: "Dzień 1" },
      { tytul: "Dzień 1: Pierwsze strzyżenie na modelu", opis: "Proste strzyżenie maszynką na jednej długości.", dlugosc: "90 min", rozdzial: "Dzień 1" },
      { tytul: "Dzień 2: Nożyczki – podstawy", opis: "Chwyt, cięcie, łączenie z maszynką.", dlugosc: "50 min", rozdzial: "Dzień 2" },
      { tytul: "Dzień 2: Klasyczne strzyżenie męskie", opis: "Pełna procedura: boki, tył, góra, skronie.", dlugosc: "120 min", rozdzial: "Dzień 2" },
      { tytul: "Dzień 2: Fade – wprowadzenie", opis: "Degradacja od 0 do 2, przejścia.", dlugosc: "75 min", rozdzial: "Dzień 2" },
      { tytul: "Dzień 3: Brzytwa na mokro", opis: "Bezpieczeństwo, technika, ćwiczenia.", dlugosc: "55 min", rozdzial: "Dzień 3" },
      { tytul: "Dzień 3: Pełne strzyżenie z brzytwą", opis: "Łączenie maszynki, nożyczek i brzytwy.", dlugosc: "100 min", rozdzial: "Dzień 3" },
      { tytul: "Dzień 3: Stylizacja i finisz", opis: "Żele, woski, suszenie.", dlugosc: "40 min", rozdzial: "Dzień 3" },
      { tytul: "Dzień 3: Egzamin praktyczny i certyfikat", opis: "Samodzielne strzyżenie, ocena, certyfikat.", dlugosc: "90 min", rozdzial: "Zakończenie" },
    ],
  },
];

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
    throw new Error("Login failed. Ustaw email/hasło w skrypcie. " + (await loginRes.text()));
  }
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const cookie = setCookie
    .split(",")
    .map((c) => c.split(";")[0].trim())
    .join("; ");
  const headers = { "Content-Type": "application/json", Cookie: cookie };

  const gr = await fetch(BASE + "/admin/api/v1/firmy", { headers });
  const fr = await gr.json();
  const firmy = fr.firmy || [];
  const gcat = await fetch(BASE + "/admin/api/v1/category", { headers });
  const catData = await gcat.json();
  const allCats = typeof catData.categories === "string" ? JSON.parse(catData.categories) : catData.categories || [];
  const courseCats = allCats.filter((c) => c.type === "course");

  if (!firmy.length || !courseCats.length) {
    throw new Error("Brak firm lub kategorii. Uruchom najpierw seed-courses-instructors.mjs.");
  }

  const firmId = firmy[0]._id;
  const categoryIds = courseCats.slice(0, 5).map((c) => c._id);
  const instructorNames = ["Mieszko Kopernik", "Bolesław Curie", "Kazimierz Wałęsa", "Anna Skłodowska", "Stefan Banach"];

  for (let i = 0; i < VARIED_COURSES.length; i++) {
    const c = VARIED_COURSES[i];
    const slugStr = slug(c.nazwa) + "-varied-" + (i + 1);
    const payload = {
      slug: slugStr,
      nazwa: c.nazwa,
      cena: c.cena,
      prowizja: 15,
      prowizja_typ: "procent",
      prowizja_vat: "netto",
      kategoria: [categoryIds[i % categoryIds.length]],
      lekcje: c.lekcje.map((l) => ({
        tytul: l.tytul,
        opis: l.opis,
        dlugosc: l.dlugosc,
        rozdzial: l.rozdzial || undefined,
        video: l.video || undefined,
        plik: l.plik || undefined,
      })),
      firma: null,
      media: [media("Główne zdjęcie – " + c.nazwa.slice(0, 30)), media("Galeria varied " + (i + 1))],
      promocje: null,
      opis: c.opis,
      ocena: 0,
      opinie: null,
      vat: 23,
      sku: null,
      liczbaZapisanych: 0,
      czegoSieNauczysz: c.czegoSieNauczysz,
      gwarancjaDni: c.gwarancjaDni,
      zawartoscKursu: c.zawartoscKursu,
      wymagania: c.wymagania,
      dozywotniDostep: c.dozywotniDostep,
      materialyDoPobrania: c.materialyDoPobrania,
      aktywne: true,
      czasTrwania: c.czasTrwania,
      poziom: c.poziom,
      liczbaLekcji: c.liczbaLekcji,
      instruktor: instructorNames[i % instructorNames.length],
      jezyk: c.jezyk,
      certyfikat: c.certyfikat,
      krotkiOpis: c.krotkiOpis,
    };

    const r = await fetch(BASE + "/admin/api/v1/courses", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    console.log((i + 1) + ". " + c.nazwa.slice(0, 50) + "...", r.status, d.error || "OK");
  }

  console.log("\nGotowe: dodano 5 kursów z dużą różnorodnością (lekcje, opisy, ceny, wymagania, czegoSieNauczysz, zawartoscKursu).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
