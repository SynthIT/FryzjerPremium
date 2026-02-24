import React from "react";
import { Products, Warianty } from "./types/productTypes";
import { Promos } from "./types/shared";

export const getProducts = async (slug?: string) => {
    const url = new URL("http://localhost:3000/api/v1/products");
    if (slug) {
        url.searchParams.append("slug", slug);
    }
    const data = await fetch(url, {
        cache: "default",
        credentials: "include",
    });
    return data.json();
};

export const getCourses = async (slug?: string) => {
    try {
        // Użyj względnego URL zamiast hardcoded localhost
        const baseUrl = typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const url = new URL(`${baseUrl}/api/v1/courses`);
        if (slug) {
            url.searchParams.append("slug", slug);
        }


        const response = await fetch(url, {
            cache: "no-store", // Nie cache'uj, żeby zawsze mieć świeże dane
            credentials: "include",
        });


        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return errorData; // Zwróć błąd zamiast rzucać wyjątek
        }

        const data = await response.json();

        if (slug) {
            return data.course || [];
        }
        // Upewnij się, że zwracamy poprawny format
        if (data && data.courses) {
            return data;
        } else {
            return { status: 200, courses: [] };
        }
        
        // Jeśli nie ma slug, API zwraca { status: 200, courses: [...] }
        if (data && data.courses) {
            return data;
        }
        
        // Fallback - zwróć pustą tablicę kursów
        return { status: 200, courses: [] };
    } catch (error) {
        console.error("Błąd w getCourses:", error);
        return { status: 1, error: "Błąd podczas pobierania danych" };
    }
};

export const updateProduct = async (product: Products) => {
    const bd = new URL("http://localhost:3000/admin/api/v1/products");
    const url = new URL("http://localhost:3000/api/v1/products");

    const response = await fetch(bd, {
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
    await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
    });
    return data;
};

export const deleteProduct = async (slug: string) => {
    const bd = new URL("http://localhost:3000/admin/api/v1/products");
    const url = new URL("http://localhost:3000/api/v1/products");

    bd.searchParams.append("slug", slug);
    const response = await fetch(bd, {
        method: "DELETE",
    });
    const data = await response.json();
    if (data.status !== 0) {
        throw new Error(data.error || "Błąd podczas usuwania produktu");
    }
    url.searchParams.append("slug", slug);
    await fetch(url, {
        method: "DELETE",
    });
    return data;
};

export const registerUser = async (email: string, password: string) => {
    const url = new URL("http://localhost:3001/api/v1/auth/register");
    const data = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    return data;
};

export const loginUser = async ({
    payload,
}: {
    payload: { email: string; password: string; refreshToken: boolean };
}) => {
    const url = new URL("http://localhost:3000/api/v1/auth/login");
    const data = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
    }).then((res) => {
        return res.json();
    });
    return data;
};

const getCategories = async () => {
    const data = await fetch(
        "http://localhost:3000/api/v1/products/categories",
        { cache: "force-cache", next: { revalidate: 300 } },
    );
    return data.json();
};

export const finalPrice = (
    cena: number,
    vat: number,
    selectedWariant?: Warianty,
    promocje?: Promos,
) => {
    let basePrice = cena;
    if (selectedWariant?.nadpisuje_cene && selectedWariant.nowa_cena) {
        basePrice = selectedWariant.nowa_cena;
    }
    if (promocje && promocje.procent) {
        basePrice = basePrice * ((100 - promocje.procent) / 100);
    }
    basePrice = basePrice + (basePrice * vat) / 100;
    return basePrice.toFixed(2);
};

export const cenabezvat = (cena: number, vat: number, wariant?: Warianty) => {
    let basePrice = cena;
    if (wariant?.nadpisuje_cene && wariant.nowa_cena) {
        basePrice = wariant.nowa_cena - (wariant.nowa_cena * vat) / 100;
    } else {
        basePrice = basePrice - (basePrice * vat) / 100;
    }
    return basePrice.toFixed(3).toString().replace(".", ",");
};

/**
 * Renderuje gwiazdki oceny produktu
 */
export const renderStars = (
    rating: number,
    size: number = 20,
): React.JSX.Element => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
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
    categorySlug: string,
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
