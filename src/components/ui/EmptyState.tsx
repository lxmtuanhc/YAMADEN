import { FileText } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

export function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <FileText size={28} />
      <p>{t("common.empty")}</p>
    </div>
  );
}
