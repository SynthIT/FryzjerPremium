# Analiza: admin kursów vs strona publiczna kursu oraz lista zadań

## 1. Strona publiczna kursu: `main/app/courses/[slug]/page.tsx`

- **Ścieżka:** `main/app/courses/[slug]/page.tsx`
- **Rola:** Serwerowy wrapper – przekazuje `slug` z dynamicznej trasy do komponentu `CoursePage`.
- **Dane:** Kurs pobierany w `CoursePage` przez `getCourses(slug)` z `/api/v1/courses?slug=...`. Odpowiedź to `data.course` (pojedynczy kurs), w komponencie parsowane jako `JSON.parse(data)` – czyli backend prawdopodobnie zwraca zstringowany JSON kursu.

---

## 2. Komponent publiczny: `main/components/CoursePage.tsx`

Wyświetla pojedynczy kurs. Używa m.in.:

| Pole kursu (`Courses`)      | Użycie na stronie publicznej |
|----------------------------|------------------------------|
| `slug`                     | Identyfikacja, breadcrumbs |
| `nazwa`                    | Tytuł, breadcrumbs |
| `krotkiOpis`               | Subtitle pod tytułem (fallback: początek `opis`) |
| `opis`                     | Opis, „Czego się nauczysz”, „Opis szkolenia”, zakładka Przegląd |
| `ocena`                    | Gwiazdki, wyświetlana ocena |
| `opinie`                   | Liczba opinii, zakładka „Opinie” |
| `instruktor`               | Tekst „Instruktor: …” (string – imię/nazwisko lub nazwa) |
| `firma`                    | Obiekt z `nazwa` → „Firma: …”, w zakładce „O tym szkoleniu” |
| `media`                    | `media[0].path` jako główne zdjęcie, `media[0].alt` |
| `promocje`                 | `procent`, `special` – cena promocyjna, etykieta -X% |
| `cena`, `vat`              | Cena z `finalPrice()` |
| `aktywne`                  | Warunek dodawania do koszyka |
| `czasTrwania`              | Karta „Czas trwania”, „Ten kurs zawiera” |
| `liczbaLekcji`             | Karta „Lekcje”, „Ten kurs zawiera” |
| `poziom`                   | Karta „Poziom” (poczatkujacy / sredniozaawansowany / zaawansowany / wszystkie) |
| `jezyk`                    | Karta „Język” |
| `certyfikat`                | „Ten kurs zawiera: Certyfikat ukończenia” |

Na stronie publicznej **program szkolenia** (curriculum) i **„Czego się nauczysz”** są na razie zahardkodowane – nie korzystają z `course.lekcje` ani z żadnego pola typu „bullet points”. Żeby to było dynamiczne, w tworzeniu/edycji kursu w adminie muszą być:

- **Lekcje** (`lekcje[]`): `tytul`, `opis`, `dlugosc`, opcjonalnie `video`, `plik` – żeby zakładka „Program” mogła je wyświetlić.
- Ewentualnie osobne pole na punkty „Czego się nauczysz” (np. tablica stringów) – obecnie w CoursePage nie ma takiego pola w typie.

---

## 3. Lista stron admina – tworzenie i edycja

### 3.1 Lista kursów: `main/app/admin/courses/page.tsx`

- **Ścieżka:** `main/app/admin/courses/page.tsx`
- **API:** `GET /admin/api/v1/courses` → `{ status: 0, courses }`. W kodzie: `setCourses(JSON.parse(data.courses))` – czyli `data.courses` jest stringiem (np. JSON z cache), co jest kruche przy zwykłym obiekcie.
- **Edycja:** Kliknięcie w kartę otwiera `CourseEditModal` (ten sam widok co lista). Brak osobnej strony edycji pod adresem np. `/admin/courses/[slug]` lub `/admin/courses/[id]`.
- **Po zapisie/usuwięciu:** `handleCourseUpdate` / `handleCourseDelete` odświeżają listę przez ponowne `GET /admin/api/v1/courses` (bez przekazania zaktualizowanego obiektu z PUT/DELETE), co jest poprawne, ale parsowanie `data.courses` (string vs array) warto ujednolicić.

### 3.2 Tworzenie kursu: `main/app/admin/courses/new/page.tsx`

- **Ścieżka:** `main/app/admin/courses/new/page.tsx`
- **API:** Kategorie: `GET /admin/api/v1/category` → `a.categories` (string, parsowane `JSON.parse(a.categories)`). Firmy: `GET /admin/api/v1/firmy` → `b.firmy` (tablica). Zapis: `POST /admin/api/v1/courses` z body `JSON.stringify(courseData)`.

Problemy i braki:

