import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Regulamin - Fryzjerpremium.pl",
  description: "Regulamin sklepu Fryzjerpremium.pl",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Regulamin</h1>
          <div className="page-text">
            <h2>1. Postanowienia ogólne</h2>
            <p>
              Niniejszy regulamin określa zasady korzystania ze sklepu internetowego Fryzjerpremium.pl 
              oraz warunki sprzedaży produktów.
            </p>
            <h2>2. Definicje</h2>
            <p>
              <strong>Sklep</strong> - sklep internetowy dostępny pod adresem fryzjerpremium.pl<br />
              <strong>Klient</strong> - osoba fizyczna, prawna lub jednostka organizacyjna korzystająca 
              ze Sklepu<br />
              <strong>Produkt</strong> - przedmiot oferowany w Sklepie
            </p>
            <h2>3. Zamówienia</h2>
            <p>
              Składając zamówienie, Klient akceptuje wszystkie warunki określone w niniejszym regulaminie 
              oraz potwierdza, że zapoznał się z informacjami o produkcie.
            </p>
            <h2>4. Płatności</h2>
            <p>
              Sklep akceptuje płatności przelewem bankowym, kartą płatniczą oraz inne metody płatności 
              wskazane podczas składania zamówienia.
            </p>
            <h2>5. Zwroty i reklamacje</h2>
            <p>
              Klient ma prawo do zwrotu zakupionego produktu w ciągu 14 dni od daty otrzymania, zgodnie 
              z przepisami prawa konsumenckiego.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

