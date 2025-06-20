import type { NextConfig } from "next";

const nextConfig : NextConfig = {
    /* config options here */
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8081/api/:path*' // for dev only
                //destination: 'https://rest.ardoco.de/api/:path*' // for production
            }
        ];
    }
};
export default nextConfig;