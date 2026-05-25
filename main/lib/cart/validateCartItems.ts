import { Product } from "@/lib/models/Products";
import { Course } from "@/lib/models/Courses";
import { Cart, CartItem } from "@/lib/types/cartTypes";
import { Warianty } from "@/lib/types/productTypes";
import { Promos } from "@/lib/types/shared";
import { DetailedOrderEntry } from "@/lib/types/userTypes";
import { Types } from "mongoose";
import { linePriceBrutto } from "./pricing";
import {
    availableQuantity,
    VIRTUAL_BASE_VARIANT_SLUG,
} from "./stock";

const VIRTUAL_BASE_SLUG = VIRTUAL_BASE_VARIANT_SLUG;
const PRICE_EPS = 0.02;

type ProductLean = {
    _id: Types.ObjectId;
    sku: string;
    cena: number;
    vat: number;
    ilosc: number;
    wariant?: Warianty[];
    promocje?: Promos | null;
};

type CourseLean = {
    _id: Types.ObjectId;
    slug: string;
    cena: number;
    vat: number;
    promocje?: Promos | null;
};

export type CartItemChange = { reason: string; item: CartItem };

export type ValidatedCart = {
    updatedCart: CartItem[];
    refProducts: DetailedOrderEntry[];
    refCourses: DetailedOrderEntry[];
    changedEntries: CartItemChange[];
};

function resolveVariant(
    warianty: Warianty[],
    clientSlug?: string,
): { index: number; wariant?: Warianty; error?: string } {
    if (warianty.length === 0) {
        if (clientSlug && clientSlug !== VIRTUAL_BASE_SLUG) {
            return { index: -1, error: "Ten produkt nie ma wariantów" };
        }
        return { index: -1 };
    }

    if (!clientSlug || clientSlug === VIRTUAL_BASE_SLUG) {
        return { index: 0, wariant: warianty[0] };
    }

    const index = warianty.findIndex((w) => w.slug === clientSlug);
    if (index === -1) {
        return { index: -1, error: "Wariant nie jest już dostępny" };
    }
    return { index, wariant: warianty[index] };
}

function validateProductLine(
    item: CartItem,
    product: ProductLean,
): {
    keep: boolean;
    item?: CartItem;
    entry?: DetailedOrderEntry;
    changes: string[];
} {
    const warianty = (product.wariant ?? []) as Warianty[];
    const { index, wariant, error } = resolveVariant(
        warianty,
        item.wariant?.slug,
    );

    if (error) {
        return {
            keep: false,
            changes: [
                `${error}${item.wariant?.nazwa ? ` (${item.wariant.nazwa})` : ""}. Pozycja usunięta z koszyka.`,
            ],
        };
    }

    const maxQty = availableQuantity(
        product.ilosc,
        warianty,
        index,
        wariant,
    );

    if (maxQty <= 0) {
        return {
            keep: false,
            changes: [
                `Brak towaru na stanie${wariant?.nazwa ? ` — ${wariant.nazwa}` : ""}. Pozycja usunięta z koszyka.`,
            ],
        };
    }

    const changes: string[] = [];
    let quantity = item.quantity;

    if (quantity <= 0) {
        return {
            keep: false,
            changes: ["Nieprawidłowa ilość. Pozycja usunięta z koszyka."],
        };
    }

    if (quantity > maxQty) {
        quantity = maxQty;
        changes.push(
            `Brak wystarczającej ilości (dostępne: ${maxQty}). Ilość została zmniejszona.`,
        );
    }

    const promocje = (product.promocje ?? null) as Promos | null;
    const serverPrice = linePriceBrutto(
        product.cena,
        product.vat ?? 23,
        wariant,
        promocje,
    );

    let price = serverPrice;
    if (Math.abs(item.price - serverPrice) > PRICE_EPS) {
        price = serverPrice;
        changes.push(
            wariant?.nazwa
                ? `Zaktualizowano cenę wariantu: ${wariant.nazwa}.`
                : "Zaktualizowano cenę produktu.",
        );
    }

    const updatedItem: CartItem = {
        ...item,
        quantity,
        price,
        ...(wariant
            ? {
                wariant: {
                    ...wariant,
                    ilosc: maxQty,
                },
            }
            : {}),
    };

    return {
        keep: true,
        item: updatedItem,
        entry: {
            ilosc: quantity,
            cena: price,
            pozycja: String(product._id),
            wariant: wariant?.slug,
        },
        changes,
    };
}

