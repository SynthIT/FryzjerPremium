import { NextRequest, NextResponse } from "next/server";
import { collectCourses, createCourse } from "@/lib/crud/courses/course";
import { Course, Firma } from "@/lib/models/Courses";
import { Category } from "@/lib/models/shared";
import mongoose, { Types } from "mongoose";

export async function POST(req: NextRequest) {
    try {
        // Połącz z bazą danych
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
        
        // Sprawdź czy są szkolenia
        const existingCourses = await Course.find().lean();
        console.log("Istniejące szkolenia:", existingCourses.length);
        
        if (existingCourses.length > 0) {
            await mongoose.connection.close();
            return NextResponse.json({
                status: 0,
                message: `Już istnieje ${existingCourses.length} szkoleń w bazie`,
                courses: existingCourses.length
            });
        }
        
        // Sprawdź czy istnieje firma
        let firma = await Firma.findOne({ nazwa: "Akademia Fryzjerstwa Premium" });
        
        if (!firma) {
            console.log("Tworzenie przykładowej firmy...");
            firma = await Firma.create({
                nazwa: "Akademia Fryzjerstwa Premium",
                slug: "akademia-fryzjerstwa-premium",
                opis: "Profesjonalna akademia oferująca szkolenia z zakresu fryzjerstwa",
                strona_internetowa: "https://akademia-fryzjerstwa.pl",
                logo: {
                    nazwa: "logo-akademia",
                    slug: "logo-akademia",
                    typ: "image",
                    alt: "Logo Akademii Fryzjerstwa Premium",
                    path: "/images/logo-akademia.png"
                }
            });
        }
        
        // Pobierz pierwszą kategorię
        const category = await Category.findOne();
        if (!category) {
            await mongoose.connection.close();
            return NextResponse.json({
                status: 1,
                error: "Brak kategorii w bazie danych! Utwórz najpierw kategorię."
            }, { status: 400 });
        }
        
        // Utwórz przykładowe szkolenie
        const exampleCourse = {
            slug: "kompleksowy-kurs-strzyzenia-meskiego",
            nazwa: "Kompleksowy kurs strzyżenia męskiego",
            cena: 299.00,
            kategoria: [new Types.ObjectId(category._id)],
            firma: new Types.ObjectId(firma._id),
            media: [
                {
                    nazwa: "kurs-strzyzenia-main",
                    slug: "kurs-strzyzenia-main",
                    typ: "image" as const,
                    alt: "Kompleksowy kurs strzyżenia męskiego",
                    path: "/images/courses/strzyzenie-meskie-main.jpg"
                }
            ],
            promocje: null,
            opis: "Zapraszamy na kompleksowy kurs strzyżenia męskiego, który nauczy Cię profesjonalnych technik pracy z męskimi fryzurami. W trakcie kursu poznasz podstawowe i zaawansowane techniki strzyżenia, pracę z różnymi typami włosów, stylizację i modelowanie włosów oraz używanie profesjonalnych narzędzi fryzjerskich.",
            ocena: 4.8,
            opinie: [],
            vat: 23,
            sku: null,
            aktywne: true,
            czasTrwania: "10 godzin",
            poziom: "wszystkie",
            liczbaLekcji: 24,
            instruktor: "Michał Kowalczyk",
            jezyk: "polski",
            certyfikat: true,
            krotkiOpis: "Naucz się profesjonalnych technik strzyżenia męskiego od podstaw do zaawansowanych stylizacji"
        };
        
        const course = await Course.create(exampleCourse);
        await mongoose.connection.close();
        
        return NextResponse.json({
            status: 0,
            message: "Przykładowe szkolenie zostało utworzone!",
            course: {
                nazwa: course.nazwa,
                slug: course.slug
            }
        });
    } catch (error: any) {
        console.error("Błąd podczas inicjalizacji szkoleń:", error);
        await mongoose.connection.close().catch(() => {});
        return NextResponse.json({
            status: 1,
            error: error.message || "Błąd podczas tworzenia szkolenia"
        }, { status: 500 });
    }
}
