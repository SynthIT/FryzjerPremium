import { Promos } from "./types";

export const promocje: Promos[] = [
    // [0] Black friday 10%
    {
        nazwa: "Black Friday",
        procent: 10,
        rozpoczecie: new Date(Date.now()),
        wygasa: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        aktywna: true,
    },
    // [1] Wyprzedaż marki 30%
    {
        nazwa: "Wyprzedaż marki",
        procent: 30,
        rozpoczecie: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        wygasa: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        aktywna: false,
    },
];
