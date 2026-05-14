import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Timeline } from "../../components/Timeline";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import type { RequestStatus } from "../../types";
import { categoryOptions, timelineIndex } from "./requestHelpers";

export function RequestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const request = useAppStore(state => state.requests.find(item => item.id === id));
  const updateRequestStatus = useAppStore(state => state.updateRequestStatus);

  const timelineSteps = useMemo(
    () => [
      t("request.timelineSubmitted"),
      t("request.timelineReceived"),
      t("request.timelineProcessing"),
      t("request.timelineWaiting"),
      t("request.timelineScheduled"),
      t("request.timelineCompleted")
    ],
    [t]
  );

  if (!request) return <Navigate to="/requests" replace />;

  const categoryLabel = categoryOptions.find(option => option.value === request.category)?.key ?? "request.categoryElectrical";

  const actions: Array<{ status: RequestStatus; key: "request.markReceived" | "request.markProcessing" | "request.markWaiting" | "request.markCompleted" }> = [
    { status: "received", key: "request.markReceived" },
    { status: "processing", key: "request.markProcessing" },
    { status: "waiting_customer", key: "request.markWaiting" },
    { status: "completed", key: "request.markCompleted" }
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("request.detail")}</h1>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <Card>
        <h2 className="section-title">{t("request.info")}</h2>
        <div className="info-grid">
          <InfoRow label={t("request.id")} value={request.id} />
          <InfoRow label={t("request.subject")} value={request.title} />
          <InfoRow label={t("request.project")} value={request.projectName} />
          <InfoRow label={t("request.createdAt")} value={request.createdAt} />
          <InfoRow label={t("request.createdBy")} value={request.createdBy} />
          <InfoRow label={t("request.category")} value={t(categoryLabel)} />
          <InfoRow label={t("request.address")} value={request.address} />
          <InfoRow label={t("request.datetime")} value={request.datetime || "-"} />
          <InfoRow label={t("request.description")} value={request.description} />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.images")}</h2>
        <div className="image-grid">
          {request.images.length
            ? request.images.map(image => (
                <div className="image-tile" key={image}>
                  {image}
                </div>
              ))
            : <div className="muted-line">{t("common.empty")}</div>}
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{t("request.timeline")}</h2>
        <Timeline steps={timelineSteps} activeIndex={timelineIndex(request.status)} />
      </Card>

      <Card>
        <div className="action-grid">
          {actions.map(action => (
            <Button key={action.status} variant="outline" onClick={() => updateRequestStatus(request.id, action.status)}>
              {t(action.key)}
            </Button>
          ))}
        </div>
      </Card>

      <Button icon={<MessageCircle size={18} />}>{t("request.support")}</Button>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
