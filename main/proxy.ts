import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- Rate limiter (in-memory, per Edge instance – bez Redis) ---
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuta
const LIMITS = {
    "/api/v1/auth/login": 10,
    "/api/v1/auth/register": 5,
    "/admin": 60,
} as const;

const store = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string | null {
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        null;
    return ip || null;
}

function isRateLimited(pathPrefix: keyof typeof LIMITS, ip: string): boolean {
    maybeCleanup();
    const key = `${pathPrefix}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry) {
        store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }
    if (now >= entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }
    entry.count++;
    if (entry.count > LIMITS[pathPrefix]) {
        return true;
    }
    return false;
}

// Okresowe czyszczenie starych wpisów (żeby Map nie rosła w nieskończoność)
function cleanupStore() {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
        if (now >= value.resetAt) store.delete(key);
    }
}

function maybeCleanup() {
    if (store.size > 500) cleanupStore();
}

// --- Middleware ---
export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const ip = getClientIp(req);

    // Gdy brak X-Forwarded-For / X-Real-IP (np. dev, proxy bez nagłówków) – nie limitujemy.
    // Inaczej wszyscy mieliby ten sam klucz "unknown" i jeden flood mógłby zablokować logowanie dla wszystkich.
    const applyRateLimit = ip !== null;

    // Rate limit: auth
    if (pathname === "/api/v1/auth/login") {
        if (applyRateLimit && isRateLimited("/api/v1/auth/login", ip)) {
            return NextResponse.json(
                { error: "Zbyt wiele prób logowania. Spróbuj za minutę." },
                { status: 429 }
            );
        }
        return NextResponse.next();
    }
    if (pathname === "/api/v1/auth/register") {
        if (applyRateLimit && isRateLimited("/api/v1/auth/register", ip)) {
            return NextResponse.json(
                { error: "Zbyt wiele rejestracji. Spróbuj za minutę." },
                { status: 429 }
            );
        }
        return NextResponse.next();
    }

    // Rate limit + ochrona: /admin (strony, nie API)
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/api")) {
        if (applyRateLimit && isRateLimited("/admin", ip)) {
            return NextResponse.json(
                { error: "Zbyt wiele żądań. Odczekaj chwilę." },
                { status: 429 }
            );
        }

        const authCookie = req.cookies.get("Authorization");
        if (!authCookie?.value) {
            return NextResponse.redirect(new URL("/logowanie", req.url));
        }
        const [scheme, token] = authCookie.value.split(" ");
        if (scheme !== "Bearer" || !token?.length) {
            return NextResponse.redirect(new URL("/logowanie", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin",
        "/admin/((?!api).*)",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
    ],
};
