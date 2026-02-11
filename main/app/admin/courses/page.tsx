"use client";

import { useState, useEffect, useMemo } from "react";
import { Courses } from "@/lib/types/coursesTypes.";
import AdminCourseCard from "@/components/admin/AdminCourseCard";
import CourseEditModal from "@/components/admin/CourseEditModal";
import Link from "next/link";

export default function CoursesPage() {
    const [courses, setCourses] = useState<Courses[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<Courses | null>(
        null
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const coursesPerPage = 12;

    useEffect(() => {
        async function fetchCourses() {
            try {
                setLoading(true);
                const res = await fetch("/admin/api/v1/courses", {
                    credentials: "include",
                });
                if (!res.ok) {
                    console.error("Błąd autoryzacji:", res.status, res.statusText);
                    const errorData = await res.json().catch(() => ({}));
                    console.error("Szczegóły błędu:", errorData);
                    setCourses([]);
                    return;
                }
                const data = await res.json();
                console.log("Otrzymane dane z API:", data);
                console.log("Liczba kursów:", Array.isArray(data) ? data.length : 0);
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Błąd podczas ładowania kursów:", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    // Filtrowanie i paginacja
    const filteredCourses = useMemo(() => {
        if (!Array.isArray(courses)) return [];
        if (!searchQuery) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter((course) => {
            const nazwa = course.nazwa?.toLowerCase() || "";
            const opis = course.opis?.toLowerCase() || "";
            const sku = course.sku?.toLowerCase() || "";
            return (
                nazwa.includes(query) ||
                opis.includes(query) ||
                sku.includes(query)
            );
        });
    }, [courses, searchQuery]);

    const totalPages = Math.ceil((Array.isArray(filteredCourses) ? filteredCourses.length : 0) / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const displayedCourses = Array.isArray(filteredCourses) ? filteredCourses.slice(startIndex, endIndex) : [];

    const handleCourseClick = (course: Courses) => {
        setSelectedCourse(course);
        setIsEditModalOpen(true);
    };

    const handleCourseUpdate = async (updatedCourse: Courses) => {
        try {
            const res = await fetch("/admin/api/v1/courses", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(Array.isArray(data) ? data : []);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania kursów:", error);
            setCourses((prev) =>
                prev.map((c) =>
                    c.slug === updatedCourse.slug ? updatedCourse : c
                )
            );
        }
        setIsEditModalOpen(false);
        setSelectedCourse(null);
    };

    const handleCourseDelete = async (courseSlug: string) => {
        try {
            const res = await fetch("/admin/api/v1/courses", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(Array.isArray(data) ? data : []);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania kursów:", error);
            setCourses((prev) => prev.filter((c) => c.slug !== courseSlug));
        }
        setIsEditModalOpen(false);
        setSelectedCourse(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie kursów...
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
                        Szkolenia
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj szkolenia.
                    </p>
                </div>
                <Link
                    href="/admin/courses/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj szkolenie
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj szkoleń..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredCourses.length} szkoleń
                </div>
            </div>

            {/* Courses Grid */}
            {displayedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">📚</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery
                                    ? "Nie znaleziono szkoleń"
                                    : "Brak szkoleń"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwsze szkolenie, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedCourses.map((course) => (
                            <AdminCourseCard
                                key={course.slug}
                                course={course}
                                onClick={() => handleCourseClick(course)}
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
            {selectedCourse && (
                <CourseEditModal
                    course={selectedCourse}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedCourse(null);
                    }}
                    onUpdate={handleCourseUpdate}
                    onDelete={handleCourseDelete}
                />
            )}
        </div>
    );
}
