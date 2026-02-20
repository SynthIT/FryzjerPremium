import { db } from "@/lib/db/init";
import { Orders } from "@/lib/models/Users";
import { OrderList, orderListSchema } from "@/lib/types/userTypes";

export async function collectOrders() {
    await db();
    const orders = await Orders.find().populate("user").populate("produkty").populate("sposob_dostawy").lean();
    return JSON.stringify(orders);
}
export async function createOrder(order: OrderList) {
    const ok = orderListSchema.safeParse(order);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    await db();
    const res = await Orders.create(order);
    return res;
}

export async function updateOrder(order: OrderList) {
    const ok = orderListSchema.safeParse(order);
    if (!ok.success) {
        return { error: ok.error.message };
    }
    await db();
    const res = await Orders.findOneAndUpdate({ _id: order._id }, { $set: order }, { new: true });
    return res;
}

export async function deleteOrder(id: string) {
    await db();
    const res = await Orders.findOneAndDelete({ _id: id });
    return res;
}

export async function getOrderById(id: string) {
    await db();
    const res = await Orders.findOne({ _id: id });
    return res;
}

export async function getOrdersByUserId(userId: string) {
    await db();
    const res = await Orders.find({ user: userId });
    return res;
}

export async function getOrdersByStatus(status: string) {
    await db();
    const res = await Orders.find({ status: status });
    return res;
}
export async function getOrdersByDate(date: Date) {
    await db();
    const res = await Orders.find({ date: date });
    return res;
}