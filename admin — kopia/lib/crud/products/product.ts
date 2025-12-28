import { Product, Products } from "@/lib/models/Products";
import mongoose from "mongoose";

export async function collectProducts() {
    await db();
    const products = await Product.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("producent")
        .orFail();
    await dbclose();
    return JSON.stringify(products);
}

export async function createProduct(productData: Products) {
    await db();
    const prod = await Product.create(productData);
    await dbclose();
    return prod;
}

export async function deleteProductBySlug(slug: string) {
    await db();
    const prod = await Product.findOneAndDelete({ slug: slug });
    await dbclose();
    return prod;
}

export async function updateProduct(productData: Products) {
    await db();
    const prod = await Product.findOneAndUpdate(
        { slug: productData.slug },
        { $set: productData },
        {
            new: true,
        }
    );
    await dbclose();
    return prod;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
