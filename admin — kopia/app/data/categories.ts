// Dane kategorii produktów
export interface Category {
  id: number;
  name: string;
  image: string;
}

export const categories: Category[] = [
  { id: 1, name: "Szkolenia", image: "/categories/training.jpg" },
  { id: 2, name: "Kosmetyki", image: "/categories/cosmetics.jpg" },
  { id: 3, name: "Sprzęty", image: "/categories/equipment.jpg" },
  { id: 4, name: "Meble", image: "/categories/furniture.jpg" },
];


