import { Blog_Post_Full, Blog_Posts } from "../interfaces/Blog";
import { Carts } from "../interfaces/Carts";
import {
    Products,
    Product_Medias,
    Products_With_Details,
} from "../interfaces/Products";
import { User_With_Cart, Users } from "../interfaces/Users";

export enum ModelEnum {
    Blog = "blog_wpis",
    Uzytkownik = "uzytkownik",
    Koszyk = "koszyk",
    Produkt = "produkt",
}

export interface Response {
    code: number;
}

export interface Response_Message extends Response {
    message?: string;
}

export interface Response_Error extends Response {
    error?: string;
}

const tableMap = {
    blog_wpis: "blog_wpisy",
    blog_komentarz: "blog_komentarze",
    uzytkownik: "uzytkownicy",
    rola: "role",
    opinia: "opinie",
    koszyk: "koszyk",
    koszyk_przedmiot: "koszyk_przedmiot",
    produkt: "produkty",
    producent: "producenci",
    produkt_media: "produkty_media",
    kategoria: "kategoria",
    promocja: "promocje",
} as const;

export type ModelName = keyof typeof tableMap;

export type NameModel = (typeof tableMap)[keyof typeof tableMap];

export type ModelType<M extends ModelName> = M extends ModelEnum.Blog
    ? Blog_Posts
    : M extends ModelEnum.Uzytkownik
    ? Users
    : M extends ModelEnum.Koszyk
    ? Carts
    : M extends ModelEnum.Produkt
    ? Products
    : never;

export type Opts<M> = M extends ModelEnum.Blog
    ? { komentarze: boolean }
    : M extends ModelEnum.Produkt
    ? { media?: "short" | "full"; full?: boolean }
    : M extends ModelEnum.Uzytkownik
    ? { koszyk?: boolean }
    : never;

export type OptsDel<M> = M extends ModelEnum.Blog
    ? { id?: number; slug?: string }
    : M extends ModelEnum.Produkt
    ? { id?: number; kod_ean?: string }
    : M extends ModelEnum.Uzytkownik
    ? { id: number }
    : M extends ModelEnum.Koszyk
    ? { id: number }
    : never;

export type ExtendedType<
    M extends ModelName,
    O extends Opts<M> | OptsDel<M>
> = M extends ModelEnum.Blog
    ? O extends { komentarze: true }
        ? Blog_Post_Full
        : Blog_Posts
    : M extends ModelEnum.Uzytkownik
    ? O extends { koszyk: true }
        ? User_With_Cart
        : Users
    : M extends ModelEnum.Koszyk
    ? Carts
    : M extends ModelEnum.Produkt
    ? O extends { media: "full"; full: true }
        ? { ["produkt"]: Products_With_Details; ["media"]: Product_Medias[] }
        : O extends { media: "short" }
        ? { ["produkt"]: Products; ["media"]: Product_Medias }
        : Products
    : never;

const u: ExtendedType<ModelEnum.Uzytkownik, { koszyk: true }> = {
    id: 0,
    imie: "",
    nazwisko: "",
    email: "",
    nr_domu: "",
    nr_lokalu: "",
    ulica: "",
    miasto: "",
    kraj: "",
    kod_pocztowy: "",
    telefon: "",
    nip: null,
    faktura: false,
    osoba_prywatna: false,
};

const p: ExtendedType<ModelEnum.Produkt, { media: "full"; full: true }> = {
    produkt: {
        opis: "",
        ilosc: 0,
        producent: "",
        czas_wysylki: 0,
        kod_produkcyjny: "",
        id: 0,
        nazwa: "",
        kategoria: "",
        cena: 0,
        dostepnosc: "",
    },
    media: [],
};

function abs<M extends ModelName, O extends Opts<M> | undefined>(
    model: M,
    options?: O | undefined
): ExtendedType<M, O>[] {
    return [];
}

abs<ModelEnum.Uzytkownik, { koszyk: true }>(ModelEnum.Uzytkownik, {
    koszyk: true,
});

abs<"koszyk", undefined>("koszyk");

abs<ModelEnum.Blog, Opts<ModelEnum.Blog>>(ModelEnum.Blog, { komentarze: true });

const res = abs<ModelEnum.Produkt, { media: "short" }>(ModelEnum.Produkt, {
    media: "short",
});

for (let i = 0; i < res.length; i++) {
    const element = res[i];
    element.media.id;
    element.produkt.cena;
    element["media"].nazwa;
}

res.forEach((a, i) => {
    a.media.id;
    a.produkt.cena;
    a["produkt"].dostepnosc;
});
