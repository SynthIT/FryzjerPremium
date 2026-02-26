import { db } from "@/lib/db/init";
import { Firma, Course } from "@/lib/models/Courses";
import { zodProducents } from "@/lib/types/productTypes";
import mongoose from "mongoose";
import z from "zod";

const firmaCreateSchema = zodProducents.extend({
    instruktorzy: z.array(z.string()).optional().default([]),
});
const firmaUpdateSchema = firmaCreateSchema;

export async function collectFirmy() {
    await db();
    const firmy = await Firma.find({}).populate("instruktorzy").lean();
    return JSON.stringify(firmy || []);
}

export async function createFirma(firmaData: Parameters<typeof firmaCreateSchema.parse>[0]) {
    const parsed = firmaCreateSchema.parse(firmaData);
    await db();
    const firma = await Firma.create(parsed);
    return firma;
}

export async function deleteFirmaBySlug(slug: string) {
    await db();
    const firma = await Firma.findOne({ slug: slug }).orFail();
    const productsWithFirma = await Course.find({
        firma: firma._id.toString(),
    }).orFail();
    const cb: typeof productsWithFirma = [];
    for (const doc of productsWithFirma) {
        cb.push(doc);
        doc.deleteOne();
    }
    await firma.deleteOne();
    return { products: cb, firma: firma };
}

export async function updateFirma(newFirma: Parameters<typeof firmaUpdateSchema.parse>[0]) {
    const parsed = firmaUpdateSchema.parse(newFirma);
    await db();
    const firma = await Firma.findOneAndUpdate(
        {
            slug: parsed.slug,
        },
        parsed,
    ).orFail();
    return firma;
}
