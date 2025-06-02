import type { NextConfig } from "next";

const nextConfig : NextConfig = {
    /* config options here */
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                //destination: 'http://127.0.0.1:8080/api/:path*'
                destination: 'https://rest.ardoco.de/api/:path*'
            }
        ];
    }
};
export default nextConfig;