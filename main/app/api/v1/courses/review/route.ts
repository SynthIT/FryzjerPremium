import { NextRequest, NextResponse } from "next/server";
import { updateCourseOpinie } from "@/lib/crud/courses/course";

export async function PUT(req: NextRequest) {
    try {
        const { slug, opinia } = await req.json();
        if (!slug || !opinia) {
            return NextResponse.json({ status: 1, error: "Brak wymaganych danych" }, { status: 400 });
        }
        const course = await updateCourseOpinie(slug, opinia);
        if (!course) {
            return NextResponse.json({ status: 1, error: "Kurs nie znaleziony" }, { status: 404 });
        }
        return NextResponse.json({ status: 0, course: JSON.stringify(course) });
    } catch (error) {
        console.error("Błąd podczas aktualizacji opinii:", error);
        return NextResponse.json({ status: 1, error: "Błąd podczas aktualizacji opinii" }, { status: 500 });
    }
}