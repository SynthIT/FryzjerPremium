import StorefrontShell from "@/components/layout/StorefrontShell";
import KontoPageView from "@/components/konto/KontoPageView";

export const metadata = {
    title: "Konto - Fryzjerpremium.pl",
    description: "Zarządzaj swoim kontem",
};

export default function AccountPage() {
    return (
        <StorefrontShell>
            <KontoPageView />
        </StorefrontShell>
    );
}
