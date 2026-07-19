import { useMemo } from "react";
import { OrderList } from "../types/userTypes";
import { Products } from "../types/productTypes";
import { Courses } from "../types/coursesTypes";
import { Analist } from "../types/analistTypes";
import { OrderStatus } from "../types/orderTypes";

export const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
] as const;

export type ChartRow = { name: string; value: number; ym: number };

export type MonthlyAmount = {
    name: string;
    value: number;
    ym: number;
};

const PAID_STATUSES = new Set<OrderStatus>([
    "opłacone",
    "w_realizacji",
    "wyslane",
    "zrealizowane",
]);

function orderDate(order: OrderList): Date | null {
    if (order.data_zamowienia) return new Date(order.data_zamowienia);
    if (order.createdAt) return new Date(order.createdAt);
    return null;
}

function orderMonthMeta(order: OrderList): { name: string; ym: number } | null {
    const d = orderDate(order);
    if (!d || Number.isNaN(d.getTime())) return null;
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return {
        name: `${month} '${String(year).slice(-2)}`,
        ym: year * 12 + d.getMonth(),
    };
}

function orderProductName(data: Date, name: string): { name: string; ym: number } {
    const d = new Date(data);
    const year = d.getFullYear();
    return {
        name: `${name}`,
        ym: year * 12 + d.getMonth(),
    };
}

function sortChartRows(rows: ChartRow[]): ChartRow[] {
    return [...rows].sort((a, b) => a.ym - b.ym);
}

function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}

function mergeByYm(a: ChartRow[], b: ChartRow[]): ChartRow[] {
    const byYm = new Map<number, ChartRow>();
    for (const row of [...a, ...b]) {
        const existing = byYm.get(row.ym);
        if (existing) {
            existing.value = roundMoney(existing.value + row.value);
        } else {
            byYm.set(row.ym, { ...row });
        }
    }
    return sortChartRows(Array.from(byYm.values()));
}

function paidOrders(orders: OrderList[]): OrderList[] {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);
    return orders.filter((order) => {
        if (!PAID_STATUSES.has(order.status as OrderStatus)) return false;
        const d = orderDate(order);
        return d != null && !Number.isNaN(d.getTime()) && d >= cutoff;
    });
}

function addMonthlyValue(
    rows: ChartRow[],
    meta: { name: string; ym: number },
    delta: number,
) {
    if (delta <= 0) return;
    const amount = roundMoney(delta);
    const row = rows.find((item) => item.ym === meta.ym);
    if (row) {
        row.value = roundMoney(row.value + amount);
    } else {
        rows.push({ name: meta.name, ym: meta.ym, value: amount });
    }
}

function addMonthlyAmount(
    rows: MonthlyAmount[],
    meta: { name: string; ym: number },
    delta: number,
) {
    if (delta <= 0) return;
    const row = rows.find((item) => item.name === meta.name && item.ym === meta.ym);
    if (row) {
        row.value += delta;
    } else {
        rows.push({ name: meta.name, ym: meta.ym, value: delta });
    }
}


function productLineRevenue(order: OrderList): number {
    return order.produkty.reduce(
        (acc, product) => acc + product.cena * product.ilosc,
        0,
    );
}

function courseLineRevenue(order: OrderList): number {
    return order.kursy.reduce(
        (acc, course) => acc + course.cena * course.ilosc,
        0,
    );
}

function productLineProfit(order: OrderList): number {
    return order.produkty.reduce((acc, product) => {
        const item = product.pozycja as Products | undefined;
        const skup = item?.cena_skupu ?? 0;
        return acc + product.cena * product.ilosc - skup * product.ilosc;
    }, 0);
}

function courseLineProfit(order: OrderList): number {
    return order.kursy.reduce((acc, course) => {
        const lineTotal = course.cena * course.ilosc;
        const item = course.pozycja as Courses | undefined;
        const prowizja = item?.prowizja ?? 0;
        if (prowizja <= 0) return acc + lineTotal;

        const commission =
            item?.prowizja_typ === "kwota"
                ? prowizja * course.ilosc
                : (lineTotal * prowizja) / 100;

        return acc + Math.max(0, lineTotal - commission);
    }, 0);
}

function as<T extends "kursy" | "produkty">(item: OrderList[T][number]["pozycja"]): T extends "kursy" ? Courses | null : Products | null {
    return item && typeof item === "object" && "nazwa" in item
        ? (item as T extends "kursy" ? Courses : Products)
        : null;
}

