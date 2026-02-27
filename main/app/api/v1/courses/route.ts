import { Courses } from "@/lib/types/coursesTypes";
import path from "path";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { collectCourses } from "@/lib/crud/courses/course";

export async function GET(req: NextRequest) {
    try {
        // Pobierz slug z query params
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        // const file = readFileSync(
        //     path.join(process.cwd(), "data", "kursy.json"),
        //     "utf8",
        // );
        if (slug) {
            const courses = JSON.parse(await collectCourses());
            const course = courses.find((c: Courses) => c.slug === slug);
            return NextResponse.json({
                status: 0,
                course: JSON.stringify(course),
            });
        } else {
            const courses: Courses[] = JSON.parse(await collectCourses());
            return NextResponse.json({
                status: 0,
                courses: JSON.stringify(courses.filter((c) => c.aktywne !== false)),
            });
        }

    } catch (error) {
        console.error("Błąd podczas pobierania kursów:", error);
        // Fallback do pliku cache jeśli baza nie działa
        try {
            // const filePath = path.join(process.cwd(), "data", "kursy.json");
            // const file = readFileSync(filePath, "utf8");
            const courses: Courses[] = JSON.parse(await collectCourses());
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
