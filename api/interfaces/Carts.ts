import { Products } from "./Products";

export interface Carts {
    id: number;
    id_User: number;
    produkty: Map<string, Products>;
}
