'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import "@/app/globals.css";
import { getProductById, allProducts } from '@/app/data/products';
import { renderStars } from '@/lib/utils';
import { getReviewsByProductId } from '@/app/data/reviews';
import { useCart } from '@/contexts/CartContext';


interface ProductPageProps {
  productId: string;
}

export default function ProductPage({ productId }: ProductPageProps) {
  const product = getProductById(productId);
  
  // Jeśli produkt nie został znaleziony, pokaż komunikat
  if (!product || product.id !== parseInt(productId)) {
    return (
      <div className="product-page">
        <div className="product-page-container">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Produkt nie został znaleziony</h1>
            <Link href="/products">Powrót do listy produktów</Link>
          </div>
        </div>
      </div>
    );
  }
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.value || null);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faqs'>('reviews');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'highest' | 'lowest'>('latest');
  const [visibleReviews, setVisibleReviews] = useState(4);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    reviewerName: '',
    text: '',
  });
  
  // Upewnijmy się, że product.id jest liczbą
  const productIdNum = typeof product.id === 'number' ? product.id : parseInt(String(product.id));
  const allReviews = getReviewsByProductId(productIdNum);
  
  // Pobierz produkty z tej samej kategorii (wykluczając aktualny produkt)
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product.category, product.id]);
  
  // Sortowanie recenzji
  const sortedReviews = [...allReviews].sort((a, b) => {
    switch (sortOrder) {
      case 'latest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });
  
  const displayedReviews = sortedReviews.slice(0, visibleReviews);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  }, []);

  // Memoized handlers
  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  const handleColorSelect = useCallback((colorValue: string) => {
    setSelectedColor(colorValue);
  }, []);

  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
  }, []);

  const { addToCart } = useCart();

  const handleAddToCart = useCallback(() => {
    if (product.inStock) {
      addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
      // Można dodać powiadomienie o dodaniu do koszyka
    }
  }, [product, quantity, selectedColor, selectedSize, addToCart]);

  return (
    <main className="product-page">
      <div className="product-page-container">
        {/* Breadcrumbs */}
        <div className="product-breadcrumbs">
          <Link href="/" className="breadcrumb-link">Strona główna</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <Link href="/products" className="breadcrumb-link">Sklep</Link>
          <span className="breadcrumb-separator">&gt;</span>
          <Link href={`/products/${product.category.toLowerCase()}`} className="breadcrumb-link">{product.category}</Link>
          {product.subcategory && (
            <>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-current">{product.subcategory}</span>
            </>
          )}
        </div>

        {/* Main Product Content */}
        <div className="product-main-content">
          {/* Left Column - Images */}
          <div className="product-images-section">
            {/* Image Thumbnails - Left Side */}
            {product.images && product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`product-thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => handleImageSelect(index)}
                    aria-label={`Pokaż zdjęcie ${index + 1} produktu ${product.name}`}
                    aria-pressed={selectedImage === index}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleImageSelect(index);
                      }
                    }}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={`${product.name} - widok ${index + 1}`}
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
                {product.discount && (
                  <div className="product-discount-badge">-{product.discount}%</div>
                )}
                {product.images && product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="product-image-main"
                    priority
                  />
                ) : (
                  <div className="product-image-placeholder">
                    <span>{product.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="product-details-section">
            <h1 className="product-title">{product.fullName || product.name}</h1>
            
            {renderStars(product.rating, 20)}
            
            <div className="product-price-section">
              {product.originalPrice && (
                <span className="product-original-price">{product.originalPrice} zł</span>
              )}
              <span className="product-current-price">{product.price} zł</span>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="product-option-section">
                <label className="product-option-label">Wybierz kolor</label>
                <div className="product-colors">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      className={`color-swatch ${selectedColor === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                      aria-label={`Wybierz kolor ${color.name}`}
                      aria-pressed={selectedColor === color.value}
                    >
                      {selectedColor === color.value && (
                        <svg className="color-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="product-option-section">
                <label className="product-option-label">Wybierz rozmiar</label>
                <div className="product-sizes">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                      aria-label={`Wybierz rozmiar ${size}`}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="product-option-section">
              <label className="product-option-label">Ilość</label>
              <div className="quantity-selector">
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Zmniejsz ilość"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-button"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Zwiększ ilość"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="add-to-cart-button"
              disabled={!product.inStock}
              onClick={handleAddToCart}
              aria-label={product.inStock ? `Dodaj ${product.name} do koszyka` : 'Produkt niedostępny'}
            >
              {product.inStock ? 'Dodaj do koszyka' : 'Produkt niedostępny'}
            </button>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div className="product-description-section">
            <h2 className="product-description-title">Opis produktu</h2>
            <p className="product-description-text">
              {product.description}
            </p>
          </div>
        )}

        {/* Rating & Reviews Section */}
        <div className="product-reviews-section">
          {/* Tabs */}
          <div className="product-tabs">
            <button 
              className={`product-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
              aria-label="Pokaż szczegóły produktu"
              aria-pressed={activeTab === 'details'}
            >
              Szczegóły produktu
            </button>
            <button 
              className={`product-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
              aria-label="Pokaż oceny i opinie"
              aria-pressed={activeTab === 'reviews'}
            >
              Oceny i opinie
            </button>
            <button 
              className={`product-tab ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('faqs')}
              aria-label="Pokaż często zadawane pytania"
              aria-pressed={activeTab === 'faqs'}
            >
              FAQ
            </button>
          </div>

          {/* Reviews Content */}
          {activeTab === 'reviews' && (
            <div className="reviews-content">
              {/* Header */}
              <div className="reviews-header">
                <div className="reviews-title-section">
                  <h2 className="reviews-title">Oceny naszych klientów</h2>
                  <span className="reviews-count">({allReviews.length})</span>
                </div>
                <div className="reviews-actions">
                  <button className="reviews-filter-button" aria-label="Filtr">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                  <div className="reviews-sort-dropdown">
                    <label htmlFor="reviews-sort" className="sr-only">Sortuj recenzje</label>
                    <select 
                      id="reviews-sort"
                      value={sortOrder} 
                      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                      className="sort-select"
                      aria-label="Sortuj recenzje"
                    >
                      <option value="latest">Najnowsze</option>
                      <option value="oldest">Najstarsze</option>
                      <option value="highest">Najwyższa ocena</option>
                      <option value="lowest">Najniższa ocena</option>
                    </select>
                  </div>
                  <button 
                    className="write-review-button"
                    onClick={() => setShowReviewModal(true)}
                    aria-label="Napisz opinię o produkcie"
                  >
                    Napisz opinię
                  </button>
                </div>
              </div>

              {/* Reviews Grid */}
              {displayedReviews.length > 0 ? (
                <div className="reviews-grid">
                  {displayedReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-card-header">
                      <div className="review-rating">
                        {renderStars(review.rating, 18)}
                      </div>
                      <button className="review-more-button" aria-label="Więcej opcji">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="review-reviewer">
                      <span className="reviewer-name">{review.reviewerName}</span>
                      {review.verified && (
                        <span className="verified-badge" title="Zweryfikowany zakup">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="review-text">{review.text}</p>
                    <div className="review-date">Opublikowano {review.date}</div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews-message">
                  <p>Brak recenzji dla tego produktu. Bądź pierwszy i napisz recenzję!</p>
                </div>
              )}

              {/* Load More Button */}
              {visibleReviews < sortedReviews.length && (
                <div className="load-more-reviews-container">
                  <button 
                    className="load-more-reviews-button"
                    onClick={() => setVisibleReviews(prev => prev + 4)}
                    aria-label="Wczytaj więcej opinii"
                  >
                    Wczytaj więcej opinii
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Product Details Tab */}
          {activeTab === 'details' && (
            <div className="product-details-tab">
              <div className="product-details-content">
                <h3>Szczegóły produktu</h3>
                <p>{product.description || 'Brak dodatkowych szczegółów produktu.'}</p>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === 'faqs' && (
            <div className="product-faqs-tab">
              <div className="product-faqs-content">
                <h3>Często zadawane pytania</h3>
                <p>Brak dostępnych pytań i odpowiedzi dla tego produktu.</p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-products-title">Może Cię również zainteresować</h2>
            <div className="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <Link 
                  key={relatedProduct.id} 
                  href={`/product/${relatedProduct.id}`}
                  className="related-product-card-link"
                >
                  <div className="related-product-card">
                    <div className="related-product-image-wrapper">
                      {relatedProduct.discount && (
                        <div className="product-discount-badge">{relatedProduct.discount}%</div>
                      )}
                      {relatedProduct.image ? (
                        <Image
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          width={300}
                          height={300}
                          className="related-product-image"
                        />
                      ) : relatedProduct.images && relatedProduct.images[0] ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          width={300}
                          height={300}
                          className="related-product-image"
                        />
                      ) : (
                        <div className="related-product-placeholder">
                          <span>{relatedProduct.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="related-product-info">
                      <h3 className="related-product-name">{relatedProduct.name}</h3>
                      <div className="related-product-rating">
                        {renderStars(relatedProduct.rating, 16)}
                      </div>
                      <div className="related-product-price">
                        {relatedProduct.originalPrice && (
                          <span className="related-product-original-price">
                            {relatedProduct.originalPrice} zł
                          </span>
                        )}
                        <span className="related-product-current-price">
                          {relatedProduct.price} zł
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2 className="review-modal-title">Napisz opinię</h2>
              <button 
                className="review-modal-close"
                onClick={() => setShowReviewModal(false)}
                aria-label="Zamknij"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form 
              className="review-modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                // Tutaj można dodać logikę zapisywania opinii
                console.log('Review submitted:', { ...reviewForm, productId: product.id });
                setShowReviewModal(false);
                setReviewForm({ rating: 0, reviewerName: '', text: '' });
              }}
            >
              <div className="review-modal-field">
                <label className="review-modal-label">Ocena *</label>
                <div className="review-modal-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`review-modal-star ${reviewForm.rating >= star ? 'active' : ''}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      aria-label={`Oceń ${star} gwiazdką`}
                    >
                      <svg viewBox="0 0 24 24" width="32" height="32">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="review-modal-field">
                <label htmlFor="reviewer-name" className="review-modal-label">Imię *</label>
                <input
                  id="reviewer-name"
                  type="text"
                  className="review-modal-input"
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                  placeholder="Twoje imię"
                  required
                />
              </div>

              <div className="review-modal-field">
                <label htmlFor="review-text" className="review-modal-label">Opinia *</label>
                <textarea
                  id="review-text"
                  className="review-modal-textarea"
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
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
                    setReviewForm({ rating: 0, reviewerName: '', text: '' });
                  }}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="review-modal-button review-modal-button-submit"
                  disabled={reviewForm.rating === 0 || !reviewForm.reviewerName || !reviewForm.text}
                >
                  Opublikuj opinię
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

