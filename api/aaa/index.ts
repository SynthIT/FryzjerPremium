import mongoose from "mongoose";
import { promocje } from "./promocje";
import {
    Categories,
    Category,
    Delivery,
    Producent,
    Producents,
    Product,
    Products,
    Promo,
    Promos,
} from "./types";
import { Kategorie } from "./kategorie";
import { producent } from "./producent";
import { products } from "./product";
import { sys } from "typescript";
import * as fs from "fs";
import * as path from "path";
import { deliver } from "./delivery";

const polishMap: Record<string, string> = {
    "ą": "a",
    "ć": "c",
    "ę": "e",
    "ł": "l",
    "ń": "n",
    "ó": "o",
    "ś": "s",
    "ż": "z",
    "ź": "z",
    "Ą": "A",
    "Ć": "C",
    "Ę": "E",
    "Ł": "L",
    "Ń": "N",
    "Ó": "O",
    "Ś": "S",
    "Ż": "Z",
    "Ź": "Z",
};

async function createProduct(prod: Products) {
    prod.kategoria = await Promise.all(
        prod.kategoria.map(async (obj: unknown) => {
            const k = await Category.findOne({
                nazwa: (obj as Categories).nazwa,
            }).orFail();
            return k._id;
        })
    );
    const producent = await Producent.findOne({
        nazwa: (prod.producent as Producents).nazwa,
    }).orFail();
    prod.producent = producent._id;
    if (prod.promocje) {
        const promocje = await Promo.findOne({
            nazwa: (prod.promocje as Promos).nazwa,
        }).orFail();
        prod.promocje = promocje;
    }
    const object = await Product.create(prod);
    console.log(object);
}

async function find() {
    await Product.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("producent")
        .orFail()
        .then((prod) => {
            fs.writeFileSync(
                path.join(__dirname + "\\produkty.json"),
                JSON.stringify(prod)
            );
        });
}

(async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/fryzjerpremium");

        for (const val of promocje) {
            const existing = await Promo.findOne({ nazwa: val.nazwa });
            if (existing === null) {
                const p = await Promo.create(val);
                console.log(p);
            }
        }

        for (const val of Kategorie) {
            const existing = await Category.findOne({ nazwa: val.nazwa });
            if (existing === null) {
                const p = await Category.create(val);
                console.log(p);
            }
        }

        for (const val of producent) {
            const existing = await Producent.findOne({ nazwa: val.nazwa });
            if (existing === null) {
                const p = await Producent.create(val);
                console.log(p);
            }
        }

        for (const val of products) {
            const slug =
                val.slug.trim() === ""
                    ? val.nazwa
                          .toLowerCase()
                          .split(" ")
                          .join("-")
                          .replace(
                              /[ąćęłńóśźż]/g,
                              (m: string) => polishMap[m] ?? m
                          )
                    : val.slug;
            val.slug = slug;
            const existing = await Product.findOne({ nazwa: val.nazwa });
            if (existing === null) {
                const p = await createProduct(val);
                console.log(p);
            }
        }

        for (const val of deliver) {
            const existing = await Delivery.findOne({ nazwa: val.nazwa });
            if (existing === null) {
                const p = await Delivery.create(val);
                console.log(p);
            }
        }
        await find();
        sys.exit();
        return 1;
    } catch (e) {
        console.error(e);
        sys.exit();
        return 1;
    }
})();
