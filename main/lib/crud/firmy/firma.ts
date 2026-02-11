import { db } from "@/lib/db/init";
import { Firma, Course } from "@/lib/models/Courses";
import { zodProducents, Producents } from "@/lib/types/productTypes";
import mongoose from "mongoose";

export async function collectFirmy() {
    await db();
    const firmy = await Firma.find({}).lean();
    return JSON.stringify(firmy || []);
}

export async function createFirma(firmaData: Producents) {
    zodProducents.parse(firmaData);
    await db();
    const firma = await Firma.create(firmaData);
    return firma;
}

export async function deleteFirmaBySlug(slug: string) {
    await db();
    const firma = await Firma.findOne({ slug: slug }).orFail();
    const productsWithFirma = await Course.find({
        firma: new mongoose.Types.ObjectId(firma._id),
    }).orFail();
    const cb: typeof productsWithFirma = [];
    for (const doc of productsWithFirma) {
        cb.push(doc);
        doc.deleteOne();
    }
    await firma.deleteOne();
    return { products: cb, firma: firma };
}

export async function updateFirma(newFirma: Producents) {
    zodProducents.parse(newFirma);
    await db();
    const firma = await Firma.findOneAndUpdate(
        {
            slug: newFirma.slug,
        },
        newFirma,
    ).orFail();
    return firma;
}
