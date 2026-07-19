import zod from "zod";
import { userSchema } from "./userTypes";
import { zodDeliveryMethods } from "./deliveryTypes";
import { zodCartItem } from "./cartTypes";
import { zodProducts } from "./productTypes";
import { zodCourses } from "./coursesTypes";


export const zodCorrectionEntry = zod.object({
    ilosc: zod.number(),
    reason: zod.string(),
});

export const detailedOrderEntry = zod.object({
    ilosc: zod.number(),
    cena: zod.number(),
    koretka: zodCorrectionEntry.optional(),
    pozycja: zod.union([zod.string(), zodCartItem, zodProducts, zod.lazy(() => zodCourses)]),
    wariant: zod.string().optional(),
});

export const fileOrderEntry = zod.object({
    typ: zod.enum(["potwierdzenie", "bilet", "korekta"]),
    nazwa: zod.string(),
    url: zod.string(),
});

export const orderStatus = zod.enum(["w_koszyku", "nieudana", "opłacone", "w_realizacji", "wyslane", "zrealizowane", "anulowane"]);
export type OrderStatus = zod.infer<typeof orderStatus>;

export const orderStatusLabels: Record<OrderStatus, string> = {
    w_koszyku: "W koszyku",
    nieudana: "Nieudana",
    opłacone: "Opłacone",
    w_realizacji: "W realizacji",
    wyslane: "Wysłane",
    zrealizowane: "Zrealizowane",
    anulowane: "Anulowane",
};

export function getOrderStatusLabel(status: string | undefined | null): string {
    if (!status) return "—";
    return orderStatusLabels[status as OrderStatus] ?? status;
}

export const orderListSchema = zod.object({
    _id: zod.string().optional(),
    user: zod.union([zod.string(), zod.lazy(() => userSchema), zod.null()]),
    dane: zod.lazy(() => userSchema.partial()).optional(),
    email: zod.string(),
    status: orderStatus.default("w_koszyku"),
    numer_zamowienia: zod.string(),
    nr_faktury: zod.string().optional(),
    nr_faktury_kor: zod.array(zod.string()).optional(),
    pliki: zod.array(fileOrderEntry).optional(),
    sposob_dostawy: zod.union([
        zod.lazy(() => zodDeliveryMethods),
        zod.string(),
        zod.null(),
    ]),
    /** Wybór Apaczka (kurier / punkt) — dry lub produkcja */
    apaczka: zod
        .object({
            service_id: zod.union([zod.string(), zod.number()]),
            service_name: zod.string(),
            supplier: zod.string(),
            mode: zod.enum(["door", "point"]),
            foreign_address_id: zod.string().optional(),
            point_name: zod.string().optional(),
            point_address: zod.string().optional(),
            price_gross: zod.number(),
            dry: zod.boolean().optional(),
            /** ID zamówienia w Apaczka (po order_send) — do waybill/:order_id/ */
            order_id: zod.string().optional(),
            waybill_number: zod.string().optional(),
            tracking_url: zod.string().optional(),
        })
        .optional()
        .nullable(),
    produkty: zod.array(detailedOrderEntry),
    kursy: zod.array(detailedOrderEntry),
    reason: zod.string().optional(),
    code: zod.number().optional(),
    suma: zod.number(),
    data_zamowienia: zod.date().optional(),
    data_wystawienia_faktury: zod.date().optional(),
    data_wystawienia_faktury_kor: zod.array(zod.date()).optional(),
    data_wyslania: zod.date().optional(),
    data_zrealizowania: zod.date().optional(),
    data_anulowania: zod.date().optional(),
    createdAt: zod.date().optional(),
    updatedAt: zod.date().optional(),
    __v: zod.number().optional(),
});

export type OrderList = zod.infer<typeof orderListSchema>;
export type DetailedOrderEntry = zod.infer<typeof detailedOrderEntry>;
export type CorrectionEntry = zod.infer<typeof zodCorrectionEntry>;
export type FileOrderEntry = zod.infer<typeof fileOrderEntry>;
