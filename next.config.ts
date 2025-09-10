import type {NextConfig} from "next";

const nextConfig : NextConfig = {
    /* config options here */
    output: 'standalone',
    pageExtensions: ["mdx", "tsx", "ts"]
};
export default nextConfig;