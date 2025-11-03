import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsPage from "@/components/ProductsPage";

export default function CategoryProductsPage({ params }: { params: { category: string } }) {
  return (
    <>
      <Header />
      <ProductsPage categoryName={params.category} />
      <Footer />
    </>
  );
}

