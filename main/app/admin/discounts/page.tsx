"use client";

import { useEffect, useState, useMemo } from "react";
import { Promos } from "@/lib/types/shared";
import AdminPromoCard from "@/components/admin/AdminPromoCard";
import Link from "next/link";

export default function DiscountsPage() {
    const [promocje, setPromocje] = useState<Promos[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const promocjePerPage = 12;

    useEffect(() => {
        async function fetchPromo() {
            try {
                setLoading(true);
                const response = await fetch("/admin/api/v1/promo", {
                    method: "GET",
                    credentials: "include",
                });
                const data = await response.json();
                const { status, promos } = data as {
                    status: number;
                    promos?: Promos[];
                };
                if (status === 0 && Array.isArray(promos)) {
                    setPromocje(promos);
                } else {
                    setPromocje([]);
                }
            } catch (error) {
                console.error("Błąd podczas pobierania promocji:", error);
                setPromocje([]);
            } finally {
                setLoading(false);
            }
        }
        fetchPromo();
    }, []);

    const filteredPromocje = useMemo(() => {
        if (!searchQuery.trim()) return promocje;
        const query = searchQuery.toLowerCase();
        return promocje.filter((promo) => {
            const nazwa = promo.nazwa?.toLowerCase() || "";
            const rozpoczecie = promo.rozpoczecie
                ? new Date(promo.rozpoczecie).toISOString().slice(0, 10)
                : "";
            const wygasa = promo.wygasa
                ? new Date(promo.wygasa).toISOString().slice(0, 10)
                : "";
            const specialNazwa = promo.special?.nazwa?.toLowerCase() || "";
            return (
                nazwa.includes(query) ||
                rozpoczecie.includes(query) ||
                wygasa.includes(query) ||
                specialNazwa.includes(query)
            );
        });
    }, [promocje, searchQuery]);

    const totalPages = Math.ceil(
        Math.max(0, filteredPromocje.length) / promocjePerPage,
    );
    const startIndex = (currentPage - 1) * promocjePerPage;
    const displayedPromocje = filteredPromocje.slice(
        startIndex,
        startIndex + promocjePerPage,
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie promocji...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Promocje
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj promocje.
                    </p>
                </div>
                <Link
                    href="/admin/discounts/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto text-center"
                >
                    Dodaj promocję
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj promocji..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredPromocje.length}{" "}
                    {filteredPromocje.length === 1 ? "promocja" : "promocji"}
                </div>
            </div>

            {displayedPromocje.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">🏷️</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery
                                    ? "Nie znaleziono promocji"
                                    : "Brak promocji"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwszą promocję, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedPromocje.map((promo, index) => (
                            <AdminPromoCard
                                key={promo._id ?? `promo-${index}`}
                                promo={promo}
                                onClick={() => {}}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
                                Poprzednia
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1,
                                ).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 &&
                                            page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                type="button"
                                                key={page}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`px-3 py-2 border rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                } transition-colors`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <span
                                                key={page}
                                                className="px-2"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                            >
                                Następna
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
