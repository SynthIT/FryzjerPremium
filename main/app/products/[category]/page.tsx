import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductsPage from "@/components/ProductsPage";

export default async function CategoryProductsPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return (
    <>
      <Header />
      <ProductsPage categoryName={category} />
      <Footer />
    </>
  );
}

