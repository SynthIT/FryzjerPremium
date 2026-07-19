import Hero from "./Hero";
import Brands from "./Brands";
import NewArrivals from "./NewArrivals";
import Bestsellers from "./Bestsellers";
import FeaturedCourses from "./FeaturedCourses";
import ProductCategories from "./ProductCategories";
import QueryInfoBanner from "./QueryInfoBanner";
import { Suspense } from "react";

export default function HomePage() {
    return (
        <>
            <Suspense fallback={null}>
                <QueryInfoBanner />
            </Suspense>
            <Hero />
            <Brands />
            <NewArrivals />
            <Bestsellers />
            <FeaturedCourses />
            <ProductCategories />
        </>
    );
}
