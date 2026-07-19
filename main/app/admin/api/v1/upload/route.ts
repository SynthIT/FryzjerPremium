import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { checkRequestAuth } from "@/lib/admin_utils";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

function sanitizeParent(input: string, fallback: string) {
    const trimmed = (input ?? "").trim();
    if (!trimmed) return fallback;
    const cleaned = trimmed
        .replaceAll("\\", "/")
        .split("/")
        .filter(Boolean)
        .map((seg) => seg.replace(/\.\./g, "").replace(/[^a-zA-Z0-9._-]/g, "_"))
        .filter(Boolean)
        .slice(0, 3)
        .join("/");
    return cleaned || fallback;
}

function sanitizeFilename(input: string, fallback: string) {
    const trimmed = (input ?? "").trim();
    if (!trimmed) return fallback;
    const base = trimmed.replaceAll("\\", "/").split("/").pop() || fallback;
    const cleaned = base.replace(/\.\./g, "").replace(/[^a-zA-Z0-9._-]/g, "_");
    return cleaned || fallback;
}

function shouldUseLocalStorage() {
    // Lokalnie (bez tokena Blob) zapisujemy do public/uploads — także gdy NODE_ENV=production lokalnie.
    if (!process.env.BLOB_READ_WRITE_TOKEN) return true;
    return process.env.NODE_ENV !== "production";
}

export async function POST(req: NextRequest) {
    try {
        const { val, mess } = await checkRequestAuth(req, "admin:any");
        if (!val) {
            return NextResponse.json(
                { error: "Brak autoryzacji", details: mess },
                { status: 401 },
            );
        }

        const rawFilename = decodeURIComponent(
            req.headers.get("X-File-Name") || "bez_nazwy",
        );
        const rawParent = decodeURIComponent(
            req.headers.get("X-File-Parent") || "uploads",
        );

        const parent = sanitizeParent(rawParent, "uploads");
        const filename = sanitizeFilename(rawFilename, "bez_nazwy.bin");
        const pathfile = `${parent}/${filename}`;

        const contentLength = Number(req.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Plik jest za duży (max 10MB)" }, { status: 413 });
        }
        const file = await req.arrayBuffer();
        if (file.byteLength === 0) {
            return NextResponse.json({ error: "Pusty plik" }, { status: 400 });
        }
        if (file.byteLength > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Plik jest za duży (max 10MB)" }, { status: 413 });
        }

        const contentType =
            req.headers.get("content-type") ||
            "application/octet-stream";

        if (shouldUseLocalStorage()) {
            const absPath = path.join(process.cwd(), "public", "uploads", pathfile);
            await mkdir(path.dirname(absPath), { recursive: true });
            await writeFile(absPath, Buffer.from(file));
            const url = `/uploads/${pathfile}`;
            return NextResponse.json({
                image: {
                    url,
                    downloadUrl: url,
                    pathname: pathfile,
                },
            });
        }

        const blob = await put(pathfile, file, {
            access: "public",
            allowOverwrite: true,
            contentType,
        });
        return NextResponse.json({
            image: {
                url: blob.url,
                downloadUrl: blob.url,
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
