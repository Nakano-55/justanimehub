import { UserConfig } from "next-i18next";

const i18nextConfig: UserConfig = {
  i18n: {
    locales: ["en", "id"], // Bahasa yang tersedia
    defaultLocale: "en", // Bahasa default
  },
};

export default i18nextConfig;
