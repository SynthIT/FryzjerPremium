import { collectCourses } from "@/lib/crud/courses/course";
import { access, writeFileSync, constants, rmSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(req: NextRequest) {
    let result = "";
    const courses = await collectCourses();
    access(path.join(process.cwd(), "data", "kursy.json"), constants.F_OK, (err) => {
        if (err) {
            writeFileSync(path.join(process.cwd(), "data", "kursy.json"), courses, "utf8");
            result = "Pomyślnie naprawiono plik cache";
        } else {
            rmSync(path.join(process.cwd(), "data", "kursy.json"));
            writeFileSync(path.join(process.cwd(), "data", "kursy.json"), courses, "utf8");
            result = "Pomyślnie naprawiono plik cache";
        }
    });
    return NextResponse.json({ status: result !== "" ? 0 : 1, response: result !== "" ? result : "Błąd podczas naprawiania pliku cache" });
}
