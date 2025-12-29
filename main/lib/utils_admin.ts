import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Categories } from "./models/Products";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseSlugName(slug: string) {
    return `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

export function makeSlugKeys(categories: Record<string, Categories[]>) {
    return Object.keys(categories) as Array<string>;
}
