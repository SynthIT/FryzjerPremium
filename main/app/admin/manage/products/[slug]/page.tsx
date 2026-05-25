"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Products } from "@/lib/types/productTypes";
import ProductEditModal from "@/components/admin/ProductEditModal";

export default function ProductPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const [product, setProduct] = useState<Products | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchProduct() {
            const res = await fetch(`/admin/api/v1/products?slug=${slug}`, {
                credentials: "include",
                method: "GET",
            }).then(res => res.json()).then(data => {
                if (data.status === 0) {
                    setProduct(data.product);
                    setLoading(false);
                }
            }).catch(err => {
                console.error(err);
                setLoading(false);
                setProduct(null);
            });
        }
        fetchProduct();

        return () => {
            setProduct(null);
            setLoading(true);
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie produktu...
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="space-y-4 sm:space-y-6">
            <ProductEditModal
                product={product as Products}
                isOpen={true}
                onClose={() => {
                    router.push(`/admin/manage/products`);
                }}
                onUpdate={(updatedProduct: Products) => {
                    alert(`Produkt zaktualizowany: ${updatedProduct.nazwa}`);
                    router.push(`/admin/manage/products`);
                }}
                onDelete={(productId: string) => {
                    alert(`Produkt usunięty: ${productId}`);
                    router.push(`/admin/manage/products`);
                }}
            />
        </div>
    );
}