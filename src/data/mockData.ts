import type { Quote, Schedule, SupportRequest, User } from "../types";

export const defaultUser: User = {
  id: "user-demo",
  phone: "08062417758",
  pin: "123456",
  name: "Le Xuan Minh Tuan",
  email: "lxmtuanhc@gmail.com",
  address: "733-0851, Hiroshima, 9-22",
  projectName: "Cty Yamaden",
  accountType: "personal",
  status: "active"
};

export const initialRequests: SupportRequest[] = [
  {
    id: "RQ-2024-0428",
    category: "electrical",
    title: "Sua chua he thong dien van phong",
    description: "He thong dien khu vuc phong hop thuong bi ngat dien dot ngot. De nghi kiem tra va khac phuc.",
    address: "Toa nha van phong YAMADA, 1-2-3 Yamada, Tokyo",
    datetime: "20/05/2024 09:00 - 11:00",
    projectName: "Toa nha van phong YAMADA",
    createdAt: "16/05/2024 10:30",
    createdBy: "Nguyen Van A",
    status: "processing",
    images: ["site-a.jpg", "site-b.jpg"],
    timeline: [
      { id: "tl-0428-1", type: "submitted", message: "request.timelineSubmitted", createdAt: "16/05/2024 10:30" },
      { id: "tl-0428-2", type: "received", message: "request.timelineReceived", createdAt: "16/05/2024 10:35" },
      { id: "tl-0428-3", type: "processing", message: "request.timelineProcessing", createdAt: "16/05/2024 11:20" }
    ]
  },
  {
    id: "RQ-2024-0415",
    category: "installation",
    title: "Lap dat o cam moi",
    description: "Can bo sung o cam tai khu vuc lam viec moi.",
    address: "Phong lam viec tang 3",
    datetime: "18/05/2024 13:00 - 15:00",
    projectName: "Toa nha van phong YAMADA",
    createdAt: "10/05/2024 14:20",
    createdBy: "Nguyen Van A",
    status: "waiting_customer",
    images: ["socket.jpg"],
    timeline: [
      { id: "tl-0415-1", type: "submitted", message: "request.timelineSubmitted", createdAt: "10/05/2024 14:20" },
      { id: "tl-0415-2", type: "received", message: "request.timelineReceived", createdAt: "10/05/2024 14:40" },
      { id: "tl-0415-3", type: "waiting_customer", message: "request.timelineWaiting", createdAt: "10/05/2024 15:15" }
    ]
  },
  {
    id: "RQ-2024-0380",
    category: "maintenance",
    title: "Bao tri he thong dieu hoa",
    description: "Kiem tra dinh ky he thong dieu hoa trung tam.",
    address: "Tang 2",
    datetime: "05/05/2024 09:00",
    projectName: "Toa nha van phong YAMADA",
    createdAt: "02/05/2024 09:15",
    createdBy: "Nguyen Van A",
    status: "completed",
    images: [],
    timeline: [
      { id: "tl-0380-1", type: "submitted", message: "request.timelineSubmitted", createdAt: "02/05/2024 09:15" },
      { id: "tl-0380-2", type: "received", message: "request.timelineReceived", createdAt: "02/05/2024 09:25" },
      { id: "tl-0380-3", type: "processing", message: "request.timelineProcessing", createdAt: "03/05/2024 10:00" },
      { id: "tl-0380-4", type: "completed", message: "request.timelineCompleted", createdAt: "05/05/2024 11:45" }
    ]
  }
];

export const initialQuotes: Quote[] = [
  {
    id: "Q-2024-0385",
    requestId: "RQ-2024-0415",
    projectName: "Lap them 6 o cam va day dien",
    validUntil: "25/05/2024",
    status: "pending",
    items: [
      { name: "O cam Panasonic WN1001SW", quantity: 6, unitPrice: 1200 },
      { name: "Day dien 2.0mm", quantity: 50, unitPrice: 150 },
      { name: "Nhan cong lap dat", quantity: 1, unitPrice: 12000 }
    ]
  }
];

export const initialSchedules: Schedule[] = [
  {
    id: "SC-2024-001",
    requestId: "RQ-2024-0428",
    date: "20/05/2024",
    time: "09:00 - 11:00",
    technician: "Kobayashi Taro",
    projectName: "Toa nha van phong YAMADA",
    status: "upcoming"
  }
];
