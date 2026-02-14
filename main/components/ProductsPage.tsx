"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "@/app/globals.css";
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
                            : new Date(a.createdAt).getTime();
                    const dateB =
                        b.createdAt instanceof Date
                            ? b.createdAt.getTime()
                            : new Date(b.createdAt).getTime();
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
        <div className="products-listing-page">
            <div className="products-listing-container">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link href="/" className="breadcrumb-link">
                        Strona główna
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <span className="breadcrumb-current">
                        {selectedCategory}
                    </span>
                </div>

                {/* Page Header */}
                <div className="products-page-header">
                    <h1 className="products-page-title">{selectedCategory}</h1>
                    <div className="products-page-info">
                        <span className="products-count">
                            Wyświetlanie {startIndex + 1}-
                            {Math.min(endIndex, totalItems)} z {totalItems}{" "}
                            {isCoursesPage ? "szkoleń" : "produktów"}
                        </span>
                        <div className="sort-dropdown-wrapper">
                            <label className="sort-label">Sortuj według:</label>
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="sort-dropdown">
                                <option>Najpopularniejsze</option>
                                <option>Cena: od najniższej</option>
                                <option>Cena: od najwyższej</option>
                                <option>Najnowsze</option>
                                <option>Ocena</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="products-listing-content">
                    {/* Sidebar with Filters */}
                    <FiltersSidebar
                        category={urlCategory}
                        products={allProducts}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />

                    {/* Products/Courses Grid */}
                    <div className="products-main-content">
                        {isCoursesPage && (
                            <div
                                style={{
                                    padding: "20px",
                                    background: "#f0f0f0",
                                    marginBottom: "20px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}>
                                <p>
                                    <strong>Debug info:</strong>
                                </p>
                                <p>
                                    isCoursesPage:{" "}
                                    {isCoursesPage ? "true" : "false"}
                                </p>
                                <p>allCourses.length: {allCourses.length}</p>
                                <p>
                                    filteredCourses.length:{" "}
                                    {filteredCourses.length}
                                </p>
                                <p>
                                    displayedItems.length:{" "}
                                    {displayedItems.length}
                                </p>
                                <p>totalItems: {totalItems}</p>
                            </div>
                        )}
                        <div className="products-grid-listing">
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
                                    <div
                                        style={{
                                            padding: "40px",
                                            textAlign: "center",
                                            gridColumn: "1 / -1",
                                        }}>
                                        <p
                                            style={{
                                                fontSize: "18px",
                                                marginBottom: "10px",
                                            }}>
                                            Brak szkoleń do wyświetlenia
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#666",
                                            }}>
                                            allCourses: {allCourses.length}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#666",
                                            }}>
                                            filteredCourses:{" "}
                                            {filteredCourses.length}
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#666",
                                            }}>
                                            sortedCourses:{" "}
                                            {sortedCourses.length}
                                        </p>
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
                            <div className="pagination">
                                <button
                                    className="pagination-button"
                                    disabled={currentPage === 1}
                                    onClick={handlePrevPage}>
                                    ← Poprzednia
                                </button>
                                <div className="pagination-numbers">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => {
                                            const pageNum = i + 1;
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= currentPage - 1 &&
                                                    pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        className={`pagination-number ${
                                                            currentPage ===
                                                            pageNum
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum,
                                                            )
                                                        }>
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                pageNum === currentPage - 2 ||
                                                pageNum === currentPage + 2
                                            ) {
                                                return (
                                                    <span
                                                        key={pageNum}
                                                        className="pagination-ellipsis">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        },
                                    )}
                                </div>
                                <button
                                    className="pagination-button"
                                    disabled={currentPage === totalPages}
                                    onClick={handleNextPage}>
                                    Następna →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
