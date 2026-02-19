"use client";
import "@/app/globals.css";
import { Products } from "@/lib/types/productTypes";
import { useState, useEffect } from "react";
import ProductElement from "./productsComponents/ProductElement";

export default function NewArrivals({ data }: { data: { status: number; products?: Products[] } }) {
    // Sortuj produkty według ID (najnowsze na górze) i weź 4 najnowsze
    const [products, setProducts] = useState<Products[] | null>(null);
    useEffect(() => {
        async function getProductsBest() {
            setProducts(
                [...data.products!]
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt!).getTime() -
                            new Date(a.createdAt!).getTime()
                    )
                    .slice(0, 4)
            );
        }
        getProductsBest();
    }, [data]);

    return (
        <section className="new-arrivals-section" id="new-arrivals-section">
            <div className="new-arrivals-container">
                <h2 className="section-title">Nowości</h2>

                <div className="products-section-wrapper">
                    <div className="products-section-wrapper-inner">
                        <div className="products-grid">
                            {products ? (
                                products.map((product, index) => (
                                    <ProductElement
                                        key={index}
                                        product={product}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <>
                                    <h1>
                                        Wystąpił błąd podczas tworzenia tej
                                        sekcji.
                                    </h1>
                                    <p>
                                        Jeżeli jest to powtarzający sie bład,
                                        prosimy o kontakt
                                    </p>
                                </>
                            )}
                        </div>
                        <button className="show-more-button">
                            Pokaż więcej
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
