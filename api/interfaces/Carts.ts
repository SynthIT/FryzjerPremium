import { Product_Card } from "./Products";

export interface Carts {
    id: number;
    id_User: number;
    produkty: Array<Product_Card>;
}

const g: Carts = {
    id: 0,
    id_User: 0,
    produkty: []
}