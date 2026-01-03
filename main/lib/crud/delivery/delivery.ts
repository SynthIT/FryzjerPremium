import { Delivery } from "@/lib/models/Delivery";

export async function getDeliveryMethods() {
    return await Delivery.find();
}
