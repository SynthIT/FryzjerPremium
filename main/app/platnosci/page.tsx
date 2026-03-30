import StorefrontShell from "@/components/layout/StorefrontShell";
import PlatnosciPageView from "@/components/platnosci/PlatnosciPageView";

export const metadata = {
    title: "Płatności - Fryzjerpremium.pl",
    description: "Informacje o metodach płatności",
};

export default function PaymentsPage() {
    return (
        <StorefrontShell>
            <PlatnosciPageView />
        </StorefrontShell>
    );
}
