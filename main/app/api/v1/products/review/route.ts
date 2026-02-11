import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/lib/models/Products";
import { Opinie } from "@/lib/types/shared";
import { Products } from "@/lib/types/productTypes";
import mongoose from "mongoose";
import path from "path";
import { readFileSync, writeFileSync } from "fs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productSlug, review } = body;

        if (!productSlug || !review) {
            return NextResponse.json(
                { status: 400, error: "Brak wymaganych danych" },
                { status: 400 }
            );
        }

        if (!review.ocena || !review.uzytkownik || !review.tresc) {
            return NextResponse.json(
                { status: 400, error: "Wszystkie pola są wymagane" },
                { status: 400 }
            );
        }

        // Połącz z bazą danych
        await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");

        // Znajdź produkt po slug
        const product = await Product.findOne({ slug: productSlug });

        if (!product) {
            await mongoose.connection.close();
            return NextResponse.json(
                { status: 404, error: "Produkt nie został znaleziony" },
                { status: 404 }
            );
        }

        // Utwórz nową opinię
        const newReview: Opinie = {
            uzytkownik: review.uzytkownik,
            tresc: review.tresc,
            ocena: review.ocena,
            zweryfikowane: false,
            createdAt: new Date(),
        };

        // Dodaj opinię do produktu
        if (!product.opinie) {
            product.opinie = [];
        }
        product.opinie.push(newReview);

        // Oblicz nową średnią ocenę
        const totalRating = product.opinie.reduce(
            (sum: number, r: Opinie) => sum + r.ocena,
            0
        );
        product.ocena = totalRating / product.opinie.length;

        // Zapisz produkt w bazie danych
        await product.save();

        // Zaktualizuj też plik JSON, żeby opinie były widoczne na stronie
        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);
        const productIndex = products.findIndex((p) => p.slug === productSlug);
        
        if (productIndex !== -1) {
            products[productIndex].opinie = product.opinie;
            products[productIndex].ocena = product.ocena;
            writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
        }

        await mongoose.connection.close();

        return NextResponse.json(
            { status: 201, message: "Opinia została dodana", product },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding review:", error);
        await mongoose.connection.close().catch(() => {});
        return NextResponse.json(
            { status: 500, error: "Wystąpił błąd podczas dodawania opinii" },
            { status: 500 }
        );
    }
}
