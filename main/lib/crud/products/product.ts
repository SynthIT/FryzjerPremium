import { db } from "@/lib/db/init";
import { Notifications } from "@/lib/models/Notifications";
import { Product } from "@/lib/models/Products";
import { notificationsType } from "@/lib/types/notificationsTypes";
import { zodProducts, Products, Warianty } from "@/lib/types/productTypes";
import { Categories } from "@/lib/types/shared";
import { Types } from "mongoose";
import {
    findVariantIndexBySlug,
    syncPrimaryVariantStock,
} from "@/lib/cart/stock";
import { normalizeProductPrices } from "@/lib/admin/pricing";
import { Analist } from "@/lib/types/analistTypes";
import { Analistics } from "@/lib/models/Analist";
import { analizeDataChanges } from "../analists/analists";

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
    const raw = syncPrimaryVariantStock(
        normalizeProductPrices({
            ...productData,
            ilosc: productData.ilosc ?? 0,
            wariant: productData.wariant ?? [],
        }),
    );

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
    const raw = syncPrimaryVariantStock(
        normalizeProductPrices({
            ...productData,
            ilosc: productData.ilosc ?? 0,
            wariant: productData.wariant ?? [],
        }),
    );
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
    const old_product: Products | null = await Product.findOne({ slug: produkt.data.slug }).lean();
    if (!old_product) return { error: "Produkt nie znaleziony w bazie danych" };
    await analizeDataChanges(produkt.data, old_product);
    const prod = await Product.findOneAndUpdate(
        { slug: produkt.data.slug },
        { $set: updatePayload },
        { returnDocument: "after" },
    );
    if (!prod) {
        return { error: "Produkt nie znaleziony w bazie danych" };
    }
    return prod;
}



async function notifyLowProductStock(product: Products, productId: string) {
    if (product.ilosc >= 5 || product.ilosc <= 1) return;
    await Product.findOneAndUpdate(
        { _id: productId },
        { $set: { aktywne: true, dostepnosc: "ograniczona" } },
        { returnDocument: "after" },
    );
    const payload: notificationsType = {
        nazwa: "Towar bliski wyprzedaży",
        typ: "Mały stan towary",
        tresc: `Produkt ${product.nazwa} jest bliski wyprzedaży`,
        link: `/admin/manage/products/${product.slug}`,
        czy_przeczytane: false,
        czy_aktywne: true,
    };
    await Notifications.create(payload);
}

async function notifyOutOfProductStock(product: Products, productId: string) {
    if (product.ilosc === 0) return;
    await Product.findOneAndUpdate(
        { _id: productId },
        { $set: { aktywne: false, dostepnosc: "niedostępne" } },
        { returnDocument: "after" },
    );
    const payload: notificationsType = {
        nazwa: "Towar wyprzedany",
        typ: "Brak towaru",
        tresc: `Produkt ${product.nazwa} jest wyprzedany`,
        link: `/admin/manage/products/${product.slug}`,
        czy_przeczytane: false,
        czy_aktywne: true,
    };
    await Notifications.create(payload);
}

async function notifyLowVariantStock(product: Products, wariant: Warianty) {
    if (wariant.ilosc >= 5 || wariant.ilosc <= 1) return;
    const payload: notificationsType = {
        nazwa: "Wariant towaru bliski wyprzedaży",
        typ: "Mały stan towary",
        tresc: `Wariant ${wariant.nazwa} produktu ${product.nazwa} jest bliski wyprzedaży`,
        link: `/admin/manage/products/${product.slug}`,
        czy_przeczytane: false,
        czy_aktywne: true,
    };
    await Notifications.create(payload);
}

async function notifyOutOfVariantStock(product: Products, wariant: Warianty) {
    if (wariant.ilosc === 0) return;
    const payload: notificationsType = {
        nazwa: "Wariant towaru wyprzedany",
        typ: "Brak towaru",
        tresc: `Wariant ${wariant.nazwa} produktu ${product.nazwa} jest wyprzedany`,
        link: `/admin/manage/products/${product.slug}`,
        czy_przeczytane: false,
        czy_aktywne: true,
    };
    await Notifications.create(payload);
}

export async function reduceProductQuantity(
    productId: string,
    quantity: number,
    wariantSlug?: string,
) {
    await db();
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        return { error: "Produkt nie znaleziony w bazie danych" };
    }

    const qty = Math.max(0, Math.floor(quantity));
    const warianty = product.wariant ?? [];

    if (!wariantSlug || warianty.length === 0) {
        product.ilosc = Math.max(0, product.ilosc - qty);
        if (warianty.length > 0) {
            warianty[0].ilosc = product.ilosc;
            product.wariant = warianty;
        }
        await product.save();
        await notifyLowProductStock(product, productId);
        await notifyOutOfProductStock(product, productId);
        return product;
    }

    const variantIdx = findVariantIndexBySlug(warianty, wariantSlug);
    if (variantIdx === -1) {
        return { error: "Wariant nie znaleziony w bazie danych" };
    }

    if (variantIdx === 0) {
        product.ilosc = Math.max(0, product.ilosc - qty);
        warianty[0].ilosc = product.ilosc;
        product.wariant = warianty;
        await product.save();
        await notifyLowProductStock(product, productId);
        await notifyOutOfProductStock(product, productId);
        return product;
    }

    const wariantObj = warianty[variantIdx];
    wariantObj.ilosc = Math.max(0, wariantObj.ilosc - qty);
    product.wariant = warianty;
    await product.save();
    await notifyLowVariantStock(product, wariantObj);
    await notifyOutOfVariantStock(product, wariantObj);
    return product;
}
