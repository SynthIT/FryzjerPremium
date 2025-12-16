"use client";

import { Categories, Products } from "@/lib/models/Products";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductPage() {
    const [products, setProducts] = useState<Products[] | null>();
    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/admin/api/v1/products", {
                    method: "GET",
                });
                const data = await response.json();
                console.log("Pobrane produkty:", data);
                setProducts(data);
            } catch (error) {
                console.error("Błąd podczas pobierania produktów:", error);
            }
        }
        fetchProducts();
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Produkty
                    </h1>
                    <p className="text-sm text-muted-foreground sm:text-base">
                        Dodawaj, edytuj i organizuj produkty.
                    </p>
                </div>
                <Link
                    href="/admin/manage/products/new"
                    className="w-full rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent sm:w-auto">
                    Dodaj produkt
                </Link>
            </div>
            {products ? (
                products.map((val, index) => {
                    return (
                        <div key={index} className="rounded-lg border">
                            <div className="p-4 text-sm text-muted-foreground">
                                Nazwa produktu: {val.nazwa} <br></br>
                                slug: {val.slug} Cena: {val.cena} zł <br></br>
                                kategoria:{" "}
                                {/* jezeli cokolwiek jest Array'em [] czy cokolwiek takiego
                                to musisz se mape jebnąc na to bo inaczje nichuaj nie wyciągniesz
                                ewentualnie bierzesz konkretny index w arrayu
                                ale po co to nie wiem i nie wiem co mam ci na ten
                                temat wiecej napisac xd xd */}
                                {val.kategoria
                                    ?.map((cat) => (cat as Categories).nazwa)
                                    .join(", ")}{" "}
                                {/* nie kazde tez pole jest tak autentycznie przypisane
                                    np warianty czy tez pomocje, daltego
                                    musisz sobie wczesniej sprawdzic czy wogole cokolwiek 
                                    w tym jest czaisz temat */}
                                {val.wariant && (
                                    <>
                                        <br></br>Warianty:{" "}
                                        {val.wariant
                                            .map((w) => w.nazwa)
                                            .join(", ")}
                                    </>
                                )}
                                <br></br>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="rounded-lg border">
                    <div className="p-4 text-sm text-muted-foreground">
                        Błąd podczas generowania strony z produktami.
                    </div>
                </div>
            )}
        </div>
    );
}
