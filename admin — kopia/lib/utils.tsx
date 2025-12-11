import React from "react";
import { ProductsResponse } from "./interfaces/ax";
import axios from "axios"

export const getProducts = async (slug?: string) => {
    const { data } = await axios.get<ProductsResponse>("/api/v1/products/get", {
        params: { slug: slug },
    });
    return data;
};

/**
 * Renderuje gwiazdki oceny produktu
 */
export const renderStars = (
    rating: number,
    size: number = 20
): React.JSX.Element => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="product-rating-stars">
            {Array(fullStars)
                .fill(0)
                .map((_, i) => (
                    <svg
                        key={`full-${i}`}
                        className="star star-full"
                        viewBox="0 0 24 24"
                        width={size}
                        height={size}>
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill="currentColor"
                        />
                    </svg>
                ))}
            {hasHalfStar && (
                <svg
                    className="star star-half"
                    viewBox="0 0 24 24"
                    width={size}
                    height={size}>
                    <defs>
                        <clipPath id={`half-star-${rating}`}>
                            <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                    </defs>
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="currentColor"
                        clipPath={`url(#half-star-${rating})`}
                    />
                    <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="1.5"
                    />
                </svg>
            )}
            {Array(emptyStars)
                .fill(0)
                .map((_, i) => (
                    <svg
                        key={`empty-${i}`}
                        className="star star-empty"
                        viewBox="0 0 24 24"
                        width={size}
                        height={size}>
                        <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                ))}
            <span className="rating-number">{rating}/5</span>
        </div>
    );
};

/**
 * Mapowanie nazw kategorii z URL na wyświetlane nazwy
 */
export const getCategoryDisplayName = (categorySlug: string): string => {
    if (!categorySlug) return "Wszystkie produkty";
    const categoryMap: { [key: string]: string } = {
        "kosmetyki": "Kosmetyki",
        "sprzęty": "Sprzęty",
        "sprzety": "Sprzęty",
        "meble": "Meble",
        "szkolenia": "Szkolenia",
    };
    const lowerSlug = categorySlug.toLowerCase();
    return (
        categoryMap[lowerSlug] ||
        categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    );
};

/**
 * Dekoduje URL parametr kategorii
 */
export const decodeCategory = (categorySlug: string): string => {
    try {
        return decodeURIComponent(categorySlug);
    } catch {
        return categorySlug;
    }
};

/**
 * Mapowanie podkategorii na słowa kluczowe w nazwie produktu
 */
export const getSubcategoryKeywords = (): { [key: string]: string[] } => {
    return {
        "Szampony": ["szampon", "shampoo"],
        "Odżywki": ["odżywka", "odzywka"],
        "Lakiery": ["lakier"],
        "Maseczki": ["maska", "maske"],
        "Olejki": ["olejek"],
        "Myjnie": ["myjnia", "myjnia"],
        "Suszarki": ["suszarka", "suszarki"],
        "Nożyczki": ["nożyczki", "nozyczki"],
        "Maszynki": ["maszynka"],
        "Prostownice": ["prostownica"],
        "Fotele": ["fotel"],
        "Stanowiska do mycia": ["stanowisko"],
        "Lustra": ["lustro"],
        "Szafki": ["szafka"],
        "Stoliki": ["stolik"],
        "Koloryzacja": ["koloryzacja", "koloryzacji"],
        "Strzyżenie": ["strzyżenie", "strzyzenia", "strzyzenia"],
        "Stylizacja": ["stylizacja"],
        "Manicure": ["manicure"],
        "Makijaż": ["makijaż", "makijaz"],
    };
};
