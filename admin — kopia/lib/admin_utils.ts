import { Role, User, Users } from "./models/Users";
import {
    createPrivateKey,
    createPublicKey,
    PrivateKeyInput,
    PublicKeyInput,
} from "node:crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import mongoose from "mongoose";
import { Product } from "./models/Products";
import { NextRequest } from "next/server";
import { argon2id, hash, verify as passverify } from "argon2";

export function checkRequestAuth(req: NextRequest): {
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
            } as PublicKeyInput)
        );
        const user = (cookie as JwtPayload).user;
        if (typeCheck(user)) {
            if (!user.role) return { val: false, mess: "Brak uprawnień" };
            return { val: true };
        }

        return { val: false };
    } catch (err) {
        return { val: false, mess: `${err}` };
    }
}

export async function checkExistingUser(email: string, haslo: string) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const existingUser: Users | null = await User.findOne({ email: email });
    mongoose.connection.close();
    if (existingUser) {
        if (!(await passverify(existingUser.haslo.trim(), haslo.trim())))
            return "Hasła nie są takie same";
        existingUser.haslo = "";
        return existingUser;
    }
    return "Użytkownik nie istnieje";
}

export function createJWT(payloaduser: Users) {
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
        }
    );
    return token;
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
            } as PublicKeyInput)
        );
        const user = (cookie as JwtPayload).user;
        if (typeCheck(user)) {
            if (!user.role) return { val: false, mess: "Brak uprawnień" };
            return { val: true, user: user };
        }
    } catch (err) {
        return { val: false, mess: `${err}` };
    }

    return { val: false };
}

export async function addNewUser(payload: Users) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser && existingUser.email === payload.email) {
        mongoose.connection.close();
        return "Użytkownik o podanym emailu już istnieje.";
    } else {
        const hashedPassword = await hash(payload.haslo, { type: 2 });
        const u = await User.create({
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
            zamowienia: [],
            faktura: false,
            role: { nazwa: "admin", permisje: 1 } as Role,
        });
        u.haslo = "";
        mongoose.connection.close();
        return u;
    }
}

export async function collectProducts() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const products = await Product.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("producent")
        .orFail();
    await mongoose.connection.close();
    return JSON.stringify(products);
}