1. **Krytyczny błąd:** W `handleSubmit` używana jest **niezdefiniowana zmienna `courseData`** (linia 256). W praktyce wysyłany jest `undefined`. Należy zbudować obiekt z:
   - `coursePayload` (w tym `nazwa`, `slug`, `cena`, `vat`, `opis`, `krotkiOpis`, `czasTrwania`, `poziom`, `liczbaLekcji`, `jezyk`, `certyfikat`, `aktywne`, `firma`, `instruktor`, `prowizja`, `prowizja_typ`, `prowizja_vat` itd.),
   - `kategoria`: z `selectedCategories` (obecnie zbierane z `selectedMainCategory` + `selectedSubCategories`, ale **nie są nigdzie wpisywane do `coursePayload.kategoria`** w spójny sposób – w checkboxie jest tylko `handleCoursePayloadChange("kategoria", [...coursePayload.kategoria, cat._id])` przy dodawaniu, bez synchronizacji z `selectedSubCategories`),
   - `lekcje`: z `coursePayload.lekcje` – obecnie sekcja „Szczegóły szkoleń” tylko rysuje nagłówki „Lekcja #N” i pusty „Tytuł lekcji”, **bez inputów** i bez `handleLessonPayloadChange` podpiętego do pól (tytuł, opis, długość, video, plik),
   - `media`: z `mediaData` (główne zdjęcie + galeria) – obecnie `mediaData` jest budowane, ale **nie ma uploadu** (path pozostaje `""`), a w media dla głównego zdjęcia jest błąd: **`nazwa` w linii 234 jest niezdefiniowane** – powinno być `coursePayload.nazwa` (lub np. `coursePayload.nazwa || mainImageFile.name`).

2. **Kategorie:** Logika wyboru podkategorii: `handleSubCategoryToggle` aktualizuje `selectedSubCategories`, ale w `onChange` checkboxa jest też `handleCoursePayloadChange("kategoria", [...coursePayload.kategoria, cat._id])` – przy odznaczeniu nie usuwa się z `kategoria`, a przy zaznaczeniu może duplikować. Powinna być jedna źródło prawdy: albo `coursePayload.kategoria` na podstawie `selectedSubCategories`, albo odwrotnie, i spójna aktualizacja przy zapisie.

3. **Firmy:** W `Promise.all` dla firmy używane jest `b.firmy` – API zwraca `{ status: 0, firmy }`, więc to jest poprawne. Opcja „inna” (instruktor nieskojarzony) jest obsługiwana w UI, ale przy walidacji `firmaData` wymagana jest wybrana firma z listy – dla „inna” trzeba albo zezwolić na brak `firmaData`, albo wysyłać specjalną wartość.

4. **Lekcje:** W `coursePayload` jest `liczbaLekcji` i pusta tablica `lekcje`. Sekcja „Szczegóły szkoleń” (linie 349–363) renderuje N bloków według `liczbaLekcji`, ale wewnątrz nie ma inputów dla `tytul`, `opis`, `dlugosc`, `video`, `plik` ani inicjalizacji `coursePayload.lekcje` do długości N. Trzeba: przy zmianie `liczbaLekcji` uzupełnić/obciąć `lekcje`, oraz w każdym bloku dodać pola powiązane z `handleLessonPayloadChange`.

5. **Nieużywane:** `calculateProwizja` jest zdefiniowane, ale nigdzie nieużywane. `User`/`userSchema` – używane przy `selectedFirm` (instruktorzy firmy).

---

## 4. Edycja kursu: `main/components/admin/CourseEditModal.tsx`

- **Używany w:** `main/app/admin/courses/page.tsx` po kliknięciu w kartę kursu.
- **API:** Kategorie: `GET /admin/api/v1/category` → `data.categories` (ustawiane jako `setCategories(data.categories)`). Firmy: `GET /admin/api/v1/firmy` → `if (Array.isArray(data)) setFirmy(data)` – **błąd:** API zwraca `{ status: 0, firmy }`, więc `Array.isArray(data)` to false i firmy nie są ładowane.
- **Zapis:** `PUT /admin/api/v1/courses` z `editedCourse` (pełny obiekt kursu).

Pola edytowane w modalu:

- Podstawowe: `nazwa`, `slug` (readonly), `cena`, `vat`, `ocena`, `sku`, `aktywne`, `opis`.
- Kategorie: główna + podkategorie (select + checkboxy).
- Firma: jeden select (po `firma.slug`).
- Media: lista z polami `path` i `alt`, przyciski dodaj/usuń.

**Czego brakuje w CourseEditModal względem strony publicznej i typu `Courses`:**

