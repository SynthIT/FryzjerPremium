import { NextRequest, NextResponse } from "next/server";
import { LogService } from "@/lib/log_service";

export async function POST(request: NextRequest) {
    try {
        const { message, type }: { message: string; type: string } =
            await request.json();

        const logService = new LogService({
            kind: type as "log" | "error" | "warn",
            position: "front",
            http: request.method,
            path: request.url || "url",
        });

        if (type === "error") {
            logService.error(message);
        } else if (type === "warn") {
            // LogService nie ma warn, ale ma warn w config
            // Załóżmy, że używa log dla warn
            logService.log(message);
        } else {
            logService.log(message);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to log" }, { status: 500 });
    }
}
