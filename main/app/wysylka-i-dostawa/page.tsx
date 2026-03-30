import StorefrontShell from "@/components/layout/StorefrontShell";
import WysylkaPageView from "@/components/wysylka-i-dostawa/WysylkaPageView";

export const metadata = {
    title: "Wysyłka i dostawa - Fryzjerpremium.pl",
    description: "Informacje o wysyłce i dostawie produktów",
};

export default function ShippingPage() {
    return (
        <StorefrontShell>
            <WysylkaPageView />
        </StorefrontShell>
    );
}
