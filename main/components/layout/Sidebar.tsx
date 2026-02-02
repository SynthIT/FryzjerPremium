"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    TooltipProvider,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@radix-ui/react-tooltip";
import {
    LayoutDashboard,
    Users2,
    Receipt,
    Package,
    PlusSquare,
    Boxes,
    ChartBar,
    PanelLeftClose,
    PanelLeftOpen,
    CheckSquare,
    Square,
    Trash2,
    Plus,
    ChevronDown,
    ChevronRight,
    User,
    Shield,
    Factory,
    FolderKanban,
    Percent,
    Truck,
    PlusCircle,
    TruckIcon,
} from "lucide-react";

type NavItem = {
    href: string;
    label: string;
    icon: React.ReactNode;
    children?: NavItem[];
};

const navItems: NavItem[] = [
    {
        href: "/admin",
        label: "Panel główny",
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        href: "/admin/customers",
        label: "Klienci",
        icon: <Users2 className="h-5 w-5" />,
        children: [
            {
                href: "/admin/customers/uzytkownicy",
                label: "Użytkownicy",
                icon: <User className="h-4 w-4" />,
            },
            {
                href: "/admin/customers/role",
                label: "Role",
                icon: <User className="h-4 w-4" />,
            },
            {
                href: "/admin/customers/administratorzy",
                label: "Administratorzy",
                icon: <Shield className="h-4 w-4" />,
            },
        ],
    },
    {
        href: "/admin/delivery",
        label: "Sposoby wysyłki",
        icon: <Truck className="h-5 w-5" />,
        children: [
            {
                href: "/admin/delivery/add",
                label: "Dodaj nowy sposób wysyłki",
                icon: <PlusCircle className="h-4 w-4" />,
            },
            {
                href: "/admin/delivery",
                label: "Przeglądaj",
                icon: <TruckIcon className="h-4 w-4" />,
            },
        ],
    },
    {
        href: "/admin/orders",
        label: "Zamówienia",
        icon: <Receipt className="h-5 w-5" />,
    },
    {
        href: "/admin/manage",
        label: "Zarządzaj",
        icon: <FolderKanban className="h-5 w-5" />,
        children: [
            {
                href: "/admin/manage/products",
                label: "Produkty",
                icon: <Package className="h-4 w-4" />,
            },
            {
                href: "/admin/manage/producents",
                label: "Producenci",
                icon: <Factory className="h-4 w-4" />,
            },
            {
                href: "/admin/manage/categories",
                label: "Kategorie",
                icon: <Boxes className="h-4 w-4" />,
            },
            {
                href: "/admin/manage/promocje",
                label: "Promocje",
                icon: <Percent className="h-4 w-4" />,
            },
        ],
    },
    {
        href: "/admin/fast/new",
        label: "Szybkie dodanie",
        icon: <PlusSquare className="h-5 w-5" />,
    },
    {
        href: "/admin/analytics",
        label: "Analityka",
        icon: <ChartBar className="h-5 w-5" />,
    },
];

