/** Locale dla wyświetlania dat/czasu w całej aplikacji. */
export const APP_DATE_LOCALE = "pl-PL";

/**
 * Bezpieczne formatowanie daty/czasu do UI (Date, ISO string, timestamp).
 * Niezdefiniowane lub niepoprawne wartości → „—”.
 */
export function formatLocaleDateTime(
    value: Date | string | number | undefined | null,
): string {
    if (value === undefined || value === null || value === "") {
        return "—";
    }
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) {
        return "—";
    }
    return d.toLocaleString(APP_DATE_LOCALE);
}
