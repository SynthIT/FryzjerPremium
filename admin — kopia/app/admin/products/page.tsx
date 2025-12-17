"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/lib/utils";
import { Products, Categories, Producents } from "@/lib/models/Products";
import AdminProductCard from "@/components/admin/AdminProductCard";
import ProductEditModal from "@/components/admin/ProductEditModal";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Products[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Products | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const productsPerPage = 12;

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const data = await getProducts();
                // Na sztywno dodane produkty testowe
                const mockProducts: Products[] = [
                    {
                        slug: "szampon-wella-professional",
                        nazwa: "Szampon Wella Professional",
                        cena: 45.99,
                        dostepnosc: "dostępny",
                        kategoria: [
                            { nazwa: "Kosmetyki", slug: "kosmetyki", image: "/kosmetyki.png" },
                            { nazwa: "Szampony", slug: "szampony", image: "/szampony.png" }
                        ],
                        producent: { nazwa: "Wella", slug: "wella" },
                        media: [
                            {
                                nazwa: "Szampon Wella",
                                slug: "szampon-wella-img",
                                typ: "image",
                                alt: "Szampon Wella Professional",
                                path: "/kosmetyki.png"
                            }
                        ],
                        promocje: null,
                        opis: "Profesjonalny szampon do włosów z serii Wella Professional. Idealny do codziennej pielęgnacji, nadaje włosom blask i miękkość. Zawiera składniki odżywcze i witaminy.",
                        ilosc: 25,
                        czas_wysylki: 2,
                        kod_produkcyjny: "WELL-SHAM-001",
                        ocena: 4.5,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: true
                    },
                    {
                        slug: "suszarka-babyliss-pro",
                        nazwa: "Suszarka BaByliss PRO 2200W",
                        cena: 299.99,
                        dostepnosc: "dostępny",
                        kategoria: [
                            { nazwa: "Sprzęty", slug: "sprzety", image: "/sprzety.png" },
                            { nazwa: "Suszarki", slug: "suszarki", image: "/suszarki.png" }
                        ],
                        producent: { nazwa: "BaByliss", slug: "babyliss" },
                        media: [
                            {
                                nazwa: "Suszarka BaByliss",
                                slug: "suszarka-babyliss-img",
                                typ: "image",
                                alt: "Suszarka BaByliss PRO",
                                path: "/sprzety.png"
                            }
                        ],
                        promocje: { nazwa: "Zima 2024", procent: 15, rozpoczecie: new Date(), wygasa: new Date() },
                        opis: "Profesjonalna suszarka do włosów o mocy 2200W. Wyposażona w technologię jonizacji, która redukuje puszenie się włosów. Idealna do salonu fryzjerskiego.",
                        ilosc: 8,
                        czas_wysylki: 3,
                        kod_produkcyjny: "BAB-SUSZ-2200",
                        ocena: 4.8,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: true
                    },
                    {
                        slug: "fotel-fryzjerski-takara",
                        nazwa: "Fotel Fryzjerski Takara Belmont",
                        cena: 4500.00,
                        dostepnosc: "na zamówienie",
                        kategoria: [
                            { nazwa: "Meble", slug: "meble", image: "/meble.png" },
                            { nazwa: "Fotele", slug: "fotele", image: "/fotele.png" }
                        ],
                        producent: { nazwa: "Takara Belmont", slug: "takara-belmont" },
                        media: [
                            {
                                nazwa: "Fotel Takara",
                                slug: "fotel-takara-img",
                                typ: "image",
                                alt: "Fotel Fryzjerski Takara Belmont",
                                path: "/meble.png"
                            }
                        ],
                        promocje: null,
                        opis: "Profesjonalny fotel fryzjerski marki Takara Belmont. Wysokiej jakości, wygodny i trwały. Idealny do profesjonalnych salonów fryzjerskich.",
                        ilosc: 2,
                        czas_wysylki: 14,
                        kod_produkcyjny: "TAK-FOT-001",
                        ocena: 5.0,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: true
                    },
                    {
                        slug: "szkolenie-koloryzacja",
                        nazwa: "Szkolenie z Koloryzacji Włosów",
                        cena: 899.99,
                        dostepnosc: "dostępny",
                        kategoria: [
                            { nazwa: "Szkolenia", slug: "szkolenia", image: "/szkolenia.png" },
                            { nazwa: "Koloryzacja", slug: "koloryzacja", image: "/koloryzacja.png" }
                        ],
                        producent: { nazwa: "Akademia Fryzjerstwa", slug: "akademia-fryzjerstwa" },
                        media: [
                            {
                                nazwa: "Szkolenie",
                                slug: "szkolenie-img",
                                typ: "image",
                                alt: "Szkolenie z Koloryzacji",
                                path: "/szkolenia.png"
                            }
                        ],
                        promocje: null,
                        opis: "Kompleksowe szkolenie z technik koloryzacji włosów. Kurs obejmuje teorię i praktykę. Certyfikat ukończenia wliczony w cenę.",
                        ilosc: 15,
                        czas_wysylki: 0,
                        kod_produkcyjny: "AKAD-SZK-KOL",
                        ocena: 4.7,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: true
                    },
                    {
                        slug: "odzywka-loreal",
                        nazwa: "Odżywka L'Oréal Professionnel",
                        cena: 38.50,
                        dostepnosc: "dostępny",
                        kategoria: [
                            { nazwa: "Kosmetyki", slug: "kosmetyki", image: "/kosmetyki.png" },
                            { nazwa: "Odżywki", slug: "odzywki", image: "/odzywki.png" }
                        ],
                        producent: { nazwa: "L'Oréal", slug: "loreal" },
                        media: [
                            {
                                nazwa: "Odżywka L'Oreal",
                                slug: "odzywka-loreal-img",
                                typ: "image",
                                alt: "Odżywka L'Oréal",
                                path: "/kosmetyki.png"
                            }
                        ],
                        promocje: { nazwa: "Promocja", procent: 10, rozpoczecie: new Date(), wygasa: new Date() },
                        opis: "Intensywna odżywka do włosów z serii L'Oréal Professionnel. Regeneruje i wzmacnia włosy, nadaje im blask i elastyczność.",
                        ilosc: 0,
                        czas_wysylki: 2,
                        kod_produkcyjny: "LOR-ODZ-001",
                        ocena: 4.3,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: false
                    }
                ];
                const apiProducts = data.products || [];
                setProducts([...mockProducts, ...apiProducts]);
            } catch (error) {
                console.error("Błąd podczas ładowania produktów:", error);
                // Nawet przy błędzie pokaż mockowe produkty
                const mockProducts: Products[] = [
                    {
                        slug: "szampon-wella-professional",
                        nazwa: "Szampon Wella Professional",
                        cena: 45.99,
                        dostepnosc: "dostępny",
                        kategoria: [
                            { nazwa: "Kosmetyki", slug: "kosmetyki", image: "/kosmetyki.png" }
                        ],
                        producent: { nazwa: "Wella", slug: "wella" },
                        media: [
                            {
                                nazwa: "Szampon Wella",
                                slug: "szampon-wella-img",
                                typ: "image",
                                alt: "Szampon Wella Professional",
                                path: "/kosmetyki.png"
                            }
                        ],
                        promocje: null,
                        opis: "Profesjonalny szampon do włosów z serii Wella Professional.",
                        ilosc: 25,
                        czas_wysylki: 2,
                        kod_produkcyjny: "WELL-SHAM-001",
                        ocena: 4.5,
                        opinie: null,
                        createdAt: new Date(),
                        aktywne: true
                    }
                ];
                setProducts(mockProducts);
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
            return nazwa.includes(query) || opis.includes(query) || kod.includes(query);
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

    const handleProductUpdate = (updatedProduct: Products) => {
        setProducts((prev) =>
            prev.map((p) => (p.slug === updatedProduct.slug ? updatedProduct : p))
        );
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProductDelete = (productSlug: string) => {
        setProducts((prev) => prev.filter((p) => p.slug !== productSlug));
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Ładowanie produktów...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Produkty</h1>
                    <p className="text-muted-foreground mt-1">
                        Zarządzaj produktami w sklepie
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Szukaj produktów..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="text-sm text-muted-foreground">
                        {filteredProducts.length} produktów
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {displayedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">📦</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery ? "Nie znaleziono produktów" : "Brak produktów"}
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
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
                                Poprzednia
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 border rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                } transition-colors`}
                                            >
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
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
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

