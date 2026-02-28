"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "./_breadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import "@/app/globals2.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-dvh admin-panel-wrapper">
            <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
            <div className="flex pt-16">
                <Sidebar />
                <main className="flex-1 min-w-0 px-4 pb-10 pt-6 sm:px-6 md:px-8 admin-main-content h-[calc(100vh-4rem)] overflow-y-auto">
                    <Breadcrumbs />
                    {children}
                </main>
            </div>
            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent
                    side="left"
                    className="w-[280px] p-0 overflow-y-auto">
                    <div className="flex h-full flex-col">
                        <Sidebar
                            onClose={() => setMobileMenuOpen(false)}
                            mobile
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
