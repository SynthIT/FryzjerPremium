export interface Blog_Posts {
    id: number;
    slug: string;
    tytul: string;
    opis: string;
    polubienia: number;
}

export interface Blog_Post_Full extends Blog_Posts {
    komentarze?: Blog_Comments[];
}

export interface Blog_Comments {
    id: number;
    nickname: string;
    tresc: string;
    polubienia: number;
}

export class Blog_Post implements Blog_Posts {
    id: number;
    slug: string;
    tytul: string;
    opis: string;
    polubienia: number;
    constructor(conf: Blog_Posts) {
        this.id = conf.id;
        this.slug = conf.slug;
        this.tytul = conf.tytul;
        this.opis = conf.opis;
        this.polubienia = conf.polubienia;
    }
}

export class Blog_Post_Extend extends Blog_Post {
    komentarze: Blog_Comments[] | undefined;
    constructor(conf: Blog_Post_Full) {
        super(conf);
        this.komentarze = conf.komentarze;
    }
}
