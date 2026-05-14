import type { Quote, Schedule, SupportRequest, User } from "../types";

export const defaultUser: User = {
  id: "user-demo",
  phone: "08062417758",
  pin: "123456",
  name: "Lê Xuân Minh Tuấn",
  email: "lxmtuanhc@gmail.com",
  address: "733-0851, Hiroshima 広島市, 9-22",
  projectName: "Cty Yamaden",
  companyType: "Cá nhân",
  status: "active"
};

export const initialRequests: SupportRequest[] = [
  {
    id: "RQ-2024-0428",
    category: "electrical",
    title: "Sửa chữa hệ thống điện văn phòng",
    description: "Hệ thống điện khu vực phòng họp thường bị ngắt điện đột ngột. Đề nghị kiểm tra và khắc phục.",
    address: "Tòa nhà văn phòng YAMADA, 1-2-3 Yamada, Tokyo",
    datetime: "20/05/2024 09:00 - 11:00",
    projectName: "Tòa nhà văn phòng YAMADA",
    createdAt: "16/05/2024 10:30",
    createdBy: "Nguyễn Văn A",
    status: "processing",
    images: ["site-a.jpg", "site-b.jpg"]
  },
  {
    id: "RQ-2024-0415",
    category: "installation",
    title: "Lắp đặt ổ cắm mới",
    description: "Cần bổ sung ổ cắm tại khu vực làm việc mới.",
    address: "Phòng làm việc tầng 3",
    datetime: "18/05/2024 13:00 - 15:00",
    projectName: "Tòa nhà văn phòng YAMADA",
    createdAt: "10/05/2024 14:20",
    createdBy: "Nguyễn Văn A",
    status: "waiting_customer",
    images: ["socket.jpg"]
  },
  {
    id: "RQ-2024-0380",
    category: "maintenance",
    title: "Bảo trì hệ thống điều hòa",
    description: "Kiểm tra định kỳ hệ thống điều hòa trung tâm.",
    address: "Tầng 2",
    datetime: "05/05/2024 09:00",
    projectName: "Tòa nhà văn phòng YAMADA",
    createdAt: "02/05/2024 09:15",
    createdBy: "Nguyễn Văn A",
    status: "completed",
    images: []
  }
];

export const initialQuotes: Quote[] = [
  {
    id: "Q-2024-0385",
    requestId: "RQ-2024-0415",
    projectName: "Lắp thêm 6 ổ cắm và dây điện",
    validUntil: "25/05/2024",
    status: "pending",
    items: [
      { name: "Ổ cắm Panasonic WN1001SW", quantity: 6, unitPrice: 1200 },
      { name: "Dây điện 2.0mm", quantity: 50, unitPrice: 150 },
      { name: "Nhân công lắp đặt", quantity: 1, unitPrice: 12000 }
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
    projectName: "Tòa nhà văn phòng YAMADA",
    status: "upcoming"
  }
];
