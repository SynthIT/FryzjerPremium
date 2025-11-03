import { Blog_Post_Full, Blog_Posts } from "../interfaces/Blog";
import { Carts } from "../interfaces/Carts";
import { Products } from "../interfaces/Products";
import { Users } from "../interfaces/Users";

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

type ModelName = keyof typeof tableMap;

export type ModelType<M extends ModelName> = 
    M extends "blog_wpis"
    ? Blog_Posts
    : M extends "uzytkownik"
    ? Users
    : M extends "koszyk"
    ? Carts
    : M extends "produkt"
    ? Products
    : never;

type Opt<M> = (
    M extends 'blog' ?
    {komentarze: boolean} :
    M extends 'produkt' ? {
        media: ["short", "full"], kategoria: boolean, promocja: boolean, producent: boolean,
    } : {}); 

export type ExtendedType<M extends ModelName, Opt> = 
    M extends 'blog_wpis' 
        ? Opt extends 'blog' ? Blog_Post_Full : Blog_Posts 
    : M extends 'uzytkownik' ? Users  
    : M extends 'koszyk' ? Carts
    : M extends 'produkt' 
        ? Opt extends 'produkt' ?    
