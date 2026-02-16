import { User } from "@/lib/models/Users";
import { Users, Roles as Role, OrderList } from "@/lib/types/userTypes";
import { db } from "@/lib/db/init";
import { Product } from "@/lib/models/Products";
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


export async function addAndUpdateOrderToUser(userId: string, order: OrderList) {
    try {

        await db();
        const user = await User.findOne({ _id: userId }).populate("zamowienia").orFail();
        const zamowienia = user.zamowienia;
        if (zamowienia && zamowienia.length === 0) {
            const result = await User.findOneAndUpdate(
                { _id: userId, "zamowienia.numer_zamowienia": { $ne: order.numer_zamowienia } }, // tylko jeśli element nie istnieje
                { $push: { zamowienia: order } }, { new: false }
            );
            if (result) {
                return true;
            } else {
                const exists = zamowienia.findIndex((o) => (o as OrderList).numer_zamowienia === order.numer_zamowienia);
                zamowienia.splice(exists, 1);
                zamowienia[exists] = order;
                await user.save();
                return true
            }
        } else {
            await User.findOneAndUpdate({ _id: userId }, { $set: { zamowienia: zamowienia } });
        }
    } catch (error) {
        console.error(error);
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

export async function calculateUserOrdersSum(userId: string) {
    try {
        await db();
        const user = await User
            .findOne({ _id: userId, "zamowienia.status": { $eq: "w_koszyku" } })
            .populate({ path: "zamowienia", populate: { path: "produkty", model: "Products" } })
            .orFail();
        const zamowienia: OrderList[] | undefined = user.zamowienia as OrderList[] | undefined;
        if (!zamowienia) return 0;
        let suma = 0;
        for (const zamowienie of zamowienia) {
            const produkty = zamowienie.produkty;
            if (!produkty) continue;
            for (const produkt of produkty) {
                const product = await Product.findOne({ _id: produkt }).orFail();
                suma += product.cena;
            }
        }
        return suma;
    } catch (error) {
        console.error(error);
    }
}
