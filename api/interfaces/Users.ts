export interface Users {
    id: number;
    imie: string;
    nazwisko: string,
    email: string,
    nr_domu: string;
    nr_lokalu: string;
    ulica: string;
    miasto: string;
    kraj: string;
    kod_pocztowy: string;
    telefon: string;
    nip: string | null;
    faktura: boolean;
    osoba_prywatna: boolean;
}

export class User implements Users {
    id: number;
    imie: string;
    nazwisko: string;
    email: string;
    nr_domu: string;
    nr_lokalu: string;
    ulica: string;
    miasto: string;
    kraj: string;
    kod_pocztowy: string;
    telefon: string;
    nip: string | null;
    faktura: boolean;
    osoba_prywatna: boolean;
    constructor(conf:Users) {
        this.id = conf.id;
        this.imie = conf.imie;
        this.nazwisko = conf.nazwisko;
        this.email = conf.email;
        this.nr_domu = conf.nr_domu
        this.nr_lokalu = conf.nr_lokalu;
        this.ulica = conf.ulica;
        this.miasto = conf.miasto;
        this.kraj = conf.kraj;
        this.kod_pocztowy = conf.kod_pocztowy;
        this.telefon = conf.telefon;
        this.nip = conf.nip;
        this.faktura = conf.faktura;
        this.osoba_prywatna = conf.faktura;
    }
}