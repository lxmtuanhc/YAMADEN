import { Timeline } from "../../components/Timeline";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function SchedulePage() {
  const { t } = useTranslation();
  const schedules = useAppStore(state => state.schedules);
  const steps = [t("request.timelineReceived"), t("request.timelineProcessing"), t("status.scheduled"), t("status.completed")];

  return (
    <section className="page">
      <div className="page-header"><h1>{t("schedule.title")}</h1></div>
      <h2 className="section-title">{t("schedule.upcoming")}</h2>
      <div className="list-stack">
        {schedules.map(schedule => (
          <Card key={schedule.id}>
            <div className="list-row">
              <strong>{schedule.date}</strong>
              <StatusBadge status={schedule.status} />
            </div>
            <div className="info-row"><span>{t("request.datetime")}</span><strong>{schedule.time}</strong></div>
            <div className="info-row"><span>{t("schedule.technician")}</span><strong>{schedule.technician}</strong></div>
            <Timeline steps={steps} activeIndex={1} />
            <div className="two-actions">
              <Button variant="outline">{t("schedule.call")}</Button>
              <Button>{t("schedule.chat")}</Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
