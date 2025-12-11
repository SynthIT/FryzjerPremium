import mongoose, { Types } from "mongoose";
import {
    Categories,
    Category,
    Media,
    Producent,
    Producents,
    Product,
    Products,
    Promo,
    Promos,
    Warianty,
} from "./models/Products";
import { sys } from "typescript";
import * as fs from "fs";
import path = require("path");

async function createProduct(val: Products) {
    const kategorie = await Promise.all(
        val.kategoria.map(async (val) => {
            console.log(val);
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
    const object = Product.create(val);
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

export async function saveCategoryFile() {
    const r: Record<string, string[]> = {};
    const file = path.join(process.cwd(), "kategorie.json");
    const kategorie = await Category.find();
    kategorie.forEach((val) => {
        (r[val.slug] ??= []).push(val.nazwa);
    });
    fs.writeFileSync(file, JSON.stringify(r));
    sys.exit();
    return 0;
}
(async () => {
    try {
        mongoose.connection.on("connected", () =>
            console.log("MongoDB connected")
        );
        mongoose.connection.on("error", (err) =>
            console.log("Mongo error:", err)
        );
        await mongoose.connect("mongodb://127.0.0.1:27017/fryzjerpremium");

        const promos: Promos[] = [
            {
                nazwa: "lll",
                procent: 10,
                rozpoczecie: new Date(),
                wygasa: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            },
            {
                nazwa: "black friday",
                procent: 20,
                rozpoczecie: new Date(),
                wygasa: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
        ];

        const media: Media[] = [
            {
                nazwa: "Baner",
                slug: "baner",
                typ: "image",
                alt: "baner",
                path: "/path/to/baner.jpg",
            },
            {
                nazwa: "fotel_jakistam",
                slug: "fotel_1",
                typ: "image",
                alt: "fotel",
                path: "/path/to/fotel.jpg",
            },
            {
                nazwa: "jakiswykresczycos",
                slug: "wykres",
                typ: "other",
                alt: "wykres",
                path: "/path/to/photo.xxx",
            },
        ];

        const categories: Categories[] = [
            {
                nazwa: "Fotel",
                slug: "sprzet",
                image: "/path/to/baner.jpg",
            },
            {
                nazwa: "Szampon",
                slug: "kosmetyk",
                image: "/path/to/baner.jpg",
            },
            {
                nazwa: "Odżywka",
                slug: "kosmetyk",
                image: "/path/to/baner.jpg",
            },
            {
                nazwa: "Spray",
                slug: "kosmetyk",
                image: "/path/to/baner.jpg",
            },
            {
                nazwa: "Nożyczki",
                slug: "sprzet",
                image: "/path/to/baner.jpg",
            },
        ];

        const producents: Producents[] = [
            {
                nazwa: "Marka wlasna",
                slug: "wlasna",
            },
            {
                nazwa: "Bielenda",
                slug: "bielenda",
                strona_internetowa: "https://okok.pl",
            },
        ];

        const wariant: Warianty[] = [
            {
                nazwa: "Czarny",
                slug: "czarny",
                typ: "kolor",
                kolory: { name: "czarny", val: "black" },
            },
            {
                nazwa: "Niebieski",
                slug: "niebieski",
                typ: "kolor",
                kolory: { name: "niebieski", val: "blue" },
                nadpisuje_cene: true,
                nowa_cena: 1699.0,
            },
            {
                nazwa: "Czerwony",
                slug: "czerwony",
                typ: "kolor",
                kolory: { name: "czerwony", val: "red" },

                nadpisuje_cene: true,
                nowa_cena: 1799.0,
            },
            {
                nazwa: "120ml",
                slug: "120ml",
                typ: "objetosc",
                objetosc: 120,
            },
            {
                nazwa: "250ml",
                slug: "250ml",
                typ: "objetosc",
                objetosc: 250,
                nadpisuje_cene: true,
                nowa_cena: 50.0,
            },
            {
                nazwa: "480ml",
                slug: "480ml",
                typ: "objetosc",
                objetosc: 480,
                nadpisuje_cene: true,
                nowa_cena: 75.0,
            },
            {
                nazwa: "L",
                slug: "long",
                typ: "rozmiar",
                rozmiary: { name: "L", val: "L" },
            },
            {
                nazwa: "XL",
                slug: "extralong",
                typ: "rozmiar",
                nadpisuje_cene: true,
                nowa_cena: 149.0,
                rozmiary: { name: "XL", val: "XL" },
            },
        ];

        const product: Products[] = [
            {
                slug: "",
                nazwa: "Fotel męski do strzyżenia",
                cena: 1499.99,
                dostepnosc: "Ograniczona",
                kategoria: [categories[0]],
                producent: "Marka wlasna",
                media: [media[0], media[1]],
                promocje: "lll",
                opis: "Fotel męski, idealnie wyprofilowany pod każdego mężczyne",
                ilosc: 10,
                czas_wysylki: 15,
                kod_produkcyjny: "ABC-123",
                ocena: 4.5,
                wariant: [wariant[0], wariant[1]],
                opinie: [
                    {
                        uzytkownik: "Andrzej K.",
                        tresc: "Idealnie wykończony. Każdy klient jest zadowolony z usługi, międzyinnymi przez ten wygodny fotel",
                        ocena: 5,
                    },
                    {
                        uzytkownik: "Kapral Kaszmirov",
                        tresc: "Na zdjęciach wygląda lepiej niż jak w rzeczywistości",
                        ocena: 3,
                    },
                ],
                createdAt: new Date(),
            },
            {
                slug: "",
                nazwa: "Piórnik dla narzędzi techniki rzemieślniczej",
                cena: 49.99,
                dostepnosc: "Duża",
                kategoria: [categories[4]],
                producent: "Marka wlasna",
                media: [media[1], media[2]],
                promocje: "lll",
                opis: "Piórnik idealny do przechowywania swoich narzędzi",
                ilosc: 100,
                czas_wysylki: 2,
                kod_produkcyjny: "ABC-1234",
                ocena: 4.9,
                opinie: [
                    {
                        uzytkownik: "Adrianna L.",
                        tresc: "Idealnie dopasowany pod każdy możliwy typ narzędzia. Polecam!!",
                        ocena: 5,
                    },
                    {
                        uzytkownik: "Mariusz D.",
                        tresc: "Gówno!!",
                        ocena: 1,
                    },
                ],
                createdAt: new Date(),
            },
            {
                slug: "",
                nazwa: "Szampon pielęgnujący do brody",
                cena: 40,
                dostepnosc: "Duza",
                kategoria: [categories[1]],
                producent: "Bielenda",
                media: [media[2]],
                promocje: "black friday",
                opis: "Szampon pielęgnujący i dodający objętości włosom",
                ilosc: 200,
                czas_wysylki: 1,
                kod_produkcyjny: "BCD-123",
                ocena: 5,
                wariant: [wariant[2], wariant[3], wariant[4]],
                opinie: [
                    {
                        uzytkownik: "Admirov Kaszmir",
                        tresc: "No cieżko żeby to było średnie...",
                        ocena: 5,
                    },
                ],
                createdAt: new Date(),
            },
            {
                slug: "",
                nazwa: "Szampon pielęgnujący do włosów",
                cena: 40,
                dostepnosc: "Duza",
                kategoria: [
                    categories[1],
                    {
                        nazwa: "Szampon do włosów",
                        slug: "kosmetyk",
                        image: "/path/to/baner.jpg"
                    } as Categories,
                ],
                producent: "Bielenda",
                media: [media[2]],
                promocje: "black friday",
                opis: "Szampon pielęgnujący i dodający objętości włosom",
                ilosc: 200,
                czas_wysylki: 1,
                kod_produkcyjny: "BCD-123",
                ocena: 5,
                wariant: [wariant[2], wariant[3], wariant[4]],
                opinie: null,
                createdAt: new Date(),
            },
        ];

        for (const val of promos) {
            const exists = await Promo.findOne({ nazwa: val.nazwa });
            if (exists === null) {
                const p = await Promo.create(val);
            }
        }
        for (const val of categories) {
            const exists = await Category.findOne({ nazwa: val.nazwa });
            if (exists === null) {
                const p = await Category.create(val);
            }
        }

        for (const val of producents) {
            const exists = await Producent.findOne({ nazwa: val.nazwa });
            if (exists === null) {
                const p = await Producent.create(val);
            }
        }
        for (const val of product) {
            console.log(val);
            const slug =
                val.slug === ""
                    ? val.nazwa.toLowerCase().split(" ").join("-")
                    : val.slug;
            val.slug = slug;
            const exists = await Product.findOne({ nazwa: val.nazwa });
            if (exists === null) {
                const p = await createProduct(val);
            }
        }
        await find();
        await saveCategoryFile();
        sys.exit();
        return 0;
    } catch (err) {
        console.log(err);
        sys.exit();
        return 0;
    }
})();
