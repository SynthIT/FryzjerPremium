import { User } from "@/lib/models/Users";
import { Users, Roles as Role, OrderList } from "@/lib/types/userTypes";
import { db } from "@/lib/db/init";
import { Orders } from "@/lib/models/Users";
export async function collectUsers() {
    await db();
    const uzytkownicy = await User.find({}).populate("role");
    return uzytkownicy;
}

export async function collectAdmins() {
    await db();
    const uzytkownicy = await User.find({})
        .populate("role")
        .then((docs) =>
            docs.filter(
                (doc): doc is typeof doc & { role: Role[] } =>
                    Array.isArray(doc.role) &&
                    doc.role.length > 0 &&
                    (doc.role[0] as Role).nazwa === "admin",
            ),
        );
    return JSON.stringify(uzytkownicy);
}

export async function addAdmin(user: Users) {
    await db();
    const uzytkownik = await User.findOne({ email: user.email })
        .populate("role")
        .orFail();
    if ((uzytkownik.role as Role[]).length > 0) {
        uzytkownik.role?.unshift();
    }
}

export async function createOrder(order: OrderList) {
    try {
        await db();
        const res = await Orders.create(order);
        return res;
    } catch (error) {
        console.error(error);
    }
}
export async function addAndUpdateOrderToUser(userId: string, order: OrderList) {
    try {
        await db();
        if (!userId) {
            const res = await Orders.create(order);
            return res;
        }
        const user = await User.findOne({ _id: userId }).populate("zamowienia").orFail();
        const zamowienia = user.zamowienia as OrderList[];
        if (zamowienia && zamowienia.length > 0) {
            const existingOrder = zamowienia.find((o) => o.numer_zamowienia === order.numer_zamowienia);
            if (existingOrder) {
                const res = await Orders.findOneAndUpdate({ _id: existingOrder._id }, { $set: { ...order } }, { new: false });
                return res;
            } else {
                const res = await Orders.create(order);
                await User.findOneAndUpdate({ _id: userId }, { $push: { zamowienia: res._id } });
                return res;
            }
        } else {
            const res = await Orders.create(order);
            await User.findOneAndUpdate({ _id: userId }, { $push: { zamowienia: res._id } });
            return res;
        }
    } catch (error) {
        console.error(new Error(`${error}`));
    }
}

export async function getUserOrders(userId: string) {
    try {
        await db();
        const user = await User.findOne({ _id: userId, "zamowienia.status": { $ne: "w_koszyku" } }).populate("zamowienia").orFail();
        return user.zamowienia;
    } catch (error) {
        console.error(error);
    }
}

export async function retriveUserCartOrders(userId: string) {
    try {
        await db();
        const user = await User.findOne({ _id: userId, "zamowienia.status": { $eq: "w_koszyku" } }).populate("zamowienia");
        return user ?? null;
    } catch (error) {
        console.error(error);
    }
}

