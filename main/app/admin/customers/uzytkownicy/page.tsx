"use client";

import { useState, useEffect, useMemo } from "react";
import { Users } from "@/lib/types/userTypes";
import UserCard from "@/components/admin/UserCard";
import UserEditModal from "@/components/admin/UserEditModal";
import Link from "next/link";
import { User, UserPlus } from "lucide-react";

export default function UzytkownicyPage() {
    const [users, setUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<Users | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string>("all");
    const usersPerPage = 12;

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const res = await fetch("/admin/api/v1/users", { credentials: "include" });
                if (!res.ok) {
                    setUsers([]);
                    return;
                }
                const data = await res.json();
                const parsed = typeof data.users === "string" ? JSON.parse(data.users) : data.users;
                setUsers(Array.isArray(parsed) ? parsed : []);
            } catch (error) {
                console.error("Błąd podczas ładowania użytkowników:", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        let list = users;
        if (filter === "admin") {
            list = users.filter((u) =>
                u.role?.some((r) => (r as { admin?: number }).admin && (r as { admin?: number }).admin! > 0)
            );
        } else if (filter === "discount") {
            list = users.filter((u) =>
                u.role?.some((r) => (r as { uzytkownik?: number }).uzytkownik && (r as { uzytkownik?: number }).uzytkownik! > 0)
            );
        }
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter((user) => {
            const imie = user.imie?.toLowerCase() || "";
            const nazwisko = user.nazwisko?.toLowerCase() || "";
            const email = user.email?.toLowerCase() || "";
            return imie.includes(q) || nazwisko.includes(q) || email.includes(q);
        });
    }, [users, searchQuery, filter]);

    const totalPages = Math.ceil((filteredUsers.length || 0) / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const displayedUsers = (filteredUsers || []).slice(startIndex, endIndex);

    const handleUserClick = (user: Users) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Ładowanie użytkowników...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-gray-900 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-dark)] sm:text-3xl">
                        <User className="h-8 w-8 text-[var(--primary-dark)]" />
                        Użytkownicy
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Zarządzaj użytkownikami systemu.
                    </p>
                </div>
                <Link
                    href="/admin/customers/uzytkownicy/new"
                    className="text-gray-900 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--primary)] px-4 py-3 text-sm font-medium text-[var(--text-dark)] shadow-sm transition-all hover:bg-[var(--primary-dark)] hover:text-white sm:w-auto">
                    <UserPlus className="h-4 w-4" />
                    Dodaj użytkownika
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Szukaj użytkownika..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">Wszystkie</option>
                    <option value="admin">Administratorzy</option>
                    <option value="discount">Zniżki</option>
                </select>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredUsers.length} użytkowników
                </div>
            </div>

            {displayedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg">
                    <div className="text-center space-y-4">
                        <div className="text-6xl">👥</div>
                        <div>
                            <h3 className="text-xl font-semibold">
                                {searchQuery || filter !== "all" ? "Nie znaleziono użytkowników" : "Brak użytkowników"}
                            </h3>
                            <p className="text-muted-foreground mt-2">
                                {searchQuery || filter !== "all"
                                    ? "Spróbuj zmienić kryteria wyszukiwania"
                                    : "Dodaj pierwszego użytkownika, aby rozpocząć"}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedUsers.map((user) => (
                            <UserCard
                                key={user._id?.toString() || user.email}
                                user={user}
                                onClick={() => handleUserClick(user)}
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

            {selectedUser && (
                <UserEditModal
                    user={selectedUser}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
}
