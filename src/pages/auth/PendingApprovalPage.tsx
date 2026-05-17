import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutConfirmModal } from "../../components/LogoutConfirmModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function PendingApprovalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAppStore(state => state.logout);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  function confirmLogout() {
    logout();
    setIsLogoutConfirmOpen(false);
    navigate("/login");
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card center-card">
        <div className="pending-visual">✓</div>
        <h1>{t("auth.pendingTitle")}</h1>
        <p>{t("auth.pendingText")}</p>
        <div className="auth-actions">
          <Button type="button" variant="outline" onClick={() => { window.location.href = "tel:08062417758"; }}>
            {t("auth.contactSupport")}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsLogoutConfirmOpen(true)}>
            {t("account.logout")}
          </Button>
        </div>
      </Card>
      <LogoutConfirmModal open={isLogoutConfirmOpen} onCancel={() => setIsLogoutConfirmOpen(false)} onConfirm={confirmLogout} />
    </section>
  );
}