function validateCourseLine(
    item: CartItem,
    course: CourseLean,
): {
    keep: boolean;
    item?: CartItem;
    entry?: DetailedOrderEntry;
    changes: string[];
} {
    const promocje = (course.promocje ?? null) as Promos | null;
    const serverPrice = linePriceBrutto(
        course.cena,
        course.vat ?? 23,
        undefined,
        promocje,
    );

    const changes: string[] = [];
    let price = serverPrice;
    if (Math.abs(item.price - serverPrice) > PRICE_EPS) {
        price = serverPrice;
        changes.push("Zaktualizowano cenę kursu.");
    }

    const quantity = Math.max(1, item.quantity);
    if (quantity !== item.quantity) {
        changes.push("Ilość kursu ustawiona na 1.");
    }

    return {
        keep: true,
        item: { ...item, quantity, price },
        entry: {
            ilosc: quantity,
            cena: price,
            pozycja: String(course._id),
        },
        changes,
    };
}

export async function validateCartItems(koszyk: Cart): Promise<ValidatedCart> {
    const items = koszyk.items ?? [];
    const productSkus = [
        ...new Set(
            items
                .filter((i) => i.type === "produkt" && i.object.sku)
                .map((i) => i.object.sku as string),
        ),
    ];
    const courseSlugs = [
        ...new Set(
            items
                .filter((i) => i.type === "kursy")
                .map((i) => i.object.slug),
        ),
    ];

    const [products, courses] = await Promise.all([
        productSkus.length
            ? Product.find({ sku: { $in: productSkus }, aktywne: true })
                .populate("promocje")
                .select("sku cena vat ilosc wariant promocje")
                .lean<ProductLean[]>()
            : Promise.resolve([] as ProductLean[]),
        courseSlugs.length
            ? Course.find({ slug: { $in: courseSlugs }, aktywne: true })
                .populate("promocje")
                .select("slug cena vat promocje")
                .lean<CourseLean[]>()
            : Promise.resolve([] as CourseLean[]),
    ]);

    const productBySku = new Map(products.map((p) => [p.sku, p]));
    const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

    const updatedCart: CartItem[] = [];
    const refProducts: DetailedOrderEntry[] = [];
    const refCourses: DetailedOrderEntry[] = [];
    const changedEntries: CartItemChange[] = [];
    let inFlightSum = 0;

    for (const item of items) {
        try {
            if (inFlightSum + item.price * item.quantity >999999.99) {
                changedEntries.push({
                    reason: "Suma zamówienia przekroczyła 999999.99 zł. Pozycja usunięta z koszyka.",
                    item,
                });
                continue;
            }
            inFlightSum += item.price * item.quantity;
            if (item.type === "produkt") {
                const sku = item.object.sku;
                if (!sku) {
                    changedEntries.push({
                        reason: "Brak SKU produktu. Pozycja usunięta z koszyka.",
                        item,
                    });
                    continue;
                }
                const product = productBySku.get(sku);
                if (!product) {
                    changedEntries.push({
                        reason: "Produkt jest niedostępny lub nieaktywny. Pozycja usunięta z koszyka.",
                        item,
                    });
                    continue;
                }
                const result = validateProductLine(item, product);
                for (const msg of result.changes) {
                    changedEntries.push({ reason: msg, item });
                }
                if (result.keep && result.item && result.entry) {
                    updatedCart.push(result.item);
                    refProducts.push(result.entry);
                }
                continue;
            }

            if (item.type === "kursy") {
                const course = courseBySlug.get(item.object.slug);
                if (!course) {
                    changedEntries.push({
                        reason: "Kurs jest niedostępny lub nieaktywny. Pozycja usunięta z koszyka.",
                        item,
                    });
                    continue;
                }
                const result = validateCourseLine(item, course);
                for (const msg of result.changes) {
                    changedEntries.push({ reason: msg, item });
                }
                if (result.keep && result.item && result.entry) {
                    updatedCart.push(result.item);
                    refCourses.push(result.entry);
                }
            }
        } catch {
            changedEntries.push({
                reason: "Pozycja w koszyku jest już niedostępna.",
                item,
            });
        }
    }

    return { updatedCart, refProducts, refCourses, changedEntries };
}

export function cartOrderSuma(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
