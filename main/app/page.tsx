import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import NewArrivals from "@/components/NewArrivals";
import Bestsellers from "@/components/Bestsellers";
import ProductCategories from "@/components/ProductCategories";
import Footer from "@/components/Footer";
import { getProducts } from "@/lib/utils";

export default async function Home() {
    const retrivetProducts = await getProducts();

    return (
        <>
            <Header />
            <Hero />
            <Brands data={retrivetProducts} />
            <NewArrivals data={retrivetProducts} />
            <Bestsellers data={retrivetProducts} />
            <ProductCategories />
            <Footer />
        </>
    );
}
