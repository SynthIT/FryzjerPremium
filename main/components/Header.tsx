"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { finalPrice, loginUser } from "@/lib/utils";
import LoggedBadge from "./LoggedBadge";
import { Search, User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNotification } from "@/contexts/NotificationContext";

interface HeaderProps {
    openLoginModal?: boolean;
}

export default function Header({ openLoginModal }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
        refreshToken: false,
    });
    const [mounted, setMounted] = useState(false);
    const cartDropdownRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [showModalMenu, setShowModalMenu] = useState<boolean>(false);

    const { getTotalItems, lastAddedItem, clearLastAddedItem } = useCart();
    const { addUser, userData, isAdmin, logout } = useUser();
    const { notify } = useNotification();

    useEffect(() => {
        if (openLoginModal) {
            setShowLoginModal(true);
        }
    }, [openLoginModal]);

    const cartItemsCount = getTotalItems();

    // Upewnij się, że komponent jest zamontowany (dla Portal)
    useEffect(() => {
        function a() {
            setMounted(true);
        }
        a();

    }, [setMounted]);

    // Pokazuj okienko po dodaniu produktu
    useEffect(() => {
        if (lastAddedItem) {
            function showAlert() {
                setShowCartDropdown(true);
                // Ukryj okienko po 5 sekundach
                const timer = setTimeout(() => {
                    setShowCartDropdown(false);
                    clearLastAddedItem();
                }, 5000);
                return timer;
            }
            const timer = showAlert();
            return () => clearTimeout(timer);
        }
    }, [lastAddedItem, clearLastAddedItem]);

    // Zamknij okienko po kliknięciu poza nim
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cartDropdownRef.current &&
                !cartDropdownRef.current.contains(event.target as Node)
            ) {
                setShowCartDropdown(false);
                clearLastAddedItem();
            }
        };

        if (showCartDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showCartDropdown, clearLastAddedItem]);

    // Zamknij menu użytkownika po kliknięciu poza nim
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowModalMenu(false);
            }
        };

        if (showModalMenu) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showModalMenu]);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            console.log("Szukaj:", searchQuery);
        },
        [searchQuery],
    );

    useEffect(() => {
        const callback = () => {
            if (searchQuery.length > 0) {
                console.log("Query:", searchQuery);
            }
        }
        const scheduler = setInterval(callback, 5000);
        return () => clearInterval(scheduler);
    }, [searchQuery]);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
        setShowDropdown(false);
        setIsMobileSearchOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileSearchOpen(false);
        setShowDropdown(false);
        setIsMobileMenuOpen((prev) => !prev);
    }, []);

    const handleSearchToggle = useCallback(() => {
        if (typeof window !== "undefined" && window.innerWidth <= 768) {
            if (!isMobileSearchOpen) {
                setIsMobileMenuOpen(false);
                setShowDropdown(false);
            }
            setIsMobileSearchOpen((prev) => !prev);
        } else {
            searchInputRef.current?.focus();
        }
    }, [isMobileSearchOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setIsMobileMenuOpen(false);
            }
            if (window.innerWidth > 768) {
                setIsMobileSearchOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isMobileSearchOpen) {
            searchInputRef.current?.focus();
        }
    }, [isMobileSearchOpen]);

    useEffect(() => {
        if (!isMobileSearchOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setIsMobileSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileSearchOpen]);

    useEffect(() => {
        if (isMobileMenuOpen || isMobileSearchOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen, isMobileSearchOpen]);

    const smoothScrollTo = useCallback(
        (elementId: string) => {
            const element = document.getElementById(elementId);
            if (element) {
                const headerHeight = 100; // Wysokość sticky header z paddingiem
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });

                setTimeout(() => {
                    element.style.transition = "box-shadow 0.3s ease";
                    const originalBoxShadow = element.style.boxShadow;
                    element.style.boxShadow = "0 0 0 4px rgba(0, 0, 0, 0.1)";
                    setTimeout(() => {
                        element.style.boxShadow = originalBoxShadow;
                    }, 1000);
                }, 500);
            }
            closeMobileMenu();
        },
        [closeMobileMenu],
    );

    const toggleDropdown = useCallback(() => {
        setShowDropdown((prev) => !prev);
    }, []);

    const handleLogin = async () => {
        const response = await loginUser({ payload: loginForm });
        if (response.status == 201) {
            addUser(response.user, response.orders);
            notify("Zostałeś zalogowany", "log");
            setShowLoginModal(false);
            setLoginForm({ email: "", password: "", refreshToken: false });
        } else {
            setLoginForm((prev) => ({ ...prev, password: "" }));
            notify(response.error ?? "Błąd", "error");
        }
    }


    return (
        <header className="fixed top-0 left-0 right-0 z-[1100] w-full max-w-full overflow-visible bg-[rgba(240,232,221)] backdrop-blur-[20px] border-b border-[rgba(212,196,176,0.3)] shadow-[0_4px_30px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.5)_inset] transition-shadow duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.5)_inset]">
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-8 w-full min-h-[100px] box-border overflow-visible">
                <div className="shrink-0">
                    <Link href="/" aria-label="Strona główna" className="block hover:opacity-90 transition-opacity">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="w-[100px] h-auto object-contain rounded-[20px] transition-all duration-300"
                        />
                    </Link>
                </div>

                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium text-gray-800 hover:text-[#D2B79B] relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D2B79B] after:transition-all hover:after:w-full" onClick={closeMobileMenu}>
                        Strona główna
                    </Link>
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-[#D2B79B] py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D2B79B] after:transition-all hover:after:w-full"
                            aria-expanded={showDropdown}>
                            <span>Sklep</span>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {showDropdown && (
                            <div className="absolute top-full left-0 mt-1 py-2 min-w-[180px] bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[rgba(212,196,176,0.2)] z-50">
                                <Link href="/produkty" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0e8dd] hover:text-[#D2B79B]" onClick={closeMobileMenu}>Kup Teraz</Link>
                                <Link href="/kursy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0e8dd] hover:text-[#D2B79B]" onClick={closeMobileMenu}>Kursy</Link>
                            </div>
                        )}
                    </div>
                    <Link href="/blog" className="text-sm font-medium text-gray-800 hover:text-[#D2B79B] relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D2B79B] after:transition-all hover:after:w-full" onClick={closeMobileMenu}>Blog</Link>
                    <Link href="/o-nas" className="text-sm font-medium text-gray-800 hover:text-[#D2B79B] relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D2B79B] after:transition-all hover:after:w-full" onClick={closeMobileMenu}>O nas</Link>
                    <Link href="/kontakt" className="text-sm font-medium text-gray-800 hover:text-[#D2B79B] relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#D2B79B] after:transition-all hover:after:w-full" onClick={closeMobileMenu}>Kontakt</Link>
                </nav>

                <div className={`${isMobileSearchOpen ? "flex absolute left-4 right-4 top-full mt-2 z-50 lg:!static lg:!mt-0 lg:!z-auto" : "hidden"} lg:!flex flex-1 max-w-md`} ref={searchContainerRef}>
                    <form onSubmit={handleSearch} className="w-full pl-5 flex flex-row items-center gap-2 rounded-lg  border border-[rgba(212,196,176,0.4)] bg-white/80 text-gray-800 " onClick={(e) => e.stopPropagation()}>
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            id="searchbox"
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Wyszukaj..."
                            className="w-full pl-5 pr-4 py-2 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D2B79B]"
                        />
                    </form>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="p-2 rounded-lg text-gray-700 hover:bg-white/50 hover:text-[#D2B79B] transition-colors"
                        onClick={handleSearchToggle}
                        aria-label={isMobileSearchOpen ? "Zamknij wyszukiwarkę" : "Otwórz wyszukiwarkę"}
                        aria-expanded={isMobileSearchOpen}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <div className="relative" ref={cartDropdownRef}>
                        <Link
                            href="/cart"
                            className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-white/50 hover:text-[#D2B79B] transition-colors"
                            aria-label={`Koszyk${cartItemsCount > 0 ? ` (${cartItemsCount} ${cartItemsCount === 1 ? "produkt" : "produktów"})` : ""}`}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white bg-[#D2B79B] rounded-full px-1" aria-hidden="true">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {showCartDropdown && lastAddedItem && (
                            <div className="absolute right-0 top-full mt-2 w-[320px] max-w-[90vw] bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[rgba(212,196,176,0.3)] p-4 z-50">
                                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="font-medium text-gray-800">Produkt dodany do koszyka</span>
                                </div>
                                <div className="flex gap-3 py-3">
                                    {lastAddedItem.object.media && lastAddedItem.object.media.length > 0 && (
                                        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            <Image src={lastAddedItem.object.media[0]?.path} alt={lastAddedItem.object.media[0]?.alt ?? ""} width={56} height={56} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-800 truncate">{lastAddedItem.object.nazwa}</div>
                                        <div className="text-sm text-gray-500">
                                            {lastAddedItem.wariant && <span>{`${lastAddedItem.wariant.typ}: ${lastAddedItem.wariant.nazwa}`}</span>}
                                            <span> · Ilość: {lastAddedItem.quantity}</span>
                                        </div>
                                        <div className="font-semibold text-[#D2B79B]">
                                            {finalPrice(lastAddedItem.price, lastAddedItem.object.vat, lastAddedItem.wariant ?? undefined, lastAddedItem.object.promocje ?? undefined)} zł
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Link href="/cart" className="flex-1 py-2 text-center text-sm font-medium rounded-lg border border-[#D2B79B] text-[#D2B79B] hover:bg-[#f0e8dd] transition-colors" onClick={() => { setShowCartDropdown(false); clearLastAddedItem(); }}>Pokaż koszyk</Link>
                                    <Link href="/cart" className="flex-1 py-2 text-center text-sm font-medium rounded-lg bg-[#D2B79B] text-black hover:bg-[#b89a7f] transition-colors" onClick={() => { setShowCartDropdown(false); clearLastAddedItem(); }}>Przejdź do kasy</Link>
                                </div>
                            </div>
                        )}
                    </div>
                    {userData ? (
                        <div className="relative" ref={userMenuRef}>
                            <LoggedBadge user={userData} setModalMenu={() => setShowModalMenu(!showModalMenu)} />
                            {showModalMenu && (
                                <div className="absolute right-0 top-full mt-2 py-2 min-w-[200px] bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-[rgba(212,196,176,0.2)] z-50">
                                    {isAdmin() && <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0e8dd] hover:text-[#D2B79B]" href="/admin" onClick={() => setShowModalMenu(false)}>Panel zarządzania</Link>}
                                    <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0e8dd] hover:text-[#D2B79B]" href="/zamowienia" onClick={() => setShowModalMenu(false)}>Zamówienia</Link>
                                    <Link className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f0e8dd] hover:text-[#D2B79B]" href="/ustawienia-konta" onClick={() => setShowModalMenu(false)}>Ustawienia konta</Link>
                                    <Link className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50" href="#" onClick={(e) => { e.preventDefault(); setShowModalMenu(false); logout(); }}>Wyloguj się</Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button type="button" className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-white/50 hover:text-[#D2B79B] transition-colors" onClick={() => { setShowLoginModal(true); closeMobileMenu(); }} aria-label="Zaloguj się">
                            <User className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="button"
                        className={`lg:hidden flex flex-col justify-center gap-1.5 w-10 h-10 rounded-lg p-2 transition-transform ${isMobileMenuOpen ? "rotate-90" : ""}`}
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
                        aria-expanded={isMobileMenuOpen}>
                        <span className="block w-6 h-0.5 bg-gray-800 rounded" />
                        <span className="block w-6 h-0.5 bg-gray-800 rounded" />
                        <span className="block w-6 h-0.5 bg-gray-800 rounded" />
                    </button>
                </div>
            </div>

            {isMobileSearchOpen && <div className="fixed inset-0 bg-black/30 z-[1099] lg:hidden" onClick={() => setIsMobileSearchOpen(false)} aria-hidden="true" />}

            {mounted && isMobileMenuOpen && createPortal(
                <div
                    className="fixed inset-0 lg:hidden"
                    style={{
                        zIndex: 99999,
                        width: "100vw",
                        height: "100vh",
                        minHeight: "100dvh",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    <div
                        className="absolute inset-0 bg-black/30"
                        style={{ zIndex: 1 }}
                        onClick={closeMobileMenu}
                        aria-hidden="true"
                    />
                    <div
                        className="absolute inset-0 flex flex-col bg-white"
                        style={{
                            zIndex: 2,
                            paddingTop: "env(safe-area-inset-top)",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        <div
                            className="flex flex-nowrap items-center justify-end gap-2 w-full px-6 py-4 border-b border-gray-100 shrink-0 min-h-[52px]"
                            style={{ backgroundColor: "#ffffff" }}
                        >
                            <button type="button" className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={handleSearchToggle} aria-label="Wyszukaj">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                            <Link href="/cart" className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={closeMobileMenu} aria-label="Koszyk">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {cartItemsCount > 0 && <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold text-white bg-[#D2B79B] rounded-full">{cartItemsCount}</span>}
                            </Link>
                            {userData ? (
                                <Link href="/zamowienia" className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={closeMobileMenu} aria-label="Konto">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </Link>
                            ) : (
                                <button type="button" className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={() => { setShowLoginModal(true); closeMobileMenu(); }} aria-label="Zaloguj się">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </button>
                            )}
                            <button type="button" className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={closeMobileMenu} aria-label="Zamknij menu">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex flex-col w-full px-6 py-6 gap-1 overflow-y-auto flex-1 bg-white">
                            <Link href="/" className="block py-2 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>Strona główna</Link>
                            <div>
                                <button type="button" className="flex items-center gap-1 py-2 text-sm font-medium text-gray-800 hover:text-[#D2B79B] w-full text-left" onClick={toggleDropdown} aria-expanded={showDropdown}>
                                    <span>Sklep</span>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {showDropdown && (
                                    <>
                                        <Link href="/products" className="block py-2 pl-6 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>Kup Teraz</Link>
                                        <Link href="/courses" className="block py-2 pl-6 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>Kursy</Link>
                                    </>
                                )}
                            </div>
                            <Link href="/blog" className="block py-2 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>Blog</Link>
                            <Link href="/o-nas" className="block py-2 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>O nas</Link>
                            <Link href="/kontakt" className="block py-2 text-sm font-medium text-gray-800 hover:text-[#D2B79B]" onClick={closeMobileMenu}>Kontakt</Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mounted && showLoginModal && createPortal(
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60" onClick={() => setShowLoginModal(false)}>
                    <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#1A1A1A]">Zaloguj się</h2>
                            <button type="button" className="p-2 rounded-full bg-[#EEEEEE] text-[#666666] hover:bg-[#E0E0E0] hover:text-[#333333] transition-colors" onClick={() => setShowLoginModal(false)} aria-label="Zamknij">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium text-[#333333] mb-1.5">Adres e-mail *</label>
                                <input id="login-email" type="email" className="w-full h-12 px-4 rounded-xl border border-[#DEDEDE] bg-[#FDFBF5] text-[#333333] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#B8A79B]/40 focus:border-[#B8A79B]" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="twoj@email.pl" required />
                            </div>
                            <div>
                                <label htmlFor="login-password" className="block text-sm font-medium text-[#333333] mb-1.5">Hasło *</label>
                                <input id="login-password" type="password" className="w-full h-12 px-4 rounded-xl border border-[#DEDEDE] bg-[#FDFBF5] text-[#333333] placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#B8A79B]/40 focus:border-[#B8A79B]" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Wpisz hasło" required />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="flex items-center gap-2 text-sm text-[#333333] cursor-pointer">
                                    <input type="checkbox" checked={loginForm.refreshToken} onChange={() => setLoginForm({ ...loginForm, refreshToken: !loginForm.refreshToken })} aria-label="Zapamiętaj mnie" className="rounded border-[#DEDEDE] text-[#B8A79B] focus:ring-[#B8A79B]" />
                                    <span>Zapamiętaj mnie</span>
                                </label>
                                <a href="#" className="text-sm text-[#333333] hover:underline" onClick={(e) => e.preventDefault()}>Zapomniałeś hasła?</a>
                            </div>
                            <button type="submit" className="w-full h-12 rounded-xl bg-[#B8A79B] text-white font-medium text-base hover:bg-[#A89688] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!loginForm.email || !loginForm.password}>Zaloguj się</button>
                            <button type="button" className="w-full h-12 rounded-xl bg-[#F0EAE3] text-[#333333] font-medium text-base hover:bg-[#E8E0D8] transition-colors" onClick={() => { setShowLoginModal(false); setLoginForm({ email: "", password: "", refreshToken: false }); }}>Anuluj</button>
                            <div className="flex items-center gap-3 py-2">
                                <span className="flex-1 h-px bg-[#DDDDDD]" />
                                <span className="text-sm text-[#333333]">lub</span>
                                <span className="flex-1 h-px bg-[#DDDDDD]" />
                            </div>
                            <p className="text-center text-sm text-[#333333]">
                                Nie masz konta?{" "}
                                <Link href="/rejestracja" className="font-bold text-[#333333] hover:underline" onClick={() => setShowLoginModal(false)}>Zarejestruj się</Link>
                            </p>
                        </form>
                    </div>
                </div>,
                document.body,
            )}
        </header>
    );
}
