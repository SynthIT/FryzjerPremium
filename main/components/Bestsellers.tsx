"use client";

import "@/app/globals.css";
import { useEffect, useState } from "react";
import { Products } from "@/lib/types/productTypes";
import ProductElement from "./productsComponents/ProductElement";

export default function Bestsellers({
    data,
}: {
    data: { status: number; products?: Products[] };
}) {
    // Sortuj produkty według oceny (najwyższe na górze) i weź 4 najlepsze
    const [products, setProducts] = useState<Products[] | null>(null);
    useEffect(() => {
        async function getProductsBest() {
            if (data.status === 200) {
                setProducts(
                    [...data.products!]
                        .sort((a, b) => b.ocena - a.ocena)
                        .slice(0, 4),
                );
            } else {
                return [];
            }
        }
        getProductsBest();
    }, [data]);

    return (
        <section
            className="new-arrivals-section bestsellers-section"
            id="bestsellers-section">
            <div className="new-arrivals-container">
                <h2 className="section-title">Bestsellery</h2>
                <div className="products-section-wrapper">
                    <div className="products-section-wrapper-inner">
                        <div className="products-grid">
                            {typeof products != null ? (
                                products?.map((product, index) => (
                                    <ProductElement
                                        key={index}
                                        product={product}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div>
                                    <h1>Brak elementow do wyswietlenia</h1>
                                </div>
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
