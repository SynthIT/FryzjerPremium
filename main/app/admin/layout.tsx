"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "./_breadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        fetch("/admin/api/v1/auth", {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status !== 200) {
                    router.push("/");
                } else {
                    setLoading(false);
                }
            })
            .catch(() => {
                router.push("/");
            });
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Ładowanie...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh">
            <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr]">
                <Sidebar />
                <main className="min-w-0 px-3 pb-10 pt-4 sm:px-4 md:px-6">
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