- **krotkiOpis** – subtitle na stronie kursu.
- **czasTrwania**, **liczbaLekcji**, **poziom**, **jezyk**, **certyfikat** – karty i „Ten kurs zawiera” na stronie.
- **instruktor** – wyświetlany obok firmy (string lub ref do użytkownika).
- **lekcje** – w modalu w ogóle nie ma sekcji lekcji; na stronie publicznej program jest na razie stały, ale typ ma `lekcje[]` z `tytul`, `opis`, `dlugosc`, `video`, `plik`.
- **prowizja**, **prowizja_typ**, **prowizja_vat** – opcjonalnie, jeśli admin ma je nadpisywać per kurs.
- **promocje** – na stronie używane do ceny i etykiety -X%; w modalu brak.

Dodatkowo w modalu:

- **Kategorie:** `setCategories(data.categories)` – jeśli API zwraca tablicę, to `categories` to tablica, a dalej używane jest `categories[selectedMainCategory]` i `categoriesSlug.map` z `makeSlugKeys(categories)`. `makeSlugKeys` w `utils_admin` oczekuje `Record<string, Categories[]>`, a `Object.keys()` na tablicy da indeksy "0","1",... – więc struktura kategorii w modalu jest niekompatybilna z API, które prawdopodobnie zwraca płaską tablicę. W new/page kategorie są grupowane po `cat.kategoria` do `uniqueCategories`. W modalu trzeba albo tak samo zbudować strukturę po `kategoria`, albo użyć tej samej konwencji co w new.
- **Firmy:** Poprawka: po `res.json()` ustawiać `setFirmy(data.firmy ?? [])`, nie `Array.isArray(data) && setFirmy(data)`.

---

## 5. Podsumowanie: co musi być w tworzeniu i edycji, żeby strona `courses/[slug]` miała pełne dane

Poniżej zestawienie pól kursu: które są używane na stronie publicznej, które są w typie `Courses`/`zodCourses`, oraz czy są w formularzu nowego kursu i w CourseEditModal.

| Pole            | Strona `/courses/[slug]`     | Typ `Courses` | new/page.tsx      | CourseEditModal   |
|-----------------|------------------------------|----------------|-------------------|-------------------|
| slug            | tak                          | tak           | auto z nazwy      | tak (readonly)    |
| nazwa           | tak                          | tak           | tak               | tak               |
| krotkiOpis      | tak (subtitle)                | tak           | tak               | **brak**          |
| opis            | tak                          | tak           | tak               | tak               |
| ocena           | tak                          | tak           | w payload, nie UI | tak               |
| opinie          | tak (liczba)                  | tak           | w payload         | brak (tylko odczyt) |
| instruktor      | tak (tekst)                   | tak           | tak (select/input) | **brak**          |
| firma           | tak (obiekt.nazwa)            | tak           | tak               | tak (select)      |
| media           | tak (obraz, promocja)         | tak           | pliki bez uploadu | tak (path/alt)    |
| promocje        | tak (cena, -X%)               | tak           | w payload         | **brak**          |
| cena, vat       | tak                          | tak           | tak               | tak               |
| aktywne         | tak                          | tak           | tak               | tak               |
| czasTrwania     | tak                          | tak           | tak               | **brak**          |
| liczbaLekcji    | tak                          | tak           | tak (liczba)      | **brak**          |
| poziom          | tak                          | tak           | tak               | **brak**          |
| jezyk           | tak                          | tak           | tak               | **brak**          |
| certyfikat      | tak                          | tak           | tak               | **brak**          |
| lekcje          | nie (program zahardkodowany)  | tak           | **brak (szkic)**  | **brak**          |
| prowizja*       | nie                          | tak           | tak (checkbox)    | **brak**          |
| sku             | nie                          | tak           | w payload         | tak               |

Wniosek: żeby strona `courses/[slug]` miała kompletne i spójne dane, w **tworzeniu** i **edycji** w adminie muszą być obsłużone wszystkie powyższe pola; obecnie w edycji (modal) brakuje m.in. krotkiOpis, czasTrwania, poziom, jezyk, certyfikat, instruktor, lekcje, promocje. Dodatkowo w **tworzeniu** trzeba naprawić wysyłkę (courseData), kategorie, lekcje (formularz + payload) i media (nazwa, ewentualnie upload).

---

## 6. Propozycja: edycja na osobnej stronie `[slug]/page.tsx`

