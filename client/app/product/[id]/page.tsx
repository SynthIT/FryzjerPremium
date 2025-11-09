import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductPage from "@/components/ProductPage";

export default async function Product({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Header />
      <ProductPage productId={id} />
      <Footer />
    </>
  );
}

