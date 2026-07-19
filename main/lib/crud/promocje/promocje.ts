import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
import { Promo } from "@/lib/models/shared";
import { Promos, zodPromocje } from "@/lib/types/shared";

/** Dezaktywuje promocje po dacie `wygasa` (cron-less, przy odczycie). */
export async function expireInactivePromos() {
    await db();
    const now = new Date();
    await Promo.updateMany(
        { wygasa: { $lt: now }, aktywna: { $ne: false } },
        { $set: { aktywna: false } },
    );
}

export async function collectPromo() {
    await expireInactivePromos();
    const promocje = await Promo.find();
    return JSON.stringify(promocje);
}

export async function createPromo(promocja: Promos) {
    promocja.rozpoczecie = new Date(promocja.rozpoczecie);
    promocja.wygasa = new Date(promocja.wygasa);
    zodPromocje.parse(promocja);
    await db();
    const promo = await Promo.create(promocja);
    return promo;
}

export async function deletePromoBySlug(slug: string) {
    await db();
    const promo = await Promo.findOne({ slug: slug }).orFail();
    const productsWithPromo = await Product.find({
        promocje: promo._id.toString(),
    }).orFail();
    for (const doc of productsWithPromo) {
        doc.promocje = undefined;
        doc.save();
    }
    await promo.deleteOne();
    return promo;
}

export async function updatePromo(promocje: Promos) {
    const ok = zodPromocje.safeParse(promocje);
    if (ok.success) {
        await db();
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
