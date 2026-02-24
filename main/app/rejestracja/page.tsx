"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterPage from "@/components/Register";

export default function RegistrationPage() {
    return (
        <>
            <Header />
            <div className="min-h-[calc(100vh-200px)] py-16 px-5 flex justify-center items-start pt-[140px]">
                <RegisterPage />
            </div>
            <Footer />
        </>
    );
}

