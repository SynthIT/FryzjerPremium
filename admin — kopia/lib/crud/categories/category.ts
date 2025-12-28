import { Category, Categories, Product } from "@/lib/models/Products";
import mongoose from "mongoose";

export async function collectCategories() {
    await db();
    const categories = await Category.find({}).orFail();
    await dbclose();
    return JSON.stringify(categories);
}

export async function createCategory(catData: Categories) {
    await db();
    const cat = await Category.create(catData);
    await dbclose();
    return cat;
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
                !(elem as mongoose.Types.ObjectId)._id.equals(category._id)
        );
        doc.kategoria = newArray;
        await doc.save();
    }
    await category.deleteOne();
    return category;
}

export async function updateCategory(newCat: Categories) {
    const category = await Category.findOneAndUpdate(
        {
            slug: newCat.slug,
        },
        { $set: newCat }
    ).orFail();
    return category;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
