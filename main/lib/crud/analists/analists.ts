import { db } from "@/lib/db/init";
import { Analistics } from "@/lib/models/Analist";
import { Analist, zodAnalist } from "@/lib/types/analistTypes";
import { LogService } from "@/lib/log_service";
import { writeFileSync } from "fs";
import path from "path";
import { roundMoney } from "@/lib/admin/pricing";
import { Products, Warianty } from "@/lib/types/productTypes";

const file = new LogService({
    kind: "log",
    position: "api",
    http: "GET",
    path: "/api/v1/analists",
});

const error = new LogService({
    kind: "error",
    position: "api",
    http: "GET",
    path: "/api/v1/analists",
});

export async function collectAnalists() {
    await db();
    const analists = await Analistics.find();
    return JSON.stringify(analists);
}

export async function createAnalist(analist: Analist): Promise<Analist | { error: string }> {
    const ok = zodAnalist.safeParse(analist);
    if (!ok.success) {
        error.error(ok.error.message);
        return { error: ok.error.message };
    }
    try {
        await db();
        const newAnalist = await Analistics.create(ok.data);
        file.log(`Analista: ${newAnalist.sku} - (${newAnalist.nazwa}) została dodany do bazy danych`);
        return newAnalist;
    } catch (e) {
        error.error(`${e}`);
        return { error: `${e}` };
    }
}

export async function makeMonthSummary() {
    try {
        await db();
        const month = new Date().getMonth() > 9 ? `0${new Date().getMonth() + 1}` : `${new Date().getMonth() + 1}`;
        const year = new Date().getFullYear();
        const analists = await Analistics.find({ createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } });
        new LogService({
            kind: "log",
            position: "api",
            http: "GET",
            path: "/api/v1/analists",
        }).log(`Miesięczna analiza została utworzona pomyślnie dla: ${month}-${year}`);
        return { status: 0, message: "Miesięczna analiza została utworzona pomyślnie" };
    } catch (e) {
        error.error(`${e}`);
        return { status: 1, error: `${e}` };
    }
}

export async function makeInstantSummary() {
    try {
        await db();
        const beginingMonth = new Date(new Date().setDate(1));
        const analists = await Analistics.find({ createdAt: { $gte: beginingMonth } });

        new LogService({
            kind: "log",
            position: "api",
            http: "GET",
            path: "/api/v1/analists",
        }).log(`Miesięczna analiza została utworzona pomyślnie dla: ${Date.now()} od ${beginingMonth.toISOString()}`);
        return { status: 0, message: "Miesięczna analiza została utworzona pomyślnie" };
    } catch (e) {
        error.error(`${e}`);
        return { status: 1, error: `${e}` };
    }
}

export async function getAnalistByKodProdukcyjny(kod_produkcyjny: string) {
    await db();
    const analist = await Analistics.find({ kod_produkcyjny: kod_produkcyjny });
    return analist;
}



export async function deleteAnalistEntry(sku: string) {
    try {
        await db();
        const analist = await Analistics.findOneAndDelete({ sku: sku }).orFail();
        file.log(`Analista: ${analist.sku} - (${analist.nazwa}) został usunięty`);
        return { status: 0, message: "Analista został usunięty pomyślnie" };
    } catch (e) {
        error.error(`${e}`);
        return { status: 1, error: `${e}` };
    }
}



type AnalistEntryInput = {
    sku: string;
    nazwa: string;
    wariant: string;
    cena_skupu: number;
    cena: number;
    ilosc: number;
    delta: number;
    kod_produkcyjny?: string;
    kod_ean?: string;
    pop_cena: number;
    pop_cena_skupu: number;
    pop_ilosc: number;
};

async function createAnalistEntry(payload: AnalistEntryInput) {
    try {
        await db();
        await Analistics.create({
            ...payload,
            cena: roundMoney(payload.cena),
            cena_skupu: roundMoney(payload.cena_skupu),
            pop_cena: roundMoney(payload.pop_cena),
            pop_cena_skupu: roundMoney(payload.pop_cena_skupu),
        });
    } catch (err) {
        console.error(err);
    }
}

function variantsBySlug(list: Warianty[]): Map<string, Warianty> {
    return new Map(list.map((v) => [v.slug, v]));
}

function variantPrices(product: Products, variant?: Warianty) {
    return {
        cena:
            variant?.nadpisuje_cene && variant.nowa_cena != null
                ? variant.nowa_cena
                : product.cena,
        cena_skupu:
            variant?.inna_cena_skupu && variant.cena_skupu != null
                ? variant.cena_skupu
                : product.cena_skupu,
    };
}

function productMeta(product: Products) {
    return {
        sku: product.sku,
        nazwa: product.nazwa,
        kod_produkcyjny: product.kod_produkcyjny,
        kod_ean: product.kod_ean ?? undefined,
    };
}

/** Dziennik zmian stanu/cen po edycji produktu (old → new). */
export async function analizeDataChanges(
    product_new: Products,
    product_old: Products,
) {
    if (product_new.ilosc !== product_old.ilosc && product_new.wariant?.length == 1 && product_old.wariant?.length == 1) {
        await createAnalistEntry({
            ...productMeta(product_new),
            wariant: "podstaw",
            cena_skupu: product_new.cena_skupu,
            cena: product_new.cena,
            ilosc: product_new.ilosc,
            delta: product_new.ilosc - product_old.ilosc,
            pop_cena: product_old.cena,
            pop_cena_skupu: product_old.cena_skupu,
            pop_ilosc: product_old.ilosc,
        });
    }

    const oldMap = variantsBySlug(product_old.wariant ?? []);
    const newMap = variantsBySlug(product_new.wariant ?? []);
    const slugs = new Set([...oldMap.keys(), ...newMap.keys()]);

    for (const slug of slugs) {
        await logVariantChange(
            product_new,
            product_old,
            oldMap.get(slug),
            newMap.get(slug),
        );
    }
}

async function logVariantChange(
    product_new: Products,
    product_old: Products,
    variant_old?: Warianty,
    variant_new?: Warianty,
) {
    if (!variant_old && !variant_new) return;

    const meta = productMeta(product_new);

    if (variant_old && !variant_new) {
        const prices = variantPrices(product_old, variant_old);
        await createAnalistEntry({
            ...meta,
            wariant: variant_old.slug,
            ...prices,
            ilosc: 0,
            delta: -variant_old.ilosc,
            pop_cena: prices.cena,
            pop_cena_skupu: prices.cena_skupu,
            pop_ilosc: variant_old.ilosc,
        });
        return;
    }

    if (!variant_old && variant_new) {
        const prices = variantPrices(product_new, variant_new);
        await createAnalistEntry({
            ...meta,
            wariant: variant_new.slug,
            ...prices,
            ilosc: variant_new.ilosc,
            delta: variant_new.ilosc,
            pop_cena: product_old.cena,
            pop_cena_skupu: product_old.cena_skupu,
            pop_ilosc: 0,
        });
        return;
    }

    if (!variant_old || !variant_new) return;

    const delta = variant_new.ilosc - variant_old.ilosc;
    if (delta === 0) return;

    const prices = variantPrices(product_new, variant_new);
    const popPrices = variantPrices(product_old, variant_old);
    await createAnalistEntry({
        ...meta,
        wariant: variant_new.slug,
        ...prices,
        ilosc: variant_new.ilosc,
        delta,
        pop_cena: popPrices.cena,
        pop_cena_skupu: popPrices.cena_skupu,
        pop_ilosc: variant_old.ilosc,
    });
}
