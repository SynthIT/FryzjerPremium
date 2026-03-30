import StorefrontShell from "@/components/layout/StorefrontShell";
import RegisterPage from "@/components/auth/RegisterPage";

export default function RejestracjaShopPage() {
    return (
        <StorefrontShell>
            <div className="min-h-screen pt-[120px] pb-16 px-4 sm:px-6 lg:px-8">
                <RegisterPage />
            </div>
        </StorefrontShell>
    );
}
