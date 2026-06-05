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
      auth: {
        loginTitle: "Welcome back",
        registerTitle: "Create your account",
        username: "Username",
        email: "Email",
        password: "Password",
        firstName: "First name",
        lastName: "Last name",
        phone: "Phone (optional)",
        role: "Account type",
        haveAccount: "Already have an account?",
        noAccount: "Don't have an account?",
        submitLogin: "Log in",
        submitRegister: "Sign up",
        registered: "Account created — please log in.",
        invalid: "Invalid username or password.",
        failed: "Something went wrong. Please try again.",
      },
      role: {
        customer: "Customer",
        driver: "Driver",
        admin: "Admin",
        branch_supervisor: "Branch supervisor",
      },
      nav: { logout: "Log out", dashboard: "Dashboard" },
      dash: {
        welcome: "Welcome",
        customer: "Customer dashboard",
        driver: "Driver dashboard",
        admin: "Admin dashboard",
        branch: "Branch dashboard",
        placeholder: "This area will be built in the next phases.",
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
      auth: {
        loginTitle: "مرحبًا بعودتك",
        registerTitle: "أنشئ حسابك",
        username: "اسم المستخدم",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        phone: "الهاتف (اختياري)",
        role: "نوع الحساب",
        haveAccount: "لديك حساب بالفعل؟",
        noAccount: "ليس لديك حساب؟",
        submitLogin: "تسجيل الدخول",
        submitRegister: "إنشاء حساب",
        registered: "تم إنشاء الحساب — يرجى تسجيل الدخول.",
        invalid: "اسم المستخدم أو كلمة المرور غير صحيحة.",
        failed: "حدث خطأ ما. حاول مرة أخرى.",
      },
      role: {
        customer: "عميل",
        driver: "سائق",
        admin: "مشرف النظام",
        branch_supervisor: "مشرف فرع",
      },
      nav: { logout: "تسجيل الخروج", dashboard: "لوحة التحكم" },
      dash: {
        welcome: "مرحبًا",
        customer: "لوحة العميل",
        driver: "لوحة السائق",
        admin: "لوحة المشرف",
        branch: "لوحة الفرع",
        placeholder: "سيتم بناء هذا القسم في المراحل القادمة.",
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
