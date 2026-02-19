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
        const zamowienia = await Orders.find({ user: userId, status: "w_koszyku" });
        if (zamowienia && zamowienia.length > 0) {
            const existingOrder = zamowienia.find((o) => o.numer_zamowienia === order.numer_zamowienia);
            if (existingOrder) {
                const res = await Orders.findOneAndUpdate({ _id: existingOrder._id }, { $set: { ...order } }, { new: false });
                return res;
            } else {
                const res = await Orders.create(order);
                return res;
            }
        } else {
            const res = await Orders.create(order);
            return res;
        }
    } catch (error) {
        console.error(new Error(`${error}`));
    }
}

export async function getUserOrders(userId: string) {
    try {
        await db();
        const zamowienia = await Orders.find({ user: userId, status: { $ne: "w_koszyku" } });
        return zamowienia;
    } catch (error) {
        console.error(error);
    }
}

export async function retriveUserCartOrders(userId: string) {
    try {
        await db();
        const zamowienia = await Orders.find({ user: userId, status: "w_koszyku" });
        return zamowienia;
    } catch (error) {
        console.error(error);
    }
}

