import z from "zod";
import { zodMedia, zodPromocje } from "./shared";
import { zodWarianty } from "./productTypes";

export const zodCartItem = z.object({
    id: z.string(),
    type: z.enum(["produkt", "kursy"]),
    object: z.object({
        vat: z.number(),
        promocje: zodPromocje.optional(),
        nazwa: z.string(),
        slug: z.string(),
        cena: z.number(),
        media: z.array(zodMedia),
        sku: z.string().optional(),
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