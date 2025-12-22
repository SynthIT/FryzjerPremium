"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
import { useCart } from "@/contexts/CartContext";
import { loginUser } from "@/lib/utils";
import LoggedBadge from "./LoggedBadge";
import { User } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function Header() {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    });
    const [mounted, setMounted] = useState(false);
    const cartDropdownRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { getTotalItems, lastAddedItem, clearLastAddedItem } = useCart();
    const { addUser, user } = useUser();

    const cartItemsCount = getTotalItems();

    useEffect(() => {
        async function setuser() {
            const request = await fetch("/api/v1/auth/check", {
                method: "POST",
                credentials: "include",
                cache: "force-cache",
            }).then((res) => res.json());
            if (request.user) {
                addUser(request.user);
            }
        }
        setuser();
    }, [addUser]);

    // Upewnij się, że komponent jest zamontowany (dla Portal)
    useEffect(() => {
        function a() {
            setMounted(true);
        }
        a();
    }, []);

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

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            console.log("Szukaj:", searchQuery);
        },
        [searchQuery]
    );

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
        setShowDropdown(false);
        setIsMobileSearchOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileSearchOpen(false);
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
        [closeMobileMenu]
    );

    const toggleDropdown = useCallback(() => {
        setShowDropdown((prev) => !prev);
    }, []);

    return (
        <header>
            <div className="header-container">
                <div className="header-logo">
                    <Link href="/" aria-label="Strona główna">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="Mainlogo"
                        />
                    </Link>
                </div>

                <nav
                    className={`header-nav ${
                        isMobileMenuOpen ? "is-open" : ""
                    }`}>
                    <Link
                        href="/"
                        className="nav-link"
                        onClick={closeMobileMenu}>
                        Strona główna
                    </Link>
                    <div className="nav-dropdown">
                        <button
                            onClick={toggleDropdown}
                            className={`nav-link-button ${
                                showDropdown ? "is-open" : ""
                            }`}
                            aria-expanded={showDropdown}>
                            <span>Sklep</span>
                            <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                className="dropdown-arrow">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <Link
                                    href="/products"
                                    className="dropdown-item"
                                    onClick={closeMobileMenu}>
                                    Kup Teraz
                                </Link>
                                <a
                                    href="#product-categories-section"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        smoothScrollTo(
                                            "product-categories-section"
                                        );
                                    }}>
                                    Kategorie
                                </a>
                                <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        closeMobileMenu();
                                    }}>
                                    Promocje
                                </a>
                                <a
                                    href="#new-arrivals-section"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        smoothScrollTo("new-arrivals-section");
                                    }}>
                                    Nowości
                                </a>
                                <a
                                    href="#bestsellers-section"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        smoothScrollTo("bestsellers-section");
                                    }}>
                                    Bestsellery
                                </a>
                            </div>
                        )}
                    </div>
                    <Link
                        href="/blog"
                        className="nav-link"
                        onClick={closeMobileMenu}>
                        Blog
                    </Link>
                    <Link
                        href="/o-nas"
                        className="nav-link"
                        onClick={closeMobileMenu}>
                        O nas
                    </Link>
                    <Link
                        href="/kontakt"
                        className="nav-link"
                        onClick={closeMobileMenu}>
                        Kontakt
                    </Link>
                </nav>

                <div
                    className={`header-search ${
                        isMobileSearchOpen ? "is-open" : ""
                    }`}
                    ref={searchContainerRef}>
                    <form
                        onSubmit={handleSearch}
                        className="search-form"
                        onClick={(e) => e.stopPropagation()}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Wyszukaj produkt..."
                            className="search-input"
                        />
                    </form>
                </div>

                <div className="basket-actions">
                    <button
                        type="button"
                        className={`search-toggle-button ${
                            isMobileSearchOpen ? "is-active" : ""
                        }`}
                        onClick={handleSearchToggle}
                        aria-label={
                            isMobileSearchOpen
                                ? "Zamknij wyszukiwarkę"
                                : "Otwórz wyszukiwarkę"
                        }
                        aria-expanded={isMobileSearchOpen}>
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            className="search-icon">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </button>
                    <div className="cart-button-wrapper" ref={cartDropdownRef}>
                        <Link
                            href="/cart"
                            className="login-button cart-button"
                            aria-label={`Koszyk${
                                cartItemsCount > 0
                                    ? ` (${cartItemsCount} ${
                                          cartItemsCount === 1
                                              ? "produkt"
                                              : "produktów"
                                      })`
                                    : ""
                            }`}>
                            <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                className="basket-icon"
                                aria-hidden="true">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="cart-badge" aria-hidden="true">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {showCartDropdown && lastAddedItem && (
                            <div className="cart-dropdown">
                                <div className="cart-dropdown-header">
                                    <div className="cart-dropdown-icon">
                                        <svg
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="cart-dropdown-title">
                                        Produkt dodany do koszyka
                                    </span>
                                </div>

                                <div className="cart-dropdown-item">
                                    <div className="cart-dropdown-item-image">
                                        {lastAddedItem.product.media ? (
                                            <Image
                                                src={
                                                    lastAddedItem.product
                                                        .media[0].path
                                                }
                                                alt={
                                                    lastAddedItem.product
                                                        .media[0].alt
                                                }
                                                width={60}
                                                height={60}
                                                className="cart-dropdown-img"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="cart-dropdown-item-details">
                                        <div className="cart-dropdown-item-name">
                                            {lastAddedItem.product.nazwa}
                                        </div>
                                        <div className="cart-dropdown-item-info">
                                            {lastAddedItem.wariant && (
                                                <span className="cart-dropdown-item-options">
                                                    {`${lastAddedItem.wariant.typ}: ${lastAddedItem.wariant.nazwa}`}
                                                </span>
                                            )}
                                            <span className="cart-dropdown-item-quantity">
                                                Ilość: {lastAddedItem.quantity}
                                            </span>
                                        </div>
                                        <div className="cart-dropdown-item-price">
                                            {(
                                                lastAddedItem.price *
                                                lastAddedItem.quantity
                                            )
                                                .toFixed(2)
                                                .replace(".", ",")}{" "}
                                            zł
                                        </div>
                                    </div>
                                </div>

                                <div className="cart-dropdown-buttons">
                                    <Link
                                        href="/cart"
                                        className="cart-dropdown-button cart-dropdown-button-secondary"
                                        onClick={() => {
                                            setShowCartDropdown(false);
                                            clearLastAddedItem();
                                        }}>
                                        Pokaż koszyk
                                    </Link>
                                    <Link
                                        href="/cart"
                                        className="cart-dropdown-button cart-dropdown-button-primary"
                                        onClick={() => {
                                            setShowCartDropdown(false);
                                            clearLastAddedItem();
                                        }}>
                                        Przejdź do kasy
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    {user ? (
                        <>
                            <LoggedBadge user={user}></LoggedBadge>
                        </>
                    ) : (
                        <button
                            className="login-button"
                            onClick={() => {
                                setShowLoginModal(true);
                                closeMobileMenu();
                            }}
                            aria-label="Zaloguj się">
                            <User></User>
                        </button>
                    )}
                    <button
                        className={`mobile-menu-toggle ${
                            isMobileMenuOpen ? "is-active" : ""
                        }`}
                        onClick={toggleMobileMenu}
                        aria-label={
                            isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"
                        }
                        aria-expanded={isMobileMenuOpen}
                        type="button">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {isMobileSearchOpen && (
                <div
                    className="mobile-search-overlay"
                    onClick={() => setIsMobileSearchOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Login Modal - rendered via Portal */}
            {mounted &&
                showLoginModal &&
                createPortal(
                    <div
                        className="login-modal-overlay"
                        onClick={() => setShowLoginModal(false)}>
                        <div
                            className="login-modal"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="login-modal-header">
                                <h2 className="login-modal-title">
                                    Zaloguj się
                                </h2>
                                <button
                                    className="login-modal-close"
                                    onClick={() => setShowLoginModal(false)}
                                    aria-label="Zamknij">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <form
                                className="login-modal-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    // Tutaj można dodać logikę logowania
                                    console.log("Login submitted:", loginForm);
                                    setShowLoginModal(false);
                                    setLoginForm({ email: "", password: "" });
                                }}>
                                <div className="login-modal-field">
                                    <label
                                        htmlFor="login-email"
                                        className="login-modal-label">
                                        Adres e-mail *
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        className="login-modal-input"
                                        value={loginForm.email}
                                        onChange={(e) =>
                                            setLoginForm({
                                                ...loginForm,
                                                email: e.target.value,
                                            })
                                        }
                                        placeholder="twoj@email.pl"
                                        required
                                    />
                                </div>

                                <div className="login-modal-field">
                                    <label
                                        htmlFor="login-password"
                                        className="login-modal-label">
                                        Hasło *
                                    </label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        className="login-modal-input"
                                        value={loginForm.password}
                                        onChange={(e) =>
                                            setLoginForm({
                                                ...loginForm,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Wpisz hasło"
                                        required
                                    />
                                </div>

                                <div className="login-modal-options">
                                    <label className="login-modal-checkbox">
                                        <input
                                            type="checkbox"
                                            aria-label="Zapamiętaj mnie"
                                        />
                                        <span>Zapamiętaj mnie</span>
                                    </label>
                                    <div className="login-modal-links">
                                        <a
                                            href="#"
                                            className="login-modal-forgot"
                                            onClick={(e) => e.preventDefault()}>
                                            Zapomniałeś hasła?
                                        </a>
                                        <span className="login-modal-separator">
                                            |
                                        </span>
                                        <Link
                                            href="/rejestracja"
                                            className="login-modal-register-inline"
                                            onClick={() =>
                                                setShowLoginModal(false)
                                            }>
                                            Zarejestruj się
                                        </Link>
                                    </div>
                                </div>

                                <div className="login-modal-actions">
                                    <button
                                        type="submit"
                                        className="login-modal-button login-modal-button-submit"
                                        disabled={
                                            !loginForm.email ||
                                            !loginForm.password
                                        }
                                        onClick={async () => {
                                            const response = await loginUser(
                                                loginForm.email,
                                                loginForm.password
                                            );
                                            if (response.status == 201) {
                                                addUser(response.user);
                                                alert("Zostałeś zalogowany");
                                            } else {
                                                alert(
                                                    "Email albo hasło, są niepoprawne"
                                                );
                                            }
                                        }}>
                                        Zaloguj się
                                    </button>
                                    <button
                                        type="button"
                                        className="login-modal-button login-modal-button-cancel"
                                        onClick={() => {
                                            setShowLoginModal(false);
                                            setLoginForm({
                                                email: "",
                                                password: "",
                                            });
                                        }}>
                                        Anuluj
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body
                )}
        </header>
    );
}
