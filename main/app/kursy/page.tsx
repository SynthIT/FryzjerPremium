import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KursyPageContent from "@/components/kursy/KursyPageContent";

export const metadata = {
  title: "Kursy - Fryzjerpremium.pl",
  description:
    "Oferta szkoleń i kursów fryzjerskich. Skontaktuj się z nami w sprawie dopasowania kursu.",
};

const pageContainer =
  "max-w-[1200px] mx-auto pt-[180px] pb-20 px-6 min-h-[calc(100vh-200px)] w-full relative";
const pageContent =
  "max-w-[900px] mx-auto relative z-10 bg-white/60 backdrop-blur-[10px] p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.5)_inset] border border-white/20";
const pageTitle =
  "text-[52px] font-black bg-gradient-to-br from-black via-[#3d3329] to-black bg-clip-text text-transparent mb-10 pb-5 relative inline-block w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-gradient-to-r after:from-[#D2B79B] after:via-[#b89a7f] after:to-[#D2B79B] after:rounded";

export default function KursyPage() {
  return (
    <>
      <Header />
      <main className={pageContainer}>
        <div className={pageContent}>
          <h1 className={pageTitle}>Kursy</h1>
          <KursyPageContent />
        </div>
      </main>
      <Footer />
    </>
  );
}
