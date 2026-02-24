"use client";

import { useState, useEffect, useMemo } from "react";
import { Firmy } from "@/lib/types/coursesTypes";
import AdminCompanyCard from "@/components/admin/AdminCompanyCard";
import CompanyEditModal from "@/components/admin/CompanyEditModal";
import Link from "next/link";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Firmy[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<Firmy | null>(
        null
    );
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const companiesPerPage = 12;

    useEffect(() => {
        async function fetchCompanies() {
            try {
                setLoading(true);
                const res = await fetch("/admin/api/v1/firmy", {
                    credentials: "include",
                });
                if (!res.ok) {
                    console.error("Błąd autoryzacji:", res.status, res.statusText);
                    setCompanies([]);
                    return;
                }
                const data = await res.json();
                setCompanies(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Błąd podczas ładowania firm:", error);
                setCompanies([]);
            } finally {
                setLoading(false);
            }
        }
        fetchCompanies();
    }, []);

    // Filtrowanie i paginacja
    const filteredCompanies = useMemo(() => {
        if (!Array.isArray(companies)) return [];
        if (!searchQuery) return companies;
        const query = searchQuery.toLowerCase();
        return companies.filter((company) => {
            const nazwa = company.nazwa?.toLowerCase() || "";
            const opis = company.opis?.toLowerCase() || "";
            const slug = company.slug?.toLowerCase() || "";
            return (
                nazwa.includes(query) ||
                opis.includes(query) ||
                slug.includes(query)
            );
        });
    }, [companies, searchQuery]);

    const totalPages = Math.ceil((Array.isArray(filteredCompanies) ? filteredCompanies.length : 0) / companiesPerPage);
    const startIndex = (currentPage - 1) * companiesPerPage;
    const endIndex = startIndex + companiesPerPage;
    const displayedCompanies = Array.isArray(filteredCompanies) ? filteredCompanies.slice(startIndex, endIndex) : [];

    const handleCompanyClick = (company: Firmy) => {
        setSelectedCompany(company);
        setIsEditModalOpen(true);
    };

    const handleCompanyUpdate = async (updatedCompany: Firmy) => {
        try {
            const res = await fetch("/admin/api/v1/firmy", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCompanies(Array.isArray(data) ? data : []);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania firm:", error);
            setCompanies((prev) =>
                prev.map((c) =>
                    c.slug === updatedCompany.slug ? updatedCompany : c
                )
            );
        }
        setIsEditModalOpen(false);
        setSelectedCompany(null);
    };

    const handleCompanyDelete = async (companySlug: string) => {
        try {
            const res = await fetch("/admin/api/v1/firmy", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setCompanies(Array.isArray(data) ? data : []);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania firm:", error);
            setCompanies((prev) => prev.filter((c) => c.slug !== companySlug));
        }
        setIsEditModalOpen(false);
        setSelectedCompany(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">
                        Ładowanie firm...
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
                        Firmy
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj firmy prowadzące szkolenia.
                    </p>
                </div>
                <Link
                    href="/admin/customers/companies/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj firmę
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj firm..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredCompanies.length} firm
                </div>
            </div>

            {/* Companies Grid */}
            {displayedCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">🏢</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery
                                    ? "Nie znaleziono firm"
                                    : "Brak firm"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwszą firmę, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedCompanies.map((company) => (
                            <AdminCompanyCard
                                key={company.slug || company._id?.toString() || company.nazwa}
                                company={company}
                                onClick={() => handleCompanyClick(company)}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1)
                                    )
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Poprzednia
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 &&
                                            page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className={`px-3 py-2 border rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                } transition-colors`}>
                                                {page}
                                            </button>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
                                        return (
                                            <span key={page} className="px-2">
                                                ...
                                            </span>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Następna
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Modal */}
            {selectedCompany && (
                <CompanyEditModal
                    company={selectedCompany}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedCompany(null);
                    }}
                    onUpdate={handleCompanyUpdate}
                    onDelete={handleCompanyDelete}
                />
            )}
        </div>
    );
}
