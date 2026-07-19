import StorefrontShell from "@/components/layout/StorefrontShell";
import HomePage from "@/components/home/HomePage";

export default async function Home() {
    return (
        <StorefrontShell>
            <HomePage />
        </StorefrontShell>
    );
}
