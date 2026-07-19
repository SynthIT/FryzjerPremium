/**
 * Maskuje URL śledzenia do wyświetlenia (pełny URL zostaje w DB / href).
 * np. https://www.apaczka.pl/sledzenie/?nr=ABC123456 → …/?nr=ABC••••56
 */
export function maskTrackingUrl(url: string): string {
    if (!url || typeof url !== "string") return "";
    try {
        const u = new URL(url);
        const nr = u.searchParams.get("nr");
        if (nr && nr.length > 4) {
            const keepStart = Math.min(3, Math.floor(nr.length / 3));
            const keepEnd = 2;
            const mid = Math.max(0, nr.length - keepStart - keepEnd);
            const masked =
                nr.slice(0, keepStart) + "•".repeat(Math.min(mid, 8)) + nr.slice(-keepEnd);
            u.searchParams.set("nr", masked);
            return u.toString();
        }
        // maskuj środkową część path
        const host = u.host;
        const path = u.pathname + u.search;
        if (path.length <= 8) return `${u.protocol}//${host}/••••`;
        return `${u.protocol}//${host}${path.slice(0, 6)}••••${path.slice(-4)}`;
    } catch {
        if (url.length <= 12) return "••••••••";
        return `${url.slice(0, 10)}••••${url.slice(-4)}`;
    }
}

export function maskWaybillNumber(nr: string | undefined | null): string {
    if (!nr) return "";
    if (nr.length <= 4) return "••••";
    return `${nr.slice(0, 3)}${"•".repeat(Math.min(nr.length - 5, 6))}${nr.slice(-2)}`;
}
