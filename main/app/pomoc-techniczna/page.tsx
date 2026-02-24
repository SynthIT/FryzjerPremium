import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Pomoc Techniczna - Fryzjerpremium.pl",
  description: "Skontaktuj się z naszym zespołem pomocy technicznej",
};

const pageContainer =
  "max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative";
const pageContent =
  "max-w-[900px] mx-auto relative z-10 bg-white/60 backdrop-blur-[10px] p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/20";
const pageTitle =
  "text-[52px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-gradient-to-r after:from-[#D2B79B] after:via-[#b89a7f] after:to-[#D2B79B] after:rounded";
const pageText =
  "text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_h2]:relative [&_h2:hover]:translate-x-1 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-black [&_h3]:mt-10 [&_h3]:mb-4 [&_h3:hover]:text-[#D2B79B] [&_h3:hover]:translate-x-0.5 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a]:border-b [&_a:hover]:text-[#b89a7f]";

export default function TechnicalSupportPage() {
  return (
    <>
      <Header />
      <main className={pageContainer}>
        <div className={pageContent}>
          <h1 className={pageTitle}>Pomoc Techniczna</h1>
          <div className={pageText}>
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

