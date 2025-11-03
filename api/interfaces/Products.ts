export interface Products {
    id: number;
    nazwa: string;
    kategoria: string;
    cena: number;
    dostepnosc: string;
    promocja?: Promos;
}

export interface Products_With_Details extends Products {
    opis: string;
    ilosc: number;
    producent: string;
    czas_wysylki: number;
    kod_produkcyjny: string;
    kod_ean?: string;
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

export class Products_Detail implements Products_With_Details {
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
    promocja?: Promos | undefined;
    kod_ean?: string | undefined;
    constructor(conf: Products_With_Details) {
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
        this.promocja = conf.promocja;
        this.kod_ean = conf.kod_ean;
    }
}

export class Product_Card implements Products {
    id: number;
    nazwa: string;
    kategoria: string;
    cena: number;
    dostepnosc: string;
    promocja?: Promos | undefined;
    constructor(conf: Products) {
        this.id = conf.id;
        this.nazwa = conf.nazwa;
        this.kategoria = conf.kategoria;
        this.cena = conf.cena;
        this.dostepnosc = conf.dostepnosc;
        this.promocja = conf.promocja;
    }
}
