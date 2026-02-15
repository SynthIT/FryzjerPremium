import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
import { Category } from "@/lib/models/shared";
import { Categories, zodCategories } from "@/lib/types/shared";
import mongoose from "mongoose";

export async function collectCategories() {
    await db();
    const categories = await Category.find({});
    const cats: Record<string, Categories[]> = {};
    if (categories && categories.length > 0) {
        for (const docs of categories) {
            if (!cats[docs.slug]) {
                cats[docs.slug] = [];
            }
            cats[docs.slug].push(docs);
        }
    }
    return JSON.stringify(cats);
}

export async function createCategory(catData: Categories): Promise<Categories | { error: string }> {
    const ok = zodCategories.safeParse(catData);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    await db();
    const newCat = await Category.create(ok.data);
    return newCat;

}

export async function deleteCatBySlug(slug: string) {
    await db();
    const category = await Category.findOne({ slug: slug }).orFail();
    const productsWithCat = await Product.find({
        kategoria: new mongoose.Types.ObjectId(category._id),
    }).orFail();
    for (const doc of productsWithCat) {
        const newArray = doc.kategoria.filter(
            (elem): elem is mongoose.Types.ObjectId =>
                !(elem as mongoose.Types.ObjectId)._id.equals(category._id),
        );
        doc.kategoria = newArray;
        await doc.save();
    }
    await category.deleteOne();
    return category;
}

export async function updateCategory(newCat: Categories) {
    zodCategories.parse(newCat);
    await db();
    const category = await Category.findOneAndUpdate(
        {
            slug: newCat.slug,
        },
        { $set: newCat },
    ).orFail();
    return category;
}
