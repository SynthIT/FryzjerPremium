"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    const acc: { href: string; label: string }[] = [];
    segments.forEach((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const label = seg
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        acc.push({ href, label });
    });

    if (acc.length <= 1) return null;

    return (
        <nav
            aria-label="Okruszki nawigacyjne"
            className="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
            <ol className="flex flex-wrap items-center gap-1">
                <li>
                    <Link href="/admin" className="hover:text-foreground">
                        Panel
                    </Link>
                </li>
                {acc.slice(1).map((item, i) => (
                    <React.Fragment key={item.href}>
                        <li aria-hidden className="px-1">
                            /
                        </li>
                        <li>
                            {i === acc.length - 2 ? (
                                <span className="text-foreground">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="hover:text-foreground">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
}
