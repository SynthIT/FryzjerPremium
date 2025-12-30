import {
    Product,
    Products,
    Categories,
    zodProducts,
} from "@/lib/models/Products";
import mongoose, { Types } from "mongoose";

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
    zodProducts.parse(productData);
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
    const produkt = zodProducts.safeParse(productData);
    if (produkt.error) return;
    const kategorie = produkt.data.kategoria;
    produkt.data.kategoria = [];
    for (const kategoria of kategorie) {
        produkt.data.kategoria.push(
            new Types.ObjectId((kategoria as Categories)._id)
        );
    }
    
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
