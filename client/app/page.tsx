import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SideTabs from "../components/SideTabs";
import Footer from "../components/Footer";
import Products from "../components/Products";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <SideTabs />

      <Products />

      <Footer />
    </div>
  );
}
