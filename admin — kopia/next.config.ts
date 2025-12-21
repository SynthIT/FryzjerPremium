import type { NextConfig } from "next";

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: `default-src 'self' 'unsafe-inline';
            script-src 'self' 'unsafe-inline'; 
            style-src 'self' 'unsafe-inline';
            img-src 'self' data:;
            connect-src 'self';`
            .replace(/\s{2,}/g, " ")
            .trim(),
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
