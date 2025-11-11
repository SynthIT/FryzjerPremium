import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog - Fryzjerpremium.pl",
  description: "Najnowsze artykuły i porady z branży fryzjerskiej",
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Blog</h1>
          <div className="page-text">
            <p>
              Zapraszamy do naszego bloga, gdzie znajdziesz najnowsze trendy w branży fryzjerskiej, 
              porady ekspertów oraz inspiracje do stworzenia wyjątkowych fryzur.
            </p>
            <h2>Najnowsze artykuły</h2>
            <p>
              Wkrótce opublikujemy pierwsze artykuły dotyczące najnowszych trendów, technik koloryzacji, 
              pielęgnacji włosów oraz porad biznesowych dla salonów fryzjerskich.
            </p>
            <h2>Subskrypcja</h2>
            <p>
              Zapisz się do naszego newslettera, aby otrzymywać powiadomienia o nowych artykułach 
              i ekskluzywnych treściach.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

