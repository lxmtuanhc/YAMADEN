import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterTabs } from "../../components/FilterTabs";
import { RequestCard } from "../../components/requests/RequestCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SearchBar } from "../../components/ui/SearchBar";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import type { RequestStatus } from "../../types";
import { requestFilters } from "./requestHelpers";

export function RequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const requests = useAppStore(state => state.requests);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const filteredRequests = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return requests.filter(request => {
      const statusMatch = filter === "all" || request.status === filter;
      const textMatch =
        !keyword ||
        [request.id, request.title, request.projectName].some(value => value.toLowerCase().includes(keyword));
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
        {filteredRequests.length ? filteredRequests.map(request => <RequestCard key={request.id} request={request} />) : <EmptyState />}
      </div>
    </section>
  );
}
