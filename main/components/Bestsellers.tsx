"use client";
import { useEffect, useState } from "react";
import { Products } from "@/lib/types/productTypes";
import ProductElement from "./productsComponents/ProductElement";
import Link from "next/link";

export default function Bestsellers({ data }: { data?: { status: number; products?: Products[] } }) {
    const [products, setProducts] = useState<Products[] | null>(null);
    useEffect(() => {
        function fetchProducts() {
            if (data?.status === 200 && data?.products?.length) {
                setProducts([...data?.products].sort((a, b) => b.ocena - a.ocena).slice(0, 4));
            }
        }
        fetchProducts();
    }, [data]);

    return (
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white/30" id="bestsellers-section">
            <div className="max-w-[1400px] mx-auto">
                <h2 className="text-3xl font-bold text-black mb-10 pb-3 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-14 after:h-0.5 after:bg-[#D2B79B] after:rounded">
                    Bestsellery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products?.map((product, index) => (
                        <ProductElement key={product.slug ?? index} product={product} index={index} />
                    ))}
                </div>
                {!products?.length && <div className="text-center py-8 text-gray-600">Brak elementów do wyświetlenia.</div>}
                <div className="mt-8 text-center">
                    <Link href="/products" className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors">
                        Pokaż więcej
                    </Link>
                </div>
            </div>
        </section>
    );
}
