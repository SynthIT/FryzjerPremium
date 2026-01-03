import { DeliveryMethods, DeliveryMethodsSizes } from "./types";

const deliversize: DeliveryMethodsSizes[] = [
    {
        cena: 13.99,
        wielkosci: "20x40x12",
    },
    {
        cena: 14.99,
        wielkosci: "25x30x14",
    },
    {
        cena: 16.99,
        wielkosci: "30x50x25",
    },
    {
        cena: 20.99,
        wielkosci: "0x0x0",
    },
    {
        cena: 24.99,
        wielkosci: "0x0x0",
    },
];

export const deliver: DeliveryMethods[] = [
    {
        nazwa: "Inpost Paczkomat",
        slug: "inpost-paczkomat",
        ceny: [deliversize[0], deliversize[1]],
        czas_dostawy: "1-3 dni robocze",
        darmowa_dostawa: false,
        kwota_darmowa: 0,
        firma: "InPost",
        strona_internetowa: "inpost.pl",
    },
    {
        nazwa: "Inpost Kurier",
        slug: "inpost-kurier",
        ceny: [deliversize[0], deliversize[1], deliversize[2]],
        czas_dostawy: "2-4 dni robocze",
        darmowa_dostawa: true,
        kwota_darmowa: 300,
        firma: "InPost",
        strona_internetowa: "inpost.pl",
    },
    {
        nazwa: "Kurier",
        slug: "kurier",
        ceny: [deliversize[3]],
        czas_dostawy: "7-10 dni roboczych",
        darmowa_dostawa: false,
        kwota_darmowa: 0,
        firma: "Poczta Polska",
        strona_internetowa: "pocztapolska.pl",
    },
    {
        nazwa: "Kurier Pocztex",
        slug: "kurier",
        ceny: [deliversize[3]],
        czas_dostawy: "7-10 dni roboczych",
        darmowa_dostawa: true,
        kwota_darmowa: 500,
        firma: "Pocztex",
        strona_internetowa: "pocztex.pl",
    },
];
