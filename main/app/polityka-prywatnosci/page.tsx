import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Polityka prywatności - Fryzjerpremium.pl",
  description: "Polityka prywatności i ochrony danych osobowych",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Polityka prywatności</h1>
          <div className="page-text">
            <h2>1. Administratorem danych osobowych</h2>
            <p>
              Administratorem danych osobowych jest Antoine Hair Institute z siedzibą w Polsce. 
              Wszelkie dane osobowe przetwarzane są zgodnie z obowiązującymi przepisami prawa, 
              w szczególności z Rozporządzeniem RODO.
            </p>
            <h2>2. Zakres przetwarzanych danych</h2>
            <p>
              Przetwarzamy następujące dane osobowe: imię i nazwisko, adres e-mail, numer telefonu, 
              adres dostawy, dane dotyczące płatności.
            </p>
            <h2>3. Cel przetwarzania danych</h2>
            <p>
              Dane osobowe są przetwarzane w celu realizacji zamówień, obsługi klienta, marketingu 
              (za zgodą) oraz wypełnienia obowiązków prawnych.
            </p>
            <h2>4. Prawa użytkownika</h2>
            <p>
              Użytkownik ma prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia 
              przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec przetwarzania.
            </p>
            <h2>5. Kontakt</h2>
            <p>
              W sprawach dotyczących ochrony danych osobowych można kontaktować się z nami pod adresem: 
              privacy@fryzjerpremium.pl
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

