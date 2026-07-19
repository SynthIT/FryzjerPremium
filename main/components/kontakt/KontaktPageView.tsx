import MarketingArticleShell from "@/components/site/MarketingArticleShell";

export default function KontaktPageView() {
    return (
        <MarketingArticleShell title="Kontakt">
            <p>
                Masz pytanie o produkty, szkolenia lub zamówienie? Napisz lub zadzwoń — odpowiadamy
                w dni robocze.
            </p>
            <h2>Dane kontaktowe</h2>
            <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:kontakt@antoine-hair.example">kontakt@antoine-hair.example</a>
                <br />
                <strong>Telefon:</strong>{" "}
                <a href="tel:+48501234567">+48 501 234 567</a>
                <br />
                <strong>Godziny:</strong> Poniedziałek–Piątek, 9:00–17:00
            </p>
            <h2>Adres</h2>
            <p>
                Antoine Hair Institute Sp. z o.o.
                <br />
                ul. Fryzjerska 12/4
                <br />
                00-001 Warszawa
            </p>
            <h2>NIP / KRS</h2>
            <p>
                NIP: 525-000-00-00
                <br />
                KRS: 0000123456
            </p>
        </MarketingArticleShell>
    );
}
