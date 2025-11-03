import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import NewArrivals from "@/components/NewArrivals";
import Bestsellers from "@/components/Bestsellers";
import ProductCategories from "@/components/ProductCategories";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Brands />
      <NewArrivals />
      <Bestsellers />
      <ProductCategories />
      <Footer />
    </>
  );
}
