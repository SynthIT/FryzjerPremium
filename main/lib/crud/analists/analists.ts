import { db } from "@/lib/db/init";
import { Analistics } from "@/lib/models/Analist";
import { Analist, zodAnalist, keys } from "@/lib/types/analistTypes";
import { LogService } from "@/lib/log_service";
import { writeFileSync } from "fs";
import path from "path";

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
        const filePath = path.join(process.cwd(), "data", "analizy", `${year}-${month}.csv`);
        const analists = await Analistics.find({ createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } });
        let summary = "";
        for (const key of keys) {
            summary += key + ";";
        }
        summary += "\n";
        for (const analist of analists) {
            for (const key of keys) {
                summary += analist[key as keyof Analist] + ";";
            }
            summary += "\n";
        }
        writeFileSync(filePath, summary, "utf8");
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
        const filePath = path.join(process.cwd(), "data", "analizy", `${Date.now()}-instant.csv`);
        const beginingMonth = new Date(new Date().setDate(1));
        const analists = await Analistics.find({ createdAt: { $gte: beginingMonth } });
        let summary = "";
        for (const key of keys) {
            summary += key + ";";
        }
        summary += "\n";
        for (const analist of analists) {
            for (const key of keys) {
                summary += analist[key as keyof Analist] + ";";
            }
            summary += "\n";
        }
        writeFileSync(filePath, summary, "utf8");
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