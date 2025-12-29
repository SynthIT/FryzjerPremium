import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Wysyłka i dostawa - Fryzjerpremium.pl",
  description: "Informacje o wysyłce i dostawie produktów",
};

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Wysyłka i dostawa</h1>
          <div className="page-text">
            <h2>Koszty dostawy</h2>
            <p>
              Oferujemy różne opcje dostawy dostosowane do Twoich potrzeb. Koszty dostawy są obliczane 
              automatycznie podczas składania zamówienia.
            </p>
            <h2>Czas realizacji</h2>
            <p>
              <strong>Wysyłka standardowa:</strong> 3-5 dni roboczych<br />
              <strong>Wysyłka ekspresowa:</strong> 1-2 dni robocze<br />
              <strong>Odbiór osobisty:</strong> Dostępny w naszym salonie (wcześniejsze umówienie)
            </p>
            <h2>Śledzenie przesyłki</h2>
            <p>
              Po wysłaniu zamówienia otrzymasz numer przesyłki, który pozwoli Ci śledzić status dostawy 
              w czasie rzeczywistym.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

