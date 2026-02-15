import z from "zod";
import { zodMedia } from "./shared";
import { zodWarianty } from "./productTypes";

export const zodCartItem = z.object({
    id: z.string(),
    product: z.object({
        nazwa: z.string(),
        slug: z.string(),
        cena: z.number(),
        media: z.array(zodMedia),
    }),
    quantity: z.number(),
    price: z.number(),
    wariant: zodWarianty.optional(),
});

export const zodCart = z.object({
    id: z.string(),
    items: z.array(zodCartItem),
});

export type Cart = z.infer<typeof zodCart>;
export type CartItem = z.infer<typeof zodCartItem>;