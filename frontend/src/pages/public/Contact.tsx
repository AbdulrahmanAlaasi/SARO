import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-navy">{t("pub.contact")}</h1>
      <p className="mt-2 text-slate-600">{t("pub.contactIntro")}</p>
      <div className="card mt-8 space-y-3 p-6">
        <p className="text-sm"><span className="font-semibold">Email:</span> support@saro.sa</p>
        <p className="text-sm"><span className="font-semibold">Riyadh, Saudi Arabia</span></p>
        <a href="mailto:support@saro.sa" className="btn-primary inline-block">{t("pub.contact")}</a>
      </div>
    </section>
  );
}
