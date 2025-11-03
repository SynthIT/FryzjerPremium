interface Products {
    id: number;
    nazwa: string;
    kategoria: string;
    cena: number;
    dostepnosc: string;
}

export type Full_Products = [Products, Product_Card, Product_Page];

export interface Products_Page extends Products {
    opis: string;
    ilosc: number;
    producent: string;
    czas_wysylki: number;
    kod_produkcyjny: string;
}

export interface Products_Card extends Products {
    media: Product_Media;
}

export interface Promos {
    id: number;
    promocja: number;
    waznosc: Date;
}

export interface Product_Medias {
    id: number;
    nazwa: string;
    path: string;
}

export class Product_Media implements Product_Medias {
    id: number;
    nazwa: string;
    path: string;
    constructor(conf: Product_Medias) {
        this.id = conf.id;
        this.nazwa = conf.nazwa;
        this.path = conf.path;
    }
}

export class Product_Page implements Products_Page {
    id: number;
    nazwa: string;
    opis: string;
    kategoria: string;
    producent: string;
    cena: number;
    ilosc: number;
    czas_wysylki: number;
    kod_produkcyjny: string;
    dostepnosc: string;
    media: Product_Media[];
    constructor(conf: Products_Page) {
        this.id = conf.id;
        this.nazwa = conf.nazwa;
        this.opis = conf.opis;
        this.kategoria = conf.kategoria;
        this.producent = conf.producent;
        this.cena = conf.cena;
        this.ilosc = conf.ilosc;
        this.czas_wysylki = conf.czas_wysylki;
        this.kod_produkcyjny = conf.kod_produkcyjny;
        this.dostepnosc = conf.dostepnosc;
        this.media = conf.media;
    }
}

export class Product_Card implements Products_Card {
    media: Product_Media;
    id: number;
    nazwa: string;
    kategoria: string;
    cena: number;
    dostepnosc: string;
    constructor(conf: Product_Card) {
        this.id = conf.id;
        this.nazwa = conf.nazwa;
        this.kategoria = conf.kategoria;
        this.cena = conf.cena;
        this.dostepnosc = conf.dostepnosc;
        this.media = conf.media;
    }
}
