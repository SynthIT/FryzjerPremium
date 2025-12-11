import { Products } from "../models/Products";


export interface ProductsResponse {
    status: number;
    products?: Products[];
    product?: Products;
}
