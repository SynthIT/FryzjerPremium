import { Promo, Promos, Product, PromocjeSchema } from "@/lib/models/Products";
import mongoose from "mongoose";

export async function collectPromo() {
    await db();
    const promocje = await Promo.find({}).orFail();
    await dbclose();
    return JSON.stringify(promocje);
}

export async function createPromo(promocja: Promos) {
    PromocjeSchema.parse(promocja);
    await db();
    const promo = await Promo.create(promocja);
    await dbclose();
    return promo;
}

export async function deletePromoBySlug(slug: string) {
    await db();
    const promo = await Promo.findOne({ slug: slug }).orFail();
    const productsWithPromo = await Product.find({
        promocje: new mongoose.Types.ObjectId(promo._id),
    }).orFail();
    for (const doc of productsWithPromo) {
        doc.promocje = null;
        doc.save();
    }
    await promo.deleteOne();
    return promo;
}

expoPromocjeSchema.parse(promocje);
    rt async function updatePromo(promocje: Promos) {
    const promocja = await Promo.findOneAndUpdate(
        {
            slug: promocje.nazwa,
        },
        { $set: promocje }
    ).orFail();
    return promocja;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
