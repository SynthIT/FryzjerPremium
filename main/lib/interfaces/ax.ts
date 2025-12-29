import { Products } from "../models/Products";
import { Users } from "../models/Users";

export interface ProductsResponse {
    status: number;
    products?: Products[];
    product?: Products;
}

export interface UsersReponse {
    status: number;
    user?: Users;
    message?: string;
}

export interface CategoriesResponse {
    status: number;
    categories?: Record<string, string[]>;
}
