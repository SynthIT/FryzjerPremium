// Wspólne dane produktów używane w całej aplikacji

import { readFromfile } from "@/lib/db/products";
import { Products } from "@/lib/models/Products";

// export interface Product {
//     id: number;
//     name: string;
//     image?: string;
//     rating: number;
//     price: string;
//     originalPrice: string | null;
//     discount: number | null;
//     category: string;
//     // Dodatkowe pola dla strony produktu
//     fullName?: string;
//     subcategory?: string;
//     description?: string;
//     images?: string[];
//     colors?: Array<{ name: string; value: string; hex: string }>;
//     sizes?: string[];
//     inStock?: boolean;
// }

// export const allProducts: Product[] = [
//   {
//     id: 1,
//     name: 'Szampon do włosów',
//     fullName: 'Szampon do włosów profesjonalny - Odżywczy i regenerujący',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.5,
//     price: '89,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Kosmetyki',
//     subcategory: 'Odżywki',
//     description: 'Profesjonalny szampon do włosów, który zapewnia intensywne nawilżenie i regenerację. Idealny dla włosów zniszczonych i wymagających szczególnej pielęgnacji. Zawiera naturalne składniki aktywne, które wzmacniają strukturę włosów i nadają im zdrowy blask.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Naturalny', value: '#f5f5dc', hex: '#f5f5dc' },
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//       { name: 'Przezroczysty', value: '#e8f4f8', hex: '#e8f4f8' },
//     ],
//     sizes: ['250ml', '500ml', '1000ml'],
//     inStock: true,
//   },
//   {
//     id: 2,
//     name: 'Odżywka regenerująca',
//     fullName: 'Odżywka regenerująca do włosów - Intensywna regeneracja',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.8,
//     price: '95,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Kosmetyki',
//     subcategory: 'Odżywki',
//     description: 'Zaawansowana formuła odżywki do włosów, która zapewnia głęboką regenerację i odbudowę struktury włosów. Zawiera proteiny, witaminy i naturalne oleje, które przywracają elastyczność i blask zniszczonym włosom.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Naturalny', value: '#f5f5dc', hex: '#f5f5dc' },
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//     ],
//     sizes: ['250ml', '500ml'],
//     inStock: true,
//   },
//   {
//     id: 3,
//     name: 'Myjnia fryzjerska LUNA',
//     fullName: 'Myjnia fryzjerska LUNA - Profesjonalna stacja do mycia',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.5,
//     price: '6813,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Sprzęty',
//     subcategory: 'Myjnie',
//     description: 'Profesjonalna myjnia fryzjerska LUNA to nowoczesne rozwiązanie dla salonów fryzjerskich. Wyposażona w zaawansowane funkcje, zapewnia komfortową pracę i najwyższą jakość obsługi klientów. Idealna do codziennego użytku w profesjonalnym salonie.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//       { name: 'Czarny', value: '#000000', hex: '#000000' },
//       { name: 'Srebrny', value: '#c0c0c0', hex: '#c0c0c0' },
//     ],
//     sizes: ['Standard', 'Premium'],
//     inStock: true,
//   },
//   {
//     id: 4,
//     name: 'Fotel fryzjerski premium',
//     fullName: 'Fotel fryzjerski premium - Nowoczesny design',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 5.0,
//     price: '2400,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Meble',
//     subcategory: 'Fotele',
//     description: 'Elegancki fotel fryzjerski premium, który łączy nowoczesny design z funkcjonalnością. Wykonany z wysokiej jakości materiałów, zapewnia komfort zarówno dla klienta, jak i fryzjera. Idealny do profesjonalnych salonów fryzjerskich.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Czarny', value: '#000000', hex: '#000000' },
//       { name: 'Brązowy', value: '#8b4513', hex: '#8b4513' },
//       { name: 'Szary', value: '#808080', hex: '#808080' },
//     ],
//     sizes: ['Standard'],
//     inStock: true,
//   },
//   {
//     id: 5,
//     name: 'Kurs koloryzacji',
//     fullName: 'Kurs koloryzacji - Profesjonalne szkolenie',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.9,
//     price: '1800,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Szkolenia',
//     subcategory: 'Koloryzacja',
//     description: 'Kompleksowy kurs koloryzacji włosów dla profesjonalistów. Naucz się zaawansowanych technik koloryzacji, mieszania kolorów i pracy z różnymi rodzajami włosów. Kurs obejmuje zarówno teorię, jak i praktyczne ćwiczenia.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [],
//     sizes: ['Online', 'Stacjonarne'],
//     inStock: true,
//   },
//   {
//     id: 6,
//     name: 'Lakier do włosów',
//     fullName: 'Lakier do włosów - Profesjonalna stylizacja',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.2,
//     price: '65,00',
//     originalPrice: '80,00',
//     discount: 19,
//     category: 'Kosmetyki',
//     subcategory: 'Lakiery',
//     description: 'Profesjonalny lakier do włosów zapewniający długotrwałe utrzymanie fryzury. Formuła z naturalnymi składnikami chroni włosy i nadaje im połysk. Idealny do codziennego użytku zarówno w salonie, jak i w domu.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Przezroczysty', value: '#e8f4f8', hex: '#e8f4f8' },
//     ],
//     sizes: ['250ml', '500ml'],
//     inStock: true,
//   },
//   {
//     id: 7,
//     name: 'Suszarka profesjonalna',
//     fullName: 'Suszarka profesjonalna - Zaawansowana technologia',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.7,
//     price: '450,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Sprzęty',
//     subcategory: 'Suszarki',
//     description: 'Profesjonalna suszarka do włosów z zaawansowaną technologią. Zapewnia szybkie i delikatne suszenie, chroniąc włosy przed przegrzaniem. Idealna do profesjonalnego użytku w salonie fryzjerskim.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Czarny', value: '#000000', hex: '#000000' },
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//       { name: 'Różowy', value: '#ff69b4', hex: '#ff69b4' },
//     ],
//     sizes: ['Standard'],
//     inStock: true,
//   },
//   {
//     id: 8,
//     name: 'Stanowisko do mycia',
//     fullName: 'Stanowisko do mycia - Profesjonalne rozwiązanie',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.6,
//     price: '3200,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Meble',
//     subcategory: 'Stanowiska do mycia',
//     description: 'Profesjonalne stanowisko do mycia włosów zaprojektowane z myślą o komforcie klienta i wygodzie fryzjera. Wyposażone w zaawansowane funkcje, zapewnia komfortową pracę w salonie fryzjerskim.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//       { name: 'Czarny', value: '#000000', hex: '#000000' },
//     ],
//     sizes: ['Standard'],
//     inStock: true,
//   },
//   {
//     id: 9,
//     name: 'Kurs strzyżenia męskiego',
//     fullName: 'Kurs strzyżenia męskiego - Profesjonalne techniki',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 5.0,
//     price: '1200,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Szkolenia',
//     subcategory: 'Strzyżenie',
//     description: 'Kompleksowy kurs strzyżenia męskiego dla profesjonalistów. Poznaj najnowsze techniki i trendy w strzyżeniu męskim. Kurs obejmuje zarówno klasyczne, jak i nowoczesne metody strzyżenia.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [],
//     sizes: ['Online', 'Stacjonarne'],
//     inStock: true,
//   },
//   {
//     id: 10,
//     name: 'Maska do włosów',
//     fullName: 'Maska do włosów - Intensywna regeneracja',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.3,
//     price: '75,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Kosmetyki',
//     subcategory: 'Maseczki',
//     description: 'Intensywna maska do włosów z naturalnymi składnikami aktywnymi. Zapewnia głęboką regenerację i odbudowę zniszczonych włosów. Idealna do cotygodniowej pielęgnacji.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Naturalny', value: '#f5f5dc', hex: '#f5f5dc' },
//     ],
//     sizes: ['250ml', '500ml'],
//     inStock: true,
//   },
//   {
//     id: 11,
//     name: 'Nożyczki profesjonalne',
//     fullName: 'Nożyczki profesjonalne - Precyzyjne narzędzie',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.8,
//     price: '280,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Sprzęty',
//     subcategory: 'Nożyczki',
//     description: 'Profesjonalne nożyczki fryzjerskie wykonane z najwyższej jakości stali. Zapewniają precyzyjne cięcie i długotrwałą trwałość. Idealne dla profesjonalnych fryzjerów.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Srebrny', value: '#c0c0c0', hex: '#c0c0c0' },
//       { name: 'Złoty', value: '#ffd700', hex: '#ffd700' },
//     ],
//     sizes: ['Standard'],
//     inStock: true,
//   },
//   {
//     id: 12,
//     name: 'Lustro fryzjerskie',
//     fullName: 'Lustro fryzjerskie - Profesjonalne wyposażenie',
//     image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&h=500&fit=crop',
//     rating: 4.4,
//     price: '450,00',
//     originalPrice: null,
//     discount: null,
//     category: 'Meble',
//     subcategory: 'Lustra',
//     description: 'Profesjonalne lustro fryzjerskie zaprojektowane z myślą o wygodzie klienta i fryzjera. Zapewnia doskonałą widoczność i estetyczny wygląd salonu.',
//     images: [
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=80',
//       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=800&fit=crop&auto=format&q=90',
//     ],
//     colors: [
//       { name: 'Czarny', value: '#000000', hex: '#000000' },
//       { name: 'Biały', value: '#ffffff', hex: '#ffffff' },
//     ],
//     sizes: ['Standard'],
//     inStock: true,
//   },
// ];

// Funkcja pomocnicza do pobierania produktu po ID

export function allProducts(): Products[] {
    return readFromfile();
}

export function getProductBySlug(slug: string): Products | null {
    const allProducts = readFromfile();
    return allProducts.find((p) => p.slug === slug) || null;
}
