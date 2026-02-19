"use client";

import { Categories } from "@/lib/types/shared";
import Image from "next/image";

interface AdminCategoryCardProps {
    category: Categories;
    onClick: () => void;
}

export default function AdminCategoryCard({
    category,
    onClick,
}: AdminCategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer bg-card hover:bg-accent/50 group">
            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    Nazwa: {category.nazwa || "Brak nazwy"}
                </h3>

                {/* Slug */}
                <p className="text-sm text-muted-foreground">
                    Kategoria: {category.kategoria || "Brak kategorii"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Typ: {category.type || "Brak typu"}
                </p>
            </div>
            <div className="flex items-center justify-between">
                {category.image && !category.image.path ? (
                    <Image src={category.image?.path} alt={category.image?.alt} className="w-10 h-10 rounded-full" />
                ) : (
                    <span className="text-muted-foreground">
                        {category.nazwa}
                    </span>
                )}

            </div>
        </div >
    );
}
