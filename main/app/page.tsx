import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import NewArrivals from "@/components/NewArrivals";
import Bestsellers from "@/components/Bestsellers";
import ProductCategories from "@/components/ProductCategories";
import Footer from "@/components/Footer";
import QueryInfoBanner from "@/components/QueryInfoBanner";
import { getProducts } from "@/lib/utils";
import { Suspense } from "react";

export default async function Home() {

    return (
        <>
            <Header />
            <Suspense fallback={null}>
                <QueryInfoBanner />
            </Suspense>
            <Hero />
            <Brands/>
            <NewArrivals/>
            <Bestsellers/>
            <ProductCategories />
            <Footer />
        </>
    );
}
