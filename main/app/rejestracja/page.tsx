"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterPage from "@/components/Register";

export default function RegistrationPage() {
    return (
        <>
            <Header />
            <div style={{ 
                minHeight: "calc(100vh - 200px)",
                padding: "60px 20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start"
            }}>
                <RegisterPage />
            </div>
            <Footer />
        </>
    );
}

