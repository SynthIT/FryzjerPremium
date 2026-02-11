"use client";

import { useState, useEffect, useMemo } from "react";
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
                case "Najpopularniejsze":
                default:
                    return (b.ocena || 0) - (a.ocena || 0);
            }
        });
    }, [allCourses, sortBy]);

    // Paginacja
    const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const displayedCourses = sortedCourses.slice(startIndex, endIndex);

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Ładowanie szkoleń...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="products-page-container" style={{ paddingTop: "140px" }}>
                <div className="products-page-content">
                    <div className="products-header-section">
                        <h1 className="products-page-title">Szkolenia</h1>
                        <p className="products-page-subtitle">
                            Odkryj nasze profesjonalne szkolenia z zakresu fryzjerstwa
                        </p>
                    </div>

                    {/* Sortowanie */}
                    <div className="products-sorting-section">
                        <label htmlFor="sort-select" className="sort-label">
                            Sortuj według:
                        </label>
                        <select
                            id="sort-select"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="sort-select">
                            <option value="Najpopularniejsze">Najpopularniejsze</option>
                            <option value="Cena: od najniższej">Cena: od najniższej</option>
                            <option value="Cena: od najwyższej">Cena: od najwyższej</option>
                            <option value="Ocena">Ocena</option>
                        </select>
                    </div>

                    {/* Courses Grid */}
                    <div className="products-main-content">
                        <div className="products-grid-listing">
                            {displayedCourses.length === 0 ? (
                                <div className="no-products-message">
                                    <p>Brak dostępnych szkoleń</p>
                                </div>
                            ) : (
                                displayedCourses.map((course, index) => (
                                    <CourseElement
                                        key={course.slug || index}
                                        course={course}
                                        index={index}
                                    />
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="pagination-button pagination-button-prev">
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
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`pagination-number ${
                                                        currentPage === page ? "pagination-number-active" : ""
                                                    }`}>
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page}>...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="pagination-button pagination-button-next">
                                    Następna
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
