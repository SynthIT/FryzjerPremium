"use client";
import UserCard from "@/components/admin/UserCard";
import { Roles, Users } from "@/lib/types/userTypes";
import { useEffect, useState } from "react";

export default function UzytkownicyPage() {
    const [users, setUsers] = useState<Users[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string>("all");
    const [usersPerPage, setUsersPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch("/admin/api/v1/users", {
                credentials: "include",
            });
            const data = await response.json();
            console.log(data);
            setUsers(JSON.parse(data.users));
            setFilteredUsers(JSON.parse(data.users));
            setLoading(false);
        }
        fetchUsers();
    }, []);

    useEffect(() => {
        setTotalUsers(users.length);
    }, [users]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
    }, [filteredUsers]);

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilter(value);
        console.log(value);
        if (value === "admin") {
            setFilteredUsers(users.filter((user) => user.role?.some((role) => (role as Roles).admin! > 0)));
        } else if (value === "discount") {
            setFilteredUsers(users.filter((user) => user.role?.some((role) => (role as Roles).uzytkownik! > 0)));
        } else {
            setFilteredUsers(users);
        }
        setCurrentPage(1);
    }


    if (loading) {
        return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Ładowanie użytkowników...</div>
    }

    return (
        <>
            <div className="space-y-3 sm:space-y-4">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Użytkownicy</h1>
                <p className="text-sm text-muted-foreground sm:text-base">Zarządzaj użytkownikami systemu.</p>
            </div>
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Szukaj użytkownika..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                    value={filter}
                    onChange={handleFilter}
                    className="px-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">Wszystkie</option>
                    <option value="admin">Administratorzy</option>
                    <option value="discount">Zniżki</option>
                </select>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                    <select value={usersPerPage} className="px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" onChange={(e) => setUsersPerPage(parseInt(e.target.value))}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    użytkowników na stronę
                </div>
                <button
                    onClick={() => setCurrentPage(1)}
                    className="px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                    Szukaj
                </button>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <UserCard key={user._id} user={user} onClick={() => { }} />
                    ))
                ) : (
                    <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                        Brak użytkowników.
                    </div>
                )}
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredUsers.length} użytkowników spełniających kryteria
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
                {totalPages} stron wyników
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
                {currentPage} / {totalPages ? totalPages : 1} strona
            </div>

            <div className="text-sm text-muted-foreground whitespace-nowrap">
                {totalUsers} użytkowników w systemie
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                        Poprzednia
                    </button>
                </div>
            )}
        </>
    )
}

