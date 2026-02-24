import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog - Fryzjerpremium.pl",
  description: "Najnowsze artykuły i porady z branży fryzjerskiej",
};

const pageContainer = "max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative";
const pageContent = "max-w-[900px] mx-auto relative z-10 bg-white/60 backdrop-blur-[10px] p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/20";
const pageTitle = "text-[52px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-gradient-to-r after:from-[#D2B79B] after:via-[#b89a7f] after:to-[#D2B79B] after:rounded";
const pageText = "text-[17px] leading-[1.9] text-gray-700 [&_p]:mb-7 [&_p:last-child]:mb-0 [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:bg-gradient-to-br [&_h2]:from-black [&_h2]:to-[#3d3329] [&_h2]:bg-clip-text [&_h2]:text-transparent [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:pb-3 [&_strong]:font-bold [&_strong]:text-black [&_a]:text-[#D2B79B] [&_a]:no-underline [&_a:hover]:text-[#b89a7f]";

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className={pageContainer}>
        <div className={pageContent}>
          <h1 className={pageTitle}>Blog</h1>
          <div className={pageText}>
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

