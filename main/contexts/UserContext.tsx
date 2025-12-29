"use client";

import { OrderList } from "@/lib/models/Orders";
import { Role, Users } from "@/lib/models/Users";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface UserContextType {
    user: Users | undefined;
    orders: OrderList[] | undefined;
    addUser: (user: Users) => void;
    changePassword: (
        newPassword: string,
        oldPassword: string
    ) => Promise<boolean>;
    changeUserData: (changed: Partial<Users>) => false | Promise<boolean>;
    logout: () => void;
    deleteAccount: () => void;
    addNewOrder: (order: OrderList) => Promise<boolean>;
    getOneOrder: (nr_zam: string) => OrderList | undefined;
    isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Users | undefined>();
    const [orders, setOrders] = useState<OrderList[]>([]);

    useEffect(() => {
        if (user !== undefined) {
            localStorage.setItem("user", JSON.stringify(user));
        }
        if (localStorage.getItem("user")) return;
    }, [user, orders]);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            try {
                async function u(c: Users) {
                    fetch("/api/v1/auth/check", {
                        method: "POST",
                        credentials: "include",
                    }).then((res) => {
                        if (res.status === 200) {
                            setUser(c);
                            if (c.zamowienia.length > 0) {
                                setOrders(c.zamowienia as OrderList[]);
                            }
                        } else {
                            setUser(undefined);
                            localStorage.setItem("user", "");
                        }
                    });
                }
                const parsedUser: Users | undefined = JSON.parse(loggedUser);
                console.log(parsedUser);
                if (parsedUser) {
                    u(parsedUser);
                }
            } catch (err) {
                console.log("Błąd podczas ładowania użytkownika: ", err);
            }
        }
    }, []);

    const addUser = useCallback((user: Users) => {
        const orders = user.zamowienia as OrderList[];
        if (orders.length > 0) {
            setOrders(orders);
            setUser(user);
        }
        setUser(user);
    }, []);

    const changePassword = useCallback(
        (newPassword: string, oldPassword: string) => {
            async function changepass() {
                const req = await fetch("/api/v1/auth/change/password", {
                    method: "POST",
                    body: JSON.stringify({
                        newPassword: newPassword,
                        oldPassword: oldPassword,
                    }),
                    credentials: "include",
                })
                    .then((res) => res.json())
                    .then((data) => {
                        return data.status === 201;
                    });
                return req;
            }
            return changepass();
        },
        []
    );

    const changeUserData = useCallback(
        (changed: Partial<Users>) => {
            async function editUser(edit: Users) {
                const req = await fetch("/api/v1/auth/change/user", {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify({ user: edit }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        return data;
                    });
                if (req.status === 201) {
                    setUser(edit);
                }
                return req.status === 201;
            }
            if (!user) return false;
            const editUsers = {
                ...user,
                ...changed,
            } satisfies Users;
            return editUser(editUsers);
        },
        [user]
    );
    const logout = useCallback(() => {
        async function out() {
            await fetch("/api/v1/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setUser(undefined);
            setOrders([]);
            document.location.href = "/";
            localStorage.setItem("user", "");
        }
        out();
    }, []);

    const deleteAccount = useCallback(() => {
        async function del() {
            await fetch("/api/v1/auth/deleteacc", {
                method: "DELETE",
                credentials: "include",
            });
            setUser(undefined);
            setOrders([]);
            document.location.href = "/";
            localStorage.setItem("user", "");
        }
        del();
    }, []);

    const addNewOrder = useCallback((order: OrderList) => {
        async function add() {
            const res = await fetch("/api/v1/products/orders", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ order: order }),
            })
                .then((res) => res.json())
                .then((data) => {
                    return data.status === 201;
                });
            if (!res) return false;
            setOrders((prev) => [...prev, order]);
            return true;
        }
        return add();
    }, []);

    const getOneOrder = useCallback(
        (nr_zam: string) => {
            const order = orders.find(({ numer_zamowienia }) => {
                return numer_zamowienia == nr_zam;
            });
            return order;
        },
        [orders]
    );

    const isAdmin = useCallback(() => {
        if (!user) return false;
        if (!user.role) return false;
        return user.role.length > 0 && (user.role[0] as Role).nazwa === "admin";
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                user,
                orders,
                addUser,
                changePassword,
                changeUserData,
                logout,
                deleteAccount,
                addNewOrder,
                getOneOrder,
                isAdmin,
            }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error("Something went wrong");
    return context;
}
