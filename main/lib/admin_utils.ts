import { Users, Roles, OrderList } from "@/lib/types/userTypes";
import { Orders, Role, User } from "@/lib/models/Users";
import {
    hasPermission,
    permissionKeys,
    PermissionTable,
    permissionToAdminNumber,

} from "@/lib/auth/permissions";
import {
    createPrivateKey,
    createPublicKey,
    PrivateKeyInput,
    PublicKeyInput,
} from "node:crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { NextRequest } from "next/server";
import { hash, verify as passverify } from "argon2";
import { Products, Warianty } from "./types/productTypes";
import { Courses } from "./types/coursesTypes";
import { db } from "@/lib/db/init";
import { createStripeCustomer } from "./payments/utils";



/*
    FUNKCJE ODNOŚCIE UŻYTKOWNIKÓW WYCHODZĄCE Z 
    FRONTU, ORAZ DO ADMIN PANELU
*/

/**
 * @name checkRequestAuth
 * @description Zwraca val true jeżeli użytkownik może odtworzyć adminpanel
 * @param req nextrequest
 * @param scope musi byc array wymaganych permisji
 * @returns {val: true|false, user: Users }
 */
export async function checkRequestAuth(
    req: NextRequest,
    scope?: typeof permissionKeys,
): Promise<{
    val: boolean;
    user?: Users;
    mess?: string;
}> {
    const { val, user, mess } = await verifyJWT(req);
    if (!scope) return { val, user, mess: mess! };
    if (!val || !user) return { val: false, mess: mess! };
    if (!user.role) return { val: false, mess: "Użytkownik nie ma roli" };
    let bits = 0;
    for (const role of user.role as Roles[]) {
        if (!role.admin) continue;
        bits |= role.admin;
    }
    let mask = 0;
    for (const bit of scope!) {
        mask |= PermissionTable[bit];
    }
    const enoughPermissions = hasPermission(bits, mask);
    return { val: enoughPermissions, mess: enoughPermissions ? "" : "Nie wystarczające uprawienienia do wykonania operacji" };
}

export async function checkExistingUser(email: string, haslo: string): Promise<{
    error: string | null,
    user: Users | null,
    orders: OrderList[] | null
}> {
    try {
        await db();
        const existingUser: Users = await User.findOne({ email: email })
            .populate("role")
            .orFail();
        if (!existingUser) {
            return { error: "Użytkownik nie istnieje", user: null, orders: null };
        }
        if (!(await passverify(existingUser.haslo.trim(), haslo.trim())))
            return { error: "Hasła nie są takie same", user: null, orders: null };
        const orders = await Orders.find({ user: existingUser._id });
        return { error: null, user: existingUser, orders: orders };
    } catch (e) {
        console.log(e);
        return { error: "Użytkownik nie istnieje", user: null, orders: null };
    }
}

export function createJWT(
    payloaduser: Users,
    refresh?: boolean,
): Array<string> {
    let refreshtoken: string = "";
    if (refresh) {
        const payload: JwtPayload = {
            _id: payloaduser._id,
            email: payloaduser.email,
            iat: Math.floor(Date.now() / 1000),
        };
        refreshtoken = sign(
            payload,
            createPrivateKey({
                key: process.env.JWT_REFRESH_PRIVATE_KEY,
                format: "pem",
                type: "pkcs8",
            } as PrivateKeyInput),
            {
                algorithm: "RS256",
                expiresIn: "7d",
            },
        );
    }
    const payload: JwtPayload = {
        _id: payloaduser._id,
        email: payloaduser.email,
        role: payloaduser.role,
        iat: Math.floor(Date.now() / 1000),
    };
    const token = sign(
        payload,
        createPrivateKey({
            key: process.env.JWT_PRIVATE_KEY!,
            format: "pem",
            type: "pkcs8",
        } as PrivateKeyInput),
        {
            algorithm: "RS256",
            expiresIn: "1d",
        },
    );
    return [token, refreshtoken];
}

export async function verifyJWT(req: NextRequest): Promise<{
    val: boolean;
    user?: Users;
    mess?: string;
}> {
    const cookieAuth = req.cookies.get("Authorization");
    if (!cookieAuth) return { val: false };
    if (cookieAuth.value.split(" ")[0] !== "Bearer") return { val: false, mess: "Nieprawidłowy token" };
    try {
        const cookie = verify(
            cookieAuth.value.split(" ")[1],
            createPublicKey({
                key: process.env.JWT_PUBLIC_KEY!,
                format: "pem",
                type: "pkcs1",
            } as PublicKeyInput),
        );
        const email = (cookie as JwtPayload).email;
        if (!email) return { val: false, mess: "Nieprawidłowy token" };
        const user = await User.findOne({ email: email }).populate("role").orFail();
        if (!user) return { val: false, mess: "Użytkownik nie istnieje" };
        return { val: true, user: user };
    } catch (_) {
        const refreshToken = req.cookies.get("Refresh-Token");
        if (!refreshToken) return { val: false, mess: "Nieprawidłowy token" };
        const token = refreshToken.value.split(" ")[1];
        const cookie = verify(
            token,
            createPublicKey({
                key: process.env.JWT_REFRESH_PUBLIC_KEY!,
                format: "pem",
                type: "pkcs1",
            } as PublicKeyInput),
        );
        const email = (cookie as JwtPayload).email;
        if (!email) return { val: false, mess: "Nieprawidłowy token" };
        const user = await User.findOne({ email: email }).populate("role").orFail();
        if (!user) return { val: false, mess: "Użytkownik nie istnieje" };
        return { val: true, user: user };
    }
}

