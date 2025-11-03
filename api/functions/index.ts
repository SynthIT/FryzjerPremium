import { Blog_Comments, Blog_Posts } from "../interfaces/Blog";
import { Carts } from "../interfaces/Carts";
import { Products_Page, Products_Card } from "../interfaces/Products";
import { Users } from "../interfaces/Users";



export function getOne<
    T = Blog_Posts | Blog_Comments | Users | Carts | Products
>(): T {
    return;
}

export function getAll<
    T = Blog_Posts | Blog_Comments | Users | Carts | Products
>(): T[] {
    return [];
}

export function create<
    T = Blog_Posts | Blog_Comments | Users | Carts | Products
>(conf: T): any {
    return;
}
export function createBulk<
    T = Blog_Posts[] | Blog_Comments[] | Users[] | Carts[] | Products[]
>(conf: T): any {
    return;
}

export function deleteOne<
    T = Blog_Posts | Blog_Comments | Users | Carts | Products
>(conf: T): any {
    return;
}

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
