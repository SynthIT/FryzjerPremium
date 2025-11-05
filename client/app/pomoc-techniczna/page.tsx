import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Pomoc Techniczna - Fryzjerpremium.pl",
  description: "Skontaktuj się z naszym zespołem pomocy technicznej",
};

export default function TechnicalSupportPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Pomoc Techniczna</h1>
          <div className="page-text">
            <p>
              Nasz zespół pomocy technicznej jest dostępny, aby pomóc Ci w rozwiązaniu wszelkich problemów 
              związanych z naszymi produktami i usługami.
            </p>
            <h2>Kontakt</h2>
            <p>
              <strong>Email:</strong> pomoc@fryzjerpremium.pl<br />
              <strong>Telefon:</strong> +48 123 456 789<br />
              <strong>Godziny pracy:</strong> Poniedziałek - Piątek, 9:00 - 17:00
            </p>
            <h2>Często zadawane pytania</h2>
            <p>
              Jeśli masz pytania dotyczące produktów, zamówień lub płatności, sprawdź naszą sekcję FAQ 
              lub skontaktuj się z nami bezpośrednio.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

