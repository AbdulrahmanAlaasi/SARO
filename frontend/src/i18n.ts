import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "SARO",
      tagline: "Smart Delivery Management Platform",
      heroSub: "Track, manage, and deliver — your way.",
      trackPlaceholder: "Enter your order number",
      track: "Track",
      login: "Log in",
      register: "Sign up",
      switchLang: "العربية",
      methodsTitle: "Delivery methods",
      method: {
        home: "Home delivery",
        locker: "Smart locker",
        homeBox: "Home box",
        overWall: "Over-the-wall",
      },
      statusTitle: "Order status",
      status: {
        created: "Created",
        assigned: "Assigned",
        transit: "In transit",
        delivered: "Delivered",
        delayed: "Delayed",
      },
    },
  },
  ar: {
    translation: {
      appName: "سارو",
      tagline: "منصة إدارة التوصيل الذكية",
      heroSub: "تتبّع، أدِر، وأوصِل — بطريقتك.",
      trackPlaceholder: "أدخل رقم طلبك",
      track: "تتبّع",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      switchLang: "English",
      methodsTitle: "طرق التوصيل",
      method: {
        home: "توصيل للمنزل",
        locker: "خزنة ذكية",
        homeBox: "صندوق المنزل",
        overWall: "التوصيل فوق السور",
      },
      statusTitle: "حالة الطلب",
      status: {
        created: "تم الإنشاء",
        assigned: "تم التعيين",
        transit: "قيد التوصيل",
        delivered: "تم التسليم",
        delayed: "متأخر",
      },
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
