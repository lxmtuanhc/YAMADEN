import { ChevronRight, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import type { SupportRequest } from "../../types";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";

export function RequestCard({ request }: { request: SupportRequest }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="request-card" onClick={() => navigate(`/requests/${request.id}`)}>
      <div className="list-icon">
        <FileText size={22} />
      </div>
      <div className="list-body">
        <div className="list-row">
          <span className="list-id">{request.id}</span>
          <StatusBadge status={request.status} />
        </div>
        <h3>{request.title}</h3>
        <p>
          <MapPin size={13} />
          <span>{request.projectName}</span>
        </p>
        <p>
          <span>{t("request.createdAt")}</span>
          <span>{request.createdAt}</span>
        </p>
      </div>
      <ChevronRight className="list-arrow" size={18} />
    </Card>
  );
}
