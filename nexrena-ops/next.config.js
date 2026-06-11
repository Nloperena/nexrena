/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CALENDLY_EMBED_STYLE:
      process.env.CALENDLY_EMBED_STYLE ||
      process.env.NEXT_PUBLIC_CALENDLY_EMBED_STYLE ||
      'inline',
  },
}
module.exports = nextConfig
