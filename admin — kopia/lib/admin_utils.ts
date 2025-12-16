import { User } from "./models/Users";
import { createHash } from "node:crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";

import mongoose from "mongoose";
import { Product } from "./models/Products";
export function createJWT(email: string) {
    const payload: JwtPayload = {
        email: email,
        iat: Math.floor(Date.now() / 1000),
    };
    const token = sign(payload, "your-secret-key", {
        algorithm: "HS256",
        expiresIn: "1d",
    });
    return token;
}

export async function addNewUser(email: string, password: string) {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    const existingUser = await User.findOne({ email: email });
    if (existingUser && existingUser.email === email) {
        mongoose.connection.close();
        return "Użytkownik o podanym emailu już istnieje.";
    } else {
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const sha = createHash("sha256");
        sha.update(password, "utf8");
        const hashedPassword = sha.digest("hex");
        const u = await User.create({
            imie: "User",
            nazwisko: `${randomNumber}`,
            email: email,
            haslo: hashedPassword,
            nr_domu: "0",
            ulica: "0",
            miasto: "Miasto",
            kraj: "Kraj",
            kod_pocztowy: "00-000",
            telefon: "1234567890",
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
