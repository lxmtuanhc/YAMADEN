import { Check, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FilterTabs } from "../../components/FilterTabs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { SCHEDULE_FILTERS, SCHEDULE_STATUS_LABEL_KEYS } from "../../constants/scheduleStatus";
import { useTranslation } from "../../hooks/useTranslation";
import { scheduleService } from "../../services/scheduleService";
import type { Schedule, ScheduleStatus } from "../../types";

type ScheduleFilter = ScheduleStatus | "all";

export function SchedulePage() {
  const { t, language } = useTranslation();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    scheduleService.getSchedules()
      .then(result => {
        if (mounted) setSchedules(result);
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

  const filteredSchedules = useMemo(
    () => schedules.filter(schedule => filter === "all" || schedule.status === filter),
    [filter, schedules]
  );

  async function confirmSlot(schedule: Schedule) {
    const slotId = selectedSlots[schedule.id];
    if (!slotId) return;
    setActionLoading(schedule.id);
    setError("");
    try {
      const updated = await scheduleService.selectSlot(schedule.id, slotId);
      setSchedules(current => current.map(item => (item.id === updated.id ? updated : item)));
    } catch {
      setError(t("common.empty"));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <section className="page schedule-choice-page">
      <div className="page-header">
        <div>
          <h1>{t("schedule.title")}</h1>
          <p>{t("schedule.chooseSubtitle")}</p>
        </div>
      </div>

      <FilterTabs
        active={filter}
        items={SCHEDULE_FILTERS.map(item => ({ id: item.id, label: t(item.key) }))}
        onChange={setFilter}
      />

      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !filteredSchedules.length ? <EmptyState message={t("schedule.emptyProposal")} /> : null}
        {!isLoading ? filteredSchedules.map(schedule => {
          const slots = schedule.slots || [];
          const selected = selectedScheduleSlot(schedule);
          const canChoose = schedule.status === "pending_selection";
          return (
            <Card className="schedule-choice-card" key={schedule.id}>
              <div className="list-row">
                <div>
                  <span className="list-id">{schedule.requestCode || schedule.requestId}</span>
                  <h2>{schedule.projectName || schedule.address || t("schedule.title")}</h2>
                </div>
                <ScheduleStatusBadge status={schedule.status} />
              </div>

              <div className="info-grid">
                <InfoRow label={t("request.id")} value={schedule.requestCode || schedule.requestId} />
                <InfoRow label={t("request.project")} value={schedule.projectName || schedule.address || "-"} />
                <InfoRow label={t("schedule.technician")} value={schedule.technicianName || schedule.technician || "-"} />
                <InfoRow label={t("schedule.memoFromYamaden")} value={schedule.customerNote || "-"} />
              </div>

              {selected ? (
                <div className="schedule-selected-box">
                  <Check size={18} />
                  <div>
                    <b>{t("schedule.selectedTitle")}</b>
                    <span>{slotText(selected)}</span>
                  </div>
                </div>
              ) : null}

              {slots.length ? (
                <div className="schedule-slot-choice">
                  <h3>{t("schedule.proposedSlots")}</h3>
                  {slots.map(slot => {
                    const active = selected ? selected.slotId === slot.slotId : selectedSlots[schedule.id] === slot.slotId;
                    const rejected = Boolean(selected && selected.slotId !== slot.slotId);
                    return (
                      <button
                        className={`schedule-slot-card${active ? " active" : ""}${rejected ? " rejected" : ""}`}
                        disabled={!canChoose || Boolean(selected) || slot.status === "unavailable"}
                        key={slot.slotId}
                        type="button"
                        onClick={() => setSelectedSlots(current => ({ ...current, [schedule.id]: slot.slotId }))}
                      >
                        <Clock size={18} />
                        <span>{slot.date}</span>
                        <strong>{slot.startTime} - {slot.endTime}</strong>
                        {active ? <Check size={18} /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {canChoose && !selected ? (
                <Button disabled={!selectedSlots[schedule.id] || actionLoading === schedule.id} onClick={() => confirmSlot(schedule)}>
                  {actionLoading === schedule.id ? t("common.loading") : t("schedule.confirmChoice")}
                </Button>
              ) : null}
              {!canChoose && !selected ? <p className="muted-line">{t("schedule.waitingAdmin")}</p> : null}
            </Card>
          );
        }) : null}
      </div>
    </section>
  );
}

function selectedScheduleSlot(schedule: Schedule) {
  return (schedule.slots || []).find(slot => slot.slotId === schedule.selectedSlotId || slot.status === "selected")
    || (schedule.selectedDate ? { slotId: "selected", date: schedule.selectedDate, startTime: schedule.selectedStartTime || "", endTime: schedule.selectedEndTime || "", status: "selected" as const } : null);
}

function slotText(slot: { date: string; startTime: string; endTime: string }) {
  return `${slot.date} ${slot.startTime}${slot.endTime ? " - " + slot.endTime : ""}`;
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
