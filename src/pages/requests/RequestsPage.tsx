import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterTabs } from "../../components/FilterTabs";
import { RequestCard } from "../../components/requests/RequestCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { SearchBar } from "../../components/ui/SearchBar";
import { useTranslation } from "../../hooks/useTranslation";
import { requestService } from "../../services/requestService";
import type { RequestStatus, SupportRequest } from "../../types";
import { requestFilters } from "./requestHelpers";

export function RequestsPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    requestService
      .getRequests()
      .then(result => {
        if (mounted) setRequests(result);
      })
      .catch(() => {
        if (mounted) setError(t("common.empty"));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [language, t]);

  const filteredRequests = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return requests.filter(request => {
      const statusMatch = filter === "all" || request.status === filter;
      const textMatch =
        !keyword ||
        [request.id, request.title, request.projectName].some(value => String(value || "").toLowerCase().includes(keyword));
      return statusMatch && textMatch;
    });
  }, [filter, query, requests]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("request.title")}</h1>
        </div>
      </div>

      <Button icon={<Plus size={18} />} onClick={() => navigate("/requests/new")}>
        {t("request.new")}
      </Button>

      <SearchBar value={query} placeholder={t("request.search")} onChange={setQuery} />
      <FilterTabs
        active={filter}
        items={requestFilters.map(item => ({ id: item.id, label: t(item.key) }))}
        onChange={setFilter}
      />

      <h2 className="section-title">{t("request.history")}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && filteredRequests.length ? filteredRequests.map(request => <RequestCard key={request.id} request={request} />) : null}
        {!isLoading && !error && !filteredRequests.length ? <EmptyState /> : null}
      </div>
    </section>
  );
}
