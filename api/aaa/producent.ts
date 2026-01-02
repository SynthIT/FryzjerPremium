import { Producents } from "./types";

export const producent: Producents[] = [
    // [0] Marka własna
    {
        nazwa: "Marka własna",
        logo: {
            nazwa: "logo",
            slug: "logo",
            typ: "image",
            alt: "logo",
            path: "/public/media/logo.jpg",
        },
        slug: "Własna",
        strona_internetowa: "/",
    },
    // [1] Bielenda
    {
        nazwa: "Bielenda",
        logo: {
            nazwa: "logo",
            slug: "logo",
            typ: "image",
            alt: "logo",
            path: "/public/media/blogo.jpg",
        },
        slug: "Bielenda",
        strona_internetowa: "bielenda.pl",
    },
    // [2] Ciuch
    {
        nazwa: "Ciuch",
        logo: {
            nazwa: "logo",
            slug: "logo",
            typ: "image",
            alt: "logo",
            path: "/public/media/ciuch.jpg",
        },
        slug: "Ciuch",
        strona_internetowa: "ciuch.pl",
    },
];
