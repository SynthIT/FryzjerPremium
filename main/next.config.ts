import type { NextConfig } from "next";

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: `
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: https:;
            connect-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';`
            .replace(/\s{2,}/g, " ")
            .trim(),
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-XSS-Protection",
        value: "1; mode=block",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
];

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "0drz1wfqr4mpnehu.public.blob.vercel-storage.com",
                pathname: "/**",
            }
        ],
    },
    turbopack: {
        root: __dirname,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
