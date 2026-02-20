import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
import { Category } from "@/lib/models/shared";
import { Categories, zodCategories } from "@/lib/types/shared";

export async function collectCategories() {
    await db();
    const categories = await Category.find({}).lean();
    
    return categories;
}

export async function createCategory(catData: Categories): Promise<Categories | { error: string }> {
    const ok = zodCategories.safeParse(catData);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    await db();
    const newCat = await Category.create({
        ...ok.data,
        image: {
            nazwa: ok.data.nazwa,
            slug: ok.data.slug,
            typ: "image",
            alt: ok.data.nazwa,
            path: Math.random().toString(36).substring(2, 15),
        },
    });
    return newCat;

}

export async function deleteCatBySlug(slug: string) {
    await db();
    const category = await Category.findOne({ slug: slug }).orFail();
    const productsWithCat = await Product.find({
        kategoria: category._id.toString(),
    }).orFail();
    for (const doc of productsWithCat) {
        const newArray = doc.kategoria.filter(
            (elem): elem is string =>
                elem !== category._id.toString(),
        );
        doc.kategoria = newArray;
        await doc.save();
    }
    await category.deleteOne();
    return category;
}

export async function updateCategory(newCat: Categories) {
    zodCategories.parse(newCat);
    await db();
    const category = await Category.findOneAndUpdate(
        {
            slug: newCat.slug,
        },
        { $set: newCat },
    ).orFail();
    return category;
}
