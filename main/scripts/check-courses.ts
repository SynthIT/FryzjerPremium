import mongoose from "mongoose";
import { Course } from "../lib/models/Courses";

async function checkCourses() {
    try {
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
        console.log("✅ Połączono z bazą danych");

        const courses = await Course.find().lean();
        console.log(`\n📚 Znaleziono ${courses.length} szkoleń w bazie danych:\n`);

        if (courses.length === 0) {
            console.log("❌ Brak szkoleń w bazie danych!");
            console.log("💡 Uruchom: npm run create-example-course");
        } else {
            courses.forEach((course, index) => {
                console.log(`${index + 1}. ${course.nazwa}`);
                console.log(`   Slug: ${course.slug}`);
                console.log(`   Cena: ${course.cena} zł`);
                console.log(`   Aktywny: ${course.aktywne !== false ? "Tak" : "Nie"}`);
                console.log(`   Firma: ${typeof course.firma === "object" && course.firma ? (course.firma as any).nazwa : "Brak"}`);
                console.log("");
            });
        }

        await mongoose.connection.close();
        console.log("Połączenie zamknięte.");
    } catch (error) {
        console.error("❌ Błąd:", error);
        await mongoose.connection.close().catch(() => {});
        process.exit(1);
    }
}

checkCourses();
