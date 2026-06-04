import { CalendarPlus, Edit3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { FilterTabs } from "../../components/FilterTabs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { SCHEDULE_FILTERS, SCHEDULE_STATUS_LABEL_KEYS, SCHEDULE_STATUSES } from "../../constants/scheduleStatus";
import { useTranslation } from "../../hooks/useTranslation";
import { requestService } from "../../services/requestService";
import { scheduleService } from "../../services/scheduleService";
import type { Schedule, ScheduleStatus, SupportRequest } from "../../types";

type ScheduleFilter = ScheduleStatus | "all";

type ScheduleForm = {
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status: ScheduleStatus;
};

const emptyForm: ScheduleForm = {
  requestId: "",
  date: "",
  time: "",
  technician: "",
  projectName: "",
  status: "pending"
};

export function SchedulePage() {
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestIdParam = searchParams.get("requestId") || "";
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const [form, setForm] = useState<ScheduleForm>({ ...emptyForm, requestId: requestIdParam });
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    Promise.all([scheduleService.getSchedules(), requestService.getRequests()])
      .then(([scheduleResult, requestResult]) => {
        if (!mounted) return;
        setSchedules(scheduleResult);
        setRequests(requestResult);
        const selectedRequest = requestResult.find(request => request.id === requestIdParam);
        if (selectedRequest) {
          setForm(current => ({
            ...current,
            requestId: selectedRequest.id,
            projectName: selectedRequest.projectName || selectedRequest.title
          }));
        }
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
  }, [language, requestIdParam, t]);

  const filteredSchedules = useMemo(
    () => schedules.filter(schedule => filter === "all" || schedule.status === filter),
    [filter, schedules]
  );

  function updateForm(field: keyof ScheduleForm, value: string) {
    if (field === "requestId") {
      const selectedRequest = requests.find(request => request.id === value);
      setForm(current => ({
        ...current,
        requestId: value,
        projectName: selectedRequest?.projectName || selectedRequest?.title || current.projectName
      }));
      return;
    }

    setForm(current => ({ ...current, [field]: value }));
  }

  async function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.requestId || !form.date || !form.time || !form.technician || !form.projectName) {
      setError(t("common.required"));
      return;
    }

    setActionLoading("save");
    setError("");
    try {
      const saved = editingId
        ? await scheduleService.updateSchedule(editingId, form)
        : await scheduleService.createSchedule(form);
      const refreshed = editingId
        ? schedules.map(schedule => (schedule.id === saved.id ? saved : schedule))
        : [saved, ...schedules];
      setSchedules(refreshed);
      setEditingId("");
      setForm({ ...emptyForm, requestId: requestIdParam });
    } catch {
      setError(t("common.empty"));
    } finally {
      setActionLoading("");
    }
  }

  function startEdit(schedule: Schedule) {
    setEditingId(schedule.id);
    setForm({
      requestId: schedule.requestId,
      date: schedule.date,
      time: schedule.time,
      technician: schedule.technician,
      projectName: schedule.projectName,
      status: schedule.status
    });
  }

  async function updateScheduleStatus(schedule: Schedule, status: ScheduleStatus) {
    setActionLoading(`${schedule.id}-${status}`);
    setError("");
    try {
      const updated = await scheduleService.updateSchedule(schedule.id, { status });
      setSchedules(current => current.map(item => (item.id === updated.id ? updated : item)));
    } catch {
      setError(t("common.empty"));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>{t("schedule.title")}</h1>
      </div>

      <Card>
        <h2 className="section-title">{editingId ? t("schedule.editTitle") : t("schedule.createTitle")}</h2>
        <form className="form-stack" onSubmit={submitSchedule}>
          <label className="field">
            <span>{t("request.id")}</span>
            <select value={form.requestId} onChange={event => updateForm("requestId", event.target.value)}>
              <option value="">{t("schedule.selectRequest")}</option>
              {requests.map(request => (
                <option key={request.id} value={request.id}>
                  {request.id} - {request.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("request.project")}</span>
            <input value={form.projectName} onChange={event => updateForm("projectName", event.target.value)} />
          </label>
          <div className="two-actions">
            <label className="field">
              <span>{t("schedule.date")}</span>
              <input value={form.date} onChange={event => updateForm("date", event.target.value)} placeholder={t("schedule.datePlaceholder")} />
            </label>
            <label className="field">
              <span>{t("schedule.time")}</span>
              <input value={form.time} onChange={event => updateForm("time", event.target.value)} placeholder={t("schedule.timePlaceholder")} />
            </label>
          </div>
          <label className="field">
            <span>{t("schedule.technician")}</span>
            <input value={form.technician} onChange={event => updateForm("technician", event.target.value)} placeholder={t("schedule.technicianPlaceholder")} />
          </label>
          <label className="field">
            <span>{t("common.status")}</span>
            <select value={form.status} onChange={event => updateForm("status", event.target.value as ScheduleStatus)}>
              {SCHEDULE_STATUSES.map(status => (
                <option key={status} value={status}>
                  {t(SCHEDULE_STATUS_LABEL_KEYS[status])}
                </option>
              ))}
            </select>
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <div className="form-actions">
            <Button icon={<CalendarPlus size={18} />} disabled={!!actionLoading}>
              {actionLoading === "save" ? t("common.loading") : editingId ? t("common.save") : t("schedule.create")}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId("");
                  setForm({ ...emptyForm, requestId: requestIdParam });
                }}
              >
                {t("common.cancel")}
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <FilterTabs
        active={filter}
        items={SCHEDULE_FILTERS.map(item => ({ id: item.id, label: t(item.key) }))}
        onChange={setFilter}
      />

      <h2 className="section-title">{t("schedule.upcoming")}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error && error !== t("common.required") ? <ErrorState message={error} /> : null}
        {!isLoading && !filteredSchedules.length ? <EmptyState /> : null}
        {!isLoading
          ? filteredSchedules.map(schedule => (
              <Card key={schedule.id}>
                <div className="list-row">
                  <span className="list-id">{schedule.id}</span>
                  <ScheduleStatusBadge status={schedule.status} />
                </div>
                <div className="info-grid">
                  <InfoRow label={t("request.id")} value={schedule.requestId} />
                  <InfoRow label={t("request.project")} value={schedule.projectName} />
                  <InfoRow label={t("schedule.date")} value={schedule.date} />
                  <InfoRow label={t("schedule.time")} value={schedule.time} />
                  <InfoRow label={t("schedule.technician")} value={schedule.technician} />
                </div>
                <div className="action-grid">
                  <Button type="button" variant="outline" icon={<Edit3 size={16} />} onClick={() => startEdit(schedule)}>
                    {t("schedule.edit")}
                  </Button>
                  {(schedule.status === "pending" || schedule.status === "confirmed" || schedule.status === "rescheduled" || schedule.status === "upcoming") ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!!actionLoading}
                      onClick={() => updateScheduleStatus(schedule, "in_progress")}
                    >
                      {actionLoading === `${schedule.id}-in_progress` ? t("common.loading") : t("schedule.start")}
                    </Button>
                  ) : null}
                  {schedule.status !== "completed" && schedule.status !== "cancelled" ? (
                    <Button
                      type="button"
                      disabled={!!actionLoading}
                      onClick={() => updateScheduleStatus(schedule, "completed")}
                    >
                      {actionLoading === `${schedule.id}-completed` ? t("common.loading") : t("schedule.complete")}
                    </Button>
                  ) : null}
                  {schedule.status !== "cancelled" && schedule.status !== "completed" ? (
                    <Button
                      type="button"
                      variant="danger"
                      disabled={!!actionLoading}
                      onClick={() => updateScheduleStatus(schedule, "cancelled")}
                    >
                      {actionLoading === `${schedule.id}-cancelled` ? t("common.loading") : t("schedule.cancel")}
                    </Button>
                  ) : null}
                </div>
              </Card>
            ))
          : null}
      </div>
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

function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  const { t } = useTranslation();
  return <span className={`status-badge status-${status}`}>{t(SCHEDULE_STATUS_LABEL_KEYS[status])}</span>;
}
