import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "O nas - Fryzjerpremium.pl",
  description: "Poznaj naszą historię i misję",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">O nas</h1>
          <div className="page-text">
            <p>
              Antoine Hair Institute to profesjonalna platforma dedykowana fryzjerom i salonom fryzjerskim. 
              Oferujemy szeroki wybór wysokiej jakości kosmetyków, sprzętu fryzjerskiego oraz profesjonalnych szkoleń.
            </p>
            <p>
              Nasza misja to wspieranie rozwoju branży fryzjerskiej poprzez dostarczanie najlepszych produktów 
              i narzędzi, które pomagają profesjonalistom osiągać doskonałe rezultaty.
            </p>
            <p>
              Współpracujemy z wiodącymi producentami z całego świata, aby zapewnić naszym klientom dostęp 
              do najnowszych trendów i technologii w branży beauty.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

