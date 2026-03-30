import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
import { zodProducts, Products } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import { Types } from "mongoose";

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
    const raw = { ...productData };
    if (Array.isArray(raw.kategoria)) {
        raw.kategoria = raw.kategoria.map((k) =>
            typeof k === "string" ? k : (k as Categories)._id ?? ""
        ).filter(Boolean) as unknown as Products["kategoria"];
    }
    if (raw.producent !== undefined && raw.producent !== null) {
        raw.producent = (typeof raw.producent === "object" && raw.producent !== null && "_id" in raw.producent
            ? (raw.producent as { _id: string })._id
            : raw.producent) as unknown as Products["producent"];
    }
    if (raw.promocje !== undefined && raw.promocje !== null) {
        const p = raw.promocje;
        raw.promocje = (typeof p === "object" && p !== null && "_id" in p
            ? (p as { _id: string })._id
            : p) as unknown as Products["promocje"];
    }
    const ok = zodProducts.safeParse(raw);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    try {
        await db();
        const createPayload = { ...ok.data };
        (createPayload as Record<string, unknown>).kategoria = (ok.data.kategoria as string[]).map((id) => new Types.ObjectId(id));
        (createPayload as Record<string, unknown>).producent = new Types.ObjectId(ok.data.producent as string);
        if (ok.data.promocje) {
            (createPayload as Record<string, unknown>).promocje = new Types.ObjectId(ok.data.promocje as string);
        }
        const prod = await Product.create(createPayload);
        return prod;
    } catch (e) {
        return { error: `${e}` };
    }
}

export async function deleteProductById(id: string): Promise<Products | { error: string }> {
    await db();
    const prod = await Product.findOneAndDelete({ _id: id }).orFail();
    return prod;
}

export async function updateProduct(productData: Products): Promise<Products | { error: string }> {
    const raw = { ...productData };
    // Normalizuj referencje do _id (backend przyjmuje string lub obiekt)
    if (Array.isArray(raw.kategoria)) {
        raw.kategoria = raw.kategoria.map((k) =>
            typeof k === "string" ? k : (k as Categories)._id ?? ""
        ).filter(Boolean) as unknown as Products["kategoria"];
    }
    if (raw.producent !== undefined && raw.producent !== null) {
        raw.producent = (typeof raw.producent === "object" && raw.producent !== null && "_id" in raw.producent
            ? (raw.producent as { _id: string })._id
            : raw.producent) as unknown as Products["producent"];
    }
    if (raw.promocje !== undefined && raw.promocje !== null) {
        const p = raw.promocje;
        raw.promocje = (typeof p === "object" && p !== null && "_id" in p
            ? (p as { _id: string })._id
            : p) as unknown as Products["promocje"];
    }
    const produkt = zodProducts.safeParse(raw);
    if (produkt.error) return { error: produkt.error.message };
    await db();
    const updatePayload: Record<string, unknown> = { ...produkt.data };
    updatePayload.kategoria = (produkt.data.kategoria as string[]).map((id) => new Types.ObjectId(id));
    updatePayload.producent = new Types.ObjectId(produkt.data.producent as string);
    if (produkt.data.promocje) {
        updatePayload.promocje = new Types.ObjectId(produkt.data.promocje as string);
    } else {
        updatePayload.promocje = null;
    }
    const prod = await Product.findOneAndUpdate(
        { slug: produkt.data.slug },
        { $set: updatePayload },
        { new: true },
    );
    if (!prod) {
        return { error: "Produkt nie znaleziony w bazie danych" };
    }
    return prod;
}
