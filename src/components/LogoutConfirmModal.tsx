import { LogOut } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { Button } from "./ui/Button";

type LogoutConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LogoutConfirmModal({ open, onCancel, onConfirm }: LogoutConfirmModalProps) {
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
    <div className="logout-modal-overlay" role="presentation" onClick={onCancel}>
      <div
        className="logout-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="logout-modal-icon" aria-hidden="true">
          <LogOut size={24} />
        </div>
        <h2 id="logout-modal-title">{t("account.logout")}</h2>
        <p>{t("account.logoutConfirm")}</p>
        <div className="logout-modal-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="danger" icon={<LogOut size={18} />} onClick={onConfirm}>
            {t("account.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
