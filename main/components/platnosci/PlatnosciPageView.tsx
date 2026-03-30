import MarketingArticleShell from "@/components/site/MarketingArticleShell";
import { marketingPageTextWithLists } from "@/components/site/marketingPageClasses";

export default function PlatnosciPageView() {
    return (
        <MarketingArticleShell title="Płatności" bodyClassName={marketingPageTextWithLists}>
            <h2>Akceptowane metody płatności</h2>
            <p>Akceptujemy następujące metody płatności:</p>
            <ul>
                <li>
                    <strong>Karty płatnicze:</strong> Visa, Mastercard
                </li>
                <li>
                    <strong>Płatności online:</strong> PayPal, Przelewy24
                </li>
                <li>
                    <strong>Przelew bankowy:</strong> Tradycyjny przelew bankowy
                </li>
                <li>
                    <strong>Płatności mobilne:</strong> Apple Pay, Google Pay
                </li>
            </ul>
            <h2>Bezpieczeństwo płatności</h2>
            <p>
                Wszystkie transakcje są chronione zaawansowanymi systemami szyfrowania SSL, zapewniając
                bezpieczeństwo Twoich danych finansowych.
            </p>
            <h2>Faktury</h2>
            <p>
                Po złożeniu zamówienia automatycznie otrzymasz fakturę VAT na adres e-mail podany podczas
                rejestracji.
            </p>
        </MarketingArticleShell>
    );
}
