import StorefrontShell from "@/components/layout/StorefrontShell";
import HomePage from "@/components/home/HomePage";
import { getProducts } from "@/lib/utils";

export default async function Home() {
    return (
        <StorefrontShell>
            <HomePage />
        </StorefrontShell>
    );
}
