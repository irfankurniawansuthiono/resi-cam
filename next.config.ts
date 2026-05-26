import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: "standalone",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
                //change to specific domain in uploadthing
            },
        ],
    },
};

export default nextConfig;
