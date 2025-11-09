import mongoose from "mongoose";
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
} from "./models/Products";
import { sys } from "typescript";
import * as fs from "fs";
import path = require("path");

(async () => {
    mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
    try {
        const data = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const promocja: Promos = {
            nazwa: "B",
            procent: 10,
            rozpoczecie: new Date(),
            wygasa: data,
        };
        (await Promo.where({ nazwa: promocja.nazwa })).length >= 1
            ? null
            : Promo.create(promocja)
                  .then((response) => {
                      console.log(response);
                  })
                  .catch((err) => {
                      console.error(err);
                  });
        const media: Media = {
            nazwa: "obb",
            slug: "aa",
            typ: "image",
            alt: "bvas",
            path: "//path/to/photo.jpg",
        };
        const kategoria: Categories = {
            nazwa: "Biale",
            slug: "bbb",
        };
        (await Category.where({ nazwa: kategoria.nazwa })).length >= 1
            ? null
            : Category.create(kategoria)
                  .then((response) => {
                      console.log(response);
                  })
                  .catch((err) => {
                      console.error(err);
                  });
        const producent: Producents = {
            nazwa: "Wielkie biale kutasy INC",
            slug: "WbcINC",
        };
        (await Producent.where({ nazwa: producent.nazwa })).length >= 1
            ? null
            : Producent.create(producent)
                  .then((response) => {
                      console.log(response);
                  })
                  .catch((err) => {
                      console.error(err);
                  });
        const produkt: Products = {
            nazwa: "Bialy ladny tshirt",
            cena: 149.99,
            dostepnosc: "duza",
            kategoria: await Category.find({ nazwa: "Biale" }).then(
                ([val]) => val._id
            ),
            producent: await Producent.find({ slug: "WbcINC" }).then(
                ([val]) => val._id
            ),
            media: [media],
            promocje: await Promo.find({ nazwa: "B" }).then(([val]) => val._id),
            opis: "Wielki czarny kutas",
            ilosc: 10,
            czas_wysylki: 5,
            kod_produkcyjny: "abcdd",
        };
        (await Product.where({ nazwa: produkt.nazwa })).length >= 1
            ? null
            : Product.create(produkt)
                  .then((response) => {
                      console.log(response);
                  })
                  .catch((err) => {
                      console.error(err);
                  });
        await Product.find()
            .populate("kategoria")
            .populate("promocje")
            .populate("producent")
            .orFail()
            .then((prod) => {
                console.log(prod);
                fs.writeFileSync(
                    path.join(__dirname + "\\produkty.json"),
                    JSON.stringify(prod)
                );
            });

        sys.exit();
        return 0;
    } catch (err) {
        console.log(err);
        sys.exit();
        return 0;
    }
})();
