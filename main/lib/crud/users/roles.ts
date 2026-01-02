import { Roles, roleSchema } from "@/lib/types/userTypes";
import { Role, User } from "@/lib/models/Users";
import mongoose, { Types } from "mongoose";

export async function collectRoles() {
    await db();
    const promocje = await Role.find({}).orFail();
    await dbclose();
    return JSON.stringify(promocje);
}

export async function createRole(promocja: Roles) {
    roleSchema.parse(promocja);
    await db();
    const promo = await Role.create(promocja);
    await dbclose();
    return promo;
}

export async function deleteRoleByName(nazwa: string) {
    await db();
    const role = await Role.findOne({ nazwa: nazwa }).orFail();
    const usersWithRole = await User.find({
        role: [new mongoose.Types.ObjectId(role._id!)],
    }).orFail();
    for (const doc of usersWithRole) {
        if (!doc.role) return;
        const newArray = doc.role.filter(
            (elem): elem is string =>
                !(elem as unknown as Types.ObjectId)._id.equals(role._id)
        );
        doc.role = newArray;
    }
    await role.deleteOne();
    return role;
}

export async function updateRole(role: Roles) {
    const ok = roleSchema.safeParse(role);
    if (ok.success) {
        const rola = await Role.findOneAndUpdate(
            {
                nazwa: role.nazwa,
            },
            { $set: role }
        ).orFail();
        return rola;
    } else {
        console.error(ok.error);
    }
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
