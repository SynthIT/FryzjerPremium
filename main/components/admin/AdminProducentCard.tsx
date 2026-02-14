"use client";

import Image from "next/image";
import { Producents } from "@/lib/types/productTypes";

interface AdminProducentCardProps {
    producent: Producents;
    onClick: () => void;
}

export default function AdminProducentCard({
    producent,
    onClick,
}: AdminProducentCardProps) {
    const getImageSrc = (): string | null => {
        if (producent.logo) {
            return producent.logo.path || null;
        }
        return null;
    };

    const imageSrc = getImageSrc();
    const imageAlt = producent.nazwa || "Producent";

    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Image */}
            <div className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
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
                    {producent.nazwa || "Brak nazwy"}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {producent.opis || "Brak opisu"}
                </p>
            </div>
        </div>
    );
}
