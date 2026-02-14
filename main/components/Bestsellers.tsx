"use client";

import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { finalPrice, renderStars } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Promos } from "@/lib/types/shared";
import { Products } from "@/lib/types/productTypes";

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

    // const products = [...allProducts]
    //     .sort((a, b) => b.rating - a.rating)
    //     .slice(0, 4);

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
                                    <Link
                                        key={index}
                                        href={`/product/${product.slug}`}
                                        className="product-card-link">
                                        <div className="product-card-listing">
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
                                                        18,
                                                    )}
                                                </div>
                                                <div className="product-price">
                                                    {product.promocje ? (
                                                        <span
                                                            className="product-original-price-home"
                                                            style={{
                                                                color: "red",
                                                            }}>
                                                            {finalPrice(
                                                                product.cena,
                                                                undefined,
                                                                product.promocje as Promos,
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="product-original-price-home">
                                                            {product.cena} zł
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
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
