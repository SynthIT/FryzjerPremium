import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductPage from "@/components/ProductPage";
import { getProductById } from "@/app/data/products";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  
  if (!product) {
    return {
      title: "Produkt nie znaleziony - Fryzjerpremium.pl",
      description: "Produkt nie został znaleziony w naszym sklepie.",
    };
  }

  const productName = product.fullName || product.name;
  const description = product.description 
    ? `${product.description.substring(0, 155)}...` 
    : `Kup ${productName} w cenie ${product.price} zł. ${product.category} wysokiej jakości w sklepie Fryzjerpremium.pl`;

  return {
    title: `${productName} - ${product.price} zł - Fryzjerpremium.pl`,
    description,
    openGraph: {
      title: productName,
      description: description,
      type: "website",
    },
  };
}

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

