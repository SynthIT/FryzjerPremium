import mongoose, { Types } from "mongoose";
import { Course, Firma } from "../lib/models/Courses";
import { Category } from "../lib/models/shared";

async function createExampleCourse() {
    try {
        // Połącz z bazą danych
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
        console.log("Połączono z bazą danych");

        // Sprawdź czy istnieje firma, jeśli nie - utwórz przykładową
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
            console.log("Firma utworzona:", firma.nazwa);
        } else {
            console.log("Używam istniejącej firmy:", firma.nazwa);
        }

        // Pobierz kategorie (użyj pierwszej dostępnej kategorii)
        const category = await Category.findOne();
        if (!category) {
            console.error("Brak kategorii w bazie danych! Utwórz najpierw kategorię.");
            await mongoose.connection.close();
            return;
        }
        console.log("Używam kategorii:", category.nazwa);

        // Sprawdź czy szkolenie już istnieje
        const existingCourse = await Course.findOne({ slug: "kompleksowy-kurs-strzyzenia-meskiego" });
        if (existingCourse) {
            console.log("Szkolenie już istnieje! Usuwam stare...");
            await Course.deleteOne({ slug: "kompleksowy-kurs-strzyzenia-meskiego" });
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
                    alt: "Kompleksowy kurs strzyżenia męskiego - główne zdjęcie",
                    path: "/images/courses/strzyzenie-meskie-main.jpg"
                },
                {
                    nazwa: "kurs-strzyzenia-1",
                    slug: "kurs-strzyzenia-1",
                    typ: "image" as const,
                    alt: "Techniki strzyżenia - zdjęcie 1",
                    path: "/images/courses/strzyzenie-meskie-1.jpg"
                },
                {
                    nazwa: "kurs-strzyzenia-2",
                    slug: "kurs-strzyzenia-2",
                    typ: "image" as const,
                    alt: "Techniki strzyżenia - zdjęcie 2",
                    path: "/images/courses/strzyzenie-meskie-2.jpg"
                }
            ],
            promocje: null,
            opis: `Zapraszamy na kompleksowy kurs strzyżenia męskiego, który nauczy Cię profesjonalnych technik pracy z męskimi fryzurami. 

W trakcie kursu poznasz:
• Podstawowe i zaawansowane techniki strzyżenia
• Pracę z różnymi typami włosów (proste, kręcone, cienkie, grube)
• Stylizację i modelowanie włosów
• Używanie profesjonalnych narzędzi fryzjerskich
• Komunikację z klientem i doradztwo stylistyczne
• Najnowsze trendy w męskim fryzjerstwie

Kurs składa się z części teoretycznej oraz praktycznej, gdzie będziesz mógł ćwiczyć na modelach pod okiem doświadczonych instruktorów. Po ukończeniu kursu otrzymasz certyfikat potwierdzający zdobyte umiejętności.

Materiały szkoleniowe:
• Podręcznik z technikami strzyżenia
• Wideo instruktażowe
• Dostęp do zamkniętej grupy na Facebooku
• Możliwość konsultacji z instruktorami po zakończeniu kursu`,
            ocena: 4.8,
            opinie: [
                {
                    uzytkownik: "Jan Kowalski",
                    tresc: "Świetny kurs! Nauczyłem się wielu przydatnych technik. Instruktorzy są bardzo pomocni i cierpliwi.",
                    ocena: 5,
                    zweryfikowane: true,
                    createdAt: new Date()
                },
                {
                    uzytkownik: "Piotr Nowak",
                    tresc: "Bardzo profesjonalne podejście. Materiały są przejrzyste, a praktyczne ćwiczenia pomagają w nauce.",
                    ocena: 5,
                    zweryfikowane: true,
                    createdAt: new Date()
                },
                {
                    uzytkownik: "Marek Wiśniewski",
                    tresc: "Kurs wart swojej ceny. Polecam każdemu, kto chce rozwijać się w fryzjerstwie męskim.",
                    ocena: 4,
                    zweryfikowane: true,
                    createdAt: new Date()
                }
            ],
            vat: 23,
            sku: null,
            aktywne: true,
            // Pola specyficzne dla szkoleń
            czasTrwania: "10 godzin",
            poziom: "wszystkie",
            liczbaLekcji: 24,
            instruktor: "Michał Kowalczyk",
            jezyk: "polski",
            certyfikat: true,
            krotkiOpis: "Naucz się profesjonalnych technik strzyżenia męskiego od podstaw do zaawansowanych stylizacji"
        };

        const course = await Course.create(exampleCourse);
        console.log("\n✅ Przykładowe szkolenie zostało utworzone!");
        console.log("📚 Nazwa:", course.nazwa);
        console.log("💰 Cena:", course.cena, "zł");
        console.log("⏱️  Czas trwania:", course.czasTrwania);
        console.log("📖 Liczba lekcji:", course.liczbaLekcji);
        console.log("👨‍🏫 Instruktor:", course.instruktor);
        console.log("🏢 Firma:", firma.nazwa);
        console.log("🔗 Slug:", course.slug);
        console.log("\nMożesz teraz zobaczyć szkolenie w panelu admina: /admin/courses");
        console.log("Lub na stronie sklepu: /courses/" + course.slug);

        await mongoose.connection.close();
        console.log("\nPołączenie z bazą danych zamknięte.");
    } catch (error) {
        console.error("Błąd podczas tworzenia szkolenia:", error);
        await mongoose.connection.close().catch(() => {});
        process.exit(1);
    }
}

// Uruchom skrypt
createExampleCourse();
