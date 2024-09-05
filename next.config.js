/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            "media.discordapp.net",
            "cdn.discordapp.com",
            "cdnb.artstation.com",
            "dummyimage.com",
            "res.cloudinary.com",
            `dash93.nyc3.digitaloceanspaces.com`
        ],
    },
};

module.exports = nextConfig;
