import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Categories } from "./types/shared";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseSlugName(slug: string) {
    return `${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

export function makeSlugKeys(categories: Record<string, Categories[]>) {
    return Object.keys(categories) as Array<string>;
}

// Helper do generowania slug
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}