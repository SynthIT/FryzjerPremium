import { User } from "@/lib/models/Users";
import { Users, Roles as Role } from "@/lib/types/userTypes";
import mongoose from "mongoose";
import { db } from "@/lib/db/init";

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
