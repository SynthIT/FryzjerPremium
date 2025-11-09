import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Płatności - Fryzjerpremium.pl",
  description: "Informacje o metodach płatności",
};

export default function PaymentsPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Płatności</h1>
          <div className="page-text">
            <h2>Akceptowane metody płatności</h2>
            <p>
              Akceptujemy następujące metody płatności:
            </p>
            <ul>
              <li><strong>Karty płatnicze:</strong> Visa, Mastercard</li>
              <li><strong>Płatności online:</strong> PayPal, Przelewy24</li>
              <li><strong>Przelew bankowy:</strong> Tradycyjny przelew bankowy</li>
              <li><strong>Płatności mobilne:</strong> Apple Pay, Google Pay</li>
            </ul>
            <h2>Bezpieczeństwo płatności</h2>
            <p>
              Wszystkie transakcje są chronione zaawansowanymi systemami szyfrowania SSL, 
              zapewniając bezpieczeństwo Twoich danych finansowych.
            </p>
            <h2>Faktury</h2>
            <p>
              Po złożeniu zamówienia automatycznie otrzymasz fakturę VAT na adres e-mail 
              podany podczas rejestracji.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

