import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function PendingApprovalPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const approvePendingUser = useAppStore(state => state.approvePendingUser);

  function approve() {
    approvePendingUser();
    navigate("/login");
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card center-card">
        <div className="pending-visual">✓</div>
        <h1>{t("auth.pendingTitle")}</h1>
        <p>{t("auth.pendingText")}</p>
        <Button onClick={approve}>{t("auth.mockApprove")}</Button>
      </Card>
    </section>
  );
}
