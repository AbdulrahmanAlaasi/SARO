import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "./ui";

/** Hook returning [ConfirmUI, confirm()] — confirm() opens the dialog and resolves on choice. */
export function useConfirm() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ open: boolean; text: string; resolve?: (v: boolean) => void }>({
    open: false, text: "",
  });

  const confirm = (text: string) =>
    new Promise<boolean>((resolve) => setState({ open: true, text, resolve }));

  const close = (v: boolean) => {
    state.resolve?.(v);
    setState({ open: false, text: "" });
  };

  const ui: ReactNode = state.open ? (
    <Modal title={t("ui.confirm")} onClose={() => close(false)}>
      <p className="mb-5 text-slate-600">{state.text}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-outline py-2 text-sm" onClick={() => close(false)}>{t("ui.cancel")}</button>
        <button className="btn-cta bg-status-failed py-2 text-sm hover:bg-red-700" onClick={() => close(true)}>
          {t("ui.delete")}
        </button>
      </div>
    </Modal>
  ) : null;

  return { ui, confirm };
}
