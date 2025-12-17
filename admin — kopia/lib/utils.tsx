import React from "react";
import axios from "axios";
import { Promos, Warianty } from "./models/Products";

export const getProducts = async (slug?: string) => {
    const url = new URL("http://localhost:3000/api/v1/products");
    if (slug) {
        url.searchParams.append("slug", slug);
    }
    const data = await fetch(url, {
        cache: "default",
    });
    return data.json();
};

export const updateProduct = async (product: Products) => {
    const url = new URL("http://localhost:3000/api/v1/products");
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
    });
    const data = await response.json();
    if (data.status !== 0) {
        throw new Error(data.error || "Błąd podczas aktualizacji produktu");
    }
    return data;
};

export const deleteProduct = async (slug: string) => {
    const url = new URL("http://localhost:3000/api/v1/products");
    url.searchParams.append("slug", slug);
    const response = await fetch(url, {
        method: "DELETE",
    });
    const data = await response.json();
    if (data.status !== 0) {
        throw new Error(data.error || "Błąd podczas usuwania produktu");
    }
    return data;
};

export const registerUser = async (email: string, password: string) => {
    const url = new URL("http://localhost:3000/api/v1/auth/register");
    const data = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    return data;
};

export const loginUser = async (email: string, password: string) => {
    const url = new URL("http://localhost:3000/api/v1/auth/login");
    const data = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    return data;
};

const getCategories = async () => {
    const data = await fetch(
        "http://localhost:3000/api/v1/products/categories",
        { cache: "force-cache", next: { revalidate: 300 } }
    );
    return data.json();
};

export const finalPrice = (
    cena: number,
    selectedWariant?: Warianty,
    promocje?: Promos
) => {
    let basePrice = cena;
    if (selectedWariant?.nadpisuje_cene && selectedWariant.nowa_cena) {
        basePrice = selectedWariant.nowa_cena;
    }
    if (promocje) {
        basePrice = basePrice * ((100 - promocje.procent) / 100);
    }
    return basePrice.toFixed(2).toString().replace(".", ",");
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
export const getCategoryDisplayName = async (
    categorySlug: string
): Promise<string> => {
    const categories = await getCategories();
    if (!categorySlug) return "Wszystkie produkty";
    const lowerSlug = categorySlug.toLowerCase();
    return (
        categories.categories![lowerSlug] ||
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
export const getSubcategoryKeywords = async (): Promise<{
    [key: string]: string[];
}> => {
    const categories = await getCategories();
    return categories.categories!;
};
