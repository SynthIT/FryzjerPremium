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
import { Courses, KursWarianty } from "./types/coursesTypes";
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
export function checkRequestAuth(
    req: NextRequest,
    scope?: typeof permissionKeys,
): {
    val: boolean;
    user?: Users;
    mess?: string;
} {
    const { val, user, mess } = verifyJWT(req);
    if (scope) {
        if (!user) return { val: false, mess: mess };
        if (!user.role) return { val: false, mess: mess };
        let bits = 0;
        for (const role of user.role as Roles[]) {
            if (!role.admin) continue;
            bits |= role.admin;
        }
        let mask = 0;
        for (const bit of scope!) {
            mask |= PermissionTable[bit];
        }
        const val = hasPermission(bits, mask);
        return {
            val,
            mess: val
                ? ""
                : "Nie wystarczające uprawienienia do wykonania operacji",
        };
    } else {
        return {
            val,
            mess,
        };
    }
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
        user: payloaduser,
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

export function verifyJWT(req: NextRequest): {
    val: boolean;
    user?: Users;
    mess?: string;
} {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function typeCheck(obj: any): obj is Users {
        return (
            obj !== null &&
            typeof obj === "object" &&
            typeof obj.email === "string" &&
            typeof obj.nazwisko == "string"
        );
    }
    const cookieAuth = req.cookies.get("Authorization");
    if (!cookieAuth) return { val: false };
    if (cookieAuth.value.split(" ")[0] !== "Bearer") return { val: false };
    try {
        const cookie = verify(
            cookieAuth.value.split(" ")[1],
            createPublicKey({
                key: process.env.JWT_PUBLIC_KEY!,
                format: "pem",
                type: "pkcs1",
            } as PublicKeyInput),
        );
        const user = (cookie as JwtPayload).user;
        if (typeCheck(user)) {
            return { val: true, user: user };
        }
    } catch (err) {
        const refreshToken = req.cookies.get("Refresh-Token");
        if (refreshToken) {
            const token = refreshToken.value.split(" ")[1];
            try {
                const cookie = verify(
                    token,
                    createPublicKey({
                        key: process.env.JWT_REFRESH_PUBLIC_KEY!,
                        format: "pem",
                        type: "pkcs1",
                    } as PublicKeyInput),
                );
                const user = (cookie as JwtPayload).user;
                if (typeCheck(user)) {
                    return { val: true, user: user };
                }
            } catch (err) {
                throw `${err} catch w catch`;
            }
        }
        return { val: false, mess: `${err} catch` };
    }
    return { val: false };
}

export function returnAvailableWariant(
    req: NextRequest,
    product: Products,
): { res: boolean; product: Products } {
    if (!product || !product.cena) {
        return { res: false, product: product };
    }
    if (!product.wariant) return { res: true, product: product };
    const { val, user } = verifyJWT(req);
    if (val && user) {
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
    } else {
        const filteredProduct = { ...product };
        filteredProduct.wariant = (product.wariant as Warianty[]).filter(
            (w) => !w.permisje
        );
        return { res: true, product: filteredProduct };
    }
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
        const jest = await Role.findOne({ nazwa: "admin" });
        const stripeCustomer = await createStripeCustomer(payload);
        if (!stripeCustomer) {
            return "Błąd podczas tworzenia konta Stripe";
        }
        if (!jest) {
            const rola = await Role.create({
                nazwa: "admin",
                admin: permissionToAdminNumber([
                    "admin:blog",
                    "admin:categories",
                    "admin:orders",
                    "admin:producent",
                    "admin:products",
                    "admin:promo",
                    "admin:roles",
                    "admin:users",
                ]),
            });
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
                role: [rola._id! as unknown as string],
                stripe_id: stripeCustomer,
            };
            const u = await User.create(upayload);
            return u;
        } else {
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
                role: [jest._id! as unknown as string],
                stripe_id: stripeCustomer,
            };
            const u = await User.create(upayload);
            return u;
        }
    }
}

export async function changePassword(
    req: NextRequest,
    newPassword: string,
    oldPassword: string,
): Promise<{ mess: string; user?: Users; jwt?: string[] }> {
    const { val, user, mess } = verifyJWT(req);
    if (!val || typeof user === "undefined") return { mess: mess! };
    try {
        await db();
        const res = await User.findOne({ email: user.email }).orFail();
        const ok = await passverify(res.haslo, oldPassword);
        if (!ok) throw new Error("Hasla nie sa takie same");
        res.haslo = await hash(newPassword, { type: 2 });
        res.save();
        const jwt = createJWT(res, true);
        return { mess: "Hasło zostało zmienione", user: res, jwt: jwt };
    } catch (err) {
        return { mess: `${err}` };
    }
}

export async function editUser(
    req: NextRequest,
    newUser: Partial<Users>,
): Promise<{ mess: string; user?: Users; jwt?: string[] }> {
    const { val, user, mess } = verifyJWT(req);
    if (!val || typeof user === "undefined") return { mess: mess! };
    try {
        await db();
        newUser.haslo = user.haslo;
        const res = await User.findOneAndUpdate(
            { email: user.email },
            { $set: newUser },
        ).orFail();
        const jwt = createJWT(res, true);
        return { mess: "Użytkownik został zedytowany", user: res, jwt };
    } catch (err) {
        return { mess: `${err}` };
    }
}

export async function deleteUser(
    req: NextRequest,
): Promise<{ mess: string; deleted?: boolean }> {
    const { val, user, mess } = verifyJWT(req);
    if (!val || typeof user === "undefined") return { mess: mess! };
    try {
        await db();
        await Orders.updateMany({ user: user._id }, { $set: { user: null } });

        const o = await User.findOneAndDelete({ email: user.email }).orFail();
        if (user == o) return { mess: "Konto zostało usunięte", deleted: true };
        else return { mess: "Błąd podczas usuwania konta", deleted: false };
    } catch (err) {
        return { mess: `${err}` };
    }
}

