import { User, Users } from "./models/Users";
import {
    createHash,
    createPrivateKey,
    createPublicKey,
    PrivateKeyInput,
    PublicKeyInput,
} from "node:crypto";
import {
    JwtPayload,
    sign,
    verify,
    VerifyCallback,
    VerifyErrors,
} from "jsonwebtoken";

import mongoose from "mongoose";
import { Product } from "./models/Products";

import { NextRequest } from "next/server";

export function checkRequestAuth(req: NextRequest): boolean {
    const cookieAuth = req.cookies.get("Authorization");
    console.log(cookieAuth);
    if (!cookieAuth) return false;
    if (cookieAuth.value.split(" ")[0] !== "Bearer") return false;
    try {
        const cookie = verify(
            cookieAuth.value.split(" ")[1],
            createPublicKey({
                key: process.env.JWT_PUBLIC_KEY!,
                format: "pem",
                type: "pkcs1",
            } as PublicKeyInput)
        );
        return true;
    } catch (err) {
        return false;
    }
}

export function createJWT(email: string) {
    const payload: JwtPayload = {
        email: email,
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

export async function addNewUser(payload: Users) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser && existingUser.email === payload.email) {
        mongoose.connection.close();
        return "Użytkownik o podanym emailu już istnieje.";
    } else {
        const sha = createHash("sha256");
        sha.update(payload.haslo, "utf8");
        const hashedPassword = sha.digest("hex");
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
