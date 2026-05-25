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
export type OrderStatus = zod.infer<typeof orderStatus>;
export type DetailedOrderEntry = zod.infer<typeof detailedOrderEntry>;
export type CorrectionEntry = zod.infer<typeof zodCorrectionEntry>;
export type FileOrderEntry = zod.infer<typeof fileOrderEntry>;
