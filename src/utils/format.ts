export function formatCurrency(value: number): string {
  return `¥ ${value.toLocaleString("ja-JP")}`;
}

export function createRequestId(): string {
  return `RQ-2024-${Math.floor(1000 + Math.random() * 8999)}`;
}

export function todayLabel(): string {
  return new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}