- **Obecnie:** Lista w `main/app/admin/courses/page.tsx` + edycja w `CourseEditModal` (duży modal, scroll).
- **Propozycja:** Lista bez modala; klik w kurs prowadzi do **`main/app/admin/courses/[slug]/page.tsx`** (lub `[id]/page.tsx`). Na tej stronie:
  - GET kursu po slug (np. z listy lub osobny endpoint typu `GET /admin/api/v1/courses?slug=...` zwracający jeden kurs).
  - Formularz edycji z tymi samymi sekcjami co w new (podstawowe, szkolenia, opis, kategorie i firma, instruktor, prowizja, zdjęcia, lekcje, status), żeby nie duplikować logiki w modal vs new.
- **Efekty:** jeden spójny formularz do edycji, możliwość użycia tej samej struktury co w new (np. współdzielone komponenty), brak ograniczeń modala (wysokość, scroll). Lista tylko listuje i linkuje.

---

## 7. Konkretne zadania (checklist)

### Tworzenie: `main/app/admin/courses/new/page.tsx`

- [ ] Zdefiniować `courseData` w `handleSubmit`: połączyć `coursePayload`, wybrane kategorie (`selectedSubCategories` → obiekty z `categories`/`uniqueCategories`), firmę (id lub „inna”), instruktor, prowizję, **lekcje** (z `coursePayload.lekcje` po wypełnieniu w formularzu), **media** (np. `mediaData`; naprawić `nazwa` na `coursePayload.nazwa` lub odpowiednik).
- [ ] Synchronizacja kategorii: jedna źródło prawdy (np. `coursePayload.kategoria` pochodne od `selectedSubCategories`), przy zapisie przekazać do API wybrane kategorie. **bez bo do coursePayload wchodzi jedynie _id categorii**
- [ ] Sekcja lekcji: przy zmianie `liczbaLekcji` inicjalizować/aktualizować `coursePayload.lekcje` (np. puste `{ tytul, opis, dlugosc, video?, plik? }`). Dodać inputy w każdym bloku „Lekcja #N” i powiązać z `handleLessonPayloadChange`.
- [ ] Opcja „inna” przy firmie: w `handleSubmit` nie wymagać `firmaData` z listy firm gdy wybrano „inna”; w payloadzie przekazać odpowiednią wartość (np. null lub flag). *nie pamiętam jak to wyglada przy api, więc narazie olej*
- [ ] Poprawki wyglądowe (opcjonalnie): spójne sekcje, odstępy, etykiety, walidacja.

### Lista: `main/app/admin/courses/page.tsx`

- [ ] Ujednolicić parsowanie odpowiedzi GET: sprawdzić, czy `data.courses` to string (wtedy `JSON.parse`) czy już tablica; zabezpieczyć przed crash. *to zrobie potem w api*
- [ ] Zamiast otwierać modal: po kliknięciu w kartę przekierować na `/admin/courses/[slug]` (lub `[id]`). Usunąć `CourseEditModal`, `selectedCourse`, `isEditModalOpen`, `handleCourseUpdate`, `handleCourseDelete` z tej strony (obsługa usunięcia/zapisu na stronie edycji lub przez API i powrót do listy).

### Edycja: nowa strona `main/app/admin/courses/[slug]/page.tsx`

- [ ] Dodać dynamiczną trasę `[slug]`.
- [ ] Pobranie kursu: z listy (np. przez searchParams lub context) albo GET jeden kurs (endpoint lub filtrowanie po slug z listy).
- [ ] Formularz edycji: te same bloki co w new (podstawowe, czas/poziom/lekcje/język/certyfikat, opis, kategorie i firma, instruktor, prowizja, media, lekcje, status). Uzupełnić wszystkie pola z tabeli powyżej (krotkiOpis, czasTrwania, poziom, jezyk, certyfikat, instruktor, lekcje, promocje).
- [ ] Zapis: PUT do `/admin/api/v1/courses` z pełnym obiektem kursu; po sukcesie redirect na `/admin/courses`.
- [ ] Usunięcie: DELETE z przekierowaniem na listę.

### Modal (do usunięcia lub ograniczenia): `main/components/admin/CourseEditModal.tsx`

- [ ] Firmy: `setFirmy(data.firmy ?? [])` zamiast `Array.isArray(data) && setFirmy(data)`.
- [ ] Kategorie: dopasować strukturę do API (np. tak jak w new – tablica z API zredukowana do `Record<kategoria, Categories[]>`); poprawić `makeSlugKeys` / użycie `categoriesSlug` i `categories[selectedMainCategory]`.
- [ ] Jeśli edycja ma zostać w modalu (zamiast osobnej strony): dodać brakujące pola (krotkiOpis, czasTrwania, liczbaLekcji, poziom, jezyk, certyfikat, instruktor, lekcje, promocje, prowizja*).

---

Dokument ten można traktować jako specyfikację uzupełnień w tworzeniu i edycji kursów oraz jako uzasadnienie przeniesienia edycji na osobną stronę `[slug]`.