export function Sidebar({
    mobile,
    onClose,
}: { mobile?: boolean; onClose?: () => void } = {}) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState<boolean>(false);
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
        new Set()
    );
    const [todos, setTodos] = React.useState<
        Array<{ id: string; text: string; done: boolean }>
    >([]);
    const [input, setInput] = React.useState("");

    // W trybie mobilnym zawsze rozwiń
    const isMobile = mobile ?? false;
    const isCollapsed = mobile ? false : collapsed;

    // Zamknij menu mobilne po kliknięciu w link
    const handleLinkClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    React.useEffect(() => {
        const saved =
            typeof window !== "undefined"
                ? window.localStorage.getItem("admin_sidebar_collapsed")
                : null;
        if (saved) setCollapsed(saved === "1");
    }, []);

    React.useEffect(() => {
        const raw =
            typeof window !== "undefined"
                ? window.localStorage.getItem("admin_sidebar_todos")
                : null;
        if (raw) {
            try {
                setTodos(JSON.parse(raw));
            } catch {}
        }
    }, []);

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(
                "admin_sidebar_todos",
                JSON.stringify(todos)
            );
        }
    }, [todos]);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        if (typeof window !== "undefined")
            window.localStorage.setItem(
                "admin_sidebar_collapsed",
                next ? "1" : "0"
            );
    };

    const addTodo = () => {
        const value = input.trim();
        if (!value) return;
        setTodos((prev) => [
            { id: crypto.randomUUID(), text: value, done: false },
            ...prev,
        ]);
        setInput("");
    };

    const toggleTodo = (id: string) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        );
    };

    const removeTodo = (id: string) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
    };

    const toggleExpanded = (href: string) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(href)) {
                next.delete(href);
            } else {
                next.add(href);
            }
            return next;
        });
    };

    React.useEffect(() => {
        // Auto-expand items if their children are active
        navItems.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some((child) =>
                    pathname.startsWith(child.href)
                );
                if (hasActiveChild) {
                    setExpandedItems((prev) => {
                        if (prev.has(item.href)) return prev;
                        return new Set(prev).add(item.href);
                    });
                }
            }
        });
    }, [pathname]);

    return (
        <aside
            className={`group/sidebar ${
                isMobile
                    ? "flex h-full w-full flex-col bg-background"
                    : "border-r bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40"
            } ${isCollapsed ? "w-16" : "w-64"} ${
                isMobile ? "" : "hidden shrink-0 md:block"
            } transition-[width] duration-300`}>
            {!isMobile && (
                <div className="flex h-14 items-center justify-between px-3">
                    <button
                        onClick={toggle}
                        aria-label={
                            isCollapsed
                                ? "Rozwiń pasek boczny"
                                : "Zwiń pasek boczny"
                        }
                        className="rounded p-1 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring active:scale-95">
                        {isCollapsed ? (
                            <PanelLeftOpen className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </button>
                </div>
            )}
            <nav className="space-y-1 px-2 pb-4">
                <TooltipProvider>
                    {navItems.map((item) => {
                        const hasChildren =
                            item.children && item.children.length > 0;
                        const isExpanded = expandedItems.has(item.href);
                        const active =
                            pathname === item.href ||
                            (item.href !== "/admin" &&
                                pathname.startsWith(item.href) &&
                                item.href !== "/products" &&
                                pathname === "/products");
                        const hasActiveChild =
                            hasChildren &&
                            item.children?.some((child) =>
                                pathname.startsWith(child.href)
                            );

                        return (
                            <div key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center">
                                            <Link
                                                href={item.href}
                                                onClick={handleLinkClick}
                                                className={`relative flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                                    active || hasActiveChild
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                                aria-current={
                                                    active ? "page" : undefined
                                                }>
                                                <span className="inline-flex items-center justify-center">
                                                    {item.icon}
                                                </span>
                                                {!isCollapsed && (
                                                    <span className="truncate">
                                                        {item.label}
                                                    </span>
                                                )}
                                                {/* Active indicator */}
                                                {(active || hasActiveChild) && (
                                                    <span className="absolute inset-y-1 left-1 w-1 rounded-full bg-ring/80 shadow-[0_0_0_2px_var(--color-background)]" />
                                                )}
                                            </Link>
                                            {hasChildren && !isCollapsed && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleExpanded(
                                                            item.href
                                                        );
                                                    }}
                                                    className="p-1 rounded hover:bg-accent transition-colors"
                                                    aria-label={
                                                        isExpanded
                                                            ? "Zwiń"
                                                            : "Rozwiń"
                                                    }>
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent
                                            side="right"
                                            className="rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow">
                                            {item.label}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                {hasChildren && isExpanded && !isCollapsed && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.children?.map((child) => {
                                            const childActive =
                                                pathname.startsWith(child.href);
                                            return (
                                                <Tooltip key={child.href}>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={child.href}
                                                            onClick={
                                                                handleLinkClick
                                                            }
                                                            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                                                childActive
                                                                    ? "bg-accent text-accent-foreground"
                                                                    : "text-muted-foreground"
                                                            }`}
                                                            aria-current={
                                                                childActive
                                                                    ? "page"
                                                                    : undefined
                                                            }>
                                                            <span className="inline-flex items-center justify-center">
                                                                {child.icon}
                                                            </span>
                                                            <span className="truncate">
                                                                {child.label}
                                                            </span>
                                                            {/* Active indicator */}
                                                            {childActive && (
                                                                <span className="absolute inset-y-1 left-1 w-1 rounded-full bg-ring/80 shadow-[0_0_0_2px_var(--color-background)]" />
                                                            )}
                                                        </Link>
                                                    </TooltipTrigger>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* To-Do List */}
            {!isMobile && (
                <div className="mt-auto border-t px-2 py-3">
                    {!isCollapsed && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    To Do
                                </span>
                                {todos.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {todos.filter((t) => !t.done).length}/
                                        {todos.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") addTodo();
                                    }}
                                    placeholder="Dodaj zadanie"
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs outline-none ring-offset-background transition focus:ring-2 focus:ring-ring"
                                />
                                <button
                                    onClick={addTodo}
                                    aria-label="Dodaj zadanie"
                                    className="rounded-md border p-1 text-xs transition-colors hover:bg-accent">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <ul className="max-h-52 space-y-1 overflow-auto pr-1">
                                {todos.map((t) => (
                                    <li
                                        key={t.id}
                                        className="group flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-accent">
                                        <button
                                            onClick={() => toggleTodo(t.id)}
                                            className="inline-flex items-center gap-2">
                                            {t.done ? (
                                                <CheckSquare className="h-3.5 w-3.5" />
                                            ) : (
                                                <Square className="h-3.5 w-3.5" />
                                            )}
                                            <span
                                                className={`truncate ${
                                                    t.done
                                                        ? "line-through opacity-60"
                                                        : ""
                                                }`}>
                                                {t.text}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => removeTodo(t.id)}
                                            aria-label="Usuń"
                                            className="invisible rounded p-1 text-muted-foreground transition-colors hover:text-red-600 group-hover:visible">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
