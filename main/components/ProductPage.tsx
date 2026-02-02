"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";
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

    useEffect(() => {
        async function getProduct(p: string) {
            const data = await getProducts(p);
            console.log(data);
            if (data.product) {
                setProduct(data.product);
                // Oblicz nową cenę, jeśli produkt ma promocję
                let basePrice = data.product.cena;
                if (data.product.wariant) {
                    setSelectedWariant(data.product.wariant[0]);
                    if (
                        selectedWariant?.nadpisuje_cene &&
                        selectedWariant.nowa_cena
                    ) {
                        basePrice = selectedWariant.nowa_cena;
                    }
                    if (data.product.promocje) {
                        basePrice =
                            basePrice *
                            ((100 -
                                (data.product.promocje as Promos).procent!) /
                                100);
                    }
                } else {
                    const wariant: Warianty = {
                        nazwa: "Podstawowy",
                        slug: "pdostw",
                        typ: "kolor",
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
    }, [productSlug, selectedWariant]);
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
    const relatedProducts = Array.isArray(allProducts) ? allProducts
        .filter((p) => {
            return product
                ? (p.kategoria as Categories[])[0].nazwa ==
                      (product.kategoria as Categories[])[0].nazwa &&
                      p.slug != product!.slug
                : false;
        })
        .slice(0, 4) : [];

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
            const cena = finalPrice(product.cena, w);
            console.log(cena);
            setSelectedPrice(Number(cena));
        } else {
            const cena = finalPrice(
                product.cena,
                w,
                product.promocje as Promos,
            );
            console.log(cena);
            setSelectedPrice(Number(cena));
        }
    };

    if (!product) {
        return (
            <div className="product-page">
                <div className="product-page-container">
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <h1>Produkt nie został znaleziony</h1>
                        <Link href="/products">Powrót do listy produktów</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-page">
            <div className="product-page-container">
                {/* Breadcrumbs */}
                <div className="product-breadcrumbs">
                    <Link href="/" className="breadcrumb-link">
                        Strona główna
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <Link href="/products" className="breadcrumb-link">
                        Sklep
                    </Link>
                    <span className="breadcrumb-separator">&gt;</span>
                    <Link
                        href={`/products/${(
                            product.kategoria as Categories[]
                        )[0].slug.toLowerCase()}`}
                        className="breadcrumb-link">
                        {(
                            product.kategoria as Categories[]
                        )[0].slug[0].toUpperCase() +
                            (product.kategoria as Categories[])[0].slug.slice(
                                1,
                            )}
                    </Link>
                    {(product.kategoria as Categories[])[0].nazwa && (
                        <>
                            <span className="breadcrumb-separator">&gt;</span>
                            <span className="breadcrumb-current">
                                {(product.kategoria as Categories[])[0].nazwa}
                            </span>
                        </>
                    )}
                </div>

                {/* Main Product Content */}
                <div className="product-main-content">
                    {/* Left Column - Images */}
                    <div className="product-images-section">
                        {/* Image Thumbnails - Left Side */}
                        {product.media && product.media.length > 1 && (
                            <div className="product-thumbnails">
                                {product.media.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`product-thumbnail ${
                                            selectedImage === index
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleImageSelect(index)
                                        }>
                                        {image ? (
                                            <Image
                                                src={image.path}
                                                alt={`${product.nazwa} - ${image.alt}`}
                                                width={100}
                                                height={100}
                                                className="thumbnail-image"
                                            />
                                        ) : (
                                            <div className="thumbnail-placeholder">
                                                <span>{index + 1}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Main Image - Right Side */}
                        <div className="product-main-image">
                            <div className="product-image-wrapper">
                                {product.promocje && (
                                    <div className="product-discount-badge">
                                        -{(product.promocje as Promos).procent}%
                                    </div>
                                )}
                                {product.media &&
                                product.media[selectedImage] ? (
                                    <Image
                                        src={product.media[selectedImage].path}
                                        alt={product.media[selectedImage].alt}
                                        width={600}
                                        height={600}
                                        className="product-image-main"
                                        priority
                                    />
                                ) : (
                                    <div className="product-image-placeholder">
                                        <span>{product.nazwa}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="product-details-section">
                        <h1 className="product-title">{product.nazwa}</h1>
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
                            <div className="product-option-section">
                                <label className="product-option-label">
                                    Wybierz wariant
                                </label>
                                <div className="product-sizes">
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
                        <div className="product-option-section">
                            <label className="product-option-label">
                                Ilość
                            </label>
                            <div className="quantity-selector">
                                <button
                                    className="quantity-button"
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
                                <span className="quantity-value">
                                    {quantity}
                                </span>
                                <button
                                    className="quantity-button"
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
                            className="add-to-cart-button"
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
                    <div className="product-description-section">
                        <h2 className="product-description-title">
                            Opis produktu
                        </h2>
                        <p className="product-description-text">
                            {product.opis}
                        </p>
                    </div>
                )}

                {/* Rating & Reviews Section */}
                <div className="product-reviews-section">
                    {/* Tabs */}
                    <div className="product-tabs">
                        <button
                            className={`product-tab ${
                                activeTab === "details" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("details")}>
                            Szczegóły produktu
                        </button>
                        <button
                            className={`product-tab ${
                                activeTab === "reviews" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("reviews")}>
                            Oceny i opinie
                        </button>
                        <button
                            className={`product-tab ${
                                activeTab === "faqs" ? "active" : ""
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
                    <div className="related-products-section">
                        <h2 className="related-products-title">
                            Może Cię również zainteresować
                        </h2>
                        <div className="related-products-grid">
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
                    className="review-modal-overlay"
                    onClick={() => setShowReviewModal(false)}>
                    <div
                        className="review-modal"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h2 className="review-modal-title">
                                Napisz opinię
                            </h2>
                            <button
                                className="review-modal-close"
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
                            className="review-modal-form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const response = await fetch("/api/v1/products/review", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            productSlug: product.slug,
                                            review: reviewForm,
                                        }),
                                    });

                                    const data = await response.json();

                                    if (data.status === 201) {
                                        // Odśwież dane produktu
                                        const updatedProduct = await getProducts(product.slug);
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
                                        alert(data.error || "Wystąpił błąd podczas dodawania opinii");
                                    }
                                } catch (error) {
                                    console.error("Error submitting review:", error);
                                    alert("Wystąpił błąd podczas dodawania opinii");
                                }
                            }}>
                            <div className="review-modal-field">
                                <label className="review-modal-label">
                                    Ocena *
                                </label>
                                <div className="review-modal-rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`review-modal-star ${
                                                reviewForm!.ocena >= star
                                                    ? "active"
                                                    : ""
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

                            <div className="review-modal-field">
                                <label
                                    htmlFor="reviewer-name"
                                    className="review-modal-label">
                                    Imię *
                                </label>
                                <input
                                    id="reviewer-name"
                                    type="text"
                                    className="review-modal-input"
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

                            <div className="review-modal-field">
                                <label
                                    htmlFor="review-text"
                                    className="review-modal-label">
                                    Opinia *
                                </label>
                                <textarea
                                    id="review-text"
                                    className="review-modal-textarea"
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

                            <div className="review-modal-actions">
                                <button
                                    type="button"
                                    className="review-modal-button review-modal-button-cancel"
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
                                    className="review-modal-button review-modal-button-submit"
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
