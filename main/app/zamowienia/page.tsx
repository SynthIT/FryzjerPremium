import StorefrontShell from "@/components/layout/StorefrontShell";
import ZamowieniaPage from "@/components/zamowienia/ZamowieniaPage";

export default function OrdersPage() {
    return (
        <StorefrontShell>
            <ZamowieniaPage />
        </StorefrontShell>
    );
}
