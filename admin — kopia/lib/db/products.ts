import path from "path";
import {
    Categories,
    Category,
    Producent,
    Product,
    Products,
    Promo,
} from "../models/Products";
import * as fs from "fs";
import { Types } from "mongoose";

interface ResponseType {
    message?: string;
    error?: string;
    status: string;
}

export async function generateFile() {
    await Product.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("producent")
        .orFail()
        .then((prod) => {
            fs.writeFileSync(
                path.join(process.cwd(), "data", "produkty.json"),
                JSON.stringify(prod)
            );
        });
}

export async function editEntry(
    val: string,
    objekt: Products
): Promise<ResponseType> {
    const produkt = await Product.findOne().where({ slug: val });
    if (produkt) {
        produkt.updateOne(objekt);
        return { message: "Aktualizacja udana", status: "Powodzenie" };
    }
    return { error: "Nie udalo sie znalezc obiektu", status: "Blad" };
}


export async function createEntry(val: Products): Promise<ResponseType> {
    const kategorie = await Promise.all(
        val.kategoria.map(async (val) => {
            if (typeof val === "string") {
                const existing = await Category.find().where({
                    nazwa: val.toString(),
                });
                if (existing.length > 0) {
                    return existing[0]._id;
                } else {
                    const obj: Categories = {
                        nazwa: val.toString(),
                        slug: "",
                        image: "",
                    };
                    const cat = await Category.create(obj);
                    return cat._id;
                }
            } else if (val instanceof Types.ObjectId) {
                const existing = await Category.find().where({ _id: val });
                if (existing.length > 0) {
                    return existing[0]._id;
                }
            } else {
                const existing = await Category.find().where({
                    nazwa: val.nazwa,
                });
                if (existing.length > 0) {
                    return existing[0]._id;
                } else {
                    const cat = await Category.create(val);
                    return cat._id;
                }
            }
            return val._id;
        })
    );
    val.kategoria = kategorie;
    const producent = await Producent.findOne().where({ nazwa: val.producent });
    if (producent) {
        val.producent = producent._id;
    }
    const promocje = await Promo.findOne().where({ nazwa: val.promocje });
    if (promocje) {
        val.promocje = promocje._id;
    }
    await Product.create(val);
    return { status: "Powodzenie", message: "Dodano wynik" };
}

export function readFromfile(): Array<Products> {
    const dane = fs
        .readFileSync(path.join(process.cwd(), "data", "produkty.json"))
        .toString();
    return JSON.parse(dane);
}
