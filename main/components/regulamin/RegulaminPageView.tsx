import MarketingArticleShell from "@/components/site/MarketingArticleShell";
import { marketingPageTextWithLists } from "@/components/site/marketingPageClasses";
import Link from "next/link";

/**
 * Regulamin sklepu — treść zsynchronizowana z działaniem aplikacji
 * (Stripe, Apaczka, produkty fizyczne vs kursy, konto/gość, dokumenty po płatności).
 * Dane sprzedawcy jak na stronie Kontakt (do uzupełnienia o rzeczywiste NIP/adres przed produkcją).
 */
export default function RegulaminPageView() {
    return (
        <MarketingArticleShell title="Regulamin" bodyClassName={marketingPageTextWithLists}>
            <p className="text-sm text-gray-500">
                Obowiązuje od: 19 lipca 2026 r. · Sklep internetowy fryzjerpremium.pl
            </p>

            <h2>1. Postanowienia ogólne</h2>
            <p>
                Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego prowadzonego pod
                adresem <strong>fryzjerpremium.pl</strong> (dalej: „Sklep”), warunki zawierania umów
                sprzedaży produktów oraz umów dotyczących kursów i szkoleń, a także zasady dostawy,
                płatności, odstąpienia od umowy i reklamacji.
            </p>
            <p>
                Właścicielem Sklepu i Sprzedawcą jest:
                <br />
                <strong>Antoine Hair Institute Sp. z o.o.</strong>
                <br />
                ul. Fryzjerska 12/4, 00-001 Warszawa
                <br />
                NIP: 525-000-00-00 · KRS: 0000123456
                <br />
                e-mail:{" "}
                <a href="mailto:kontakt@antoine-hair.example">kontakt@antoine-hair.example</a>
                <br />
                telefon: <a href="tel:+48501234567">+48 501 234 567</a> (Pn–Pt, 9:00–17:00)
            </p>
            <p>
                Sklep prowadzi sprzedaż na rzecz konsumentów oraz przedsiębiorców. W sprawach nieuregulowanych
                Regulaminem stosuje się przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz
                ustawy o prawach konsumenta.
            </p>

            <h2>2. Definicje</h2>
            <ul>
                <li>
                    <strong>Klient</strong> — osoba fizyczna, prawna lub jednostka organizacyjna składająca
                    zamówienie w Sklepie (z kontem lub jako gość).
                </li>
                <li>
                    <strong>Konsument</strong> — Klient będący osobą fizyczną zawierającą umowę niezwiązaną
                    bezpośrednio z jej działalnością gospodarczą lub zawodową.
                </li>
                <li>
                    <strong>Produkt</strong> — rzecz ruchoma (towar fizyczny) oferowana w Sklepie, wymagająca
                    wysyłki kurierskiej.
                </li>
                <li>
                    <strong>Kurs</strong> — usługa szkoleniowa lub dostęp do materiałów szkoleniowych
                    (w tym wydarzenia stacjonarne lub materiały online), oferowana w Sklepie; nie wymaga
                    wysyłki paczki.
                </li>
                <li>
                    <strong>Zamówienie</strong> — oświadczenie woli Klienta złożone za pośrednictwem Sklepu,
                    zmierzające do zawarcia umowy ze Sprzedawcą.
                </li>
                <li>
                    <strong>Koszyk</strong> — narzędzie Sklepu umożliwiające wybór Produktów i Kursów przed
                    przejściem do płatności; Klient może zaznaczyć wybrane pozycje do realizacji.
                </li>
            </ul>

            <h2>3. Asortyment — Produkty i Kursy</h2>
            <h3>3.1. Produkty</h3>
            <p>
                Produkty to towary fizyczne (m.in. kosmetyki, akcesoria, sprzęt). Informacje o Produkcie
                (opis, cena, dostępność, warianty, czas wysyłki w dniach roboczych, wymiary i waga paczki)
                prezentowane są na karcie produktu. Realizacja zamówienia Produktu obejmuje dostawę
                kurierską (pkt 7).
            </p>
            <h3>3.2. Kursy</h3>
            <p>
                Kursy obejmują szkolenia i materiały edukacyjne. W zależności od oferty Kurs może
                obejmować dostęp do lekcji / plików, udział w wydarzeniu (data, godzina, adres) oraz
                wystawienie biletu elektronicznego (PDF) po opłaceniu zamówienia. Zamówienie zawierające{" "}
                <strong>wyłącznie Kursy</strong> nie wymaga wyboru dostawy ani opłaty za przesyłkę —
                po płatności Klient otrzymuje dostęp lub bilet zgodnie z opisem Kursu.
            </p>
            <h3>3.3. Zamówienia mieszane</h3>
            <p>
                W jednym zamówieniu mogą znaleźć się zarówno Produkty, jak i Kursy. Wówczas dostawa i
                koszty przesyłki dotyczą wyłącznie części produktowej; Kursy realizowane są niezależnie
                (dostęp / bilet).
            </p>

            <h2>4. Konto Klienta i zakupy jako gość</h2>
            <p>
                Zamówienie można złożyć po zalogowaniu do konta albo jako gość — po podaniu adresu e-mail,
                na który zostaną przekazane informacje o zamówieniu. Jeżeli podany e-mail należy już do
                zarejestrowanego użytkownika, Sklep może wymagać logowania.
            </p>
            <p>
                Klient zobowiązuje się podawać dane prawdziwe i aktualne, w szczególności dane do dostawy
                (przy Produktach) oraz dane kontaktowe. Konto firmowe może podlegać weryfikacji danych
                przedsiębiorstwa (m.in. NIP) przed wystawianiem dokumentów na firmę.
            </p>

            <h2>5. Składanie zamówienia i zawarcie umowy</h2>
            <ol>
                <li>Klient dodaje Produkty i/lub Kursy do Koszyka i przechodzi do kasy.</li>
                <li>
                    Przy zamówieniu zawierającym Produkty Klient wybiera sposób dostawy i — w razie
                    potrzeby — punkt odbioru, oraz uzupełnia dane adresowe i kontaktowe.
                </li>
                <li>
                    Klient wybiera metodę płatności i potwierdza zamówienie poprzez uruchomienie płatności
                    w bramce płatniczej.
                </li>
                <li>
                    Umowa zostaje zawarta z chwilą skutecznego obciążenia Klienta (potwierdzenia płatności
                    przez operatora płatności). Do tego momentu zamówienie może pozostawać w statusie
                    koszyka / oczekiwania na płatność.
                </li>
                <li>
                    Po potwierdzeniu płatności zamówienie przechodzi do realizacji (status „w realizacji”).
                    Stany magazynowe Produktów są pomniejszane po udanej płatności.
                </li>
            </ol>
            <p>
                Składając zamówienie, Klient oświadcza, że zapoznał się z niniejszym Regulaminem oraz
                informacjami o wybranych Produktach i Kursach.
            </p>

            <h2>6. Ceny i płatności</h2>
            <h3>6.1. Ceny</h3>
            <p>
                Ceny w Sklepie podawane są w złotych polskich (PLN) i zawierają podatek VAT (stawka
                wskazana przy ofercie; domyślnie 23%, o ile nie wskazano inaczej). Koszt dostawy — jeśli
                dotyczy — jest doliczany do sumy zamówienia na etapie kasy i wynika z wyceny przewoźnika.
            </p>
            <h3>6.2. Operator płatności</h3>
            <p>
                Płatności obsługuje <strong>Stripe Payments Europe, Limited</strong> (oraz powiązane
                podmioty Stripe) — bramka płatnicza zintegrowana ze Sklepem. Sprzedawca nie przechowuje
                pełnych danych kart płatniczych Klienta.
            </p>
            <h3>6.3. Metody płatności</h3>
            <p>W zależności od dostępności w bramce Stripe Klient może zapłacić m.in.:</p>
            <ul>
                <li>kartą płatniczą,</li>
                <li>BLIK,</li>
                <li>Klarna (płatność odroczona / ratalna — według warunków Klarna),</li>
                <li>Stripe Link.</li>
            </ul>
            <p>
                Aktualna lista metod widoczna jest w formularzu płatności przy finalizacji zamówienia.
                Płatność jest pobierana w momencie potwierdzenia transakcji u operatora.
            </p>
            <h3>6.4. Nieudana płatność</h3>
            <p>
                W przypadku niepowodzenia płatności zamówienie nie przechodzi do realizacji. Klient może
                ponowić próbę płatności albo złożyć nowe zamówienie.
            </p>
            <h3>6.5. Dokumenty sprzedaży</h3>
            <p>
                Po udanej płatności Sklep generuje potwierdzenie zamówienia (dokument PDF) oraz nadaje
                numer faktury w formacie <strong>FV/&#123;numer zamówienia&#125;</strong>. Pliki zamówienia
                (potwierdzenie, a w przypadku Kursów także bilet) są dostępne w szczegółach zamówienia w
                Sklepie. Szczegóły przetwarzania danych płatniczych i kontaktowych reguluje{" "}
                <Link href="/polityka-prywatnosci">Polityka prywatności</Link>.
            </p>

            <h2>7. Dostawa Produktów</h2>
            <h3>7.1. Operator logistyczny</h3>
            <p>
                Wysyłka Produktów realizowana jest za pośrednictwem platformy{" "}
                <strong>Apaczka.pl</strong>, która pośredniczy w nadaniu przesyłek do przewoźników
                kurierskich (m.in. InPost, DPD, Poczta Polska / Pocztex, Orlen Paczka — według aktualnej
                oferty dostępnej w kasie).
            </p>
            <h3>7.2. Sposoby dostawy</h3>
            <ul>
                <li>
                    <strong>Kurier do drzwi</strong> — doręczenie pod adres wskazany przez Klienta.
                </li>
                <li>
                    <strong>Punkt odbioru</strong> — doręczenie do wybranego punktu (np. paczkomat, punkt
                    partnerski) zgodnego z wybraną usługą przewoźnika.
                </li>
            </ul>
            <h3>7.3. Koszt i wycena</h3>
            <p>
                Koszt dostawy ustalany jest indywidualnie dla zamówienia na podstawie wyceny Apaczka
                (m.in. wymiary i waga Produktów, usługa przewoźnika, adres / punkt). Kwota jest
                prezentowana w kasie przed płatnością i wchodzi w całkowitą sumę zamówienia.
            </p>
            <h3>7.4. Czas realizacji i wysyłki</h3>
            <p>
                Orientacyjny czas przygotowania wysyłki wynika z informacji „czas wysyłki” na karcie
                Produktu (liczba dni). Czas doręczenia zależy od wybranej usługi przewoźnika i jest
                podawany przy wyborze metody dostawy. Terminy mają charakter informacyjny i mogą ulec
                zmianie z przyczyn niezależnych od Sprzedawcy (np. siła wyższa, ograniczenia przewoźnika).
            </p>
            <h3>7.5. Nadanie i śledzenie</h3>
            <p>
                Po potwierdzeniu płatności zamówienie zawierające Produkty jest automatycznie przekazywane
                do nadania w systemie Apaczka (o ile wybrano dostawę). W szczegółach zamówienia Klient
                może uzyskać link do śledzenia przesyłki udostępniony przez Apaczka / przewoźnika. Link
                śledzenia jest przechowywany przy zamówieniu — nie wymaga ponownego odpytywania API przy
                każdym otwarciu strony.
            </p>
            <h3>7.6. Brak dostawy dla samych Kursów</h3>
            <p>
                Zamówienia obejmujące wyłącznie Kursy nie podlegają wysyłce paczki i nie generują kosztów
                dostawy.
            </p>

            <h2>8. Realizacja Kursów</h2>
            <p>
                Po opłaceniu zamówienia zawierającego Kurs Sklep wystawia bilet lub potwierdzenie udziału /
                dostępu (plik PDF, w tym z kodem QR — jeśli dotyczy). Szczegóły Kursu (termin, miejsce,
                zakres materiałów, ewentualna gwarancja satysfakcji w dniach wskazanych przy ofercie)
                wynikają z karty Kursu. Dożywotni dostęp, materiały do pobrania lub certyfikat — jeśli są
                oferowane — są opisane przy danym Kursie.
            </p>

            <h2>9. Prawo odstąpienia od umowy (zwroty)</h2>
            <h3>9.1. Produkty — Konsument</h3>
            <p>
                Konsument ma prawo odstąpić od umowy sprzedaży Produktu w terminie{" "}
                <strong>14 dni</strong> od objęcia rzeczy w posiadanie, bez podania przyczyny, z
                zastrzeżeniem wyjątków przewidzianych w ustawie o prawach konsumenta (m.in. rzeczy
                nieprefabrykowane wg specyfikacji konsumenta, rzeczy ulegające szybkiemu zepsuciu,
                zapieczętowane towary, które po otwarciu nie nadają się do zwrotu ze względu na ochronę
                zdrowia lub higienę — jeśli dotyczy oferty).
            </p>
            <p>
                Zwrot Produktu należy zgłosić poprzez funkcję zwrotu w szczegółach zamówienia w Sklepie
                („Szybki zwrot”) albo kontaktując się ze Sprzedawcą (e-mail / telefon). Konsument ponosi
                bezpośrednie koszty zwrotu rzeczy, chyba że Sprzedawca zgodzi się je pokryć lub nie
                poinformował o tym obowiązku.
            </p>
            <h3>9.2. Kursy i usługi cyfrowe / wydarzenia</h3>
            <p>
                Prawo odstąpienia od umowy o świadczenie usługi może być ograniczone, gdy za wyraźną zgodą
                Konsumenta wykonanie rozpoczęło się przed upływem terminu na odstąpienie, a Konsument został
                poinformowany o utracie prawa odstąpienia. W przypadku Kursów z gwarancją zwrotu pieniędzy
                wskazaną na karcie Kursu (liczba dni), Sprzedawca honoruje warunki tej gwarancji niezależnie
                od ustawowego prawa odstąpienia — w zakresie opisanym przy ofercie. Zwrot usługi można
                zgłosić przyciskiem „Zwróć usługę” w szczegółach zamówienia lub mailem.
            </p>
            <h3>9.3. Zwrot środków</h3>
            <p>
                W razie skutecznego odstąpienia Sprzedawca zwraca płatność przy użyciu takiego samego
                sposobu zapłaty, jakiego użył Klient (za pośrednictwem operatora Stripe), niezwłocznie, nie
                później niż w terminie 14 dni od otrzymania oświadczenia o odstąpieniu — z możliwością
                wstrzymania zwrotu do chwili otrzymania rzeczy lub dowodu jej odesłania (przy Produktach).
            </p>

            <h2>10. Reklamacje</h2>
            <p>
                Reklamacje dotyczące Produktów (wady fizyczne, niezgodność z umową) oraz Kursów (np. brak
                dostępu, błąd biletu) można składać:
            </p>
            <ul>
                <li>poprzez funkcję „Zgłoś reklamację” w szczegółach zamówienia,</li>
                <li>
                    e-mailem na adres{" "}
                    <a href="mailto:kontakt@antoine-hair.example">kontakt@antoine-hair.example</a>,
                </li>
                <li>
                    telefonicznie: <a href="tel:+48501234567">+48 501 234 567</a>.
                </li>
            </ul>
            <p>
                Reklamacja powinna zawierać: numer zamówienia, opis problemu oraz dane kontaktowe.
                Sprzedawca rozpatruje reklamację w terminie 14 dni od jej otrzymania i informuje Klienta o
                wyniku.
            </p>

            <h2>11. Odpowiedzialność i dostępność Sklepu</h2>
            <p>
                Sprzedawca dokłada starań, by Sklep działał ciągle, jednak nie gwarantuje nieprzerwanej
                dostępności (prace serwisowe, awarie łączy, działania osób trzecich — w tym Stripe i
                Apaczka). Zdjęcia i opisy mają charakter informacyjny; w razie oczywistej omyłki
                (np. cena) Sprzedawca może skontaktować się z Klientem w celu potwierdzenia lub anulowania
                zamówienia.
            </p>

            <h2>12. Dane osobowe</h2>
            <p>
                Administratorem danych osobowych Klientów jest Sprzedawca. Zasady przetwarzania danych,
                cele, podstawy prawne oraz prawa Klienta opisuje{" "}
                <Link href="/polityka-prywatnosci">Polityka prywatności</Link>. Dane niezbędne do realizacji
                umowy (w tym dane dostawy i płatności) przekazywane są podmiotom przetwarzającym w imieniu
                Sprzedawcy (m.in. Stripe, Apaczka / przewoźnicy) w zakresie wymaganym do wykonania umowy.
            </p>

            <h2>13. Postanowienia końcowe</h2>
            <ol>
                <li>
                    Sprzedawca może zmieniać Regulamin z ważnych przyczyn (zmiana prawa, zmiana sposobu
                    świadczenia usług, rozwój Sklepu). O istotnych zmianach Klient zostanie poinformowany
                    poprzez publikację nowej wersji na stronie{" "}
                    <Link href="/regulamin">/regulamin</Link>. Do zamówień złożonych przed zmianą stosuje
                    się Regulamin obowiązujący w chwili złożenia zamówienia.
                </li>
                <li>
                    Spory z Konsumentami mogą być rozwiązywane m.in. za pośrednictwem platformy ODR UE
                    (https://ec.europa.eu/consumers/odr) oraz poprzez mediację / sąd polubowny — bez
                    uszczerbku dla prawa do sądu powszechnego.
                </li>
                <li>
                    W sprawach nieuregulowanych zastosowanie mają przepisy prawa polskiego. Sądem
                    właściwym dla sporów z przedsiębiorcami jest sąd właściwy dla siedziby Sprzedawcy.
                </li>
                <li>
                    Aktualne informacje uzupełniające:{" "}
                    <Link href="/wysylka-i-dostawa">Wysyłka i dostawa</Link>,{" "}
                    <Link href="/platnosci">Płatności</Link>,{" "}
                    <Link href="/kontakt">Kontakt</Link>.
                </li>
            </ol>
        </MarketingArticleShell>
    );
}
