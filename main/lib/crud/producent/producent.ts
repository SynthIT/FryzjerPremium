import {
    Producent,
    Producents,
    Product,
    Categories,
    zodProducents,
} from "@/lib/models/Products";
import mongoose from "mongoose";

export async function collectProducents() {
    await db();
    const producent = await Producent.find({}).orFail();
    await dbclose();
    return JSON.stringify(producent);
}

export async function createProducent(prodData: Producents) {
    zodProducents.parse(prodData);
    await db();
    const cat = await Producent.create(prodData);
    await dbclose();
    return cat;
}

export async function deleteProducentBySlug(slug: string) {
    await db();
    const producent = await Producent.findOne({ slug: slug }).orFail();
    const productsWithProd = await Product.find({
        producent: new mongoose.Types.ObjectId(producent._id),
    }).orFail();
    const cb: typeof productsWithProd = [];
    for (const doc of productsWithProd) {
        cb.push(doc);
        doc.deleteOne();
    }
    await producent.deleteOne();
    return { products: cb, producent: producent };
}

export async function updateProducent(newProducent: Producents) {
    zodProducents.parse(newProducent);
    const producent = await Producent.findOneAndUpdate(
        {
            slug: newProducent.slug,
        },
        newProducent
    ).orFail();
    return producent;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
