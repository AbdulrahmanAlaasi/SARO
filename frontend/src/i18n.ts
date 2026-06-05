import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "SARO",
      tagline: "Smart Delivery Management Platform",
      login: "Log in",
      register: "Sign up",
      switchLang: "العربية",
    },
  },
  ar: {
    translation: {
      appName: "سارو",
      tagline: "منصة إدارة التوصيل الذكية",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      switchLang: "English",
    },
  },
};

const saved = localStorage.getItem("saro_lang") || "ar";

i18n.use(initReactI18next).init({
  resources,
  lng: saved,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

function applyDir(lng: string) {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
}
applyDir(saved);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("saro_lang", lng);
  applyDir(lng);
});

export default i18n;
