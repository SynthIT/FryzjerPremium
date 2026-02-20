"use client";

import { hasAnyAdminPermission } from "@/lib/auth/permissions";
import { Roles, Users, userSchema, OrderList } from "@/lib/types/userTypes";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

interface UserContextType {
    user: string | undefined;
    userData: Users | undefined;
    orders: OrderList[] | undefined;
    addUser: (user: Users, orders: OrderList[]) => void;
    changePassword: (
        newPassword: string,
        oldPassword: string,
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
    const [user, setUser] = useState<string | undefined>();
    const [userData, setUserData] = useState<Users | undefined>();
    const [orders, setOrders] = useState<OrderList[]>([]);

    useEffect(() => {
        if (user !== undefined) {
            localStorage.setItem("user", user);
        }
        if (localStorage.getItem("user")) return;
    }, [user, orders]);

    useEffect(() => {
        async function u(c?: string) {
            fetch("/api/v1/auth/check", {
                method: "POST",
                credentials: "include",
            })
                .then((res) => {
                    console.log(res);
                    if (res.status != 200) return false;
                    return res.json();
                })
                .then((data) => {
                    if (!data) return;
                    setUser(data.user._id);
                    if (!userData) {
                        setUserData(data.user);
                    }
                    if (data.orders) {
                        setOrders(data.user.zamowienia);
                    }
                });
        }
        try {
            const loggedUser = localStorage.getItem("user");
            u(loggedUser ?? undefined);
        } catch (err) {
            console.log("Błąd podczas ładowania użytkownika: ", err);
        }
    }, [userData]);

    const addUser = useCallback((user: Users, orders: OrderList[]) => {
        if (!user.createdAt) return;
        if (!user.updatedAt) return;
        user.createdAt = new Date(user.createdAt);
        user.updatedAt = new Date(user.updatedAt);
        userSchema.parse(user);
        if (orders.length > 0) {
            setOrders(orders);
            setUser(user._id);
        }
        setUser(user._id);
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
        [],
    );

    const changeUserData = useCallback(
        (changed: Partial<Users>) => {
            async function editUser(edit: Partial<Users>) {
                const req = await fetch("/api/v1/auth/change/user", {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify({ user: edit }),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        return data;
                    });

                return req.status === 201;
            }
            if (!user) return false;
            return editUser(changed);
        },
        [user],
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
        [orders],
    );

    const isAdmin = useCallback(() => {
        console.log(userData)
        if (!userData) {
            if (!userData!.role) return false;
            console.log(hasAnyAdminPermission(userData!.role as Roles[]));
            return hasAnyAdminPermission(userData!.role as Roles[]);

        } else {
            if (!userData.role) return false;
            console.log(hasAnyAdminPermission(userData.role as Roles[]));
            return hasAnyAdminPermission(userData.role as Roles[]);
        }
    }, [userData]);

    return (
        <UserContext.Provider
            value={{
                user,
                userData,
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
