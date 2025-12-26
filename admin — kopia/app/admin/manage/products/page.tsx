"use client";

import { useState, useEffect, useMemo } from "react";
import { Products, } from "@/lib/models/Products";
import AdminProductCard from "@/components/admin/AdminProductCard";
import ProductEditModal from "@/components/admin/ProductEditModal";
import Link from "next/link";

export default function ProductPage() {
    const [products, setProducts] = useState<Products[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Products | null>(
        null
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const productsPerPage = 12;

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const data = await fetch("/admin/api/v1/products").then((res) =>
                    res.json()
                );
                // Pobierz produkty z API - to samo API co w sklepie
                setProducts(data || []);
            } catch (error) {
                console.error("Błąd podczas ładowania produktów:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Filtrowanie i paginacja
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const query = searchQuery.toLowerCase();
        return products.filter((product) => {
            const nazwa = product.nazwa?.toLowerCase() || "";
            const opis = product.opis?.toLowerCase() || "";
            const kod = product.kod_produkcyjny?.toLowerCase() || "";
            return (
                nazwa.includes(query) ||
                opis.includes(query) ||
                kod.includes(query)
            );
        });
    }, [products, searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedProducts = filteredProducts.slice(startIndex, endIndex);

    const handleProductClick = (product: Products) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleProductUpdate = async (updatedProduct: Products) => {
        // Odśwież listę produktów z API
        try {
            const data = await fetch("/admin/api/v1/products").then((res) =>
                res.json()
            );
            setProducts(data.products || []);
        } catch (error) {
            console.error("Błąd podczas odświeżania produktów:", error);
            // Fallback - lokalna aktualizacja
            setProducts((prev) =>
                prev.map((p) =>
                    p.slug === updatedProduct.slug ? updatedProduct : p
                )
            );
        }
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProductDelete = async (productSlug: string) => {
        // Odśwież listę produktów z API
        try {
            const data = await fetch("/admin/api/v1/products").then((res) =>
                res.json()
            );
            setProducts(data.products || []);
        } catch (error) {
            console.error("Błąd podczas odświeżania produktów:", error);
            // Fallback - lokalne usunięcie
            setProducts((prev) => prev.filter((p) => p.slug !== productSlug));
        }
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie produktów...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Produkty
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj produkty.
                    </p>
                </div>
                <Link
                    href="/admin/manage/products/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj produkt
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj produktów..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredProducts.length} produktów
                </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">📦</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery
                                    ? "Nie znaleziono produktów"
                                    : "Brak produktów"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwszy produkt, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedProducts.map((product) => (
                            <AdminProductCard
                                key={product.slug}
                                product={product}
                                onClick={() => handleProductClick(product)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Poprzednia
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 &&
                                            page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`px-3 py-2 border rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                } transition-colors`}>
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <span key={page} className="px-2">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Następna
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Modal */}
            {selectedProduct && (
                <ProductEditModal
                    product={selectedProduct}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onUpdate={handleProductUpdate}
                    onDelete={handleProductDelete}
                />
            )}
        </div>
    );
}
