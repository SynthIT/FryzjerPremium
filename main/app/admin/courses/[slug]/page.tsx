"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Courses } from "@/lib/types/coursesTypes";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import CourseEditModal from "@/components/admin/CourseEditModal";

export default function AdminCourseEditPage() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params.slug === "string" ? params.slug : "";
    const [course, setCourse] = useState<Courses | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!slug) {
                setError("Brak slug");
                setLoading(false);
                return;
            }
            try {
                const res = await fetch("/admin/api/v1/courses", { credentials: "include" });
                if (!res.ok) {
                    setError("Błąd autoryzacji");
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                const raw = data.courses;
                const list: Courses[] = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
                const found = list.find((c) => c.slug === slug);
                if (found) setCourse(found);
                else setError("Kurs nie znaleziony");
            } catch (e) {
                setError("Błąd ładowania kursu");
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);

    const handleUpdate = (_updatedCourse: Courses) => router.push("/admin/courses");
    const handleDelete = (_courseSlug: string) => router.push("/admin/courses");

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Ładowanie kursu...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="space-y-4">
                <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Powrót do listy
                </Link>
                <div className="rounded-lg border p-6 text-center">
                    <p className="text-destructive">{error || "Kurs nie znaleziony"}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Lista szkoleń
                </Link>
            </div>
            <CourseEditModal
                course={course}
                isOpen={true}
                onClose={() => router.push("/admin/courses")}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </>
    );
}
