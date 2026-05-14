import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LanguageSwitch } from "../../components/LanguageSwitch";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <section className="page">
      <div className="page-header"><h1>{t("nav.account")}</h1></div>
      <Card>
        <div className="home-user">
          <div className="avatar">{user?.name?.slice(0, 1) || "Y"}</div>
          <div>
            <h2>{user?.name}</h2>
            <p>{user?.phone}</p>
            <p>{user?.email}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="info-row"><span>{t("account.info")}</span><strong>{user?.name}</strong></div>
        <div className="info-row"><span>{t("account.siteAddress")}</span><strong>{user?.address}</strong></div>
        <div className="info-row"><span>{t("account.language")}</span><LanguageSwitch /></div>
        <div className="info-row"><span>{t("account.support")}</span><strong>{t("app.name")}</strong></div>
        <div className="info-row"><span>{t("account.terms")}</span><strong>{t("common.back")}</strong></div>
        <div className="info-row"><span>{t("account.privacy")}</span><strong>{t("common.back")}</strong></div>
      </Card>
      <Button variant="danger" icon={<LogOut size={18} />} onClick={handleLogout}>{t("account.logout")}</Button>
    </section>
  );
}
