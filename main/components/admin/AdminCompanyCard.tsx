"use client";

import Image from "next/image";
import { Firmy } from "@/lib/types/coursesTypes.";

interface AdminCompanyCardProps {
    company: Firmy;
    onClick: () => void;
}

export default function AdminCompanyCard({
    company,
    onClick,
}: AdminCompanyCardProps) {
    // Obsługa logo
    const getLogoSrc = (): string | null => {
        if (company.logo && typeof company.logo === "object" && "path" in company.logo) {
            return company.logo.path || null;
        }
        return null;
    };

    const logoSrc = getLogoSrc();
    const logoAlt = company.logo?.alt || company.nazwa || "Firma";

    // Skrócony opis
    const shortDescription =
        company.opis && company.opis.length > 100
            ? `${company.opis.substring(0, 100)}...`
            : company.opis || "Brak opisu";

    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Logo */}
            <div className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden">
                {logoSrc ? (
                    <Image
                        src={logoSrc}
                        alt={logoAlt}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <span className="text-4xl">🏢</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {company.nazwa || "Brak nazwy"}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {shortDescription}
                </p>

                {/* Website */}
                {company.strona_internetowa && (
                    <div className="pt-2 border-t">
                        <a
                            href={company.strona_internetowa}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-600 hover:underline truncate block">
                            🌐 {company.strona_internetowa}
                        </a>
                    </div>
                )}

                {/* Slug */}
                {company.slug && (
                    <div className="text-xs text-muted-foreground pt-1">
                        Slug: {company.slug}
                    </div>
                )}
            </div>
        </div>
    );
}
