import { Delivery } from "@/lib/models/Delivery";
import mongoose from "mongoose";

export async function getDeliveryMethods() {
    await db();
    const res = await Delivery.find();
    await dbclose();
    return res;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
