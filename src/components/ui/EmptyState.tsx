import { FileText } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

export function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      <FileText size={28} />
      <p>{message || t("common.empty")}</p>
    </div>
  );
}
