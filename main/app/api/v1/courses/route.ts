import { Courses } from "@/lib/types/coursesTypes.";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { collectCourses } from "@/lib/crud/courses/course";
import { returnAvailableCourseWariant } from "@/lib/admin_utils";

export async function GET(req: NextRequest) {
    try {
        // Pobierz slug z query params
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        // Pobierz kursy z bazy danych
        console.log("📥 Pobieranie kursów z bazy danych...");
        let coursesData: string;
        try {
            coursesData = await collectCourses();
            console.log("📦 Otrzymane dane z collectCourses (długość):", coursesData?.length || 0);
            console.log("📦 Pierwsze 200 znaków:", coursesData?.substring(0, 200));
        } catch (error) {
            console.error("❌ Błąd w collectCourses:", error);
            coursesData = "[]";
        }
        
        let courses: Courses[] = [];
        try {
            courses = JSON.parse(coursesData);
            console.log("✅ Sparsowano kursy:", courses.length);
        } catch (error) {
            console.error("❌ Błąd parsowania JSON:", error);
            courses = [];
        }

        // Jeśli jest slug, zwróć pojedynczy kurs
        if (slug) {
            console.log("Szukam kursu dla slug:", slug);
            console.log("Dostępne kursy:", courses.length);
            console.log("Slugi kursów:", courses.map(c => c.slug));
            
            const course: Courses | undefined = courses.find((c) => {
                return c.slug === slug;
            });
            
            if (!course) {
                console.error("Kurs nie znaleziony dla slug:", slug);
                console.error("Dostępne slugi:", courses.map(c => c.slug));
                return NextResponse.json(
                    { status: 1, error: "Kurs nie znaleziony" },
                    { status: 404 }
                );
            }

            // Filtruj warianty (jeśli będą potrzebne permisje w przyszłości)
            const { course: filteredCourse } = returnAvailableCourseWariant(req, course);
            
            const response = {
                status: 0,
                course: filteredCourse,
            };
            console.log("✅ Zwracam kurs:", filteredCourse.nazwa);
            return NextResponse.json(response);
        }

        // Zapisz do pliku cache (opcjonalnie)
        const filePath = path.join(process.cwd(), "data", "kursy.json");
        try {
            writeFileSync(filePath, JSON.stringify(courses, null, 2), "utf8");
        } catch (error) {
            console.error("Błąd podczas zapisywania cache:", error);
        }

        const activeCourses = courses.filter((c) => c.aktywne !== false);
        console.log("📊 Zwracam kursy - łącznie:", courses.length, "aktywnych:", activeCourses.length);
        console.log("📋 Slugi aktywnych kursów:", activeCourses.map(c => c.slug));
        
        const response = {
            status: 200,
            courses: activeCourses,
        };
        console.log("✅ Zwracam response z", activeCourses.length, "kursami");
        return NextResponse.json(response);
    } catch (error) {
        console.error("Błąd podczas pobierania kursów:", error);
        // Fallback do pliku cache jeśli baza nie działa
        try {
            const filePath = path.join(process.cwd(), "data", "kursy.json");
            const file = readFileSync(filePath, "utf8");
            const courses: Courses[] = JSON.parse(file);
            return NextResponse.json({
                status: 200,
                courses: courses.filter((c) => c.aktywne !== false),
            });
        } catch (cacheError) {
            return NextResponse.json(
                { status: 1, error: "Błąd podczas pobierania kursów" },
                { status: 500 }
            );
        }
    }
}
