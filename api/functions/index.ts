import { Blog_Comments, Blog_Posts } from "../interfaces/Blog";
import { Carts } from "../interfaces/Carts";
import { Products } from "../interfaces/Products";
import { User_With_Cart, Users } from "../interfaces/Users";
import {
    ModelName,
    Opts,
    ExtendedType,
    ModelEnum,
    Response_Message,
    Response_Error,
    OptsDel,
} from "./types";

export class DatabaseClient {
    db: any;
    constructor() {}
    async getOne<T extends ModelName, O extends Opts<T>>(
        model: T,
        options: O
    ): Promise<ExtendedType<T, O>> {
        return {} as Promise<ExtendedType<T, O>>;
    }

    async getAll<T extends ModelName, O extends Opts<T>>(
        model: T,
        options: O
    ): Promise<ExtendedType<T, O>[]> {
        if (model === ModelEnum.Blog) {
        }

        return [];
    }
    async create<T extends ModelName, O extends Opts<T>>(
        model: T,
        args: ExtendedType<T, O>,
        options: O
    ): Promise<Response_Message | Response_Error> {
        const object: ExtendedType<T, O> = args;
        switch (model) {
            case ModelEnum.Produkt:
        }
        return {} as Promise<Response_Message>;
    }
    createBulk<T extends ModelName, O extends Opts<T>>(
        model: T,
        args: ExtendedType<T, O>[],
        options: O
    ): Promise<Response_Message | Response_Error> {
        return {} as Promise<Response_Message>;
    }
    deleteOne<T extends ModelName, O extends OptsDel<T>>(
        model: T,
        options: O
    ): Promise<Response_Message | Response_Error> {
        if (model === ModelEnum.Blog) {
            options.kod_ean;
        }
        return {} as Promise<Response_Message>;
    }
}

const classa = new DatabaseClient();
classa.create<ModelEnum.Uzytkownik, {}>(ModelEnum.Uzytkownik, {} as Users, {});

classa.deleteOne<ModelEnum.Produkt, { kod_ean: '2' }>(ModelEnum.Produkt, { kod_ean: '2' });

export function deleteAll<
    T = Blog_Posts[] | Blog_Comments[] | Users[] | Carts[] | Products[]
>(conf: T): any {
    return;
}

export function editOne<
    T = Blog_Posts | Blog_Comments | Users | Carts | Products
>(conf: T): any {
    return;
}

export function editAll<
    T = Blog_Posts[] | Blog_Comments[] | Users[] | Carts[] | Products[]
>(conf: T): any {
    return;
}
