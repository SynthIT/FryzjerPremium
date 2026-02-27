import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const filename = decodeURIComponent(req.headers.get("X-File-Name") || "bez_nazwy");
        const parent = decodeURIComponent(req.headers.get("X-File-Parent") || "uploads");
        const pathfile = `${parent}/${filename}`;
        const file = await req.arrayBuffer();
        const blob = await put(pathfile, file, {
            access: "public",
        });
        return NextResponse.json({
            image: {
                url: blob.url,
                downloadUrl: blob.downloadUrl ?? blob.url,
                pathname: blob.pathname,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}