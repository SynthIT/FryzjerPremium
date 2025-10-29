import Image from "next/image";
import { getProductById } from "@/data/products";
import AddToCartButton from "@/components/ProductAddToCart";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-2xl font-semibold">Produkt nie znaleziony</h1>
        <p className="text-zinc-600">Sprawdź, czy adres jest poprawny.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <Image src={product.image} alt={product.title} fill className="object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-600">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold text-black">{product.title}</h1>
          <div className="mt-4 text-2xl font-bold">{product.price}</div>
          <p className="mt-6 max-w-prose text-zinc-700">{product.description}</p>
          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}