export function useAnalists(orders: OrderList[], analists: Analist[]) {
    /** Przychód ogółem z produktów -> do wykresu */
    const overallRevenueFromProducts = useMemo(() => {
        const overallRevenue: ChartRow[] = [];
        paidOrders(orders).forEach((order) => {
            const meta = orderMonthMeta(order);
            if (!meta) return;
            addMonthlyValue(
                overallRevenue,
                meta,
                productLineRevenue(order),
            );
        });
        return sortChartRows(overallRevenue);
    }, [orders]);

    const overallRevenueFromCourses = useMemo(() => {
        const overallRevenue: ChartRow[] = [];
        paidOrders(orders).forEach((order) => {
            const meta = orderMonthMeta(order);
            if (!meta) return;
            addMonthlyValue(
                overallRevenue,
                meta,
                courseLineRevenue(order),
            );
        });
        return sortChartRows(overallRevenue);
    }, [orders]);

    /** Zysk ogółem z produktów -> do wykresu */
    const overallProfitFromProducts = useMemo(() => {
        const overallProfit: ChartRow[] = [];
        paidOrders(orders).forEach((order) => {
            const meta = orderMonthMeta(order);
            if (!meta) return;
            addMonthlyValue(
                overallProfit,
                meta,
                productLineProfit(order),
            );
        });
        return sortChartRows(overallProfit);
    }, [orders]);


    const overallProfitFromCourses = useMemo(() => {
        const overallProfitFromCourses: ChartRow[] = [];
        paidOrders(orders).forEach((order) => {
            const meta = orderMonthMeta(order);
            if (!meta) return;
            addMonthlyValue(
                overallProfitFromCourses,
                meta,
                courseLineProfit(order),
            );
        });
        return sortChartRows(overallProfitFromCourses);
    }, [orders]);

    /** Sprzedane produkty po nazwie -> tabelki */
    const soldProductsByName = useMemo(() => {
        const soldProductsByName: { name: string; value: number }[] = [];
        paidOrders(orders).forEach((order) => {
            order.produkty.forEach((product) => {
                const item = as<"produkty">(product.pozycja);
                if (!item?.nazwa) return;
                const row = soldProductsByName.find(
                    (entry) => entry.name === item.nazwa,
                );
                if (!row) {
                    soldProductsByName.push({
                        name: item.nazwa,
                        value: product.ilosc,
                    });
                } else {
                    row.value += product.ilosc;
                }
            });
        });
        return soldProductsByName;
    }, [orders]);

    const soldCoursesByName = useMemo(() => {
        const soldCoursesByName: { name: string; value: number }[] = [];
        paidOrders(orders).forEach((order) => {
            order.kursy.forEach((course) => {
                const item = as<"kursy">(course.pozycja);
                if (!item?.nazwa) return;
                const row = soldCoursesByName.find(
                    (entry) => entry.name === item.nazwa,
                );
                if (!row) {
                    soldCoursesByName.push({
                        name: item.nazwa,
                        value: course.ilosc,
                    });
                } else {
                    row.value += course.ilosc;
                }
            });
        });
        return soldCoursesByName;
    }, [orders]);

    /** Sprzedane produkty po nazwie -> do tabelki  */
    const soldProductNameInMonth = (range: number) => {
        const soldProductNameInMonth: {
            name: string;
            value: number;
            ym: number;
        }[] = [];

        const today = new Date();
        const minYm = today.getFullYear() * 12 + today.getMonth() - range + 1;

        paidOrders(orders).forEach((order) => {
            const d = orderDate(order);
            if (!d) return;
            order.produkty.forEach((product) => {
                const item = as<"produkty">(product.pozycja);
                const wariant = product.wariant;
                if (!item?.nazwa) return;
                const meta = orderProductName(
                    d,
                    item.nazwa + (wariant ? ` (${wariant})` : ""),
                );
                if (meta.ym < minYm) return;
                addMonthlyAmount(soldProductNameInMonth, meta, product.ilosc);
            });
        });
        return soldProductNameInMonth;
    };

    const restockProducts = useMemo(() => {
        const restockProducts: { name: string; value: number }[] = [];
        analists.forEach((analist) => {
            const row = restockProducts.find(
                (entry) => entry.name === analist.nazwa,
            );
            if (!row) {
                restockProducts.push({
                    name: analist.nazwa,
                    value: analist.delta,
                });
            }
        });
        return restockProducts;
    }, [analists]);

    const priceChanges = useMemo(() => {
        const priceChanges: { name: string; value: number }[] = [];
        analists.forEach((analist) => {
            const row = priceChanges.find(
                (entry) => entry.name === analist.nazwa,
            );
            if (!row) {
                priceChanges.push({
                    name: analist.nazwa,
                    value: analist.pop_cena! - analist.cena,
                });
            } else {
                row.value += analist.pop_cena! - analist.cena;
            }
        });
        return priceChanges;
    }, [analists]);

    const bestProducts = useMemo(() => {
        return [...soldProductsByName]
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [soldProductsByName]);

    const bestCourses = useMemo(() => {
        return [...soldCoursesByName]
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [soldCoursesByName]);

    const overallRevenue = useMemo(
        () => mergeByYm(overallRevenueFromProducts, overallRevenueFromCourses),
        [overallRevenueFromProducts, overallRevenueFromCourses],
    );

    const overallProfit = useMemo(
        () => mergeByYm(overallProfitFromProducts, overallProfitFromCourses),
        [overallProfitFromProducts, overallProfitFromCourses],
    );

    return {
        overallRevenueFromProducts,
        overallProfitFromProducts,
        overallRevenueFromCourses,
        overallProfitFromCourses,
        soldProductsByName,
        soldCoursesByName,
        soldProductNameInMonth,
        bestProducts,
        bestCourses,
        overallRevenue,
        overallProfit,
        restockProducts,
        priceChanges,
    };
}
