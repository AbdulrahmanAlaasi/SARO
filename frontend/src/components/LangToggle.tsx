import { useTranslation } from "react-i18next";

export default function LangToggle({ className = "" }: { className?: string }) {
  const { t, i18n } = useTranslation();
  return (
    <button
      className={`text-sm underline ${className}`}
      onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
    >
      {t("switchLang")}
    </button>
  );
}
