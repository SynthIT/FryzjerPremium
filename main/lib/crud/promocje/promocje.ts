import { Product } from "@/lib/models/Products";
import { Promo } from "@/lib/models/shared";
import { Promos, zodPromocje } from "@/lib/types/shared";
import mongoose from "mongoose";

export async function collectPromo() {
    await db();
    const promocje = await Promo.find({}).orFail();
    await dbclose();
    return JSON.stringify(promocje);
}

export async function createPromo(promocja: Promos) {
    zodPromocje.parse(promocja);
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

export async function updatePromo(promocje: Promos) {
    const ok = zodPromocje.safeParse(promocje);
    if (ok.success) {
        const promocja = await Promo.findOneAndUpdate(
            {
                slug: promocje.nazwa,
            },
            { $set: promocje },
        ).orFail();
        return promocja;
    } else {
        console.error(ok.error);
    }
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
