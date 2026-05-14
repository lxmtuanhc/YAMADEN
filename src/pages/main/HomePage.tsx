import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestCard } from "../../components/requests/RequestCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const requests = useAppStore(state => state.requests);
  const quotes = useAppStore(state => state.quotes);
  const schedules = useAppStore(state => state.schedules);

  return (
    <section className="page">
      <Card className="home-hero">
        <div className="home-user">
          <div className="avatar">{user?.name?.slice(0, 1) || "Y"}</div>
          <div>
            <h1>{t("home.greeting")}, {user?.name}</h1>
            <p>{t("home.subtitle")}</p>
          </div>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => navigate("/requests/new")}>
          {t("home.newRequest")}
        </Button>
        <div className="stats-grid">
          <div><strong>{requests.filter(item => item.status === "processing").length}</strong><span>{t("home.statsProcessing")}</span></div>
          <div><strong>{quotes.length}</strong><span>{t("home.statsQuotes")}</span></div>
          <div><strong>{schedules.length}</strong><span>{t("home.statsSchedule")}</span></div>
        </div>
      </Card>
      <h2 className="section-title">{t("home.currentRequest")}</h2>
      {requests[0] ? <RequestCard request={requests[0]} /> : null}
    </section>
  );
}
