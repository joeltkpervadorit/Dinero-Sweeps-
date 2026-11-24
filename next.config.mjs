/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LAMP_BONUS_CODE:
      process.env.NEXT_PUBLIC_LAMP_BONUS_CODE || process.env.VITE_LAMP_BONUS_CODE || '',
  },
};

export default nextConfig;
