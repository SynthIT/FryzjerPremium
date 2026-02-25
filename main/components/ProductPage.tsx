"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { finalPrice, getProducts, renderStars } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Products, Warianty } from "@/lib/types/productTypes";
import { Categories, Promos, Opinie } from "@/lib/types/shared";
import RelatedProduct from "./productComponents/RelatedProduct";
import ReviewTabs from "./productComponents/ReviewTabs";
import PriceElement from "./productComponents/PriceElement";
import WariantySelector from "./productComponents/wariantySelector";

interface ProductPageProps {
    productSlug?: string;
}

export default function ProductPage({ productSlug }: ProductPageProps) {
    const [product, setProduct] = useState<Products | null>(null);
    const [allProducts, setAllProduct] = useState<Products[]>([]);
    const [selectedPrice, setSelectedPrice] = useState(0);
    const [selectedWariant, setSelectedWariant] = useState<
        Warianty | undefined
    >();

    const getproduct =
        useCallback(async (slug: string) => {
            const data = await getProducts(slug);
            return data;
        }, []);

    useEffect(() => {
        async function getProduct(p: string) {
            const data =
                await getproduct(
                    p,
                );
            console.log(data);
            if (data.product) {
                setProduct(data.product);
                // Oblicz nową cenę, jeśli produkt ma promocję
                let basePrice = data.product.cena;
                if (data.product.wariant) {
                    setSelectedWariant(data.product.wariant[0]);
                    basePrice = finalPrice(data.product.cena, data.product.vat, data.product.wariant[0]);
                } else {
                    const wariant: Warianty = {
                        nazwa: "Podstawowy",
                        slug: "pdostw",
                        typ: "kolor",
                        ilosc: data.product.ilosc,
                        nadpisuje_cene: false,
                        inna_cena_skupu: false,
                    };
                    setSelectedWariant(wariant);
                    if (data.product!.promocje) {
                        basePrice =
                            basePrice *
                            ((100 -
                                (data.product!.promocje as Promos).procent!) /
                                100);
                    }
                }
                setSelectedPrice(basePrice);
            }
        }
        if (productSlug) {
            getProduct(productSlug);
        }
    }, [getproduct, productSlug]);

    useEffect(() => {
        async function getAllProducts() {
            const data = await getProducts();
            setAllProduct(Array.isArray(data.products) ? data.products : []);
        }
        getAllProducts();
    }, []);

    // Jeśli produkt nie został znaleziony, pokaż komunikat

    const [selectedImage, setSelectedImage] = useState(0);

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">(
        "reviews",
    );
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState<Opinie>({
        ocena: 0,
        uzytkownik: "",
        tresc: "",
    });

    // Pobierz produkty z tej samej kategorii (wykluczając aktualny produkt)
    const relatedProducts = Array.isArray(allProducts)
        ? allProducts
            .filter((p) => {
                return product
                    ? (p.kategoria as Categories[])[0].nazwa ==
                    (product.kategoria as Categories[])[0].nazwa &&
                    p.slug != product!.slug
                    : false;
            })
            .slice(0, 4)
        : [];

    const handleQuantityChange = useCallback((delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    }, []);

    // Memoized handlers
    const handleImageSelect = useCallback((index: number) => {
        setSelectedImage(index);
    }, []);

    const { addToCart } = useCart();

    const handleAddToCart = useCallback(() => {
        if (product?.aktywne && product.ilosc > 0) {
            console.log(product);
            console.log(selectedPrice);
            console.log(selectedWariant);
            addToCart(product, quantity, selectedPrice, selectedWariant);
            // Można dodać powiadomienie o dodaniu do koszyka
        }
    }, [product, quantity, selectedPrice, selectedWariant, addToCart]);

    const handleWariantChange = (w: Warianty) => {
        if (!product) return;
        if (!product.promocje) {
            const cena = finalPrice(product.cena, product.vat, w);
            setSelectedPrice(Number(cena));
        } else {
            const cena = finalPrice(
                product.cena,
                product.vat,
                w,
                product.promocje as Promos,
            );
            setSelectedPrice(Number(cena));
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-[#f8f6f3]">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="py-10 text-center">
                        <h1>Produkt nie został znaleziony</h1>
                        <Link href="/products">Powrót do listy produktów</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f3] pt-[140px]">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-[#D2B79B] transition-colors">
                        Strona główna
                    </Link>
                    <span className="text-gray-400">&gt;</span>
                    <Link href="/products" className="hover:text-[#D2B79B] transition-colors">
                        Sklep
                    </Link>
                    <span className="text-gray-400">&gt;</span>
                    <Link
                        href={`/products/${(
                            product.kategoria as Categories[]
                        )[0].slug.toLowerCase()}`}
                        className="hover:text-[#D2B79B] transition-colors">
                        {(
                            product.kategoria as Categories[]
                        )[0].slug[0].toUpperCase() +
                            (product.kategoria as Categories[])[0].slug.slice(
                                1,
                            )}
                    </Link>
                    {(product.kategoria as Categories[])[0].nazwa && (
                        <>
                            <span className="text-gray-400">&gt;</span>
                            <span className="text-gray-900 font-medium">
                                {(product.kategoria as Categories[])[0].nazwa}
                            </span>
                        </>
                    )}
                </nav>

                {/* Main Product Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Left Column - Images */}
                    <div className="flex gap-4">
                        {/* Image Thumbnails - Left Side */}
                        {product.media && product.media.length > 1 && (
                            <div className="flex flex-col gap-2 shrink-0">
                                {product.media.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${selectedImage === index
                                            ? "border-[#D2B79B] ring-2 ring-[#D2B79B]/30"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        onClick={() =>
                                            handleImageSelect(index)
                                        }>
                                        {image && image.path ? (
                                            <Image
                                                src={image.path}
                                                alt={image.alt || `${product.nazwa} - ${index + 1}`}
                                                width={100}
                                                height={100}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                                                <span>{index + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Main Image - Right Side */}
                        <div className="relative flex-1 aspect-square bg-gray-100 rounded-xl overflow-hidden">
                            <div className="relative w-full h-full">
                                {product.promocje && (
                                    <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-lg bg-[#D2B79B] text-black text-sm font-bold">
                                        -{(product.promocje as Promos).procent}%
                                    </div>
                                )}
                                {product.media &&
                                    Array.isArray(product.media) &&
                                    product.media[selectedImage] &&
                                    product.media[selectedImage]?.path ? (
                                    <Image
                                        src={product.media[selectedImage].path}
                                        alt={product.media[selectedImage]?.alt || product.nazwa}
                                        width={600}
                                        height={600}
                                        className="w-full h-full object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-6 text-gray-500 text-center">
                                        <span>{product.nazwa}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="space-y-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.nazwa}</h1>
                        <p>Kod produkcyjny: {product.kod_produkcyjny}</p>
                        {product.kod_ean ? (
                            <p>Kod EAN: {product.kod_ean}</p>
                        ) : product.sku ? (
                            <p>Kod SKU: {product.sku}</p>
                        ) : (
                            <></>
                        )}

                        {renderStars(product.ocena, 20)}

                        <PriceElement
                            product={product}
                            promocje={product.promocje as Promos}
                            selectedWariant={selectedWariant}></PriceElement>

                        {/* wariant Selection */}
                        {product.wariant && (
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Wybierz wariant
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.wariant.map((w, i) => (
                                        <WariantySelector
                                            key={i}
                                            warianty={w}
                                            selectedWariant={selectedWariant!}
                                            handleWariantSelect={(w) => {
                                                handleWariantChange(w);
                                                setSelectedWariant(w);
                                            }}></WariantySelector>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Ilość
                            </label>
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg w-fit">
                                <button
                                    type="button"
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-md transition-colors"
                                    onClick={() => handleQuantityChange(-1)}
                                    aria-label="Zmniejsz ilość">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}>
                                        <path d="M5 12h14" />
                                    </svg>
                                </button>
                                <span className="min-w-[2rem] text-center font-medium">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors"
                                    onClick={() => handleQuantityChange(1)}
                                    aria-label="Zwiększ ilość">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}>
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            className="w-full py-3 rounded-xl bg-[#D2B79B] text-black font-semibold hover:bg-[#b89a7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={product.ilosc == 0}
                            onClick={handleAddToCart}>
                            {product.ilosc != 0
                                ? "Dodaj do koszyka"
                                : product.aktywne
                                    ? "Produkt niedostępny"
                                    : "Produkt niedostępny"}
                        </button>
                    </div>
                </div>

                {/* Product Description Section */}
                {product.opis && (
                    <div className="rounded-xl border border-[rgba(212,196,176,0.3)] bg-white/60 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">
                            Opis produktu
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {product.opis}
                        </p>
                    </div>
                )}

                {/* Rating & Reviews Section */}
                <div className="mt-10">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "details"
                                ? "bg-[#D2B79B] text-black"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveTab("details")}>
                            Szczegóły produktu
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "reviews"
                                ? "bg-[#D2B79B] text-black"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveTab("reviews")}>
                            Oceny i opinie
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === "faqs"
                                ? "bg-[#D2B79B] text-black"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            onClick={() => setActiveTab("faqs")}>
                            FAQ
                        </button>
                    </div>
                    <ReviewTabs
                        activeTab={activeTab}
                        product={product}
                        setShowReviewModal={(b) =>
                            setShowReviewModal(b)
                        }></ReviewTabs>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Może Cię również zainteresować
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {relatedProducts.map((relatedProduct, index) => (
                                <RelatedProduct
                                    key={index}
                                    relatedProduct={relatedProduct}
                                    id={index}></RelatedProduct>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowReviewModal(false)}>
                    <div
                        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                Napisz opinię
                            </h2>
                            <button
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowReviewModal(false)}
                                aria-label="Zamknij">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <form
                            className="flex flex-col gap-4 p-6"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const response = await fetch(
                                        "/api/v1/products/review",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                productSlug: product.slug,
                                                review: reviewForm,
                                            }),
                                        },
                                    );

                                    const data = await response.json();

                                    if (data.status === 201) {
                                        // Odśwież dane produktu
                                        const updatedProduct =
                                            await getProducts(product.slug);
                                        if (updatedProduct.product) {
                                            setProduct(updatedProduct.product);
                                        }
                                        setShowReviewModal(false);
                                        setReviewForm({
                                            ocena: 0,
                                            uzytkownik: "",
                                            tresc: "",
                                        });
                                        // Można dodać powiadomienie o sukcesie
                                        alert("Opinia została dodana!");
                                    } else {
                                        alert(
                                            data.error ||
                                            "Wystąpił błąd podczas dodawania opinii",
                                        );
                                    }
                                } catch (error) {
                                    console.error(
                                        "Error submitting review:",
                                        error,
                                    );
                                    alert(
                                        "Wystąpił błąd podczas dodawania opinii",
                                    );
                                }
                            }}>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">
                                    Ocena *
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`p-1 transition-colors ${reviewForm!.ocena >= star
                                                ? "text-[#D2B79B]"
                                                : "text-gray-300 hover:text-gray-400"
                                                }`}
                                            onClick={() =>
                                                setReviewForm({
                                                    ...reviewForm,
                                                    ocena: star,
                                                })
                                            }
                                            aria-label={`Oceń ${star} gwiazdką`}>
                                            <svg
                                                viewBox="0 0 24 24"
                                                width="32"
                                                height="32">
                                                <path
                                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="reviewer-name"
                                    className="text-sm font-medium text-gray-700">
                                    Imię *
                                </label>
                                <input
                                    id="reviewer-name"
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#D2B79B] focus:border-[#D2B79B] outline-none"
                                    value={
                                        reviewForm.uzytkownik != ""
                                            ? reviewForm.uzytkownik
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setReviewForm({
                                            ...reviewForm,
                                            uzytkownik: e.target.value,
                                        })
                                    }
                                    placeholder="Twoje imię"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="review-text"
                                    className="text-sm font-medium text-gray-700">
                                    Opinia *
                                </label>
                                <textarea
                                    id="review-text"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#D2B79B] focus:border-[#D2B79B] outline-none resize-y min-h-[120px]"
                                    value={reviewForm.tresc}
                                    onChange={(e) =>
                                        setReviewForm({
                                            ...reviewForm,
                                            tresc: e.target.value,
                                        })
                                    }
                                    placeholder="Podziel się swoją opinią o produkcie..."
                                    rows={6}
                                    required
                                />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
                                    onClick={() => {
                                        setShowReviewModal(false);
                                        setReviewForm({
                                            ocena: 0,
                                            uzytkownik: "",
                                            tresc: "",
                                        });
                                    }}>
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-[#D2B79B] text-black font-semibold hover:bg-[#b89a7f]"
                                    disabled={
                                        reviewForm.ocena === 0 ||
                                        !reviewForm.uzytkownik ||
                                        !reviewForm.tresc
                                    }>
                                    Opublikuj opinię
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
