import "@/app/globals.css";
import { ProductsResponse } from "@/lib/interfaces/ax";
import { Producents } from "@/lib/models/Products";
import Link from "next/link";

export default function Brands({ data }: { data: ProductsResponse }) {
    const brands = () => {
        const brandSet = new Set<string>();
        data.products?.forEach((product) => {
            if (product.producent) {
                brandSet.add(
                    JSON.stringify({
                        nazwa: (product.producent as Producents).nazwa,
                        strona:
                            (product.producent as Producents)
                                .strona_internetowa || "",
                    })
                );
            }
        });
        return Array.from(brandSet.values()).map((brand) => JSON.parse(brand));
    };

    return (
        <div className="brands-section">
            <div className="brands-container">
                {brands().map((brand, index) => (
                    <Link
                        href={brand.strona}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}>
                        <div key={index} className="brand-name">
                            {brand.nazwa}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
