import { collectProducts } from "@/lib/admin_utils";
import { Products, productSchema } from "@/lib/models/Products";
import mongoose, { model, models } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const products = await collectProducts();
    return NextResponse.json(JSON.parse(products));
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json(
            { status: 1, error: "Brak slug produktu do usunięcia" },
            { status: 500 }
        );
    }
    // Usuwanie produktu z bazy danych
    try {
        // Załóżmy, że masz funkcję deleteProductBySlug do usuwania produktu
        await deleteProductBySlug(slug);
        return NextResponse.json({ status: 0, message: "Produkt usunięty" });
    } catch (e) {
        return NextResponse.json(
            { status: 1, error: "Błąd podczas usuwania produktu" },
            { status: 500 }
        );
    }
}
export async function PUT(req: NextRequest) {
    const productData = await req.json();
    console.log("Otrzymane dane produktu do aktualizacji:", productData);
    try {
        // Załóżmy, że masz funkcję updateProduct do aktualizacji produktu
        await updateProduct(productData);
        return NextResponse.json({
            status: 0,
            message: "Produkt zaktualizowany",
        });
    } catch (e) {
        console.error("Błąd podczas aktualizacji produktu:", e);
        return NextResponse.json(
            { status: 1, error: "Błąd podczas aktualizacji produktu" },
            { status: 500 }
        );
    }
}

async function deleteProductBySlug(slug: string) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const Product =
        models.Products ?? model<Products>("Products", productSchema);
    await Product.findOneAndDelete({ slug: slug });
    await mongoose.connection.close();
}
async function updateProduct(productData: Products) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const Product =
        models.Products ?? model<Products>("Products", productSchema);
    await Product.findOneAndUpdate({ slug: productData.slug }, productData, {
        new: true,
    });
    await mongoose.connection.close();}
