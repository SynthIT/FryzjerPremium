"use client";

import Image from "next/image";
import { Categories, Promos } from "@/lib/types/shared";
import { Products, Producents } from "@/lib/types/productTypes";

interface AdminProductCardProps {
    product: Products;
    onClick: () => void;
}

export default function AdminProductCard({
    product,
    onClick,
}: AdminProductCardProps) {
    // Obsługa kategorii - może być arrayem
    const getCategories = (): Categories[] => {
        if (!product.kategoria) return [];
        if (Array.isArray(product.kategoria)) {
            return product.kategoria.filter(
                (cat): cat is Categories =>
                    typeof cat === "object" &&
                    cat !== null &&
                    "nazwa" in cat &&
                    "slug" in cat,
            ) as Categories[];
        }
        return [];
    };

    const categories = getCategories();
    const firstCategory = categories[0];

    // Obsługa producenta
    const getProducentName = (): string => {
        if (!product.producent) return "Brak producenta";
        if (typeof product.producent === "string") return product.producent;
        if (
            typeof product.producent === "object" &&
            "nazwa" in product.producent
        ) {
            return (product.producent as Producents).nazwa || "Brak producenta";
        }
        return "Brak producenta";
    };

    const producentName = getProducentName();

    // Obsługa zdjęcia
    const getImageSrc = (): string | null => {
        if (
            product.media &&
            Array.isArray(product.media) &&
            product.media.length > 0
        ) {
            return product.media[0].path || null;
        }
        return null;
    };

    const imageSrc = getImageSrc();
    const imageAlt = product.media?.[0]?.alt || product.nazwa || "Produkt";

    // Skrócony opis
    const shortDescription =
        product.opis && product.opis.length > 100
            ? `${product.opis.substring(0, 100)}...`
            : product.opis || "Brak opisu";

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
                        <span className="text-4xl">📦</span>
                    </div>
                )}
                {/* Status badge */}
                {product.aktywne === false && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Nieaktywny
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2">
                {/* Title */}
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {product.nazwa || "Brak nazwy"}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {shortDescription}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <div className="font-bold text-lg">
                            {product.cena
                                ? `${product.cena.toFixed(2)} zł`
                                : "Brak ceny"}
                        </div>
                        {product.promocje &&
                            typeof product.promocje === "object" &&
                            "procent" in product.promocje && (
                                <div className="text-xs text-green-600">
                                    Promocja: -
                                    {(product.promocje as Promos).procent}%
                                </div>
                            )}
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                            Ilość:
                        </div>
                        <div
                            className={`font-semibold ${
                                (product.ilosc || 0) === 0
                                    ? "text-red-600"
                                    : "text-green-600"
                            }`}>
                            {product.ilosc ?? 0}
                        </div>
                    </div>
                </div>

                {/* Category and Producer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex flex-wrap gap-1">
                        {firstCategory ? (
                            <span className="px-2 py-1 bg-muted rounded">
                                {firstCategory.nazwa ||
                                    firstCategory.slug ||
                                    "Brak kategorii"}
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-muted rounded">
                                Brak kategorii
                            </span>
                        )}
                        {categories.length > 1 && (
                            <span className="px-2 py-1 bg-muted rounded">
                                +{categories.length - 1}
                            </span>
                        )}
                    </div>
                    <div
                        className="truncate max-w-[120px]"
                        title={producentName}>
                        {producentName}
                    </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div>
                        {product.kod_produkcyjny && (
                            <span>Kod: {product.kod_produkcyjny}</span>
                        )}
                    </div>
                    <div>
                        {product.ocena !== undefined && (
                            <span>⭐ {product.ocena.toFixed(1)}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
