"use client";
import { Products } from "@/lib/types/productTypes";
import { useState, useEffect } from "react";
import ProductCard from "@/components/produkty/ProductCard";
import Link from "next/link";

export default function NewArrivals({ data }: { data?: { status: number; products?: Products[] } }) {
    const [products, setProducts] = useState<Products[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (data?.products?.length) {
                if (!cancelled) {
                    setProducts(
                        [...data.products]
                            .sort(
                                (a, b) =>
                                    new Date(b.createdAt!).getTime() -
                                    new Date(a.createdAt!).getTime(),
                            )
                            .slice(0, 4),
                    );
                }
                return;
            }

            try {
                const res = await fetch("/api/v1/products/new?limit=4", {
                    credentials: "include",
                });
                const json = await res.json();
                if (!cancelled) {
                    setProducts(Array.isArray(json.products) ? json.products : []);
                }
            } catch {
                if (!cancelled) setProducts([]);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [data]);

    return (
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8" id="new-arrivals-section">
            <div className="max-w-[1400px] mx-auto">
                <h2 className="text-3xl font-bold text-black mb-10 pb-3 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-14 after:h-0.5 after:bg-[#D2B79B] after:rounded">
                    Nowości — produkty
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product, index) => (
                        <ProductCard key={product.slug ?? index} product={product} index={index} />
                    ))}
                </div>
                {!products?.length && (
                    <div className="text-center py-8 text-gray-600">
                        <p>Brak nowych produktów do wyświetlenia.</p>
                    </div>
                )}
                <div className="mt-8 text-center">
                    <Link href="/produkty" className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors">
                        Pokaż więcej produktów
                    </Link>
                </div>
            </div>
        </section>
    );
}
