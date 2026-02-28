"use client";

import { useState, useEffect, useMemo } from "react";
import { Roles } from "@/lib/types/userTypes";
import AdminRoleCard from "@/components/admin/AdminRoleCart";
import RoleEditModal from "@/components/admin/RoleEditModal";
import Link from "next/link";

export default function RolePage() {
    const [roles, setRoles] = useState<Roles[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<Roles | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const rolesPerPage = 12;

    useEffect(() => {
        async function fetchRoles() {
            try {
                setLoading(true);
                const res = await fetch("/admin/api/v1/roles", {
                    credentials: "include",
                });
                if (!res.ok) {
                    setRoles([]);
                    return;
                }
                const data = await res.json();
                setRoles(data.roles ?? []);
            } catch (error) {
                console.error("Błąd podczas ładowania ról:", error);
                setRoles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchRoles();
    }, []);

    const filteredRoles = useMemo(() => {
        if (!Array.isArray(roles)) return [];
        if (!searchQuery) return roles;
        const query = searchQuery.toLowerCase();
        return roles.filter((role) => {
            const nazwa = role.nazwa?.toLowerCase() || "";
            return nazwa.includes(query);
        });
    }, [roles, searchQuery]);

    const totalPages = Math.ceil((filteredRoles.length || 0) / rolesPerPage);
    const startIndex = (currentPage - 1) * rolesPerPage;
    const endIndex = startIndex + rolesPerPage;
    const displayedRoles = (filteredRoles || []).slice(startIndex, endIndex);

    const handleRoleClick = (role: Roles) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handleRoleUpdate = async () => {
        try {
            const res = await fetch("/admin/api/v1/roles", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setRoles(data.roles ?? []);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania ról:", error);
        }
        setIsEditModalOpen(false);
        setSelectedRole(null);
    };

    const handleRoleDelete = async (roleNazwa: string) => {
        try {
            const res = await fetch("/admin/api/v1/roles", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setRoles(data.roles ?? []);
            }
        } catch (error) {
            console.error("Błąd podczas odświeżania ról:", error);
            setRoles((prev) => prev.filter((r) => r.nazwa !== roleNazwa));
        }
        setIsEditModalOpen(false);
        setSelectedRole(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Ładowanie ról...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Role
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj role.
                    </p>
                </div>
                <Link
                    href="/admin/customers/role/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj rolę
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj ról..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredRoles.length} ról
                </div>
            </div>

            {displayedRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">👤</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery ? "Nie znaleziono ról" : "Brak ról"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwszą rolę, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedRoles.map((role) => (
                            <AdminRoleCard
                                key={role.nazwa || role._id?.toString()}
                                role={role}
                                onClick={() => handleRoleClick(role)}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Poprzednia
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 py-2 border rounded-md min-w-[40px] ${
                                                    currentPage === page
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-accent"
                                                } transition-colors`}>
                                                {page}
                                            </button>
                                        );
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return <span key={page} className="px-2">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                                Następna
                            </button>
                        </div>
                    )}
                </>
            )}

            {selectedRole && (
                <RoleEditModal
                    role={selectedRole}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedRole(null);
                    }}
                    onUpdate={handleRoleUpdate}
                    onDelete={handleRoleDelete}
                />
            )}
        </div>
    );
}
