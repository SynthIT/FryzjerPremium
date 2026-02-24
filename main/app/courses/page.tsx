"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCourses } from "@/lib/utils";
import { Courses } from "@/lib/types/coursesTypes";
import CourseElement from "@/components/coursesComponents/CourseElement";

export default function CoursesPage() {
    const [allCourses, setAllCourses] = useState<Courses[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("Najpopularniejsze");
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 9;

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

    // Sortowanie szkoleń
    const sortedCourses = useMemo(() => {
        if (!Array.isArray(allCourses)) {
            return [];
        }
        return [...allCourses].sort((a, b) => {
            switch (sortBy) {
                case "Cena: od najniższej":
                    return a.cena - b.cena;
                case "Cena: od najwyższej":
                    return b.cena - a.cena;
                case "Ocena":
                    return (b.ocena || 0) - (a.ocena || 0);
                case "Najnowsze":
                    const dateA = a.createdAt instanceof Date
                        ? a.createdAt.getTime()
                        : new Date(a.createdAt || 0).getTime();
                    const dateB = b.createdAt instanceof Date
                        ? b.createdAt.getTime()
                        : new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                case "Najpopularniejsze":
                default:
                    return (b.ocena || 0) - (a.ocena || 0);
            }
        });
    }, [allCourses, sortBy]);

    // Paginacja
    const totalItems = sortedCourses.length;
    const totalPages = Math.ceil(totalItems / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const displayedCourses = sortedCourses.slice(startIndex, endIndex);

    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePrevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-8">
                            <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                            <span>&gt;</span>
                            <span className="text-gray-900">Szkolenia</span>
                        </div>
                        <div className="min-h-[500px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#D2B79B] mx-auto mb-6"></div>
                                <p style={{
                                    fontSize: "18px",
                                    color: "#6b7280",
                                    fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                    fontWeight: "500",
                                }}>
                                    Ładowanie szkoleń...
                                </p>
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
            <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-6">
                        <Link href="/" className="text-[#D2B79B] hover:underline">Strona główna</Link>
                        <span>&gt;</span>
                        <span className="text-gray-900">Szkolenia</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-black">Szkolenia</h1>
                            <p className="text-gray-600 mt-3 max-w-2xl">
                                Odkryj nasze profesjonalne szkolenia z zakresu fryzjerstwa. Rozwijaj swoje umiejętności z najlepszymi ekspertami w branży.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Wyświetlanie {startIndex + 1}-{Math.min(endIndex, totalItems)} z {totalItems} szkoleń
                            </span>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Sortuj:</label>
                                <select value={sortBy} onChange={handleSortChange} className="rounded-lg border border-[rgba(212,196,176,0.5)] bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#D2B79B]">
                                    <option value="Najpopularniejsze">Najpopularniejsze</option>
                                    <option value="Cena: od najniższej">Cena: od najniższej</option>
                                    <option value="Cena: od najwyższej">Cena: od najwyższej</option>
                                    <option value="Najnowsze">Najnowsze</option>
                                    <option value="Ocena">Ocena</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedCourses.length === 0 ? (
                                    <div className="col-span-full py-16 px-6 text-center rounded-2xl bg-gray-50 border border-[rgba(212,196,176,0.2)]">
                                        <div className="text-7xl mb-6 opacity-60">📚</div>
                                        <h3 className="text-2xl font-bold text-black mb-3">Brak dostępnych szkoleń</h3>
                                        <p className="text-gray-600 max-w-md mx-auto">Wkrótce dodamy nowe szkolenia. Sprawdź ponownie później.</p>
                                    </div>
                                ) : (
                                    displayedCourses.map((course, index) => (
                                        <div
                                            key={course.slug || index}
                                            style={{
                                                animation: `smoothFadeIn 0.6s ease-out both`,
                                                animationDelay: `${index * 0.1}s`,
                                            }}>
                                            <CourseElement
                                                course={course}
                                                index={index}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12 pt-10 border-t border-[rgba(212,196,176,0.2)] flex-wrap">
                                    <button type="button" onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                                        Poprzednia
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                                return (
                                                    <button key={page} type="button" onClick={() => handlePageChange(page)} className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${currentPage === page ? "bg-[#D2B79B] text-black border-[#D2B79B]" : "border-gray-300 hover:bg-gray-100"}`}>
                                                        {page}
                                                    </button>
                                                );
                                            }
                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="px-2">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button type="button" onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                                        Następna
                                    </button>
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
