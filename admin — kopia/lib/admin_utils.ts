import { User } from "./models/Users";
import { createHash } from "node:crypto";
import { JwtPayload, sign, verify } from "jsonwebtoken";

import mongoose from "mongoose";
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
        const sha = createHash("sha256");
        sha.update(password, "utf8");
        const hashedPassword = sha.digest("hex");
        const u = await User.create({
            imie: "",
            nazwisko: "",
            email: email,
            haslo: hashedPassword,
            nr_domu: "",
            ulica: "",
            miasto: "",
            kraj: "",
            kod_pocztowy: "",
            telefon: "",
            osoba_prywatna: true,
            zamowienia: [],
            faktura: false,
        });
        u.haslo = "";
        mongoose.connection.close();
        return u;
    }
}
