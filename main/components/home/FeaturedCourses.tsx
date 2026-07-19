"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCourses } from "@/lib/utils";
import { Courses } from "@/lib/types/coursesTypes";
import CourseCard from "@/components/kursy/CourseCard";

function parseCoursesPayload(payload: unknown): Courses[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as Courses[];
    if (typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

export default function FeaturedCourses() {
    const [courses, setCourses] = useState<Courses[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await getCourses();
                const list = parseCoursesPayload(data?.courses)
                    .filter((c) => c.aktywne !== false)
                    .sort((a, b) => (b.ocena ?? 0) - (a.ocena ?? 0))
                    .slice(0, 4);
                if (!cancelled) setCourses(list);
            } catch {
                if (!cancelled) setCourses([]);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8" id="featured-courses-section">
            <div className="max-w-[1400px] mx-auto">
                <h2 className="text-3xl font-bold text-black mb-10 pb-3 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-14 after:h-0.5 after:bg-[#D2B79B] after:rounded">
                    Kursy i szkolenia
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses?.map((course, index) => (
                        <CourseCard key={course.slug ?? index} course={course} index={index} />
                    ))}
                </div>
                {!courses?.length && (
                    <div className="text-center py-8 text-gray-600">
                        Brak kursów do wyświetlenia.
                    </div>
                )}
                <div className="mt-8 text-center">
                    <Link
                        href="/kursy"
                        className="inline-block px-8 py-3 rounded-xl font-semibold text-black bg-[#D2B79B] hover:bg-[#b89a7f] transition-colors"
                    >
                        Pokaż więcej kursów
                    </Link>
                </div>
            </div>
        </section>
    );
}
