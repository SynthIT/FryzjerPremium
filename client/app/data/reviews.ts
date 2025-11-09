export interface Review {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

// Przykładowe recenzje dla produktów
export const reviews: Review[] = [
  {
    id: 1,
    productId: 1,
    reviewerName: 'Samantha D.',
    rating: 5,
    text: 'I absolutely love this product! The quality is outstanding and it exceeded my expectations. As a professional, I appreciate the attention to detail. It\'s become my favorite go-to item.',
    date: 'August 14, 2023',
    verified: true,
  },
  {
    id: 2,
    productId: 1,
    reviewerName: 'Alex M.',
    rating: 5,
    text: 'Excellent quality and fast shipping. The product arrived exactly as described. I\'m very satisfied with my purchase and would definitely recommend it to others.',
    date: 'August 10, 2023',
    verified: true,
  },
  {
    id: 3,
    productId: 1,
    reviewerName: 'Maria K.',
    rating: 5,
    text: 'This is exactly what I was looking for! The design is perfect and the quality is top-notch. Great value for money. Will definitely buy again.',
    date: 'August 5, 2023',
    verified: true,
  },
  {
    id: 4,
    productId: 1,
    reviewerName: 'John P.',
    rating: 5,
    text: 'Amazing product! Very satisfied with the purchase. The quality is excellent and the service was great. Highly recommended!',
    date: 'July 28, 2023',
    verified: true,
  },
  {
    id: 5,
    productId: 1,
    reviewerName: 'Emma L.',
    rating: 5,
    text: 'Perfect product for my needs. The quality is outstanding and it works exactly as described. Very happy with my purchase!',
    date: 'July 20, 2023',
    verified: true,
  },
  {
    id: 6,
    productId: 1,
    reviewerName: 'Tom R.',
    rating: 5,
    text: 'Great product, great quality! I\'ve been using it for a while now and I\'m very satisfied. Would definitely recommend to anyone looking for quality.',
    date: 'July 15, 2023',
    verified: true,
  },
  // Recenzje dla produktu 2
  {
    id: 7,
    productId: 2,
    reviewerName: 'Anna W.',
    rating: 5,
    text: 'Świetny szampon! Moje włosy są teraz znacznie zdrowsze i bardziej lśniące. Polecam wszystkim!',
    date: 'August 20, 2023',
    verified: true,
  },
  {
    id: 8,
    productId: 2,
    reviewerName: 'Piotr K.',
    rating: 4,
    text: 'Dobry produkt, działa jak należy. Jedyne co mi przeszkadza to cena, ale jakość jest na wysokim poziomie.',
    date: 'August 15, 2023',
    verified: true,
  },
  {
    id: 9,
    productId: 2,
    reviewerName: 'Katarzyna M.',
    rating: 5,
    text: 'Absolutnie polecam! Efekty są widoczne już po pierwszym użyciu. Włosy są miękkie i nawilżone.',
    date: 'August 10, 2023',
    verified: true,
  },
  // Recenzje dla produktu 3
  {
    id: 10,
    productId: 3,
    reviewerName: 'Michał S.',
    rating: 5,
    text: 'Profesjonalna myjnia fryzjerska. Wszystko działa perfekcyjnie, bardzo zadowolony z zakupu!',
    date: 'August 18, 2023',
    verified: true,
  },
  {
    id: 11,
    productId: 3,
    reviewerName: 'Agnieszka L.',
    rating: 4,
    text: 'Dobra jakość wykonania. Montaż był prosty, a myjnia działa bez zarzutu. Polecam!',
    date: 'August 12, 2023',
    verified: true,
  },
  // Recenzje dla produktu 4
  {
    id: 12,
    productId: 4,
    reviewerName: 'Tomasz Z.',
    rating: 5,
    text: 'Mata narzędziowa doskonałej jakości. Wszystko ma swoje miejsce, porządek w salonie zapewniony!',
    date: 'August 22, 2023',
    verified: true,
  },
  {
    id: 13,
    productId: 4,
    reviewerName: 'Magdalena P.',
    rating: 5,
    text: 'Bardzo praktyczna mata. Idealnie pasuje do mojego stanowiska pracy. Wysoka jakość materiałów.',
    date: 'August 16, 2023',
    verified: true,
  },
  // Recenzje dla pozostałych produktów (dodajemy dla wszystkich)
  {
    id: 14,
    productId: 5,
    reviewerName: 'Janusz K.',
    rating: 4,
    text: 'Dobry produkt, spełnia swoje zadanie. Polecam dla profesjonalistów.',
    date: 'August 14, 2023',
    verified: true,
  },
  {
    id: 15,
    productId: 6,
    reviewerName: 'Ewa R.',
    rating: 5,
    text: 'Świetna odżywka, włosy są miękkie i błyszczące. Na pewno kupię jeszcze raz!',
    date: 'August 19, 2023',
    verified: true,
  },
  {
    id: 16,
    productId: 7,
    reviewerName: 'Robert D.',
    rating: 5,
    text: 'Profesjonalna suszarka. Szybkie suszenie, cicha praca. Wszystko działa idealnie!',
    date: 'August 17, 2023',
    verified: true,
  },
  {
    id: 17,
    productId: 8,
    reviewerName: 'Monika B.',
    rating: 4,
    text: 'Dobre nożyczki, ostre i precyzyjne. Idealne do profesjonalnej pracy.',
    date: 'August 13, 2023',
    verified: true,
  },
];

export const getReviewsByProductId = (productId: number): Review[] => {
  return reviews.filter(review => review.productId === productId);
};

