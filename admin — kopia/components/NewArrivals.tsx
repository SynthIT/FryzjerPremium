"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { getProducts, renderStars } from "@/lib/utils";
import { ProductsResponse } from "@/lib/interfaces/ax";
import { Products } from "@/lib/models/Products";
import { useState, useEffect } from "react";

export default function NewArrivals() {
    // Sortuj produkty według ID (najnowsze na górze) i weź 4 najnowsze
    const [products, setProducts] = useState<Products[] | null>(null);
    useEffect(() => {
        async function getProductsBest() {
            const data = await getProducts()
            if (data.status === 200) {
                setProducts(
                    [...data.products!]
                        .sort(
                            (a, b) =>
                                b.createdAt.getTime() - a.createdAt.getTime()
                        )
                        .slice(0, 4)
                );
            } else {
                return [];
            }
        }
        getProductsBest();
    }, []);

    return (
        <section className="new-arrivals-section" id="new-arrivals-section">
            <div className="new-arrivals-container">
                <h2 className="section-title">Nowości</h2>

                <div className="products-section-wrapper">
                    <div className="products-section-wrapper-inner">
                        <div className="products-grid">
                            {products ? (
                                products.map((product, index) => (
                                    <Link
                                        key={index}
                                        href={`/product/${product.slug}`}
                                        className="product-card-link">
                                        <div className="product-card">
                                            <div className="product-image-wrapper">
                                                {product.media ? (
                                                    <Image
                                                        src={
                                                            product.media[0]
                                                                .path
                                                        }
                                                        alt={
                                                            product.media[0].alt
                                                        }
                                                        width={300}
                                                        height={300}
                                                        className="product-image"
                                                    />
                                                ) : (
                                                    <div className="product-placeholder">
                                                        <span>
                                                            {product.nazwa}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="product-info">
                                                <h3 className="product-name">
                                                    {product.nazwa}
                                                </h3>
                                                <div className="product-rating">
                                                    {renderStars(
                                                        product.ocena,
                                                        18
                                                    )}
                                                </div>
                                                <div className="product-price">
                                                    <span>
                                                        {product.cena} zł
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
