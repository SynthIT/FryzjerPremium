"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCourses } from "@/lib/utils";
import { Courses } from "@/lib/types/coursesTypes";
import { Categories } from "@/lib/types/shared";
import CourseElement from "@/components/coursesComponents/CourseElement";
import CoursesFiltersSidebar, { CourseFiltersState } from "@/components/coursesComponents/CoursesFiltersSidebar";

function getCourseCategoryNames(course: Courses): string[] {
  const kats = course.kategoria;
  if (!kats || !Array.isArray(kats)) return [];
  return kats.map((c) => (typeof c === "string" ? c : (c as Categories).nazwa)).filter(Boolean);
}

function getCourseFirmaName(course: Courses): string | null {
  const firma = course.firma;
  if (!firma) return null;
  return typeof firma === "string" ? firma : (firma as { nazwa?: string }).nazwa ?? null;
}

export default function CoursesPage() {
    const [allCourses, setAllCourses] = useState<Courses[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("Najpopularniejsze");
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 9;

    const [filters, setFilters] = useState<CourseFiltersState>({
        priceRange: { min: 0, max: 5000 },
        selectedCategories: [],
        selectedCompanies: [],
    });
    const initialRangeSet = useRef(false);

    useEffect(() => {
        async function fetchCourses() {
            try {
                setLoading(true);
                const data = await getCourses();
                setAllCourses(JSON.parse(data.courses));
            } catch (error) {
                console.error("Błąd podczas ładowania szkoleń:", error);
                setAllCourses([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    useEffect(() => {
        if (allCourses.length === 0 || initialRangeSet.current) return;
        initialRangeSet.current = true;
        const prices = allCourses.map((c) => c.cena ?? 0).filter((p) => p >= 0);
        const minP = prices.length > 0 ? Math.min(...prices) : 0;
        const maxP = prices.length > 0 ? Math.max(...prices) : 5000;
        setFilters((f) => ({
            ...f,
            priceRange: { min: Math.floor(minP), max: Math.ceil(maxP) },
        }));
    }, [allCourses.length]);

    const sortedCourses = useMemo(() => {
        if (!Array.isArray(allCourses)) return [];
        return [...allCourses].sort((a, b) => {
            switch (sortBy) {
                case "Cena: od najniższej":
                    return a.cena - b.cena;
                case "Cena: od najwyższej":
                    return b.cena - a.cena;
                case "Ocena":
                    return (b.ocena || 0) - (a.ocena || 0);
                case "Najnowsze":
                    const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
                    const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                default:
                    return (b.ocena || 0) - (a.ocena || 0);
            }
        });
    }, [allCourses, sortBy]);

    const filteredCourses = useMemo(() => {
        return sortedCourses.filter((course) => {
            const price = course.cena ?? 0;
            if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
            if (filters.selectedCategories.length > 0) {
                const courseCats = getCourseCategoryNames(course);
                const matches = filters.selectedCategories.some((selected) =>
                    courseCats.some((n) => n.toLowerCase() === selected.toLowerCase())
                );
                if (!matches) return false;
            }
            if (filters.selectedCompanies.length > 0) {
                const firmaName = getCourseFirmaName(course);
                if (!firmaName) return false;
                const matches = filters.selectedCompanies.some((selected) =>
                    firmaName.toLowerCase() === selected.toLowerCase()
                );
                if (!matches) return false;
            }
            return true;
        });
    }, [sortedCourses, filters.priceRange.min, filters.priceRange.max, filters.selectedCategories, filters.selectedCompanies]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const totalItems = filteredCourses.length;
    const totalPages = Math.ceil(totalItems / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const displayedCourses = filteredCourses.slice(startIndex, endIndex);

    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
    const handlePrevPage = useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), []);
    const handleNextPage = useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-white pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
                            <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                            <span>&gt;</span>
                            <span className="text-gray-700">Szkolenia</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-5">Szkolenia</h1>
                        <div className="min-h-[500px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D2B79B] mx-auto mb-6" />
                                <p className="text-lg text-gray-500 font-medium">Ładowanie szkoleń...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white pt-[120px] mt-5 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900 bg-[#D2B79B1f] font-bold text-[15px] px-2 py-1 rounded-md">Szkolenia</span>
                    </div>
                    <div className="flex flex-row justify-between items-center gap-6 my-6 text-sm text-gray-600">
                        <h1 className="text-3xl font-bold text-gray-900">Szkolenia</h1>
                        <div className="flex flex-row items-center gap-2">
                            <span>Wyników: {startIndex + 1}-{Math.min(endIndex, totalItems)} z {totalItems} szkoleń.</span>
                            <span className="text-gray-400">Sortuj:</span>
                            <select value={sortBy} onChange={handleSortChange} className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-[#D2B79B] focus:ring-1 focus:ring-[#D2B79B] align-middle">
                                <option value="Najpopularniejsze">Najpopularniejsze</option>
                                <option value="Cena: od najniższej">Cena: od najniższej</option>
                                <option value="Cena: od najwyższej">Cena: od najwyższej</option>
                                <option value="Najnowsze">Najnowsze</option>
                                <option value="Ocena">Ocena</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-8">
                        <CoursesFiltersSidebar courses={allCourses} filters={filters} onFiltersChange={setFilters} />
                        <div className="flex-1 min-w-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {displayedCourses.length === 0 ? (
                                    <div className="col-span-full py-16 px-6 text-center rounded-2xl bg-gray-50 border border-gray-200">
                                        <div className="text-7xl mb-6 opacity-60">📚</div>
                                        <h3 className="text-2xl font-bold text-black mb-3">Brak dostępnych szkoleń</h3>
                                        <p className="text-gray-600 max-w-md mx-auto">Wkrótce dodamy nowe szkolenia lub zmień filtry.</p>
                                    </div>
                                ) : (
                                    displayedCourses.map((course, index) => (
                                        <CourseElement key={course.slug ?? index} course={course} index={index} />
                                    ))
                                )}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                                    <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors" disabled={currentPage === 1} onClick={handlePrevPage}>← Poprzednia</button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
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
            <Footer />
        </>
    );
}
