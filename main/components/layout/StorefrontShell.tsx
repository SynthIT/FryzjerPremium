"use client";

import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export type StorefrontShellProps = {
    children: ReactNode;
    /** Przekazywane do `Header` (np. koszyk → logowanie). */
    openLoginModal?: boolean;
    redirectTo?: string;
};

export default function StorefrontShell({
    children,
    openLoginModal,
    redirectTo,
}: StorefrontShellProps) {
    return (
        <>
            <Header openLoginModal={openLoginModal} redirectTo={redirectTo} />
            {children}
            <Footer />
        </>
    );
}
