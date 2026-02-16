"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import "@/app/globals.css";
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
                setAllCourses(data.courses || []);
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
                <div className="products-listing-page">
                    <div className="products-listing-container">
                        <div className="breadcrumbs" style={{ marginBottom: "32px" }}>
                            <Link href="/" className="breadcrumb-link">
                                Strona główna
                            </Link>
                            <span className="breadcrumb-separator">&gt;</span>
                            <span className="breadcrumb-current">
                                Szkolenia
                            </span>
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
            <div className="products-listing-page">
                <div className="products-listing-container">
                    {/* Breadcrumbs */}
                    <div className="breadcrumbs">
                        <Link href="/" className="breadcrumb-link">
                            Strona główna
                        </Link>
                        <span className="breadcrumb-separator">&gt;</span>
                        <span className="breadcrumb-current">
                            Szkolenia
                        </span>
                    </div>

                    {/* Page Header */}
                    <div className="products-page-header">
                        <div>
                            <h1 className="products-page-title">Szkolenia</h1>
                            <p style={{
                                fontSize: "18px",
                                color: "#6b7280",
                                marginTop: "12px",
                                fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                lineHeight: "1.6",
                                maxWidth: "800px",
                            }}>
                                Odkryj nasze profesjonalne szkolenia z zakresu fryzjerstwa. Rozwijaj swoje umiejętności z najlepszymi ekspertami w branży.
                            </p>
                        </div>
                        <div className="products-page-info">
                            <span className="products-count">
                                Wyświetlanie {startIndex + 1}-
                                {Math.min(endIndex, totalItems)} z {totalItems} szkoleń
                            </span>
                            <div className="sort-dropdown-wrapper">
                                <label className="sort-label">Sortuj według:</label>
                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="sort-dropdown">
                                    <option value="Najpopularniejsze">Najpopularniejsze</option>
                                    <option value="Cena: od najniższej">Cena: od najniższej</option>
                                    <option value="Cena: od najwyższej">Cena: od najwyższej</option>
                                    <option value="Najnowsze">Najnowsze</option>
                                    <option value="Ocena">Ocena</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="products-listing-content" style={{ gridTemplateColumns: "1fr" }}>
                        <div className="products-main-content">
                            <div className="products-grid-listing" style={{
                                animation: "fadeIn 0.6s ease-out",
                            }}>
                                {displayedCourses.length === 0 ? (
                                    <div className="courses-empty-state" style={{
                                        padding: "80px 20px",
                                        textAlign: "center",
                                        gridColumn: "1 / -1",
                                        background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                                        borderRadius: "16px",
                                        border: "1px solid rgba(212, 196, 176, 0.2)",
                                        marginTop: "20px",
                                    }}>
                                        <div style={{
                                            fontSize: "80px",
                                            marginBottom: "24px",
                                            opacity: 0.6,
                                            animation: "gentleScale 2s ease-in-out infinite",
                                        }}>📚</div>
                                        <h3 style={{
                                            fontSize: "28px",
                                            fontWeight: "700",
                                            color: "#000000",
                                            marginBottom: "12px",
                                            fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                        }}>
                                            Brak dostępnych szkoleń
                                        </h3>
                                        <p style={{
                                            fontSize: "16px",
                                            color: "#6b7280",
                                            fontFamily: "var(--font-dm-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                                            maxWidth: "500px",
                                            margin: "0 auto",
                                            lineHeight: "1.6",
                                        }}>
                                            Wkrótce dodamy nowe szkolenia. Sprawdź ponownie później.
                                        </p>
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
                                <div className="pagination" style={{
                                    marginTop: "60px",
                                    paddingTop: "40px",
                                    borderTop: "1px solid rgba(212, 196, 176, 0.2)",
                                }}>
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="pagination-button pagination-button-prev"
                                        style={{
                                            transition: "all 0.3s ease",
                                        }}>
                                        Poprzednia
                                    </button>
                                    <div className="pagination-numbers">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`pagination-number ${
                                                            currentPage === page ? "active" : ""
                                                        }`}
                                                        style={{
                                                            transition: "all 0.3s ease",
                                                        }}>
                                                        {page}
                                                    </button>
                                                );
                                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="pagination-ellipsis">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="pagination-button pagination-button-next"
                                        style={{
                                            transition: "all 0.3s ease",
                                        }}>
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
