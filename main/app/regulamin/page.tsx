import StorefrontShell from "@/components/layout/StorefrontShell";
import RegulaminPageView from "@/components/regulamin/RegulaminPageView";

export const metadata = {
    title: "Regulamin - Fryzjerpremium.pl",
    description: "Regulamin sklepu Fryzjerpremium.pl",
};

export default function TermsPage() {
    return (
        <StorefrontShell>
            <RegulaminPageView />
        </StorefrontShell>
    );
}
