export type Product = {
  id: string;
  title: string;
  brand: string;
  price: string;
  image: string;
  description?: string;
};

export const products: Product[] = [
  {
    id: "p1",
    title: "ARASHI Energizing Shampoo 250 ml",
    brand: "QI",
    price: "85,00 zł",
    image: "https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=1600&auto=format&fit=crop",
    description: "Energetyzujący szampon do codziennej pielęgnacji włosów.",
  },
  {
    id: "p2",
    title: "AYALA Fotel barberski BORG",
    brand: "AYALA",
    price: "2 799,00 zł",
    image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600&auto=format&fit=crop",
    description: "Komfortowy fotel barberski o klasycznej linii.",
  },
  {
    id: "p3",
    title: "AYALA Fotel fryzjerski LOFT",
    brand: "AYALA",
    price: "1 934,00 zł",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
    description: "Minimalistyczny fotel fryzjerski w stylu loft.",
  },
  {
    id: "p4",
    title: "Maska regenerująca z keratyną 500 ml",
    brand: "COIFFEUR",
    price: "119,00 zł",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1600&auto=format&fit=crop",
    description: "Intensywna maska odbudowująca strukturę włosa.",
  },
];

export function getProductById(id: string) {
  const needle = decodeURIComponent(id).trim().toLowerCase();
  return products.find((p) => p.id.toLowerCase() === needle);
}


