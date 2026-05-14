import { ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";

export function WelcomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <div className="logo-large">
          <img src="/assets/icon-192.png" alt="" />
        </div>
        <h1>{t("auth.welcomeTitle")}</h1>
        <p>{t("auth.welcomeText")}</p>
        <div className="auth-actions">
          <Button icon={<LogIn size={18} />} onClick={() => navigate("/login")}>
            {t("auth.login")}
          </Button>
          <Button variant="outline" icon={<ArrowRight size={18} />} onClick={() => navigate("/register")}>
            {t("auth.register")}
          </Button>
        </div>
      </Card>
    </section>
  );
}
