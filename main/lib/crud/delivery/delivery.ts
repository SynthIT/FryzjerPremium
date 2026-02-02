import { Delivery } from "@/lib/models/Delivery";
import { DeliveryMethods, zodDeliveryMethods } from "@/lib/types/deliveryTypes";
import mongoose from "mongoose";

export async function getDeliveryMethods() {
    await db();
    const res = await Delivery.find();
    await dbclose();
    return res;
}

export async function updateDeliveryMethod(
    id: string,
    data: Partial<typeof Delivery>,
) {
    await db();
    const res = await Delivery.find()
        .findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: data },
            { new: true },
        )
        .orFail();
    await dbclose();
    return res;
}

export async function createDeliveryMethod(data: DeliveryMethods) {
    await db();
    const ok = zodDeliveryMethods.safeParse(data);
    if (!ok.success) {
        throw new Error("Invalid data");
    }
    const res = await Delivery.create(ok.data);
    await dbclose();
    return res;
}

export async function deleteDeliveryMethodBySlug(slug: string) {
    await db();
    const res = await Delivery.findOneAndDelete({
        slug: slug,
    }).orFail();
    await dbclose();
    return res;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
