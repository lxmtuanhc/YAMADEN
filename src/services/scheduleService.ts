import { SCHEDULE_REQUEST_STATUS_BY_STATUS, SCHEDULE_TIMELINE_MESSAGE_KEYS } from "../constants/scheduleStatus";
import { APP_STORAGE_KEY } from "../constants/storageKeys";
import { initialSchedules } from "../data/mockData";
import { useAppStore } from "../stores/appStore";
import type { Schedule, ScheduleStatus } from "../types";
import { getUserToken } from "./authService";
import { requestService } from "./requestService";

export interface CreateScheduleInput {
  requestId: string;
  date: string;
  time: string;
  technician: string;
  projectName: string;
  status?: ScheduleStatus;
  customerNote?: string;
}

export type UpdateScheduleInput = Partial<Pick<Schedule, "date" | "time" | "technician" | "projectName" | "status" | "customerNote">>;

const scheduleSeedById = new Map(initialSchedules.map(schedule => [schedule.id, schedule]));

function delay() {
  return new Promise(resolve => window.setTimeout(resolve, 120));
}

function createScheduleId(): string {
  return `SC-2024-${Math.floor(1000 + Math.random() * 8999)}`;
}

function normalizeStatus(status?: string): ScheduleStatus {
  if (status === "pending" || status === "confirmed" || status === "rescheduled" || status === "completed" || status === "cancelled") return status;
  if (status === "on_the_way") return "in_progress";
  if (status === "in_progress" || status === "upcoming") return status;
  return "pending";
}

function normalizeSchedule(schedule: Schedule): Schedule {
  const seed = scheduleSeedById.get(schedule.id);
  const time = schedule.time || [schedule.timeStart, schedule.timeEnd].filter(Boolean).join(" - ");
  return {
    ...schedule,
    id: String(schedule.id || schedule.appointmentCode || ""),
    appointmentCode: schedule.appointmentCode || schedule.id,
    requestId: schedule.requestId || seed?.requestId || "",
    requestCode: schedule.requestCode || "",
    date: schedule.date || seed?.date || "",
    time: time || seed?.time || "",
    timeStart: schedule.timeStart || schedule.time || seed?.time || "",
    timeEnd: schedule.timeEnd || "",
    technician: schedule.technician || schedule.technicianName || seed?.technician || "",
    technicianName: schedule.technicianName || schedule.technician || seed?.technician || "",
    projectName: schedule.projectName || seed?.projectName || "",
    status: normalizeStatus(schedule.status)
  };
}

function scheduleFromBackend(item: any): Schedule {
  return normalizeSchedule({
    id: String(item.id || item.appointmentCode || item._id || ""),
    appointmentCode: item.appointmentCode || item.id || "",
    requestId: String(item.requestId || item.requestCode || ""),
    requestCode: item.requestCode || "",
    customerName: item.customerName || "",
    customerPhone: item.customerPhone || "",
    customerEmail: item.customerEmail || "",
    projectName: item.projectName || item.address || "",
    address: item.address || "",
    date: item.date || "",
    time: item.time || [item.timeStart, item.timeEnd].filter(Boolean).join(" - "),
    timeStart: item.timeStart || item.time || "",
    timeEnd: item.timeEnd || "",
    technician: item.technician || item.technicianName || "",
    technicianName: item.technicianName || item.technician || "",
    technicianId: item.technicianId || "",
    status: normalizeStatus(item.status),
    customerNote: item.customerNote || "",
    adminNote: item.adminNote || "",
    createdBy: item.createdBy || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    history: Array.isArray(item.history) ? item.history : []
  });
}

async function backendJson(url: string, options?: RequestInit) {
  const token = getUserToken();
  if (!token) return null;
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Appointment API failed");
  return response.json();
}

async function fetchBackendSchedules(): Promise<Schedule[] | null> {
  const payload = await backendJson("/api/appointments/my");
  if (!payload) return null;
  const items = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return items.map(scheduleFromBackend);
}

async function fetchBackendSchedule(id: string): Promise<Schedule | null> {
  const payload = await backendJson(`/api/appointments/${encodeURIComponent(id)}`);
  if (!payload) return null;
  return scheduleFromBackend(payload.data || payload);
}

async function createBackendSchedule(input: CreateScheduleInput): Promise<Schedule | null> {
  const payload = await backendJson("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: input.requestId,
      date: input.date,
      time: input.time,
      technicianName: input.technician,
      projectName: input.projectName,
      customerNote: input.customerNote || ""
    })
  });
  if (!payload) return null;
  return scheduleFromBackend(payload.data || payload);
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
    try {
      const backend = await fetchBackendSchedules();
      if (backend) {
        commitSchedules(backend);
        return backend;
      }
    } catch (error) {
      console.warn("Unable to load appointments from backend", error);
    }
    const schedules = readSchedules();
    commitSchedules(schedules);
    return schedules;
  },

  async getScheduleById(id: string): Promise<Schedule | null> {
    await delay();
    try {
      const backend = await fetchBackendSchedule(id);
      if (backend) return backend;
    } catch (error) {
      console.warn("Unable to load appointment from backend", error);
    }
    return readSchedules().find(schedule => schedule.id === id) || null;
  },

  async getSchedulesByRequestId(requestId: string): Promise<Schedule[]> {
    await delay();
    try {
      const backend = await fetchBackendSchedules();
      if (backend) {
        commitSchedules(backend);
        return backend.filter(schedule => schedule.requestId === requestId || schedule.requestCode === requestId);
      }
    } catch (error) {
      console.warn("Unable to load request appointments from backend", error);
    }
    const schedules = readSchedules();
    commitSchedules(schedules);
    return schedules.filter(schedule => schedule.requestId === requestId || schedule.requestCode === requestId);
  },

  async createSchedule(input: CreateScheduleInput): Promise<Schedule> {
    await delay();
    const request = await requestService.getRequestById(input.requestId);
    if (!request) throw new Error("Request not found");

    try {
      const backend = await createBackendSchedule(input);
      if (backend) {
        commitSchedules([backend, ...readSchedules().filter(schedule => schedule.id !== backend.id)]);
        return backend;
      }
    } catch (error) {
      console.warn("Unable to create appointment in backend", error);
      throw error;
    }
    throw new Error("Appointment create failed");
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
