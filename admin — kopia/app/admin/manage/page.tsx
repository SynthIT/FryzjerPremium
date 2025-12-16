import Link from "next/link";

export default function ManagePage() {
    return (
        <div className="space-y-3 sm:space-y-4">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Zarządzj
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
                Zarządzaj i przeglądaj produkty, kategorie oraz producentów.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Link
                    href="/admin/manage/products"
                    className="block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
                    Produkty
                </Link>
                <Link
                    href="/admin/manage/categories"
                    className="block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
                    Kategorie
                </Link>
                <Link
                    href="/admin/manage/producents"
                    className="block rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent">
                    Producenci
                </Link>
            </div>
        </div>
    );
}