export async function returnAvailableWariant(
    req: NextRequest,
    product: Products,
): Promise<{ res: boolean; product: Products }> {
    if (!product || !product.cena) {
        return { res: false, product: product };
    }
    if (!product.wariant) return { res: true, product: product };
    const { val, user } = await verifyJWT(req);
    if (!val || !user) return { res: false, product: product };
    if (!user.role) return { res: true, product: product };
    const filteredProduct = { ...product };
    filteredProduct.wariant = (product.wariant as Warianty[]).filter((w) => {
        if (!w.permisje) return true;
        console.log(w);
        return user.role!.some((role) => {
            console.log(role);
            const rol = role as Roles;
            if (!rol.uzytkownik) return false;

            return hasPermission(w.permisje!, rol.uzytkownik);
        });
    });
    return { res: true, product: filteredProduct };
}

export function returnAvailableCourseWariant(
    req: NextRequest,
    course: Courses,
): { res: boolean; course: Courses } {
    if (!course || !course.cena) {
        return { res: false, course: course };
    }
    // Kursy nie mają permisji w wariantach (KursWarianty nie ma pola permisje)
    // Więc zwracamy kurs bez zmian
    return { res: true, course: course };
}

export async function addNewUser(payload: Users) {
    await db();
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser && existingUser.email === payload.email) {
        return "Użytkownik o podanym emailu już istnieje.";
    } else {
        const stripeCustomer = await createStripeCustomer(payload);
        if (!stripeCustomer) {
            return "Błąd podczas tworzenia konta Stripe";
        }

        const hashedPassword = await hash(payload.haslo, { type: 2 });
        const upayload: Users = {
            imie: payload.imie,
            nazwisko: payload.nazwisko,
            email: payload.email,
            haslo: hashedPassword,
            nr_domu: payload.nr_domu,
            nr_lokalu: payload.nr_lokalu || "",
            ulica: payload.ulica,
            miasto: payload.miasto,
            kraj: payload.kraj,
            kod_pocztowy: payload.kod_pocztowy,
            telefon: payload.telefon,
            osoba_prywatna: true,
            faktura: false,
            stripe_id: stripeCustomer,
        };
        const u = await User.create(upayload);
        return u;
    }
}


export async function changePassword(
    req: NextRequest,
    newPassword: string,
    oldPassword: string,
): Promise<{ mess: string; user?: Users; jwt?: string[] }> {
    const { val, user, mess } = await verifyJWT(req);
    if (!val || !user) return { mess: mess! };
    try {
        await db();
        const ok = await passverify(user.haslo, oldPassword);
        if (!ok) throw new Error("Hasla nie sa takie same");
        const newpassword = await hash(newPassword, { type: 2 });
        await User.findOneAndUpdate({ email: user.email }, { $set: { haslo: newpassword } }).orFail();
        const jwt = createJWT(user, true);
        return { mess: "Hasło zostało zmienione", user: user, jwt: jwt };
    } catch (err) {
        return { mess: `${err}` };
    }
}

export async function editUser(
    req: NextRequest,
    newUser: Partial<Users>,
): Promise<{ mess: string; user?: Users }> {
    const { val, user, mess } = await verifyJWT(req);
    if (!val || !user) return { mess: mess! };
    try {
        await db();
        await User.findOneAndUpdate({ email: user.email }, { $set: newUser }).orFail();
        return { mess: "Użytkownik został zedytowany", user: user };
    } catch (err) {
        return { mess: `${err}` };
    }
}

export async function deleteUser(
    req: NextRequest,
): Promise<{ mess: string; deleted?: boolean }> {
    const { val, user, mess } = await verifyJWT(req);
    if (!val || !user) return { mess: mess! };
    try {
        await db();
        await Orders.updateMany({ user: user._id }, { $set: { user: null } });
        await User.findOneAndDelete({ email: user.email }).orFail();
        return { mess: "Konto zostało usunięte", deleted: true };
    } catch (err) {
        return { mess: `Błąd podczas usuwania konta: ${err}` };
    }
}

