import type { NextConfig } from "next";
import i18nextConfig from "./next-i18next.config";

const nextConfig: NextConfig = {
  i18n: i18nextConfig.i18n, // Tambahkan konfigurasi bahasa
  images: {
    domains: ["cdn.myanimelist.net"], // Pastikan ini tetap ada buat gambar
  },
};

export default nextConfig;
