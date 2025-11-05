import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Zamówienia - Fryzjerpremium.pl",
  description: "Historia i zarządzanie zamówieniami",
};

export default function OrdersPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Moje zamówienia</h1>
          <div className="page-text">
            <p>
              W tej sekcji możesz przeglądać historię swoich zamówień, śledzić status dostawy 
              oraz zarządzać zwrotami.
            </p>
            <h2>Śledzenie zamówienia</h2>
            <p>
              Wprowadź numer zamówienia, aby sprawdzić aktualny status realizacji i dostawy.
            </p>
            <h2>Historia zamówień</h2>
            <p>
              Zaloguj się do swojego konta, aby zobaczyć pełną historię wszystkich złożonych zamówień 
              wraz z fakturami i dokumentami.
            </p>
            <h2>Zwroty</h2>
            <p>
              Możesz złożyć wniosek o zwrot produktu bezpośrednio z poziomu zamówienia. 
              Zwroty są realizowane w ciągu 14 dni od otrzymania produktu.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

