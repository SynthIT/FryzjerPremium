import { Opinie } from "../models/Products";
import { readFromfile } from "./products";

export function getReviews(slug: string): Opinie[] | null {
    const products = readFromfile();
    return products.find((p) => p.slug == slug)?.opinie ?? null;
}

export function saveReview(review: Opinie, slug: string) {
    const products = readFromfile();
    products.find((p) => p.slug === slug)?.opinie?.push(review);
}
