import type { ReactNode } from "react";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import type { TranslationKey } from "../i18n";
import { Button } from "./ui/Button";

type ActionConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  icon?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ActionConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = "danger",
  icon,
  onCancel,
  onConfirm
}: ActionConfirmModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div className="action-modal-overlay" role="presentation" onClick={onCancel}>
      <div className="action-modal-card" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onClick={event => event.stopPropagation()}>
        <div className={`action-modal-icon ${confirmVariant === "primary" ? "primary" : "danger"}`} aria-hidden="true">
          {icon || <AlertTriangle size={24} />}
        </div>
        <h2 id="action-modal-title">{title}</h2>
        <p>{message}</p>
        <div className="action-modal-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("common.cancel" as TranslationKey)}
          </Button>
          <Button type="button" variant={confirmVariant === "primary" ? "primary" : "danger"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
