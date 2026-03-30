import StorefrontShell from "@/components/layout/StorefrontShell";
import ProductPage from "./ProductPage";

export default function ProduktShopPage({ productSlug }: { productSlug: string }) {
    return (
        <StorefrontShell>
            <ProductPage productSlug={productSlug} />
        </StorefrontShell>
    );
}
