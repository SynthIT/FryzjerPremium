"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FiltersSidebar from "@/components/FiltersSidebar";
import {
    getCategoryDisplayName,
    decodeCategory,
    getProducts,
    getCourses,
} from "@/lib/utils";
import { Producents, Products } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import { Courses } from "@/lib/types/coursesTypes";
import ProductElement from "./productsComponents/ProductElement";
import CourseElement from "./coursesComponents/CourseElement";

interface ProductsPageProps {
    categoryName?: string;
}

export default function ProductsPage({ categoryName }: ProductsPageProps) {
    const [allProducts, setAllProduct] = useState<Products[]>([]);
    const [allCourses, setAllCourses] = useState<Courses[]>([]);

    const params = useParams();
    const urlCategoryParam = categoryName || (params?.category as string) || "";
    const urlCategory = useMemo(
        () => decodeCategory(urlCategoryParam),
        [urlCategoryParam],
    );
    const isCoursesPage = urlCategory.toLowerCase() === "szkolenia";
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

    useEffect(() => {
        async function fetchCourses() {
            if (isCoursesPage) {
                try {
                    console.log(
                        "🔄 Pobieranie szkoleń dla strony /products/szkolenia",
                    );
                    const data = await getCourses();
                    console.log("📦 Otrzymane dane z API:", data);
                    console.log("📦 Typ danych:", typeof data);
                    console.log(
                        "📦 Czy to obiekt:",
                        data && typeof data === "object",
                    );
                    console.log(
                        "📦 Czy ma courses:",
                        data && "courses" in data,
                    );
                    console.log("📦 Czy to tablica:", Array.isArray(data));
                    console.log("📊 Status:", data?.status);
                    console.log(
                        "📚 Liczba szkoleń:",
                        data?.courses?.length || 0,
                    );

                    // Sprawdź różne możliwe formaty odpowiedzi
                    let coursesToSet: Courses[] = [];

                    if (data && data.courses && Array.isArray(data.courses)) {
                        coursesToSet = data.courses;
                        console.log("✅ Format: data.courses (tablica)");
                    } else if (data && Array.isArray(data)) {
                        coursesToSet = data;
                        console.log("✅ Format: data jest tablicą");
                    } else if (
                        data &&
                        data.status === 200 &&
                        Array.isArray(data.courses)
                    ) {
                        coursesToSet = data.courses;
                        console.log("✅ Format: data.status === 200");
                    } else if (
                        data &&
                        typeof data === "object" &&
                        "courses" in data
                    ) {
                        coursesToSet = Array.isArray(data.courses)
                            ? data.courses
                            : [];
                        console.log(
                            "✅ Format: data.courses (sprawdzam czy tablica)",
                        );
                    } else {
                        console.warn(
                            "⚠️ Nieznany format danych. Pełne dane:",
                            JSON.stringify(data, null, 2),
                        );
                        coursesToSet = [];
                    }

                    console.log("🎯 Ustawiam szkolenia:", coursesToSet.length);
                    setAllCourses(coursesToSet);

                    // Jeśli nie ma szkoleń, spróbuj utworzyć przykładowe
                    if (coursesToSet.length === 0) {
                        console.log(
                            "⚠️ Brak szkoleń - próbuję utworzyć przykładowe...",
                        );
                        try {
                            const initResponse = await fetch(
                                "/api/v1/courses/init",
                                {
                                    method: "POST",
                                    credentials: "include",
                                },
                            );
                            const initData = await initResponse.json();
                            console.log("📝 Odpowiedź z init:", initData);

                            if (initData.status === 0) {
                                // Odśwież dane
                                const newData = await getCourses();
                                if (
                                    newData &&
                                    newData.courses &&
                                    Array.isArray(newData.courses)
                                ) {
                                    setAllCourses(newData.courses);
                                }
                            }
                        } catch (initError) {
                            console.error(
                                "❌ Błąd podczas inicjalizacji:",
                                initError,
                            );
                        }
                    }
                } catch (error) {
                    console.error("❌ Błąd podczas ładowania szkoleń:", error);
                    console.error(
                        "❌ Szczegóły błędu:",
                        error instanceof Error ? error.message : error,
                    );
                    setAllCourses([]);
                }
            } else {
                console.log(
                    "ℹ️ To nie jest strona szkoleń, nie pobieram danych",
                );
            }
        }
        fetchCourses();
    }, [isCoursesPage]);
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
            if (urlCategory.toLowerCase() === "szkolenia") {
                setSelectedCategory("Szkolenia");
            } else {
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
            }
            // Dla szkoleń ustaw większy zakres cen
            const maxPrice =
                urlCategory.toLowerCase() === "szkolenia" ? 5000 : 15000;
            setFilters({
                priceRange: { min: 0, max: maxPrice },
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

    // Sortowanie szkoleń - memoized
    const sortedCourses = useMemo(() => {
        if (!isCoursesPage) return [];
        if (!Array.isArray(allCourses)) {
            console.log("⚠️ allCourses nie jest tablicą:", allCourses);
            return [];
        }
        if (allCourses.length === 0) {
            console.log("⚠️ allCourses jest pustą tablicą");
            return [];
        }
        console.log(
            "🔄 Sortowanie",
            allCourses.length,
            "szkoleń według:",
            sortBy,
        );
        const sorted = [...allCourses].sort((a, b) => {
            switch (sortBy) {
                case "Cena: od najniższej":
                    return a.cena - b.cena;
                case "Cena: od najwyższej":
                    return b.cena - a.cena;
                case "Ocena":
                    return (b.ocena || 0) - (a.ocena || 0);
                case "Najnowsze":
                    const dateA =
                        a.createdAt instanceof Date
                            ? a.createdAt.getTime()
                            : new Date(a.createdAt || 0).getTime();
                    const dateB =
                        b.createdAt instanceof Date
                            ? b.createdAt.getTime()
                            : new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                default: // 'Najpopularniejsze'
                    return (b.ocena || 0) - (a.ocena || 0);
            }
        });
        console.log("✅ Posortowano", sorted.length, "szkoleń");
        return sorted;
    }, [allCourses, sortBy, isCoursesPage]);

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

    // Filtruj szkolenia według ceny - memoized
    const filteredCourses = useMemo(() => {
        if (!isCoursesPage) {
            console.log("⚠️ To nie jest strona szkoleń, zwracam pustą tablicę");
            return [];
        }
        if (sortedCourses.length === 0) {
            console.log("⚠️ sortedCourses jest pusty - nie ma czego filtrować");
            return [];
        }
        console.log("🔄 Filtrowanie", sortedCourses.length, "szkoleń");
        console.log(
            "💰 Zakres ceny:",
            filters.priceRange.min,
            "-",
            filters.priceRange.max,
        );

        // Sprawdź ceny wszystkich kursów przed filtrowaniem
        sortedCourses.forEach((course, idx) => {
            console.log(
                `  Kurs ${idx + 1}: ${course.nazwa}, cena: ${course.cena}, aktywny: ${course.aktywne !== false}`,
            );
        });

        const filtered = sortedCourses.filter((course) => {
            // Filtrowanie według ceny
            const coursePrice = course.cena || 0;
            if (
                coursePrice < filters.priceRange.min ||
                coursePrice > filters.priceRange.max
            ) {
                console.log(
                    `❌ Kurs "${course.nazwa}" odfiltrowany - cena ${coursePrice} poza zakresem ${filters.priceRange.min}-${filters.priceRange.max}`,
                );
                return false;
            }
            // Filtrowanie aktywnych szkoleń
            if (course.aktywne === false) {
                console.log(
                    `❌ Kurs "${course.nazwa}" odfiltrowany - nieaktywny`,
                );
                return false;
            }
            console.log(`✅ Kurs "${course.nazwa}" przeszedł filtry`);
            return true;
        });
        console.log(
            "✅ Po filtrowaniu zostało",
            filtered.length,
            "szkoleń z",
            sortedCourses.length,
        );
        return filtered;
    }, [sortedCourses, filters, isCoursesPage]);

    // Filtruj produkty według kategorii i wszystkich filtrów - memoized
    const filteredProducts = useMemo(() => {
        if (isCoursesPage) return [];
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
        isCoursesPage,
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
    const itemsToDisplay = isCoursesPage ? filteredCourses : filteredProducts;
    const totalItems = Array.isArray(itemsToDisplay)
        ? itemsToDisplay.length
        : 0;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayedItems = useMemo(() => {
        const items = Array.isArray(itemsToDisplay)
            ? itemsToDisplay.slice(startIndex, endIndex)
            : [];
        console.log(
            "📄 Paginacja - wyświetlam",
            items.length,
            "z",
            totalItems,
            "elementów (strona",
            currentPage,
            ")",
        );
        return items;
    }, [itemsToDisplay, startIndex, endIndex, totalItems, currentPage]);
    const totalPages = Math.ceil(totalItems / productsPerPage);

    // Debug log
    useEffect(() => {
        if (isCoursesPage) {
            console.log("🔍 DEBUG SZKOLENIA:");
            console.log("  allCourses:", allCourses.length);
            console.log("  sortedCourses:", sortedCourses.length);
            console.log("  filteredCourses:", filteredCourses.length);
            console.log("  itemsToDisplay:", itemsToDisplay.length);
            console.log("  displayedItems:", displayedItems.length);
            console.log("  filters.priceRange:", filters.priceRange);
        }
    }, [
        isCoursesPage,
        allCourses.length,
        sortedCourses.length,
        filteredCourses.length,
        itemsToDisplay.length,
        displayedItems.length,
        filters,
    ]);

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
        <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                    <span>&gt;</span>
                    <span className="text-gray-900">{selectedCategory}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">{selectedCategory}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Wyświetlanie {startIndex + 1}-{Math.min(endIndex, totalItems)} z {totalItems} {isCoursesPage ? "szkoleń" : "produktów"}
                        </span>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Sortuj:</label>
                            <select value={sortBy} onChange={handleSortChange} className="rounded-lg border border-[rgba(212,196,176,0.5)] bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#D2B79B]">
                                <option>Najpopularniejsze</option>
                                <option>Cena: od najniższej</option>
                                <option>Cena: od najwyższej</option>
                                <option>Najnowsze</option>
                                <option>Ocena</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <FiltersSidebar category={urlCategory} products={allProducts} filters={filters} onFiltersChange={setFilters} />
                    <div className="flex-1 min-w-0">
                        {isCoursesPage && process.env.NODE_ENV === "development" && (
                            <div className="p-4 mb-5 rounded-lg bg-gray-100 text-xs text-gray-600">
                                <p><strong>Debug:</strong> isCoursesPage: {String(isCoursesPage)}, allCourses: {allCourses.length}, filtered: {filteredCourses.length}, displayed: {displayedItems.length}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {isCoursesPage ? (
                                displayedItems.length > 0 ? (
                                    displayedItems.map((course, index) => (
                                        <CourseElement
                                            key={course.slug || index}
                                            course={course as Courses}
                                            index={index}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-lg mb-2">Brak szkoleń do wyświetlenia</p>
                                        <p className="text-sm text-gray-500">allCourses: {allCourses.length}, filtered: {filteredCourses.length}</p>
                                    </div>
                                )
                            ) : (
                                displayedItems.map((product, index) => (
                                    <ProductElement
                                        index={index}
                                        key={index}
                                        product={product as Products}
                                    />
                                ))
                            )}
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
