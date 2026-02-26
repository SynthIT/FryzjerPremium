import { db } from "@/lib/db/init";
import { Producent, Product } from "@/lib/models/Products";
import { zodProducents, Producents } from "@/lib/types/productTypes";
import mongoose from "mongoose";

export async function collectProducents() {
    await db();
    const producent = await Producent.find({});
    return JSON.stringify(producent || []);
}

export async function createProducent(prodData: Producents) {
    zodProducents.parse(prodData);
    await db();
    const producent = await Producent.create(prodData);
    return producent;
}

export async function deleteProducentBySlug(slug: string) {
    await db();
    const producent = await Producent.findOne({ slug: slug }).orFail();
    const productsWithProd = await Product.find({
        producent: producent._id.toString(),
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
    await db();
    const producent = await Producent.findOneAndUpdate(
        {
            slug: newProducent.slug,
        },
        newProducent,
    ).orFail();
    return producent;
}
