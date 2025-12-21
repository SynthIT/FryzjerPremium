import { OrderList } from "@/lib/models/Orders";
import { Users } from "@/lib/models/Users";
import {
    createContext,
    ReactNode,
    useCallback,
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
    addNewOrder: (order: OrderList) => boolean;
    getOneOrder: (nr_zam: string) => OrderList;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Users | undefined>();
    const [orders, setOrders] = useState<OrderList[]>([]);

    useEffect(() => {
        const loggedUser = localStorage.getItem("user");
        if (loggedUser) {
            try {
                function u(c: Users) {
                    setUser(c);
                    if (c.zamowienia.length > 0) {
                        setOrders(c.zamowienia);
                    }
                }
                const parsedUser: Users = JSON.parse(loggedUser);
                u(parsedUser);
            } catch (err) {
                console.log("Błąd podczas ładowania użytkownika: ", err);
            }
        }
    }, []);

    const addUser = useCallback((user: Users) => {
        const orders = user.zamowienia;
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
                        return data.status === 201;
                    });
                return req;
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
        }
        del();
    }, []);

    const addNewOrder = useCallback((order: OrderList) => {}, [])

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
            }}>
            {children}
        </UserContext.Provider>
    );
}
