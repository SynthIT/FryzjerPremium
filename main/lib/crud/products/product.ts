import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
import { zodProducts, Products } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import { readFileSync, writeFileSync } from "fs";
import { Types } from "mongoose";
import path from "path";

export async function collectProducts() {
    await db();
    const products = await Product.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("producent")
        .lean();
    return JSON.stringify(products || []);
}

export async function createProduct(productData: Products): Promise<Products | { error: string }> {
    const ok = zodProducts.safeParse(productData);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    try {
        await db();
        const filePath = path.join(process.cwd(), "data", "produkty.json");
        const file = readFileSync(filePath, "utf8");
        const products: Products[] = JSON.parse(file);
        products.push(ok.data);
        writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
        const prod = await Product.create(ok.data);
        return prod;
    } catch (e) {
        return { error: `${e}` };
    }
}

export async function deleteProductBySlug(slug: string): Promise<Products | { error: string }> {
    await db();
    const filePath = path.join(process.cwd(), "data", "produkty.json");
    const file = readFileSync(filePath, "utf8");
    const products: Products[] = JSON.parse(file);
    const index = products.findIndex((p) => p.slug === slug);
    if (index === -1) {
        return { error: "Produkt nie znaleziony" };
    }
    products.splice(index, 1);
    writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
    const prod = await Product.findOneAndDelete({ slug: slug }).orFail();
    return prod;
}

export async function updateProduct(productData: Products): Promise<Products | { error: string }> {
    const produkt = zodProducts.safeParse(productData);
    if (produkt.error) return { error: produkt.error.message };
    const kategorie = produkt.data.kategoria;
    produkt.data.kategoria = [];
    for (const kategoria of kategorie) {
        produkt.data.kategoria.push(
            new Types.ObjectId((kategoria as Categories)._id),
        );
    }
    await db();
    const filePath = path.join(process.cwd(), "data", "produkty.json");
    const file = readFileSync(filePath, "utf8");
    const products: Products[] = JSON.parse(file);
    const index = products.findIndex((p) => p.slug === productData.slug);
    if (index === -1) {
        return { error: "Produkt nie znaleziony w pliku JSON" };
    }
    products[index] = produkt.data;
    writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
    const prod = await Product.findOneAndUpdate(
        { slug: produkt.data.slug },
        { $set: produkt.data },
        {
            new: true,
        },
    );
    if (!prod) {
        return { error: "Produkt nie znaleziony w bazie danych" };
    }
    return prod;
}
