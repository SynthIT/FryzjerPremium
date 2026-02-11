import {
    collectCourses,
    createCourse,
    deleteCourseBySlug,
    updateCourse,
} from "@/lib/crud/courses/course";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import { LogService } from "@/lib/log_service";

export async function GET(req: NextRequest) {
    const { val } = checkRequestAuth(req);
    if (!val) {
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji" },
            { status: 401 }
        );
    }
    
    try {
        const courses = await collectCourses();
        const parsedCourses = JSON.parse(courses);
        console.log("Pobrano kursów:", Array.isArray(parsedCourses) ? parsedCourses.length : 0);
        return NextResponse.json(Array.isArray(parsedCourses) ? parsedCourses : []);
    } catch (error) {
        console.error("Błąd podczas pobierania kursów:", error);
        // Zwróć pustą tablicę zamiast błędu, żeby strona się załadowała
        return NextResponse.json([], { status: 200 });
    }
}

export async function DELETE(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug kursu do usunięcia" },
            { status: 500 }
        );
    }
    try {
        const doc = await deleteCourseBySlug(slug);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kurs: ${doc?._id} - (${doc?.nazwa}) został usunięty`);
        return NextResponse.json({ status: 0, message: "Kurs usunięty" });
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania kursu" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const courseData = await req.json();
    console.log("Otrzymane dane kursu do aktualizacji:", courseData);
    try {
        const res = await updateCourse(courseData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kurs: ${res?._id} - (${res?.nazwa}) został zedytowany`);
        return NextResponse.json({
            status: 0,
            message: `Kurs (${res?.nazwa}) zaktualizowany`,
        });
    } catch (e) {
        console.log(e);
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji kursu" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { val, mess } = checkRequestAuth(req, ["admin:products"]);
    if (!val) {
        console.log(mess);
        return NextResponse.json(
            { status: 1, error: "Brak autoryzacji", details: mess },
            { status: 401 }
        );
    }
    const courseData = await req.json();
    try {
        const res = await createCourse(courseData);
        new LogService({
            path: req.url,
            kind: "log",
            position: "admin",
            http: req.method,
        }).log(`Kurs: ${res?._id} został dodany`);
        return NextResponse.json(
            { status: 201, error: "Kurs został dodany" },
            { status: 201 }
        );
    } catch (e) {
        new LogService({
            path: req.url,
            kind: "error",
            position: "admin",
            http: req.method,
        }).error(`${e}`);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas dodawania kursu" },
            { status: 500 }
        );
    }
}
