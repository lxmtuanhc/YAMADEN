import { SCHEDULE_REQUEST_STATUS_BY_STATUS, SCHEDULE_TIMELINE_MESSAGE_KEYS } from "../constants/scheduleStatus";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { initialSchedules } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { Schedule, ScheduleStatus } from "../types";
import { requestService } from "./requestService";

export interface CreateScheduleInput {
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status?: ScheduleStatus;
}

export type UpdateScheduleInput = Partial<Pick<Schedule, "date" | "time" | "technician" | "projectName" | "status">>;

const scheduleSeedById = new Map(initialSchedules.map(schedule => [schedule.id, schedule]));

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function createScheduleId(): string {
  return `SC-2024-${Math.floor(1000 + Math.random() * 8999)}`;
}

function normalizeStatus(status?: string): ScheduleStatus {
  if (status === "confirmed") return "upcoming";
  if (status === "on_the_way") return "in_progress";
  if (status === "in_progress" || status === "completed" || status === "cancelled") return status;
  return "upcoming";
}

function normalizeSchedule(schedule: Schedule): Schedule {
  const seed = scheduleSeedById.get(schedule.id);
  return {
    ...schedule,
    requestId: schedule.requestId || seed?.requestId || "",
    date: schedule.date || seed?.date || "",
    time: schedule.time || seed?.time || "",
    technician: schedule.technician || seed?.technician || "",
    projectName: schedule.projectName || seed?.projectName || "",
    status: normalizeStatus(schedule.status)
  };
}

function readSchedules(): Schedule[] {
  const storeSchedules = useAppStore.getState().schedules;
  if (storeSchedules.length) return storeSchedules.map(normalizeSchedule);

  try {
    const raw = JSON.parse(localStorage.getItem(APP_STORAGE_KEY) || "null");
    const saved = raw?.state?.schedules;
    if (Array.isArray(saved)) return saved.map(normalizeSchedule);
  } catch (error) {
    console.warn("Unable to read schedule cache", error);
  }

  return initialSchedules.map(normalizeSchedule);
}

function commitSchedules(schedules: Schedule[]) {
  useAppStore.setState({ schedules });
}

async function addScheduleTimeline(requestId: string, status: ScheduleStatus, event: "created" | "updated" | ScheduleStatus) {
  await requestService.addTimelineEvent(requestId, {
    type: event === "updated" || event === "created" ? "scheduled" : SCHEDULE_REQUEST_STATUS_BY_STATUS[status],
    message: SCHEDULE_TIMELINE_MESSAGE_KEYS[event]
  });
}

export const scheduleService = {
  async getSchedules(): Promise<Schedule[]> {
    await delay();
    const schedules = readSchedules();
    commitSchedules(schedules);
    return schedules;
  },

  async getScheduleById(id: string): Promise<Schedule | null> {
    await delay();
    return readSchedules().find(schedule => schedule.id === id) || null;
  },

  async getSchedulesByRequestId(requestId: string): Promise<Schedule[]> {
    await delay();
    const schedules = readSchedules();
    commitSchedules(schedules);
    return schedules.filter(schedule => schedule.requestId === requestId);
  },

  async createSchedule(input: CreateScheduleInput): Promise<Schedule> {
    await delay();
    const request = await requestService.getRequestById(input.requestId);
    if (!request) throw new Error("Request not found");

    const schedule: Schedule = {
      id: createScheduleId(),
      requestId: input.requestId,
      date: input.date,
      time: input.time,
      technician: input.technician,
      projectName: input.projectName || request.projectName || request.title,
      status: input.status || "upcoming"
    };

    commitSchedules([schedule, ...readSchedules()]);
    await addScheduleTimeline(schedule.requestId, schedule.status, "created");
    return schedule;
  },

  async updateSchedule(id: string, input: UpdateScheduleInput): Promise<Schedule> {
    await delay();
    const schedules = readSchedules();
    const existing = schedules.find(schedule => schedule.id === id);
    if (!existing) throw new Error("Schedule not found");

    const updated = normalizeSchedule({ ...existing, ...input });
    commitSchedules(schedules.map(schedule => (schedule.id === id ? updated : schedule)));
    await addScheduleTimeline(updated.requestId, updated.status, input.status || "updated");
    return updated;
  },

  async cancelSchedule(id: string): Promise<Schedule> {
    return scheduleService.updateSchedule(id, { status: "cancelled" });
  },

  async completeSchedule(id: string): Promise<Schedule> {
    return scheduleService.updateSchedule(id, { status: "completed" });
  }
};
