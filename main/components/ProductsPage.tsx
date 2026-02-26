"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FiltersSidebar from "@/components/FiltersSidebar";
import {
    getCategoryDisplayName,
    decodeCategory,
    getProducts,
} from "@/lib/utils";
import { Producents, Products } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import ProductElement from "./productsComponents/ProductElement";

interface ProductsPageProps {
    categoryName?: string;
}

export default function ProductsPage({ categoryName }: ProductsPageProps) {
    const [allProducts, setAllProduct] = useState<Products[]>([]);

    const params = useParams();
    const urlCategoryParam = categoryName || (params?.category as string) || "";
    const urlCategory = useMemo(
        () => decodeCategory(urlCategoryParam),
        [urlCategoryParam],
    );
    const [selectedCategory, setSelectedCategory] =
        useState("Wszystkie produkty");

    useEffect(() => {
        async function getProduct() {
            try {
                const data = await getProducts();
                setAllProduct(data.products || []);
            } catch (error) {
                console.error("Błąd podczas ładowania produktów:", error);
                setAllProduct([]);
            }
        }
        getProduct();
    }, []);

    const [sortBy, setSortBy] = useState("Najpopularniejsze");
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    // Stan filtrów - początkowy zakres dla "wszystkie produkty"
    // Teraz używamy tablic dla wielokrotnego wyboru
    const [filters, setFilters] = useState({
        priceRange: { min: 0, max: 15000 },
        selectedSubcategories: [] as string[],
        selectedBrands: [] as string[],
        selectedSizes: [] as string[],
        selectedTypes: [] as string[],
    });

    useEffect(() => {
        async function setSelected(urlCategory: string) {
            try {
                const displayName =
                    await getCategoryDisplayName(urlCategory);
                setSelectedCategory(displayName);
            } catch (error) {
                console.error(
                    "Błąd podczas ładowania nazwy kategorii:",
                    error,
                );
                setSelectedCategory(
                    urlCategory
                        ? urlCategory.charAt(0).toUpperCase() +
                        urlCategory.slice(1)
                        : "Wszystkie produkty",
                );
            }
            setFilters({
                priceRange: { min: 0, max: 15000 },
                selectedSubcategories: [],
                selectedBrands: [],
                selectedSizes: [],
                selectedTypes: [],
            });
            setCurrentPage(1);
        }
        if (urlCategory) {
            setSelected(urlCategory);
        } else {
            setSelectedCategory("Wszystkie produkty");
        }
    }, [urlCategory]);

    // Sortowanie produktów - memoized
    const sortedProducts = useMemo(() => {
        if (!Array.isArray(allProducts)) {
            return [];
        }
        return [...allProducts].sort((a, b) => {
            switch (sortBy) {
                case "Cena: od najniższej":
                    return a.cena - b.cena;
                case "Cena: od najwyższej":
                    return b.cena - a.cena;
                case "Ocena":
                    return b.ocena - a.ocena;
                case "Najnowsze":
                    const dateA =
                        a.createdAt instanceof Date
                            ? a.createdAt.getTime()
                            : new Date(a.createdAt!).getTime();
                    const dateB =
                        b.createdAt instanceof Date
                            ? b.createdAt.getTime()
                            : new Date(b.createdAt!).getTime();
                    return dateB - dateA;
                default: // 'Najpopularniejsze'
                    return b.ocena - a.ocena;
            }
        });
    }, [allProducts, sortBy]);

    // Tworzymy mapę nazwa -> slug dla wszystkich kategorii w produktach
    const categoryNameToSlugMap = useMemo(() => {
        const map = new Map<string, string>();
        allProducts.forEach((product) => {
            const productCategories = product.kategoria as Categories[];
            if (productCategories && productCategories.length > 0) {
                productCategories.forEach((cat) => {
                    if (cat.nazwa && cat.slug) {
                        map.set(cat.slug, cat.nazwa.toLowerCase());
                    }
                });
            }
        });
        return map;
    }, [allProducts]);

    const produentsToMap = useMemo(() => {
        const map = new Map<string, string>();
        allProducts.forEach((product) => {
            const productProducent = product.producent as Producents;
            if (
                productProducent &&
                productProducent.nazwa &&
                productProducent.slug
            ) {
                map.set(
                    productProducent.slug,
                    productProducent.nazwa.toLowerCase(),
                );
            }
        });
        return map;
    }, [allProducts]);

    // Filtruj produkty według kategorii i wszystkich filtrów - memoized
    const filteredProducts = useMemo(() => {
        return sortedProducts.filter((product) => {
            // Filtrowanie według kategorii
            if (
                urlCategory &&
                (product.kategoria as Categories[])[0].slug.toLowerCase() !==
                urlCategory.toLowerCase()
            ) {
                return false;
            }

            // Filtrowanie według ceny
            const productPrice = product.cena;
            if (
                productPrice < filters.priceRange.min ||
                productPrice > filters.priceRange.max
            ) {
                return false;
            }

            // Filtrowanie według podkategorii - filtrujemy po nazwie, ale porównujemy slugi kategorii
            if (filters.selectedSubcategories.length > 0) {
                const productCategories = product.kategoria as Categories[];
                if (!productCategories || productCategories.length === 0) {
                    return false;
                }

                // Dla każdej wybranej nazwy podkategorii znajdź odpowiadający slug
                // i porównaj z slugami kategorii produktu
                const matchesAnySubcategory =
                    filters.selectedSubcategories.some((selectedNazwa) => {
                        const selectedSlug =
                            categoryNameToSlugMap.get(selectedNazwa);
                        if (!selectedSlug) {
                            // Jeśli nie znaleziono slug dla nazwy, porównaj bezpośrednio po nazwie
                            return productCategories.some(
                                (cat) => cat.nazwa === selectedNazwa,
                            );
                        }
                        // Porównaj slug kategorii produktu z slugiem wybranej podkategorii
                        return productCategories.some(
                            (cat) => cat.nazwa.toLowerCase() === selectedSlug,
                        );
                    });

                if (!matchesAnySubcategory) {
                    return false;
                }
            }

            // Filtrowanie według marki (na razie pomijamy, bo produkty nie mają marki w danych)
            // Jeśli wybrano jakieś marki, produkt musi pasować do przynajmniej jednej
            if (filters.selectedBrands.length > 0) {
                const productProducent = product.producent as Producents;
                if (!productProducent) {
                    return false;
                }

                // Dla każdej wybranej nazwy podkategorii znajdź odpowiadający slug
                // i porównaj z slugami kategorii produktu
                const matchesAnyProducent = filters.selectedBrands.some(
                    (selectedNazwa) => {
                        const selectedProducent =
                            produentsToMap.get(selectedNazwa);
                        console.log(
                            "selectedNazwa:",
                            selectedNazwa,
                            "mapped to:",
                            selectedProducent,
                        );
                        return productProducent.nazwa == selectedProducent;
                    },
                );

                if (!matchesAnyProducent) {
                    return false;
                }
            }

            // Filtrowanie według typu (na razie pomijamy, podobnie jak marka)
            if (filters.selectedTypes.length > 0) {
                // Na razie pomijamy, bo produkty nie mają typu w danych
            }

            // Filtrowanie według rozmiaru (tylko dla mebli, na razie pomijamy)
            if (filters.selectedSizes.length > 0) {
                // Na razie pomijamy, bo produkty nie mają rozmiaru w danych
            }

            return true;
        });
    }, [
        sortedProducts,
        urlCategory,
        filters.priceRange.min,
        filters.priceRange.max,
        filters.selectedSubcategories,
        filters.selectedBrands,
        filters.selectedTypes.length,
        filters.selectedSizes.length,
        categoryNameToSlugMap,
        produentsToMap,
    ]);

    // Resetuj stronę gdy zmienią się filtry
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Paginacja - memoized
    const totalItems = Array.isArray(filteredProducts)
        ? filteredProducts.length
        : 0;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedItems = useMemo(() => {
        return Array.isArray(filteredProducts)
            ? filteredProducts.slice(startIndex, endIndex)
            : [];
    }, [filteredProducts, startIndex, endIndex]);
    const totalPages = Math.ceil(totalItems / productsPerPage);

    // Handlery - memoized
    const handleSortChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSortBy(e.target.value);
        },
        [],
    );

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    return (
        <div className="min-h-screen bg-white pt-[120px] mt-5 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="text-gray-500 text-[15px] hover:underline">Strona główna</Link>
                    <span className="text-gray text-[16px]">&gt;</span>
                    <span className="text-gray-900 bg-[#D2B79B1f] font-bold text-[15px] px-2 py-1 rounded-md">{selectedCategory}</span>
                </div>
                <div className="flex flex-row justify-between items-center gap-6 my-15 text-sm text-gray-600">
                    <h1 className="text-5xl font-bold text-gray-900 mb-1">{selectedCategory}</h1>
                    <div className="flex flex-row items-center gap-2">
                        <span>Wyników: {startIndex + 1}-{Math.min(endIndex, totalItems)} z {totalItems} produktów.</span>
                        <span className="text-gray-400">Sortuj:</span>
                        <select value={sortBy} onChange={handleSortChange} className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-[#D2B79B] focus:ring-1 focus:ring-[#D2B79B] align-middle">
                            <option>Najpopularniejsze</option>
                            <option>Cena: od najniższej</option>
                            <option>Cena: od najwyższej</option>
                            <option>Najnowsze</option>
                            <option>Ocena</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <FiltersSidebar category={urlCategory} products={allProducts} filters={filters} onFiltersChange={setFilters} />
                    <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {displayedItems.map((product, index) => (
                                <ProductElement
                                    index={index}
                                    key={product.slug ?? index}
                                    product={product as Products}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                                <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors" disabled={currentPage === 1} onClick={handlePrevPage}>← Poprzednia</button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => {
                                        const pageNum = i + 1;
                                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                            return (
                                                <button key={pageNum} type="button" className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${currentPage === pageNum ? "bg-[#D2B79B] text-black border-[#D2B79B]" : "border-gray-300 hover:bg-gray-100"}`} onClick={() => handlePageChange(pageNum)}>{pageNum}</button>
                                            );
                                        }
                                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                            return <span key={pageNum} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors" disabled={currentPage === totalPages} onClick={handleNextPage}>Następna →</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
