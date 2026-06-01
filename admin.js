(function () {
  "use strict";

  console.log("[admin-v2] script loaded");

  const ADMIN_TOKEN_KEY = "adminToken";
  const LOGIN_TIME_KEY = "loginTime";
  const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
  const ADMIN_PATH = "/admin.html";
  const QUOTE_MAX_FILE_SIZE = 25 * 1024 * 1024;
  const QUOTE_MAX_FILES = 3;
  const QUOTE_ALLOWED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".docx", ".doc"];

  const i18n = {
    ja: {
      dashboard: "ダッシュボード",
      requests: "依頼管理",
      customers: "顧客管理",
      staff: "スタッフ管理",
      quotes: "見積・提案",
      notifications: "通知",
      settings: "設定",
      search: "検索...",
      logout: "ログアウト",
      refresh: "更新",
      totalRequests: "総依頼数",
      untreated: "未対応",
      overdue: "期限超過",
      customersCount: "顧客数",
      staffCount: "スタッフ数",
      priorityRequests: "優先案件",
      aiPanel: "AIサポート",
      kpiPlanned: "KPIデータは今後連携予定です",
      noData: "データがありません",
      all: "すべて",
      id: "ID",
      customer: "顧客",
      content: "内容",
      status: "ステータス",
      assignee: "担当者",
      elapsed: "放置時間",
      deadline: "対応期限",
      action: "操作",
      detail: "詳細",
      save: "保存",
      close: "閉じる",
      adminReply: "管理者返信",
      issueTags: "依頼タグ",
      media: "メディア",
      timeline: "タイムライン",
      updateStatus: "ステータス更新",
      assignStaff: "担当者を設定",
      quoteRegister: "見積登録",
      proposalCreate: "提案書作成",
      recordAdd: "対応記録追加",
      name: "名前",
      phone: "電話番号",
      company: "会社",
      address: "住所",
      createdAt: "登録日",
      approve: "承認",
      block: "停止",
      activate: "有効化",
      userHistory: "依頼履歴",
      department: "部署",
      role: "役割",
      email: "Email",
      workContent: "担当作業",
      workTags: "作業タグ",
      addStaff: "スタッフ追加",
      edit: "編集",
      delete: "削除",
      staffForm: "スタッフ情報",
      quoteShell: "見積・提案管理は今後MongoDB APIと連携予定です",
      pdfExport: "PDF出力",
      longUntreated: "未対応が長時間放置されています",
      pendingUsers: "新規ユーザー承認待ち",
      quoteDeadline: "見積期限が近い案件",
      sessionExpired: "セッションが切れました。再ログインしてください。",
      loading: "読み込み中...",
      mediaFilter: "メディア",
      hasMedia: "メディアあり",
      noMedia: "メディアなし",
      mediaCount: "メディア",
      quoteRequested: "見積希望",
      suggestAssignee: "担当者を提案",
      applyAssignee: "この担当者に決定",
      noAssigneeSuggestion: "適合する担当者が見つかりません",
      assigneeReason: "一致タグ",
      savedAssignee: "担当者を更新しました",
      nearQuoteDeadline: "見積希望案件",
      settingsSla: "SLA / 対応期限ルール",
      settingsAssign: "AI自動担当者アサイン",
      settingsUrgency: "緊急度判定",
      settingsNotice: "通知設定",
      settingsColor: "色ルール",
      settingsSystem: "システム情報",
      saved: "保存しました",
      failed: "処理に失敗しました",
      confirmDelete: "削除しますか？",
      aiUrgency: "緊急度の自動判定",
      aiAssign: "自動担当者アサイン",
      aiPriority: "優先案件提案"
    },
    vi: {
      dashboard: "Dashboard",
      requests: "Quản lý yêu cầu",
      customers: "Quản lý khách hàng",
      staff: "Quản lý staff",
      quotes: "Báo giá",
      notifications: "Thông báo",
      settings: "Cài đặt",
      search: "Tìm kiếm...",
      logout: "Đăng xuất",
      refresh: "Làm mới",
      totalRequests: "Tổng yêu cầu",
      untreated: "Chưa xử lý",
      overdue: "Quá hạn",
      customersCount: "Số khách hàng",
      staffCount: "Số staff",
      priorityRequests: "Yêu cầu ưu tiên",
      aiPanel: "AI hỗ trợ",
      kpiPlanned: "Dữ liệu KPI sẽ được kết nối sau",
      noData: "Không có dữ liệu",
      all: "Tất cả",
      id: "ID",
      customer: "Khách hàng",
      content: "Nội dung",
      status: "Trạng thái",
      assignee: "Phụ trách",
      elapsed: "Thời gian chờ",
      deadline: "Hạn xử lý",
      action: "Thao tác",
      detail: "Chi tiết",
      save: "Lưu",
      close: "Đóng",
      adminReply: "Phản hồi admin",
      issueTags: "Tag yêu cầu",
      media: "Media",
      timeline: "Timeline",
      updateStatus: "Cập nhật trạng thái",
      assignStaff: "Gán staff",
      quoteRegister: "Đăng ký báo giá",
      proposalCreate: "Tạo đề xuất",
      recordAdd: "Thêm ghi nhận",
      name: "Tên",
      phone: "Số điện thoại",
      company: "Công ty",
      address: "Địa chỉ",
      createdAt: "Ngày đăng ký",
      approve: "Duyệt",
      block: "Khóa",
      activate: "Mở khóa",
      userHistory: "Lịch sử yêu cầu",
      department: "Bộ phận",
      role: "Vai trò",
      email: "Email",
      workContent: "Nội dung phụ trách",
      workTags: "Tag công việc",
      addStaff: "Thêm staff",
      edit: "Sửa",
      delete: "Xóa",
      staffForm: "Thông tin staff",
      quoteShell: "Quản lý báo giá / đề xuất sẽ kết nối MongoDB API sau",
      pdfExport: "Xuất PDF",
      longUntreated: "Yêu cầu chưa xử lý bị để lâu",
      pendingUsers: "User mới chờ duyệt",
      quoteDeadline: "Báo giá gần hết hạn",
      sessionExpired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      loading: "Đang tải...",
      mediaFilter: "Media",
      hasMedia: "Có media",
      noMedia: "Không media",
      mediaCount: "Media",
      quoteRequested: "Muốn báo giá",
      suggestAssignee: "Đề xuất phụ trách",
      applyAssignee: "Xác nhận gán",
      noAssigneeSuggestion: "Chưa tìm thấy nhân sự phù hợp",
      assigneeReason: "Tag trùng",
      savedAssignee: "Đã cập nhật phụ trách",
      nearQuoteDeadline: "Yêu cầu muốn báo giá",
      settingsSla: "SLA / quy tắc hạn xử lý",
      settingsAssign: "AI tự động gán phụ trách",
      settingsUrgency: "Đánh giá độ khẩn cấp",
      settingsNotice: "Cài đặt thông báo",
      settingsColor: "Quy tắc màu",
      settingsSystem: "Thông tin hệ thống",
      saved: "Đã lưu",
      failed: "Thao tác thất bại",
      confirmDelete: "Bạn muốn xóa mục này?",
      aiUrgency: "Tự động đánh giá độ khẩn",
      aiAssign: "Tự động gán phụ trách",
      aiPriority: "Đề xuất yêu cầu ưu tiên"
    }
  };

  const requestStatusMap = {
    untreated: "未対応",
    contacted: "連絡済",
    site_done: "現地済",
    quoted: "見積",
    ordered: "受注",
    completed: "完了",
    lost: "失注"
  };

  const requestStatusMapVi = {
    untreated: "Chưa xử lý",
    contacted: "Đã liên hệ",
    site_done: "Đã khảo sát",
    quoted: "Báo giá",
    ordered: "Đã nhận đơn",
    completed: "Hoàn thành",
    lost: "Mất đơn"
  };

  const userStatusMap = {
    pendingApproval: "承認待ち",
    pending: "承認待ち",
    active: "有効",
    blocked: "停止",
    deleted: "削除済み"
  };

  const userStatusLabels = {
    ja: {
      pendingApproval: "\u627f\u8a8d\u5f85\u3061",
      pending: "\u627f\u8a8d\u5f85\u3061",
      active: "\u6709\u52b9",
      blocked: "\u505c\u6b62\u4e2d",
      deleted: "\u524a\u9664\u6e08\u307f"
    },
    vi: {
      pendingApproval: "Ch\u1edd duy\u1ec7t",
      pending: "Ch\u1edd duy\u1ec7t",
      active: "\u0110ang ho\u1ea1t \u0111\u1ed9ng",
      blocked: "B\u1ecb kh\u00f3a",
      deleted: "\u0110\u00e3 x\u00f3a"
    }
  };

  const staffStatusMap = {
    active: "稼働中",
    busy: "対応中",
    off: "休止中",
    inactive: "停止中",
    deleted: "削除済み"
  };

  Object.assign(i18n.ja, {
    dashboard: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
    requests: "\u4f9d\u983c\u7ba1\u7406",
    customers: "\u9867\u5ba2\u7ba1\u7406",
    staff: "\u30b9\u30bf\u30c3\u30d5\u7ba1\u7406",
    quotes: "\u898b\u7a4d\u30fb\u63d0\u6848",
    notifications: "\u901a\u77e5",
    settings: "\u8a2d\u5b9a",
    search: "\u691c\u7d22...",
    logout: "\u30ed\u30b0\u30a2\u30a6\u30c8",
    refresh: "\u66f4\u65b0",
    dashboardSubtitle: "\u4f9d\u983c\u3001\u9867\u5ba2\u3001\u30b9\u30bf\u30c3\u30d5\u306e\u5bfe\u5fdc\u72b6\u6cc1\u3092\u4e00\u89a7\u3067\u78ba\u8a8d\u3067\u304d\u307e\u3059\u3002",
    requestSubtitle: "\u9867\u5ba2\u304b\u3089\u306e\u4f9d\u983c\u3092\u691c\u7d22\u3001\u7d5e\u308a\u8fbc\u307f\u3001\u5bfe\u5fdc\u3067\u304d\u307e\u3059\u3002",
    totalRequests: "\u7dcf\u4f9d\u983c\u6570",
    untreated: "\u672a\u5bfe\u5fdc",
    overdue: "\u671f\u9650\u8d85\u904e",
    customersCount: "\u9867\u5ba2\u6570",
    staffCount: "\u30b9\u30bf\u30c3\u30d5",
    quotingCount: "\u898b\u7a4d\u4e2d",
    quoteRate: "\u898b\u7a4d\u2192\u53d7\u6ce8\u7387",
    firstResponse: "\u521d\u52d5\u5bfe\u5fdc\u6642\u9593",
    planned: "\u4eca\u5f8c\u9023\u643a\u4e88\u5b9a",
    realData: "\u5b9f\u30c7\u30fc\u30bf\u9023\u643a\u4e2d",
    priorityRequests: "\u512a\u5148\u5bfe\u5fdc\u304c\u5fc5\u8981\u306a\u4f9d\u983c",
    noPriorityRequests: "\u73fe\u5728\u3001\u512a\u5148\u5bfe\u5fdc\u304c\u5fc5\u8981\u306a\u4f9d\u983c\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    aiPanel: "AI\u904b\u7528\u30b5\u30dd\u30fc\u30c8",
    preparing: "\u6e96\u5099\u4e2d",
    quickActions: "\u30af\u30a4\u30c3\u30af\u30a2\u30af\u30b7\u30e7\u30f3",
    createRequest: "\u4f9d\u983c\u4f5c\u6210",
    assignStaffAction: "\u30b9\u30bf\u30c3\u30d5\u5272\u5f53",
    createQuote: "\u898b\u7a4d\u4f5c\u6210",
    addNote: "\u5bfe\u5fdc\u30e1\u30e2\u8ffd\u52a0",
    customerPreview: "\u65b0\u898f\u30fb\u627f\u8a8d\u5f85\u3061\u9867\u5ba2",
    closeCustomerDetail: "\u9867\u5ba2\u8a73\u7d30\u3092\u9589\u3058\u308b",
    contactInfo: "\u9023\u7d61\u5148\u60c5\u5831",
    accountInfo: "\u30a2\u30ab\u30a6\u30f3\u30c8\u60c5\u5831",
    staffPreview: "\u30b9\u30bf\u30c3\u30d5\u7a3c\u50cd\u72b6\u6cc1",
    all: "\u3059\u3079\u3066",
    tableView: "\u8868",
    kanbanView: "\u30ab\u30f3\u30d0\u30f3",
    newest: "\u65b0\u3057\u3044\u9806",
    oldest: "\u53e4\u3044\u9806",
    prioritySort: "\u512a\u5148\u9806",
    overdueFirst: "\u671f\u9650\u8d85\u904e\u512a\u5148",
    urgency: "\u7dca\u6025\u5ea6",
    unjudged: "\u672a\u5224\u5b9a",
    media: "\u30e1\u30c7\u30a3\u30a2",
    searchButton: "\u691c\u7d22",
    departmentFilter: "\u90e8\u9580",
    allRequestDepartments: "\u3059\u3079\u3066\u306e\u90e8\u9580",
    departmentDesign: "\u8a2d\u8a08\u90e8",
    departmentConstruction: "\u5de5\u4e8b\u90e8",
    departmentOperation: "\u696d\u52d9\u90e8",
    departmentMaintenance: "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u90e8",
    departmentSurvey: "\u8abf\u67fb\u90e8",
    departmentSales: "\u55b6\u696d\u90e8",
    departmentOther: "\u305d\u306e\u4ed6",
    noRequests: "\u4f9d\u983c\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    loadRequestsError: "\u4f9d\u983c\u4e00\u89a7\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093",
    retry: "\u518d\u8a66\u884c"
  });

  Object.assign(i18n.vi, {
    dashboard: "Dashboard",
    requests: "Qu\u1ea3n l\u00fd y\u00eau c\u1ea7u",
    customers: "Qu\u1ea3n l\u00fd kh\u00e1ch h\u00e0ng",
    staff: "Qu\u1ea3n l\u00fd staff",
    quotes: "B\u00e1o gi\u00e1",
    notifications: "Th\u00f4ng b\u00e1o",
    settings: "C\u00e0i \u0111\u1eb7t",
    search: "T\u00ecm ki\u1ebfm...",
    logout: "\u0110\u0103ng xu\u1ea5t",
    refresh: "L\u00e0m m\u1edbi",
    dashboardSubtitle: "T\u1ed5ng quan t\u00ecnh tr\u1ea1ng x\u1eed l\u00fd y\u00eau c\u1ea7u, kh\u00e1ch h\u00e0ng v\u00e0 nh\u00e2n vi\u00ean.",
    requestSubtitle: "Theo d\u00f5i, l\u1ecdc v\u00e0 x\u1eed l\u00fd c\u00e1c y\u00eau c\u1ea7u c\u1ee7a kh\u00e1ch h\u00e0ng.",
    quotingCount: "\u0110ang b\u00e1o gi\u00e1",
    quoteRate: "T\u1ec9 l\u1ec7 b\u00e1o gi\u00e1 \u2192 \u0111\u01a1n",
    firstResponse: "Th\u1eddi gian ph\u1ea3n h\u1ed3i \u0111\u1ea7u",
    planned: "S\u1ebd li\u00ean k\u1ebft sau",
    realData: "\u0110ang d\u00f9ng d\u1eef li\u1ec7u th\u1eadt",
    noPriorityRequests: "Hi\u1ec7n ch\u01b0a c\u00f3 y\u00eau c\u1ea7u n\u00e0o c\u1ea7n x\u1eed l\u00fd.",
    preparing: "Chu\u1ea9n b\u1ecb",
    quickActions: "Thao t\u00e1c nhanh",
    createRequest: "T\u1ea1o y\u00eau c\u1ea7u",
    assignStaffAction: "G\u00e1n staff",
    createQuote: "T\u1ea1o b\u00e1o gi\u00e1",
    addNote: "Th\u00eam ghi ch\u00fa x\u1eed l\u00fd",
    customerPreview: "Kh\u00e1ch h\u00e0ng m\u1edbi / ch\u1edd duy\u1ec7t",
    closeCustomerDetail: "\u0110\u00f3ng chi ti\u1ebft kh\u00e1ch h\u00e0ng",
    contactInfo: "Th\u00f4ng tin li\u00ean h\u1ec7",
    accountInfo: "Th\u00f4ng tin t\u00e0i kho\u1ea3n",
    staffPreview: "T\u1ea3i staff",
    all: "T\u1ea5t c\u1ea3",
    tableView: "B\u1ea3ng",
    kanbanView: "Kanban",
    newest: "M\u1edbi nh\u1ea5t",
    oldest: "C\u0169 nh\u1ea5t",
    prioritySort: "\u01afu ti\u00ean x\u1eed l\u00fd",
    overdueFirst: "Qu\u00e1 h\u1ea1n tr\u01b0\u1edbc",
    urgency: "\u0110\u1ed9 kh\u1ea9n",
    unjudged: "Ch\u01b0a \u0111\u00e1nh gi\u00e1",
    searchButton: "T\u00ecm ki\u1ebfm",
    departmentFilter: "B\u1ed9 ph\u1eadn",
    allRequestDepartments: "T\u1ea5t c\u1ea3 b\u1ed9 ph\u1eadn",
    departmentDesign: "B\u1ed9 thi\u1ebft k\u1ebf",
    departmentConstruction: "B\u1ed9 thi c\u00f4ng",
    departmentOperation: "B\u1ed9 nghi\u1ec7p v\u1ee5",
    departmentMaintenance: "B\u1ed9 b\u1ea3o tr\u00ec",
    departmentSurvey: "B\u1ed9 kh\u1ea3o s\u00e1t",
    departmentSales: "B\u1ed9 kinh doanh",
    departmentOther: "B\u1ed9 kh\u00e1c",
    noRequests: "Kh\u00f4ng c\u00f3 y\u00eau c\u1ea7u.",
    loadRequestsError: "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch y\u00eau c\u1ea7u",
    retry: "Th\u1eed l\u1ea1i"
  });

  Object.assign(i18n.ja, {
    customerSubtitle: "\u9867\u5ba2\u60c5\u5831\u3001\u30a2\u30ab\u30a6\u30f3\u30c8\u72b6\u614b\u3001\u4f9d\u983c\u5c65\u6b74\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",
    staffSubtitle: "\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3001\u90e8\u7f72\u3001\u30b9\u30ad\u30eb\u3001\u62c5\u5f53\u4f5c\u696d\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",
    active: "\u6709\u52b9",
    blocked: "\u505c\u6b62",
    deleted: "\u524a\u9664\u6e08\u307f",
    hasRequests: "\u4f9d\u983c\u3042\u308a",
    requestCount: "\u4f9d\u983c\u6570",
    info: "\u60c5\u5831",
    history: "\u4f9d\u983c\u5c65\u6b74",
    work: "\u62c5\u5f53\u4f5c\u696d",
    customerType: "\u9867\u5ba2\u7a2e\u5225",
    contact: "\u9023\u7d61\u62c5\u5f53",
    province: "\u5730\u57df",
    projectName: "\u5de5\u4e8b\u540d",
    companyAddress: "\u4f1a\u793e\u4f4f\u6240",
    taxId: "\u7a0e\u52d9ID",
    constructionType: "\u5de5\u4e8b\u7a2e\u5225",
    notificationsEnabled: "\u901a\u77e5",
    note: "\u30e1\u30e2",
    approvedAt: "\u627f\u8a8d\u65e5",
    lastLoginAt: "\u6700\u7d42\u30ed\u30b0\u30a4\u30f3",
    totalTags: "\u4f5c\u696d\u30bf\u30b0\u6570",
    departments: "\u90e8\u7f72\u6570",
    off: "\u4f11\u6b62",
    statusFilter: "\u30b9\u30c6\u30fc\u30bf\u30b9",
    sortName: "\u540d\u524d\u9806",
    sortCreated: "\u767b\u9332\u65e5\u9806",
    sortStatus: "\u72b6\u614b\u9806",
    allDepartments: "\u5168\u90e8\u7f72",
    detail: "\u8a73\u7d30",
    staffHistoryPlaceholder: "\u5c65\u6b74\u30c7\u30fc\u30bf\u306f\u4eca\u5f8c\u9023\u643a\u4e88\u5b9a\u3067\u3059"
  });

  Object.assign(i18n.vi, {
    customerSubtitle: "Qu\u1ea3n l\u00fd th\u00f4ng tin kh\u00e1ch h\u00e0ng, tr\u1ea1ng th\u00e1i t\u00e0i kho\u1ea3n v\u00e0 l\u1ecbch s\u1eed y\u00eau c\u1ea7u.",
    staffSubtitle: "Qu\u1ea3n l\u00fd h\u1ed3 s\u01a1, b\u1ed9 ph\u1eadn, k\u1ef9 n\u0103ng v\u00e0 n\u1ed9i dung c\u00f4ng vi\u1ec7c ph\u1ee5 tr\u00e1ch.",
    active: "\u0110ang ho\u1ea1t \u0111\u1ed9ng",
    blocked: "B\u1ecb kh\u00f3a",
    deleted: "\u0110\u00e3 x\u00f3a",
    hasRequests: "C\u00f3 y\u00eau c\u1ea7u",
    requestCount: "S\u1ed1 y\u00eau c\u1ea7u",
    info: "Th\u00f4ng tin",
    history: "L\u1ecbch s\u1eed y\u00eau c\u1ea7u",
    work: "C\u00f4ng vi\u1ec7c ph\u1ee5 tr\u00e1ch",
    customerType: "Lo\u1ea1i kh\u00e1ch",
    contact: "Ng\u01b0\u1eddi li\u00ean h\u1ec7",
    province: "Khu v\u1ef1c",
    projectName: "T\u00ean c\u00f4ng tr\u00ecnh",
    companyAddress: "\u0110\u1ecba ch\u1ec9 c\u00f4ng ty",
    taxId: "M\u00e3 s\u1ed1 thu\u1ebf",
    constructionType: "Lo\u1ea1i thi c\u00f4ng",
    notificationsEnabled: "Th\u00f4ng b\u00e1o",
    note: "Ghi ch\u00fa",
    approvedAt: "Ng\u00e0y duy\u1ec7t",
    lastLoginAt: "\u0110\u0103ng nh\u1eadp cu\u1ed1i",
    totalTags: "T\u1ed5ng tag c\u00f4ng vi\u1ec7c",
    departments: "S\u1ed1 b\u1ed9 ph\u1eadn",
    off: "Ngh\u1ec9/off",
    statusFilter: "Tr\u1ea1ng th\u00e1i",
    sortName: "Theo t\u00ean",
    sortCreated: "Theo ng\u00e0y t\u1ea1o",
    sortStatus: "Theo tr\u1ea1ng th\u00e1i",
    allDepartments: "T\u1ea5t c\u1ea3 b\u1ed9 ph\u1eadn",
    staffHistoryPlaceholder: "D\u1eef li\u1ec7u l\u1ecbch s\u1eed s\u1ebd li\u00ean k\u1ebft sau"
  });

  Object.assign(i18n.ja, {
    dashboard: "\u4eca\u65e5\u306e\u904b\u7528\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
    requestBacklog: "\u4f9d\u983c\u7ba1\u7406",
    operationCenter: "YAMADEN CS\u30aa\u30da\u30ec\u30fc\u30b7\u30e7\u30f3\u30bb\u30f3\u30bf\u30fc",
    export: "\u30a8\u30af\u30b9\u30dd\u30fc\u30c8",
    newRequest: "\u65b0\u898f\u4f9d\u983c\u767b\u9332",
    tableFormat: "\u8868\u5f62\u5f0f",
    kanbanPreview: "\u30ab\u30f3\u30d0\u30f3\u3067\u78ba\u8a8d\uff08\u30d7\u30ec\u30d3\u30e5\u30fc\uff09",
    amount: "\u91d1\u984d",
    customerRank: "\u9867\u5ba2\u30e9\u30f3\u30af",
    lastActivity: "\u6700\u7d42\u5bfe\u5fdc",
    contactCards: "\u9023\u7d61\u5148",
    recentRequests: "\u6700\u65b0\u306e\u4f9d\u983c\u30fb\u6848\u4ef6\u5c65\u6b74",
    internalNotes: "\u793e\u5185\u30e1\u30e2",
    tags: "\u30bf\u30b0",
    selectedDetail: "\u8a73\u7d30\u30d1\u30cd\u30eb",
    activeRequests: "\u5bfe\u5fdc\u4e2d",
    lastRequest: "\u6700\u7d42\u4f9d\u983c",
    workload: "\u7a3c\u50cd\u7387",
    assignedCount: "\u5bfe\u5fdc\u4e2d\u6848\u4ef6",
    performance: "\u30d1\u30d5\u30a9\u30fc\u30de\u30f3\u30b9",
    aiSuitability: "AI\u63a8\u85a6\u9069\u5408\u5ea6",
    strengths: "\u5f37\u307f\u30fb\u5c02\u9580\u6027",
    pipelineTitle: "\u898b\u7a4d\u30fb\u63d0\u6848\u30d1\u30a4\u30d7\u30e9\u30a4\u30f3",
    quoteTotal: "\u898b\u7a4d\u7dcf\u984d",
    quoteWinRate: "\u53d7\u6ce8\u7387",
    averageUnitPrice: "\u5e73\u5747\u5358\u4fa1",
    grossMargin: "\u7c97\u5229\u7387",
    emptyColumn: "\u30c7\u30fc\u30bf\u306f\u3042\u308a\u307e\u305b\u3093",
    automationGoal: "\u81ea\u52d5\u5316\u306e\u30b4\u30fc\u30eb",
    roles: "\u6a29\u9650\u3068\u30ed\u30fc\u30eb",
    companyInfo: "\u4f1a\u793e\u60c5\u5831",
    dataApi: "\u30c7\u30fc\u30bf\u9023\u643a / API"
  });

  Object.assign(i18n.vi, {
    dashboard: "Dashboard vận hành hôm nay",
    requestBacklog: "Quản lý yêu cầu",
    operationCenter: "Trung tâm vận hành YAMADEN CS",
    export: "Xuất dữ liệu",
    newRequest: "Tạo yêu cầu mới",
    tableFormat: "Dạng bảng",
    kanbanPreview: "Kanban preview",
    amount: "Số tiền",
    customerRank: "Hạng khách",
    lastActivity: "Hoạt động cuối",
    contactCards: "Liên hệ",
    recentRequests: "Lịch sử yêu cầu gần đây",
    internalNotes: "Ghi chú nội bộ",
    tags: "Tag",
    selectedDetail: "Panel chi tiết",
    activeRequests: "Đang xử lý",
    lastRequest: "Yêu cầu cuối",
    workload: "Tải công việc",
    assignedCount: "Đang phụ trách",
    performance: "Hiệu suất",
    aiSuitability: "Độ phù hợp AI",
    strengths: "Điểm mạnh / chuyên môn",
    pipelineTitle: "Pipeline báo giá / đề xuất",
    quoteTotal: "Tổng báo giá",
    quoteWinRate: "Tỉ lệ nhận đơn",
    averageUnitPrice: "Đơn giá TB",
    grossMargin: "Biên lợi nhuận",
    emptyColumn: "Chưa có dữ liệu",
    automationGoal: "Mục tiêu tự động hóa",
    roles: "Quyền và vai trò",
    companyInfo: "Thông tin công ty",
    dataApi: "Liên kết dữ liệu / API"
  });

  Object.assign(i18n.ja, {
    basicInfo: "\u57fa\u672c\u60c5\u5831",
    contactInfo: "\u9023\u7d61\u5148\u60c5\u5831",
    accountSecurity: "\u30a2\u30ab\u30a6\u30f3\u30c8\u30fb\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3",
    requestSummary: "\u4f9d\u983c\u30b5\u30de\u30ea\u30fc",
    accountActions: "\u30a2\u30ab\u30a6\u30f3\u30c8\u64cd\u4f5c",
    recentRequests: "\u6700\u8fd1\u306e\u4f9d\u983c\u5c65\u6b74",
    customerId: "\u9867\u5ba2ID",
    customerName: "\u9867\u5ba2\u540d",
    displayName: "\u8868\u793a\u540d",
    company: "\u4f1a\u793e",
    customerType: "\u9867\u5ba2\u7a2e\u5225",
    status: "\u30b9\u30c6\u30fc\u30bf\u30b9",
    createdAt: "\u767b\u9332\u65e5",
    updatedAt: "\u66f4\u65b0\u65e5",
    lastLoginAt: "\u6700\u7d42\u30ed\u30b0\u30a4\u30f3",
    profileCompleted: "\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u5b8c\u4e86",
    phone: "\u96fb\u8a71\u756a\u53f7",
    email: "\u30e1\u30fc\u30eb",
    contact: "\u9023\u7d61\u5148",
    address: "\u4f4f\u6240",
    province: "\u90fd\u9053\u5e9c\u770c\u30fb\u5730\u57df",
    projectName: "\u5de5\u4e8b\u540d",
    systemInfo: "\u30b7\u30b9\u30c6\u30e0\u60c5\u5831",
    quoteRequests: "\u898b\u7a4d\u4f9d\u983c",
    deletedAt: "\u524a\u9664\u65e5",
    confirmBlock: "\u3053\u306e\u9867\u5ba2\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u505c\u6b62\u3057\u307e\u3059\u304b\uff1f",
    confirmResetPin: "PIN\u3092\u30ea\u30bb\u30c3\u30c8\u3057\u307e\u3059\u304b\uff1f",
    backendPlanned: "\u3053\u306e\u6a5f\u80fd\u306f\u5f8c\u3067\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u306b\u63a5\u7d9a\u3055\u308c\u307e\u3059\u3002",
    cancel: "\u30ad\u30e3\u30f3\u30bb\u30eb",
    confirm: "\u78ba\u8a8d",
    blockCustomerTitle: "\u9867\u5ba2\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u505c\u6b62\u3057\u307e\u3059\u304b\uff1f",
    blockCustomerText: "\u505c\u6b62\u3059\u308b\u3068\u3001\u3053\u306e\u9867\u5ba2\u306f\u89e3\u9664\u3055\u308c\u308b\u307e\u3067\u30a2\u30d7\u30ea\u306b\u30ed\u30b0\u30a4\u30f3\u3067\u304d\u307e\u305b\u3093\u3002",
    blockCustomerConfirm: "\u505c\u6b62\u3059\u308b",
    unblockCustomerTitle: "\u505c\u6b62\u3092\u89e3\u9664\u3057\u307e\u3059\u304b\uff1f",
    unblockCustomerText: "\u9867\u5ba2\u306f\u518d\u3073\u30a2\u30d7\u30ea\u3092\u5229\u7528\u3067\u304d\u308b\u3088\u3046\u306b\u306a\u308a\u307e\u3059\u3002",
    deleteCustomerTitle: "\u3053\u306e\u9867\u5ba2\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f",
    deleteCustomerText: "\u9867\u5ba2\u306f\u30b4\u30df\u7bb1\u3078\u79fb\u52d5\u3055\u308c\u307e\u3059\u3002\u5b8c\u5168\u524a\u9664\u3055\u308c\u308b\u524d\u306b\u5fa9\u5143\u3067\u304d\u307e\u3059\u3002",
    moveToTrash: "\u30b4\u30df\u7bb1\u3078\u79fb\u52d5",
    customerMovedToTrash: "\u9867\u5ba2\u3092\u30b4\u30df\u7bb1\u3078\u79fb\u52d5\u3057\u307e\u3057\u305f\u3002",
    restoreCustomerTitle: "\u9867\u5ba2\u3092\u5fa9\u5143\u3057\u307e\u3059\u304b\uff1f",
    restoreCustomerText: "\u5fa9\u5143\u3059\u308b\u3068\u3001\u9867\u5ba2\u306f\u518d\u3073\u30a2\u30d7\u30ea\u3092\u5229\u7528\u3067\u304d\u308b\u3088\u3046\u306b\u306a\u308a\u307e\u3059\u3002",
    restoreTrashTitle: "\u3053\u306e\u30c7\u30fc\u30bf\u3092\u5fa9\u5143\u3057\u307e\u3059\u304b\uff1f",
    restoreTrashText: "\u5fa9\u5143\u3059\u308b\u3068\u3001\u30b4\u30df\u7bb1\u304b\u3089\u623b\u3055\u308c\u3001\u5bfe\u5fdc\u3059\u308b\u7ba1\u7406\u753b\u9762\u306b\u518d\u8868\u793a\u3055\u308c\u307e\u3059\u3002",
    customerRestored: "\u9867\u5ba2\u3092\u5fa9\u5143\u3057\u307e\u3057\u305f\u3002",
    permanentDelete: "\u5b8c\u5168\u524a\u9664",
    permanentDeleteCustomerTitle: "\u9867\u5ba2\u3092\u5b8c\u5168\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f",
    permanentDeleteCustomerText: "\u3053\u306e\u64cd\u4f5c\u306f\u5143\u306b\u623b\u305b\u307e\u305b\u3093\u3002\u672c\u5f53\u306b\u524a\u9664\u3057\u3066\u3088\u3044\u5834\u5408\u306e\u307f\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    permanentDeleteTrashTitle: "\u3053\u306e\u30c7\u30fc\u30bf\u3092\u5b8c\u5168\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f",
    permanentDeleteTrashText: "\u3053\u306e\u64cd\u4f5c\u306f\u5143\u306b\u623b\u305b\u307e\u305b\u3093\u3002\u672c\u5f53\u306b\u524a\u9664\u3057\u3066\u3088\u3044\u5834\u5408\u306e\u307f\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    permanentDeletePlanned: "\u5b8c\u5168\u524a\u9664\u6a5f\u80fd\u306f\u5f8c\u3067\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u306b\u63a5\u7d9a\u3055\u308c\u307e\u3059\u3002",
    restorePlanned: "\u5fa9\u5143\u6a5f\u80fd\u306f\u5f8c\u3067\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u306b\u63a5\u7d9a\u3055\u308c\u307e\u3059\u3002",
    permanentDeletedSuccess: "\u5b8c\u5168\u306b\u524a\u9664\u3057\u307e\u3057\u305f\u3002",
    resetPinTitle: "\u9867\u5ba2\u306ePIN\u3092\u30ea\u30bb\u30c3\u30c8\u3057\u307e\u3059\u304b\uff1f",
    resetPinText: "\u73fe\u5728\u306ePIN\u306f\u7121\u52b9\u306b\u306a\u308a\u307e\u3059\u3002\u9867\u5ba2\u306f\u65b0\u3057\u3044PIN\u3092\u8a2d\u5b9a\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059\u3002",
    trashRetentionNote: "\u524a\u9664\u65e5\u304b\u308930\u65e5\u5f8c\u306b\u5b8c\u5168\u524a\u9664\u3055\u308c\u307e\u3059\u3002",
    pinStatus: "PIN\u72b6\u614b",
    pinSet: "PIN\u8a2d\u5b9a\u6e08\u307f",
    pinUnset: "PIN\u672a\u8a2d\u5b9a",
    pinSecurityNote: "PIN\u306f\u6697\u53f7\u5316\u3055\u308c\u3066\u3044\u308b\u305f\u3081\u3001\u7ba1\u7406\u8005\u306f\u73fe\u5728\u306ePIN\u3092\u78ba\u8a8d\u3067\u304d\u307e\u305b\u3093\u3002",
    trash: "\u30b4\u30df\u7bb1",
    trashSubtitle: "\u4e00\u6642\u524a\u9664\u3055\u308c\u305f\u30c7\u30fc\u30bf\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002\u5fa9\u5143\u307e\u305f\u306f\u5b8c\u5168\u524a\u9664\u3067\u304d\u307e\u3059\u3002",
    trashEmpty: "\u30b4\u30df\u7bb1\u306f\u7a7a\u3067\u3059\u3002",
    trashCustomers: "\u9867\u5ba2\u30b4\u30df\u7bb1",
    trashRequests: "\u524a\u9664\u6e08\u307f\u4f9d\u983c",
    trashQuotes: "\u524a\u9664\u6e08\u307f\u898b\u7a4d",
    trashStaff: "\u524a\u9664\u6e08\u307f\u30b9\u30bf\u30c3\u30d5",
    request: "\u4f9d\u983c",
    quote: "\u898b\u7a4d",
    deletedBeforeStatus: "\u524a\u9664\u524d\u30b9\u30c6\u30fc\u30bf\u30b9",
    relatedRequest: "\u95a2\u9023\u4f9d\u983c",
    skillsWork: "\u30b9\u30ad\u30eb\u30fb\u696d\u52d9",
    movedToTrash: "\u30b4\u30df\u7bb1\u3078\u79fb\u52d5\u3057\u307e\u3057\u305f\u3002",
    restoredSuccess: "\u5fa9\u5143\u3057\u307e\u3057\u305f\u3002",
    softDeletePlanned: "\u4e00\u6642\u524a\u9664\u6a5f\u80fd\u306f\u5f8c\u3067\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u306b\u63a5\u7d9a\u3055\u308c\u307e\u3059\u3002",
    approve: "\u627f\u8a8d",
    block: "\u505c\u6b62",
    activate: "\u505c\u6b62\u89e3\u9664",
    delete: "\u524a\u9664",
    restore: "\u5fa9\u5143",
    userHistory: "\u4f9d\u983c\u5c65\u6b74",
    resetPin: "PIN\u30ea\u30bb\u30c3\u30c8",
    requestDetailTitle: "\u4f9d\u983c\u8a73\u7d30",
    requestInfo: "\u4f9d\u983c\u60c5\u5831",
    adminEditSection: "\u5bfe\u5fdc\u5185\u5bb9\u306e\u7de8\u96c6",
    adminNote: "\u7ba1\u7406\u8005\u30e1\u30e2",
    dueAt: "\u5bfe\u5fdc\u671f\u9650",
    saveChanges: "\u5909\u66f4\u3092\u4fdd\u5b58",
    unsavedChanges: "\u672a\u4fdd\u5b58\u306e\u5909\u66f4\u304c\u3042\u308a\u307e\u3059",
    unsavedChangesText: "\u3053\u306e\u307e\u307e\u9589\u3058\u308b\u3068\u3001\u5909\u66f4\u5185\u5bb9\u306f\u4fdd\u5b58\u3055\u308c\u307e\u305b\u3093\u3002",
    stay: "\u623b\u308b",
    closeWithoutSave: "\u4fdd\u5b58\u305b\u305a\u306b\u9589\u3058\u308b",
    savedChanges: "\u5909\u66f4\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    saveChangesFailed: "\u5909\u66f4\u3092\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002",
    noMediaDetail: "\u30e1\u30c7\u30a3\u30a2\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    staffBasicInfo: "\u57fa\u672c\u60c5\u5831",
    staffDepartmentRole: "\u90e8\u9580\u30fb\u5f79\u5272",
    staffSkillsWork: "\u30b9\u30ad\u30eb\u30fb\u5bfe\u5fdc\u53ef\u80fd\u696d\u52d9",
    staffCurrentWorkload: "\u73fe\u5728\u306e\u62c5\u5f53\u72b6\u6cc1",
    staffAutoAssign: "\u81ea\u52d5\u5272\u308a\u5f53\u3066",
    staffRecentHistory: "\u6700\u8fd1\u306e\u5bfe\u5fdc\u5c65\u6b74",
    staffOperations: "\u30b9\u30bf\u30c3\u30d5\u64cd\u4f5c",
    staffEditTitle: "\u30b9\u30bf\u30c3\u30d5\u7de8\u96c6",
    editStaffProfile: "\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u7de8\u96c6",
    staffProfileBasic: "\u57fa\u672c\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb",
    staffOrganization: "\u7d44\u7e54",
    staffAssignableWork: "\u5bfe\u5fdc\u53ef\u80fd\u696d\u52d9",
    internalMemo: "\u5185\u90e8\u30e1\u30e2",
    staffWorkGroup: "\u696d\u52d9\u30b0\u30eb\u30fc\u30d7",
    selectedTags: "\u9078\u629e\u6e08\u307f",
    tagSearchPlaceholder: "\u696d\u52d9\u3092\u691c\u7d22...",
    tagsByDepartment: "\u90e8\u9580\u5225",
    allTags: "\u3059\u3079\u3066",
    outsideDepartmentTags: "\u90e8\u9580\u5916\u30bf\u30b0",
    createContentFromTags: "\u30bf\u30b0\u304b\u3089\u5185\u5bb9\u3092\u4f5c\u6210",
    autoAssignJoin: "\u81ea\u52d5\u5272\u308a\u5f53\u3066\u306b\u53c2\u52a0",
    maxActiveRequests: "\u6700\u5927\u62c5\u5f53\u6570",
    assignPriority: "\u512a\u5148\u5ea6",
    low: "\u4f4e",
    normal: "\u901a\u5e38",
    high: "\u9ad8",
    assignNote: "\u5272\u308a\u5f53\u3066\u30e1\u30e2",
    avatar: "\u30a2\u30d0\u30bf\u30fc",
    area: "\u5bfe\u5fdc\u30a8\u30ea\u30a2",
    areas: "\u5bfe\u5fdc\u30a8\u30ea\u30a2",
    position: "\u5f79\u8077",
    title: "\u80a9\u66f8\u304d",
    skills: "\u30b9\u30ad\u30eb",
    introduction: "\u7d39\u4ecb",
    chooseImage: "\u753b\u50cf\u3092\u9078\u629e",
    uploadImage: "\u753b\u50cf\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9",
    removeImage: "\u753b\u50cf\u3092\u524a\u9664",
    preview: "\u30d7\u30ec\u30d3\u30e5\u30fc",
    staffSaved: "\u30b9\u30bf\u30c3\u30d5\u60c5\u5831\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    staffSaveFailed: "\u30b9\u30bf\u30c3\u30d5\u60c5\u5831\u306e\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
    staffUnsavedCloseTitle: "\u672a\u4fdd\u5b58\u306e\u5909\u66f4\u304c\u3042\u308a\u307e\u3059\u3002\u9589\u3058\u3066\u3082\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f",
    continueEditing: "\u7de8\u96c6\u3092\u7d9a\u3051\u308b",
    noAvatarPreview: "\u30d7\u30ec\u30d3\u30e5\u30fc",
    pauseStaff: "\u4f11\u6b62",
    reactivateStaff: "\u7a3c\u50cd\u518d\u958b",
    noAssignedRequests: "\u73fe\u5728\u62c5\u5f53\u4e2d\u306e\u4f9d\u983c\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    noStaffHistory: "\u5bfe\u5fdc\u5c65\u6b74\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    autoAssignPlanned: "\u5f8c\u3067\u9023\u643a\u4e88\u5b9a\u3002",
    currentAssignments: "\u4f9d\u983c\u5bfe\u5fdc\u4e2d",
    overdueAssigned: "\u671f\u9650\u8d85\u904e",
    staffId: "\u30b9\u30bf\u30c3\u30d5ID"
  });

  Object.assign(i18n.vi, {
    basicInfo: "Th\u00f4ng tin c\u01a1 b\u1ea3n",
    contactInfo: "Th\u00f4ng tin li\u00ean h\u1ec7",
    accountSecurity: "T\u00e0i kho\u1ea3n & b\u1ea3o m\u1eadt",
    requestSummary: "T\u00f3m t\u1eaft y\u00eau c\u1ea7u",
    accountActions: "Thao t\u00e1c t\u00e0i kho\u1ea3n",
    recentRequests: "L\u1ecbch s\u1eed y\u00eau c\u1ea7u g\u1ea7n \u0111\u00e2y",
    customerId: "ID kh\u00e1ch h\u00e0ng",
    customerName: "T\u00ean kh\u00e1ch",
    displayName: "T\u00ean hi\u1ec3n th\u1ecb",
    company: "C\u00f4ng ty",
    customerType: "Lo\u1ea1i kh\u00e1ch",
    status: "Tr\u1ea1ng th\u00e1i",
    createdAt: "Ng\u00e0y \u0111\u0103ng k\u00fd",
    updatedAt: "Ng\u00e0y c\u1eadp nh\u1eadt",
    lastLoginAt: "\u0110\u0103ng nh\u1eadp cu\u1ed1i",
    profileCompleted: "H\u1ed3 s\u01a1 ho\u00e0n t\u1ea5t",
    phone: "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    email: "Email",
    contact: "Ng\u01b0\u1eddi li\u00ean h\u1ec7",
    address: "\u0110\u1ecba ch\u1ec9",
    province: "T\u1ec9nh/khu v\u1ef1c",
    projectName: "T\u00ean c\u00f4ng tr\u00ecnh",
    systemInfo: "Th\u00f4ng tin h\u1ec7 th\u1ed1ng",
    quoteRequests: "Y\u00eau c\u1ea7u b\u00e1o gi\u00e1",
    deletedAt: "Ng\u00e0y x\u00f3a",
    confirmBlock: "B\u1ea1n mu\u1ed1n kh\u00f3a t\u00e0i kho\u1ea3n kh\u00e1ch h\u00e0ng n\u00e0y?",
    confirmResetPin: "B\u1ea1n mu\u1ed1n reset PIN cho kh\u00e1ch h\u00e0ng n\u00e0y?",
    backendPlanned: "Ch\u1ee9c n\u0103ng n\u00e0y s\u1ebd \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i backend sau.",
    cancel: "H\u1ee7y",
    confirm: "X\u00e1c nh\u1eadn",
    blockCustomerTitle: "Kh\u00f3a t\u00e0i kho\u1ea3n kh\u00e1ch h\u00e0ng?",
    blockCustomerText: "Kh\u00e1ch h\u00e0ng s\u1ebd kh\u00f4ng th\u1ec3 \u0111\u0103ng nh\u1eadp v\u00e0 s\u1eed d\u1ee5ng app cho \u0111\u1ebfn khi \u0111\u01b0\u1ee3c m\u1edf kh\u00f3a.",
    blockCustomerConfirm: "X\u00e1c nh\u1eadn kh\u00f3a",
    unblockCustomerTitle: "M\u1edf kh\u00f3a kh\u00e1ch h\u00e0ng?",
    unblockCustomerText: "Kh\u00e1ch h\u00e0ng s\u1ebd \u0111\u01b0\u1ee3c k\u00edch ho\u1ea1t l\u1ea1i v\u00e0 c\u00f3 th\u1ec3 s\u1eed d\u1ee5ng app.",
    deleteCustomerTitle: "X\u00f3a kh\u00e1ch h\u00e0ng n\u00e0y?",
    deleteCustomerText: "Kh\u00e1ch h\u00e0ng s\u1ebd \u0111\u01b0\u1ee3c chuy\u1ec3n v\u00e0o th\u00f9ng r\u00e1c. B\u1ea1n c\u00f3 th\u1ec3 kh\u00f4i ph\u1ee5c trong v\u00f2ng 30 ng\u00e0y tr\u01b0\u1edbc khi x\u00f3a v\u0129nh vi\u1ec5n.",
    moveToTrash: "Chuy\u1ec3n v\u00e0o th\u00f9ng r\u00e1c",
    customerMovedToTrash: "Kh\u00e1ch h\u00e0ng \u0111\u00e3 \u0111\u01b0\u1ee3c chuy\u1ec3n v\u00e0o th\u00f9ng r\u00e1c.",
    restoreCustomerTitle: "Kh\u00f4i ph\u1ee5c kh\u00e1ch h\u00e0ng?",
    restoreCustomerText: "Kh\u00e1ch h\u00e0ng s\u1ebd \u0111\u01b0\u1ee3c k\u00edch ho\u1ea1t l\u1ea1i v\u00e0 c\u00f3 th\u1ec3 s\u1eed d\u1ee5ng app n\u1ebfu t\u00e0i kho\u1ea3n h\u1ee3p l\u1ec7.",
    restoreTrashTitle: "Kh\u00f4i ph\u1ee5c d\u1eef li\u1ec7u n\u00e0y?",
    restoreTrashText: "D\u1eef li\u1ec7u s\u1ebd \u0111\u01b0\u1ee3c \u0111\u01b0a ra kh\u1ecfi th\u00f9ng r\u00e1c v\u00e0 hi\u1ec3n th\u1ecb l\u1ea1i trong m\u00e0n qu\u1ea3n l\u00fd t\u01b0\u01a1ng \u1ee9ng.",
    customerRestored: "Kh\u00f4i ph\u1ee5c kh\u00e1ch h\u00e0ng th\u00e0nh c\u00f4ng.",
    permanentDelete: "X\u00f3a v\u0129nh vi\u1ec5n",
    permanentDeleteCustomerTitle: "X\u00f3a v\u0129nh vi\u1ec5n kh\u00e1ch h\u00e0ng?",
    permanentDeleteCustomerText: "Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 kh\u00f4i ph\u1ee5c. Ch\u1ec9 th\u1ef1c hi\u1ec7n khi ch\u1eafc ch\u1eafn kh\u00f4ng c\u1ea7n gi\u1eef d\u1eef li\u1ec7u kh\u00e1ch h\u00e0ng n\u00e0y.",
    permanentDeleteTrashTitle: "X\u00f3a v\u0129nh vi\u1ec5n d\u1eef li\u1ec7u n\u00e0y?",
    permanentDeleteTrashText: "Thao t\u00e1c n\u00e0y kh\u00f4ng th\u1ec3 kh\u00f4i ph\u1ee5c. Ch\u1ec9 th\u1ef1c hi\u1ec7n khi ch\u1eafc ch\u1eafn kh\u00f4ng c\u1ea7n gi\u1eef d\u1eef li\u1ec7u n\u00e0y.",
    permanentDeletePlanned: "Ch\u1ee9c n\u0103ng x\u00f3a v\u0129nh vi\u1ec5n s\u1ebd \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i backend sau.",
    restorePlanned: "Ch\u1ee9c n\u0103ng kh\u00f4i ph\u1ee5c s\u1ebd \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i backend sau.",
    permanentDeletedSuccess: "\u0110\u00e3 x\u00f3a v\u0129nh vi\u1ec5n.",
    resetPinTitle: "Reset PIN kh\u00e1ch h\u00e0ng?",
    resetPinText: "PIN hi\u1ec7n t\u1ea1i s\u1ebd b\u1ecb v\u00f4 hi\u1ec7u h\u00f3a. Kh\u00e1ch h\u00e0ng c\u1ea7n thi\u1ebft l\u1eadp PIN m\u1edbi ho\u1eb7c d\u00f9ng PIN t\u1ea1m n\u1ebfu backend h\u1ed7 tr\u1ee3.",
    trashRetentionNote: "S\u1ebd x\u00f3a v\u0129nh vi\u1ec5n sau 30 ng\u00e0y k\u1ec3 t\u1eeb ng\u00e0y x\u00f3a.",
    pinStatus: "Tr\u1ea1ng th\u00e1i PIN",
    pinSet: "\u0110\u00e3 thi\u1ebft l\u1eadp PIN",
    pinUnset: "Ch\u01b0a thi\u1ebft l\u1eadp PIN",
    pinSecurityNote: "PIN \u0111\u01b0\u1ee3c m\u00e3 h\u00f3a, admin kh\u00f4ng th\u1ec3 xem PIN hi\u1ec7n t\u1ea1i.",
    trash: "Th\u00f9ng r\u00e1c",
    trashSubtitle: "Qu\u1ea3n l\u00fd d\u1eef li\u1ec7u \u0111\u00e3 x\u00f3a t\u1ea1m. B\u1ea1n c\u00f3 th\u1ec3 kh\u00f4i ph\u1ee5c ho\u1eb7c x\u00f3a v\u0129nh vi\u1ec5n.",
    trashEmpty: "Th\u00f9ng r\u00e1c \u0111ang tr\u1ed1ng.",
    trashCustomers: "Th\u00f9ng r\u00e1c kh\u00e1ch h\u00e0ng",
    trashRequests: "Y\u00eau c\u1ea7u \u0111\u00e3 x\u00f3a",
    trashQuotes: "B\u00e1o gi\u00e1 \u0111\u00e3 x\u00f3a",
    trashStaff: "Nh\u00e2n vi\u00ean \u0111\u00e3 x\u00f3a",
    request: "Y\u00eau c\u1ea7u",
    quote: "B\u00e1o gi\u00e1",
    deletedBeforeStatus: "Tr\u1ea1ng th\u00e1i tr\u01b0\u1edbc khi x\u00f3a",
    relatedRequest: "Y\u00eau c\u1ea7u li\u00ean quan",
    skillsWork: "K\u1ef9 n\u0103ng / c\u00f4ng vi\u1ec7c",
    movedToTrash: "\u0110\u00e3 chuy\u1ec3n v\u00e0o th\u00f9ng r\u00e1c.",
    restoredSuccess: "Kh\u00f4i ph\u1ee5c th\u00e0nh c\u00f4ng.",
    softDeletePlanned: "Ch\u1ee9c n\u0103ng x\u00f3a t\u1ea1m s\u1ebd \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i backend sau.",
    approve: "Duy\u1ec7t",
    block: "Kh\u00f3a",
    activate: "M\u1edf kh\u00f3a",
    delete: "X\u00f3a",
    restore: "Kh\u00f4i ph\u1ee5c",
    userHistory: "L\u1ecbch s\u1eed y\u00eau c\u1ea7u",
    resetPin: "Reset PIN",
    requestDetailTitle: "Chi ti\u1ebft y\u00eau c\u1ea7u",
    requestInfo: "Th\u00f4ng tin y\u00eau c\u1ea7u",
    adminEditSection: "\u0110i\u1ec1u ch\u1ec9nh x\u1eed l\u00fd",
    adminNote: "Ghi ch\u00fa admin",
    dueAt: "H\u1ea1n x\u1eed l\u00fd",
    saveChanges: "L\u01b0u thay \u0111\u1ed5i",
    unsavedChanges: "C\u00f3 thay \u0111\u1ed5i ch\u01b0a l\u01b0u",
    unsavedChangesText: "N\u1ebfu \u0111\u00f3ng b\u00e2y gi\u1edd, c\u00e1c thay \u0111\u1ed5i s\u1ebd b\u1ecb m\u1ea5t.",
    stay: "\u1ede l\u1ea1i",
    closeWithoutSave: "\u0110\u00f3ng kh\u00f4ng l\u01b0u",
    savedChanges: "\u0110\u00e3 l\u01b0u thay \u0111\u1ed5i.",
    saveChangesFailed: "Kh\u00f4ng th\u1ec3 l\u01b0u thay \u0111\u1ed5i. Vui l\u00f2ng th\u1eed l\u1ea1i.",
    noMediaDetail: "Kh\u00f4ng c\u00f3 media.",
    staffBasicInfo: "Th\u00f4ng tin c\u01a1 b\u1ea3n",
    staffDepartmentRole: "B\u1ed9 ph\u1eadn & vai tr\u00f2",
    staffSkillsWork: "K\u1ef9 n\u0103ng / c\u00f4ng vi\u1ec7c c\u00f3 th\u1ec3 nh\u1eadn",
    staffCurrentWorkload: "T\u1ea3i c\u00f4ng vi\u1ec7c hi\u1ec7n t\u1ea1i",
    staffAutoAssign: "T\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng",
    staffRecentHistory: "L\u1ecbch s\u1eed x\u1eed l\u00fd g\u1ea7n \u0111\u00e2y",
    staffOperations: "Thao t\u00e1c nh\u00e2n vi\u00ean",
    staffEditTitle: "Ch\u1ec9nh s\u1eeda staff",
    editStaffProfile: "Ch\u1ec9nh s\u1eeda h\u1ed3 s\u01a1",
    staffProfileBasic: "H\u1ed3 s\u01a1 c\u01a1 b\u1ea3n",
    staffOrganization: "T\u1ed5 ch\u1ee9c",
    staffAssignableWork: "C\u00f4ng vi\u1ec7c c\u00f3 th\u1ec3 ph\u1ee5 tr\u00e1ch",
    internalMemo: "Ghi ch\u00fa n\u1ed9i b\u1ed9",
    staffWorkGroup: "Nh\u00f3m c\u00f4ng vi\u1ec7c",
    selectedTags: "\u0110\u00e3 ch\u1ecdn",
    tagSearchPlaceholder: "T\u00ecm c\u00f4ng vi\u1ec7c...",
    tagsByDepartment: "Theo b\u1ed9 ph\u1eadn",
    allTags: "T\u1ea5t c\u1ea3",
    outsideDepartmentTags: "Tag ngo\u00e0i b\u1ed9 ph\u1eadn",
    createContentFromTags: "T\u1ea1o n\u1ed9i dung t\u1eeb tag",
    autoAssignJoin: "Tham gia t\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng",
    maxActiveRequests: "T\u1ea3i t\u1ed1i \u0111a",
    assignPriority: "\u01afu ti\u00ean nh\u1eadn vi\u1ec7c",
    low: "Th\u1ea5p",
    normal: "Th\u01b0\u1eddng",
    high: "Cao",
    assignNote: "Ghi ch\u00fa \u0111i\u1ec1u ph\u1ed1i",
    avatar: "\u1ea2nh \u0111\u1ea1i di\u1ec7n",
    area: "Khu v\u1ef1c",
    areas: "Khu v\u1ef1c",
    position: "Ch\u1ee9c v\u1ee5",
    title: "Danh x\u01b0ng",
    skills: "K\u1ef9 n\u0103ng",
    introduction: "Gi\u1edbi thi\u1ec7u",
    chooseImage: "Ch\u1ecdn \u1ea3nh",
    uploadImage: "T\u1ea3i \u1ea3nh",
    removeImage: "X\u00f3a \u1ea3nh",
    preview: "Xem tr\u01b0\u1edbc",
    staffSaved: "\u0110\u00e3 l\u01b0u th\u00f4ng tin staff.",
    staffSaveFailed: "L\u01b0u staff th\u1ea5t b\u1ea1i.",
    staffUnsavedCloseTitle: "B\u1ea1n c\u00f3 thay \u0111\u1ed5i ch\u01b0a l\u01b0u. V\u1eabn \u0111\u00f3ng?",
    continueEditing: "Ti\u1ebfp t\u1ee5c ch\u1ec9nh s\u1eeda",
    noAvatarPreview: "Xem tr\u01b0\u1edbc",
    pauseStaff: "T\u1ea1m ngh\u1ec9",
    reactivateStaff: "K\u00edch ho\u1ea1t l\u1ea1i",
    noAssignedRequests: "Ch\u01b0a c\u00f3 y\u00eau c\u1ea7u \u0111ang ph\u1ee5 tr\u00e1ch.",
    noStaffHistory: "Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u x\u1eed l\u00fd.",
    autoAssignPlanned: "S\u1ebd li\u00ean k\u1ebft sau.",
    currentAssignments: "\u0110ang ph\u1ee5 tr\u00e1ch",
    overdueAssigned: "Qu\u00e1 h\u1ea1n",
    staffId: "ID nh\u00e2n vi\u00ean"
  });

  Object.assign(i18n.ja, {
    workMaster: "業務マスタ",
    department: "部門",
    workGroup: "業務グループ",
    workGroups: "業務グループ",
    workType: "業務内容",
    workTypes: "業務内容",
    addDepartment: "部門を追加",
    addWorkGroup: "業務グループを追加",
    addWorkType: "業務内容を追加",
    nameVi: "ベトナム語名",
    nameJa: "日本語名",
    code: "コード",
    descriptionVi: "ベトナム語説明",
    descriptionJa: "日本語説明",
    activeStatus: "ステータス",
    active: "使用中",
    hidden: "非表示",
    sortOrder: "並び替え",
    show: "表示",
    hide: "非表示",
    workMasterUpdated: "業務リストを更新しました。",
    workTypeAdded: "業務内容を追加しました。",
    relatedDataWarning: "この部門には関連データがあります。完全削除ではなく非表示にできます。",
    selectDepartment: "部門を選択",
    selectWorkGroup: "業務グループを選択",
    noWorkGroup: "グループなし",
    searchWorkMaster: "検索",
    description: "説明",
    staffClassification: "スタッフ分類",
    primaryDepartment: "主部門",
    staffAssignment: "業務割り当て",
    staffWorkFlowHelp: "部門を選択し、その後スタッフが対応できる業務内容を選択してください。",
    workStepDepartment: "ステップ1：部門を選択",
    noDepartmentsInMaster: "部門がありません。設定画面で登録してください。",
    addDepartmentQuick: "+ 部門を追加",
    manageDepartments: "部門を管理",
    autoAssign: "自動割り当て",
    autoAssignParticipating: "参加中",
    autoAssignNotParticipating: "不参加",
    autoAssignHelp: "オンにすると、業務内容が一致した場合にこのスタッフが自動割り当ての対象になります。",
    chooseDepartmentFirst: "業務内容を表示するには、部門を選択してください。",
    workStepPick: "ステップ2：業務内容を選択",
    staffDescriptionSection: "スタッフ説明",
    selectedDepartment: "選択中の部門",
    changeDepartment: "部門を変更",
    workTypeSearchPlaceholder: "業務内容を検索...",
    noWorkTypesInDepartment: "この部門には業務内容がありません。設定画面で登録してください。",
    openWorkMaster: "業務マスタを開く",
    addWorkTypeQuick: "+ 業務内容を追加",
    manageWorkTypes: "業務内容を管理",
    outsideCurrentDepartment: "現在の部門外",
    createContentFromSelectedWork: "選択業務から担当内容を作成",
    manageWorkMaster: "業務マスタを管理",
    noSelectedWorkTypes: "業務がありません",
    viewAllWorkTypes: "すべて表示",
    overwriteWorkContentTitle: "担当内容を上書きしますか？",
    overwriteWorkContentText: "現在の担当内容は選択業務の一覧で置き換えられます。",
    selectedCount: "選択済み",
    itemCountSuffix: "件",
    staffDescription: "スタッフの得意分野・説明",
    staffDescriptionPlaceholder: "例：電気図面設計が得意で、施工図・竣工図にも対応できます。",
    createDescriptionFromSelectedWork: "選択業務から説明を作成",
    staffDetailNotes: "説明・メモ",
    noStaffDescription: "説明はありません。",
    noInternalMemo: "メモはありません。",
    showMore: "もっと見る",
    collapse: "閉じる"
  });

  Object.assign(i18n.vi, {
    workMaster: "Danh mục công việc",
    department: "Bộ phận",
    workGroup: "Nhóm công việc",
    workGroups: "Nhóm công việc",
    workType: "Nội dung công việc",
    workTypes: "Nội dung công việc",
    addDepartment: "Thêm bộ phận",
    addWorkGroup: "Thêm nhóm công việc",
    addWorkType: "Thêm nội dung công việc",
    nameVi: "Tên tiếng Việt",
    nameJa: "Tên tiếng Nhật",
    code: "Mã",
    descriptionVi: "Mô tả tiếng Việt",
    descriptionJa: "Mô tả tiếng Nhật",
    activeStatus: "Trạng thái",
    active: "Đang sử dụng",
    hidden: "Đã ẩn",
    sortOrder: "Sắp xếp",
    show: "Hiện",
    hide: "Ẩn",
    workMasterUpdated: "Danh sách công việc đã được cập nhật.",
    workTypeAdded: "Nội dung công việc đã được thêm.",
    relatedDataWarning: "Bộ phận này đang có dữ liệu liên quan. Bạn chỉ có thể ẩn thay vì xóa vĩnh viễn.",
    selectDepartment: "Chọn bộ phận",
    selectWorkGroup: "Chọn nhóm công việc",
    noWorkGroup: "Không có nhóm",
    searchWorkMaster: "Tìm kiếm",
    description: "Mô tả",
    staffClassification: "Phân loại nhân viên",
    primaryDepartment: "Bộ phận chính",
    staffAssignment: "Phân công công việc",
    staffWorkFlowHelp: "Chọn bộ phận, sau đó chọn các nội dung công việc mà nhân viên có thể phụ trách.",
    workStepDepartment: "Bước 1: Chọn bộ phận",
    noDepartmentsInMaster: "Chưa có bộ phận. Vui lòng thiết lập trong Cài đặt.",
    addDepartmentQuick: "+ Thêm bộ phận",
    manageDepartments: "Quản lý bộ phận",
    autoAssign: "Tự động phân công",
    autoAssignParticipating: "Đang tham gia",
    autoAssignNotParticipating: "Không tham gia",
    autoAssignHelp: "Khi bật, nhân viên này có thể được hệ thống tự động phân công nếu nội dung công việc phù hợp.",
    chooseDepartmentFirst: "Vui lòng chọn bộ phận để hiển thị nội dung công việc.",
    workStepPick: "Bước 2: Chọn nội dung công việc",
    staffDescriptionSection: "Mô tả nhân viên",
    selectedDepartment: "Bộ phận đang chọn",
    changeDepartment: "Đổi bộ phận",
    workTypeSearchPlaceholder: "Tìm nội dung công việc...",
    noWorkTypesInDepartment: "Bộ phận này chưa có nội dung công việc. Vui lòng thiết lập trong Cài đặt.",
    openWorkMaster: "Mở Danh mục công việc",
    addWorkTypeQuick: "+ Thêm nội dung công việc",
    manageWorkTypes: "Quản lý nội dung công việc",
    outsideCurrentDepartment: "Ngoài bộ phận hiện tại",
    createContentFromSelectedWork: "Tạo nội dung phụ trách từ công việc đã chọn",
    manageWorkMaster: "Quản lý danh mục công việc",
    noSelectedWorkTypes: "Chưa có công việc nào",
    viewAllWorkTypes: "Xem tất cả",
    overwriteWorkContentTitle: "Ghi đè nội dung phụ trách?",
    overwriteWorkContentText: "Nội dung phụ trách hiện tại sẽ được thay bằng danh sách công việc đã chọn.",
    selectedCount: "Đã chọn",
    itemCountSuffix: "công việc",
    staffDescription: "Mô tả năng lực nhân viên",
    staffDescriptionPlaceholder: "Ví dụ: Chuyên thiết kế bản vẽ điện, có thể xử lý bản vẽ thi công và hoàn công.",
    createDescriptionFromSelectedWork: "Tạo mô tả từ công việc đã chọn",
    staffDetailNotes: "Mô tả & ghi chú",
    noStaffDescription: "Chưa có mô tả.",
    noInternalMemo: "Không có ghi chú.",
    showMore: "Xem thêm",
    collapse: "Thu gọn"
  });

  Object.assign(i18n.ja, {
    assignedCount: "\u5bfe\u5fdc\u6e08\u307f\u4ef6\u6570",
    changeStaffStatus: "\u30b9\u30c6\u30fc\u30bf\u30b9\u5909\u66f4",
    staffStatusAction: "\u30b9\u30c6\u30fc\u30bf\u30b9 / \u64cd\u4f5c",
    pauseStaffConfirmTitle: "\u30b9\u30bf\u30c3\u30d5\u3092\u4f11\u6b62\u4e2d\u306b\u3057\u307e\u3059\u304b\uff1f",
    pauseStaffConfirmText: "\u4f11\u6b62\u4e2d\u306e\u30b9\u30bf\u30c3\u30d5\u306f\u81ea\u52d5\u5272\u308a\u5f53\u3066\u306e\u5bfe\u8c61\u5916\u306b\u306a\u308a\u307e\u3059\u3002",
    pauseStaffConfirmLabel: "\u4f11\u6b62\u3059\u308b",
    reactivateStaffConfirmTitle: "\u30b9\u30bf\u30c3\u30d5\u3092\u518d\u958b\u3057\u307e\u3059\u304b\uff1f",
    reactivateStaffConfirmText: "\u518d\u958b\u3059\u308b\u3068\u3001\u3053\u306e\u30b9\u30bf\u30c3\u30d5\u306f\u518d\u3073\u5229\u7528\u3067\u304d\u307e\u3059\u3002\u81ea\u52d5\u5272\u308a\u5f53\u3066\u304c\u6709\u52b9\u306a\u5834\u5408\u3001\u6761\u4ef6\u306b\u4e00\u81f4\u3059\u308b\u3068\u5272\u308a\u5f53\u3066\u5bfe\u8c61\u306b\u306a\u308a\u307e\u3059\u3002",
    reactivateStaffConfirmLabel: "\u518d\u958b\u3059\u308b",
    noSelectedWorkTypes: "\u696d\u52d9\u304c\u3042\u308a\u307e\u305b\u3093\u3002",
    staffWorkTypes: "\u5bfe\u5fdc\u53ef\u80fd\u696d\u52d9"
  });

  Object.assign(i18n.vi, {
    assignedCount: "S\u1ed1 y\u00eau c\u1ea7u \u0111\u00e3 ph\u1ee5 tr\u00e1ch",
    changeStaffStatus: "\u0110\u1ed5i tr\u1ea1ng th\u00e1i",
    staffStatusAction: "Tr\u1ea1ng th\u00e1i / Thao t\u00e1c",
    pauseStaffConfirmTitle: "Chuy\u1ec3n nh\u00e2n vi\u00ean sang t\u1ea1m ngh\u1ec9?",
    pauseStaffConfirmText: "Nh\u00e2n vi\u00ean n\u00e0y s\u1ebd kh\u00f4ng \u0111\u01b0\u1ee3c t\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng trong th\u1eddi gian t\u1ea1m ngh\u1ec9.",
    pauseStaffConfirmLabel: "X\u00e1c nh\u1eadn t\u1ea1m ngh\u1ec9",
    reactivateStaffConfirmTitle: "K\u00edch ho\u1ea1t l\u1ea1i nh\u00e2n vi\u00ean?",
    reactivateStaffConfirmText: "Nh\u00e2n vi\u00ean n\u00e0y c\u00f3 th\u1ec3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng l\u1ea1i trong h\u1ec7 th\u1ed1ng. N\u1ebfu b\u1eadt t\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng, nh\u00e2n vi\u00ean s\u1ebd \u0111\u01b0\u1ee3c x\u00e9t ph\u00e2n c\u00f4ng khi ph\u00f9 h\u1ee3p.",
    reactivateStaffConfirmLabel: "K\u00edch ho\u1ea1t",
    noSelectedWorkTypes: "Ch\u01b0a c\u00f3 c\u00f4ng vi\u1ec7c n\u00e0o.",
    staffWorkTypes: "C\u00f4ng vi\u1ec7c c\u00f3 th\u1ec3 ph\u1ee5 tr\u00e1ch"
  });

  Object.assign(requestStatusMap, {
    untreated: "\u672a\u5bfe\u5fdc",
    contacted: "\u9023\u7d61\u6e08",
    site_done: "\u73fe\u5730\u6e08",
    quoted: "\u898b\u7a4d",
    ordered: "\u53d7\u6ce8",
    completed: "\u5b8c\u4e86",
    lost: "\u5931\u6ce8"
  });

  Object.assign(requestStatusMapVi, {
    untreated: "Ch\u01b0a x\u1eed l\u00fd",
    contacted: "\u0110\u00e3 li\u00ean h\u1ec7",
    site_done: "\u0110\u00e3 kh\u1ea3o s\u00e1t",
    quoted: "B\u00e1o gi\u00e1",
    ordered: "\u0110\u00e3 nh\u1eadn \u0111\u01a1n",
    completed: "Ho\u00e0n th\u00e0nh",
    lost: "M\u1ea5t \u0111\u01a1n"
  });

  Object.assign(userStatusMap, {
    pendingApproval: "\u627f\u8a8d\u5f85\u3061",
    pending: "\u627f\u8a8d\u5f85\u3061",
    active: "\u6709\u52b9",
    blocked: "\u505c\u6b62",
    deleted: "\u524a\u9664\u6e08\u307f"
  });

  Object.assign(staffStatusMap, {
    active: "\u7a3c\u50cd\u4e2d",
    busy: "\u5bfe\u5fdc\u4e2d",
    off: "\u4f11\u6b62\u4e2d",
    inactive: "\u505c\u6b62\u4e2d",
    deleted: "\u524a\u9664\u6e08\u307f"
  });

  const views = [
    ["dashboard", "dashboard", "⌂"],
    ["requests", "requests", "▤"],
    ["customers", "customers", "◉"],
    ["staff", "staff", "♙"],
    ["quotes", "quotes", "▣"],
    ["notifications", "notifications", "⌁"],
    ["trash", "trash", "♻"],
    ["settings", "settings", "⚙"]
  ];

  Object.assign(i18n.ja, {
    requests: "\u4f9d\u983c\u7ba1\u7406",
    requestSubtitle: "\u9867\u5ba2\u304b\u3089\u306e\u4f9d\u983c\u3092\u691c\u7d22\u3001\u7d5e\u308a\u8fbc\u307f\u3001\u5bfe\u5fdc\u3067\u304d\u307e\u3059\u3002",
    search: "\u691c\u7d22...",
    searchButton: "\u691c\u7d22",
    export: "\u30a8\u30af\u30b9\u30dd\u30fc\u30c8",
    newRequest: "\u65b0\u898f\u4f9d\u983c\u767b\u9332",
    tableFormat: "\u8868\u5f62\u5f0f",
    kanbanView: "\u30ab\u30f3\u30d0\u30f3",
    all: "\u3059\u3079\u3066",
    id: "ID",
    customer: "\u9867\u5ba2",
    content: "\u5185\u5bb9",
    urgency: "\u7dca\u6025\u5ea6",
    assignee: "\u62c5\u5f53\u8005",
    status: "\u30b9\u30c6\u30fc\u30bf\u30b9",
    elapsed: "\u7d4c\u904e\u6642\u9593",
    deadline: "\u5bfe\u5fdc\u671f\u9650",
    mediaFilter: "\u30e1\u30c7\u30a3\u30a2",
    mediaCount: "\u30e1\u30c7\u30a3\u30a2",
    amount: "\u91d1\u984d",
    action: "\u64cd\u4f5c",
    departmentFilter: "\u90e8\u9580",
    allRequestDepartments: "\u3059\u3079\u3066\u306e\u90e8\u9580",
    departmentConstruction: "\u5de5\u52d9\u90e8",
    departmentExecutive: "\u4ee3\u8868\u30fb\u5f79\u54e1",
    departmentSales: "\u55b6\u696d\u90e8",
    departmentDesign: "\u8a2d\u8a08\u90e8",
    departmentOperation: "\u696d\u52d9\u90e8",
    departmentMaintenance: "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u90e8",
    departmentSurvey: "\u8abf\u67fb\u90e8",
    departmentOther: "\u305d\u306e\u4ed6",
    prioritySort: "\u512a\u5148\u9806",
    newest: "\u65b0\u3057\u3044\u9806",
    oldest: "\u53e4\u3044\u9806",
    overdueFirst: "\u671f\u9650\u8d85\u904e\u512a\u5148",
    hasMedia: "\u30e1\u30c7\u30a3\u30a2\u3042\u308a",
    noMedia: "\u30e1\u30c7\u30a3\u30a2\u306a\u3057",
    unjudged: "\u672a\u5224\u5b9a",
    urgencyUrgent: "\u7dca\u6025",
    urgencyHigh: "\u9ad8",
    urgencyMedium: "\u4e2d",
    urgencyLow: "\u4f4e",
    noRequests: "\u4f9d\u983c\u306f\u3042\u308a\u307e\u305b\u3093\u3002",
    loadRequestsError: "\u4f9d\u983c\u4e00\u89a7\u3092\u8aad\u307f\u8fbc\u3081\u307e\u305b\u3093"
  });

  Object.assign(i18n.vi, {
    requests: "Qu\u1ea3n l\u00fd y\u00eau c\u1ea7u",
    requestSubtitle: "Theo d\u00f5i, l\u1ecdc v\u00e0 x\u1eed l\u00fd c\u00e1c y\u00eau c\u1ea7u c\u1ee7a kh\u00e1ch h\u00e0ng.",
    search: "T\u00ecm ki\u1ebfm...",
    searchButton: "T\u00ecm ki\u1ebfm",
    export: "Xu\u1ea5t d\u1eef li\u1ec7u",
    newRequest: "T\u1ea1o y\u00eau c\u1ea7u m\u1edbi",
    tableFormat: "D\u1ea1ng b\u1ea3ng",
    kanbanView: "Kanban",
    all: "T\u1ea5t c\u1ea3",
    id: "ID",
    customer: "Kh\u00e1ch h\u00e0ng",
    content: "N\u1ed9i dung",
    urgency: "\u0110\u1ed9 kh\u1ea9n",
    assignee: "Ph\u1ee5 tr\u00e1ch",
    status: "Tr\u1ea1ng th\u00e1i",
    elapsed: "Th\u1eddi gian ch\u1edd",
    deadline: "H\u1ea1n x\u1eed l\u00fd",
    mediaFilter: "Media",
    mediaCount: "Media",
    amount: "S\u1ed1 ti\u1ec1n",
    action: "Thao t\u00e1c",
    departmentFilter: "B\u1ed9 ph\u1eadn",
    allRequestDepartments: "T\u1ea5t c\u1ea3 b\u1ed9 ph\u1eadn",
    departmentConstruction: "B\u1ed9 thi c\u00f4ng",
    departmentExecutive: "Ban gi\u00e1m \u0111\u1ed1c",
    departmentSales: "B\u1ed9 kinh doanh",
    departmentDesign: "B\u1ed9 thi\u1ebft k\u1ebf",
    departmentOperation: "B\u1ed9 nghi\u1ec7p v\u1ee5",
    departmentMaintenance: "B\u1ed9 b\u1ea3o tr\u00ec",
    departmentSurvey: "B\u1ed9 kh\u1ea3o s\u00e1t",
    departmentOther: "B\u1ed9 kh\u00e1c",
    prioritySort: "\u01afu ti\u00ean x\u1eed l\u00fd",
    newest: "M\u1edbi nh\u1ea5t",
    oldest: "C\u0169 nh\u1ea5t",
    overdueFirst: "Qu\u00e1 h\u1ea1n tr\u01b0\u1edbc",
    hasMedia: "C\u00f3 media",
    noMedia: "Kh\u00f4ng media",
    unjudged: "Ch\u01b0a \u0111\u00e1nh gi\u00e1",
    urgencyUrgent: "Kh\u1ea9n c\u1ea5p",
    urgencyHigh: "Cao",
    urgencyMedium: "Trung b\u00ecnh",
    urgencyLow: "Th\u1ea5p",
    noRequests: "Kh\u00f4ng c\u00f3 y\u00eau c\u1ea7u.",
    loadRequestsError: "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch y\u00eau c\u1ea7u"
  });

  Object.assign(i18n.ja, {
    settingsSystemTitle: "\u30b7\u30b9\u30c6\u30e0\u8a2d\u5b9a",
    settingsSystemSubtitle: "\u30a2\u30d7\u30ea\u5168\u4f53\u3067\u5229\u7528\u3059\u308b\u5171\u901a\u8a2d\u5b9a\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",
    settingsOverview: "\u6982\u8981",
    settingsOverviewSub: "\u4e3b\u8981\u8a2d\u5b9a",
    settingsStaffWork: "\u30b9\u30bf\u30c3\u30d5\u30fb\u696d\u52d9",
    settingsStaffWorkSub: "\u90e8\u9580\u3001\u696d\u52d9\u5185\u5bb9",
    settingsAiAssist: "AI\u30b5\u30dd\u30fc\u30c8",
    settingsAiAssistSub: "AI\u5206\u6790\u3001\u62c5\u5f53\u8005\u5272\u308a\u5f53\u3066",
    settingsProcessChart: "\u4f9d\u983c\u51e6\u7406\u30d5\u30ed\u30fc\u56f3",
    settingsProcessChartSub: "\u53d7\u4ed8\u3001\u51e6\u7406\u3001\u898b\u7a4d\u3001\u5b8c\u4e86",
    settingsRequestStatus: "\u4f9d\u983c\u30fb\u30b9\u30c6\u30fc\u30bf\u30b9",
    settingsRequestStatusSub: "\u4f9d\u983c\u51e6\u7406\u30d5\u30ed\u30fc",
    settingsCustomers: "\u9867\u5ba2",
    settingsCustomersSub: "\u30a2\u30ab\u30a6\u30f3\u30c8\u3001\u627f\u8a8d\u3001PIN",
    settingsNotifications: "\u901a\u77e5",
    settingsNotificationsSub: "\u30e1\u30fc\u30eb\u3001Slack\u3001LINE WORKS",
    settingsAppearance: "\u753b\u9762\u8868\u793a",
    settingsAppearanceSub: "\u8a00\u8a9e\u3001\u8272\u3001\u30ed\u30b4",
    settingsPermissions: "\u6a29\u9650",
    settingsPermissionsSub: "\u7ba1\u7406\u8005\u30ed\u30fc\u30eb",
    settingsSystemData: "\u30b7\u30b9\u30c6\u30e0\u30c7\u30fc\u30bf",
    settingsSystemDataSub: "\u30c7\u30fc\u30bf\u51fa\u529b\u3001\u30ed\u30b0",
    linkLater: "\u5f8c\u3067\u9023\u643a\u4e88\u5b9a",
    linked: "\u9023\u643a\u6e08\u307f",
    inUse: "\u4f7f\u7528\u4e2d",
    configured: "\u8a2d\u5b9a\u6e08\u307f",
    notConfigured: "\u672a\u8a2d\u5b9a",
    prepareLater: "\u5f8c\u3067\u5bfe\u5fdc",
    manageLater: "\u5f8c\u3067\u7ba1\u7406",
    expandLater: "\u5f8c\u3067\u62e1\u5f35\u4e88\u5b9a",
    languageRegion: "\u8a00\u8a9e\u30fb\u5730\u57df",
    currentLanguage: "\u73fe\u5728\u306e\u8a00\u8a9e",
    timezone: "\u30bf\u30a4\u30e0\u30be\u30fc\u30f3",
    dateTimeFormat: "\u65e5\u6642\u8868\u793a\u5f62\u5f0f",
    workMaster: "\u696d\u52d9\u30de\u30b9\u30bf",
    workMasterLinked: "\u30b9\u30bf\u30c3\u30d5\u30fb\u9867\u5ba2\u30a2\u30d7\u30ea\u3068\u9023\u643a\u6e08\u307f",
    defaultTax: "\u6a19\u6e96\u7a0e\u7387",
    currency: "\u901a\u8ca8",
    quoteTemplate: "\u898b\u7a4d\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
    systemData: "\u30b7\u30b9\u30c6\u30e0\u30c7\u30fc\u30bf",
    csvExport: "CSV\u51fa\u529b",
    adminLogs: "\u7ba1\u7406\u753b\u9762\u64cd\u4f5c\u30ed\u30b0",
    backup: "\u30d0\u30c3\u30af\u30a2\u30c3\u30d7",
    totalDepartments: "\u90e8\u9580\u6570",
    currentlyUsed: "\u4f7f\u7528\u4e2d",
    departmentsPreview: "\u90e8\u9580\u30d7\u30ec\u30d3\u30e5\u30fc",
    departmentsCardDesc: "\u30b9\u30bf\u30c3\u30d5\u60c5\u5831\u3068\u9867\u5ba2\u30a2\u30d7\u30ea\u3067\u5229\u7528\u3059\u308b\u90e8\u9580\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",
    workGroupsDesc: "\u90e8\u9580\u3054\u3068\u306b\u696d\u52d9\u5185\u5bb9\u3092\u5206\u985e\u3057\u307e\u3059\u3002",
    workTypesDesc: "\u9867\u5ba2\u9078\u629e\u3068\u81ea\u52d5\u5272\u308a\u5f53\u3066\u306b\u5229\u7528\u3059\u308b\u696d\u52d9\u5185\u5bb9\u3067\u3059\u3002",
    autoAssign: "\u81ea\u52d5\u5272\u308a\u5f53\u3066",
    autoAssignDesc: "\u90e8\u9580\u30fb\u696d\u52d9\u30fb\u72b6\u614b\u30fb\u8ca0\u8377\u306b\u57fa\u3065\u3044\u3066\u30b9\u30bf\u30c3\u30d5\u3092\u5272\u308a\u5f53\u3066\u307e\u3059\u3002",
    quoteConfig: "\u898b\u7a4d\u8a2d\u5b9a",
    autoQuoteCode: "\u898b\u7a4d\u756a\u53f7\u81ea\u52d5\u751f\u6210",
    quoteValidity: "\u898b\u7a4d\u6709\u52b9\u671f\u9650",
    taxCurrency: "\u7a0e\u30fb\u901a\u8ca8",
    autoTax: "\u7a0e\u81ea\u52d5\u8a08\u7b97",
    priceRounding: "\u4fa1\u683c\u4e38\u3081",
    defaultPriceItems: "\u6a19\u6e96\u4fa1\u683c\u9805\u76ee",
    labor: "\u4eba\u5de5",
    materials: "\u6750\u6599",
    surveyFee: "\u8abf\u67fb\u8cbb",
    deliveryFee: "\u904b\u9001\u8cbb",
    otherCosts: "\u305d\u306e\u4ed6\u8cbb\u7528",
    quoteTerms: "\u898b\u7a4d\u6761\u4ef6",
    paymentTerms: "\u652f\u6255\u6761\u4ef6",
    constructionTerms: "\u65bd\u5de5\u6761\u4ef6",
    quoteNotes: "\u898b\u7a4d\u6ce8\u8a18",
    requestStatusSettings: "\u4f9d\u983c\u30b9\u30c6\u30fc\u30bf\u30b9",
    urgencyLevel: "\u7dca\u6025\u5ea6",
    responseDeadlines: "\u5bfe\u5fdc\u671f\u9650",
    firstResponseTime: "\u521d\u56de\u5fdc\u7b54\u6642\u9593",
    handlingDeadline: "\u51e6\u7406\u671f\u9650",
    overdueRule: "\u671f\u9650\u8d85\u904e",
    statusColors: "\u30b9\u30c6\u30fc\u30bf\u30b9\u8272",
    accountApproval: "\u30a2\u30ab\u30a6\u30f3\u30c8\u627f\u8a8d",
    customerStatus: "\u9867\u5ba2\u30b9\u30c6\u30fc\u30bf\u30b9",
    resetPin: "PIN\u30ea\u30bb\u30c3\u30c8",
    softDeleteTrash: "\u4e00\u6642\u524a\u9664\u30fb\u30b4\u30df\u7bb1",
    customerRequestHistory: "\u9867\u5ba2\u4f9d\u983c\u5c65\u6b74",
    newRequestAdminNotice: "\u65b0\u898f\u4f9d\u983c\u6642\u306e\u7ba1\u7406\u8005\u901a\u77e5",
    customerStatusNotice: "\u72b6\u614b\u5909\u66f4\u6642\u306e\u9867\u5ba2\u901a\u77e5",
    notificationTemplates: "\u901a\u77e5\u6587\u9762\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8",
    defaultLanguage: "\u6a19\u6e96\u8a00\u8a9e",
    appLogo: "\u30a2\u30d7\u30ea\u30ed\u30b4",
    primaryColor: "\u30e1\u30a4\u30f3\u30ab\u30e9\u30fc",
    splashScreen: "\u30b9\u30d7\u30e9\u30c3\u30b7\u30e5\u753b\u9762",
    appName: "\u30a2\u30d7\u30ea\u540d",
    statusColorRules: "\u30b9\u30c6\u30fc\u30bf\u30b9\u8272\u30eb\u30fc\u30eb",
    manager: "\u7ba1\u7406",
    employee: "\u30b9\u30bf\u30c3\u30d5",
    viewOnly: "\u95b2\u89a7\u306e\u307f",
    apiWebhook: "API / webhook",
    dataSync: "\u30c7\u30fc\u30bf\u540c\u671f",
    trashCleanup: "\u30b4\u30df\u7bb130\u65e5\u5f8c\u30af\u30ea\u30fc\u30f3\u30a2\u30c3\u30d7"
  });

  Object.assign(i18n.vi, {
    settingsSystemTitle: "C\u00e0i \u0111\u1eb7t h\u1ec7 th\u1ed1ng",
    settingsSystemSubtitle: "Qu\u1ea3n l\u00fd c\u1ea5u h\u00ecnh d\u00f9ng chung cho to\u00e0n b\u1ed9 app.",
    settingsOverview: "T\u1ed5ng quan",
    settingsOverviewSub: "C\u1ea5u h\u00ecnh ch\u00ednh",
    settingsStaffWork: "Nh\u00e2n vi\u00ean & c\u00f4ng vi\u1ec7c",
    settingsStaffWorkSub: "B\u1ed9 ph\u1eadn, n\u1ed9i dung c\u00f4ng vi\u1ec7c",
    settingsAiAssist: "AI h\u1ed7 tr\u1ee3",
    settingsAiAssistSub: "AI ph\u00e2n t\u00edch, ph\u00e2n c\u00f4ng",
    settingsProcessChart: "Bi\u1ec3u \u0111\u1ed3 x\u1eed l\u00fd y\u00eau c\u1ea7u",
    settingsProcessChartSub: "Nh\u1eadn, x\u1eed l\u00fd, b\u00e1o gi\u00e1, ho\u00e0n th\u00e0nh",
    settingsRequestStatus: "Y\u00eau c\u1ea7u & tr\u1ea1ng th\u00e1i",
    settingsRequestStatusSub: "Lu\u1ed3ng x\u1eed l\u00fd y\u00eau c\u1ea7u",
    settingsCustomers: "Kh\u00e1ch h\u00e0ng",
    settingsCustomersSub: "T\u00e0i kho\u1ea3n, duy\u1ec7t, PIN",
    settingsNotifications: "Th\u00f4ng b\u00e1o",
    settingsNotificationsSub: "Email, Slack, LINE WORKS",
    settingsAppearance: "Giao di\u1ec7n",
    settingsAppearanceSub: "Ng\u00f4n ng\u1eef, m\u00e0u, logo",
    settingsPermissions: "Quy\u1ec1n h\u1ea1n",
    settingsPermissionsSub: "Vai tr\u00f2 admin",
    settingsSystemData: "D\u1eef li\u1ec7u h\u1ec7 th\u1ed1ng",
    settingsSystemDataSub: "Xu\u1ea5t d\u1eef li\u1ec7u, nh\u1eadt k\u00fd",
    linkLater: "S\u1ebd li\u00ean k\u1ebft sau",
    linked: "\u0110\u00e3 li\u00ean k\u1ebft",
    inUse: "\u0110ang d\u00f9ng",
    configured: "\u0110\u00e3 c\u1ea5u h\u00ecnh",
    notConfigured: "Ch\u01b0a c\u1ea5u h\u00ecnh",
    prepareLater: "Chu\u1ea9n b\u1ecb sau",
    manageLater: "Qu\u1ea3n l\u00fd sau",
    expandLater: "S\u1ebd m\u1edf r\u1ed9ng sau",
    languageRegion: "Ng\u00f4n ng\u1eef & khu v\u1ef1c",
    currentLanguage: "Ng\u00f4n ng\u1eef hi\u1ec7n t\u1ea1i",
    timezone: "M\u00fai gi\u1edd",
    dateTimeFormat: "\u0110\u1ecbnh d\u1ea1ng ng\u00e0y gi\u1edd",
    workMaster: "Danh m\u1ee5c c\u00f4ng vi\u1ec7c",
    workMasterLinked: "\u0110\u00e3 li\u00ean k\u1ebft v\u1edbi Staff/App kh\u00e1ch h\u00e0ng",
    defaultTax: "Thu\u1ebf m\u1eb7c \u0111\u1ecbnh",
    currency: "\u0110\u01a1n v\u1ecb ti\u1ec1n t\u1ec7",
    quoteTemplate: "M\u1eabu b\u00e1o gi\u00e1",
    systemData: "D\u1eef li\u1ec7u h\u1ec7 th\u1ed1ng",
    csvExport: "Xu\u1ea5t CSV",
    adminLogs: "Nh\u1eadt k\u00fd thao t\u00e1c admin",
    backup: "Sao l\u01b0u",
    totalDepartments: "T\u1ed5ng b\u1ed9 ph\u1eadn",
    currentlyUsed: "\u0110ang s\u1eed d\u1ee5ng",
    departmentsPreview: "Xem tr\u01b0\u1edbc b\u1ed9 ph\u1eadn",
    departmentsCardDesc: "Qu\u1ea3n l\u00fd b\u1ed9 ph\u1eadn s\u1eed d\u1ee5ng trong h\u1ed3 s\u01a1 staff v\u00e0 app kh\u00e1ch h\u00e0ng.",
    workGroupsDesc: "D\u00f9ng \u0111\u1ec3 nh\u00f3m n\u1ed9i dung c\u00f4ng vi\u1ec7c theo b\u1ed9 ph\u1eadn.",
    workTypesDesc: "Danh s\u00e1ch c\u00f4ng vi\u1ec7c \u0111\u1ec3 kh\u00e1ch h\u00e0ng ch\u1ecdn v\u00e0 h\u1ec7 th\u1ed1ng t\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng.",
    autoAssign: "T\u1ef1 \u0111\u1ed9ng ph\u00e2n c\u00f4ng",
    autoAssignDesc: "Quy t\u1eafc ch\u1ecdn nh\u00e2n vi\u00ean theo b\u1ed9 ph\u1eadn, c\u00f4ng vi\u1ec7c, tr\u1ea1ng th\u00e1i v\u00e0 t\u1ea3i x\u1eed l\u00fd.",
    quoteConfig: "C\u1ea5u h\u00ecnh b\u00e1o gi\u00e1",
    autoQuoteCode: "M\u00e3 b\u00e1o gi\u00e1 t\u1ef1 \u0111\u1ed9ng",
    quoteValidity: "Hi\u1ec7u l\u1ef1c b\u00e1o gi\u00e1",
    taxCurrency: "Thu\u1ebf & ti\u1ec1n t\u1ec7",
    autoTax: "T\u1ef1 \u0111\u1ed9ng t\u00ednh thu\u1ebf",
    priceRounding: "L\u00e0m tr\u00f2n gi\u00e1",
    defaultPriceItems: "M\u1ee5c gi\u00e1 m\u1eb7c \u0111\u1ecbnh",
    labor: "Nh\u00e2n c\u00f4ng",
    materials: "V\u1eadt t\u01b0",
    surveyFee: "Ph\u00ed kh\u1ea3o s\u00e1t",
    deliveryFee: "Ph\u00ed v\u1eadn chuy\u1ec3n",
    otherCosts: "Chi ph\u00ed kh\u00e1c",
    quoteTerms: "\u0110i\u1ec1u kho\u1ea3n b\u00e1o gi\u00e1",
    paymentTerms: "\u0110i\u1ec1u kho\u1ea3n thanh to\u00e1n",
    constructionTerms: "\u0110i\u1ec1u kho\u1ea3n thi c\u00f4ng",
    quoteNotes: "Ghi ch\u00fa b\u00e1o gi\u00e1",
    requestStatusSettings: "Tr\u1ea1ng th\u00e1i y\u00eau c\u1ea7u",
    urgencyLevel: "\u0110\u1ed9 kh\u1ea9n",
    responseDeadlines: "H\u1ea1n x\u1eed l\u00fd",
    firstResponseTime: "Th\u1eddi gian ph\u1ea3n h\u1ed3i \u0111\u1ea7u ti\u00ean",
    handlingDeadline: "H\u1ea1n x\u1eed l\u00fd",
    overdueRule: "Qu\u00e1 h\u1ea1n",
    statusColors: "M\u00e0u tr\u1ea1ng th\u00e1i",
    accountApproval: "Duy\u1ec7t t\u00e0i kho\u1ea3n",
    customerStatus: "Tr\u1ea1ng th\u00e1i kh\u00e1ch h\u00e0ng",
    resetPin: "Reset PIN",
    softDeleteTrash: "X\u00f3a t\u1ea1m / th\u00f9ng r\u00e1c",
    customerRequestHistory: "L\u1ecbch s\u1eed y\u00eau c\u1ea7u kh\u00e1ch h\u00e0ng",
    newRequestAdminNotice: "Th\u00f4ng b\u00e1o admin khi c\u00f3 y\u00eau c\u1ea7u m\u1edbi",
    customerStatusNotice: "Th\u00f4ng b\u00e1o kh\u00e1ch h\u00e0ng khi tr\u1ea1ng th\u00e1i thay \u0111\u1ed5i",
    notificationTemplates: "M\u1eabu n\u1ed9i dung th\u00f4ng b\u00e1o",
    defaultLanguage: "Ng\u00f4n ng\u1eef m\u1eb7c \u0111\u1ecbnh",
    appLogo: "Logo app",
    primaryColor: "M\u00e0u ch\u00ednh",
    splashScreen: "Splash screen",
    appName: "T\u00ean app",
    statusColorRules: "Quy t\u1eafc m\u00e0u status",
    manager: "Qu\u1ea3n l\u00fd",
    employee: "Nh\u00e2n vi\u00ean",
    viewOnly: "Ch\u1ec9 xem",
    apiWebhook: "API / webhook",
    dataSync: "\u0110\u1ed3ng b\u1ed9 d\u1eef li\u1ec7u",
    trashCleanup: "D\u1ecdn d\u1eef li\u1ec7u th\u00f9ng r\u00e1c sau 30 ng\u00e0y"
  });

  Object.assign(i18n.ja, {
    quoteModuleSubtitle: "\u898b\u7a4d\u30fb\u63d0\u6848\u3068\u53d7\u6ce8\u72b6\u6cc1\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",
    quoteRegister: "\u898b\u7a4d\u4f5c\u6210",
    quoteCsvExport: "CSV\u51fa\u529b",
    totalQuoteValue: "\u898b\u7a4d\u91d1\u984d\u5408\u8a08",
    orderRate: "\u53d7\u6ce8\u7387",
    orderedValue: "\u53d7\u6ce8\u91d1\u984d",
    quoteStatusDraft: "\u4f5c\u6210\u4e2d",
    quoteStatusPendingApproval: "\u627f\u8a8d\u5f85\u3061",
    quoteStatusSentToCustomer: "\u30a2\u30d7\u30ea\u9001\u4fe1\u6e08\u307f",
    quoteStatusViewedByCustomer: "\u9867\u5ba2\u78ba\u8a8d\u4e2d",
    quoteStatusChangeRequested: "\u4fee\u6b63\u4f9d\u983c",
    quoteStatusAccepted: "\u627f\u8a8d\u6e08\u307f",
    quoteStatusRejected: "\u5374\u4e0b",
    quoteStatusExpired: "\u671f\u9650\u5207\u308c",
    sendToCustomerApp: "\u9867\u5ba2\u30a2\u30d7\u30ea\u3078\u9001\u4fe1",
    saveDraft: "\u4e0b\u66f8\u304d\u4fdd\u5b58",
    pdfPreview: "PDF\u30d7\u30ec\u30d3\u30e5\u30fc",
    quoteDetailTitle: "\u898b\u7a4d\u8a73\u7d30",
    noQuotes: "\u898b\u7a4d\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093",
    quoteMockNote: "\u30ec\u30a4\u30a2\u30a6\u30c8\u8a66\u9a13\u4e2d\uff1aMongoDB\u4fdd\u5b58\u30fbPDF\u4f5c\u6210\u306f\u672a\u63a5\u7d9a\u3067\u3059\u3002",
    quoteSentMock: "\u898b\u7a4d\u3092\u9867\u5ba2\u30a2\u30d7\u30ea\u3078\u9001\u4fe1\u3057\u307e\u3057\u305f\u3002",
    quoteSavedMock: "\u898b\u7a4d\u306e\u4e0b\u66f8\u304d\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002",
    quoteMissingCustomerSend: "\u9867\u5ba2\u3092\u9078\u629e\u3057\u3066\u304b\u3089\u9867\u5ba2\u30a2\u30d7\u30ea\u3078\u9001\u4fe1\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    quoteMissingItemsSend: "\u898b\u7a4d\u9805\u76ee\u30921\u3064\u4ee5\u4e0a\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    quoteDraftRequired: "\u5de5\u4e8b\u540d\u307e\u305f\u306f\u898b\u7a4d\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    quoteLayoutRefreshed: "\u30ec\u30a4\u30a2\u30a6\u30c8\u30c7\u30fc\u30bf\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f\u3002",
    quoteCsvUnavailable: "CSV\u51fa\u529b\u306f\u307e\u3060\u63a5\u7d9a\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002",
    quoteNotFound: "\u898b\u7a4d\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002",
    featureLater: "\u3053\u306e\u6a5f\u80fd\u306f\u6b21\u306e\u30b9\u30c6\u30c3\u30d7\u3067\u5b9f\u88c5\u3057\u307e\u3059\u3002",
    quoteDetailPlaceholderText: "\u898b\u7a4d\u8a73\u7d30\u753b\u9762\u306f\u6b21\u306e\u30b9\u30c6\u30c3\u30d7\u3067\u5b9f\u88c5\u3057\u307e\u3059\u3002",
    quoteQuickCreate: "\u898b\u7a4d\u4f5c\u6210",
    quoteCreateSubtitle: "\u898b\u7a4d\u3092\u4f5c\u6210\u3057\u3066\u9867\u5ba2\u30a2\u30d7\u30ea\u3078\u9001\u4fe1\u3057\u307e\u3059",
    quoteStepRequest: "\u4f9d\u983c\u53d7\u4ed8",
    quoteStepQuote: "\u898b\u7a4d",
    quoteStepReview: "\u78ba\u8a8d",
    quoteStepSend: "\u9001\u4fe1",
    quoteRequestInput: "\u4f9d\u983cID\u5165\u529b",
    quoteRequestPlaceholder: "\u4f9d\u983cID\u30fb\u9867\u5ba2\u540d\u30fb\u96fb\u8a71\u756a\u53f7\u3092\u5165\u529b",
    quoteRequestSearchLater: "\u4f9d\u983c\u691c\u7d22\u306f\u5f8c\u3067\u63a5\u7d9a\u3057\u307e\u3059\u3002",
    searchAction: "\u691c\u7d22",
    changeRequest: "\u4f9d\u983c\u3092\u5909\u66f4",
    requestNotLinked: "\u4f9d\u983c\u672a\u9023\u643a",
    quoteCustomerProjectInfo: "\u9867\u5ba2\u30fb\u5de5\u4e8b\u60c5\u5831",
    quotePaymentSummary: "\u652f\u6255\u5408\u8a08",
    quoteAfterDiscount: "\u5024\u5f15\u5f8c\u91d1\u984d",
    quoteTaxSection: "\u6d88\u8cbb\u7a0e",
    quoteGrandTotalVat: "\u7a0e\u8fbc\u5408\u8a08",
    quoteUploadHint: "\u30d5\u30a1\u30a4\u30eb\u3092\u30c9\u30e9\u30c3\u30b0\u307e\u305f\u306f\u9078\u629e",
    quoteUploadMeta: "PDF, JPG, PNG / 10MB\u307e\u3067",
    quoteTermsDefault: "\u30fb\u672c\u898b\u7a4d\u306f\u4e0a\u8a18\u4f5c\u696d\u7bc4\u56f2\u306b\u9069\u7528\u3055\u308c\u307e\u3059\u3002\n\u30fb\u7bc4\u56f2\u5916\u306e\u8ffd\u52a0\u4f5c\u696d\u304c\u767a\u751f\u3057\u305f\u5834\u5408\u306f\u5225\u9014\u898b\u7a4d\u3068\u306a\u308a\u307e\u3059\u3002",
    quoteItemCount: "{count}\u9805\u76ee",
    pdfPreviewLater: "PDF\u30d7\u30ec\u30d3\u30e5\u30fc\u306f\u5f8c\u3067\u5b9f\u88c5\u3057\u307e\u3059\u3002",
    deleteRow: "\u884c\u524a\u9664",
    copyQuoteRow: "\u30b3\u30d4\u30fc",
    deleteQuoteRow: "\u524a\u9664",
    noQuoteItemToDelete: "\u524a\u9664\u3059\u308b\u898b\u7a4d\u9805\u76ee\u304c\u3042\u308a\u307e\u305b\u3093\u3002",
    quoteSearchPlaceholder: "\u898b\u7a4d\u756a\u53f7\u30fb\u9867\u5ba2\u30fb\u5de5\u4e8b\u540d\u3092\u691c\u7d22",
    quoteNo: "\u898b\u7a4d\u756a\u53f7",
    projectContent: "\u5de5\u4e8b / \u5185\u5bb9",
    validUntil: "\u6709\u52b9",
    quoteNew: "\u65b0\u898f\u898b\u7a4d",
    quickQuote: "\u898b\u7a4d\u4f5c\u6210",
    linkedRequest: "\u4f9d\u983c\u9023\u643a",
    customerInfo: "\u9867\u5ba2\u60c5\u5831",
    projectInfo: "\u5de5\u4e8b\u60c5\u5831",
    quoteItems: "\u898b\u7a4d\u660e\u7d30",
    itemName: "\u4f5c\u696d\u9805\u76ee",
    itemDescription: "\u8aac\u660e / \u4ed5\u69d8",
    unit: "\u5358\u4f4d",
    quantity: "\u6570\u91cf",
    unitPrice: "\u5358\u4fa1",
    discount: "\u5024\u5f15\u304d",
    lineAmount: "\u91d1\u984d",
    addQuoteItem: "\u9805\u76ee\u3092\u8ffd\u52a0",
    customerNote: "\u9867\u5ba2\u5411\u3051\u6ce8\u8a18",
    internalNote: "\u5185\u90e8\u30e1\u30e2",
    quoteSummary: "\u898b\u7a4d\u30b5\u30de\u30ea\u30fc",
    subtotal: "\u5c0f\u8a08",
    taxRate: "VAT %",
    taxAmount: "VAT",
    rounding: "\u4e38\u3081",
    grandTotal: "\u5408\u8a08",
    attachments: "\u6dfb\u4ed8\u8cc7\u6599",
    kanban: "\u30ab\u30f3\u30d0\u30f3",
    listView: "\u4e00\u89a7",
    noCustomerSelected: "\u9867\u5ba2\u672a\u8a2d\u5b9a",
    noValidUntil: "\u672a\u8a2d\u5b9a",
    noAssignee: "\u672a\u8a2d\u5b9a",
    missingCustomer: "\u9867\u5ba2\u672a\u8a2d\u5b9a",
    quotePipeline: "\u898b\u7a4d\u30d1\u30a4\u30d7\u30e9\u30a4\u30f3",
    quoteLayoutData: "\u30ec\u30a4\u30a2\u30a6\u30c8\u30c7\u30fc\u30bf",
    quoteWizardStep1: "依頼詳細",
    quoteWizardStep2: "見積",
    nextStep: "次へ",
    previousStep: "戻る",
    exportPdf: "PDF出力",
    exportExcel: "Excel出力",
    fileExportLater: "ファイル出力は後で実装します。",
    quoteCustomerInfoRequired: "顧客情報を入力してください。",
    quoteKanbanHint: "\u6a2a\u306b\u30b9\u30af\u30ed\u30fc\u30eb\u3057\u3066\u4ed6\u306e\u30b9\u30c6\u30fc\u30bf\u30b9\u3092\u8868\u793a",
    quoteTodayNeedsAction: "\u672c\u65e5\u306e\u5bfe\u5fdc",
    quotePendingApprovalShort: "\u627f\u8a8d\u5f85\u3061",
    quoteExpiringSoonShort: "\u671f\u9650\u9593\u8fd1",
    quoteMissingCustomerShort: "\u9867\u5ba2\u672a\u8a2d\u5b9a",
    quoteChangeRequestedShort: "\u4fee\u6b63\u4f9d\u983c",
    quoteAllValidity: "\u3059\u3079\u3066",
    quoteStillValid: "\u6709\u52b9",
    quoteExpired: "\u671f\u9650\u5207\u308c",
    quoteNoValidUntil: "\u6709\u52b9\u671f\u9650\u672a\u8a2d\u5b9a",
    quotePipelineTracking: "\u4ef6\u306e\u898b\u7a4d\u3092\u30b9\u30c6\u30fc\u30bf\u30b9\u5225\u306b\u8868\u793a"
  });

  Object.assign(i18n.vi, {
    quoteModuleSubtitle: "Qu\u1ea3n l\u00fd b\u00e1o gi\u00e1, \u0111\u1ec1 xu\u1ea5t v\u00e0 tr\u1ea1ng th\u00e1i nh\u1eadn \u0111\u01a1n.",
    quoteRegister: "T\u1ea1o b\u00e1o gi\u00e1",
    quoteCsvExport: "Xu\u1ea5t CSV",
    totalQuoteValue: "T\u1ed5ng gi\u00e1 tr\u1ecb b\u00e1o gi\u00e1",
    orderRate: "T\u1ec9 l\u1ec7 nh\u1eadn \u0111\u01a1n",
    orderedValue: "Gi\u00e1 tr\u1ecb \u0111\u00e3 nh\u1eadn \u0111\u01a1n",
    quoteStatusDraft: "\u0110ang t\u1ea1o",
    quoteStatusPendingApproval: "Ch\u1edd duy\u1ec7t",
    quoteStatusSentToCustomer: "\u0110\u00e3 g\u1eedi app",
    quoteStatusViewedByCustomer: "Kh\u00e1ch \u0111ang xem",
    quoteStatusChangeRequested: "Y\u00eau c\u1ea7u ch\u1ec9nh s\u1eeda",
    quoteStatusAccepted: "Kh\u00e1ch \u0111\u1ed3ng \u00fd",
    quoteStatusRejected: "Kh\u00e1ch t\u1eeb ch\u1ed1i",
    quoteStatusExpired: "H\u1ebft h\u1ea1n",
    sendToCustomerApp: "G\u1eedi l\u00ean app kh\u00e1ch h\u00e0ng",
    saveDraft: "L\u01b0u nh\u00e1p",
    pdfPreview: "Xem tr\u01b0\u1edbc PDF",
    quoteDetailTitle: "Chi ti\u1ebft b\u00e1o gi\u00e1",
    noQuotes: "Ch\u01b0a c\u00f3 b\u00e1o gi\u00e1 n\u00e0o",
    quoteMockNote: "Ch\u1ebf \u0111\u1ed9 layout th\u1eed nghi\u1ec7m: ch\u01b0a l\u01b0u MongoDB, ch\u01b0a t\u1ea1o PDF.",
    quoteSentMock: "B\u00e1o gi\u00e1 \u0111\u00e3 \u0111\u01b0\u1ee3c g\u1eedi l\u00ean app kh\u00e1ch h\u00e0ng.",
    quoteSavedMock: "\u0110\u00e3 l\u01b0u nh\u00e1p b\u00e1o gi\u00e1.",
    quoteMissingCustomerSend: "Vui l\u00f2ng ch\u1ecdn kh\u00e1ch h\u00e0ng tr\u01b0\u1edbc khi g\u1eedi b\u00e1o gi\u00e1 l\u00ean app.",
    quoteMissingItemsSend: "Vui l\u00f2ng th\u00eam \u00edt nh\u1ea5t m\u1ed9t h\u1ea1ng m\u1ee5c b\u00e1o gi\u00e1.",
    quoteDraftRequired: "Vui l\u00f2ng nh\u1eadp t\u00ean c\u00f4ng tr\u00ecnh ho\u1eb7c h\u1ea1ng m\u1ee5c b\u00e1o gi\u00e1.",
    quoteLayoutRefreshed: "\u0110\u00e3 l\u00e0m m\u1edbi d\u1eef li\u1ec7u layout.",
    quoteCsvUnavailable: "Xu\u1ea5t CSV ch\u01b0a \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i trong layout n\u00e0y.",
    quoteNotFound: "Kh\u00f4ng t\u00ecm th\u1ea5y b\u00e1o gi\u00e1.",
    featureLater: "Ch\u1ee9c n\u0103ng n\u00e0y s\u1ebd \u0111\u01b0\u1ee3c ho\u00e0n thi\u1ec7n \u1edf b\u01b0\u1edbc sau.",
    quoteDetailPlaceholderText: "M\u00e0n chi ti\u1ebft b\u00e1o gi\u00e1 s\u1ebd \u0111\u01b0\u1ee3c ho\u00e0n thi\u1ec7n \u1edf b\u01b0\u1edbc sau.",
    quoteQuickCreate: "B\u00e1o gi\u00e1 nhanh",
    quoteCreateSubtitle: "T\u1ea1o b\u00e1o gi\u00e1 nhanh v\u00e0 g\u1eedi l\u00ean app kh\u00e1ch h\u00e0ng",
    quoteStepRequest: "Ti\u1ebfp nh\u1eadn y\u00eau c\u1ea7u",
    quoteStepQuote: "B\u00e1o gi\u00e1",
    quoteStepReview: "Xem l\u1ea1i",
    quoteStepSend: "G\u1eedi b\u00e1o gi\u00e1",
    quoteRequestInput: "Nh\u1eadp ID y\u00eau c\u1ea7u",
    quoteRequestPlaceholder: "Nh\u1eadp ID y\u00eau c\u1ea7u / t\u00ean kh\u00e1ch / s\u1ed1 \u0111i\u1ec7n tho\u1ea1i",
    quoteRequestSearchLater: "Ch\u1ee9c n\u0103ng t\u00ecm y\u00eau c\u1ea7u s\u1ebd \u0111\u01b0\u1ee3c k\u1ebft n\u1ed1i sau.",
    searchAction: "T\u00ecm ki\u1ebfm",
    changeRequest: "\u0110\u1ed5i y\u00eau c\u1ea7u",
    requestNotLinked: "Ch\u01b0a li\u00ean k\u1ebft y\u00eau c\u1ea7u",
    quoteCustomerProjectInfo: "Th\u00f4ng tin kh\u00e1ch h\u00e0ng - c\u00f4ng tr\u00ecnh",
    quotePaymentSummary: "T\u1ed5ng h\u1ee3p thanh to\u00e1n",
    quoteAfterDiscount: "Th\u00e0nh ti\u1ec1n sau chi\u1ebft kh\u1ea5u",
    quoteTaxSection: "Thu\u1ebf VAT",
    quoteGrandTotalVat: "T\u1ed5ng c\u1ed9ng \u0111\u00e3 g\u1ed3m VAT",
    quoteUploadHint: "K\u00e9o & th\u1ea3 file v\u00e0o \u0111\u00e2y ho\u1eb7c ch\u1ecdn file",
    quoteUploadMeta: "PDF, JPG, PNG / t\u1ed1i \u0111a 10MB",
    quoteTermsDefault: "- B\u00e1o gi\u00e1 n\u00e0y \u0111\u01b0\u1ee3c \u00e1p d\u1ee5ng cho ph\u1ea1m vi c\u00f4ng vi\u1ec7c n\u00eau tr\u00ean.\n- N\u1ebfu c\u00f3 ph\u00e1t sinh ngo\u00e0i ph\u1ea1m vi tr\u00ean, s\u1ebd b\u00e1o gi\u00e1 ri\u00eang.",
    quoteItemCount: "T\u1ed5ng s\u1ed1 {count} h\u1ea1ng m\u1ee5c",
    pdfPreviewLater: "Ch\u1ee9c n\u0103ng xem tr\u01b0\u1edbc PDF s\u1ebd \u0111\u01b0\u1ee3c ho\u00e0n thi\u1ec7n sau.",
    deleteRow: "X\u00f3a d\u00f2ng",
    copyQuoteRow: "Sao ch\u00e9p",
    deleteQuoteRow: "X\u00f3a",
    noQuoteItemToDelete: "Kh\u00f4ng c\u00f3 d\u00f2ng h\u1ea1ng m\u1ee5c \u0111\u1ec3 x\u00f3a.",
    quoteSearchPlaceholder: "T\u00ecm ki\u1ebfm m\u00e3 b\u00e1o gi\u00e1 / kh\u00e1ch h\u00e0ng / c\u00f4ng tr\u00ecnh",
    quoteNo: "M\u00e3 b\u00e1o gi\u00e1",
    projectContent: "C\u00f4ng tr\u00ecnh / n\u1ed9i dung",
    validUntil: "Hi\u1ec7u l\u1ef1c",
    quoteNew: "B\u00e1o gi\u00e1 m\u1edbi",
    quickQuote: "B\u00e1o gi\u00e1 nhanh",
    linkedRequest: "Li\u00ean k\u1ebft y\u00eau c\u1ea7u",
    customerInfo: "Th\u00f4ng tin kh\u00e1ch h\u00e0ng",
    projectInfo: "Th\u00f4ng tin c\u00f4ng tr\u00ecnh",
    quoteItems: "Chi ti\u1ebft b\u00e1o gi\u00e1",
    itemName: "H\u1ea1ng m\u1ee5c c\u00f4ng vi\u1ec7c",
    itemDescription: "M\u00f4 t\u1ea3 / Quy c\u00e1ch",
    unit: "\u0110VT",
    quantity: "S\u1ed1 l\u01b0\u1ee3ng",
    unitPrice: "\u0110\u01a1n gi\u00e1",
    discount: "Chi\u1ebft kh\u1ea5u",
    lineAmount: "Th\u00e0nh ti\u1ec1n",
    addQuoteItem: "+ Th\u00eam h\u1ea1ng m\u1ee5c",
    customerNote: "Ghi ch\u00fa cho kh\u00e1ch",
    internalNote: "Ghi ch\u00fa n\u1ed9i b\u1ed9",
    quoteSummary: "T\u1ed5ng h\u1ee3p b\u00e1o gi\u00e1",
    subtotal: "T\u1ed5ng ti\u1ec1n h\u00e0ng",
    taxRate: "VAT %",
    taxAmount: "Ti\u1ec1n VAT",
    rounding: "L\u00e0m tr\u00f2n",
    grandTotal: "T\u1ed5ng c\u1ed9ng",
    attachments: "T\u00e0i li\u1ec7u \u0111\u00ednh k\u00e8m",
    kanban: "Kanban",
    listView: "Danh s\u00e1ch",
    noCustomerSelected: "Ch\u01b0a c\u00f3 kh\u00e1ch h\u00e0ng",
    noValidUntil: "Ch\u01b0a \u0111\u1eb7t",
    noAssignee: "Ch\u01b0a c\u00f3",
    missingCustomer: "Thi\u1ebfu kh\u00e1ch h\u00e0ng",
    quotePipeline: "Pipeline b\u00e1o gi\u00e1",
    quoteLayoutData: "D\u1eef li\u1ec7u layout",
    quoteWizardStep1: "Chi tiết yêu cầu",
    quoteWizardStep2: "Báo giá",
    nextStep: "Tiếp tục",
    previousStep: "Quay lại",
    exportPdf: "Xuất PDF",
    exportExcel: "Xuất Excel",
    fileExportLater: "Chức năng xuất file sẽ được hoàn thiện sau.",
    quoteCustomerInfoRequired: "Vui lòng chọn khách hàng hoặc nhập thông tin khách hàng.",
    quoteKanbanHint: "K\u00e9o ngang \u0111\u1ec3 xem th\u00eam tr\u1ea1ng th\u00e1i",
    quoteTodayNeedsAction: "C\u1ea7n x\u1eed l\u00fd h\u00f4m nay",
    quotePendingApprovalShort: "B\u00e1o gi\u00e1 ch\u1edd duy\u1ec7t",
    quoteExpiringSoonShort: "B\u00e1o gi\u00e1 s\u1eafp h\u1ebft h\u1ea1n",
    quoteMissingCustomerShort: "B\u00e1o gi\u00e1 thi\u1ebfu kh\u00e1ch h\u00e0ng",
    quoteChangeRequestedShort: "B\u00e1o gi\u00e1 y\u00eau c\u1ea7u ch\u1ec9nh s\u1eeda",
    quoteAllValidity: "T\u1ea5t c\u1ea3",
    quoteStillValid: "C\u00f2n hi\u1ec7u l\u1ef1c",
    quoteExpired: "\u0110\u00e3 h\u1ebft h\u1ea1n",
    quoteNoValidUntil: "Ch\u01b0a \u0111\u1eb7t hi\u1ec7u l\u1ef1c",
    quotePipelineTracking: "Theo d\u00f5i {count} b\u00e1o gi\u00e1 theo tr\u1ea1ng th\u00e1i x\u1eed l\u00fd"
  });

  const state = {
    currentView: "dashboard",
    requests: [],
    users: [],
    staff: [],
    quotes: [],
    workMaster: { departments: [], workGroups: [], workTypes: [] },
    selectedRequest: null,
    selectedUser: null,
    selectedStaff: null,
    selectedQuoteId: null,
    quoteWizardStep: 1,
    quoteSelectedFiles: [],
    staffStatusUpdating: new Set(),
    errors: {},
    loading: {
      requests: false,
      users: false,
      staff: false,
      quotes: false,
      workMaster: false
    },
    filters: {
      requestStatus: "all",
      search: "",
      department: "",
      staff: "all",
      urgency: "all",
      media: "all",
      sort: "priority",
      requestViewMode: "table",
      trashCategory: "customers",
      trashSearch: ""
    },
    settingsTab: "overview",
    overviewSettings: null,
    overviewSettingsStatus: null,
    overviewSettingsDrafts: {},
    overviewSettingsEditing: {},
    overviewSettingsErrors: {},
    lang: localStorage.getItem("language") || "ja"
  };

  window.AdminV2State = state;

  function token() {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  }

  function authHeaders(extra) {
    return Object.assign({}, extra || {}, { Authorization: "Bearer " + token() });
  }

  function loginRedirectUrl() {
    const path = window.location.pathname + window.location.search;
    localStorage.setItem("adminRedirectAfterLogin", path || ADMIN_PATH);
    return "/login.html?redirect=" + encodeURIComponent(path || ADMIN_PATH);
  }

  function handleAuthFailure() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    toast(t("sessionExpired"));
    window.setTimeout(() => {
      window.location.href = loginRedirectUrl();
    }, 650);
  }

  async function requestJson(url, options) {
    const response = await fetch(url, Object.assign({ cache: "no-store" }, options || {}, {
      headers: authHeaders((options && options.headers) || {})
    }));
    if (response.status === 401 || response.status === 403) {
      handleAuthFailure();
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || body.error || "API failed: " + response.status);
    }
    return response.json().catch(() => ({}));
  }

  const AdminAPI = {
    getRequests() {
      return requestJson("/requests");
    },
    getRequest(id) {
      return requestJson("/request/" + encodeURIComponent(id));
    },
    updateRequest(id, payload) {
      return requestJson("/request/" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    },
    deleteRequest(id, permanent) {
      return requestJson("/request/" + encodeURIComponent(id) + (permanent ? "?permanent=true" : ""), { method: "DELETE" });
    },
    restoreRequest(id) {
      return requestJson("/request/" + encodeURIComponent(id) + "/restore", { method: "PATCH" });
    },
    getQuotes() {
      return requestJson("/admin/quotes");
    },
    saveQuote(payload) {
      return requestJson("/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    },
    createQuoteFromRequest(id) {
      return requestJson("/admin/requests/" + encodeURIComponent(id) + "/create-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
    },
    getQuoteRequests(params) {
      const query = new URLSearchParams();
      Object.entries(params || {}).forEach(([key, value]) => {
        if (value != null && value !== "" && value !== "all") query.set(key, value);
      });
      return requestJson("/admin/quote-requests" + (query.toString() ? "?" + query.toString() : ""));
    },
    uploadRequestQuoteFile(requestId, files) {
      const formData = new FormData();
      const list = Array.isArray(files) ? files : [files].filter(Boolean);
      list.forEach(file => formData.append("file", file));
      return requestJson("/admin/requests/" + encodeURIComponent(requestId) + "/quote-file", {
        method: "POST",
        body: formData
      });
    },
    deleteQuote(id, permanent) {
      return requestJson("/admin/quotes/" + encodeURIComponent(id) + (permanent ? "?permanent=true" : ""), { method: "DELETE" });
    },
    restoreQuote(id) {
      return requestJson("/admin/quotes/" + encodeURIComponent(id) + "/restore", { method: "PATCH" });
    },
    async getUsers() {
      try {
        return await requestJson("/api/admin/users");
      } catch (error) {
        if (error.message === "Unauthorized") throw error;
        return requestJson("/admin/users");
      }
    },
    approveUser(id) {
      return requestJson("/api/admin/users/" + encodeURIComponent(id) + "/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      });
    },
    updateUser(id, payload) {
      return requestJson("/admin/users/" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    },
    deleteUser(id, permanent) {
      return requestJson("/admin/users/" + encodeURIComponent(id) + (permanent ? "?permanent=true" : ""), {
        method: "DELETE"
      });
    },
    getUserRequests(id) {
      return requestJson("/admin/users/" + encodeURIComponent(id) + "/requests");
    },
    getStaff() {
      return requestJson("/admin/staff");
    },
    getWorkMaster() {
      return requestJson("/admin/work-master");
    },
    createDepartment(payload) {
      return requestJson("/admin/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    updateDepartment(id, payload) {
      return requestJson("/admin/departments/" + encodeURIComponent(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    setDepartmentStatus(id, active) {
      return requestJson("/admin/departments/" + encodeURIComponent(id) + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }) });
    },
    deleteDepartment(id) {
      return requestJson("/admin/departments/" + encodeURIComponent(id), { method: "DELETE" });
    },
    createWorkGroup(payload) {
      return requestJson("/admin/work-groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    updateWorkGroup(id, payload) {
      return requestJson("/admin/work-groups/" + encodeURIComponent(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    setWorkGroupStatus(id, active) {
      return requestJson("/admin/work-groups/" + encodeURIComponent(id) + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }) });
    },
    deleteWorkGroup(id) {
      return requestJson("/admin/work-groups/" + encodeURIComponent(id), { method: "DELETE" });
    },
    createWorkType(payload) {
      return requestJson("/admin/work-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    updateWorkType(id, payload) {
      return requestJson("/admin/work-types/" + encodeURIComponent(id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload || {}) });
    },
    setWorkTypeStatus(id, active) {
      return requestJson("/admin/work-types/" + encodeURIComponent(id) + "/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active }) });
    },
    deleteWorkType(id) {
      return requestJson("/admin/work-types/" + encodeURIComponent(id), { method: "DELETE" });
    },
    getStaffHistory(id) {
      return requestJson("/api/requests/staff/" + encodeURIComponent(id) + "/history");
    },
    createStaff(payload) {
      const isFormData = payload instanceof FormData;
      return requestJson("/admin/staff", {
        method: "POST",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload || {})
      });
    },
    updateStaff(id, payload) {
      const isFormData = payload instanceof FormData;
      return requestJson("/admin/staff/" + encodeURIComponent(id), {
        method: "PUT",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? payload : JSON.stringify(payload || {})
      });
    },
    deleteStaff(id, permanent) {
      return requestJson("/admin/staff/" + encodeURIComponent(id) + (permanent ? "?permanent=true" : ""), { method: "DELETE" });
    },
    restoreStaff(id) {
      return requestJson("/admin/staff/" + encodeURIComponent(id) + "/restore", { method: "PATCH" });
    },
    getOverviewSettings() {
      return requestJson("/api/admin/settings/overview");
    },
    updateOverviewSettings(payload) {
      return requestJson("/api/admin/settings/overview", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    }
  };

  window.AdminAPI = AdminAPI;

  function $(id) {
    return document.getElementById(id);
  }

  function t(key) {
    return (i18n[state.lang] && i18n[state.lang][key]) || i18n.ja[key] || key;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(state.lang === "ja" ? "ja-JP" : "vi-VN");
  }

  function normalizeRequestStatus(status) {
    const value = String(status || "").toLowerCase();
    if (String(status || "") === "\u672a\u5bfe\u5fdc") return "untreated";
    if (String(status || "") === "\u9023\u7d61\u6e08") return "contacted";
    if (String(status || "") === "\u73fe\u5730\u6e08") return "site_done";
    if (String(status || "") === "\u898b\u7a4d") return "quoted";
    if (String(status || "") === "\u53d7\u6ce8") return "ordered";
    if (String(status || "") === "\u5b8c\u4e86") return "completed";
    if (String(status || "") === "\u5931\u6ce8") return "lost";
    if (value === "pending") return "untreated";
    if (value === "received") return "contacted";
    if (value === "processing") return "contacted";
    if (value === "estimating") return "quoted";
    if (value === "quote") return "quoted";
    if (value === "estimate") return "quoted";
    if (value === "quoted") return "quoted";
    if (value === "order") return "ordered";
    if (value === "accepted") return "ordered";
    if (value === "scheduled") return "ordered";
    if (value === "done") return "completed";
    if (value === "complete") return "completed";
    if (value === "completed") return "completed";
    if (value === "cancelled" || value === "canceled") return "lost";
    if (value === "failed") return "lost";
    if (value === "lost") return "lost";
    if (value === "contacted" || value === "site_done" || value === "untreated") return value;
    return "untreated";
  }

  window.normalizeRequestStatus = normalizeRequestStatus;

  const REQUEST_STATUSES = Object.freeze(["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"]);

  function uniqueRequestStatuses(values) {
    const seen = new Set();
    return values.map(normalizeRequestStatus).filter(status => {
      if (!REQUEST_STATUSES.includes(status) || seen.has(status)) return false;
      seen.add(status);
      return true;
    });
  }

  function requestStatusValues() {
    return uniqueRequestStatuses(REQUEST_STATUSES);
  }

  function formatStatus(status) {
    const normalized = normalizeRequestStatus(status);
    const cleanLabelsJa = {
      untreated: "\u672a\u5bfe\u5fdc",
      contacted: "\u9023\u7d61\u6e08",
      site_done: "\u73fe\u5730\u6e08",
      quoted: "\u898b\u7a4d",
      ordered: "\u53d7\u6ce8",
      completed: "\u5b8c\u4e86",
      lost: "\u5931\u6ce8"
    };
    const cleanLabelsVi = {
      untreated: "Ch\u01b0a x\u1eed l\u00fd",
      contacted: "\u0110\u00e3 li\u00ean h\u1ec7",
      site_done: "\u0110\u00e3 kh\u1ea3o s\u00e1t",
      quoted: "B\u00e1o gi\u00e1",
      ordered: "\u0110\u00e3 nh\u1eadn \u0111\u01a1n",
      completed: "Ho\u00e0n th\u00e0nh",
      lost: "Th\u1ea5t ch\u00fa / Kh\u00f4ng th\u00e0nh"
    };
    const cleanLabels = state.lang === "vi" ? cleanLabelsVi : cleanLabelsJa;
    return cleanLabels[normalized] || cleanLabelsJa[normalized] || normalized;
  }

  function getStatusClass(status) {
    return "status-" + normalizeRequestStatus(status);
  }

  function getRequestDisplayId(request) {
    return String(
      request?.requestId ||
      request?.requestCode ||
      request?.requestNo ||
      request?.code ||
      request?._id ||
      ""
    );
  }

  function getCustomerName(request) {
    return request?.name || request?.customerName || request?.userName || "-";
  }

  function getRequestContent(request) {
    return request?.content || request?.description || request?.title || request?.category || "-";
  }

  function getRequestDescriptionText(request) {
    return request?.content || request?.description || (state.lang === "vi" ? "Chưa có mô tả" : "詳細は未入力です");
  }

  function getRequestAddress(request) {
    return request?.address || request?.location || "";
  }

  function getAssigneeName(request) {
    if (request?.assigneeName) return request.assigneeName;
    const staffLike = request?.assignedStaff || request?.assignee || request?.staff || request?.responsiblePerson;
    if (staffLike && typeof staffLike === "object") return staffLike.name || "-";
    if (typeof staffLike === "string") return staffLike;
    return "-";
  }

  function getRowId(item) {
    return String(item?._id || item?.id || item?.requestCode || item?.requestId || "");
  }

  function elapsedText(value) {
    const date = value ? new Date(value) : new Date();
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (!Number.isFinite(minutes)) return "-";
    if (minutes < 60) return minutes + "m";
    const hours = Math.floor(minutes / 60);
    if (hours < 48) return hours + "h";
    return Math.floor(hours / 24) + "d";
  }

  function isOverdue(request) {
    if (!request?.createdAt) return false;
    return normalizeRequestStatus(request.status) === "untreated" && Date.now() - new Date(request.createdAt).getTime() > 24 * 60 * 60 * 1000;
  }

  function formatDateTime(value) {
    return formatDate(value);
  }

  function formatRelativeTime(value) {
    return elapsedText(value);
  }

  function getStatusLabel(status) {
    return formatStatus(status);
  }

  function getRequestPhone(request) {
    return request?.phone || request?.contact || request?.tel || "";
  }

  function getRequestMediaCount(request) {
    return normalizeRequestMedia(request).length;
  }

  function hasQuoteRequested(request) {
    return request?.quoteRequested === true || request?.quoteRequested === "true" || String(request?.quote || "").toLowerCase() === "true";
  }

  function requestStatusTime(request) {
    const status = normalizeRequestStatus(request?.status);
    if (status === "completed" || status === "lost") return "";
    if (status === "ordered") return request?.orderedAt || request?.quotedAt || request?.createdAt;
    if (status === "quoted") return request?.quotedAt || request?.firstResponseAt || request?.createdAt;
    if (status === "site_done") return request?.siteVisitedAt || request?.contactedAt || request?.createdAt;
    if (status === "contacted") return request?.contactedAt || request?.firstResponseAt || request?.createdAt;
    return request?.updatedAt || request?.createdAt;
  }

  function computeWaitingTime(request) {
    const value = requestStatusTime(request);
    return value ? formatRelativeTime(value) : "-";
  }

  function getDeadline(request) {
    return request?.deadline || request?.dueDate || request?.responseDeadline || "";
  }

  function getUrgency(request) {
    const raw = String(request?.urgency || request?.priority || "").toLowerCase();
    if (["urgent", "high", "medium", "low"].includes(raw)) return raw;
    const tags = Array.isArray(request?.issueTags) ? request.issueTags.join(" ").toLowerCase() : "";
    if (/urgent|khẩn|緊急|漏電|火災|停電|cháy|chập/.test(tags)) return "urgent";
    return "";
  }

  function getPriorityScore(request) {
    const status = normalizeRequestStatus(request?.status);
    const urgency = getUrgency(request);
    let score = 0;
    if (["untreated", "contacted", "site_done", "quoted"].includes(status)) score += 40;
    if (urgency === "urgent") score += 40;
    if (urgency === "high") score += 25;
    if (isOverdue(request) || getDeadline(request) && new Date(getDeadline(request)).getTime() < Date.now()) score += 30;
    const created = new Date(request?.createdAt || 0).getTime();
    if (created) score += Math.max(0, 10 - Math.floor((Date.now() - created) / 86400000));
    return score;
  }

  function sortRequests(items) {
    const sort = state.filters.sort;
    return [...items].sort((left, right) => {
      if (sort === "oldest") return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
      if (sort === "waiting") return new Date(requestStatusTime(left) || left.createdAt || 0) - new Date(requestStatusTime(right) || right.createdAt || 0);
      if (sort === "deadline") return (new Date(getDeadline(left) || 8640000000000000) - new Date(getDeadline(right) || 8640000000000000));
      if (sort === "overdue") return Number(isOverdue(right)) - Number(isOverdue(left)) || getPriorityScore(right) - getPriorityScore(left);
      if (sort === "priority") return getPriorityScore(right) - getPriorityScore(left) || new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
    });
  }

  function requestDepartmentKeys() {
    return ["construction", "executive", "sales", "design", "operation", "maintenance", "survey", "other"];
  }

  function normalizeDepartmentKey(value) {
    const text = String(value || "").trim().toLowerCase();
    if (!text || text === "-") return "";
    if (/工務|工事|施工|thi công|construction|install/.test(text)) return "construction";
    if (/社長|代表|役員|giám đốc|giam doc|executive|director|president/.test(text)) return "executive";
    if (/営業|kinh doanh|sales|business/.test(text)) return "sales";
    if (/設計|thiết kế|thiet ke|design|cad/.test(text)) return "design";
    if (/業務|nghiệp vụ|nghiep vu|operation|admin|office/.test(text)) return "operation";
    if (/メンテ|保守|修理|bảo trì|bao tri|maintenance|repair/.test(text)) return "maintenance";
    if (/調査| khảo sát|khảo sát|khao sat|survey/.test(text)) return "survey";
    if (/その他|khác|khac|other|misc/.test(text)) return "other";
    return "other";
  }

  function departmentLabel(key) {
    const labels = {
      construction: t("departmentConstruction"),
      executive: t("departmentExecutive"),
      sales: t("departmentSales"),
      design: t("departmentDesign"),
      operation: t("departmentOperation"),
      maintenance: t("departmentMaintenance"),
      survey: t("departmentSurvey"),
      other: t("departmentOther")
    };
    return labels[key] || labels.other;
  }

  function requestDepartmentOptions() {
    const fromStaff = state.staff.map(staff => normalizeDepartmentKey(staffDepartment(staff))).filter(Boolean);
    const keys = [...new Set(fromStaff.concat(requestDepartmentKeys()))];
    return [["", t("departmentFilter")], ["all", t("allRequestDepartments")]].concat(keys.map(key => [key, departmentLabel(key)]));
  }

  function getRequestAssigneeDepartment(item) {
    const assigneeId = String(item?.assigneeId || item?.assignedStaffId || "");
    const assigneeName = String(item?.assigneeName || getAssigneeName(item) || "");
    const staff = state.staff.find(member => {
      const id = String(getRowId(member) || "");
      const name = String(member?.name || "");
      return (id && id === assigneeId) || (name && name === assigneeName);
    });
    return staff ? normalizeDepartmentKey(staffDepartment(staff)) : "";
  }

  function filterRequests(items) {
    const search = state.filters.search.toLowerCase();
    return items.filter(item => {
      if (isSoftDeleted(item)) return false;
      const statusOk = state.filters.requestStatus === "all" || normalizeRequestStatus(item.status) === state.filters.requestStatus;
      const departmentOk = !state.filters.department || state.filters.department === "all" || getRequestAssigneeDepartment(item) === state.filters.department;
      const selectedStaff = state.staff.find(staff => getRowId(staff) === state.filters.staff);
      const staffOk = state.filters.staff === "all"
        || String(item.assigneeId || "") === state.filters.staff
        || String(item.assigneeName || "") === state.filters.staff
        || Boolean(selectedStaff && getAssigneeName(item) === selectedStaff.name);
      const urgency = getUrgency(item) || "none";
      const urgencyOk = state.filters.urgency === "all" || urgency === state.filters.urgency;
      const mediaOk = state.filters.media === "all" || (state.filters.media === "has" ? getRequestMediaCount(item) > 0 : getRequestMediaCount(item) === 0);
      const text = [
        getRequestDisplayId(item),
        getCustomerName(item),
        getRequestContent(item),
        getRequestPhone(item),
        getRequestAddress(item),
        getAssigneeName(item),
        formatStatus(item.status),
        normalizeRequestStatus(item.status)
      ].join(" ").toLowerCase();
      return statusOk && departmentOk && staffOk && urgencyOk && mediaOk && text.includes(search);
    });
  }

  function showToast(message) {
    toast(message);
  }

  function showEmptyState(message) {
    return `<div class="empty-state">${escapeHtml(message || t("noData"))}</div>`;
  }

  function showErrorState(message) {
    return `<div class="error-state"><strong>${escapeHtml(message || t("failed"))}</strong><button class="btn btn-soft" type="button" data-retry>${escapeHtml(t("retry"))}</button></div>`;
  }

  function toast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 1800);
  }

  function logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    localStorage.setItem("adminRedirectAfterLogin", ADMIN_PATH);
    window.location.href = "/login.html?redirect=" + encodeURIComponent(ADMIN_PATH);
  }

  function requireAuth() {
    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY) || 0);
    if (!token() || !loginTime || Date.now() - loginTime > TOKEN_MAX_AGE) {
      window.location.href = loginRedirectUrl();
      return false;
    }
    return true;
  }

  function closeDrawer() {
    const drawer = $("drawer");
    drawer.classList.remove("open");
    drawer.classList.remove("quote-detail-open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = "";
    document.body.classList.remove("quote-modal-open");
  }

  function openDrawer(html) {
    const drawer = $("drawer");
    const isQuoteDetail = html.includes("quote-detail-drawer");
    drawer.innerHTML = html;
    drawer.classList.add("open");
    drawer.classList.toggle("quote-detail-open", isQuoteDetail);
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.toggle("quote-modal-open", isQuoteDetail);
    if (isQuoteDetail) {
      requestAnimationFrame(() => {
        const content = document.querySelector(".quote-wizard-content") || document.querySelector(".quote-detail-main-scroll") || document.querySelector(".quote-detail-content");
        if (content) content.scrollTop = 0;
      });
    }
  }

  function closeConfirm(resolve, value) {
    const overlay = document.querySelector("[data-confirm-overlay]");
    if (overlay) overlay.remove();
    if (window.__adminV2ConfirmKeydown) document.removeEventListener("keydown", window.__adminV2ConfirmKeydown);
    window.__adminV2ConfirmKeydown = null;
    window.__adminV2ConfirmResolve = null;
    if (typeof resolve === "function") resolve(Boolean(value));
  }

  function confirmAction(options) {
    const config = typeof options === "string"
      ? { title: options, message: "", cancelLabel: t("close"), confirmLabel: t("delete"), danger: true }
      : Object.assign({ title: "", message: "", cancelLabel: t("cancel"), confirmLabel: t("confirm"), danger: false }, options || {});
    const variant = config.variant || (config.danger ? "danger" : "default");
    const icon = config.icon || (variant === "danger" ? "!" : variant === "warning" ? "!" : "↺");
    return new Promise(resolve => {
      const existingResolve = window.__adminV2ConfirmResolve;
      if (typeof existingResolve === "function") closeConfirm(existingResolve, false);
      const overlay = document.createElement("div");
      overlay.className = "confirm-overlay";
      overlay.dataset.confirmOverlay = "";
      overlay.innerHTML = `
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="adminConfirmTitle">
          <div class="confirm-content">
            <div class="confirm-icon confirm-icon--${escapeHtml(variant)}" aria-hidden="true">${escapeHtml(icon)}</div>
            <h3 class="confirm-title" id="adminConfirmTitle">${escapeHtml(config.title)}</h3>
            ${config.message ? `<p class="confirm-message">${escapeHtml(config.message)}</p>` : ""}
          </div>
          <div class="confirm-footer">
            <button class="confirm-cancel-btn" type="button" data-confirm-cancel>${escapeHtml(config.cancelLabel)}</button>
            <button class="confirm-submit-btn ${escapeHtml(variant)}" type="button" data-confirm-submit>${escapeHtml(config.confirmLabel)}</button>
          </div>
        </div>
      `;
      overlay.addEventListener("click", event => {
        if (event.target === overlay || event.target.closest("[data-confirm-cancel]")) {
          closeConfirm(resolve, false);
          return;
        }
        const submit = event.target.closest("[data-confirm-submit]");
        if (submit) {
          submit.disabled = true;
          submit.setAttribute("aria-busy", "true");
          closeConfirm(resolve, true);
        }
      });
      window.__adminV2ConfirmKeydown = event => {
        if (event.key === "Escape") closeConfirm(resolve, false);
      };
      window.__adminV2ConfirmResolve = resolve;
      document.addEventListener("keydown", window.__adminV2ConfirmKeydown);
      document.body.appendChild(overlay);
      overlay.querySelector("[data-confirm-submit]")?.focus();
    });
  }

  function renderLayout() {
    document.documentElement.lang = state.lang;
    $("appShell").dataset.view = state.currentView;
    const untreatedCount = state.requests.filter(item => !isSoftDeleted(item) && normalizeRequestStatus(item.status) === "untreated").length;
    const pendingUserCount = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length;
    const warningCount = state.requests.filter(item => !isSoftDeleted(item) && isOverdue(item)).length + pendingUserCount;
    const badgeByView = { requests: untreatedCount, customers: pendingUserCount, notifications: warningCount };
    if ($("globalSearch")) $("globalSearch").placeholder = t("search");
    $("languageSelect").innerHTML = `<option value="vi">Ti\u1ebfng Vi\u1ec7t</option><option value="ja">\u65e5\u672c\u8a9e</option>`;
    $("languageSelect").value = state.lang;
    $("logoutButton").textContent = t("logout");
    $("refreshButton").textContent = t("refresh");
    $("refreshButton").style.display = state.currentView === "quotes" ? "none" : "";
    const renderNavItem = ([view, labelKey, icon]) => `
      <button class="nav-item ${state.currentView === view ? "active" : ""}" type="button" data-view="${view}" data-tooltip="${escapeHtml(navLabel(view, labelKey))}" aria-label="${escapeHtml(navLabel(view, labelKey))}">
        <span class="nav-icon">${navIcon(view, icon)}</span>
        <span class="nav-label">${escapeHtml(navLabel(view, labelKey))}</span>
        ${badgeByView[view] ? `<span class="nav-badge">${badgeByView[view]}</span>` : ""}
      </button>
    `;
    $("sideNav").innerHTML = views.filter(([view]) => view !== "settings").map(renderNavItem).join("");
    $("sideNavBottom").innerHTML = views.filter(([view]) => view === "settings").map(renderNavItem).join("");
    $("viewTitle").textContent = t(state.currentView);
    $("viewEyebrow").textContent = state.currentView === "dashboard" ? "YAMADEN ADMIN" : t(state.currentView).toUpperCase();
  }

  function navIcon(view, fallback) {
    const attrs = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const icons = {
      dashboard: `<svg ${attrs}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>`,
      requests: `<svg ${attrs}><path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="M8 12h8"/><path d="M8 16h6"/></svg>`,
      customers: `<svg ${attrs}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      staff: `<svg ${attrs}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M8 13h3"/><path d="M8 17h8"/></svg>`,
      quotes: `<svg ${attrs}><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-2-1.33V5a2 2 0 0 1 2-2z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>`,
      notifications: `<svg ${attrs}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
      trash: `<svg ${attrs}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`,
      settings: `<svg ${attrs}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.2-2-3.5-2.3 1a7.6 7.6 0 0 0-1.7-1L15.2 7h-4.4l-.3 2.3a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.2a7.8 7.8 0 0 0 .1 2l-2 1.2 2 3.5 2.3-1a7.6 7.6 0 0 0 1.7 1l.3 2.3h4.4l.3-2.3a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.5-2.2-1.2z"/></svg>`
    };
    return icons[view] || escapeHtml(fallback || "");
  }

  function navLabel(view, fallbackKey) {
    const ja = {
      dashboard: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
      requests: "\u4f9d\u983c\u7ba1\u7406",
      customers: "\u9867\u5ba2\u7ba1\u7406",
      staff: "\u30b9\u30bf\u30c3\u30d5\u7ba1\u7406",
      quotes: "\u898b\u7a4d\u30fb\u63d0\u6848",
      notifications: "\u901a\u77e5",
      trash: "\u30b4\u30df\u7bb1",
      settings: "\u8a2d\u5b9a"
    };
    const vi = {
      dashboard: "Dashboard",
      requests: "Y\u00eau c\u1ea7u",
      customers: "Kh\u00e1ch h\u00e0ng",
      staff: "Staff",
      quotes: "B\u00e1o gi\u00e1",
      notifications: "Th\u00f4ng b\u00e1o",
      trash: "Th\u00f9ng r\u00e1c",
      settings: "C\u00e0i \u0111\u1eb7t"
    };
    return (state.lang === "vi" ? vi[view] : ja[view]) || t(fallbackKey);
  }

  async function loadAll() {
    state.loading.requests = true;
    state.loading.users = true;
    state.loading.staff = true;
    state.errors = {};
    state.loading.quotes = true;
    const [requests, users, staff, quotes, workMaster, overviewSettings] = await Promise.allSettled([
      AdminAPI.getRequests(),
      AdminAPI.getUsers(),
      AdminAPI.getStaff(),
      AdminAPI.getQuotes(),
      AdminAPI.getWorkMaster(),
      AdminAPI.getOverviewSettings()
    ]);
    state.requests = requests.status === "fulfilled" ? normalizeList(requests.value) : [];
    state.users = users.status === "fulfilled" ? normalizeList(users.value) : [];
    state.staff = staff.status === "fulfilled" ? normalizeList(staff.value) : [];
    state.quotes = quotes.status === "fulfilled" ? normalizeList(quotes.value) : [];
    state.workMaster = workMaster.status === "fulfilled" ? normalizeWorkMaster(workMaster.value) : { departments: [], workGroups: [], workTypes: [] };
    if (overviewSettings.status === "fulfilled") {
      state.overviewSettings = normalizeOverviewSettings(overviewSettings.value?.settings || overviewSettings.value);
      state.overviewSettingsStatus = overviewSettings.value?.status || null;
    } else {
      state.overviewSettings = normalizeOverviewSettings(state.overviewSettings);
      state.overviewSettingsStatus = null;
    }
    state.errors.requests = requests.status === "rejected" ? requests.reason?.message || "failed" : "";
    state.errors.users = users.status === "rejected" ? users.reason?.message || "failed" : "";
    state.errors.staff = staff.status === "rejected" ? staff.reason?.message || "failed" : "";
    state.errors.quotes = quotes.status === "rejected" ? quotes.reason?.message || "failed" : "";
    state.errors.workMaster = workMaster.status === "rejected" ? workMaster.reason?.message || "failed" : "";
    state.errors.overviewSettings = overviewSettings.status === "rejected" ? overviewSettings.reason?.message || "failed" : "";
    state.loading.requests = false;
    state.loading.users = false;
    state.loading.staff = false;
    state.loading.quotes = false;
  }

  function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.requests)) return payload.requests;
    if (Array.isArray(payload?.staff)) return payload.staff;
    if (Array.isArray(payload?.quotes)) return payload.quotes;
    return [];
  }

  function normalizeWorkMaster(payload) {
    const data = payload?.data || payload || {};
    return {
      departments: Array.isArray(data.departments) ? data.departments : [],
      workGroups: Array.isArray(data.workGroups) ? data.workGroups : [],
      workTypes: Array.isArray(data.workTypes) ? data.workTypes : []
    };
  }

  function defaultOverviewSettings() {
    return {
      company: {
        nameJa: "\u682a\u5f0f\u4f1a\u793e \u5c71\u96fb",
        nameEn: "YAMADEN.CO.LTD",
        sloganJa: "\u4eba\u3092\u5b88\u308a\u3001\u5e78\u305b\u3092\u5275\u308b",
        sloganEn: "Protecting people. Creating happiness.",
        email: "",
        phone: "",
        address: "",
        logoUrl: ""
      },
      system: {
        defaultLanguage: "vi",
        timezone: "Asia/Tokyo",
        dateFormat: "YYYY/MM/DD HH:mm",
        pocMode: true,
        environmentName: "POC"
      },
      requestCode: {
        prefix: "YMD",
        format: "YMD-xxxxxx",
        digits: 6
      },
      poc: {
        groupName: "\u307f\u3069\u308a\u30b0\u30eb\u30fc\u30d7",
        status: "running",
        note: "",
        startDate: "",
        expectedEndDate: ""
      }
    };
  }

  function normalizeOverviewSettings(value) {
    const base = defaultOverviewSettings();
    const input = value || {};
    ["company", "system", "requestCode", "poc"].forEach(section => {
      base[section] = Object.assign({}, base[section], input[section] || {});
    });
    base.system.defaultLanguage = ["vi", "ja"].includes(base.system.defaultLanguage) ? base.system.defaultLanguage : "vi";
    base.system.timezone = base.system.timezone || "Asia/Tokyo";
    base.system.dateFormat = base.system.dateFormat || "YYYY/MM/DD HH:mm";
    base.system.pocMode = base.system.pocMode !== false;
    base.requestCode.prefix = base.requestCode.prefix || "YMD";
    base.requestCode.digits = Number(base.requestCode.digits || 6);
    base.requestCode.format = base.requestCode.format || `${base.requestCode.prefix}-${"x".repeat(base.requestCode.digits || 6)}`;
    return base;
  }

  function isSoftDeleted(item) {
    return Boolean(item?.isDeleted) || Boolean(item?.deletedAt) || normalizeUserStatusValue(item?.status) === "deleted";
  }

  function renderCurrentView() {
    renderLayout();
    const map = {
      dashboard: renderDashboard,
      requests: renderRequests,
      customers: renderCustomers,
      staff: renderStaff,
      quotes: renderQuotes,
      trash: renderTrash,
      notifications: renderNotifications,
      settings: renderSettings
    };
    (map[state.currentView] || renderDashboard)();
  }

  function renderDashboard() {
    const activeRequests = state.requests.filter(item => !isSoftDeleted(item));
    const untreated = activeRequests.filter(item => normalizeRequestStatus(item.status) === "untreated");
    const overdue = activeRequests.filter(isOverdue);
    const quoted = activeRequests.filter(item => normalizeRequestStatus(item.status) === "quoted");
    const ordered = activeRequests.filter(item => normalizeRequestStatus(item.status) === "ordered");
    const pendingUsers = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending");
    const activeStaff = state.staff.filter(item => !["off", "deleted"].includes(normalizeStaffStatus(item.status || "active")));
    const priority = sortRequests(activeRequests
      .filter(item => !["completed", "lost"].includes(normalizeRequestStatus(item.status)))
      .filter(item => ["untreated", "contacted", "site_done", "quoted"].includes(normalizeRequestStatus(item.status)) || getPriorityScore(item) > 0))
      .slice(0, 5);
    const dashboardSubtitle = state.lang === "vi"
      ? "Trung tâm vận hành YAMADEN CS - Tổng quan tình trạng xử lý yêu cầu, khách hàng và nhân viên."
      : "YAMADEN CSオペレーションセンター - 依頼、顧客、スタッフの対応状況を確認できます。";
    const todayLabel = state.lang === "vi" ? "Hôm nay" : "今日";
    const aiItems = [
      [t("aiUrgency"), state.lang === "vi" ? "Phân tích độ khẩn từ nội dung và trạng thái." : "内容と状態から緊急度を分析します。", "!"],
      [t("aiAssign"), state.lang === "vi" ? "Đề xuất người phụ trách phù hợp." : "最適な担当者を提案します。", "◎"],
      [t("aiPriority"), state.lang === "vi" ? "Tự động chọn yêu cầu cần ưu tiên." : "優先すべき案件を抽出します。", "★"]
    ];
    $("viewRoot").innerHTML = `
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">YAMADEN ADMIN</p>
          <h1>${escapeHtml(t("dashboard"))}</h1>
          <p>${escapeHtml(dashboardSubtitle)}</p>
        </div>
        <div class="dashboard-actions">
          <span class="date-pill">${escapeHtml(todayLabel)} · ${escapeHtml(new Date().toLocaleDateString(state.lang === "ja" ? "ja-JP" : "vi-VN"))}</span>
          <button class="refresh-button" type="button" data-retry>${escapeHtml(t("refresh"))}</button>
        </div>
      </header>
      <div class="kpi-grid dashboard-kpis">
        ${statCard(t("totalRequests"), activeRequests.length, t("realData"), "total", "clipboard", "requests:requestStatus:all")}
        ${statCard(t("untreated"), untreated.length, t("realData"), "danger", "clock", "requests:requestStatus:untreated")}
        ${statCard(t("overdue"), overdue.length, t("realData"), "warning", "alert", "requests:requestStatus:untreated")}
        ${statCard(t("customersCount"), state.users.length, t("realData"), "info", "building", "customers:customerStatus:all")}
        ${statCard(t("staffCount"), state.staff.length, activeStaff.length + " active", "success", "users")}
        ${statCard(t("quotingCount"), quoted.length, t("realData"), "warning", "receipt")}
        ${statCard(t("quoteRate"), quoted.length ? Math.round(ordered.length / Math.max(quoted.length, 1) * 100) + "%" : "-", quoted.length ? t("realData") : t("planned"), "success", "trend")}
        ${statCard(t("firstResponse"), "-", t("planned"), "info", "timer")}
      </div>
      <div class="dashboard-main-grid">
        <div class="dashboard-left-stack">
          <section class="section-card priority-card">
            <div class="panel-head"><h2>${escapeHtml(t("priorityRequests"))}</h2><span class="dashboard-count">${priority.length}</span><button class="mini-button" type="button" data-view="requests">${escapeHtml(t("all"))} →</button></div>
            <div class="panel-body">
              ${priority.length ? `<div class="table-wrap table-card dashboard-priority-wrap"><table class="data-table operation-table priority-table"><thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("status")}</th><th>${t("assignee")}</th><th>${t("elapsed")}</th><th>${t("action")}</th></tr></thead><tbody>${priority.map(renderPriorityRequest).join("")}</tbody></table></div>` : compactEmptyState(t("noPriorityRequests"))}
            </div>
          </section>
          <section class="section-card dashboard-preview-card">
            <div class="panel-head"><h2>${escapeHtml(t("staffPreview"))}</h2></div>
            <div class="panel-body mini-list">
              ${state.staff.length ? state.staff.slice(0, 4).map(staff => `<div class="mini-list-item">${avatarHtml(staff)}<div><strong>${escapeHtml(staff.name || "-")}</strong><span>${escapeHtml(staff.department || staff.areas || "-")}</span></div><span class="status-badge status-${escapeHtml(staff.status || "active")}">${escapeHtml(staffStatusMap[staff.status || "active"] || staff.status || "active")}</span></div>`).join("") : compactEmptyState()}
            </div>
          </section>
        </div>
        <aside class="dashboard-side-stack">
          <section class="section-card ai-panel">
            <div class="panel-head"><div><h2>${escapeHtml(t("aiPanel"))}</h2><p class="note">${escapeHtml(state.lang === "vi" ? "Tự động phân tích và đề xuất thao tác vận hành." : "自動分析で運用アクションを提案します。")}</p></div></div>
            <div class="panel-body ai-list">
              ${aiItems.map(([label, desc, icon]) => `<div class="ai-item"><i>${escapeHtml(icon)}</i><div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(desc)}</span></div><b>${escapeHtml(t("preparing"))}</b></div>`).join("")}
            </div>
          </section>
          <section class="section-card quick-actions-card">
            <div class="panel-head"><h2>${escapeHtml(t("quickActions"))}</h2></div>
            <div class="panel-body quick-action-grid">
              ${[t("createRequest"), t("assignStaffAction"), t("createQuote"), t("addNote")].map(label => `<button class="btn btn-soft" disabled title="${escapeHtml(t("planned"))}">${escapeHtml(label)}<small>${escapeHtml(t("planned"))}</small></button>`).join("")}
            </div>
          </section>
          <section class="section-card dashboard-preview-card">
            <div class="panel-head"><h2>${escapeHtml(t("customerPreview"))}</h2></div>
            <div class="panel-body mini-list">
              ${pendingUsers.length ? pendingUsers.slice(0, 3).map(user => `<div class="mini-list-item">${avatarHtml(user)}<div><strong>${escapeHtml(user.name || user.phone || "-")}</strong><span>${escapeHtml(user.phone || "")}</span></div><span class="status-badge status-pendingApproval">${escapeHtml(userStatusMap[user.status] || user.status)}</span></div>`).join("") : compactEmptyState()}
            </div>
          </section>
        </aside>
      </div>
    `;
  }

  function statCard(label, value, helper, tone, icon, dashboardFilter) {
    const attrs = dashboardFilter ? ` role="button" tabindex="0" data-dashboard-filter="${escapeHtml(dashboardFilter)}"` : "";
    return `<div class="kpi-card kpi-${escapeHtml(tone || "total")}${dashboardFilter ? " clickable-kpi" : ""}"${attrs}><div class="kpi-icon">${kpiIconSvg(icon || "clipboard")}</div><span class="stat-label">${escapeHtml(label)}</span><strong class="stat-value">${escapeHtml(value)}</strong><small>${escapeHtml(helper || "")}</small></div>`;
  }

  function kpiIconSvg(name) {
    const common = `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"`;
    const icons = {
      clipboard: `<svg ${common}><rect x="8" y="3" width="8" height="4" rx="1"></rect><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><path d="M9 12h6M9 16h4"></path></svg>`,
      clock: `<svg ${common}><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
      alert: `<svg ${common}><path d="M10.3 4.4 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4M12 17h.01"></path></svg>`,
      building: `<svg ${common}><path d="M3 21h18"></path><path d="M5 21V5a2 2 0 0 1 2-2h7v18"></path><path d="M14 8h3a2 2 0 0 1 2 2v11"></path><path d="M8 7h2M8 11h2M8 15h2"></path></svg>`,
      users: `<svg ${common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg>`,
      userCheck: `<svg ${common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="m16 11 2 2 4-4"></path></svg>`,
      briefcase: `<svg ${common}><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M3 13h18"></path><path d="M12 12v2"></path></svg>`,
      pauseCircle: `<svg ${common}><circle cx="12" cy="12" r="9"></circle><path d="M10 9v6M14 9v6"></path></svg>`,
      layers: `<svg ${common}><path d="m12 2 9 5-9 5-9-5 9-5Z"></path><path d="m3 12 9 5 9-5"></path><path d="m3 17 9 5 9-5"></path></svg>`,
      tags: `<svg ${common}><path d="M12.5 3H4a1 1 0 0 0-1 1v8.5a2 2 0 0 0 .6 1.4l6.5 6.5a2 2 0 0 0 2.8 0l7.5-7.5a2 2 0 0 0 0-2.8L13.9 3.6A2 2 0 0 0 12.5 3Z"></path><path d="M7.5 7.5h.01"></path><path d="M16 5l3 3"></path></svg>`,
      receipt: `<svg ${common}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M8 8h8M8 12h8M8 16h5"></path></svg>`,
      trend: `<svg ${common}><path d="m3 17 6-6 4 4 8-8"></path><path d="M14 7h7v7"></path></svg>`,
      timer: `<svg ${common}><path d="M10 2h4"></path><path d="M12 14v-4"></path><circle cx="12" cy="14" r="8"></circle><path d="m17 7 1.5-1.5"></path></svg>`
    };
    return icons[name] || icons.clipboard;
  }

  function miniMetric(label, value) {
    return `<div class="mini-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
  }

  function renderPriorityRequest(item) {
    const id = getRowId(item);
    return `<tr data-request-detail="${escapeHtml(id)}">
      <td><strong>${escapeHtml(getRequestDisplayId(item))}</strong></td>
      <td>${escapeHtml(getCustomerName(item))}</td>
      <td><div class="text-clamp-1">${escapeHtml(getRequestContent(item))}</div></td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td>${escapeHtml(getAssigneeName(item))}</td>
      <td>${escapeHtml(computeWaitingTime(item))}</td>
      <td><button class="btn btn-soft" type="button" data-request-detail="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button></td>
    </tr>`;
  }

  function compactEmptyState(message) {
    return `<div class="compact-empty-state"><span>○</span><strong>${escapeHtml(message || t("noData"))}</strong></div>`;
  }

  function emptyHtml(message) {
    return `<div class="empty">${escapeHtml(message || t("noData"))}</div>`;
  }

  function requestFilterStatuses() {
    return ["all", ...requestStatusValues()];
  }

  function requestBoardStatuses() {
    return requestStatusValues();
  }

  function renderRequestFilterChips() {
    const activeRequests = state.requests.filter(item => !isSoftDeleted(item));
    return requestFilterStatuses().map(status => {
      const count = status === "all" ? activeRequests.length : activeRequests.filter(item => normalizeRequestStatus(item.status) === status).length;
      return `<button class="request-status-chip ${state.filters.requestStatus === status ? "active" : ""}" type="button" data-request-filter="${status}"><span class="chip-label">${escapeHtml(status === "all" ? t("all") : formatStatus(status))}</span><b class="chip-count">${count}</b></button>`;
    }).join("");
  }

  function renderRequestResultsHtml(filtered) {
    return state.filters.requestViewMode === "table" ? `<div class="table-wrap request-table-wrap">
      <table class="data-table request-table">
        <thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("urgency")}</th><th>${t("assignee")}</th><th>${t("status")}</th><th>${t("elapsed")}</th><th>${t("deadline")}</th><th>${t("mediaCount")}</th><th>${t("amount")}</th><th>${t("action")}</th></tr></thead>
        <tbody>
          ${filtered.length ? filtered.map(renderRequestRow).join("") : `<tr><td colspan="11">${showEmptyState(t("noRequests"))}</td></tr>`}
        </tbody>
      </table>
    </div>` : renderRequestKanbanPreview(filtered, requestBoardStatuses());
  }

  function syncRequestControls() {
    const chipRow = document.querySelector(".request-status-row");
    if (chipRow) chipRow.innerHTML = renderRequestFilterChips();
    document.querySelectorAll("[data-view-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.viewMode === state.filters.requestViewMode);
    });
  }

  function renderRequestResults() {
    syncRequestControls();
    const results = $("requestResults");
    if (!results) {
      renderRequests();
      return;
    }
    results.innerHTML = renderRequestResultsHtml(sortRequests(filterRequests(state.requests)));
  }

  function renderRequests() {
    const filtered = sortRequests(filterRequests(state.requests));
    if (state.loading.requests) {
      $("viewRoot").innerHTML = `<div class="loading-state">${escapeHtml(t("loading"))}</div>`;
      return;
    }
    if (state.errors.requests) {
      $("viewRoot").innerHTML = showErrorState(t("loadRequestsError"));
      return;
    }
    $("viewRoot").innerHTML = `
      <div class="page-intro">
        <p>${escapeHtml(t("requestSubtitle"))}</p>
      </div>
      <div class="request-command-bar demo-actions">
        <button class="btn btn-soft request-action-btn export" disabled>${escapeHtml(t("export"))}</button>
        <button class="btn btn-primary request-action-btn create" disabled>+ ${escapeHtml(t("newRequest"))}</button>
        <div class="segmented request-view-toggle">
          <button class="request-action-btn ${state.filters.requestViewMode === "table" ? "active" : ""}" type="button" data-view-mode="table">${escapeHtml(t("tableFormat"))}</button>
          <button class="request-action-btn ${state.filters.requestViewMode === "kanban" ? "active" : ""}" type="button" data-view-mode="kanban">${escapeHtml(t("kanbanView"))}</button>
        </div>
      </div>
      <div class="request-status-row">
        ${renderRequestFilterChips()}
      </div>
      <div class="request-filter-bar">
        <input id="requestSearch" class="request-search-input" value="${escapeHtml(state.filters.search)}" placeholder="${escapeHtml(t("search"))}" />
        <button class="request-search-btn" type="button" data-request-search>${escapeHtml(t("searchButton"))}</button>
        <select class="request-filter-select" data-filter-select="department" aria-label="${escapeHtml(t("departmentFilter"))}">
          ${requestDepartmentOptions().map(([value, label]) => `<option value="${escapeHtml(value)}" ${state.filters.department === value ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
        <select class="request-filter-select" data-filter-select="staff"><option value="all" ${state.filters.staff === "all" ? "selected" : ""}>${escapeHtml(t("assignee"))}</option>${state.staff.map(staff => `<option value="${escapeHtml(getRowId(staff) || staff.name || "")}" ${state.filters.staff === getRowId(staff) ? "selected" : ""}>${escapeHtml(staff.name || "-")}</option>`).join("")}</select>
        <select class="request-filter-select" data-filter-select="urgency">
          <option value="all" ${state.filters.urgency === "all" ? "selected" : ""}>${escapeHtml(t("urgency"))}</option>
          <option value="urgent" ${state.filters.urgency === "urgent" ? "selected" : ""}>${escapeHtml(t("urgencyUrgent"))}</option><option value="high" ${state.filters.urgency === "high" ? "selected" : ""}>${escapeHtml(t("urgencyHigh"))}</option><option value="medium" ${state.filters.urgency === "medium" ? "selected" : ""}>${escapeHtml(t("urgencyMedium"))}</option><option value="low" ${state.filters.urgency === "low" ? "selected" : ""}>${escapeHtml(t("urgencyLow"))}</option><option value="none" ${state.filters.urgency === "none" ? "selected" : ""}>${escapeHtml(t("unjudged"))}</option>
        </select>
        <select class="request-filter-select" data-filter-select="media">
          <option value="all" ${state.filters.media === "all" ? "selected" : ""}>${escapeHtml(t("mediaFilter"))}</option>
          <option value="has" ${state.filters.media === "has" ? "selected" : ""}>${escapeHtml(t("hasMedia"))}</option>
          <option value="none" ${state.filters.media === "none" ? "selected" : ""}>${escapeHtml(t("noMedia"))}</option>
        </select>
        <select class="request-filter-select" data-filter-select="sort">
          <option value="priority" ${state.filters.sort === "priority" ? "selected" : ""}>${escapeHtml(t("prioritySort"))}</option>
          <option value="newest" ${state.filters.sort === "newest" ? "selected" : ""}>${escapeHtml(t("newest"))}</option>
          <option value="oldest" ${state.filters.sort === "oldest" ? "selected" : ""}>${escapeHtml(t("oldest"))}</option>
          <option value="waiting" ${state.filters.sort === "waiting" ? "selected" : ""}>${escapeHtml(t("elapsed"))}</option>
          <option value="deadline" ${state.filters.sort === "deadline" ? "selected" : ""}>${escapeHtml(t("deadline"))}</option>
          <option value="overdue" ${state.filters.sort === "overdue" ? "selected" : ""}>${escapeHtml(t("overdueFirst"))}</option>
        </select>
      </div>
      <div id="requestResults">
        ${renderRequestResultsHtml(filtered)}
      </div>
    `;
  }

  function renderRequestRow(item) {
    const id = getRowId(item);
    const deadline = getDeadline(item) ? formatDateTime(getDeadline(item)) : "-";
    const urgency = getUrgency(item);
    const mediaCount = getRequestMediaCount(item);
    return `<tr>
      <td data-label="${t("id")}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong></td>
      <td data-label="${t("customer")}"><div class="row-title">${escapeHtml(getCustomerName(item))}</div><div class="subtext">${escapeHtml(getRequestPhone(item))}</div></td>
      <td data-label="${t("content")}"><div class="text-clamp-1">${escapeHtml(getRequestContent(item))}</div><div class="subtext text-clamp-1">${escapeHtml(getRequestAddress(item))}</div>${hasQuoteRequested(item) ? `<span class="mini-flag">${escapeHtml(t("quoteRequested"))}</span>` : ""}${isOverdue(item) ? `<span class="mini-flag danger">${escapeHtml(t("overdue"))}</span>` : ""}</td>
      <td data-label="${t("urgency")}">${urgency ? `<span class="urgency-badge urgency-${escapeHtml(urgency)}">${escapeHtml(urgency)}</span>` : `<span class="muted-dash">-</span>`}</td>
      <td data-label="${t("assignee")}">${escapeHtml(getAssigneeName(item))}</td>
      <td data-label="${t("status")}"><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td data-label="${t("elapsed")}">${escapeHtml(computeWaitingTime(item))}</td>
      <td data-label="${t("deadline")}">${escapeHtml(deadline)}</td>
      <td data-label="${t("mediaCount")}">${mediaCount ? `<button class="media-count" type="button" data-request-detail="${escapeHtml(id)}">${mediaCount}</button>` : `<span class="muted-dash">0</span>`}</td>
      <td data-label="${t("amount")}">${escapeHtml(item.amount || item.totalAmount || "-")}</td>
      <td data-label="${t("action")}"><div class="actions"><button class="btn btn-soft" type="button" data-request-detail="${escapeHtml(id)}">${t("detail")}</button>${statusSelectHtml(id, item.status)}</div></td>
    </tr>`;
  }

  function renderRequestKanbanPreview(items, statuses) {
    return `<section class="section-card kanban-preview-section">
      <div class="panel-head"><h2>${escapeHtml(t("kanbanPreview"))}</h2><button class="mini-button" disabled>${escapeHtml(t("all"))} →</button></div>
      <div class="panel-body">${renderRequestKanban(items, statuses)}</div>
    </section>`;
  }

  function renderRequestKanban(items, statuses) {
    return `<div class="kanban-board">${statuses.map(status => {
      const rows = items.filter(item => normalizeRequestStatus(item.status) === status);
      return `<section class="kanban-column"><h3>${escapeHtml(formatStatus(status))}<span>${rows.length}</span></h3>${rows.length ? rows.map(item => `<button class="request-mobile-card" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span><p>${escapeHtml(getRequestContent(item))}</p><small>${escapeHtml(getCustomerName(item))} / ${escapeHtml(computeWaitingTime(item))}</small><span class="kanban-meta">${getRequestMediaCount(item) ? escapeHtml(t("mediaCount")) + ": " + getRequestMediaCount(item) : ""}${hasQuoteRequested(item) ? " / " + escapeHtml(t("quoteRequested")) : ""}</span></button>`).join("") : showEmptyState()}</section>`;
    }).join("")}</div>`;
  }

  function statusSelectHtml(id, current) {
    const statuses = requestStatusValues();
    return `<select class="status-select" data-request-status="${escapeHtml(id)}">${statuses.map(status => `<option value="${status}" ${normalizeRequestStatus(current) === status ? "selected" : ""}>${escapeHtml(formatStatus(status))}</option>`).join("")}</select>`;
  }

  function requestStatusOptions(current) {
    return requestStatusValues()
      .map(status => `<option value="${status}" ${normalizeRequestStatus(current) === status ? "selected" : ""}>${escapeHtml(formatStatus(status))}</option>`)
      .join("");
  }

  function requestUrgencyOptions(current) {
    const value = getUrgency({ urgency: current }) || "none";
    return [
      ["none", t("unjudged")],
      ["urgent", t("urgencyUrgent")],
      ["high", t("urgencyHigh")],
      ["medium", t("urgencyMedium")],
      ["low", t("urgencyLow")]
    ].map(([key, label]) => `<option value="${escapeHtml(key)}" ${value === key ? "selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function formatDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  }

  function renderRequestMediaItem(item, index) {
    const url = item.secureUrl || item.url;
    const type = item.type || item.resourceType || (/(\.mp4|\.mov|\.webm|\.m4v)(\?|$)/i.test(url) ? "video" : /(\.jpg|\.jpeg|\.png|\.webp)(\?|$)/i.test(url) ? "image" : "file");
    const attrs = `data-media-preview="${escapeHtml(url)}" data-media-type="${escapeHtml(type)}"`;
    if (type !== "video" && type !== "image") {
      const name = item.originalName || item.fileName || url.split("/").pop() || "File";
      return `<a class="request-media-item request-file-item" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(name)}"><span>${escapeHtml(name)}</span><small>${escapeHtml(state.lang === "vi" ? "File nay khong the xem truc tiep trong app. Vui long tai ve hoac mo bang ung dung phu hop." : "This file cannot be previewed in the app. Please download it.")}</small></a>`;
    }
    return `<button class="request-media-item" type="button" ${attrs} aria-label="${escapeHtml(t("media"))} ${index + 1}">${type === "video"
      ? `<video src="${escapeHtml(url)}" controls playsinline></video>`
      : `<img src="${escapeHtml(url)}" alt="">`}</button>`;
  }

  function getAssignmentCandidates(request) {
    return Array.isArray(request?.assignmentCandidates) ? request.assignmentCandidates.filter(Boolean) : [];
  }

  function getAssignmentCandidateStaffId(candidate) {
    return String(candidate?.staffId || candidate?.id || candidate?._id || "");
  }

  function getAssignmentCandidateName(candidate) {
    return String(candidate?.staffName || candidate?.name || candidate?.staff?.name || "");
  }

  function getAssignmentCandidateReasons(candidate) {
    if (Array.isArray(candidate?.reasons)) return candidate.reasons.filter(Boolean).map(String);
    if (candidate?.reason) return [String(candidate.reason)];
    return [];
  }

  function renderAssignmentSuggestionPanel(request, candidates, requestId) {
    const emptyReason = request?.assignmentReason || (state.lang === "vi"
      ? "Chưa đủ dữ liệu để gợi ý người phụ trách"
      : "担当者を提案するための情報が不足しています");
    const title = state.lang === "vi" ? "Gợi ý phân công" : escapeHtml(t("suggestAssignee"));
    if (!candidates.length) {
      return `
        <section class="assign-suggestion">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <p class="note">${escapeHtml(emptyReason)}</p>
          </div>
        </section>
      `;
    }
    return `
      <section class="assign-suggestion assign-suggestion-list">
        <div class="assign-suggestion-head">
          <strong>${escapeHtml(title)}</strong>
          <p class="note">${escapeHtml(request?.assignmentReason || (state.lang === "vi" ? "Admin chọn một nhân sự phù hợp từ danh sách gợi ý." : "候補から担当者を選択してください。"))}</p>
        </div>
        <div class="assignment-candidate-list">
          ${candidates.map(candidate => {
            const staffId = getAssignmentCandidateStaffId(candidate);
            const name = getAssignmentCandidateName(candidate) || "-";
            const reasons = getAssignmentCandidateReasons(candidate);
            const score = Number(candidate?.score || 0);
            const department = candidate?.departmentCode ? ` · ${candidate.departmentCode}` : "";
            return `
              <article class="assignment-candidate-card">
                <div>
                  <strong>${escapeHtml(name)}</strong>
                  <p class="note">${escapeHtml(`${state.lang === "vi" ? "Điểm" : "スコア"}: ${score}${department}`)}</p>
                  ${reasons.length ? `<ul>${reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}</ul>` : ""}
                </div>
                <button class="btn btn-soft" type="button"
                  data-accept-assignment-candidate="${escapeHtml(requestId)}"
                  data-staff-id="${escapeHtml(staffId)}"
                  data-staff-name="${escapeHtml(name)}"
                  data-assignment-score="${escapeHtml(String(score))}"
                  data-assignment-reason="${escapeHtml(reasons.join("; "))}">
                  ${escapeHtml(state.lang === "vi" ? "Chọn người này" : t("applyAssignee"))}
                </button>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function renderRequestDetail(request) {
    const id = getRowId(request);
    const media = normalizeRequestMedia(request);
    const timeline = Array.isArray(request.timeline) ? request.timeline : [];
    const assignmentCandidates = getAssignmentCandidates(request);
    const quoteLinked = Boolean(request.quoteId || request.quoteNo || request.quoteCode);
    const quoteButtonLabel = quoteLinked
      ? (state.lang === "vi" ? "M\u1edf b\u00e1o gi\u00e1" : "\u898b\u7a4d\u3092\u958b\u304f")
      : t("createQuote");
    const existing = $("requestDetailOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "requestDetailOverlay";
    overlay.className = "request-detail-overlay";
    overlay.dataset.requestDetailId = id;
    overlay.dataset.dirty = "false";
    overlay.innerHTML = `
      <article class="request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="requestDetailTitle">
        <header class="request-detail-header">
          <div>
            <p class="eyebrow">${escapeHtml(t("requestDetailTitle"))}</p>
            <h2 id="requestDetailTitle">${escapeHtml(getRequestDisplayId(request))}</h2>
            <p class="note">${escapeHtml(getCustomerName(request))} · ${escapeHtml(formatDateTime(request.createdAt))}</p>
          </div>
          <div class="request-detail-header-actions">
            <span class="status-badge ${getStatusClass(request.status)}">${escapeHtml(formatStatus(request.status))}</span>
            <button class="close-button" type="button" data-close-request-detail aria-label="${escapeHtml(t("close"))}">&times;</button>
          </div>
        </header>
        <div class="request-detail-body">
          <section class="request-detail-info">
            <div class="request-detail-section-head"><h3>${escapeHtml(t("requestInfo"))}</h3></div>
            <div class="request-info-grid">
              ${infoItem(t("id"), getRequestDisplayId(request))}
              ${infoItem(t("customer"), getCustomerName(request))}
              ${infoItem(t("phone"), getRequestPhone(request))}
              ${infoItem(t("status"), formatStatus(request.status))}
              ${infoItem(t("assignee"), getAssigneeName(request))}
              ${infoItem(t("urgency"), getUrgency(request) || t("unjudged"))}
              ${infoItem(t("createdAt"), formatDateTime(request.createdAt))}
              ${infoItem(t("elapsed"), computeWaitingTime(request))}
              ${infoItem(t("deadline"), formatDateTime(getDeadline(request)))}
              ${infoItem(t("quoteRequested"), hasQuoteRequested(request) ? t("quoteRequested") : "-")}
              <div class="info-item wide"><b>${escapeHtml(t("address"))}</b><span>${escapeHtml(getRequestAddress(request) || "-")}</span></div>
              <div class="info-item wide"><b>${escapeHtml(t("content"))}</b><span>${escapeHtml(getRequestDescriptionText(request))}</span></div>
              <div class="info-item wide"><b>${escapeHtml(t("issueTags"))}</b><span>${escapeHtml(Array.isArray(request.issueTags) && request.issueTags.length ? request.issueTags.join(", ") : (state.lang === "vi" ? "Chưa phân loại" : "未分類"))}</span></div>
            </div>
            <section class="request-admin-edit">
              <div class="request-detail-section-head"><h3>${escapeHtml(t("adminEditSection"))}</h3></div>
              <div class="request-edit-grid">
                <label class="field"><span>${escapeHtml(t("status"))}</span><select data-request-edit-field="status">${requestStatusOptions(request.status)}</select></label>
                <label class="field"><span>${escapeHtml(t("assignee"))}</span>${staffSelectHtml(request.assigneeId, "data-request-edit-field=\"assigneeId\"")}</label>
                <label class="field"><span>${escapeHtml(t("urgency"))}</span><select data-request-edit-field="urgency">${requestUrgencyOptions(request.urgency || request.priority)}</select></label>
                <label class="field"><span>${escapeHtml(t("dueAt"))}</span><input type="date" data-request-edit-field="dueAt" value="${escapeHtml(formatDateInput(getDeadline(request)))}"></label>
                <label class="field"><span>${escapeHtml(t("amount"))}</span><input type="text" data-request-edit-field="amount" value="${escapeHtml(request.amount || request.totalAmount || "")}"></label>
                <label class="field full"><span>${escapeHtml(t("adminNote"))}</span><textarea data-request-edit-field="adminReply">${escapeHtml(request.adminReply || "")}</textarea></label>
              </div>
              ${renderAssignmentSuggestionPanel(request, assignmentCandidates, id)}
            </section>
            <section>
              <h3>${escapeHtml(t("timeline"))}</h3>
              <div class="timeline">${timeline.length ? timeline.map(item => `<div class="timeline-item"><strong>${escapeHtml(formatStatus(item.status || item.type))}</strong><div class="subtext">${escapeHtml(formatDate(item.createdAt))}</div><div>${escapeHtml(item.note || item.message || "")}</div></div>`).join("") : emptyHtml()}</div>
            </section>
          </section>
          <section class="request-detail-media">
            <div class="request-detail-section-head"><h3>${escapeHtml(t("media"))}</h3><span class="note">${media.length}</span></div>
            ${media.length ? `<div class="request-media-grid">${media.map(renderRequestMediaItem).join("")}</div>` : `<div class="empty-state">${escapeHtml(t("noMediaDetail"))}</div>`}
          </section>
        </div>
        <footer class="request-detail-footer">
          <span class="request-unsaved-note" data-unsaved-note hidden>${escapeHtml(t("unsavedChanges"))}</span>
          <button class="btn btn-soft" type="button" data-create-quote-from-request="${escapeHtml(id)}">${escapeHtml(quoteButtonLabel)}</button>
          <button class="ghost-button" type="button" data-close-request-detail>${escapeHtml(t("close"))}</button>
          <button class="primary-button" type="button" data-save-request="${escapeHtml(id)}" disabled>${escapeHtml(t("saveChanges"))}</button>
        </footer>
      </article>
    `;
    document.body.appendChild(overlay);
  }

  function infoItem(label, value) {
    return `<div class="info-item"><b>${escapeHtml(label)}</b><span>${escapeHtml(value || "-")}</span></div>`;
  }

  function customerInfoItem(label, value) {
    return `<div class="customer-info-item"><div class="customer-info-label">${escapeHtml(label)}</div><div class="customer-info-value">${escapeHtml(value || "-")}</div></div>`;
  }

  function displayBoolean(value) {
    if (value === true) return state.lang === "vi" ? "C\u00f3" : "\u3042\u308a";
    if (value === false) return state.lang === "vi" ? "Kh\u00f4ng" : "\u306a\u3057";
    return "-";
  }

  function guessMediaType(url) {
    const clean = String(url || "").split("?")[0].toLowerCase();
    if (/\.(mp4|mov|webm|m4v|avi)$/i.test(clean)) return "video";
    if (/\.(jpg|jpeg|png|gif|webp|heic|heif|bmp)$/i.test(clean)) return "image";
    if (clean.includes("/video/upload/")) return "video";
    if (clean.includes("/image/upload/")) return "image";
    return "image";
  }

  function normalizeMediaUrl(url) {
    return String(url || "")
      .trim()
      .replace(/^http:\/\//i, "https://")
      .replace(/\?.*$/, "")
      .replace(/#.*$/, "");
  }

  function dedupeMedia(items) {
    const seen = new Set();
    const result = [];
    for (const item of items || []) {
      if (!item || !item.url) continue;
      const key = normalizeMediaUrl(item.url);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(Object.assign({}, item, {
        url: item.url,
        type: item.type || guessMediaType(item.url)
      }));
    }
    return result;
  }

  function normalizeRequestMedia(request) {
    const raw = [];
    if (Array.isArray(request?.mediaFiles)) {
      request.mediaFiles.forEach(item => {
        if (!item) return;
        if (typeof item === "string") {
          raw.push({ url: item, type: guessMediaType(item), source: "mediaFiles" });
          return;
        }
        const url = item.url || item.secureUrl || item.secure_url || item.path || item.src;
        if (!url) return;
        raw.push({
          url,
          type: item.type || item.mediaType || guessMediaType(url),
          source: "mediaFiles"
        });
      });
    }
    if (request?.mediaUrl) {
      raw.push({ url: request.mediaUrl, type: request.mediaType || guessMediaType(request.mediaUrl), source: "mediaUrl" });
    }
    if (request?.image) {
      raw.push({ url: request.image, type: "image", source: "image" });
    }
    if (Array.isArray(request?.images)) {
      request.images.forEach(url => {
        if (url) raw.push({ url, type: "image", source: "images" });
      });
    }
    if (Array.isArray(request?.attachments)) {
      request.attachments.forEach(item => {
        if (!item) return;
        const url = typeof item === "string" ? item : (item.url || item.secureUrl || item.secure_url || item.path || item.src);
        if (!url) return;
        raw.push({
          url,
          type: typeof item === "string" ? guessMediaType(url) : (item.type || item.mediaType || guessMediaType(url)),
          source: "attachments"
        });
      });
    }
    if (Array.isArray(request?.files)) {
      request.files.forEach(item => {
        if (!item) return;
        const url = typeof item === "string" ? item : (item.url || item.secureUrl || item.secure_url || item.path || item.src);
        if (!url) return;
        raw.push({
          url,
          type: typeof item === "string" ? guessMediaType(url) : (item.type || item.mediaType || guessMediaType(url)),
          source: "files"
        });
      });
    }
    return dedupeMedia(raw);
  }

  function collectMedia(request) {
    return normalizeRequestMedia(request);
  }

  function renderMedia(item) {
    const url = item.secureUrl || item.url;
    const type = item.type || item.resourceType || guessMediaType(url);
    return type === "video"
      ? `<video src="${escapeHtml(url)}" controls playsinline></video>`
      : `<img src="${escapeHtml(url)}" alt="">`;
  }

  function staffSelectHtml(selectedId, attrs = "") {
    return `<select id="requestStaffSelect" ${attrs}>${[""].concat(state.staff.map(item => getRowId(item))).map(id => {
      const staff = state.staff.find(item => getRowId(item) === id);
      return `<option value="${escapeHtml(id)}" ${String(selectedId || "") === String(id) ? "selected" : ""}>${escapeHtml(staff ? staff.name : "-")}</option>`;
    }).join("")}</select>`;
  }

  function compactText(value, fallback) {
    return String(value || fallback || "-").trim() || "-";
  }

  function initials(value) {
    const source = compactText(value, "A");
    return source.slice(0, 1).toUpperCase();
  }

  function toList(value) {
    if (Array.isArray(value)) return value.map(item => String(item || "").trim()).filter(Boolean);
    if (value === null || value === undefined) return [];
    return String(value).split(/[,;\n]/).map(item => item.trim()).filter(Boolean);
  }

  function tagChips(value, max) {
    const items = toList(value);
    const visible = typeof max === "number" ? items.slice(0, max) : items;
    const rest = typeof max === "number" ? Math.max(0, items.length - visible.length) : 0;
    if (!items.length) return `<span class="muted-dash">-</span>`;
    return `<div class="tag-list">${visible.map(item => `<span class="tag-chip">${escapeHtml(item)}</span>`).join("")}${rest ? `<span class="tag-chip tag-more">+${rest}</span>` : ""}</div>`;
  }

  function getWorkItemLabel(item) {
    if (!item) return "-";
    if (typeof item === "string") return item;
    if (state.lang === "ja") {
      return item.nameJa || item.ja || item.labelJa || item.nameVi || item.vi || item.labelVi || item.name || item.label || item.code || "-";
    }
    return item.nameVi || item.vi || item.labelVi || item.nameJa || item.ja || item.labelJa || item.name || item.label || item.code || "-";
  }

  function staffWorkChipList(items) {
    const names = (Array.isArray(items) ? items : toList(items)).map(getWorkItemLabel).filter(name => name && name !== "-");
    if (!names.length) return showEmptyState(t("noSelectedWorkTypes"));
    return `<div class="staff-work-chip-list ${names.length > 12 ? "is-long" : ""}">${names.map(item => `<span class="tag-chip">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function normalizeTag(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[、，,;；\s]+/g, "")
      .trim();
  }

  function requestTags(request) {
    const raw = []
      .concat(toList(request?.issueTags))
      .concat(toList(request?.category))
      .concat(toList(request?.title))
      .concat(toList(request?.content));
    return [...new Set(raw.map(item => String(item || "").trim()).filter(Boolean))];
  }

  function staffTags(staff) {
    const raw = []
      .concat(toList(staff?.workTags))
      .concat(toList(staff?.skills));
    return cleanStaffWorkTags(Object.assign({}, staff, { workTags: raw }));
  }

  function departmentTokenSet() {
    const values = [];
    (state.workMaster?.departments || []).forEach(dept => {
      values.push(dept.id, dept._id, dept.code, dept.departmentCode, dept.nameVi, dept.nameJa);
    });
    return new Set(values.map(normalizeTag).filter(Boolean));
  }

  function cleanStaffWorkTags(staff) {
    const departmentTokens = departmentTokenSet();
    [staff?.departmentCode, staff?.department, staff?.areas].forEach(value => {
      const dept = findDepartmentByCodeOrLabel(value);
      [value, dept?.code, dept?.nameVi, dept?.nameJa].forEach(token => {
        const normalized = normalizeTag(token);
        if (normalized) departmentTokens.add(normalized);
      });
    });
    const raw = toList(staff?.workTags).concat(toList(staff?.skills));
    const seen = new Set();
    return raw.map(item => String(item || "").trim()).filter(item => {
      const normalized = normalizeTag(item);
      if (!normalized || departmentTokens.has(normalized) || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  function findWorkTypeByIdOrCode(value) {
    const normalized = normalizeTag(value);
    if (!normalized) return null;
    return (state.workMaster?.workTypes || []).find(item => [item.id, item._id, item.code].some(candidate => normalizeTag(candidate) === normalized)) || null;
  }

  function getStaffWorkItems(staff) {
    const ids = toList(staff?.workTypeIds);
    const seen = new Set();
    const items = [];
    const addWorkType = (workType, fallback) => {
      const key = normalizeTag(workType?.id || workType?._id || workType?.code || fallback);
      if (!key || seen.has(key)) return;
      seen.add(key);
      items.push({
        id: workType?.id || workType?._id || fallback,
        code: workType?.code || fallback,
        nameVi: workType?.nameVi || fallback,
        nameJa: workType?.nameJa || fallback,
        name: getWorkItemLabel(workType || fallback)
      });
    };
    ids.forEach(id => {
      const found = findWorkTypeByIdOrCode(id);
      if (found) addWorkType(found, String(id || "").trim());
    });
    if (items.length) return items;
    cleanStaffWorkTags(staff).forEach(tag => {
      const found = findWorkTypeByValue(tag);
      addWorkType(found, tag);
    });
    if (items.length) return items;
    ids.forEach(id => addWorkType(null, String(id || "").trim()));
    return items;
  }

  function activeAssignmentCount(staff) {
    const id = getRowId(staff);
    return state.requests.filter(request => {
      const status = normalizeRequestStatus(request.status);
      return !["completed", "lost"].includes(status)
        && (String(request.assigneeId || request.assignedStaffId || "") === id || getAssigneeName(request) === staff.name);
    }).length;
  }

  function handledRequestCount(staff) {
    const id = getRowId(staff);
    return state.requests.filter(request => String(request.assigneeId || request.assignedStaffId || "") === id || getAssigneeName(request) === staff.name).length;
  }

  function recommendAssignee(request) {
    const reqTags = requestTags(request);
    const requestWorkTypeIds = toList(request?.workTypeIds);
    const requestDepartmentCode = compactText(request?.departmentCode, "");
    const normalizedReqTags = reqTags.map(normalizeTag).filter(Boolean);
    let best = null;
    state.staff.filter(staff => !["off", "deleted"].includes(normalizeStaffStatus(staff.status || "active")) && staff.autoAssignEnabled !== false && !staff.deletedAt).forEach(staff => {
      if (requestDepartmentCode && compactText(staff.departmentCode, "") && compactText(staff.departmentCode, "") !== requestDepartmentCode) return;
      const staffWorkTypeIds = toList(staff.workTypeIds);
      const idMatches = requestWorkTypeIds.filter(id => staffWorkTypeIds.includes(id));
      const tags = staffTags(staff);
      const normalizedStaffTags = tags.map(normalizeTag);
      const matched = reqTags.filter((tag, index) => {
        const normalized = normalizedReqTags[index];
        return normalized && normalizedStaffTags.some(staffTag => staffTag === normalized || staffTag.includes(normalized) || normalized.includes(staffTag));
      });
      const workload = activeAssignmentCount(staff);
      const score = idMatches.length * 200 + matched.length * 100 - workload;
      const candidate = { staff, matched: [...new Set(idMatches.concat(matched))], workload, score };
      if (!best || candidate.score > best.score) best = candidate;
    });
    return best && best.matched.length ? best : null;
  }

  function avatarHtml(item, sizeClass) {
    const name = item?.name || item?.phone || item?.email || "A";
    const avatar = item?.avatar;
    return `<div class="avatar ${sizeClass || ""}">${avatar ? `<img class="avatar-img" src="${escapeHtml(avatar)}" alt="">` : escapeHtml(initials(name))}</div>`;
  }

  function userRequestCount(user) {
    return Number(user?.requestCount || state.requests.filter(request => String(request.userId || "") === String(getRowId(user))).length || 0);
  }

  function normalizeUserStatusValue(status) {
    const value = String(status || "pendingApproval");
    if (value === "pending") return "pendingApproval";
    if (["active", "blocked", "deleted", "pendingApproval"].includes(value)) return value;
    return value;
  }

  function customerStatusLabel(status) {
    const value = normalizeUserStatusValue(status);
    return userStatusLabels[state.lang]?.[value] || userStatusMap[value] || value;
  }

  function customerLastActivity(user) {
    const relatedDates = state.requests
      .filter(request => String(request.userId || request.customerId || "") === String(getRowId(user)))
      .map(request => new Date(request.updatedAt || request.createdAt || 0).getTime())
      .filter(Boolean);
    return Math.max(new Date(user?.lastLoginAt || user?.updatedAt || user?.createdAt || 0).getTime() || 0, ...relatedDates, 0);
  }

  function customerApiData(payload) {
    return payload?.data || payload?.user || payload;
  }

  function replaceUserInState(user) {
    if (!user) return;
    const id = getRowId(user);
    const index = state.users.findIndex(item => getRowId(item) === id);
    if (index >= 0) state.users[index] = Object.assign({}, state.users[index], user);
    else state.users.unshift(user);
  }

  async function reloadCustomerUsers() {
    state.users = normalizeList(await AdminAPI.getUsers());
  }

  function filterUsers() {
    const search = state.filters.customerSearch || "";
    const status = state.filters.customerStatus || "all";
    const sort = state.filters.customerSort || "created";
    return [...state.users].filter(user => {
      const userStatus = normalizeUserStatusValue(user.status);
      if (userStatus === "deleted") return false;
      const statusOk = status === "all" || userStatus === status;
      const text = [user.name, user.phone, user.email, user.company, user.companyName, user.customerType, user.address, user.province].join(" ").toLowerCase();
      return statusOk && text.includes(search.toLowerCase());
    }).sort((a, b) => {
      if (sort === "name") return compactText(a.name || a.phone).localeCompare(compactText(b.name || b.phone));
      if (sort === "status") return compactText(a.status).localeCompare(compactText(b.status));
      if (sort === "lastActivity") return customerLastActivity(b) - customerLastActivity(a);
      if (sort === "requestCount") return userRequestCount(b) - userRequestCount(a);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }

  function staffDepartment(staff) {
    const code = staffDepartmentCodeForStaff(staff);
    const department = findDepartmentByCodeOrLabel(code);
    return department ? workMasterLabel(department) : compactText(staff?.department || staff?.areas);
  }

  function staffRole(staff) {
    return compactText(staff?.role || staff?.position || staff?.title);
  }

  function filterStaff() {
    const search = state.filters.staffSearch || "";
    const dept = normalizeStaffDepartmentFilterValue(state.filters.staffDepartment || "all");
    const status = state.filters.staffStatus || "all";
    const sort = state.filters.staffSort || "name";
    const assignedFilter = state.filters.staffAssigned || "all";
    return [...state.staff].filter(staff => {
      const deptText = staffDepartment(staff);
      const deptCode = staffDepartmentCodeForStaff(staff);
      const statusText = staff.status || "active";
      const normalizedStaffStatus = normalizeStaffStatus(statusText);
      if (statusText === "deleted" || staff.deletedAt) return false;
      const text = [staff.name, staff.email, staff.phone, deptText, deptCode, staffRole(staff), getStaffWorkItems(staff).map(getWorkItemLabel).join(" ")].join(" ").toLowerCase();
      const assigned = activeAssignmentCount(staff);
      const assignedOk = assignedFilter === "all" || (assignedFilter === "has" ? assigned > 0 : assigned === 0);
      return (dept === "all" || deptCode === dept) && (status === "all" || normalizedStaffStatus === status) && assignedOk && text.includes(search.toLowerCase());
    }).sort((a, b) => {
      if (sort === "status") return compactText(a.status).localeCompare(compactText(b.status));
      if (sort === "workload") return activeAssignmentCount(b) - activeAssignmentCount(a);
      if (sort === "created") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return compactText(a.name).localeCompare(compactText(b.name));
    });
  }

  function drawerTabs(active, tabs) {
    return `<div class="drawer-tabs">${tabs.map(([key, label]) => `<button class="tab-button ${active === key ? "active" : ""}" type="button" data-drawer-tab="${key}">${escapeHtml(label)}</button>`).join("")}</div>`;
  }

  function renderCustomers() {
    if (state.loading.users) {
      $("viewRoot").innerHTML = `<div class="loading-state">${escapeHtml(t("loading"))}</div>`;
      return;
    }
    if (state.errors.users) {
      $("viewRoot").innerHTML = showErrorState(state.lang === "vi" ? "Không thể tải khách hàng" : "顧客一覧を読み込めません");
      return;
    }
    const rows = filterUsers();
    const totalWithRequests = state.users.filter(user => userRequestCount(user) > 0).length;
    const statusOptions = ["all", "pendingApproval", "active", "blocked"];
    const selected = rows.find(user => getRowId(user) === state.selectedUser) || null;
    if (state.selectedUser && !selected) state.selectedUser = "";
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("customerSubtitle"))}</p></div>
      <div class="kpi-grid kpi-grid-small" id="customerKpiGrid">
        ${renderCustomerKpis(totalWithRequests)}
      </div>
      <div class="crm-filter-bar">
        <input class="filter-input" data-customer-filter="search" value="${escapeHtml(state.filters.customerSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
        <select class="filter-input" data-customer-filter="status">${statusOptions.map(status => `<option value="${status}" ${String(state.filters.customerStatus || "all") === status ? "selected" : ""}>${escapeHtml(status === "all" ? t("all") : customerStatusLabel(status))}</option>`).join("")}</select>
        <select class="filter-input" data-customer-filter="sort">
          <option value="created" ${(state.filters.customerSort || "created") === "created" ? "selected" : ""}>${escapeHtml(t("sortCreated"))}</option>
          <option value="lastActivity" ${state.filters.customerSort === "lastActivity" ? "selected" : ""}>${escapeHtml(t("lastActivity"))}</option>
          <option value="name" ${state.filters.customerSort === "name" ? "selected" : ""}>${escapeHtml(t("sortName"))}</option>
          <option value="requestCount" ${state.filters.customerSort === "requestCount" ? "selected" : ""}>${escapeHtml(t("requestCount"))}</option>
          <option value="status" ${state.filters.customerSort === "status" ? "selected" : ""}>${escapeHtml(t("sortStatus"))}</option>
        </select>
      </div>
      <div class="customer-layout ${selected ? "has-detail" : "is-list-only"}">
        <section class="section-card customer-list-panel">
          <div class="panel-head"><h2>${escapeHtml(t("customers"))}</h2><span class="note" id="customerCountNote">${rows.length} / ${state.users.length}</span></div>
          <div class="panel-body crm-table-body" id="customerTableRoot">
            ${renderCustomerTable(rows, selected)}
          </div>
        </section>
        ${selected ? `<div id="customerPanelRoot">${renderCustomerPanel(selected)}</div>` : ""}
      </div>
    `;
  }

  function renderCustomerKpis(totalWithRequests = state.users.filter(user => normalizeUserStatusValue(user.status) !== "deleted" && userRequestCount(user) > 0).length) {
    const visibleUsers = state.users.filter(user => normalizeUserStatusValue(user.status) !== "deleted");
    return `
      ${statCard(t("customersCount"), visibleUsers.length, t("realData"), "info")}
      ${statCard(customerStatusLabel("pendingApproval"), state.users.filter(user => normalizeUserStatusValue(user.status) === "pendingApproval").length, t("realData"), "warning")}
      ${statCard(customerStatusLabel("active"), state.users.filter(user => normalizeUserStatusValue(user.status) === "active").length, t("realData"), "success")}
      ${statCard(customerStatusLabel("blocked"), state.users.filter(user => normalizeUserStatusValue(user.status) === "blocked").length, t("realData"), "danger")}
      ${statCard(customerStatusLabel("deleted"), state.users.filter(user => normalizeUserStatusValue(user.status) === "deleted").length, t("realData"), "total", "trash", "trash:trashCategory:customers")}
      ${statCard(t("hasRequests"), totalWithRequests, t("realData"), "info")}
    `;
  }

  function renderCustomerTable(rows, selected) {
    return rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table crm-table"><thead><tr><th>${t("company")}</th><th>${t("phone")}</th><th>${t("customerRank")}</th><th>${t("status")}</th><th>${t("lastActivity")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(user => renderCustomerRow(user, selected)).join("")}</tbody></table></div>` : showEmptyState();
  }

  function closeCustomerDetail() {
    state.selectedUser = "";
    renderCustomers();
  }

  function findCustomerById(id) {
    return state.users.find(user => String(getRowId(user)) === String(id));
  }

  function openCustomerDetail(customerId) {
    const id = String(customerId || "");
    if (!id || !findCustomerById(id)) {
      toast(t("failed"));
      return;
    }
    state.selectedUser = id;
    renderCustomers();
  }

  function renderCustomerResultsOnly() {
    const rows = filterUsers();
    const selected = rows.find(user => getRowId(user) === state.selectedUser) || null;
    if (state.selectedUser && !selected) {
      state.selectedUser = "";
      renderCustomers();
      return;
    }
    if (!$("customerTableRoot")) {
      renderCustomers();
      return;
    }
    if ($("customerKpiGrid")) $("customerKpiGrid").innerHTML = renderCustomerKpis();
    if ($("customerCountNote")) $("customerCountNote").textContent = `${rows.length} / ${state.users.length}`;
    $("customerTableRoot").innerHTML = renderCustomerTable(rows, selected);
    if ($("customerPanelRoot")) $("customerPanelRoot").innerHTML = renderCustomerPanel(selected);
  }

  async function handleCustomerAction(action, trigger) {
    const id = trigger?.dataset.customerId || trigger?.closest("[data-customer-id]")?.dataset.customerId || "";
    console.log("[customer] action", action, id);

    if (action === "close-detail") {
      closeCustomerDetail();
      return;
    }

    if (!id) return;
    const user = findCustomerById(id);
    if (!user) return;

    if (action === "select") {
      openCustomerDetail(id);
      return;
    }
    if (action === "detail") {
      openCustomerDetail(id);
      return;
    }
    if (action === "view-requests") {
      state.selectedUser = id;
      renderCustomerResultsOnly();
      await renderCustomerDetail(user, "history");
      return;
    }

    state.selectedUser = id;

    try {
      let response;
      if (action === "approve") response = await AdminAPI.approveUser(id);
      if (action === "block") {
        if (!await confirmAction({
          title: t("blockCustomerTitle"),
          message: t("blockCustomerText"),
          confirmLabel: t("blockCustomerConfirm"),
          variant: "warning"
        })) return;
        response = await AdminAPI.updateUser(id, { status: "blocked" });
      }
      if (action === "unblock") {
        if (!await confirmAction({
          title: t("unblockCustomerTitle"),
          message: t("unblockCustomerText"),
          confirmLabel: t("activate")
        })) return;
        response = await AdminAPI.updateUser(id, { status: "active" });
      }
      if (action === "restore") {
        if (!await confirmAction({
          title: t("restoreCustomerTitle"),
          message: t("restoreCustomerText"),
          confirmLabel: t("restore")
        })) return;
        response = await AdminAPI.updateUser(id, { status: "active" });
      }
      if (action === "delete") {
        if (!await confirmAction({
          title: t("deleteCustomerTitle"),
          message: t("deleteCustomerText"),
          confirmLabel: t("moveToTrash"),
          danger: true
        })) return;
        response = await AdminAPI.deleteUser(id, false);
      }
      if (action === "permanent-delete") {
        if (!await confirmAction({
          title: t("permanentDeleteCustomerTitle"),
          message: t("permanentDeleteCustomerText"),
          confirmLabel: t("permanentDelete"),
          danger: true
        })) return;
        response = await AdminAPI.deleteUser(id, true);
      }
      if (action === "reset-pin") {
        if (!await confirmAction({
          title: t("resetPinTitle"),
          message: t("resetPinText"),
          confirmLabel: t("resetPin"),
          variant: "warning"
        })) return;
        toast(t("backendPlanned"));
        return;
      }

      const updated = customerApiData(response);
      if (updated && getRowId(updated)) replaceUserInState(updated);
      else if (action === "delete") await reloadCustomerUsers();

      if (action === "permanent-delete") {
        await reloadCustomerUsers();
        state.selectedUser = "";
        renderCustomers();
        toast(t("saved"));
        return;
      }

      renderCustomerResultsOnly();
      if (action === "delete") toast(t("customerMovedToTrash"));
      else if (action === "restore") toast(t("customerRestored"));
      else toast(t("saved"));
    } catch (error) {
      console.error(error);
      toast(t("failed"));
    }
  }

  function renderCustomerRow(user, selected) {
    const id = getRowId(user);
    const status = normalizeUserStatusValue(user.status);
    const isSelected = selected && getRowId(selected) === id;
    return `<tr class="${isSelected ? "selected-row" : ""}" data-customer-id="${escapeHtml(id)}">
      <td><div class="identity-cell">${avatarHtml(user)}<div><strong>${escapeHtml(user.company || user.companyName || user.name || user.phone || "-")}</strong><span>${escapeHtml(user.name || user.contact || "-")}</span></div></div></td>
      <td>${escapeHtml(user.phone || "-")}<div class="subtext">${escapeHtml(user.email || "")}</div></td>
      <td><span class="rank-badge">${escapeHtml(user.rank || user.customerType || "-")}</span></td>
      <td><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(customerStatusLabel(status))}</span></td>
      <td>${escapeHtml(formatDate(user.lastLoginAt || user.updatedAt || user.createdAt))}</td>
      <td><div class="actions crm-actions">
        <button class="btn btn-soft" type="button" data-customer-action="detail" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
      </div></td>
    </tr>`;
  }

  function renderCustomerPanel(user) {
    if (!user) return "";
    const id = getRowId(user);
    const status = normalizeUserStatusValue(user.status);
    const allRelated = state.requests.filter(request => {
      const requestUserId = request.userId || request.customerId || request.user?._id || request.user?.id || "";
      return String(requestUserId) === String(id);
    });
    const related = allRelated.slice(0, 5);
    const activeRequests = allRelated.filter(request => !["completed", "lost"].includes(normalizeRequestStatus(request.status))).length;
    const quoteRequests = allRelated.filter(request => request.quoteRequested || normalizeRequestStatus(request.status) === "quoted").length;
    const lastRequest = allRelated[0]?.createdAt || user.lastRequestAt || user.updatedAt || user.createdAt;
    const hasPin = user.hasPin === true || user.pinSet === true;
    const systemItems = [
      [t("customerId"), id],
      user.approvedAt ? [t("approvedAt"), formatDate(user.approvedAt)] : null,
      user.updatedAt ? [t("updatedAt"), formatDate(user.updatedAt)] : null,
      user.deletedAt ? [t("deletedAt"), formatDate(user.deletedAt)] : null,
      user.profileCompleted !== undefined ? [t("profileCompleted"), displayBoolean(Boolean(user.profileCompleted))] : null
    ].filter(Boolean);
    const rawInternalNote = user.internalNote || user.adminNote || user.note || user.contactNote || "";
    const internalNote = String(rawInternalNote || "").trim();
    const accountActions = [
      status === "pendingApproval" ? `<button class="btn btn-soft" type="button" data-customer-action="approve" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("approve"))}</button>` : "",
      status === "pendingApproval" ? `<button class="btn btn-soft" type="button" data-customer-action="block" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("block"))}</button>` : "",
      status === "active" ? `<button class="btn btn-soft" type="button" data-customer-action="block" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("block"))}</button>` : "",
      status === "blocked" ? `<button class="btn btn-soft" type="button" data-customer-action="unblock" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("activate"))}</button>` : "",
      status === "deleted" ? `<button class="btn btn-soft" type="button" data-customer-action="restore" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("restore"))}</button>` : "",
      status !== "pendingApproval" ? `<button class="btn btn-soft" type="button" data-customer-action="view-requests" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("userHistory"))}</button>` : "",
      ["active", "blocked"].includes(status) ? `<button class="btn btn-soft" type="button" data-customer-action="reset-pin" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("resetPin"))}</button>` : "",
      status === "deleted" ? `<button class="btn btn-danger" type="button" data-customer-action="permanent-delete" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("permanentDelete"))}</button>` : `<button class="btn btn-danger" type="button" data-customer-action="delete" data-customer-id="${escapeHtml(id)}">${escapeHtml(t("delete"))}</button>`
    ].filter(Boolean).join("");
    return `<aside class="detail-panel customer-detail-panel">
      <div class="detail-panel-head">
        ${avatarHtml(user, "avatar-large")}
        <div><h2>${escapeHtml(user.company || user.companyName || user.name || user.phone || "-")}</h2><p>${escapeHtml(user.name || user.contact || t("selectedDetail"))}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(customerStatusLabel(status))}</span></div>
        <button class="customer-detail-close" type="button" data-customer-action="close-detail" aria-label="${escapeHtml(t("closeCustomerDetail"))}">&times;</button>
      </div>
      <section><h3>${escapeHtml(t("basicInfo"))}</h3><div class="customer-info-grid">
          ${customerInfoItem(t("customerName"), user.name)}
          ${user.displayName || user.fullName ? customerInfoItem(t("displayName"), user.displayName || user.fullName) : ""}
          ${customerInfoItem(t("company"), user.company || user.companyName)}
          ${customerInfoItem(t("customerType"), user.customerType || user.accountType)}
          ${customerInfoItem(t("status"), customerStatusLabel(status))}
          ${customerInfoItem(t("createdAt"), formatDate(user.createdAt))}
          ${customerInfoItem(t("lastLoginAt"), formatDate(user.lastLoginAt))}
        </div></section>
      <section><h3>${escapeHtml(t("contactInfo"))}</h3><div class="customer-info-grid">
          ${customerInfoItem(t("phone"), user.phone)}
          ${customerInfoItem(t("email"), user.email)}
          ${customerInfoItem(t("contact"), user.contact || user.contactPerson)}
          ${customerInfoItem(t("address"), user.address || user.companyAddress)}
          ${user.province || user.region ? customerInfoItem(t("province"), user.province || user.region) : ""}
          ${user.projectName ? customerInfoItem(t("projectName"), user.projectName) : ""}
        </div></section>
      <section><h3>${escapeHtml(t("accountSecurity"))}</h3><div class="customer-info-grid">
          ${customerInfoItem(t("pinStatus"), hasPin ? t("pinSet") : t("pinUnset"))}
        </div><div class="note-card">${escapeHtml(t("pinSecurityNote"))}</div></section>
      ${internalNote && internalNote !== "-" ? `<section><h3>${escapeHtml(t("internalNotes"))}</h3><div class="note-card">${escapeHtml(internalNote)}</div></section>` : ""}
      <section><h3>${escapeHtml(t("requestSummary"))}</h3><div class="mini-kpi-row">
          ${miniMetric(t("requestCount"), userRequestCount(user))}
          ${miniMetric(t("activeRequests"), activeRequests)}
          ${miniMetric(t("quoteRequests"), quoteRequests)}
          ${miniMetric(t("lastRequest"), formatDate(lastRequest))}
        </div></section>
      <section><h3>${escapeHtml(t("recentRequests"))}</h3><div class="priority-list">${related.length ? related.map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getRequestContent(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState()}</div></section>
      ${systemItems.length ? `<section><h3>${escapeHtml(t("systemInfo"))}</h3><div class="customer-info-grid">${systemItems.map(([label, value]) => customerInfoItem(label, value)).join("")}</div>${status === "deleted" ? `<div class="note-card">${escapeHtml(t("trashRetentionNote"))}</div>` : ""}</section>` : ""}
      <section><h3>${escapeHtml(t("accountActions"))}</h3><div class="modal-actions">${accountActions}</div></section>
    </aside>`;
  }

  async function renderCustomerDetail(user, activeTab = "info") {
    const id = getRowId(user);
    let history = user.__history || [];
    if (activeTab === "history" && !user.__historyLoaded) {
      try {
        history = normalizeList(await AdminAPI.getUserRequests(id));
        user.__history = history;
        user.__historyLoaded = true;
      } catch {
        history = [];
      }
    }
    const status = normalizeUserStatusValue(user.status);
    const infoFields = [
      [t("name"), user.name],
      [t("phone"), user.phone],
      [t("email"), user.email],
      [t("contact"), user.contact],
      [t("company"), user.company || user.companyName],
      [t("customerType"), user.customerType || user.accountType],
      [t("province"), user.province],
      [t("projectName"), user.projectName],
      [t("address"), user.address],
      [t("companyAddress"), user.companyAddress],
      [t("taxId"), user.taxId],
      [t("constructionType"), user.constructionType],
      [t("notificationsEnabled"), user.notificationsEnabled === undefined ? "-" : String(Boolean(user.notificationsEnabled))],
      [t("note"), user.note],
      [t("createdAt"), formatDate(user.createdAt)],
      [t("approvedAt"), formatDate(user.approvedAt)],
      [t("lastLoginAt"), formatDate(user.lastLoginAt)]
    ];
    openDrawer(`
      <article class="drawer-panel profile-drawer">
        <header class="drawer-head drawer-header">
          <div class="profile-title">${avatarHtml(user, "avatar-large")}<div><h2>${escapeHtml(user.name || user.phone || "-")}</h2><p class="note">${escapeHtml(user.phone || "-")}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(customerStatusLabel(status))}</span></div></div>
          <button class="close-button" type="button" data-close-drawer>×</button>
        </header>
        ${drawerTabs(activeTab, [["info", t("info")], ["history", t("history")]])}
        <div class="drawer-body">
          ${activeTab === "info" ? `<div class="info-grid">${infoFields.map(([label, value]) => infoItem(label, value)).join("")}</div>` : `<section><div class="priority-list">${history.length ? history.map(item => `<div class="priority-item"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getRequestContent(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span><small>${escapeHtml(formatDate(item.createdAt))}</small></div>`).join("") : showEmptyState()}</div></section>`}
        </div>
      </article>
    `);
    $("drawer").dataset.drawerType = "customer";
    $("drawer").dataset.drawerId = id;
  }

  function staffAssignedRequests(staff, activeOnly = true) {
    const id = getRowId(staff);
    return state.requests.filter(request => {
      const assigned = String(request.assigneeId || request.assignedStaffId || "") === id || getAssigneeName(request) === staff.name;
      if (!assigned) return false;
      if (!activeOnly) return true;
      return !["completed", "lost"].includes(normalizeRequestStatus(request.status));
    });
  }

  function staffAutoAssignText(staff) {
    return staff?.autoAssignEnabled === false ? t("autoAssignNotParticipating") : t("autoAssignParticipating");
  }

  function renderStaff() {
    if (state.loading.staff) {
      $("viewRoot").innerHTML = `<div class="loading-state">${escapeHtml(t("loading"))}</div>`;
      return;
    }
    if (state.errors.staff) {
      $("viewRoot").innerHTML = showErrorState(state.lang === "vi" ? "Không thể tải staff" : "スタッフ一覧を読み込めません");
      return;
    }
    const selectedDepartmentFilter = normalizeStaffDepartmentFilterValue(state.filters.staffDepartment || "all");
    state.filters.staffDepartment = selectedDepartmentFilter;
    const rows = filterStaff();
    const departments = staffDepartmentFilterOptions();
    const allTags = state.staff.flatMap(staff => staffTags(staff));
    const selected = state.selectedStaff ? rows.find(staff => String(getRowId(staff)) === String(state.selectedStaff)) : null;
    if (state.selectedStaff && !selected) state.selectedStaff = "";
    const visibleStaff = state.staff.filter(staff => String(staff.status || "active") !== "deleted" && !staff.deletedAt);
    const activeStaff = visibleStaff.filter(staff => normalizeStaffStatus(staff.status || "active") !== "off");
    const assignedStaffCount = activeStaff.filter(staff => activeAssignmentCount(staff) > 0).length;
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("staffSubtitle"))}</p></div>
      <div class="toolbar demo-actions"><button class="btn btn-soft" disabled>CSV ${escapeHtml(t("export"))}</button><button class="primary-button" type="button" data-staff-action="add">+ ${escapeHtml(t("addStaff"))}</button></div>
      <div class="kpi-grid kpi-grid-small">
        ${statCard(t("staffCount"), visibleStaff.length, t("realData"), "info", "users")}
        ${statCard(t("active"), activeStaff.length, t("realData"), "success", "userCheck")}
        ${statCard(t("currentAssignments"), assignedStaffCount, t("realData"), "warning", "briefcase")}
        ${statCard(t("off"), state.staff.filter(staff => normalizeStaffStatus(staff.status) === "off").length, t("realData"), "danger", "pauseCircle")}
        ${statCard(t("departments"), departments.length, t("realData"), "total", "layers")}
        ${statCard(t("totalTags"), new Set(allTags).size, t("realData"), "info", "tags")}
      </div>
      <div class="crm-filter-bar staff-filter-bar">
        <input class="filter-input" data-staff-search data-staff-filter="search" value="${escapeHtml(state.filters.staffSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
        <select class="filter-input" data-staff-filter="department"><option value="all">${escapeHtml(t("allDepartments"))}</option>${departments.map(item => `<option value="${escapeHtml(item.code)}" ${state.filters.staffDepartment === item.code ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="status"><option value="all">${escapeHtml(t("statusFilter"))}</option>${["active", "off"].map(status => `<option value="${status}" ${state.filters.staffStatus === status ? "selected" : ""}>${escapeHtml(staffStatusLabel(status))}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="assigned"><option value="all">${escapeHtml(t("currentAssignments"))}</option><option value="has" ${state.filters.staffAssigned === "has" ? "selected" : ""}>${escapeHtml(t("currentAssignments"))}</option><option value="none" ${state.filters.staffAssigned === "none" ? "selected" : ""}>${escapeHtml(t("noData"))}</option></select>
        <select class="filter-input" data-staff-filter="sort">
          <option value="name" ${(state.filters.staffSort || "name") === "name" ? "selected" : ""}>${escapeHtml(t("sortName"))}</option>
          <option value="created" ${state.filters.staffSort === "created" ? "selected" : ""}>${escapeHtml(t("sortCreated"))}</option>
          <option value="status" ${state.filters.staffSort === "status" ? "selected" : ""}>${escapeHtml(t("sortStatus"))}</option>
        </select>
      </div>
      <div class="staff-layout ${selected ? "has-detail" : ""}" id="staffLayoutRoot">
        <section class="section-card staff-list-panel">
          <div class="panel-head"><h2>${escapeHtml(t("staff"))}</h2><span class="note" id="staffCountNote">${rows.length} / ${visibleStaff.length}</span></div>
          <div class="panel-body crm-table-body" id="staffTableRoot">
            ${renderStaffTableHtml(rows, selected)}
          </div>
        </section>
        <div id="staffPanelRoot">${selected ? renderStaffPanel(selected) : ""}</div>
      </div>
    `;
  }

  function renderStaffRow(staff, selected) {
    const id = getRowId(staff);
    const status = staff.status || "active";
    const quickStatus = normalizeStaffStatus(status) === "off" ? "off" : "active";
    const isUpdatingStatus = state.staffStatusUpdating?.has(id);
    const handledCount = handledRequestCount(staff);
    const isSelected = selected && String(getRowId(selected)) === String(id);
    const workItems = getStaffWorkItems(staff);
    return `<tr class="staff-row ${isSelected ? "selected-row is-selected" : ""}">
      <td data-label="${escapeHtml(t("staff"))}"><div class="identity-cell">${avatarHtml(staff)}<div><strong>${escapeHtml(staff.name || "-")}</strong><span>${escapeHtml(staff.email || staff.phone || "-")}</span></div></div></td>
      <td data-label="${escapeHtml(t("role"))} / ${escapeHtml(t("department"))}">${escapeHtml(staffRole(staff))}<div class="subtext">${escapeHtml(staffDepartment(staff))}</div></td>
      <td data-label="${escapeHtml(t("skillsWork"))}">${tagChips(workItems.map(getWorkItemLabel), 3)}</td>
      <td data-label="${escapeHtml(t("assignedCount"))}">${handledCount}</td>
      <td data-label="${escapeHtml(t("staffStatusAction"))}"><div class="staff-status-stack"><span class="status-badge status-${escapeHtml(quickStatus)}">${escapeHtml(staffStatusLabel(quickStatus))}</span><button class="staff-status-switch ${quickStatus === "active" ? "is-on" : "is-off"} ${isUpdatingStatus ? "is-loading" : ""}" type="button" role="switch" aria-checked="${quickStatus === "active" ? "true" : "false"}" aria-label="${escapeHtml(t("staffStatusAction"))}" data-action="toggle-staff-status" data-staff-status-action="${escapeHtml(id)}" data-staff-id="${escapeHtml(id)}" data-current-status="${escapeHtml(quickStatus)}" data-next-status="${quickStatus === "off" ? "active" : "off"}" ${isUpdatingStatus ? "disabled aria-disabled=\"true\"" : ""}><span class="staff-status-switch-track"><span class="staff-status-switch-thumb"></span></span><span class="sr-only">${escapeHtml(quickStatus === "off" ? t("reactivateStaffConfirmLabel") : t("pauseStaff"))}</span></button></div></td>
      <td data-label="${escapeHtml(t("action"))}"><div class="actions crm-actions">
        <button class="btn btn-soft" type="button" data-staff-action="detail" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
      </div></td>
    </tr>`;
  }

  function renderStaffTableHtml(rows, selected) {
    return rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table staff-table"><thead><tr><th>${t("staff")}</th><th>${t("role")} / ${t("department")}</th><th>${t("skillsWork")}</th><th>${t("assignedCount")}</th><th>${t("staffStatusAction")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(staff => renderStaffRow(staff, selected)).join("")}</tbody></table></div>` : showEmptyState();
  }

  function renderStaffResultsOnly() {
    if (!$("staffTableRoot")) {
      renderStaff();
      return;
    }
    const rows = filterStaff();
    const selected = state.selectedStaff ? rows.find(staff => String(getRowId(staff)) === String(state.selectedStaff)) : null;
    const visibleStaff = state.staff.filter(staff => String(staff.status || "active") !== "deleted" && !staff.deletedAt);
    if (state.selectedStaff && !selected) state.selectedStaff = "";
    const layout = $("staffLayoutRoot");
    if (layout) layout.classList.toggle("has-detail", Boolean(selected));
    $("staffTableRoot").innerHTML = renderStaffTableHtml(rows, selected);
    if ($("staffPanelRoot")) $("staffPanelRoot").innerHTML = selected ? renderStaffPanel(selected) : "";
    if ($("staffCountNote")) $("staffCountNote").textContent = `${rows.length} / ${visibleStaff.length}`;
  }

  function renderStaffPanel(staff) {
    if (!staff) return `<aside class="detail-panel">${showEmptyState()}</aside>`;
    const id = getRowId(staff);
    const status = staff.status || "active";
    const assignedAll = staffAssignedRequests(staff, false).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const assignedActive = staffAssignedRequests(staff, true);
    const assigned = assignedAll.slice(0, 5);
    const workload = assignedActive.length ? Math.min(95, 30 + assignedActive.length * 8) : 0;
    const overdue = assignedActive.filter(isOverdue).length;
    const isPaused = normalizeStaffStatus(status) === "off";
    const isDeleted = normalizeStaffStatus(status) === "deleted" || staff.deletedAt;
    const workItems = getStaffWorkItems(staff);
    const staffDescription = staff.staffDescription || staff.introduction || "";
    const actionButtons = isDeleted
      ? `<button class="btn btn-soft" type="button" data-staff-action="restore" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("restore"))}</button><button class="btn btn-danger" type="button" data-staff-action="permanent-delete" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("permanentDelete"))}</button>`
      : `<button class="btn btn-soft" type="button" data-staff-action="edit" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("editStaffProfile"))}</button><button class="btn btn-soft" type="button" data-staff-action="${isPaused ? "activate" : "pause"}" data-staff-id="${escapeHtml(id)}">${escapeHtml(isPaused ? t("reactivateStaff") : t("pauseStaff"))}</button><button class="btn btn-danger" type="button" data-staff-action="delete" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("delete"))}</button>`;
    return `<aside class="detail-panel staff-detail-panel">
      <div class="detail-panel-head staff-detail-head">
        ${avatarHtml(staff, "avatar-large")}
        <div><h2>${escapeHtml(staff.name || "-")}</h2><p>${escapeHtml(staff.email || "")}</p><p>ID: ${escapeHtml(id || "-")}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusLabel(status))}</span></div>
        <button class="close-button" type="button" data-staff-action="close-detail" aria-label="${escapeHtml(t("close"))}">&times;</button>
      </div>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffBasicInfo"))}</h3><div class="staff-detail-grid">
        ${infoItem(t("staffId"), id)}
        ${infoItem(t("name"), staff.name)}
        ${infoItem(t("email"), staff.email)}
        ${infoItem(t("phone"), staff.phone)}
        ${infoItem(t("status"), staffStatusLabel(status))}
        ${infoItem(t("createdAt"), formatDate(staff.createdAt))}
      </div></section>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffAssignment"))}</h3>
        <div class="staff-detail-grid">
          ${infoItem(t("primaryDepartment"), staffDepartment(staff))}
          ${infoItem(t("staffAutoAssign"), staffAutoAssignText(staff))}
        </div>
        <div class="staff-readable-card staff-detail-full">
          <h4>${escapeHtml(t("staffAssignableWork"))}</h4>
          ${staffWorkChipList(workItems)}
        </div>
      </section>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffDetailNotes"))}</h3>
        <div class="staff-readable-card"><h4>${escapeHtml(t("staffDescriptionSection"))}</h4><p>${escapeHtml(staffDescription || t("noStaffDescription"))}</p></div>
        <div class="staff-readable-card"><h4>${escapeHtml(t("internalMemo"))}</h4><p>${escapeHtml(staff.note || t("noInternalMemo"))}</p></div>
      </section>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffCurrentWorkload"))}</h3><div class="mini-kpi-row">${miniMetric(t("currentAssignments"), assignedActive.length)}${miniMetric(t("workload"), workload + "%")}${miniMetric(t("overdueAssigned"), overdue)}</div><div class="priority-list">${assignedActive.length ? assignedActive.slice(0, 4).map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getCustomerName(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState(t("noAssignedRequests"))}</div></section>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffRecentHistory"))}</h3><div class="priority-list">${assigned.length ? assigned.map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getCustomerName(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState(t("noStaffHistory"))}</div></section>
      <section class="staff-detail-section"><h3>${escapeHtml(t("staffOperations"))}</h3><div class="modal-actions staff-detail-actions">${actionButtons}</div></section>
    </aside>`;
  }

  async function renderStaffDetail(staff, activeTab = "info") {
    const id = getRowId(staff);
    let history = staff.__history || [];
    let historyLoaded = staff.__historyLoaded;
    if (activeTab === "history" && !historyLoaded) {
      try {
        history = normalizeList(await AdminAPI.getStaffHistory(id));
        staff.__history = history;
        staff.__historyLoaded = true;
      } catch {
        history = [];
        staff.__historyLoaded = true;
      }
    }
    const status = staff.status || "active";
    const workItems = getStaffWorkItems(staff);
    const staffDescription = staff.staffDescription || staff.introduction || "";
    const infoFields = [
      [t("name"), staff.name],
      [t("phone"), staff.phone],
      [t("email"), staff.email],
      [t("primaryDepartment"), staffDepartment(staff)],
      [t("staffAutoAssign"), staffAutoAssignText(staff)],
      [t("status"), staffStatusMap[status] || status],
      [t("note"), staff.note],
      [t("staffDescriptionSection"), staffDescription],
      [t("createdAt"), formatDate(staff.createdAt)]
    ];
    openDrawer(`
      <article class="drawer-panel profile-drawer">
        <header class="drawer-head drawer-header">
          <div class="profile-title">${avatarHtml(staff, "avatar-large")}<div><h2>${escapeHtml(staff.name || "-")}</h2><p class="note">${escapeHtml(staffDepartment(staff))}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></div></div>
          <button class="close-button" type="button" data-close-drawer>×</button>
        </header>
        ${drawerTabs(activeTab, [["info", t("info")], ["work", t("work")], ["history", t("history")]])}
        <div class="drawer-body">
          ${activeTab === "info" ? `<div class="info-grid">${infoFields.map(([label, value]) => infoItem(label, value)).join("")}</div>` : ""}
          ${activeTab === "work" ? `<section class="work-detail">
            <h3>${escapeHtml(t("staffAssignment"))}</h3>
            <div class="info-grid">
              ${infoItem(t("primaryDepartment"), staffDepartment(staff))}
              ${infoItem(t("staffAutoAssign"), staffAutoAssignText(staff))}
              ${infoItem(t("staffDescriptionSection"), staffDescription)}
              ${infoItem(t("internalMemo"), staff.note)}
            </div>
            <h3>${escapeHtml(t("staffAssignableWork"))}</h3>
            ${staffWorkChipList(workItems)}
          </section>` : ""}
          ${activeTab === "history" ? `<section><div class="priority-list">${history.length ? history.map(item => `<div class="priority-item"><strong>${escapeHtml(item.requestCode || item.id || "-")}</strong><span>${escapeHtml(item.title || getRequestContent(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span><small>${escapeHtml(item.createdAt || "")}</small></div>`).join("") : showEmptyState(t("staffHistoryPlaceholder"))}</div></section>` : ""}
        </div>
      </article>
    `);
    $("drawer").dataset.drawerType = "staff";
    $("drawer").dataset.drawerId = id;
  }

  function uniqueOptions(values) {
    const seen = new Set();
    return values.map(value => compactText(value, "")).filter(value => {
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function optionPool(base, current) {
    return uniqueOptions([].concat(base || []).concat(toList(current)));
  }

  function workMasterLabel(item) {
    if (!item) return "";
    return state.lang === "vi"
      ? (item.nameVi || item.nameJa || item.code || "")
      : (item.nameJa || item.nameVi || item.code || "");
  }

  function activeMasterItems(type) {
    return (state.workMaster?.[type] || []).filter(item => item.active !== false);
  }

  function departmentMasterKey(item) {
    return compactText(item?.code || item?.departmentCode || item?.id || item?._id, "");
  }

  function findDepartmentByCodeOrLabel(value) {
    const normalized = normalizeTag(value);
    if (!normalized) return null;
    return (state.workMaster?.departments || []).find(item => {
      return [item.code, item.departmentCode, item.id, item._id, item.nameVi, item.nameJa].some(candidate => normalizeTag(candidate) === normalized);
    }) || null;
  }

  function staffDepartmentCode(value) {
    if (!compactText(value, "")) return "";
    const found = findDepartmentByCodeOrLabel(value);
    if (found) return departmentMasterKey(found);
    return staffDepartmentKey(value);
  }

  function staffDepartmentCodeForStaff(staff) {
    return staffDepartmentCode(staff?.departmentCode || staff?.department || staff?.areas || "");
  }

  function normalizeStaffDepartmentFilterValue(value) {
    const raw = compactText(value || "all", "all");
    if (raw === "all") return "all";
    const found = findDepartmentByCodeOrLabel(raw);
    return found ? departmentMasterKey(found) : staffDepartmentCode(raw);
  }

  function staffDepartmentFilterOptions() {
    const departments = activeMasterItems("departments")
      .map(item => ({
        code: departmentMasterKey(item),
        label: workMasterLabel(item),
        sortOrder: Number(item.sortOrder || 0)
      }))
      .filter(item => item.code && item.label)
      .sort((a, b) => (a.sortOrder || 9999) - (b.sortOrder || 9999) || a.label.localeCompare(b.label));
    if (departments.length) return departments;
    return staffDepartmentPresets().map(item => ({ code: item.key, label: item.label, sortOrder: 0 }));
  }

  function staffDepartmentPresets() {
    const masterDepartments = activeMasterItems("departments");
    if (masterDepartments.length) {
      return masterDepartments.map(item => ({ key: departmentMasterKey(item), label: workMasterLabel(item) })).filter(item => item.key);
    }
    const fallbackDepartments = [
      { key: "executive", nameVi: "Gi\u00e1m \u0111\u1ed1c", nameJa: "\u793e\u9577\u30fb\u4ee3\u8868" },
      { key: "koumu", nameVi: "B\u1ed9 c\u00f4ng v\u1ee5", nameJa: "\u5de5\u52d9\u90e8" },
      { key: "fs", nameVi: "B\u1ed9 FS", nameJa: "FS\u90e8" },
      { key: "sales", nameVi: "B\u1ed9 kinh doanh", nameJa: "\u55b6\u696d\u90e8" },
      { key: "construction", nameVi: "B\u1ed9 thi c\u00f4ng", nameJa: "\u5de5\u4e8b\u90e8" },
      { key: "design", nameVi: "B\u1ed9 thi\u1ebft k\u1ebf", nameJa: "\u8a2d\u8a08\u90e8" },
      { key: "estimate", nameVi: "B\u1ed9 d\u1ef1 to\u00e1n", nameJa: "\u4e88\u7b97\u66f8" }
    ];
    return fallbackDepartments.map(item => ({ key: item.key, label: state.lang === "vi" ? item.nameVi : item.nameJa }));
    return state.lang === "vi"
      ? [
        { key: "executive", label: "Giám đốc" },
        { key: "koumu", label: "Bộ công vụ" },
        { key: "fs", label: "Bộ FS" },
        { key: "sales", label: "Bộ kinh doanh" },
        { key: "construction", label: "Bộ thi công" },
        { key: "design", label: "Bộ thiết kế" },
        { key: "estimate", label: "Bộ dự toán" }
      ]
      : [
        { key: "executive", label: "\u793e\u9577\u30fb\u4ee3\u8868" },
        { key: "koumu", label: "\u5de5\u52d9\u90e8" },
        { key: "fs", label: "FS\u90e8" },
        { key: "sales", label: "\u55b6\u696d\u90e8" },
        { key: "construction", label: "\u5de5\u4e8b\u90e8" },
        { key: "design", label: "\u8a2d\u8a08\u90e8" },
        { key: "estimate", label: "\u4e88\u7b97\u66f8" }
      ];
  }

  const staffDepartmentAliases = {
    design: ["design", "thi\u1ebft k\u1ebf", "b\u1ed9 thi\u1ebft k\u1ebf", "\u8a2d\u8a08", "\u8a2d\u8a08\u90e8"],
    construction: ["construction", "thi c\u00f4ng", "b\u1ed9 thi c\u00f4ng", "\u5de5\u4e8b", "\u5de5\u4e8b\u90e8"],
    koumu: ["koumu", "c\u00f4ng v\u1ee5", "b\u1ed9 c\u00f4ng v\u1ee5", "\u5de5\u52d9", "\u5de5\u52d9\u90e8"],
    fs: ["fs", "b\u1ed9 fs", "fs\u90e8", "kh\u1ea3o s\u00e1t", "b\u1ed9 kh\u1ea3o s\u00e1t", "\u8abf\u67fb", "\u8abf\u67fb\u90e8", "\u4fdd\u5168", "\u4fdd\u5168\u90e8", "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9"],
    sales: ["sales", "kinh doanh", "b\u1ed9 kinh doanh", "\u55b6\u696d", "\u55b6\u696d\u90e8"],
    estimate: ["estimate", "d\u1ef1 to\u00e1n", "b\u1ed9 d\u1ef1 to\u00e1n", "\u4e88\u7b97\u66f8", "b\u00e1o gi\u00e1", "\u898b\u7a4d"],
    executive: ["executive", "gi\u00e1m \u0111\u1ed1c", "ban gi\u00e1m \u0111\u1ed1c", "\u793e\u9577", "\u4ee3\u8868", "\u793e\u9577\u30fb\u4ee3\u8868"]
  };

  function staffDepartmentKey(value) {
    const normalized = compactText(value, "").toLowerCase();
    for (const [key, aliases] of Object.entries(staffDepartmentAliases)) {
      if (aliases.some(alias => normalized.includes(alias.toLowerCase()))) return key;
    }
    return "";
  }

  function staffDepartmentLabelByKey(key) {
    const found = staffDepartmentPresets().find(item => item.key === key);
    return found ? found.label : staffDepartmentPresets().find(item => item.key === "other")?.label || "";
  }

  function staffDepartmentOptions(current) {
    const base = staffDepartmentPresets().map(item => item.label);
    return optionPool(base.concat(state.staff.map(staffDepartment)), current);
  }

  function staffDepartmentSelectField(item) {
    const departments = activeMasterItems("departments");
    const currentCode = staffDepartmentCodeForStaff(item);
    if (!departments.length) return `<div class="staff-work-empty"><p>${escapeHtml(t("noDepartmentsInMaster"))}</p></div>`;
    return `<div class="staff-department-picker" data-staff-department-picker>
      <input type="hidden" name="department" data-staff-department-value value="${escapeHtml(currentCode)}">
      <div class="staff-department-options">
        ${departments.map(dept => {
          const key = departmentMasterKey(dept);
          return `<button class="staff-department-option ${key === currentCode ? "active" : ""}" type="button" data-staff-department-option="${escapeHtml(key)}" data-label="${escapeHtml(workMasterLabel(dept))}">${escapeHtml(workMasterLabel(dept))}</button>`;
        }).join("")}
      </div>
    </div>`;
  }

  function staffWorkTagGroups() {
    const workTypes = activeMasterItems("workTypes");
    if (workTypes.length) {
      const groups = {};
      activeMasterItems("departments").forEach(dept => {
        groups[dept.code] = workTypes.filter(item => item.departmentCode === dept.code).map(workMasterLabel);
      });
      return groups;
    }
    if (state.lang === "ja") {
      return {
        design: ["図面設計", "図面修正", "電気図面設計", "CAD作図", "制御盤設計", "盤設計", "設備配置設計", "電気システム設計", "施工図作成", "竣工図作成", "技術図面チェック", "材料計算", "容量計算", "施工計画設計", "技術基準チェック"],
        construction: ["電気工事", "現場確認", "施工進捗確認", "現場安全確認", "施工品質確認", "竣工検査", "施工後点検", "施工調整", "引き渡し支援", "施工後確認"],
        survey: ["現地調査", "見積調査", "設備状態確認", "会社状況確認", "適正設備提案"],
        sales: ["顧客対応", "サービス提案", "依頼受付", "顧客打ち合わせ", "修理見積", "施工見積", "契約支援", "契約内容調整"],
        maintenance: ["設備保全", "施工後点検", "現場トラブル対応", "重大トラブル対応"],
        operation: ["社内業務調整", "会社運営管理", "人事管理", "工事売上確認", "施工計画確認", "技術書類承認"],
        executive: ["工事承認", "見積承認", "契約承認", "大型案件受付", "重要課題対応", "顧客クレーム対応"],
        other: []
      };
    }
    return {
      design: ["Thi\u1ebft k\u1ebf b\u1ea3n v\u1ebd", "Ch\u1ec9nh s\u1eeda b\u1ea3n v\u1ebd", "Thi\u1ebft k\u1ebf s\u01a1 \u0111\u1ed3 \u0111i\u1ec7n", "V\u1ebd CAD", "Thi\u1ebft k\u1ebf t\u1ee7 \u0111i\u1ec7n", "\u76e4\u8a2d\u8a08", "Thi\u1ebft k\u1ebf b\u1ed1 tr\u00ed thi\u1ebft b\u1ecb", "Thi\u1ebft k\u1ebf h\u1ec7 th\u1ed1ng \u0111i\u1ec7n", "L\u00e0m b\u1ea3n v\u1ebd thi c\u00f4ng", "L\u00e0m b\u1ea3n v\u1ebd ho\u00e0n c\u00f4ng", "Ki\u1ec3m tra b\u1ea3n v\u1ebd k\u1ef9 thu\u1eadt", "T\u00ednh to\u00e1n v\u1eadt t\u01b0", "T\u00ednh to\u00e1n c\u00f4ng su\u1ea5t", "Thi\u1ebft k\u1ebf ph\u01b0\u01a1ng \u00e1n thi c\u00f4ng", "Ki\u1ec3m tra ti\u00eau chu\u1ea9n k\u1ef9 thu\u1eadt"],
      construction: ["Thi c\u00f4ng \u0111i\u1ec7n", "Ki\u1ec3m tra c\u00f4ng tr\u00ecnh", "Ki\u1ec3m tra ti\u1ebfn \u0111\u1ed9 thi c\u00f4ng", "Ki\u1ec3m tra an to\u00e0n c\u00f4ng tr\u00ecnh", "Ki\u1ec3m tra ch\u1ea5t l\u01b0\u1ee3ng c\u00f4ng tr\u00ecnh", "Nghi\u1ec7m thu c\u00f4ng tr\u00ecnh", "\u65bd\u5de5\u5f8c\u70b9\u691c", "\u0110i\u1ec1u ph\u1ed1i thi c\u00f4ng", "H\u1ed7 tr\u1ee3 b\u00e0n giao c\u00f4ng tr\u00ecnh", "Ki\u1ec3m tra sau thi c\u00f4ng"],
      survey: ["Kh\u1ea3o s\u00e1t hi\u1ec7n tr\u01b0\u1eddng", "Kh\u1ea3o s\u00e1t \u0111\u1ec3 b\u00e1o gi\u00e1", "Ki\u1ec3m tra t\u00ecnh tr\u1ea1ng thi\u1ebft b\u1ecb", "Ki\u1ec3m tra t\u00ecnh tr\u1ea1ng c\u00f4ng ty", "T\u01b0 v\u1ea5n thi\u1ebft b\u1ecb ph\u00f9 h\u1ee3p"],
      sales: ["Ch\u0103m s\u00f3c kh\u00e1ch h\u00e0ng", "T\u01b0 v\u1ea5n d\u1ecbch v\u1ee5", "Ti\u1ebfp nh\u1eadn y\u00eau c\u1ea7u kh\u00e1ch h\u00e0ng", "H\u1ecdp v\u1edbi kh\u00e1ch h\u00e0ng", "B\u00e1o gi\u00e1 s\u1eeda ch\u1eefa", "B\u00e1o gi\u00e1 thi c\u00f4ng", "H\u1ed7 tr\u1ee3 h\u1ee3p \u0111\u1ed3ng", "\u0110i\u1ec1u ch\u1ec9nh n\u1ed9i dung h\u1ee3p \u0111\u1ed3ng"],
      maintenance: ["B\u1ea3o tr\u00ec thi\u1ebft b\u1ecb", "Ki\u1ec3m tra sau thi c\u00f4ng", "H\u1ed7 tr\u1ee3 x\u1eed l\u00fd v\u1ea5n \u0111\u1ec1 t\u1ea1i c\u00f4ng tr\u00ecnh", "H\u1ed7 tr\u1ee3 x\u1eed l\u00fd s\u1ef1 c\u1ed1 nghi\u00eam tr\u1ecdng"],
      operation: ["\u0110i\u1ec1u ph\u1ed1i ho\u1ea1t \u0111\u1ed9ng c\u00f4ng ty", "Qu\u1ea3n l\u00fd v\u1eadn h\u00e0nh c\u00f4ng ty", "Qu\u1ea3n l\u00fd nh\u00e2n s\u1ef1", "Ki\u1ec3m tra doanh thu c\u00f4ng tr\u00ecnh", "X\u00e1c nh\u1eadn k\u1ebf ho\u1ea1ch thi c\u00f4ng", "Ph\u00ea duy\u1ec7t h\u1ed3 s\u01a1 k\u1ef9 thu\u1eadt"],
      executive: ["Ph\u00ea duy\u1ec7t c\u00f4ng tr\u00ecnh", "Ph\u00ea duy\u1ec7t b\u00e1o gi\u00e1", "Ph\u00ea duy\u1ec7t h\u1ee3p \u0111\u1ed3ng", "Ti\u1ebfp nh\u1eadn d\u1ef1 \u00e1n l\u1edbn", "X\u1eed l\u00fd v\u1ea5n \u0111\u1ec1 quan tr\u1ecdng", "Gi\u1ea3i quy\u1ebft khi\u1ebfu n\u1ea1i kh\u00e1ch h\u00e0ng"],
      other: []
    };
  }

  function staffTagDepartmentKey(tag) {
    const masterType = activeMasterItems("workTypes").find(item => [item.code, item.nameVi, item.nameJa].some(candidate => normalizeTag(candidate) === normalizeTag(tag)));
    if (masterType) return masterType.departmentCode || "other";
    const normalized = normalizeTag(tag);
    const groups = staffWorkTagGroups();
    for (const [key, tags] of Object.entries(groups)) {
      if (tags.some(item => normalizeTag(item) === normalized)) return key;
    }
    return "outside";
  }

  function allStaffWorkTags(selected) {
    const masterTags = activeMasterItems("workTypes").map(workMasterLabel);
    if (masterTags.length) {
      const existing = state.staff.flatMap(staff => cleanStaffWorkTags(staff));
      return optionPool(masterTags.concat(existing), selected);
    }
    const groups = staffWorkTagGroups();
    const existing = state.staff.flatMap(staff => cleanStaffWorkTags(staff));
    return optionPool(Object.values(groups).flat().concat(existing), selected);
  }

  function staffStatusLabel(status) {
    const normalized = normalizeStaffStatus(status);
    const labels = state.lang === "vi"
      ? { active: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", off: "T\u1ea1m ngh\u1ec9", inactive: "T\u1ea1m ngh\u1ec9", deleted: "\u0110\u00e3 x\u00f3a" }
      : { active: "\u7a3c\u50cd\u4e2d", off: "\u4f11\u6b62\u4e2d", inactive: "\u4f11\u6b62\u4e2d", deleted: "\u524a\u9664\u6e08\u307f" };
    return labels[normalized] || staffStatusMap[status] || status || "-";
  }

  function normalizeStaffStatus(status) {
    const normalized = String(status || "active")
      .toLowerCase()
      .replace(/[、，,;/\s]+/g, "")
      .trim();
    if (["deleted"].includes(normalized)) return "deleted";
    if (["off", "inactive", "paused", "pause", "rest", "休止中", "休止", "tạmnghỉ", "nghỉoff"].includes(normalized)) return "off";
    if (["active", "working", "available", "稼働中", "đanghoạtđộng"].includes(normalized)) return "active";
    return normalized || "active";
  }

  function renderSelectOptions(options, selected, placeholder) {
    const selectedValue = compactText(selected, "");
    const normalized = optionPool(options, selectedValue);
    return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ""}${normalized.map(value => `<option value="${escapeHtml(value)}" ${String(value) === String(selectedValue) ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  }

  function staffTextField(name, label, value, type = "text", extra = "") {
    return `<label class="staff-edit-field"><span>${escapeHtml(label)}</span><input name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value || "")}" ${extra}></label>`;
  }

  function staffTextareaField(name, label, value, extra = "") {
    return `<label class="staff-edit-field full"><span>${escapeHtml(label)}</span><textarea name="${escapeHtml(name)}" ${extra}>${escapeHtml(value || "")}</textarea></label>`;
  }

  function staffSelectField(name, label, options, selected) {
    return `<label class="staff-edit-field"><span>${escapeHtml(label)}</span><select name="${escapeHtml(name)}">${renderSelectOptions(options, selected)}</select></label>`;
  }

  function workTypeKey(item) {
    return String(item?.id || item?.code || "").trim();
  }

  function findWorkTypeByValue(value) {
    const normalized = normalizeTag(value);
    if (!normalized) return null;
    return (state.workMaster?.workTypes || []).find(item => {
      return [item.id, item.code, item.nameVi, item.nameJa].some(candidate => normalizeTag(candidate) === normalized);
    }) || null;
  }

  function selectedWorkEntriesFromStaff(staff) {
    const seen = new Set();
    const entries = [];
    const addEntry = (entry) => {
      const key = String(entry.id || entry.code || entry.label || "").trim();
      const normalized = normalizeTag(key || entry.label);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      entries.push(entry);
    };
    const ids = toList(staff?.workTypeIds);
    ids.forEach(value => {
      const found = findWorkTypeByValue(value);
      if (found) addEntry({ id: workTypeKey(found), code: found.code, label: workMasterLabel(found), departmentCode: found.departmentCode, legacy: false });
      else addEntry({ id: value, code: value, label: value, departmentCode: "", legacy: true });
    });
    if (ids.length) return entries;
    cleanStaffWorkTags(staff).forEach(value => {
      const found = findWorkTypeByValue(value);
      if (found) addEntry({ id: workTypeKey(found), code: found.code, label: workMasterLabel(found), departmentCode: found.departmentCode, legacy: false });
      else addEntry({ id: value, code: value, label: value, departmentCode: "", legacy: true });
    });
    return entries;
  }

  function currentStaffDepartmentCode() {
    const department = document.querySelector("#staffForm [data-staff-department-value]");
    return staffDepartmentCode(department?.value || "");
  }

  function currentStaffDepartmentLabel() {
    const code = currentStaffDepartmentCode();
    if (!code) return "-";
    const button = document.querySelector(`[data-staff-department-option="${CSS.escape(code)}"]`);
    return button?.dataset.label || staffDepartmentLabelByKey(code) || code || "-";
  }

  function readSelectedWorkEntries() {
    return Array.from(document.querySelectorAll("[data-selected-work-entry]")).map(input => ({
      id: input.value,
      code: input.dataset.workCode || input.value,
      label: findWorkTypeByValue(input.value) ? workMasterLabel(findWorkTypeByValue(input.value)) : input.dataset.workLabel || input.value,
      departmentCode: findWorkTypeByValue(input.value)?.departmentCode || input.dataset.workDepartment || "",
      legacy: input.dataset.workLegacy === "true" && !findWorkTypeByValue(input.value)
    })).filter(item => item.id || item.label);
  }

  function writeSelectedWorkEntries(entries) {
    const holder = document.querySelector("[data-selected-work-holder]");
    if (!holder) return;
    const seen = new Set();
    holder.innerHTML = entries.filter(item => {
      const key = normalizeTag(item.id || item.label);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).map(item => `<input type="hidden" data-selected-work-entry value="${escapeHtml(item.id || item.code || item.label)}" data-work-code="${escapeHtml(item.code || item.id || item.label)}" data-work-label="${escapeHtml(item.label || item.code || item.id)}" data-work-department="${escapeHtml(item.departmentCode || "")}" data-work-legacy="${item.legacy ? "true" : "false"}">`).join("");
  }

  function renderStaffWorkAssignmentField(staff) {
    const entries = selectedWorkEntriesFromStaff(staff);
    return `<div class="staff-work-assignment" data-staff-work-assignment>
      <p class="note">${escapeHtml(t("staffWorkFlowHelp"))}</p>
      <div data-selected-work-holder>${entries.map(item => `<input type="hidden" data-selected-work-entry value="${escapeHtml(item.id || item.code || item.label)}" data-work-code="${escapeHtml(item.code || item.id || item.label)}" data-work-label="${escapeHtml(item.label || item.code || item.id)}" data-work-department="${escapeHtml(item.departmentCode || "")}" data-work-legacy="${item.legacy ? "true" : "false"}">`).join("")}</div>
      <section class="staff-work-step">
        <div class="staff-work-step-head"><b>${escapeHtml(t("workStepDepartment"))}</b></div>
        ${staffDepartmentSelectField(staff || {})}
        <div class="staff-auto-assign-box">
          <div>
            <strong>${escapeHtml(t("autoAssign"))}</strong>
            <p>${escapeHtml(t("autoAssignHelp"))}</p>
          </div>
          <label class="staff-auto-assign-toggle">
            <input name="autoAssignEnabled" type="checkbox" data-auto-assign-toggle ${staff?.autoAssignEnabled === false ? "" : "checked"}>
            <span>${escapeHtml(t("autoAssignJoin"))}</span>
          </label>
        </div>
      </section>
      <section class="staff-work-step">
        <div class="staff-work-step-head"><b>${escapeHtml(t("workStepPick"))}</b></div>
        <div data-staff-work-picker></div>
      </section>
    </div>`;
  }

  function renderStaffDescriptionField(staff) {
    return `<div class="staff-description-editor">
      <div class="staff-work-step-head">
        <b>${escapeHtml(t("staffDescriptionSection"))}</b>
        <button class="mini-button" type="button" data-staff-selected-work-to-content>${escapeHtml(t("createDescriptionFromSelectedWork"))}</button>
      </div>
      <div class="staff-edit-grid">
        <label class="staff-edit-field full"><span>${escapeHtml(t("staffDescriptionSection"))}</span><textarea name="introduction" placeholder="${escapeHtml(t("staffDescriptionPlaceholder"))}">${escapeHtml(staff?.staffDescription || staff?.introduction || "")}</textarea></label>
        <label class="staff-edit-field full"><span>${escapeHtml(t("internalMemo"))}</span><textarea name="note">${escapeHtml(staff?.note || "")}</textarea></label>
      </div>
    </div>`;
  }

  function renderStaffWorkAssignment(options = {}) {
    const root = document.querySelector("[data-staff-work-assignment]");
    if (!root) return;
    const departmentCode = currentStaffDepartmentCode();
    const departmentLabel = currentStaffDepartmentLabel();
    const selected = readSelectedWorkEntries();
    const selectedIds = new Set(selected.map(item => normalizeTag(item.id || item.code || item.label)));
    const rawSearch = options.searchValue ?? root.querySelector("[data-staff-work-search]")?.value ?? "";
    const search = rawSearch.trim().toLowerCase();
    const pickerTarget = root.querySelector("[data-staff-work-picker]");
    root.querySelectorAll("[data-staff-department-option]").forEach(button => {
      button.classList.toggle("active", button.dataset.staffDepartmentOption === departmentCode);
    });
    if (!pickerTarget) return;
    if (!departmentCode) {
      pickerTarget.innerHTML = `<div class="staff-work-empty"><p>${escapeHtml(t("chooseDepartmentFirst"))}</p></div>`;
      return;
    }
    const workTypes = activeMasterItems("workTypes")
      .filter(item => item.departmentCode === departmentCode)
      .filter(item => {
        const haystack = [item.code, item.nameVi, item.nameJa, item.descriptionVi, item.descriptionJa].join(" ").toLowerCase();
        return !search || haystack.includes(search);
      });
    const selectedCount = selected.length
      ? `<span class="staff-selected-count">${escapeHtml(t("selectedCount"))} ${selected.length} ${escapeHtml(t("itemCountSuffix"))}</span>`
      : "";
    const workTypeHtml = workTypes.length ? workTypes.map(item => {
      const key = workTypeKey(item);
      const checked = selectedIds.has(normalizeTag(key)) || selectedIds.has(normalizeTag(item.code));
      const description = state.lang === "vi" ? item.descriptionVi || item.descriptionJa || "" : item.descriptionJa || item.descriptionVi || "";
      return `<label class="staff-work-type-option ${checked ? "selected" : ""}">
        <input type="checkbox" data-staff-worktype-item value="${escapeHtml(key)}" data-work-code="${escapeHtml(item.code || key)}" data-work-label="${escapeHtml(workMasterLabel(item))}" data-work-department="${escapeHtml(item.departmentCode || "")}" ${checked ? "checked" : ""}>
        <span><b>${escapeHtml(workMasterLabel(item))}</b>${description ? `<small>${escapeHtml(description)}</small>` : ""}</span>
      </label>`;
    }).join("") : `<div class="staff-work-empty"><p>${escapeHtml(t("noWorkTypesInDepartment"))}</p></div>`;
    pickerTarget.innerHTML = `
      <div class="staff-work-picker-head">
        <p class="staff-work-summary">${escapeHtml(t("selectedDepartment"))}: <strong>${escapeHtml(departmentLabel)}</strong></p>
        ${selectedCount}
      </div>
      <input class="filter-input" type="search" data-staff-work-search placeholder="${escapeHtml(t("workTypeSearchPlaceholder"))}" value="${escapeHtml(search)}">
      <div class="staff-work-type-list" data-staff-work-type-list>${workTypeHtml}</div>`;
    if (options.keepSearchFocus) {
      const searchInput = pickerTarget.querySelector("[data-staff-work-search]");
      if (searchInput) {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
      }
    }
  }

  function staffTagPickerField(name, label, selected, department) {
    const selectedItems = toList(selected);
    const selectedSet = new Set(selectedItems.map(item => item.toLowerCase()));
    const departmentKey = staffDepartmentCode(department);
    const allTags = allStaffWorkTags(selectedItems);
    const selectedHtml = selectedItems.length
      ? selectedItems.map(tag => `<button class="staff-selected-tag" type="button" data-staff-tag-remove="${escapeHtml(tag)}">${escapeHtml(tag)} <span aria-hidden="true">\u00d7</span></button>`).join("")
      : `<span class="muted-dash">-</span>`;
    const tagsHtml = allTags.map((tag, index) => {
      const tagDept = staffTagDepartmentKey(tag);
      const id = `${name}-${normalizeTag(tag) || "tag"}-${index}`;
      const outside = tagDept !== "outside" && tagDept !== departmentKey ? t("outsideDepartmentTags") : "";
      return `<label class="staff-tag-option" for="${escapeHtml(id)}" data-staff-tag-item data-tag="${escapeHtml(tag)}" data-tag-dept="${escapeHtml(tagDept)}">
        <input id="${escapeHtml(id)}" type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(tag)}" ${selectedSet.has(tag.toLowerCase()) ? "checked" : ""}>
        <span>${escapeHtml(tag)}</span>${outside ? `<small>${escapeHtml(outside)}</small>` : ""}
      </label>`;
    }).join("");
    const groupTabs = staffDepartmentPresets().filter(item => item.key !== "other").map(item => `<button class="staff-work-group ${item.key === departmentKey ? "active" : ""}" type="button" data-staff-work-group="${escapeHtml(item.key)}">${escapeHtml(item.label)}</button>`).join("");
    return `<div class="staff-edit-field full">
      <span>${escapeHtml(label)}</span>
      <div class="staff-tag-picker" data-staff-tag-picker data-current-dept="${escapeHtml(departmentKey)}" data-tag-mode="department">
        <div class="staff-selected-tags"><strong>${escapeHtml(t("selectedTags"))}</strong><div data-staff-selected-tags>${selectedHtml}</div></div>
        <div class="staff-work-groups"><strong>${escapeHtml(t("staffWorkGroup"))}</strong><div>${groupTabs}</div></div>
        <div class="staff-tag-toolbar">
          <input class="filter-input" type="search" data-staff-tag-search placeholder="${escapeHtml(t("tagSearchPlaceholder"))}">
          <div class="staff-tag-tabs">
            <button class="staff-tag-tab active" type="button" data-staff-tag-mode="department">${escapeHtml(t("tagsByDepartment"))}</button>
            <button class="staff-tag-tab" type="button" data-staff-tag-mode="all">${escapeHtml(t("allTags"))}</button>
            <button class="staff-tag-tab" type="button" data-staff-tag-mode="selected">${escapeHtml(t("selectedTags"))}</button>
          </div>
        </div>
        <div class="staff-tag-list" data-staff-tag-list>${tagsHtml || `<span class="muted-dash">-</span>`}</div>
      </div>
    </div>`;
  }

  function renderStaffForm(staff) {
    const item = staff || {};
    const id = getRowId(item);
    const avatar = item.avatar || "";
    const statusOptions = ["active", "off"];
    const selectedStatus = normalizeStaffStatus(item.status || "") === "off" ? "off" : "active";
    document.querySelector("[data-staff-edit-overlay]")?.remove();
    const overlay = document.createElement("div");
    overlay.className = "staff-edit-overlay";
    overlay.id = "staffEditOverlay";
    overlay.dataset.staffEditOverlay = "";
    overlay.innerHTML = `
      <article class="staff-edit-modal" role="dialog" aria-modal="true" aria-labelledby="staffEditTitle">
        <form id="staffForm" data-staff-id="${escapeHtml(id)}" data-staff-edit-dirty="false">
          <header class="staff-edit-header">
            <div>
              <p class="staff-edit-eyebrow">${escapeHtml(t("staffEditTitle"))}</p>
              <h2 class="staff-edit-title" id="staffEditTitle">${escapeHtml(item.name || t("addStaff"))}</h2>
              <span>${escapeHtml(item.email || id || "-")}</span>
            </div>
            <div class="staff-edit-header-actions">
              <button class="btn btn-soft" type="button" data-staff-edit-close>${escapeHtml(t("close"))}</button>
            </div>
          </header>
          <div class="staff-edit-body">
            <div class="staff-edit-columns">
              <div class="staff-edit-column">
                <section class="staff-edit-section">
                  <h3>${escapeHtml(t("staffProfileBasic"))}</h3>
                  <div class="staff-avatar-editor">
                    <div class="staff-avatar-preview" data-avatar-preview>
                      ${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(t("preview"))}">` : `<span>${escapeHtml(t("noAvatarPreview"))}</span>`}
                    </div>
                    <div class="staff-avatar-controls">
                      <strong>${escapeHtml(t("avatar"))}</strong>
                      <input type="hidden" name="avatar" value="${escapeHtml(avatar)}" data-avatar-url>
                      <input class="sr-only" id="staffAvatarInput" name="avatarFile" type="file" accept="image/*" data-avatar-file>
                      <div class="actions">
                        <label class="btn btn-soft" for="staffAvatarInput">${escapeHtml(t("chooseImage"))}</label>
                        <button class="btn btn-soft" type="button" data-staff-avatar-pick>${escapeHtml(t("uploadImage"))}</button>
                        <button class="btn btn-soft" type="button" data-staff-avatar-remove>${escapeHtml(t("removeImage"))}</button>
                      </div>
                      <small data-avatar-status>${escapeHtml(t("preview"))}</small>
                    </div>
                  </div>
                  <div class="staff-edit-grid">
                    ${staffTextField("name", t("name"), item.name)}
                    ${staffTextField("email", t("email"), item.email, "email")}
                    ${staffTextField("phone", t("phone"), item.phone, "tel")}
                    <label class="staff-edit-field"><span>${escapeHtml(t("status"))}</span><select name="status">${statusOptions.map(status => `<option value="${status}" ${selectedStatus === status ? "selected" : ""}>${escapeHtml(staffStatusLabel(status))}</option>`).join("")}</select></label>
                  </div>
                </section>
              </div>

              <div class="staff-edit-column">
                <section class="staff-edit-section">
                  <h3>${escapeHtml(t("staffAssignment"))}</h3>
                  ${renderStaffWorkAssignmentField(item)}
                </section>
                <section class="staff-edit-section">
                  ${renderStaffDescriptionField(item)}
                </section>
              </div>
            </div>
          </div>
          <footer class="staff-edit-footer">
            <span class="request-unsaved-note" data-staff-edit-unsaved hidden>${escapeHtml(t("unsavedChanges"))}</span>
            <button class="ghost-button" type="button" data-staff-edit-close>${escapeHtml(t("close"))}</button>
            <button class="primary-button" type="submit" data-staff-edit-save disabled>${escapeHtml(t("saveChanges"))}</button>
          </footer>
        </form>
      </article>
    `;
    document.body.appendChild(overlay);
    renderStaffWorkAssignment();
  }

  function field(name, label, value, textarea) {
    const input = textarea
      ? `<textarea name="${name}">${escapeHtml(value || "")}</textarea>`
      : `<input name="${name}" value="${escapeHtml(value || "")}" />`;
    return `<label class="field ${textarea ? "full" : ""}"><span>${escapeHtml(label)}</span>${input}</label>`;
  }

  function renderQuotes() {
    const quoteStages = state.lang === "vi"
      ? ["Đang tạo", "Chờ duyệt", "Đã gửi", "Đang thương lượng", "Nhận đơn", "Mất đơn"]
      : ["作成中", "承認待ち", "送付済み", "交渉中", "受注", "失注"];
    const stages = ["作成中", "承認待ち", "送付済み", "交渉中", "受注", "失注"];
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("quoteShell"))}</p></div>
      <div class="kpi-grid kpi-grid-small">
        ${statCard(t("quoteTotal"), "-", t("planned"), "info")}
        ${statCard(t("quoteWinRate"), "-", t("planned"), "success")}
        ${statCard(t("averageUnitPrice"), "-", t("planned"), "warning")}
        ${statCard(t("grossMargin"), "-", t("planned"), "total")}
      </div>
      <div class="request-command-bar demo-actions">
        <button class="btn btn-soft" disabled>${escapeHtml(t("pdfExport"))}</button>
        <button class="btn btn-primary" disabled>+ ${escapeHtml(t("quoteRegister"))}</button>
      </div>
      <section class="section-card">
        <div class="panel-head">
          <div>
            <h2>${escapeHtml(t("pipelineTitle"))}</h2>
            <p class="note">MongoDB API連携予定</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="pipeline-board">
            ${quoteStages.map(stage => `<section class="pipeline-column"><header><strong>${escapeHtml(stage)}</strong><span>0</span></header>${showEmptyState(t("emptyColumn"))}<button class="mini-button" disabled>+ ${escapeHtml(t("quoteRegister"))}</button></section>`).join("")}
          </div>
          <div class="actions" style="margin-top:16px">
            <button class="ghost-button" disabled>${escapeHtml(t("quoteRegister"))}</button>
            <button class="ghost-button" disabled>${escapeHtml(t("proposalCreate"))}</button>
            <button class="ghost-button" disabled>${escapeHtml(t("pdfExport"))}</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderQuoteDetail(quote) {
    openDrawer(`
      <article class="drawer-panel profile-drawer">
        <header class="drawer-head drawer-header">
          <div><h2>${escapeHtml(quote.quoteCode || quote.id || t("quote"))}</h2><p class="note">${escapeHtml(quote.projectName || quote.title || "-")}</p></div>
          <button class="close-button" type="button" data-close-drawer>×</button>
        </header>
        <div class="drawer-body">
          <div class="info-grid">
            ${infoItem(t("quote"), quote.quoteCode || quote.id)}
            ${infoItem(t("relatedRequest"), quote.requestId)}
            ${infoItem(t("customer"), quote.customerName || quote.name)}
            ${infoItem(t("status"), quote.status)}
            ${infoItem(t("createdAt"), formatDate(quote.createdAt))}
            ${infoItem(t("deletedAt"), formatDate(quote.deletedAt))}
          </div>
        </div>
      </article>
    `);
  }

  function renderQuoteDetailPlaceholder(quote) {
    const totals = calculateQuoteTotals(quote);
    openDrawer(`
      <article class="drawer-panel quote-detail-drawer">
        <header class="drawer-head drawer-header">
          <div><p class="eyebrow">${escapeHtml(t("quickQuote"))}</p><h2>${escapeHtml(t("quoteDetailTitle"))}</h2></div>
          <div class="quote-detail-actions"><button class="btn btn-soft" type="button" data-quote-placeholder-action>${escapeHtml(t("saveDraft"))}</button><button class="btn btn-primary" type="button" data-quote-placeholder-action>${escapeHtml(t("sendToCustomerApp"))}</button></div>
          <button class="quote-detail-close" type="button" data-close-drawer aria-label="${escapeHtml(t("close"))}">&times;</button>
        </header>
        <div class="drawer-body quote-detail-form quote-detail-content">
          <div class="quote-dev-note">${escapeHtml(t("quoteDetailPlaceholderText"))}</div>
          <section class="quote-form-section">
            <h3>${escapeHtml(quote.quoteNo || t("quoteNew"))}</h3>
            <div class="info-grid">
              ${infoItem(t("quoteNo"), quote.quoteNo)}
              ${infoItem(t("customer"), quote.customerName || t("noCustomerSelected"))}
              ${infoItem(t("projectContent"), quote.projectName || quote.title || "-")}
              ${infoItem(t("grandTotal"), quoteCurrency(totals.total))}
              ${infoItem(t("status"), quoteStatusLabel(quoteAdminStatus(quote.status)))}
              ${infoItem(t("validUntil"), quoteDateLabel(quote.validUntil))}
              ${infoItem(t("assignee"), quote.assigneeName || t("noAssignee"))}
            </div>
          </section>
        </div>
      </article>
    `);
  }

  const QUOTE_MOCK_STORAGE_KEY = "yamaden-mobile-spa";
  const QUOTE_LAYOUT_STORAGE_KEY = "yamaden-quotes-layout-v1";
  const QUOTE_STATUSES = ["draft", "pending_approval", "sent_to_customer", "viewed_by_customer", "change_requested", "accepted", "rejected", "expired"];

  function quoteStatusLabel(status) {
    const key = {
      draft: "quoteStatusDraft",
      pending_approval: "quoteStatusPendingApproval",
      sent_to_customer: "quoteStatusSentToCustomer",
      viewed_by_customer: "quoteStatusViewedByCustomer",
      change_requested: "quoteStatusChangeRequested",
      accepted: "quoteStatusAccepted",
      rejected: "quoteStatusRejected",
      expired: "quoteStatusExpired",
      pending: "quoteStatusSentToCustomer",
      approved: "quoteStatusAccepted",
      revision_requested: "quoteStatusChangeRequested"
    }[status] || "quoteStatusDraft";
    return t(key);
  }

  function quoteCustomerAppStatus(status) {
    if (status === "expired") return "expired";
    return status || "draft";
  }

  function quoteAdminStatus(status) {
    if (status === "approved") return "accepted";
    if (status === "revision_requested") return "change_requested";
    if (status === "pending") return "sent_to_customer";
    return status || "draft";
  }

  function toNumber(value) {
    const number = Number(String(value ?? "0").replace(/[^\d.-]/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function quoteCurrency(value) {
    return "\u00a5" + Math.round(toNumber(value)).toLocaleString("ja-JP");
  }

  function quoteAddItemLabel() {
    return "+ " + String(t("addQuoteItem")).replace(/^\+\s*/, "");
  }

  function quoteItemAmount(item) {
    return calculateQuotationTotals([item], 0).items[0]?.lineTotal || 0;
  }

  function calculateQuotationTotals(items, vatRate = 10) {
    const normalizedItems = toList(items).map(item => {
      const quantity = toNumber(item?.quantity || 1) || 1;
      const unitPrice = toNumber(item?.unitPrice);
      const discountPercent = Math.max(0, toNumber(item?.discountPercent ?? item?.discountRate ?? item?.discount));
      const lineSubtotal = quantity * unitPrice;
      const lineDiscount = Math.round(lineSubtotal * discountPercent / 100);
      const lineTotal = Math.max(0, lineSubtotal - lineDiscount);
      return { ...item, quantity, unitPrice, discount: discountPercent, discountPercent, lineSubtotal, lineDiscount, lineTotal, amount: lineTotal };
    });
    const normalizedVatRate = Math.max(0, toNumber(vatRate == null || vatRate === "" ? 10 : vatRate));
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const discountTotal = normalizedItems.reduce((sum, item) => sum + item.lineDiscount, 0);
    const taxableAmount = Math.max(0, subtotal - discountTotal);
    const vatAmount = Math.round(taxableAmount * normalizedVatRate / 100);
    const grandTotal = taxableAmount + vatAmount;
    return { items: normalizedItems, subtotal, discountTotal, discount: discountTotal, taxableAmount, vatRate: normalizedVatRate, taxRate: normalizedVatRate / 100, vatAmount, taxAmount: vatAmount, grandTotal, total: grandTotal };
  }

  function calculateQuoteTotals(quote) {
    const items = toList(quote?.items);
    const rawTaxRate = quote?.vatRate ?? quote?.taxRate ?? 0.1;
    const taxRatePercent = toNumber(rawTaxRate) <= 1 ? toNumber(rawTaxRate) * 100 : toNumber(rawTaxRate);
    const totals = calculateQuotationTotals(items, taxRatePercent || 10);
    const subtotal = totals.subtotal;
    const discount = totals.discountTotal;
    const taxableAmount = totals.taxableAmount;
    const taxRate = totals.taxRate;
    const taxAmount = totals.taxAmount;
    const rounding = toNumber(quote?.rounding);
    const total = Math.max(0, totals.grandTotal + rounding);
    if (quote && typeof quote === "object") {
      quote.items = totals.items;
      quote.subtotal = subtotal;
      quote.discount = 0;
      quote.discountTotal = discount;
      quote.subtotalAfterDiscount = taxableAmount;
      quote.taxAmount = taxAmount;
      quote.vatAmount = taxAmount;
      quote.total = total;
    }
    return { subtotal, discount, discountTotal: discount, taxableAmount, taxRate, taxRatePercent, taxAmount, vatAmount: taxAmount, rounding, total, grandTotal: total, items: totals.items };
  }

  function normalizeQuoteItem(item, index) {
    return {
      id: item?.id || "item-" + Date.now() + "-" + index,
      name: item?.name || "",
      description: item?.description || "",
      unit: item?.unit || "\u5f0f",
      quantity: toNumber(item?.quantity || 1),
      unitPrice: toNumber(item?.unitPrice),
      discount: toNumber(item?.discountPercent ?? item?.discountRate ?? item?.discount),
      amount: quoteItemAmount(item)
    };
  }

  function newQuoteId() {
    return "quote-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  function newQuoteNo() {
    return "Q-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-5);
  }

  function normalizeQuoteDemoTitle(value) {
    const text = String(value || "");
    if (text === "Lap them 6 o cam va day dien" || text.includes("6 o cam") || (text.includes("6") && (text.includes("\u862f") || text.includes("\u76fb")))) {
      return "L\u1eafp th\u00eam 6 \u1ed5 c\u1eafm v\u00e0 d\u00e2y \u0111i\u1ec7n";
    }
    return text;
  }

  function normalizeQuote(quote) {
    const now = new Date().toISOString();
    const sourceItems = toList(quote?.items).length ? toList(quote.items) : toList(quote?.quoteItems);
    const items = sourceItems.length ? sourceItems.map(normalizeQuoteItem) : [normalizeQuoteItem({}, 0)];
    const customerId = quote?.customerId || "";
    const customerName = quote?.customerName || quote?.name || "";
    const projectName = normalizeQuoteDemoTitle(quote?.projectName || quote?.title || "");
    const title = normalizeQuoteDemoTitle(quote?.title || quote?.projectName || "");
    const status = !customerId && !customerName && quoteAdminStatus(quote?.status || "draft") === "sent_to_customer"
      ? "draft"
      : quoteAdminStatus(quote?.status || "draft");
    const base = {
      _id: quote?._id || "",
      id: quote?.id || quote?._id || newQuoteId(),
      quoteNo: quote?.quoteNo || quote?.quoteCode || quote?.quoteNumber || quote?.code || quote?.number || newQuoteNo(),
      quoteNumber: quote?.quoteNumber || "",
      code: quote?.code || "",
      number: quote?.number || "",
      requestId: quote?.requestId || quote?.requestCode || quote?.requestNo || "",
      customerId,
      customerName,
      customerPhone: quote?.customerPhone || quote?.phone || "",
      customerEmail: quote?.customerEmail || quote?.email || "",
      content: quote?.content || quote?.description || quote?.requestContent || "",
      projectName,
      projectAddress: quote?.projectAddress || quote?.address || "",
      title,
      status,
      assigneeId: quote?.assigneeId || "",
      assigneeName: quote?.assigneeName || "",
      items,
      discount: Number(quote?.discount || 0),
      taxRate: Number(quote?.taxRate ?? 0.1),
      rounding: Number(quote?.rounding || 0),
      paymentTerms: quote?.paymentTerms || "",
      validUntil: quote?.validUntil || "",
      customerNote: quote?.customerNote || "",
      internalNote: quote?.internalNote || "",
      attachments: toList(quote?.attachments),
      visibleToCustomer: quote?.visibleToCustomer === true,
      sentToCustomerAt: quote?.sentToCustomerAt || "",
      viewedByCustomerAt: quote?.viewedByCustomerAt || "",
      acceptedAt: quote?.acceptedAt || "",
      rejectedAt: quote?.rejectedAt || "",
      changeRequestedAt: quote?.changeRequestedAt || "",
      changeRequestMessage: quote?.changeRequestMessage || "",
      createdAt: quote?.createdAt || now,
      updatedAt: quote?.updatedAt || now
    };
    const totals = calculateQuoteTotals(base);
    return { ...base, subtotal: totals.subtotal, taxAmount: totals.taxAmount, total: totals.total, quoteCode: base.quoteNo };
  }

  function ensureQuoteDefaults(quote) {
    const target = quote && typeof quote === "object" ? quote : {};
    target.items = Array.isArray(target.items) ? target.items : [];
    if (!target.items.length) target.items.push(normalizeQuoteItem({}, 0));
    else target.items = target.items.map(normalizeQuoteItem);
    if (target.vatRate == null && target.taxRate == null) {
      target.vatRate = 10;
      target.taxRate = 0.1;
    }
    if (target.discount == null) target.discount = 0;
    if (target.rounding == null) target.rounding = 0;
    calculateQuoteTotals(target);
    return target;
  }

  function readCustomerAppQuotes() {
    try {
      const parsed = JSON.parse(localStorage.getItem(QUOTE_MOCK_STORAGE_KEY) || "null");
      return Array.isArray(parsed?.state?.quotes) ? parsed.state.quotes.map(normalizeQuote) : [];
    } catch (error) {
      console.warn("Unable to read quote mock cache", error);
      return [];
    }
  }

  function writeCustomerAppQuotes(quotes) {
    const parsed = JSON.parse(localStorage.getItem(QUOTE_MOCK_STORAGE_KEY) || "{}");
    const stateValue = parsed.state || {};
    localStorage.setItem(QUOTE_MOCK_STORAGE_KEY, JSON.stringify({ ...parsed, state: { ...stateValue, quotes } }));
    localStorage.setItem(QUOTE_LAYOUT_STORAGE_KEY, JSON.stringify({ quotes }));
  }

  function loadQuoteLayoutState() {
    state.quotes = Array.isArray(state.quotes) ? state.quotes.map(normalizeQuote) : [];
    return state.quotes;
  }

  async function refreshQuoteLayoutData() {
    try {
      state.quotes = normalizeList(await AdminAPI.getQuotes());
    } catch (error) {
      console.error(error);
      loadQuoteLayoutState();
    }
    renderQuotes();
    toast(t("quoteLayoutRefreshed"));
  }

  function quoteRows() {
    const byId = new Map();
    loadQuoteLayoutState();
    state.quotes.map(normalizeQuote).forEach(item => byId.set(String(item._id || item.id || item.quoteNo), item));
    return [...byId.values()].filter(item => !item.isDeleted && !item.deletedAt);
  }

  function persistMockQuote(quote) {
    const normalized = normalizeQuote(quote);
    const quotes = quoteRows();
    const next = [normalized, ...quotes.filter(item => String(item._id || "") !== String(normalized._id || "___new_quote") && String(item.id) !== String(normalized.id) && String(item.quoteNo) !== String(normalized.quoteNo))];
    state.quotes = next;
    writeCustomerAppQuotes(next.map(item => ({
      ...item,
      status: quoteCustomerAppStatus(item.status),
      quoteCode: item.quoteNo,
      items: item.items.map(row => ({ ...row, amount: quoteItemAmount(row) }))
    })));
    return normalized;
  }

  function openQuoteDetail(quoteId) {
    const quote = quoteRows().find(item => [item._id, item.id, item.quoteNo, item.quoteCode, item.quoteNumber, item.code, item.number].some(value => value && String(value) === String(quoteId)));
    if (!quote) {
      toast(t("quoteNotFound"));
      return;
    }
    state.selectedQuoteId = quote._id || quote.id;
    state.quoteWizardStep = 1;
    try {
      renderQuoteDetail(quote);
    } catch (error) {
      console.error(error);
      renderQuoteDetailPlaceholder(quote);
    }
  }

  function closeQuoteDetail() {
    state.selectedQuoteId = null;
    closeDrawer();
  }

  function filterQuotes(rows) {
    const search = String(state.filters.quoteSearch || "").toLowerCase();
    const status = state.filters.quoteStatus || "all";
    const assignee = state.filters.quoteAssignee || "all";
    const customer = state.filters.quoteCustomer || "all";
    const validity = state.filters.quoteValidity || "all";
    return rows.filter(item => {
      const text = [item.quoteNo, item.customerName, item.projectName, item.title].join(" ").toLowerCase();
      const matchesValidity = validity === "all" || quoteValidityStatus(item) === validity;
      const matchesAssignee = assignee === "all" || [item.assigneeId, item.assigneeName].some(value => String(value || "") === assignee);
      const matchesCustomer = customer === "all" || [item.customerId, item.customerName].some(value => String(value || "") === customer);
      return (!search || text.includes(search)) && (status === "all" || quoteAdminStatus(item.status) === status) && matchesAssignee && matchesCustomer && matchesValidity;
    });
  }

  function quoteNeedsCustomer(quote) {
    return !quote?.customerId && !quote?.customerName;
  }

  function parseQuoteDate(value) {
    const text = String(value || "").trim();
    const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) return new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
    return new Date(text);
  }

  function quoteExpiresSoon(quote) {
    if (!quote?.validUntil) return false;
    const due = parseQuoteDate(quote.validUntil);
    if (Number.isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + 7);
    due.setHours(0, 0, 0, 0);
    return due >= today && due <= limit && !["accepted", "rejected", "expired"].includes(quoteAdminStatus(quote.status));
  }

  function quoteValidityStatus(quote) {
    if (!quote?.validUntil) return "unset";
    if (quoteAdminStatus(quote.status) === "expired") return "expired";
    const due = parseQuoteDate(quote.validUntil);
    if (Number.isNaN(due.getTime())) return "unset";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "expired";
    if (quoteExpiresSoon(quote)) return "expiring";
    return "valid";
  }

  function quoteDateLabel(value) {
    if (!value) return t("noValidUntil");
    const parsed = parseQuoteDate(value);
    if (Number.isNaN(parsed.getTime())) return t("noValidUntil");
    return parsed.toLocaleDateString(state.lang === "ja" ? "ja-JP" : "vi-VN");
  }

  function quotePipelineSummary(count) {
    return state.lang === "vi"
      ? t("quotePipelineTracking").replace("{count}", String(count))
      : `${count}${t("quotePipelineTracking")}`;
  }

  function updateQuoteScrollButtons() {
    const board = document.querySelector(".quote-kanban-board");
    if (!board) return;
    const left = document.querySelector("[data-quote-scroll='-1']");
    const right = document.querySelector("[data-quote-scroll='1']");
    const atStart = board.scrollLeft <= 4;
    const atEnd = board.scrollLeft + board.clientWidth >= board.scrollWidth - 4;
    if (left) left.disabled = atStart;
    if (right) right.disabled = atEnd;
  }

  function quoteWizardLabels() {
    return [
      state.lang === "vi" ? "Chi ti\u1ebft y\u00eau c\u1ea7u" : "\u4f9d\u983c\u8a73\u7d30",
      state.lang === "vi" ? "B\u00e1o gi\u00e1" : "\u898b\u7a4d"
    ];
  }

  function renderQuoteWizardSteps() {
    const current = Number(state.quoteWizardStep || 1);
    return `<nav class="quote-wizard-steps" aria-label="${escapeHtml(t("quoteDetailTitle"))}">${quoteWizardLabels().map((label, index) => {
      const step = index + 1;
      const done = step < current;
      return `<button class="quote-wizard-step ${step === current ? "active" : ""} ${done ? "done" : ""}" type="button" data-quote-wizard-step="${step}" ${step > current ? "disabled" : ""}><b>${done ? "\u2713" : step}</b><span>${escapeHtml(label)}</span></button>`;
    }).join("")}</nav>`;
  }

  function renderQuoteSummaryCard(quote, totals, editable) {
    return `<section class="quote-work-card quote-payment-card">
      <h3>${escapeHtml(t("quotePaymentSummary"))}</h3>
      <div class="quote-payment-grid">
        <div class="quote-payment-lines">
          <div class="summary-row"><span>${escapeHtml(t("subtotal"))}</span><strong data-quote-summary="subtotal">${escapeHtml(quoteCurrency(totals.subtotal))}</strong></div>
          <div class="summary-row"><span>${escapeHtml(t("discount"))}</span><strong data-quote-summary="discount">${escapeHtml(quoteCurrency(totals.discountTotal || totals.discount || 0))}</strong></div>
          <div class="summary-row"><span>${escapeHtml(t("quoteAfterDiscount"))}</span><strong data-quote-summary="afterDiscount">${escapeHtml(quoteCurrency(totals.taxableAmount))}</strong></div>
          <div class="summary-row"><span>${escapeHtml(t("taxRate"))}</span><strong data-quote-summary="taxRate">${escapeHtml(Math.round((quote.taxRate || 0.1) * 100))}%</strong></div>
          <div class="summary-row"><span>${escapeHtml(t("taxAmount"))}</span><strong data-quote-summary="taxAmount">${escapeHtml(quoteCurrency(totals.taxAmount))}</strong></div>
        </div>
        <div class="quote-grand-total"><span>${escapeHtml(t("quoteGrandTotalVat"))}</span><strong data-quote-summary="total">${escapeHtml(quoteCurrency(totals.total))}</strong></div>
      </div>
      <div class="quote-mini-summary"><span>${escapeHtml(t("quoteItemCount").replace("{count}", String(quote.items.length)))}</span><span>${escapeHtml(t("validUntil"))}: ${escapeHtml(quoteDateLabel(quote.validUntil))}</span></div>
    </section>`;
  }

  function renderQuoteReviewRows(quote) {
    const rows = toList(quote.items);
    if (!rows.length) return `<tr><td colspan="8">${escapeHtml(t("noQuotes"))}</td></tr>`;
    return rows.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.name || "-")}</td><td>${escapeHtml(item.description || "-")}</td><td>${escapeHtml(item.unit || "-")}</td><td>${escapeHtml(item.quantity)}</td><td>${escapeHtml(quoteCurrency(item.unitPrice))}</td><td>${escapeHtml(toNumber(item.discount))}%</td><td>${escapeHtml(quoteCurrency(quoteItemAmount(item)))}</td></tr>`).join("");
  }

  function quoteStepSubtitle(key) {
    const vi = {
      customerNote: "N\u1ed9i dung n\u00e0y s\u1ebd hi\u1ec3n th\u1ecb cho kh\u00e1ch h\u00e0ng.",
      paymentTerms: "\u0110i\u1ec1u kho\u1ea3n \u00e1p d\u1ee5ng khi g\u1eedi b\u00e1o gi\u00e1.",
      internalNote: "Ch\u1ec9 admin nh\u00ecn th\u1ea5y.",
      ready: "C\u00f3 th\u1ec3 chuy\u1ec3n sang b\u01b0\u1edbc xem l\u1ea1i."
    };
    const ja = {
      customerNote: "\u3053\u306e\u5185\u5bb9\u306f\u9867\u5ba2\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002",
      paymentTerms: "\u898b\u7a4d\u9001\u4ed8\u6642\u306b\u9069\u7528\u3055\u308c\u308b\u652f\u6255\u6761\u4ef6\u3002",
      internalNote: "\u7ba1\u7406\u8005\u306e\u307f\u8868\u793a\u3002",
      ready: "\u78ba\u8a8d\u30b9\u30c6\u30c3\u30d7\u3078\u9032\u3081\u307e\u3059\u3002"
    };
    return (state.lang === "ja" ? ja : vi)[key] || "";
  }

  function renderQuoteStep1(quote, readonly, requestLinked) {
    return `<div class="quote-step-grid quote-step-request-only">
      <section class="quote-work-card quote-request-link">
        <div class="quote-card-header"><div><h3>${escapeHtml(t("quoteRequestInput"))}</h3><p class="quote-card-subtitle">${escapeHtml(t("linkedRequest"))}</p></div><button class="btn btn-soft" type="button" data-quote-request-search>${escapeHtml(requestLinked ? t("changeRequest") : t("searchAction"))}</button></div>
        <label class="quote-field-wide"><span>${escapeHtml(t("linkedRequest"))}</span><input name="requestId" value="${escapeHtml(quote.requestId)}" placeholder="${escapeHtml(t("quoteRequestPlaceholder"))}" ${readonly ? "readonly" : ""}></label>
        <div class="quote-linked-summary">${requestLinked ? `<strong>${escapeHtml(quote.requestId)}</strong><span>${escapeHtml(quote.projectName || quote.title || "-")}</span><small>${escapeHtml(quote.customerName || "-")}</small>` : `<span>${escapeHtml(t("requestNotLinked"))}</span>`}</div>
      </section>
      <section class="quote-work-card">
        <div class="quote-card-header"><div><h3>${escapeHtml(t("quoteCustomerProjectInfo"))}</h3><p class="quote-card-subtitle">${escapeHtml(t("quoteWizardStep1"))}</p></div></div>
        <div class="quote-field-grid quote-info-grid">
          <label><span>${escapeHtml(t("customer"))}</span><input name="customerName" value="${escapeHtml(quote.customerName)}" ${readonly ? "readonly" : ""}></label>
          <label><span>${escapeHtml(t("phone"))}</span><input name="customerPhone" value="${escapeHtml(quote.customerPhone)}" ${readonly ? "readonly" : ""}></label>
          <label><span>${escapeHtml(t("email"))}</span><input name="customerEmail" value="${escapeHtml(quote.customerEmail)}" ${readonly ? "readonly" : ""}></label>
          <label><span>ID</span><input name="customerId" value="${escapeHtml(quote.customerId)}" ${readonly ? "readonly" : ""}></label>
          <label><span>${escapeHtml(t("address"))}</span><input name="projectAddress" value="${escapeHtml(quote.projectAddress)}" ${readonly ? "readonly" : ""}></label>
          <label><span>${escapeHtml(t("projectContent"))}</span><input name="projectName" value="${escapeHtml(quote.projectName)}" ${readonly ? "readonly" : ""}></label>
          <label class="quote-field-wide"><span>${escapeHtml(state.lang === "ja" ? "依頼内容" : "Nội dung yêu cầu")}</span><textarea name="requestContent" ${readonly ? "readonly" : ""}>${escapeHtml(quote.content || "")}</textarea></label>
          <label><span>${escapeHtml(t("assignee"))}</span><input name="assigneeName" value="${escapeHtml(quote.assigneeName)}" ${readonly ? "readonly" : ""}></label><input type="hidden" name="assigneeId" value="${escapeHtml(quote.assigneeId)}">
        </div>
      </section>
    </div>`;
  }

  function renderQuoteStep2(quote, readonly, itemCountText) {
    return `<div class="quote-step-grid quote-step-items-only">
      <section class="quote-work-card quote-items-card quote-primary-work-card">
        <div class="quote-card-header quote-items-header"><div><h3>${escapeHtml(t("quoteItems"))}</h3><p class="quote-card-subtitle" data-quote-item-count>${escapeHtml(itemCountText)}</p></div><button class="btn btn-primary" type="button" data-quote-add-item ${readonly ? "disabled" : ""}>${escapeHtml(quoteAddItemLabel())}</button></div>
        <div class="quote-table-wrap quote-item-table-shell"><div class="quote-item-table quote-item-table-pro" data-quote-items><div class="quote-item-row quote-item-header"><span>No.</span><span>${escapeHtml(t("itemName"))}</span><span>${escapeHtml(t("itemDescription"))}</span><span>${escapeHtml(t("unit"))}</span><span>${escapeHtml(t("quantity"))}</span><span>${escapeHtml(t("unitPrice"))}</span><span>${escapeHtml(t("discount"))} %</span><span>${escapeHtml(t("lineAmount"))}</span><span>${escapeHtml(t("action"))}</span></div>${quote.items.length ? quote.items.map(renderQuoteItemRow).join("") : `<div class="quote-empty-line">${escapeHtml(t("noQuotes"))}</div>`}</div></div>
      </section>
    </div>`;
  }

  function quoteDataWarnings(quote, totals) {
    const warnings = [];
    if (quoteNeedsCustomer(quote)) warnings.push(state.lang === "ja" ? "\u9867\u5ba2\u304c\u672a\u8a2d\u5b9a\u3067\u3059" : "Thi\u1ebfu kh\u00e1ch h\u00e0ng");
    if (!quote.validUntil) warnings.push(state.lang === "ja" ? "\u6709\u52b9\u671f\u9650\u304c\u672a\u8a2d\u5b9a\u3067\u3059" : "Ch\u01b0a \u0111\u1eb7t hi\u1ec7u l\u1ef1c");
    if (!quote.items.length) warnings.push(state.lang === "ja" ? "\u898b\u7a4d\u9805\u76ee\u304c\u3042\u308a\u307e\u305b\u3093" : "Ch\u01b0a c\u00f3 h\u1ea1ng m\u1ee5c");
    if (totals.total <= 0) warnings.push(state.lang === "ja" ? "\u5408\u8a08\u91d1\u984d\u304c\u00a50\u3067\u3059" : "T\u1ed5ng ti\u1ec1n b\u1eb1ng \u00a50");
    return warnings;
  }

  function renderQuoteWarningList(quote, totals) {
    const warnings = quoteDataWarnings(quote, totals);
    if (!warnings.length) return `<div class="quote-warning-list is-ok" data-quote-warning-list><p>${escapeHtml(quoteStepSubtitle("ready"))}</p></div>`;
    return `<div class="quote-warning-list" data-quote-warning-list>${warnings.map(item => `<p>${escapeHtml(item)}</p>`).join("")}</div>`;
  }

  function updateQuoteWarningList(target, quote, totals) {
    const warnings = quoteDataWarnings(quote, totals);
    if (!target) return;
    target.classList.toggle("is-ok", warnings.length === 0);
    if (!warnings.length) {
      target.innerHTML = `<p>${escapeHtml(quoteStepSubtitle("ready"))}</p>`;
      return;
    }
    target.innerHTML = warnings.map(item => `<p>${escapeHtml(item)}</p>`).join("");
  }

  function renderQuoteStep3(quote, readonly) {
    return `<div class="quote-step-grid quote-step-notes-only">
      <section class="quote-work-card quote-note-card quote-note-card-main"><div class="quote-card-header"><div><h3>${escapeHtml(t("quoteNotes"))}</h3><p class="quote-card-subtitle">${escapeHtml(quoteStepSubtitle("customerNote"))}</p></div></div><textarea name="customerNote" data-quote-note-mirror ${readonly ? "readonly" : ""}>${escapeHtml(quote.customerNote)}</textarea></section>
      <section class="quote-work-card quote-note-card quote-note-card-main"><div class="quote-card-header"><div><h3>${escapeHtml(t("paymentTerms"))}</h3><p class="quote-card-subtitle">${escapeHtml(quoteStepSubtitle("paymentTerms"))}</p></div></div><textarea name="paymentTerms" ${readonly ? "readonly" : ""}>${escapeHtml(quote.paymentTerms || t("quoteTermsDefault"))}</textarea></section>
      <section class="quote-work-card quote-note-card"><div class="quote-card-header"><div><h3>${escapeHtml(t("internalNote"))}</h3><p class="quote-card-subtitle">${escapeHtml(quoteStepSubtitle("internalNote"))}</p></div></div><textarea name="internalNote" ${readonly ? "readonly" : ""}>${escapeHtml(quote.internalNote)}</textarea></section>
      <section class="quote-work-card">
        <div class="quote-field-grid quote-info-grid">
          <label><span>${escapeHtml(t("validUntil"))}</span><input name="validUntil" type="date" value="${escapeHtml(String(quote.validUntil || "").slice(0, 10))}" ${readonly ? "readonly" : ""}></label>
          <label><span>${escapeHtml(t("taxRate"))}</span><input name="taxRate" type="number" value="${escapeHtml(Math.round((quote.taxRate || 0.1) * 100))}" ${readonly ? "readonly" : ""}></label>
        </div>
      </section>
    </div>`;
  }

  function renderQuoteStep4(quote, totals) {
    return `<div class="quote-step-grid quote-step-payment-only">
      <section class="quote-work-card quote-payment-card quote-payment-detail-card">
        <div class="quote-card-header"><div><h3>${escapeHtml(t("quotePaymentSummary"))}</h3><p class="quote-card-subtitle">${escapeHtml(t("quotePaymentSummary"))}</p></div></div>
        <div class="quote-money-list">
          <div class="quote-money-row"><span>${escapeHtml(t("subtotal"))}</span><strong data-quote-summary="subtotal">${escapeHtml(quoteCurrency(totals.subtotal))}</strong></div>
          <div class="quote-money-row"><span>${escapeHtml(t("discount"))}</span><strong data-quote-summary="discount">${escapeHtml(quoteCurrency(totals.discountTotal || totals.discount || 0))}</strong></div>
          <div class="quote-money-row"><span>${escapeHtml(t("quoteAfterDiscount"))}</span><strong data-quote-summary="afterDiscount">${escapeHtml(quoteCurrency(totals.taxableAmount))}</strong></div>
          <div class="quote-money-row"><span>${escapeHtml(t("taxRate"))}</span><strong data-quote-summary="taxRate">${escapeHtml(Math.round((quote.taxRate || 0.1) * 100))}%</strong></div>
          <div class="quote-money-row"><span>${escapeHtml(t("taxAmount"))}</span><strong data-quote-summary="taxAmount">${escapeHtml(quoteCurrency(totals.taxAmount))}</strong></div>
          <div class="quote-money-row quote-money-row-total"><span>${escapeHtml(t("quoteGrandTotalVat"))}</span><strong data-quote-summary="total">${escapeHtml(quoteCurrency(totals.total))}</strong></div>
        </div>
      </section>
      <section class="quote-total-highlight"><span>${escapeHtml(t("quoteGrandTotalVat"))}</span><strong data-quote-summary="total">${escapeHtml(quoteCurrency(totals.total))}</strong></section>
    </div>`;
  }

  function renderQuoteTodaySummary(rows) {
    const items = [
      [t("quotePendingApprovalShort"), rows.filter(quote => quoteAdminStatus(quote.status) === "pending_approval").length],
      [t("quoteExpiringSoonShort"), rows.filter(quoteExpiresSoon).length],
      [t("quoteMissingCustomerShort"), rows.filter(quoteNeedsCustomer).length],
      [t("quoteChangeRequestedShort"), rows.filter(quote => quoteAdminStatus(quote.status) === "change_requested").length]
    ];
    return `<section class="quote-today-card"><p class="eyebrow">${escapeHtml(t("quoteTodayNeedsAction"))}</p><div class="quote-today-grid">${items.map(([label, value]) => `<div class="quote-today-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`).join("")}</div></section>`;
  }

  async function renderQuotes() {
    $("viewRoot").innerHTML = `<section class="section-card"><div class="panel-body">${escapeHtml(t("loading"))}</div></section>`;
    let rows = [];
    try {
      const payload = await AdminAPI.getQuoteRequests({ search: state.filters.quoteSearch || "" });
      const allRows = normalizeList(payload.requests || payload.data);
      const quoteCounts = {
        all: allRows.length,
        not_sent: allRows.filter(item => !isQuoteSent(item)).length,
        sent: allRows.filter(item => isQuoteSent(item)).length
      };
      rows = allRows;
      const sendStatus = state.filters.quoteSendStatus || "all";
      if (sendStatus !== "all") {
        rows = rows.filter(item => isQuoteSent(item) === (sendStatus === "sent"));
      }
      state.quoteRequests = rows;
      state.quoteRequestAllRows = allRows;
      state.quoteRequestCounts = quoteCounts;
    } catch (error) {
      console.error(error);
      toast(error.message || t("failed"));
    }
    const counts = state.quoteRequestCounts || { all: rows.length, not_sent: 0, sent: 0 };
    const activeSendStatus = state.filters.quoteSendStatus || "all";
    $("viewRoot").innerHTML = `
      <div class="crm-filter-bar quote-filter-bar">
        <p class="quote-filter-description">${escapeHtml(state.lang === "vi" ? "Qu\u1ea3n l\u00fd c\u00e1c y\u00eau c\u1ea7u \u0111ang \u1edf tr\u1ea1ng th\u00e1i b\u00e1o gi\u00e1." : "\u898b\u7a4d\u30b9\u30c6\u30fc\u30bf\u30b9\u306e\u4f9d\u983c\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002")}</p>
        <input class="filter-input" data-quote-filter="search" value="${escapeHtml(state.filters.quoteSearch || "")}" placeholder="${escapeHtml(state.lang === "vi" ? "T\u00ecm m\u00e3 y\u00eau c\u1ea7u / kh\u00e1ch h\u00e0ng / n\u1ed9i dung" : "\u4f9d\u983cID\u30fb\u9867\u5ba2\u30fb\u5185\u5bb9\u3067\u691c\u7d22")}">
        <div class="quote-send-tabs" role="tablist">
          ${["all", "not_sent", "sent"].map(value => `<button class="quote-send-tab ${activeSendStatus === value ? "is-active" : ""}" type="button" data-quote-send-filter="${escapeHtml(value)}">${escapeHtml(quoteText(value === "all" ? "all" : value === "sent" ? "sentShort" : "notSentShort"))} (${escapeHtml(String(counts[value] || 0))})</button>`).join("")}
        </div>
        <button class="btn btn-soft quote-filter-refresh" type="button" data-quote-refresh>${escapeHtml(t("refresh"))}</button>
      </div>
      <section class="section-card">
        <div class="panel-body quote-board-body">
          ${rows.length ? `<div class="quote-request-list">${rows.map(renderQuoteRequestCard).join("")}</div>` : `<div class="empty-state"><strong>${escapeHtml(state.lang === "vi" ? "Ch\u01b0a c\u00f3 y\u00eau c\u1ea7u b\u00e1o gi\u00e1" : "\u898b\u7a4d\u306e\u4f9d\u983c\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093")}</strong><p>${escapeHtml(state.lang === "vi" ? "Chuy\u1ec3n y\u00eau c\u1ea7u sang tr\u1ea1ng th\u00e1i B\u00e1o gi\u00e1 \u0111\u1ec3 b\u1eaft \u0111\u1ea7u." : "\u4f9d\u983c\u3092\u898b\u7a4d\u30b9\u30c6\u30fc\u30bf\u30b9\u306b\u5909\u66f4\u3057\u3066\u958b\u59cb\u3057\u307e\u3059\u3002")}</p></div>`}
        </div>
      </section>
    `;
  }

  function quoteText(key) {
    const vi = {
      all: "Tất cả",
      sentShort: "Đã gửi",
      notSentShort: "Chưa gửi",
      sentBadge: "Đã gửi báo giá",
      notSentBadge: "Chưa gửi báo giá",
      requestFiles: "File yêu cầu",
      quoteFiles: "File báo giá",
      sentAt: "Đã gửi",
      sentBy: "Người gửi",
      viewUpdate: "Xem báo giá / Cập nhật",
      sendQuote: "Gửi báo giá",
      sentFilesTitle: "Báo giá đã gửi",
      dropTitle: "Kéo thả hoặc chọn file báo giá",
      dropHint: "Tối đa 3 file. PDF/Excel/Word, tối đa 25MB/file.",
      resend: "Gửi lại / Cập nhật báo giá",
      noSelectedFile: "Chưa chọn file báo giá.",
      maxFilesError: "Chỉ có thể gửi tối đa 3 file báo giá.",
      selectFileError: "Vui lòng chọn file báo giá.",
      fileLabel: "File",
      unsupportedFile: "không được hỗ trợ. Vui lòng chọn PDF, Excel hoặc Word.",
      oversizeFile: "vượt quá dung lượng cho phép 25MB."
    };
    const ja = {
      all: "すべて",
      sentShort: "送信済み",
      notSentShort: "未送信",
      sentBadge: "見積送信済み",
      notSentBadge: "見積未送信",
      requestFiles: "依頼ファイル",
      quoteFiles: "見積ファイル",
      sentAt: "送信済み",
      sentBy: "送信者",
      viewUpdate: "見積を確認 / 更新",
      sendQuote: "見積送信",
      sentFilesTitle: "送信済み見積ファイル",
      dropTitle: "見積ファイルをドロップまたは選択",
      dropHint: "最大3ファイル。PDF/Excel/Word、1ファイル25MBまで。",
      resend: "見積を再送 / 更新",
      noSelectedFile: "ファイル未選択",
      maxFilesError: "見積ファイルは最大3件まで送信できます。",
      selectFileError: "見積ファイルを選択してください。",
      fileLabel: "ファイル",
      unsupportedFile: "は対応していません。PDF、Excel、Wordを選択してください。",
      oversizeFile: "は25MBの上限を超えています。"
    };
    return (state.lang === "vi" ? vi : ja)[key] || key;
  }

  function getQuoteFiles(request) {
    const seen = new Set();
    return [
      ...toList(request?.quotationFiles),
      ...toList(request?.quoteFiles)
    ].filter(file => file && (file.fileUrl || file.pdfUrl))
      .filter((file, index) => {
        const key = String(file._id || file.quoteId || file.fileUrl || file.pdfUrl || file.fileName || index);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function isQuoteSent(request) {
    return request?.quoteSent === true || request?.quoteStatus === "sent" || getQuoteFiles(request).length > 0;
  }

  function quoteSentInfo(request) {
    const files = getQuoteFiles(request);
    const sent = isQuoteSent(request);
    return {
      sent,
      files,
      count: Number(request.quoteFileCount || files.length || 0),
      sentAt: request.quoteSentAt || files[0]?.sentAt || files[0]?.createdAt || "",
      sentBy: request.quoteSentBy || files[0]?.uploadedBy || ""
    };
  }

  function requestAttachmentCount(request) {
    return normalizeRequestMedia(request).length;
  }

  function renderQuoteRequestCard(request) {
    const quoteInfo = quoteSentInfo(request);
    const id = getRowId(request);
    const sentAt = quoteInfo.sentAt ? formatDateTime(quoteInfo.sentAt) : "";
    return `<button class="quote-request-card" type="button" data-open-request-quote="${escapeHtml(id)}">
      <div><strong>${escapeHtml(getRequestDisplayId(request))}</strong><span class="status-badge ${quoteInfo.sent ? "quote-sent-badge" : "quote-pending-badge"}">${escapeHtml(quoteInfo.sent ? quoteText("sentBadge") : quoteText("notSentBadge"))}</span></div>
      <h3>${escapeHtml(getRequestContent(request) || request.title || "-")}</h3>
      <p>${escapeHtml(getCustomerName(request) || "-")} / ${escapeHtml(getRequestPhone(request) || "-")}</p>
      <div class="quote-request-meta">
        <span>${escapeHtml(t("assignee"))}: ${escapeHtml(getAssigneeName(request) || "-")}</span>
        <span>${escapeHtml(quoteText("requestFiles"))}: ${escapeHtml(String(requestAttachmentCount(request)))}</span>
        <span>${escapeHtml(quoteText("quoteFiles"))}: ${escapeHtml(String(quoteInfo.count))}</span>
        ${sentAt ? `<span>${escapeHtml(quoteText("sentAt"))}: ${escapeHtml(sentAt)}</span>` : ""}
        ${quoteInfo.sentBy ? `<span>${escapeHtml(quoteText("sentBy"))}: ${escapeHtml(quoteInfo.sentBy)}</span>` : ""}
      </div>
      <div class="quote-request-actions"><span class="btn btn-soft">${escapeHtml(quoteInfo.sent ? quoteText("viewUpdate") : quoteText("sendQuote"))}</span></div>
    </button>`;
  }

  function renderQuoteKanban(rows) {
    return `<div class="quote-kanban-board">${QUOTE_STATUSES.map(status => {
      const cards = rows.filter(item => quoteAdminStatus(item.status) === status);
      return `<section class="pipeline-column quote-column"><header><strong>${escapeHtml(quoteStatusLabel(status))}</strong><span>${cards.length}</span></header>${cards.length ? cards.map(renderQuoteCard).join("") : `<div class="quote-empty-column">${escapeHtml(t("emptyColumn"))}</div>`}</section>`;
    }).join("")}</div>`;
  }

  function renderQuoteCard(quote) {
    const totals = calculateQuoteTotals(quote);
    const customerName = quote.customerName || t("noCustomerSelected");
    const projectName = quote.projectName || quote.title || "";
    const validUntil = quoteDateLabel(quote.validUntil);
    const assigneeName = quote.assigneeName || t("noAssignee");
    const needsCustomer = quoteNeedsCustomer(quote);
    return `<button class="quote-card" type="button" data-quote-card-id="${escapeHtml(quote.id)}" data-quote-action="detail" data-quote-id="${escapeHtml(quote.id)}">
      <span class="quote-card-top"><strong>${escapeHtml(quote.quoteNo)}</strong><span class="status-badge status-${escapeHtml(quoteAdminStatus(quote.status))}">${escapeHtml(quoteStatusLabel(quoteAdminStatus(quote.status)))}</span></span>
      ${needsCustomer ? `<span class="quote-warning-badge">${escapeHtml(t("missingCustomer"))}</span>` : ""}
      <span class="quote-card-customer">${escapeHtml(customerName)}</span>
      ${projectName ? `<small class="quote-card-project">${escapeHtml(projectName)}</small>` : ""}
      <strong class="quote-card-total">${escapeHtml(quoteCurrency(totals.total))}</strong>
      <span class="quote-card-meta">${escapeHtml(t("validUntil"))}: ${escapeHtml(validUntil)}</span>
      <span class="quote-card-meta">${escapeHtml(t("assignee"))}: ${escapeHtml(assigneeName)}</span>
    </button>`;
  }

  function renderQuoteList(rows) {
    return rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table crm-table quote-table-admin"><thead><tr><th>${t("quoteNo")}</th><th>${t("customer")}</th><th>${t("projectContent")}</th><th>${t("grandTotal")}</th><th>${t("status")}</th><th>${t("assignee")}</th><th>${t("validUntil")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(quote => {
      const totals = calculateQuoteTotals(quote);
      return `<tr><td>${escapeHtml(quote.quoteNo)}</td><td>${escapeHtml(quote.customerName || "-")}</td><td>${escapeHtml(quote.projectName || quote.title || "-")}</td><td>${escapeHtml(quoteCurrency(totals.total))}</td><td><span class="status-badge status-${escapeHtml(quoteAdminStatus(quote.status))}">${escapeHtml(quoteStatusLabel(quoteAdminStatus(quote.status)))}</span></td><td>${escapeHtml(quote.assigneeName || "-")}</td><td>${escapeHtml(quoteDateLabel(quote.validUntil))}</td><td><button class="btn btn-soft" type="button" data-quote-action="detail" data-quote-id="${escapeHtml(quote.id)}">${escapeHtml(t("detail"))}</button></td></tr>`;
    }).join("")}</tbody></table></div>` : showEmptyState(t("noQuotes"));
  }

  function emptyQuote() {
    const staff = state.staff.find(item => normalizeStaffStatus(item.status || "active") !== "off") || {};
    const valid = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return normalizeQuote({
      customerId: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      projectName: "",
      projectAddress: "",
      assigneeId: getRowId(staff),
      assigneeName: staff.name || "",
      validUntil: valid,
      paymentTerms: t("quoteTermsDefault"),
      items: [{ name: "", description: "", unit: "\u5f0f", quantity: 1, unitPrice: 0, discount: 0 }]
    });
  }

  function renderQuoteDetail(quote) {
    quote = quoteFileFlowState(quote);
    window.currentQuoteDetail = quote;
    const currentStep = Math.min(2, Math.max(1, Number(state.quoteWizardStep || 1)));
    const quoteInfo = quoteSentInfo(quote);
    openDrawer(`
      <article class="drawer-panel quote-detail-drawer quote-wizard-modal">
        <header class="drawer-head drawer-header quote-workspace-head">
          <div class="quote-head-main">
            <p class="eyebrow">${escapeHtml(state.lang === "vi" ? "B\u00e1o gi\u00e1" : "\u898b\u7a4d")}</p>
            <h2>${escapeHtml(quote.requestNo || quote.requestId || "-")}</h2>
            <p class="note">${escapeHtml(state.lang === "vi" ? "Upload file b\u00e1o gi\u00e1 th\u1ee7 c\u00f4ng v\u00e0 g\u1eedi cho kh\u00e1ch h\u00e0ng." : "\u898b\u7a4d\u30d5\u30a1\u30a4\u30eb\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3057\u9867\u5ba2\u306b\u9001\u4fe1\u3057\u307e\u3059\u3002")}</p>
            <span class="status-badge ${quoteInfo.sent ? "quote-sent-badge" : "quote-pending-badge"}">${escapeHtml(quoteInfo.sent ? quoteText("sentBadge") : quoteText("notSentBadge"))}</span>
          </div>
          <button class="quote-detail-close" type="button" data-close-drawer aria-label="${escapeHtml(t("close"))}">&times;</button>
        </header>
        ${renderQuoteWizardSteps()}
        <form class="drawer-body quote-detail-form quote-wizard-form" data-quote-form data-quote-file-flow>
          <input type="hidden" name="requestMongoId" value="${escapeHtml(quote.requestMongoId || quote.id || "")}">
          <div class="quote-wizard-content">
            <section class="quote-wizard-panel ${currentStep === 1 ? "is-active" : ""}" data-quote-step-panel="1">
              <h3>${escapeHtml(state.lang === "vi" ? "Chi ti\u1ebft y\u00eau c\u1ea7u" : "\u4f9d\u983c\u8a73\u7d30")}</h3>
              <section class="quote-work-card">
                <div class="info-grid">
                  ${infoItem(t("id"), quote.requestNo || quote.requestId)}
                  ${infoItem(t("customer"), quote.customerName)}
                  ${infoItem(t("phone"), quote.customerPhone)}
                  ${infoItem(t("address"), quote.projectAddress)}
                  ${infoItem(t("createdAt"), quote.createdAt ? formatDateTime(quote.createdAt) : "-")}
                  ${infoItem(t("assignee"), quote.assigneeName)}
                  <div class="info-item wide"><b>${escapeHtml(t("content"))}</b><span>${escapeHtml(quote.content || quote.projectName || "-")}</span></div>
                </div>
              </section>
            </section>
            <section class="quote-wizard-panel ${currentStep === 2 ? "is-active" : ""}" data-quote-step-panel="2">
              <h3>${escapeHtml(state.lang === "vi" ? "B\u00e1o gi\u00e1" : "\u898b\u7a4d")}</h3>
              <section class="quote-work-card">
                ${quoteInfo.sent ? `<div class="quote-sent-summary"><strong>${escapeHtml(quoteText("sentFilesTitle"))}</strong><span>${escapeHtml(quoteText("sentAt"))}: ${escapeHtml(quoteInfo.sentAt ? formatDateTime(quoteInfo.sentAt) : "-")}</span><span>${escapeHtml(quoteText("quoteFiles"))}: ${escapeHtml(String(quoteInfo.count))}</span>${quoteInfo.sentBy ? `<span>${escapeHtml(quoteText("sentBy"))}: ${escapeHtml(quoteInfo.sentBy)}</span>` : ""}</div>` : ""}
                <div class="quote-file-dropzone" data-quote-file-dropzone role="button" tabindex="0">
                  <input class="quote-file-input-hidden" type="file" data-quote-file-input accept=".pdf,.xls,.xlsx,.doc,.docx" multiple>
                  <div class="quote-drop-icon">\u21e7</div>
                  <strong>${escapeHtml(quoteText("dropTitle"))}</strong>
                  <span>${escapeHtml(quoteText("dropHint"))}</span>
                </div>
                <div class="quote-selected-files" data-quote-selected-files>${renderSelectedQuoteFiles()}</div>
                ${renderExistingQuoteFiles(quote)}
              </section>
            </section>
          </div>
          <footer class="quote-wizard-footer">
            <div>${currentStep > 1 ? `<button class="btn btn-soft" type="button" data-quote-prev data-quote-prev-step>${escapeHtml(t("previousStep"))}</button>` : ""}</div>
            <div class="quote-wizard-footer-actions">
              ${currentStep < 2 ? `<button class="btn btn-primary" type="button" data-quote-next data-quote-next-step>${escapeHtml(t("nextStep"))}</button>` : `<button class="btn btn-primary" type="button" data-quote-send-file>${escapeHtml(quoteInfo.sent ? quoteText("resend") : quoteText("sendQuote"))}</button>`}
            </div>
          </footer>
        </form>
      </article>
    `);
  }

  function quoteFileFlowState(source) {
    const request = source || {};
    const displayId = getRequestDisplayId(request) || request.requestNo || request.requestId || request.quoteNo || "";
    const files = getQuoteFiles(request);
    const latest = files[0] || request;
    return {
      useFileFlow: true,
      id: getRowId(request) || request.id || request._id || "",
      requestMongoId: getRowId(request) || request._id || request.id || "",
      requestId: displayId,
      requestNo: displayId,
      customerName: getCustomerName(request) || request.customerName || request.name || "",
      customerPhone: getRequestPhone(request) || request.customerPhone || request.phone || "",
      customerEmail: request.email || request.contact || request.customerEmail || "",
      projectAddress: getRequestAddress(request) || request.address || "",
      projectName: request.projectName || request.title || getRequestContent(request) || "",
      content: getRequestContent(request) || request.content || request.description || "",
      assigneeName: getAssigneeName(request) || request.assigneeName || "",
      createdAt: request.createdAt || "",
      fileUrl: latest.fileUrl || latest.pdfUrl || "",
      originalName: latest.originalName || latest.fileName || "",
      quoteFiles: files,
      quoteSent: request.quoteSent === true || request.quoteStatus === "sent" || files.length > 0,
      quoteSentAt: request.quoteSentAt || latest.sentAt || latest.createdAt || "",
      quoteFileCount: request.quoteFileCount || files.length || 0,
      quoteSentBy: request.quoteSentBy || latest.uploadedBy || ""
    };
  }

  function renderQuoteItemRow(item, index) {
    return `<div class="quote-item-row" data-quote-item-row data-item-id="${escapeHtml(item.id || "")}"><span class="quote-item-index">${index + 1}</span><input name="itemName" value="${escapeHtml(item.name)}" placeholder="${escapeHtml(t("itemName"))}"><input name="itemDescription" value="${escapeHtml(item.description)}" placeholder="${escapeHtml(t("itemDescription"))}"><input name="itemUnit" value="${escapeHtml(item.unit)}" placeholder="${escapeHtml(t("unit"))}"><input name="itemQuantity" type="number" min="0" step="1" value="${escapeHtml(item.quantity)}" placeholder="${escapeHtml(t("quantity"))}"><input name="itemUnitPrice" type="number" min="0" step="1" value="${escapeHtml(item.unitPrice)}" placeholder="${escapeHtml(t("unitPrice"))}"><input name="itemDiscount" type="number" min="0" max="100" step="1" value="${escapeHtml(item.discount)}" placeholder="${escapeHtml(t("discount"))} %"><strong data-quote-line-amount>${escapeHtml(quoteCurrency(quoteItemAmount(item)))}</strong><span class="quote-row-actions"><button class="quote-row-icon" type="button" data-quote-copy-item title="${escapeHtml(t("copyQuoteRow"))}" aria-label="${escapeHtml(t("copyQuoteRow"))}">\u29c9</button><button class="quote-row-icon danger" type="button" data-quote-remove-item title="${escapeHtml(t("deleteQuoteRow"))}" aria-label="${escapeHtml(t("deleteQuoteRow"))}">\u00d7</button></span></div>`;
  }

  function quoteFromForm(form, existing) {
    const raw = new FormData(form);
    const rows = [...form.querySelectorAll("[data-quote-item-row]")].map((row, index) => normalizeQuoteItem({
      id: row.dataset.itemId || "",
      name: row.querySelector("[name='itemName']")?.value || "",
      description: row.querySelector("[name='itemDescription']")?.value || "",
      unit: row.querySelector("[name='itemUnit']")?.value || "",
      quantity: row.querySelector("[name='itemQuantity']")?.value || 0,
      unitPrice: row.querySelector("[name='itemUnitPrice']")?.value || 0,
      discount: row.querySelector("[name='itemDiscount']")?.value || 0
    }, index));
    return ensureQuoteDefaults(normalizeQuote({ ...(existing || {}), _id: raw.get("_id"), id: raw.get("id"), quoteNo: raw.get("quoteNo"), requestId: raw.get("requestId"), customerId: raw.get("customerId"), customerName: raw.get("customerName"), customerPhone: raw.get("customerPhone"), customerEmail: raw.get("customerEmail"), content: raw.get("requestContent"), projectName: raw.get("projectName"), projectAddress: raw.get("projectAddress"), title: raw.get("projectName"), assigneeId: raw.get("assigneeId"), assigneeName: raw.get("assigneeName"), items: rows, discount: 0, taxRate: Number(raw.get("taxRate") || 10) / 100, rounding: raw.get("rounding"), paymentTerms: raw.get("paymentTerms"), validUntil: raw.get("validUntil"), customerNote: raw.get("customerNote"), internalNote: raw.get("internalNote") }));
  }

  function updateQuoteDetailTotals() {
    const form = document.querySelector("[data-quote-form]");
    if (!form) return;
    const quote = quoteFromForm(form, {});
    const totals = calculateQuoteTotals(quote);
    const itemRows = [...form.querySelectorAll("[data-quote-item-row]")];
    const warningQuote = { ...quote, items: itemRows.length ? quote.items : [] };
    const itemTable = form.querySelector("[data-quote-items]");
    if (itemTable) {
      itemTable.querySelector(".quote-empty-line")?.remove();
      if (!itemRows.length) itemTable.insertAdjacentHTML("beforeend", `<div class="quote-empty-line">${escapeHtml(t("noQuotes"))}</div>`);
    }
    const itemCountText = t("quoteItemCount").replace("{count}", String(itemRows.length));
    form.querySelectorAll("[data-quote-item-count]").forEach(node => {
      node.textContent = itemCountText;
    });
    form.querySelector("[data-quote-summary='subtotal']") && (form.querySelector("[data-quote-summary='subtotal']").textContent = quoteCurrency(totals.subtotal));
    form.querySelector("[data-quote-summary='discount']") && (form.querySelector("[data-quote-summary='discount']").textContent = quoteCurrency(totals.discountTotal || totals.discount || 0));
    form.querySelector("[data-quote-summary='afterDiscount']") && (form.querySelector("[data-quote-summary='afterDiscount']").textContent = quoteCurrency(totals.taxableAmount));
    form.querySelector("[data-quote-summary='taxRate']") && (form.querySelector("[data-quote-summary='taxRate']").textContent = Math.round((quote.taxRate || 0.1) * 100) + "%");
    form.querySelector("[data-quote-summary='taxAmount']") && (form.querySelector("[data-quote-summary='taxAmount']").textContent = quoteCurrency(totals.taxAmount));
    form.querySelector("[data-quote-summary='total']") && (form.querySelector("[data-quote-summary='total']").textContent = quoteCurrency(totals.total));
    form.querySelectorAll("[name='discount']").forEach(input => {
      if (input !== document.activeElement) input.value = quote.discount || 0;
    });
    form.querySelectorAll("[name='taxRate']").forEach(input => {
      if (input !== document.activeElement) input.value = Math.round((quote.taxRate || 0.1) * 100);
    });
    form.querySelectorAll("[name='rounding']").forEach(input => {
      if (input !== document.activeElement) input.value = quote.rounding || 0;
    });
    form.querySelectorAll("[data-quote-review-items]").forEach(node => {
      node.innerHTML = renderQuoteReviewRows(quote);
    });
    form.querySelectorAll("[data-quote-review-note]").forEach(node => {
      node.textContent = quote.customerNote || "-";
    });
    form.querySelectorAll("[data-quote-review-terms]").forEach(node => {
      node.textContent = quote.paymentTerms || "-";
    });
    form.querySelectorAll("[data-quote-validity-label]").forEach(node => {
      node.textContent = quoteDateLabel(quote.validUntil);
    });
    form.querySelectorAll("[data-quote-customer-label]").forEach(node => {
      node.textContent = quote.customerName || "-";
    });
    form.querySelectorAll("[data-quote-request-label]").forEach(node => {
      node.textContent = quote.requestId || "-";
    });
    form.querySelectorAll("[data-quote-status-label]").forEach(node => {
      const customerOk = !quoteNeedsCustomer(quote);
      const itemsOk = itemRows.length > 0;
      const validityOk = Boolean(quote.validUntil);
      node.textContent = [
        customerOk ? (state.lang === "ja" ? "\u9867\u5ba2\u8a2d\u5b9a\u6e08\u307f" : "\u0110\u00e3 c\u00f3 kh\u00e1ch h\u00e0ng") : (state.lang === "ja" ? "\u9867\u5ba2\u672a\u8a2d\u5b9a" : "Thi\u1ebfu kh\u00e1ch h\u00e0ng"),
        itemsOk ? (state.lang === "ja" ? "\u660e\u7d30\u3042\u308a" : "\u0110\u00e3 c\u00f3 h\u1ea1ng m\u1ee5c") : (state.lang === "ja" ? "\u660e\u7d30\u306a\u3057" : "Ch\u01b0a c\u00f3 h\u1ea1ng m\u1ee5c"),
        validityOk ? (state.lang === "ja" ? "\u6709\u52b9\u671f\u9650\u8a2d\u5b9a\u6e08\u307f" : "\u0110\u00e3 \u0111\u1eb7t hi\u1ec7u l\u1ef1c") : (state.lang === "ja" ? "\u6709\u52b9\u671f\u9650\u672a\u8a2d\u5b9a" : "Ch\u01b0a \u0111\u1eb7t hi\u1ec7u l\u1ef1c")
      ].join(" / ");
    });
    form.querySelectorAll("[data-quote-warning-list]").forEach(node => {
      updateQuoteWarningList(node, warningQuote, totals);
    });
    itemRows.forEach((row, index) => {
      const itemIndex = row.querySelector(".quote-item-index");
      if (itemIndex) itemIndex.textContent = String(index + 1);
      const item = normalizeQuoteItem({
        quantity: row.querySelector("[name='itemQuantity']")?.value || 0,
        unitPrice: row.querySelector("[name='itemUnitPrice']")?.value || 0,
        discount: row.querySelector("[name='itemDiscount']")?.value || 0
      }, 0);
      const amount = row.querySelector("[data-quote-line-amount]");
      if (amount) amount.textContent = quoteCurrency(quoteItemAmount(item));
    });
  }

  function setQuoteWizardStep(step) {
    const next = Math.min(2, Math.max(1, Number(step || 1)));
    const form = document.querySelector("[data-quote-form]");
    state.quoteWizardStep = next;
    if (form?.matches("[data-quote-file-flow]")) {
      renderQuoteDetail(window.currentQuoteDetail || {});
      return;
    }
    if (form) {
      const existing = quoteRows().find(item => String(item.id) === String(new FormData(form).get("id")));
      renderQuoteDetail(quoteFromForm(form, existing));
      return;
    }
    const content = document.querySelector(".quote-wizard-content");
    if (content) content.scrollTop = 0;
  }

  function validateQuoteStep1() {
    return true;
  }

  function validateQuoteStep2() {
    const form = document.querySelector("[data-quote-form]");
    if (!form) return false;
    if (form.matches("[data-quote-file-flow]")) return true;
    if (!form.querySelectorAll("[data-quote-item-row]").length) {
      toast(t("quoteMissingItemsSend"));
      return false;
    }
    return true;
  }

  function validateCurrentQuoteStep() {
    if (Number(state.quoteWizardStep || 1) === 1) return validateQuoteStep1();
    if (Number(state.quoteWizardStep || 1) === 2) return validateQuoteStep2();
    return true;
  }

  function scrollQuoteWizardToTop() {
    requestAnimationFrame(() => {
      const content = document.querySelector(".quote-wizard-content");
      if (content) content.scrollTop = 0;
    });
  }

  function nextQuoteStep() {
    if (!validateCurrentQuoteStep()) return;
    setQuoteWizardStep(Number(state.quoteWizardStep || 1) + 1);
    scrollQuoteWizardToTop();
  }

  function prevQuoteStep() {
    setQuoteWizardStep(Number(state.quoteWizardStep || 1) - 1);
    scrollQuoteWizardToTop();
  }

  async function saveCurrentQuoteBeforeExport(quote) {
    const savedPayload = await AdminAPI.saveQuote({
      ...quote,
      quoteCode: quote.quoteNo || quote.quoteCode,
      code: quote.code || quote.quoteNo || quote.quoteCode,
      items: quote.items.map(item => ({ ...item, amount: quoteItemAmount(item) }))
    });
    const savedQuote = normalizeQuote(savedPayload?.quote || savedPayload?.data || savedPayload);
    if (!savedQuote?._id) return null;
    window.currentQuoteDetail = savedQuote;
    state.selectedQuoteId = savedQuote._id;
    persistMockQuote(savedQuote);
    const form = document.querySelector("[data-quote-form]");
    if (form) {
      const idInput = form.querySelector("[name='_id']");
      if (idInput) idInput.value = savedQuote._id;
      const localIdInput = form.querySelector("[name='id']");
      if (localIdInput) localIdInput.value = savedQuote.id || savedQuote._id;
      const quoteNoInput = form.querySelector("[name='quoteNo']");
      if (quoteNoInput) quoteNoInput.value = savedQuote.quoteNo || savedQuote.quoteCode || "";
    }
    return savedQuote;
  }

  async function exportCurrentQuotePdf() {
    const form = document.querySelector("[data-quote-form]");
    const formData = form ? new FormData(form) : null;
    const formMongoId = formData?.get("_id") || "";
    const formId = formData?.get("id") || "";
    const formQuoteNo = formData?.get("quoteNo") || "";
    const existing = quoteRows().find(item => [item._id, item.id, item.quoteNo, item.quoteCode, item.quoteNumber, item.code, item.number].some(value => value && [formMongoId, formId, formQuoteNo].some(target => target && String(value) === String(target))));
    const quote = form ? quoteFromForm(form, existing || {}) : existing || window.currentQuoteDetail || null;
    console.log("Current quote for PDF:", quote);
    console.log("Quote _id:", quote && quote._id);
    console.log("Quote quoteNo:", quote && quote.quoteNo);
    if (!quote) {
      toast(state.lang === "vi" ? "Kh\u00f4ng t\u00ecm th\u1ea5y d\u1eef li\u1ec7u b\u00e1o gi\u00e1 \u0111ang m\u1edf." : "\u958b\u3044\u3066\u3044\u308b\u898b\u7a4d\u30c7\u30fc\u30bf\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
      return;
    }
    let exportQuote = quote;
    if (!exportQuote._id) {
      try {
        exportQuote = await saveCurrentQuoteBeforeExport(exportQuote);
      } catch (error) {
        console.error(error);
        exportQuote = null;
      }
      if (!exportQuote?._id) {
        toast(state.lang === "vi" ? "Kh\u00f4ng th\u1ec3 l\u01b0u b\u00e1o gi\u00e1 tr\u01b0\u1edbc khi xu\u1ea5t PDF." : "PDF\u51fa\u529b\u524d\u306b\u898b\u7a4d\u3092\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3002");
        return;
      }
    }
    const id = exportQuote._id;
    if (!id) {
      toast(state.lang === "vi" ? "Kh\u00f4ng t\u00ecm th\u1ea5y ID b\u00e1o gi\u00e1." : "\u898b\u7a4dID\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
      return;
    }
    try {
      const pdfUrl = `/admin/quotes/${encodeURIComponent(id)}/pdf?lang=${encodeURIComponent(state.lang === "vi" ? "vi" : "ja")}`;
      console.log("Export PDF:", pdfUrl);
      const response = await fetch(pdfUrl, {
        cache: "no-store",
        headers: authHeaders()
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthFailure();
        return;
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || body.error || "PDF export failed");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || `YAMADEN_Quote_${String(id).replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
      toast(state.lang === "vi" ? "\u0110ang t\u1ea3i PDF b\u00e1o gi\u00e1." : "\u898b\u7a4dPDF\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u3066\u3044\u307e\u3059\u3002");
    } catch (error) {
      console.error(error);
      toast(state.lang === "vi" ? "Xu\u1ea5t PDF th\u1ea5t b\u1ea1i." : "PDF\u51fa\u529b\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002");
    }
  }

  function validateQuoteDraft(quote) {
    if (quote.projectName || quote.title || quote.items.some(item => item.name)) return "";
    return t("quoteDraftRequired");
  }

  function validateQuoteSend(quote) {
    if (quoteNeedsCustomer(quote)) return t("quoteMissingCustomerSend");
    if (!quote.items.length) return t("quoteMissingItemsSend");
    if (!quote.quoteNo) return t("failed");
    return "";
  }

  function trashCategories() {
    return [
      ["customers", t("customers")],
      ["requests", t("requests")],
      ["quotes", t("quotes")],
      ["staff", t("staff")]
    ];
  }

  function deletedRowsFor(category) {
    if (category === "customers") return state.users.filter(user => normalizeUserStatusValue(user.status) === "deleted" || user.deletedAt);
    if (category === "requests") return state.requests.filter(isSoftDeleted);
    if (category === "quotes") return state.quotes.filter(isSoftDeleted);
    if (category === "staff") return state.staff.filter(staff => staff.status === "deleted" || staff.deletedAt);
    return [];
  }

  function renderTrash() {
    const category = state.filters.trashCategory || "customers";
    const search = (state.filters.trashSearch || "").toLowerCase();
    const rows = deletedRowsFor(category).filter(item => JSON.stringify(item || {}).toLowerCase().includes(search));
    const counts = Object.fromEntries(trashCategories().map(([key]) => [key, deletedRowsFor(key).length]));
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("trashSubtitle"))}</p></div>
      <div class="request-status-row">
        ${trashCategories().map(([key, label]) => `<button class="request-status-chip ${category === key ? "active" : ""}" type="button" data-trash-category="${escapeHtml(key)}"><span class="chip-label">${escapeHtml(label)}</span><b class="chip-count">${counts[key] || 0}</b></button>`).join("")}
      </div>
      <div class="crm-filter-bar">
        <input class="filter-input" data-trash-search value="${escapeHtml(state.filters.trashSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
      </div>
      <section class="section-card">
        <div class="panel-head"><h2>${escapeHtml(trashTitle(category))}</h2><span class="note">${rows.length}</span></div>
        <div class="panel-body crm-table-body">${renderTrashTable(category, rows)}</div>
      </section>
    `;
  }

  function trashTitle(category) {
    const map = {
      customers: t("trashCustomers"),
      requests: t("trashRequests"),
      quotes: t("trashQuotes"),
      staff: t("trashStaff")
    };
    return map[category] || t("trash");
  }

  function renderTrashTable(category, rows) {
    if (!rows.length) return showEmptyState(t("trashEmpty"));
    if (category === "customers") {
      return `<div class="table-wrap crm-table-wrap"><table class="data-table crm-table"><thead><tr><th>${t("customerName")}</th><th>${t("phone")}</th><th>${t("email")}</th><th>${t("deletedBeforeStatus")}</th><th>${t("deletedAt")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(user => {
        const id = getRowId(user);
        return `<tr><td>${escapeHtml(user.name || user.company || user.phone || "-")}</td><td>${escapeHtml(user.phone || "-")}</td><td>${escapeHtml(user.email || "-")}</td><td>${escapeHtml(customerStatusLabel(user.previousStatus || user.status || "deleted"))}</td><td>${escapeHtml(formatDate(user.deletedAt))}</td><td>${trashActions("customers", id)}</td></tr>`;
      }).join("")}</tbody></table></div>`;
    }
    if (category === "requests") {
      return `<div class="table-wrap crm-table-wrap"><table class="data-table request-table"><thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("status")}</th><th>${t("createdAt")}</th><th>${t("deletedAt")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(item => {
        const id = getRowId(item) || getRequestDisplayId(item);
        return `<tr><td>${escapeHtml(getRequestDisplayId(item))}</td><td>${escapeHtml(getCustomerName(item))}</td><td>${escapeHtml(getRequestContent(item))}</td><td>${escapeHtml(formatStatus(item.status))}</td><td>${escapeHtml(formatDate(item.createdAt))}</td><td>${escapeHtml(formatDate(item.deletedAt))}</td><td>${trashActions("requests", id)}</td></tr>`;
      }).join("")}</tbody></table></div>`;
    }
    if (category === "quotes") {
      return `<div class="table-wrap crm-table-wrap"><table class="data-table crm-table"><thead><tr><th>${t("quote")}</th><th>${t("customer")}</th><th>${t("relatedRequest")}</th><th>${t("amount")}</th><th>${t("status")}</th><th>${t("deletedAt")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(item => {
        const id = getRowId(item) || item.quoteCode || item.id;
        const total = Array.isArray(item.items) ? item.items.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0) : "";
        return `<tr><td>${escapeHtml(item.quoteCode || item.id || id)}</td><td>${escapeHtml(item.customerName || item.name || "-")}</td><td>${escapeHtml(item.requestId || "-")}</td><td>${escapeHtml(total || item.amount || "-")}</td><td>${escapeHtml(item.status || "-")}</td><td>${escapeHtml(formatDate(item.deletedAt))}</td><td>${trashActions("quotes", id)}</td></tr>`;
      }).join("")}</tbody></table></div>`;
    }
    return `<div class="table-wrap crm-table-wrap"><table class="data-table staff-table"><thead><tr><th>${t("staff")}</th><th>${t("department")}</th><th>${t("skillsWork")}</th><th>${t("status")}</th><th>${t("deletedAt")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(staff => {
      const id = getRowId(staff);
      return `<tr><td>${escapeHtml(staff.name || "-")}</td><td>${escapeHtml(staffDepartment(staff))}</td><td>${escapeHtml(staff.workContent || staff.skills || "-")}</td><td>${escapeHtml(staffStatusMap[staff.status] || staff.status || "-")}</td><td>${escapeHtml(formatDate(staff.deletedAt))}</td><td>${trashActions("staff", id)}</td></tr>`;
    }).join("")}</tbody></table></div>`;
  }

  function trashActions(type, id) {
    return `<div class="actions crm-actions">
      <button class="btn btn-soft trash-action-btn" type="button" data-trash-action="detail" data-trash-type="${escapeHtml(type)}" data-trash-id="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
      <button class="btn btn-soft trash-action-btn" type="button" data-trash-action="restore" data-trash-type="${escapeHtml(type)}" data-trash-id="${escapeHtml(id)}">${escapeHtml(t("restore"))}</button>
      <button class="btn btn-danger trash-action-btn danger" type="button" data-trash-action="permanent-delete" data-trash-type="${escapeHtml(type)}" data-trash-id="${escapeHtml(id)}">${escapeHtml(t("permanentDelete"))}</button>
    </div>`;
  }

  function trashItemByType(type, id) {
    const rows = deletedRowsFor(type);
    return rows.find(item => String(getRowId(item) || item.id || item.quoteCode || getRequestDisplayId(item)) === String(id));
  }

  function trashDetailItems(type, item) {
    if (type === "customers") {
      return [
        [t("customerName"), item.name || item.company || item.companyName || item.phone],
        [t("phone"), item.phone],
        [t("email"), item.email],
        [t("status"), customerStatusLabel(item.previousStatus || item.status || "deleted")],
        [t("deletedAt"), formatDate(item.deletedAt)],
        ["deletedAt", item.deletedAt || "-"],
        [t("customerId"), getRowId(item)],
        [state.lang === "vi" ? "Lý do xóa" : "削除理由", item.deleteReason || item.deletedReason || item.reason]
      ];
    }
    if (type === "requests") {
      return [
        [t("id"), getRequestDisplayId(item)],
        [t("customer"), getCustomerName(item)],
        [t("content"), getRequestContent(item)],
        [t("status"), formatStatus(item.status)],
        [t("createdAt"), formatDate(item.createdAt)],
        [t("deletedAt"), formatDate(item.deletedAt)]
      ];
    }
    if (type === "quotes") {
      const total = Array.isArray(item.items) ? item.items.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0) : "";
      return [
        [t("quote"), item.quoteCode || item.id || getRowId(item)],
        [t("customer"), item.customerName || item.name],
        [t("relatedRequest"), item.requestId],
        [t("amount"), total || item.amount || item.totalAmount],
        [t("status"), item.status],
        [t("deletedAt"), formatDate(item.deletedAt)]
      ];
    }
    return [
      [t("staff"), item.name],
      [t("department"), staffDepartment(item)],
      [t("status"), staffStatusMap[item.status] || item.status],
      [t("deletedAt"), formatDate(item.deletedAt)]
    ];
  }

  function openTrashDetail(type, id) {
    const item = trashItemByType(type, id);
    if (!item) {
      toast(t("failed"));
      return;
    }
    const titleMap = {
      customers: item.name || item.company || item.companyName || item.phone || t("customer"),
      requests: getRequestDisplayId(item),
      quotes: item.quoteCode || item.id || getRowId(item) || t("quote"),
      staff: item.name || t("staff")
    };
    openDrawer(`
      <article class="drawer-panel">
        <header class="drawer-head drawer-header">
          <div><h2>${escapeHtml(titleMap[type] || t("trash"))}</h2><p class="note">${escapeHtml(trashTitle(type))}</p></div>
          <button class="close-button" type="button" data-close-drawer>&times;</button>
        </header>
        <div class="drawer-body">
          <div class="info-grid">
            ${trashDetailItems(type, item).map(([label, value]) => infoItem(label, value)).join("")}
          </div>
          <div class="modal-actions">
            <button class="btn btn-soft trash-action-btn" type="button" data-trash-action="restore" data-trash-type="${escapeHtml(type)}" data-trash-id="${escapeHtml(id)}">${escapeHtml(t("restore"))}</button>
            <button class="btn btn-danger trash-action-btn danger" type="button" data-trash-action="permanent-delete" data-trash-type="${escapeHtml(type)}" data-trash-id="${escapeHtml(id)}">${escapeHtml(t("permanentDelete"))}</button>
          </div>
        </div>
      </article>
    `);
  }

  async function handleTrashAction(action, type, id) {
    if (!action || !type || !id) {
      toast(t("failed"));
      return;
    }
    if (action === "detail") {
      openTrashDetail(type, id);
      return;
    }
    if (action === "restore") {
      await restoreTrashItem(type, id);
      return;
    }
    if (action === "permanent-delete") {
      await permanentDeleteTrashItem(type, id);
      return;
    }
    toast(t("failed"));
  }

  async function restoreTrashItem(type, id) {
    if (!await confirmAction({ title: t("restoreTrashTitle"), message: t("restoreTrashText"), confirmLabel: t("restore") })) return;
    let response;
    if (type === "customers") response = await AdminAPI.updateUser(id, { status: "active" });
    if (type === "requests") response = await AdminAPI.restoreRequest(id);
    if (type === "quotes") response = await AdminAPI.restoreQuote(id);
    if (type === "staff") response = await AdminAPI.restoreStaff(id);
    if (!response) {
      toast(t("restorePlanned"));
      return;
    }
    updateTrashState(type, response, id);
    closeDrawer();
    toast(t("restoredSuccess"));
    renderCurrentView();
  }

  async function permanentDeleteTrashItem(type, id) {
    if (!await confirmAction({ title: t("permanentDeleteTrashTitle"), message: t("permanentDeleteTrashText"), confirmLabel: t("permanentDelete"), danger: true })) return;
    if (type === "customers") await AdminAPI.deleteUser(id, true);
    if (type === "requests") await AdminAPI.deleteRequest(id, true);
    if (type === "quotes") await AdminAPI.deleteQuote(id, true);
    if (type === "staff") await AdminAPI.deleteStaff(id, true);
    removeTrashState(type, id);
    closeDrawer();
    toast(t("permanentDeletedSuccess"));
    renderCurrentView();
  }

  function updateTrashState(type, response, id) {
    const data = response?.data || response;
    const apply = item => Object.assign({}, item, data || {}, { isDeleted: false, deletedAt: null, status: item.status === "deleted" ? "active" : item.status });
    if (type === "customers") replaceUserInState(data || { id, status: "active", deletedAt: null });
    if (type === "requests") state.requests = state.requests.map(item => String(getRowId(item) || getRequestDisplayId(item)) === String(id) ? apply(item) : item);
    if (type === "quotes") state.quotes = state.quotes.map(item => String(getRowId(item) || item.id || item.quoteCode) === String(id) ? apply(item) : item);
    if (type === "staff") state.staff = state.staff.map(item => String(getRowId(item)) === String(id) ? apply(item) : item);
  }

  function removeTrashState(type, id) {
    if (type === "customers") state.users = state.users.filter(item => String(getRowId(item)) !== String(id));
    if (type === "requests") state.requests = state.requests.filter(item => String(getRowId(item) || getRequestDisplayId(item)) !== String(id));
    if (type === "quotes") state.quotes = state.quotes.filter(item => String(getRowId(item) || item.id || item.quoteCode) !== String(id));
    if (type === "staff") state.staff = state.staff.filter(item => String(getRowId(item)) !== String(id));
  }

  function renderNotifications() {
    const oldUntreated = state.requests.filter(isOverdue).length;
    const pendingUsers = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length;
    const quoteRequested = state.requests.filter(hasQuoteRequested).length;
    const mediaRequests = state.requests.filter(item => getRequestMediaCount(item) > 0).length;
    $("viewRoot").innerHTML = `<div class="notification-grid">
      ${notificationCard(t("longUntreated"), oldUntreated, "requests:requestStatus:untreated")}
      ${notificationCard(t("pendingUsers"), pendingUsers, "customers:customerStatus:pendingApproval")}
      ${notificationCard(t("nearQuoteDeadline"), quoteRequested, "requests:requestStatus:quoted")}
      ${notificationCard(t("hasMedia"), mediaRequests, "requests:media:has")}
    </div>`;
  }

  function notificationCard(label, count, filter) {
    return `<button class="notification-card" type="button" data-dashboard-filter="${escapeHtml(filter || "notification")}"><strong>${escapeHtml(label)}</strong><span class="stat-value">${escapeHtml(count)}</span><p class="note">${escapeHtml(count ? t("realData") : t("planned"))}</p></button>`;
  }

  function masterFormValue(item, field) {
    return escapeHtml(item?.[field] || "");
  }

  function renderMasterStatus(item) {
    return `<span class="status-badge ${item.active === false ? "status-off" : "status-completed"}">${escapeHtml(item.active === false ? t("hidden") : t("active"))}</span>`;
  }

  function masterSelectOptions(items, selected, placeholder) {
    return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ""}${items.map(item => `<option value="${escapeHtml(item.code)}" ${item.code === selected ? "selected" : ""}>${escapeHtml(workMasterLabel(item))}</option>`).join("")}`;
  }

  function renderWorkMasterForm(type, item) {
    const departments = state.workMaster.departments || [];
    const groups = state.workMaster.workGroups || [];
    const titleKey = item?.id ? "edit" : type === "departments" ? "addDepartment" : type === "workGroups" ? "addWorkGroup" : "addWorkType";
    const departmentSelect = type !== "departments"
      ? `<label><span>${escapeHtml(t("department"))}</span><select name="departmentCode" data-master-department-select>${masterSelectOptions(departments, item?.departmentCode || departments[0]?.code || "", t("selectDepartment"))}</select></label>`
      : "";
    const groupSelect = type === "workTypes"
      ? `<label><span>${escapeHtml(t("workGroup"))}</span><select name="workGroupCode">${masterSelectOptions(groups.filter(group => !item?.departmentCode || group.departmentCode === item.departmentCode), item?.workGroupCode || "", t("noWorkGroup"))}</select></label>`
      : "";
    return `<form class="work-master-form" data-work-master-form="${escapeHtml(type)}" data-master-id="${escapeHtml(item?.id || "")}">
      <h3>${escapeHtml(t(titleKey))}</h3>
      <div class="work-master-form-grid">
        ${departmentSelect}
        ${groupSelect}
        <label><span>${escapeHtml(t("code"))}</span><input name="code" value="${masterFormValue(item, "code")}"></label>
        <label><span>${escapeHtml(t("nameVi"))}</span><input name="nameVi" value="${masterFormValue(item, "nameVi")}"></label>
        <label><span>${escapeHtml(t("nameJa"))}</span><input name="nameJa" value="${masterFormValue(item, "nameJa")}"></label>
        <label><span>${escapeHtml(t("descriptionVi"))}</span><input name="descriptionVi" value="${masterFormValue(item, "descriptionVi")}"></label>
        <label><span>${escapeHtml(t("descriptionJa"))}</span><input name="descriptionJa" value="${masterFormValue(item, "descriptionJa")}"></label>
        <label><span>${escapeHtml(t("sortOrder"))}</span><input name="sortOrder" type="number" value="${escapeHtml(item?.sortOrder ?? 0)}"></label>
        <label class="work-master-check"><span>${escapeHtml(t("activeStatus"))}</span><input name="active" type="checkbox" ${item?.active === false ? "" : "checked"}></label>
      </div>
      <div class="actions">
        <button class="btn btn-primary" type="submit">${escapeHtml(t("save"))}</button>
        <button class="btn btn-soft" type="button" data-master-cancel>${escapeHtml(t("cancel"))}</button>
      </div>
    </form>`;
  }

  function renderWorkMasterTable(type) {
    const search = (state.filters.workMasterSearch || "").toLowerCase();
    const rows = (state.workMaster[type] || []).filter(item => {
      const text = [item.code, item.nameVi, item.nameJa, item.descriptionVi, item.descriptionJa, item.departmentCode, item.workGroupCode].join(" ").toLowerCase();
      return !search || text.includes(search);
    });
    const departmentByCode = Object.fromEntries((state.workMaster.departments || []).map(item => [item.code, workMasterLabel(item)]));
    const groupByCode = Object.fromEntries((state.workMaster.workGroups || []).map(item => [item.code, workMasterLabel(item)]));
    return `<div class="table-wrap work-master-table-wrap"><table class="data-table work-master-table">
      <thead><tr><th>${escapeHtml(t("code"))}</th><th>${escapeHtml(t("nameVi"))}</th><th>${escapeHtml(t("nameJa"))}</th><th>${escapeHtml(t("department"))}</th><th>${escapeHtml(t("workGroup"))}</th><th>${escapeHtml(t("sortOrder"))}</th><th>${escapeHtml(t("status"))}</th><th>${escapeHtml(t("action"))}</th></tr></thead>
      <tbody>${rows.length ? rows.map(item => `<tr>
        <td>${escapeHtml(item.code || "-")}</td>
        <td>${escapeHtml(item.nameVi || "-")}</td>
        <td>${escapeHtml(item.nameJa || "-")}</td>
        <td>${escapeHtml(departmentByCode[item.departmentCode] || item.departmentCode || "-")}</td>
        <td>${escapeHtml(groupByCode[item.workGroupCode] || item.workGroupCode || "-")}</td>
        <td>${escapeHtml(item.sortOrder ?? 0)}</td>
        <td>${renderMasterStatus(item)}</td>
        <td><div class="actions">
          <button class="btn btn-soft" type="button" data-master-edit="${escapeHtml(type)}" data-master-id="${escapeHtml(item.id)}">${escapeHtml(t("edit"))}</button>
          <button class="btn btn-soft" type="button" data-master-status="${escapeHtml(type)}" data-master-id="${escapeHtml(item.id)}" data-master-active="${item.active === false ? "true" : "false"}">${escapeHtml(item.active === false ? t("show") : t("hide"))}</button>
          <button class="btn btn-soft" type="button" data-master-delete="${escapeHtml(type)}" data-master-id="${escapeHtml(item.id)}">${escapeHtml(t("delete"))}</button>
        </div></td>
      </tr>`).join("") : `<tr><td colspan="8">${showEmptyState()}</td></tr>`}</tbody>
    </table></div>`;
  }

  function renderWorkMaster() {
    const tab = state.filters.workMasterTab || "departments";
    const editItem = state.filters.workMasterEditId
      ? (state.workMaster[tab] || []).find(item => item.id === state.filters.workMasterEditId)
      : null;
    $("viewRoot").innerHTML = `<section class="section-card work-master-panel">
      <div class="panel-head">
        <div><h2>${escapeHtml(t("workMaster"))}</h2><p class="note">${escapeHtml(t("workMasterUpdated"))}</p></div>
        <input class="filter-input work-master-search" data-work-master-search value="${escapeHtml(state.filters.workMasterSearch || "")}" placeholder="${escapeHtml(t("searchWorkMaster"))}">
      </div>
      <div class="staff-tag-tabs work-master-tabs">
        ${[["departments", t("department")], ["workGroups", t("workGroups")], ["workTypes", t("workTypes")]].map(([key, label]) => `<button class="staff-tag-tab ${tab === key ? "active" : ""}" type="button" data-work-master-tab="${escapeHtml(key)}">${escapeHtml(label)}</button>`).join("")}
      </div>
      ${renderWorkMasterForm(tab, editItem)}
      ${renderWorkMasterTable(tab)}
    </section>`;
  }

  function renderSettings() {
    const activeTab = settingsTabs().some(tab => tab.id === state.settingsTab) ? state.settingsTab : "overview";
    state.settingsTab = activeTab;
    $("viewRoot").innerHTML = `
      <section class="settings-shell">
        <div class="settings-layout">
          <aside class="settings-menu-card" aria-label="${escapeHtml(t("settingsSystemTitle"))}">
            ${settingsTabs().map(renderSettingsMenuItem).join("")}
          </aside>
          <main class="settings-content-panel">
            <div class="settings-content-grid">
              ${renderSettingsContent(activeTab)}
            </div>
          </main>
        </div>
      </section>
      ${state.settingsDetail ? renderSettingsDetailModal() : ""}`;
  }

  function settingsTabs() {
    return [
      ["overview", "dashboard", "settingsOverview", "settingsOverviewSub"],
      ["staffWork", "users", "settingsStaffWork", "settingsStaffWorkSub"],
      ["aiAssist", "sparkles", "settingsAiAssist", "settingsAiAssistSub"],
      ["processChart", "trend", "settingsProcessChart", "settingsProcessChartSub"],
      ["requestStatus", "clipboard", "settingsRequestStatus", "settingsRequestStatusSub"],
      ["customers", "userCheck", "settingsCustomers", "settingsCustomersSub"],
      ["notifications", "bell", "settingsNotifications", "settingsNotificationsSub"],
      ["appearance", "palette", "settingsAppearance", "settingsAppearanceSub"],
      ["permissions", "shield", "settingsPermissions", "settingsPermissionsSub"],
      ["systemData", "database", "settingsSystemData", "settingsSystemDataSub"]
    ].map(([id, icon, titleKey, subtitleKey]) => ({ id, icon, titleKey, subtitleKey }));
  }

  function renderSettingsMenuItem(tab) {
    const active = state.settingsTab === tab.id;
    return `<button class="settings-menu-item ${active ? "active" : ""}" type="button" data-settings-tab="${escapeHtml(tab.id)}" aria-pressed="${active ? "true" : "false"}">
      <span class="settings-menu-icon">${settingsIcon(tab.icon)}</span>
      <span>
        <strong>${escapeHtml(t(tab.titleKey))}</strong>
        <small>${escapeHtml(t(tab.subtitleKey))}</small>
      </span>
    </button>`;
  }

  function settingsIcon(name) {
    const attrs = 'viewBox="0 0 24 24" aria-hidden="true" focusable="false"';
    const icons = {
      dashboard: `<svg ${attrs}><rect x="3" y="3" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="15" width="7" height="6" rx="2"/></svg>`,
      users: `<svg ${attrs}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.8"/><path d="M16 3.2a4 4 0 0 1 0 7.6"/></svg>`,
      receipt: `<svg ${attrs}><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-2-1.3V5a2 2 0 0 1 2-2z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h3"/></svg>`,
      clipboard: `<svg ${attrs}><path d="M9 5h6"/><path d="M9 3h6v4H9z"/><path d="M7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="m8 13 2 2 5-5"/><path d="M8 18h7"/></svg>`,
      sparkles: `<svg ${attrs}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/><path d="m5 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></svg>`,
      trend: `<svg ${attrs}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M4 21h16"/></svg>`,
      userCheck: `<svg ${attrs}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/></svg>`,
      bell: `<svg ${attrs}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
      palette: `<svg ${attrs}><path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 4-4 4h-1.5a2 2 0 0 0-1.7 3l.2.4A1.8 1.8 0 0 1 13.4 22H12z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/><circle cx="16.5" cy="11" r="1"/></svg>`,
      shield: `<svg ${attrs}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-5"/></svg>`,
      database: `<svg ${attrs}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>`
    };
    return icons[name] || icons.dashboard;
  }

  function settingsBadge(label, tone) {
    return `<span class="settings-badge ${tone || ""}">${escapeHtml(label)}</span>`;
  }

  function settingList(items) {
    const list = (items || []).slice(0, 4);
    const more = (items || []).length - list.length;
    return `<ul class="settings-detail-list">${list.map(item => `<li>${escapeHtml(item)}</li>`).join("")}${more > 0 ? `<li>+${more}</li>` : ""}</ul>`;
  }

  function settingCard(icon, title, items, status, tone, extra) {
    const detailKey = `${state.settingsTab || "overview"}:${title}`;
    return `<article class="settings-shell-card" data-settings-detail="${escapeHtml(detailKey)}" tabindex="0" role="button">
      <div class="settings-card-head">
        <span class="settings-card-icon">${settingsIcon(icon)}</span>
        <div>
          <h3>${escapeHtml(title)}</h3>
          ${status ? settingsBadge(status, tone) : ""}
        </div>
      </div>
      <div class="settings-card-body">
        ${Array.isArray(items) ? settingList(items) : `<p class="settings-card-note">${escapeHtml(items || "")}</p>`}
        ${extra || ""}
      </div>
      <div class="settings-card-footer">
        <button class="btn btn-soft" type="button" data-settings-detail="${escapeHtml(detailKey)}">${escapeHtml(settingText("Mở chi tiết", "\u8a73\u7d30\u3092\u958b\u304f"))}</button>
      </div>
    </article>`;
  }

  function settingText(vi, ja) {
    return state.lang === "vi" ? vi : ja;
  }

  function settingsButton(label) {
    return `<button class="btn btn-soft" type="button" disabled>${escapeHtml(label)}</button>`;
  }

  function settingsChips(items) {
    const list = (items || []).slice(0, 8);
    const more = (items || []).length - list.length;
    return `<div class="settings-chip-list">${list.map(item => `<span>${escapeHtml(item)}</span>`).join("")}${more > 0 ? `<span>+${more}</span>` : ""}</div>`;
  }

  function settingsTable(headers, rows, emptyText) {
    if (!rows.length) return `<div class="settings-empty-state">${escapeHtml(emptyText || t("noData"))}</div>`;
    return `<div class="settings-table-wrap"><table class="settings-table"><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function settingsFlow(items) {
    return `<div class="settings-flow-list">${items.map((item, index) => `<div class="settings-flow-step"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`).join("")}</div>`;
  }

  function renderSettingsContent(tab) {
    const renderers = {
      overview: renderSettingsOverview,
      staffWork: renderSettingsStaffWork,
      aiAssist: renderSettingsAiAssist,
      processChart: renderSettingsProcessChart,
      requestStatus: renderSettingsRequestStatus,
      customers: renderSettingsCustomers,
      notifications: renderSettingsNotifications,
      appearance: renderSettingsAppearance,
      permissions: renderSettingsPermissions,
      systemData: renderSettingsSystemData
    };
    return (renderers[tab] || renderSettingsOverview)();
  }

  function overviewSectionData(section) {
    return state.overviewSettingsDrafts[section] || normalizeOverviewSettings(state.overviewSettings)[section] || {};
  }

  function overviewError(section, field) {
    return state.overviewSettingsErrors?.[`${section}.${field}`] || "";
  }

  function overviewField(section, field, label, options = {}) {
    const editing = Boolean(state.overviewSettingsEditing[section]) || state.settingsDetail?.overviewSection === section;
    const data = overviewSectionData(section);
    const value = data[field] ?? "";
    const name = `data-overview-field="${escapeHtml(section)}.${escapeHtml(field)}"`;
    const disabled = editing ? "" : "disabled";
    const error = overviewError(section, field);
    let control = "";
    if (options.type === "textarea") {
      control = `<textarea ${name} ${disabled} rows="${options.rows || 3}" placeholder="${escapeHtml(options.placeholder || "")}">${escapeHtml(value)}</textarea>`;
    } else if (options.type === "select") {
      control = `<select ${name} ${disabled}>${(options.options || []).map(item => `<option value="${escapeHtml(item.value)}" ${String(value) === String(item.value) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>`;
    } else if (options.type === "checkbox") {
      control = `<label class="overview-toggle"><input ${name} ${disabled} type="checkbox" ${value ? "checked" : ""}> <span>${escapeHtml(options.checkboxLabel || label)}</span></label>`;
      return `<div class="overview-field overview-field-toggle">${control}${error ? `<small class="overview-error">${escapeHtml(error)}</small>` : ""}</div>`;
    } else {
      control = `<input ${name} ${disabled} type="${escapeHtml(options.type || "text")}" value="${escapeHtml(value)}" placeholder="${escapeHtml(options.placeholder || "")}">`;
    }
    return `<label class="overview-field"><span>${escapeHtml(label)}</span>${control}${error ? `<small class="overview-error">${escapeHtml(error)}</small>` : ""}</label>`;
  }

  function overviewSummaryCard(section, icon, title, status, lines, description) {
    const detailKey = `overview:${section}`;
    return `<article class="settings-shell-card" data-settings-detail="${escapeHtml(detailKey)}" tabindex="0" role="button">
      <div class="settings-card-head">
        <span class="settings-card-icon">${settingsIcon(icon)}</span>
        <div>
          <h3>${escapeHtml(title)}</h3>
          ${status ? settingsBadge(status, section === "dataStatus" ? "is-planned" : "is-live") : ""}
        </div>
      </div>
      <div class="settings-card-body">
        ${description ? `<p class="settings-card-note">${escapeHtml(description)}</p>` : ""}
        ${settingList(lines)}
      </div>
      <div class="settings-card-footer">
        <button class="btn btn-soft" type="button" data-settings-detail="${escapeHtml(detailKey)}">${escapeHtml(settingText("Mở chi tiết", "\u8a73\u7d30\u3092\u958b\u304f"))}</button>
      </div>
    </article>`;
  }

  function pocStatusLabel(value) {
    const labels = {
      preparing: settingText("Đang chuẩn bị", "\u6e96\u5099\u4e2d"),
      running: settingText("Đang chạy POC", "POC\u5b9f\u884c\u4e2d"),
      completed: settingText("Đã hoàn tất POC", "POC\u5b8c\u4e86")
    };
    return labels[value] || labels.running;
  }

  function renderSettingsOverview() {
    const settings = normalizeOverviewSettings(state.overviewSettings);
    const status = state.overviewSettingsStatus || {};
    const company = settings.company;
    const system = settings.system;
    const requestCode = settings.requestCode;
    const poc = settings.poc;
    const statusRows = [
      ["Database", status.database || (state.errors.overviewSettings ? "disconnected" : "connected")],
      ["Email provider", status.emailProvider || "not configured"],
      ["Admin notification email", status.adminNotificationEmailConfigured ? settingText("Đã cấu hình", "\u8a2d\u5b9a\u6e08\u307f") : settingText("Chưa cấu hình", "\u672a\u8a2d\u5b9a")],
      [settingText("Tổng số yêu cầu", "\u4f9d\u983c\u6570"), status.requestCount ?? state.requests.length],
      [settingText("Tổng số khách hàng", "\u9867\u5ba2\u6570"), status.customerCount ?? state.users.length],
      [settingText("Tổng số staff", "\u30b9\u30bf\u30c3\u30d5\u6570"), status.staffCount ?? state.staff.length],
      [settingText("Tổng số báo giá đã gửi", "\u9001\u4fe1\u6e08\u307f\u898b\u7a4d\u6570"), status.sentQuoteCount ?? state.requests.filter(isQuoteSent).length]
    ];
    const langLabel = system.defaultLanguage === "vi" ? "Tiếng Việt" : "\u65e5\u672c\u8a9e";
    return [
      overviewSummaryCard("company", "palette", settingText("Thông tin công ty", "\u4f1a\u793e\u60c5\u5831"), settingText("Đang dùng", "\u4f7f\u7528\u4e2d"), [
        company.nameJa || "-",
        company.nameEn || "-",
        company.sloganJa || company.sloganEn || "-"
      ], settingText("Tên công ty, slogan, liên hệ và logo.", "\u4f1a\u793e\u540d\u3001\u30b9\u30ed\u30fc\u30ac\u30f3\u3001\u9023\u7d61\u5148\u3001\u30ed\u30b4\u3002")),
      overviewSummaryCard("system", "database", settingText("Cấu hình hệ thống", "\u30b7\u30b9\u30c6\u30e0\u8a2d\u5b9a"), settingText("Đang dùng", "\u4f7f\u7528\u4e2d"), [
        `${settingText("Ngôn ngữ", "\u8a00\u8a9e")}: ${langLabel}`,
        `${settingText("Múi giờ", "\u30bf\u30a4\u30e0\u30be\u30fc\u30f3")}: ${system.timezone || "Asia/Tokyo"}`,
        `${settingText("Chế độ", "\u30e2\u30fc\u30c9")}: ${system.pocMode ? "POC" : (system.environmentName || "Production")}`
      ], settingText("Ngôn ngữ mặc định, múi giờ và vận hành.", "\u65e2\u5b9a\u8a00\u8a9e\u3001\u30bf\u30a4\u30e0\u30be\u30fc\u30f3\u3001\u904b\u7528\u3002")),
      overviewSummaryCard("requestCode", "clipboard", settingText("Mã yêu cầu", "\u4f9d\u983cID"), settingText("Đang dùng", "\u4f7f\u7528\u4e2d"), [
        `Prefix: ${requestCode.prefix || "YMD"}`,
        `${settingText("Định dạng", "\u5f62\u5f0f")}: ${requestCode.format || "YMD-xxxxxx"}`,
        settingText("Áp dụng: yêu cầu mới", "\u9069\u7528: \u65b0\u898f\u4f9d\u983c")
      ], settingText("Chỉ áp dụng cho yêu cầu mới, không đổi dữ liệu cũ.", "\u65b0\u898f\u4f9d\u983c\u306b\u306e\u307f\u9069\u7528\u3002\u65e2\u5b58\u30c7\u30fc\u30bf\u306f\u5909\u66f4\u3057\u307e\u305b\u3093\u3002")),
      overviewSummaryCard("poc", "trend", "POC / vận hành", pocStatusLabel(poc.status), [
        `${settingText("Nhóm", "\u30b0\u30eb\u30fc\u30d7")}: ${poc.groupName || "-"}`,
        `${settingText("Trạng thái", "\u72b6\u614b")}: ${pocStatusLabel(poc.status)}`,
        poc.startDate || poc.expectedEndDate ? `${poc.startDate || "-"} - ${poc.expectedEndDate || "-"}` : settingText("Chưa đặt thời gian", "\u671f\u9593\u672a\u8a2d\u5b9a")
      ], settingText("Theo dõi POC và ghi chú vận hành.", "POC\u3068\u904b\u7528\u30e1\u30e2\u3092\u7ba1\u7406\u3002")),
      overviewSummaryCard("dataStatus", "database", settingText("Trạng thái dữ liệu", "\u30c7\u30fc\u30bf\u72b6\u614b"), "Read-only", [
        `Database: ${statusRows[0][1]}`,
        `Email: ${statusRows[1][1]}`,
        `${settingText("Tổng yêu cầu", "\u4f9d\u983c\u6570")}: ${statusRows[3][1]}`
      ], settingText("Thông tin xem nhanh, không chỉnh sửa.", "\u78ba\u8a8d\u7528\u306e\u60c5\u5831\u3067\u3059\u3002"))
    ].join("");
  }

  function beginOverviewEdit(section) {
    const settings = normalizeOverviewSettings(state.overviewSettings);
    state.overviewSettingsDrafts[section] = JSON.parse(JSON.stringify(settings[section] || {}));
    state.overviewSettingsEditing[section] = true;
    state.overviewSettingsErrors = {};
    renderSettings();
  }

  function cancelOverviewEdit(section) {
    delete state.overviewSettingsDrafts[section];
    delete state.overviewSettingsEditing[section];
    state.overviewSettingsErrors = {};
    renderSettings();
  }

  function collectOverviewSection(section) {
    const data = Object.assign({}, overviewSectionData(section));
    document.querySelectorAll(`[data-overview-field^="${CSS.escape(section)}."]`).forEach(field => {
      const key = field.getAttribute("data-overview-field").split(".").slice(1).join(".");
      if (!key) return;
      if (field.type === "checkbox") data[key] = field.checked;
      else if (field.type === "number") data[key] = Number(field.value || 0);
      else data[key] = field.value;
    });
    return data;
  }

  function validateOverviewSection(section, data) {
    const errors = {};
    if (section === "company") {
      if (!String(data.nameJa || data.nameEn || "").trim()) errors["company.nameJa"] = settingText("Tên công ty không được rỗng.", "\u4f1a\u793e\u540d\u306f\u5fc5\u9808\u3067\u3059\u3002");
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) errors["company.email"] = settingText("Email không đúng định dạng.", "\u30e1\u30fc\u30eb\u5f62\u5f0f\u304c\u6b63\u3057\u304f\u3042\u308a\u307e\u305b\u3093\u3002");
    }
    if (section === "system") {
      if (!["vi", "ja"].includes(data.defaultLanguage)) errors["system.defaultLanguage"] = settingText("Ngôn ngữ mặc định chỉ được là vi hoặc ja.", "\u65e2\u5b9a\u8a00\u8a9e\u306f vi \u307e\u305f\u306f ja \u306e\u307f\u3067\u3059\u3002");
      if (!String(data.timezone || "").trim()) data.timezone = "Asia/Tokyo";
    }
    if (section === "requestCode") {
      if (!String(data.prefix || "").trim()) errors["requestCode.prefix"] = settingText("Prefix mã yêu cầu không được rỗng.", "\u63a5\u982d\u8f9e\u306f\u5fc5\u9808\u3067\u3059\u3002");
      const digits = Number(data.digits);
      if (!Number.isFinite(digits) || digits < 4 || digits > 8) errors["requestCode.digits"] = settingText("Số chữ số phải từ 4 đến 8.", "\u6841\u6570\u306f4\u304b\u30898\u306e\u9593\u3067\u3059\u3002");
    }
    return errors;
  }

  async function saveOverviewSection(section) {
    const sectionData = collectOverviewSection(section);
    const errors = validateOverviewSection(section, sectionData);
    if (Object.keys(errors).length) {
      state.overviewSettingsErrors = errors;
      state.overviewSettingsDrafts[section] = sectionData;
      renderSettings();
      return;
    }
    const payload = normalizeOverviewSettings(state.overviewSettings);
    payload[section] = sectionData;
    if (section === "requestCode") {
      payload.requestCode.prefix = String(payload.requestCode.prefix || "YMD").trim().replace(/[^A-Za-z0-9]/g, "") || "YMD";
      payload.requestCode.digits = Number(payload.requestCode.digits || 6);
      payload.requestCode.format = `${payload.requestCode.prefix}-${"x".repeat(payload.requestCode.digits)}`;
    }
    try {
      const response = await AdminAPI.updateOverviewSettings(payload);
      state.overviewSettings = normalizeOverviewSettings(response?.settings || response);
      state.overviewSettingsDrafts = {};
      state.overviewSettingsEditing = {};
      state.overviewSettingsErrors = {};
      state.settingsDetail = null;
      toast(settingText("Đã lưu cài đặt.", "\u8a2d\u5b9a\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002"));
      try {
        const refreshed = await AdminAPI.getOverviewSettings();
        state.overviewSettings = normalizeOverviewSettings(refreshed?.settings || refreshed);
        state.overviewSettingsStatus = refreshed?.status || state.overviewSettingsStatus;
      } catch {}
      renderSettings();
    } catch (error) {
      console.error(error);
      state.overviewSettingsDrafts[section] = sectionData;
      const apiErrors = error?.errors || {};
      state.overviewSettingsErrors = apiErrors;
      toast(settingText("Không thể lưu cài đặt.", "\u8a2d\u5b9a\u3092\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3002"));
      renderSettings();
    }
  }

  function renderOverviewDetailBody(meta) {
    const section = meta.overviewSection;
    const status = state.overviewSettingsStatus || {};
    if (section === "dataStatus") {
      const rows = [
        ["Database", status.database || (state.errors.overviewSettings ? "disconnected" : "connected")],
        ["Email provider", status.emailProvider || "not configured"],
        ["ADMIN_NOTIFICATION_EMAIL", status.adminNotificationEmailConfigured ? settingText("Đã cấu hình", "\u8a2d\u5b9a\u6e08\u307f") : settingText("Chưa cấu hình", "\u672a\u8a2d\u5b9a")],
        [settingText("Tổng số yêu cầu", "\u4f9d\u983c\u6570"), status.requestCount ?? state.requests.length],
        [settingText("Tổng khách hàng", "\u9867\u5ba2\u6570"), status.customerCount ?? state.users.length],
        [settingText("Tổng staff", "\u30b9\u30bf\u30c3\u30d5\u6570"), status.staffCount ?? state.staff.length],
        [settingText("Tổng báo giá đã gửi", "\u9001\u4fe1\u6e08\u307f\u898b\u7a4d\u6570"), status.sentQuoteCount ?? state.requests.filter(isQuoteSent).length]
      ];
      return `<div class="settings-overview-status-grid overview-detail-status">${rows.map(row => `<div><span>${escapeHtml(row[0])}</span><strong>${escapeHtml(row[1])}</strong></div>`).join("")}</div>`;
    }
    const pocOptions = [
      { value: "preparing", label: settingText("Đang chuẩn bị", "\u6e96\u5099\u4e2d") },
      { value: "running", label: settingText("Đang chạy POC", "POC\u5b9f\u884c\u4e2d") },
      { value: "completed", label: settingText("Đã hoàn tất POC", "POC\u5b8c\u4e86") }
    ];
    const groups = {
      company: [
        overviewField("company", "nameJa", settingText("Tên công ty tiếng Nhật", "\u4f1a\u793e\u540d\uff08\u65e5\u672c\u8a9e\uff09")),
        overviewField("company", "nameEn", settingText("Tên công ty tiếng Anh", "\u4f1a\u793e\u540d\uff08\u82f1\u8a9e\uff09")),
        overviewField("company", "sloganJa", settingText("Slogan tiếng Nhật", "\u30b9\u30ed\u30fc\u30ac\u30f3\uff08\u65e5\u672c\u8a9e\uff09")),
        overviewField("company", "sloganEn", settingText("Slogan tiếng Anh", "\u30b9\u30ed\u30fc\u30ac\u30f3\uff08\u82f1\u8a9e\uff09")),
        overviewField("company", "email", "Email"),
        overviewField("company", "phone", settingText("Số điện thoại", "\u96fb\u8a71\u756a\u53f7")),
        overviewField("company", "address", settingText("Địa chỉ công ty", "\u4f1a\u793e\u4f4f\u6240"), { type: "textarea", rows: 2 }),
        overviewField("company", "logoUrl", "Logo URL")
      ],
      system: [
        overviewField("system", "defaultLanguage", settingText("Ngôn ngữ mặc định", "\u65e2\u5b9a\u8a00\u8a9e"), { type: "select", options: [{ value: "vi", label: "Tiếng Việt" }, { value: "ja", label: "\u65e5\u672c\u8a9e" }] }),
        overviewField("system", "timezone", settingText("Múi giờ", "\u30bf\u30a4\u30e0\u30be\u30fc\u30f3")),
        overviewField("system", "dateFormat", settingText("Định dạng ngày giờ", "\u65e5\u6642\u5f62\u5f0f")),
        overviewField("system", "pocMode", settingText("Chế độ POC", "POC\u30e2\u30fc\u30c9"), { type: "checkbox", checkboxLabel: settingText("Đang bật POC", "POC\u30e2\u30fc\u30c9\u3092\u6709\u52b9\u306b\u3059\u308b") }),
        overviewField("system", "environmentName", settingText("Tên môi trường", "\u74b0\u5883\u540d"))
      ],
      requestCode: [
        `<p class="settings-overview-note">${escapeHtml(settingText("Thay đổi này chỉ áp dụng cho yêu cầu mới.", "\u3053\u306e\u5909\u66f4\u306f\u65b0\u898f\u4f9d\u983c\u306b\u306e\u307f\u9069\u7528\u3055\u308c\u307e\u3059\u3002"))}</p>`,
        overviewField("requestCode", "prefix", settingText("Prefix mã yêu cầu", "\u63a5\u982d\u8f9e")),
        overviewField("requestCode", "format", settingText("Định dạng hiển thị", "\u8868\u793a\u5f62\u5f0f")),
        overviewField("requestCode", "digits", settingText("Số chữ số", "\u6841\u6570"), { type: "number" })
      ],
      poc: [
        overviewField("poc", "groupName", settingText("Tên nhóm thử nghiệm", "\u691c\u8a3c\u30b0\u30eb\u30fc\u30d7\u540d")),
        overviewField("poc", "status", settingText("Trạng thái POC", "POC\u72b6\u614b"), { type: "select", options: pocOptions }),
        overviewField("poc", "startDate", settingText("Ngày bắt đầu POC", "POC\u958b\u59cb\u65e5"), { type: "date" }),
        overviewField("poc", "expectedEndDate", settingText("Ngày kết thúc dự kiến", "\u7d42\u4e86\u4e88\u5b9a\u65e5"), { type: "date" }),
        overviewField("poc", "note", settingText("Ghi chú vận hành", "\u904b\u7528\u30e1\u30e2"), { type: "textarea", rows: 4 })
      ]
    };
    return `<div class="settings-overview-form settings-overview-detail-form">${(groups[section] || []).join("")}</div>`;
  }

  function renderSettingsStaffWork() {
    const departments = activeMasterItems("departments");
    const types = activeMasterItems("workTypes");
    const fallbackDepartments = state.lang === "vi"
      ? ["Gi\u00e1m \u0111\u1ed1c", "Koumu", "FS", "Kinh doanh", "Thi c\u00f4ng", "Thi\u1ebft k\u1ebf", "D\u1ef1 to\u00e1n"]
      : ["\u4ee3\u8868", "\u5de5\u52d9\u90e8", "FS\u90e8", "\u55b6\u696d\u90e8", "\u5de5\u4e8b\u90e8", "\u8a2d\u8a08\u90e8", "\u4e88\u7b97\u66f8"];
    const preview = (departments.length ? departments.map(workMasterLabel) : fallbackDepartments).slice(0, 8);
    const staffCount = state.staff.filter(staff => String(staff.status || "active") !== "deleted" && !staff.deletedAt).length;
    return [
      settingCard("users", t("department"), t("departmentsCardDesc"), t("inUse"), "is-live", `<div class="settings-metrics"><span><b>${departments.length || preview.length}</b>${escapeHtml(t("totalDepartments"))}</span><span><b>${departments.length}</b>${escapeHtml(t("currentlyUsed"))}</span></div>${settingsChips(preview)}${settingsButton(settingText("Th\u00eam b\u1ed9 ph\u1eadn", "\u90e8\u9580\u3092\u8ffd\u52a0"))}`),
      settingCard("clipboard", t("workTypes"), t("workTypesDesc"), types.length ? t("inUse") : t("linkLater"), types.length ? "is-live" : "is-planned", `<div class="settings-metrics"><span><b>${types.length}</b>${escapeHtml(t("workTypes"))}</span><span><b>${escapeHtml(t("staff"))}</b>${escapeHtml(t("workMasterLinked"))}</span></div>${settingsChips((types.length ? types.map(workMasterLabel) : ["\u96fb\u6c17\u5de5\u4e8b", "\u70b9\u691c", "\u898b\u7a4d\u4f5c\u6210"]).slice(0, 12))}${settingsButton(settingText("Th\u00eam n\u1ed9i dung c\u00f4ng vi\u1ec7c", "\u696d\u52d9\u5185\u5bb9\u3092\u8ffd\u52a0"))}`),
      settingCard("palette", settingText("K\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb"), settingText("Danh m\u1ee5c k\u1ef9 n\u0103ng d\u00f9ng cho staff v\u00e0 AI matching.", "\u30b9\u30bf\u30c3\u30d5\u3068AI\u30de\u30c3\u30c1\u30f3\u30b0\u7528\u306e\u30b9\u30ad\u30eb\u4e00\u89a7\u3067\u3059\u3002"), t("prepareLater"), "is-planned", settingsChips(["\u96fb\u6c17\u5de5\u4e8b", "\u7167\u660e", "\u5206\u96fb\u76e4", "\u73fe\u5730\u8abf\u67fb", "\u898b\u7a4d\u4f5c\u6210", "\u56f3\u9762\u78ba\u8a8d"])),
      settingCard("shield", "Staff mapping", [settingText("Li\u00ean k\u1ebft staff v\u1edbi b\u1ed9 ph\u1eadn v\u00e0 k\u1ef9 n\u0103ng", "\u30b9\u30bf\u30c3\u30d5\u3092\u90e8\u9580\u30fb\u30b9\u30ad\u30eb\u3068\u7d10\u3065\u3051"), t("staffCount") + ": " + staffCount], t("linkLater"), "is-planned", settingsButton(settingText("Qu\u1ea3n l\u00fd staff", "\u30b9\u30bf\u30c3\u30d5\u7ba1\u7406"))),
    ].join("");
  }

  function renderSettingsAiAssist() {
    const aiWorkTypes = ["\u96fb\u6c17\u5de5\u4e8b", "\u898b\u7a4d", "\u70b9\u691c", "\u56f3\u9762\u78ba\u8a8d", "\u305d\u306e\u4ed6"];
    const skills = ["\u96fb\u6c17\u5de5\u4e8b", "\u7167\u660e", "\u5206\u96fb\u76e4", "\u73fe\u5730\u8abf\u67fb", "\u898b\u7a4d\u4f5c\u6210", "\u56f3\u9762\u78ba\u8a8d"];
    const ruleRows = [
      ["\u30b9\u30ad\u30eb / K\u1ef9 n\u0103ng", "40%"],
      ["\u90e8\u9580 / B\u1ed9 ph\u1eadn", "15%"],
      ["\u30a8\u30ea\u30a2 / Khu v\u1ef1c", "15%"],
      [settingText("Kh\u1ed1i l\u01b0\u1ee3ng c\u00f4ng vi\u1ec7c", "\u7a3c\u50cd\u72b6\u6cc1"), "15%"],
      [settingText("L\u1ecbch s\u1eed x\u1eed l\u00fd", "\u5bfe\u5fdc\u5c65\u6b74"), "10%"],
      [settingText("Kh\u1ea9n c\u1ea5p", "\u7dca\u6025\u5ea6"), "5%"]
    ];
    return [
      settingCard("sparkles", settingText("T\u1ed5ng quan AI", "AI\u6982\u8981"), settingText("AI h\u1ed7 tr\u1ee3 ph\u00e2n t\u00edch y\u00eau c\u1ea7u, ph\u00e2n lo\u1ea1i n\u1ed9i b\u1ed9 v\u00e0 g\u1ee3i \u00fd ng\u01b0\u1eddi ph\u1ee5 tr\u00e1ch ban \u0111\u1ea7u. Admin v\u1eabn quy\u1ebft \u0111\u1ecbnh cu\u1ed1i c\u00f9ng.", "AI\u306f\u4f9d\u983c\u3092\u5206\u6790\u3057\u3001\u5185\u90e8\u5206\u985e\u3068\u521d\u671f\u62c5\u5f53\u8005\u3092\u63d0\u6848\u3057\u307e\u3059\u3002\u6700\u7d42\u5224\u65ad\u306f\u7ba1\u7406\u8005\u304c\u884c\u3044\u307e\u3059\u3002"), settingText("Ch\u01b0a k\u00edch ho\u1ea1t / Layout", "\u672a\u6709\u52b9 / Layout"), "is-planned"),
      settingCard("users", settingText("B\u1ed9 ph\u1eadn d\u00f9ng cho AI", "AI\u7528\u90e8\u9580"), [settingText("Li\u00ean k\u1ebft v\u1edbi b\u1ed9 ph\u1eadn t\u1eeb Nh\u00e2n vi\u00ean & c\u00f4ng vi\u1ec7c", "\u30b9\u30bf\u30c3\u30d5\u30fb\u696d\u52d9\u306e\u90e8\u9580\u3068\u9023\u643a"), t("departments") + ": " + activeMasterItems("departments").length], t("linkLater"), "is-planned", settingsButton(settingText("C\u1ea5u h\u00ecnh b\u1ed9 ph\u1eadn", "\u90e8\u9580\u8a2d\u5b9a"))),
      settingCard("clipboard", settingText("Lo\u1ea1i c\u00f4ng vi\u1ec7c", "\u4f5c\u696d\u7a2e\u5225"), "", t("prepareLater"), "is-planned", `${settingsChips(aiWorkTypes)}${settingsButton(settingText("Th\u00eam lo\u1ea1i c\u00f4ng vi\u1ec7c", "\u4f5c\u696d\u7a2e\u5225\u3092\u8ffd\u52a0"))}`),
      settingCard("palette", settingText("K\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb"), "", t("prepareLater"), "is-planned", `${settingsChips(skills)}${settingsButton(settingText("Th\u00eam k\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb\u3092\u8ffd\u52a0"))}`),
      settingCard("shield", settingText("Lu\u1eadt ph\u00e2n c\u00f4ng", "\u5272\u308a\u5f53\u3066\u30eb\u30fc\u30eb"), "", t("prepareLater"), "is-planned", `${settingsTable([settingText("Y\u1ebfu t\u1ed1", "\u8981\u7d20"), settingText("Tr\u1ecdng s\u1ed1", "\u91cd\u307f")], ruleRows.map(row => [escapeHtml(row[0]), escapeHtml(row[1])]))}<div class="settings-thresholds"><span>${escapeHtml(settingText("T\u1ef1 g\u00e1n", "\u81ea\u52d5\u5272\u5f53"))}: <b>85%</b></span><span>${escapeHtml(settingText("Ch\u1ec9 g\u1ee3i \u00fd", "\u63d0\u6848\u306e\u307f"))}: <b>60%</b></span></div>${settingsButton(settingText("Ch\u1ec9nh lu\u1eadt ph\u00e2n c\u00f4ng", "\u5272\u308a\u5f53\u3066\u30eb\u30fc\u30eb\u8abf\u6574"))}`),
      settingCard("database", settingText("Y\u00eau c\u1ea7u ch\u01b0a ph\u00e2n lo\u1ea1i", "\u672a\u5206\u985e\u4f9d\u983c"), "", t("prepareLater"), "is-planned", settingsTable(["ID", settingText("Ti\u00eau \u0111\u1ec1", "\u30bf\u30a4\u30c8\u30eb"), "AI confidence", settingText("L\u00fd do", "\u7406\u7531"), settingText("Thao t\u00e1c", "\u64cd\u4f5c")], [], settingText("Hi\u1ec7n ch\u01b0a c\u00f3 y\u00eau c\u1ea7u ch\u01b0a ph\u00e2n lo\u1ea1i.", "\u73fe\u5728\u3001\u672a\u5206\u985e\u306e\u4f9d\u983c\u306f\u3042\u308a\u307e\u305b\u3093\u3002"))),
      settingCard("database", settingText("L\u1ecbch s\u1eed AI \u0111\u1ec1 xu\u1ea5t", "AI\u63d0\u6848\u5c65\u6b74"), "", t("prepareLater"), "is-planned", settingsTable(["Request ID", settingText("AI \u0111\u1ec1 xu\u1ea5t", "AI\u63d0\u6848"), settingText("Ng\u01b0\u1eddi ph\u1ee5 tr\u00e1ch cu\u1ed1i", "\u6700\u7d42\u62c5\u5f53\u8005"), "Confidence", settingText("Admin c\u00f3 \u0111\u1ed5i kh\u00f4ng", "\u7ba1\u7406\u8005\u5909\u66f4"), settingText("Ng\u00e0y t\u1ea1o", "\u4f5c\u6210\u65e5")], [], t("noData")))
    ].join("");
  }

  function renderSettingsProcessChart() {
    const standardStatuses = ["\u672a\u5bfe\u5fdc", "\u9023\u7d61\u6e08", "\u73fe\u5730\u6e08", "\u898b\u7a4d", "\u53d7\u6ce8", "\u5b8c\u4e86", "\u5931\u6ce8"];
    const businessFlow = [
      settingText("Kh\u00e1ch g\u1eedi y\u00eau c\u1ea7u", "\u9867\u5ba2\u304c\u4f9d\u983c\u3092\u9001\u4fe1"),
      settingText("Admin ti\u1ebfp nh\u1eadn", "\u7ba1\u7406\u8005\u304c\u53d7\u4ed8"),
      settingText("Li\u00ean h\u1ec7 / kh\u1ea3o s\u00e1t", "\u9023\u7d61 / \u73fe\u5730\u78ba\u8a8d"),
      settingText("Chuy\u1ec3n sang \u898b\u7a4d n\u1ebfu c\u1ea7n b\u00e1o gi\u00e1", "\u898b\u7a4d\u304c\u5fc5\u8981\u306a\u5834\u5408\u306f\u898b\u7a4d\u3078"),
      settingText("Upload file b\u00e1o gi\u00e1", "\u898b\u7a4d\u30d5\u30a1\u30a4\u30eb\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9"),
      settingText("Kh\u00e1ch xem b\u00e1o gi\u00e1", "\u9867\u5ba2\u304c\u898b\u7a4d\u3092\u78ba\u8a8d"),
      "\u53d7\u6ce8 / \u5b8c\u4e86 / \u5931\u6ce8"
    ];
    const diagram = settingsFlow([
      settingText("Kh\u00e1ch g\u1eedi y\u00eau c\u1ea7u", "\u9867\u5ba2\u304c\u4f9d\u983c\u3092\u9001\u4fe1"),
      settingText("Admin nh\u1eadn \u1edf tab Y\u00eau c\u1ea7u", "\u7ba1\u7406\u8005\u304c\u4f9d\u983c\u30bf\u30d6\u3067\u53d7\u4ed8"),
      settingText("\u0110\u1ed5i tr\u1ea1ng th\u00e1i: \u898b\u7a4d", "\u30b9\u30c6\u30fc\u30bf\u30b9\u5909\u66f4: \u898b\u7a4d"),
      settingText("Tab B\u00e1o gi\u00e1", "\u898b\u7a4d\u30bf\u30d6"),
      settingText("Upload file b\u00e1o gi\u00e1", "\u898b\u7a4d\u30d5\u30a1\u30a4\u30eb\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9"),
      settingText("Kh\u00e1ch xem b\u00e1o gi\u00e1", "\u9867\u5ba2\u304c\u898b\u7a4d\u3092\u78ba\u8a8d")
    ]);
    return [
      settingCard("trend", settingText("T\u1ed5ng quan lu\u1ed3ng x\u1eed l\u00fd", "\u51e6\u7406\u30d5\u30ed\u30fc\u6982\u8981"), "", t("inUse"), "is-live", settingsFlow(businessFlow)),
      settingCard("clipboard", settingText("Tr\u1ea1ng th\u00e1i chu\u1ea9n", "\u6a19\u6e96\u30b9\u30c6\u30fc\u30bf\u30b9"), "", t("inUse"), "is-live", settingsChips(standardStatuses)),
      settingCard("database", settingText("Mapping tr\u1ea1ng th\u00e1i v\u1edbi m\u00e0n h\u00ecnh", "\u30b9\u30c6\u30fc\u30bf\u30b9\u3068\u753b\u9762\u306e\u5bfe\u5fdc"), [
        "\u672a\u5bfe\u5fdc / \u9023\u7d61\u6e08 / \u73fe\u5730\u6e08: " + settingText("hi\u1ec3n th\u1ecb trong tab Y\u00eau c\u1ea7u", "\u4f9d\u983c\u30bf\u30d6\u306b\u8868\u793a"),
        "\u898b\u7a4d: " + settingText("hi\u1ec3n th\u1ecb trong tab B\u00e1o gi\u00e1", "\u898b\u7a4d\u30bf\u30d6\u306b\u8868\u793a"),
        "\u53d7\u6ce8 / \u5b8c\u4e86 / \u5931\u6ce8: " + settingText("l\u01b0u l\u1ecbch s\u1eed ho\u1eb7c danh s\u00e1ch t\u01b0\u01a1ng \u1ee9ng", "\u5c65\u6b74\u307e\u305f\u306f\u5bfe\u5fdc\u30ea\u30b9\u30c8\u306b\u8868\u793a")
      ], t("inUse"), "is-live"),
      settingCard("receipt", settingText("Lu\u1ed3ng b\u00e1o gi\u00e1 m\u1edbi", "\u65b0\u898b\u7a4d\u30d5\u30ed\u30fc"), [
        settingText("Y\u00eau c\u1ea7u t\u1ef1 xu\u1ea5t hi\u1ec7n \u1edf tab B\u00e1o gi\u00e1 khi chuy\u1ec3n sang \u898b\u7a4d", "\u898b\u7a4d\u3078\u5909\u66f4\u3059\u308b\u3068\u898b\u7a4d\u30bf\u30d6\u306b\u8868\u793a"),
        settingText("Th\u00f4ng tin y\u00eau c\u1ea7u \u0111\u01b0\u1ee3c t\u1ef1 \u0111i\u1ec1n", "\u4f9d\u983c\u60c5\u5831\u3092\u81ea\u52d5\u8868\u793a"),
        settingText("Admin k\u00e9o th\u1ea3/ch\u1ecdn file v\u00e0 g\u1eedi b\u00e1o gi\u00e1", "\u7ba1\u7406\u8005\u304c\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e\u3057\u9001\u4fe1"),
        settingText("Kh\u00e1ch xem file b\u00e1o gi\u00e1 trong app", "\u9867\u5ba2\u304c\u30a2\u30d7\u30ea\u3067\u898b\u7a4d\u30d5\u30a1\u30a4\u30eb\u3092\u78ba\u8a8d")
      ], t("inUse"), "is-live"),
      settingCard("trend", settingText("Bi\u1ec3u \u0111\u1ed3 minh h\u1ecda", "\u56f3\u89e3"), "", t("inUse"), "is-live", diagram),
      settingCard("shield", settingText("Ghi ch\u00fa", "\u30e1\u30e2"), settingText("Bi\u1ec3u \u0111\u1ed3 n\u00e0y m\u00f4 t\u1ea3 lu\u1ed3ng x\u1eed l\u00fd nghi\u1ec7p v\u1ee5. C\u00e1c thao t\u00e1c th\u1ef1c t\u1ebf v\u1eabn th\u1ef1c hi\u1ec7n trong tab Y\u00eau c\u1ea7u v\u00e0 tab B\u00e1o gi\u00e1.", "\u3053\u306e\u56f3\u306f\u696d\u52d9\u30d5\u30ed\u30fc\u3092\u793a\u3057\u307e\u3059\u3002\u5b9f\u969b\u306e\u64cd\u4f5c\u306f\u4f9d\u983c\u30bf\u30d6\u3068\u898b\u7a4d\u30bf\u30d6\u3067\u884c\u3044\u307e\u3059\u3002"), t("inUse"), "is-live")
    ].join("");
  }

  function renderSettingsRequestStatus() {
    const standardStatuses = ["\u672a\u5bfe\u5fdc", "\u9023\u7d61\u6e08", "\u73fe\u5730\u6e08", "\u898b\u7a4d", "\u53d7\u6ce8", "\u5b8c\u4e86", "\u5931\u6ce8"];
    const statusClasses = ["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
    const statusPreview = `<div class="settings-status-preview">${standardStatuses.map((status, index) => `<span class="status-badge status-${escapeHtml(statusClasses[index])}">${escapeHtml(status)}</span>`).join("")}</div>`;
    return [
      settingCard("clipboard", settingText("Tr\u1ea1ng th\u00e1i chu\u1ea9n", "\u6a19\u6e96\u30b9\u30c6\u30fc\u30bf\u30b9"), "", t("inUse"), "is-live", settingsChips(standardStatuses)),
      settingCard("trend", settingText("Lu\u1ed3ng x\u1eed l\u00fd", "\u51e6\u7406\u30d5\u30ed\u30fc"), settingText("\u898b\u7a4d tr\u1ea1ng th\u00e1i s\u1ebd \u0111\u01b0a y\u00eau c\u1ea7u sang tab B\u00e1o gi\u00e1.", "\u898b\u7a4d\u30b9\u30c6\u30fc\u30bf\u30b9\u306e\u4f9d\u983c\u306f\u898b\u7a4d\u30bf\u30d6\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002"), t("inUse"), "is-live"),
      settingCard("palette", settingText("M\u00e0u tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9\u30ab\u30e9\u30fc"), "", t("linkLater"), "is-planned", statusPreview),
      settingCard("database", settingText("Quy t\u1eafc hi\u1ec3n th\u1ecb tab", "\u30bf\u30d6\u8868\u793a\u30eb\u30fc\u30eb"), [
        settingText("Y\u00eau c\u1ea7u m\u1edbi \u2192 tab Y\u00eau c\u1ea7u", "\u65b0\u898f\u4f9d\u983c \u2192 \u4f9d\u983c\u30bf\u30d6"),
        "\u898b\u7a4d \u2192 " + settingText("tab B\u00e1o gi\u00e1", "\u898b\u7a4d\u30bf\u30d6"),
        settingText("Ho\u00e0n th\u00e0nh / \u5931\u6ce8 \u2192 l\u01b0u l\u1ecbch s\u1eed", "\u5b8c\u4e86 / \u5931\u6ce8 \u2192 \u5c65\u6b74\u306b\u4fdd\u5b58")
      ], t("inUse"), "is-live")
    ].join("");
  }

  function renderSettingsCustomers() {
    const visibleUsers = state.users.filter(user => !isSoftDeleted(user));
    const pendingUsers = visibleUsers.filter(user => normalizeUserStatusValue(user.status) === "pendingApproval" || normalizeUserStatusValue(user.status) === "pending").length;
    const activeUsers = visibleUsers.filter(user => normalizeUserStatusValue(user.status) === "active").length;
    const lockedUsers = visibleUsers.filter(user => normalizeUserStatusValue(user.status) === "suspended" || normalizeUserStatusValue(user.status) === "locked").length;
    return [
      settingCard("userCheck", settingText("Duy\u1ec7t t\u00e0i kho\u1ea3n", "\u30a2\u30ab\u30a6\u30f3\u30c8\u627f\u8a8d"), [customerStatusLabel("pendingApproval") + ": " + pendingUsers], t("linkLater"), "is-planned", settingsButton(settingText("Xem danh s\u00e1ch", "\u4e00\u89a7\u3092\u8868\u793a"))),
      settingCard("shield", "PIN / " + settingText("b\u1ea3o m\u1eadt", "\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3"), settingText("Qu\u1ea3n l\u00fd PIN kh\u00e1ch h\u00e0ng, kh\u00f3a t\u00e0i kho\u1ea3n v\u00e0 kh\u00f4i ph\u1ee5c truy c\u1eadp.", "\u9867\u5ba2PIN\u3001\u30a2\u30ab\u30a6\u30f3\u30c8\u30ed\u30c3\u30af\u3001\u30a2\u30af\u30bb\u30b9\u5fa9\u65e7\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002"), t("linkLater"), "is-planned"),
      settingCard("palette", settingText("Tr\u1ea1ng th\u00e1i kh\u00e1ch h\u00e0ng", "\u9867\u5ba2\u30b9\u30c6\u30fc\u30bf\u30b9"), [customerStatusLabel("active") + ": " + activeUsers, settingText("T\u1ea1m kh\u00f3a", "\u4e00\u6642\u505c\u6b62") + ": " + lockedUsers, customerStatusLabel("pendingApproval") + ": " + pendingUsers], t("inUse"), "is-live"),
      settingCard("database", settingText("L\u1ecbch s\u1eed y\u00eau c\u1ea7u theo kh\u00e1ch h\u00e0ng", "\u9867\u5ba2\u5225\u4f9d\u983c\u5c65\u6b74"), settingText("Layout t\u1ed5ng h\u1ee3p y\u00eau c\u1ea7u, tr\u1ea1ng th\u00e1i v\u00e0 l\u1ecbch s\u1eed x\u1eed l\u00fd theo t\u1eebng kh\u00e1ch h\u00e0ng.", "\u9867\u5ba2\u3054\u3068\u306e\u4f9d\u983c\u3001\u30b9\u30c6\u30fc\u30bf\u30b9\u3001\u5bfe\u5fdc\u5c65\u6b74\u3092\u96c6\u7d04\u3059\u308b\u30ec\u30a4\u30a2\u30a6\u30c8\u3067\u3059\u3002"), t("prepareLater"), "is-planned")
    ].join("");
  }

  function renderSettingsNotifications() {
    return [
      settingCard("bell", "Email notification", [
        settingText("Tr\u1ea1ng th\u00e1i: \u0110ang d\u00f9ng", "\u30b9\u30c6\u30fc\u30bf\u30b9: \u5229\u7528\u4e2d"),
        "Provider: Resend",
        "MAIL_FROM",
        "ADMIN_NOTIFICATION_EMAIL",
        settingText("Email ch\u1ec9 d\u00f9ng \u0111\u1ec3 th\u00f4ng b\u00e1o, x\u1eed l\u00fd ch\u00ednh v\u1eabn trong app/admin.", "\u30e1\u30fc\u30eb\u306f\u901a\u77e5\u7528\u3067\u3001\u4e3b\u306a\u51e6\u7406\u306f\u30a2\u30d7\u30ea/\u7ba1\u7406\u753b\u9762\u3067\u884c\u3044\u307e\u3059\u3002")
      ], t("inUse"), "is-live"),
      settingCard("bell", "Slack", settingText("Tr\u1ea1ng th\u00e1i: Kh\u00f4ng d\u00f9ng / S\u1ebd li\u00ean k\u1ebft sau", "\u30b9\u30c6\u30fc\u30bf\u30b9: \u672a\u4f7f\u7528 / \u5f8c\u65e5\u9023\u643a"), t("linkLater"), "is-planned"),
      settingCard("bell", "LINE WORKS", settingText("Tr\u1ea1ng th\u00e1i: S\u1ebd li\u00ean k\u1ebft sau", "\u30b9\u30c6\u30fc\u30bf\u30b9: \u5f8c\u65e5\u9023\u643a"), t("linkLater"), "is-planned"),
      settingCard("database", settingText("S\u1ef1 ki\u1ec7n g\u1eedi th\u00f4ng b\u00e1o", "\u901a\u77e5\u30a4\u30d9\u30f3\u30c8"), [
        settingText("Kh\u00e1ch g\u1eedi y\u00eau c\u1ea7u m\u1edbi", "\u9867\u5ba2\u304c\u65b0\u898f\u4f9d\u983c\u3092\u9001\u4fe1"),
        settingText("Admin chuy\u1ec3n sang \u898b\u7a4d", "\u7ba1\u7406\u8005\u304c\u898b\u7a4d\u3078\u5909\u66f4"),
        settingText("Admin g\u1eedi b\u00e1o gi\u00e1", "\u7ba1\u7406\u8005\u304c\u898b\u7a4d\u3092\u9001\u4fe1")
      ], t("prepareLater"), "is-planned")
    ].join("");
  }

  function renderSettingsAppearance() {
    return [
      settingCard("palette", settingText("Ng\u00f4n ng\u1eef", "\u8a00\u8a9e"), ["Ti\u1ebfng Vi\u1ec7t", "\u65e5\u672c\u8a9e", "English"], t("linkLater"), "is-planned"),
      settingCard("database", settingText("Logo & th\u01b0\u01a1ng hi\u1ec7u", "\u30ed\u30b4\u30fb\u30d6\u30e9\u30f3\u30c9"), ["Logo", "YAMADEN", "Slogan"], t("linkLater"), "is-planned"),
      settingCard("palette", settingText("M\u00e0u giao di\u1ec7n", "\u753b\u9762\u30ab\u30e9\u30fc"), [settingText("M\u00e0u ch\u1ee7 \u0111\u1ea1o", "\u30e1\u30a4\u30f3\u30ab\u30e9\u30fc"), "Theme"], t("linkLater"), "is-planned"),
      settingCard("clipboard", settingText("\u0110\u1ecbnh d\u1ea1ng ng\u00e0y gi\u1edd", "\u65e5\u6642\u5f62\u5f0f"), ["YYYY/MM/DD HH:mm", "Asia/Tokyo"], t("inUse"), "is-live")
    ].join("");
  }

  function renderSettingsPermissions() {
    const permissionRows = [
      [settingText("Xem y\u00eau c\u1ea7u", "\u4f9d\u983c\u95b2\u89a7"), "Super Admin / Manager / Staff / Viewer"],
      [settingText("S\u1eeda y\u00eau c\u1ea7u", "\u4f9d\u983c\u7de8\u96c6"), "Super Admin / Manager / Staff"],
      [settingText("\u0110\u1ed5i tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9\u5909\u66f4"), "Super Admin / Manager / Staff"],
      [settingText("G\u1eedi b\u00e1o gi\u00e1", "\u898b\u7a4d\u9001\u4fe1"), "Super Admin / Manager"],
      [settingText("Qu\u1ea3n l\u00fd staff", "\u30b9\u30bf\u30c3\u30d5\u7ba1\u7406"), "Super Admin / Manager"],
      [settingText("Qu\u1ea3n l\u00fd c\u00e0i \u0111\u1eb7t", "\u8a2d\u5b9a\u7ba1\u7406"), "Super Admin"]
    ];
    return [
      settingCard("shield", settingText("Vai tr\u00f2 admin", "\u7ba1\u7406\u8005\u30ed\u30fc\u30eb"), ["Super Admin", "Manager", "Staff", "Viewer"], t("linkLater"), "is-planned"),
      settingCard("clipboard", settingText("Quy\u1ec1n thao t\u00e1c", "\u64cd\u4f5c\u6a29\u9650"), "", t("prepareLater"), "is-planned", settingsTable([settingText("Quy\u1ec1n", "\u6a29\u9650"), settingText("Vai tr\u00f2", "\u30ed\u30fc\u30eb")], permissionRows.map(row => [escapeHtml(row[0]), escapeHtml(row[1])]))),
      settingCard("shield", settingText("Ghi ch\u00fa b\u1ea3o m\u1eadt", "\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3\u30e1\u30e2"), settingText("Layout ph\u00e2n quy\u1ec1n d\u1ef1 ki\u1ebfn, ch\u01b0a k\u00edch ho\u1ea1t CRUD th\u1eadt.", "\u6a29\u9650\u8a2d\u8a08\u7528\u30ec\u30a4\u30a2\u30a6\u30c8\u3067\u3001\u307e\u3060CRUD\u306f\u6709\u52b9\u5316\u3057\u3066\u3044\u307e\u305b\u3093\u3002"), t("prepareLater"), "is-planned")
    ].join("");
  }

  function renderSettingsSystemData() {
    const logRows = [
      [escapeHtml(settingText("Ch\u01b0a c\u00f3 d\u1eef li\u1ec7u", "\u30c7\u30fc\u30bf\u306a\u3057")), "-", "-", "-"]
    ];
    return [
      settingCard("database", settingText("Xu\u1ea5t d\u1eef li\u1ec7u", "\u30c7\u30fc\u30bf\u30a8\u30af\u30b9\u30dd\u30fc\u30c8"), [t("csvExport"), settingText("Xu\u1ea5t y\u00eau c\u1ea7u", "\u4f9d\u983c\u30a8\u30af\u30b9\u30dd\u30fc\u30c8"), settingText("Xu\u1ea5t kh\u00e1ch h\u00e0ng", "\u9867\u5ba2\u30a8\u30af\u30b9\u30dd\u30fc\u30c8")], t("linkLater"), "is-planned", settingsButton(t("csvExport"))),
      settingCard("clipboard", settingText("Nh\u1eadt k\u00fd thao t\u00e1c admin", "\u7ba1\u7406\u8005\u64cd\u4f5c\u30ed\u30b0"), "", t("prepareLater"), "is-planned", settingsTable([settingText("Ng\u00e0y", "\u65e5\u4ed8"), "Admin", settingText("H\u00e0nh \u0111\u1ed9ng", "\u64cd\u4f5c"), settingText("\u0110\u1ed1i t\u01b0\u1ee3ng", "\u5bfe\u8c61")], logRows)),
      settingCard("database", settingText("Sao l\u01b0u", "\u30d0\u30c3\u30af\u30a2\u30c3\u30d7"), settingText("Card m\u00f4 t\u1ea3 lu\u1ed3ng backup d\u1eef li\u1ec7u h\u1ec7 th\u1ed1ng, chu\u1ea9n b\u1ecb cho giai \u0111o\u1ea1n sau.", "\u5f8c\u7d9a\u30d5\u30a7\u30fc\u30ba\u7528\u306e\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u30ec\u30a4\u30a2\u30a6\u30c8\u3067\u3059\u3002"), t("prepareLater"), "is-planned"),
      settingCard("database", settingText("Import d\u1eef li\u1ec7u", "\u30c7\u30fc\u30bf\u30a4\u30f3\u30dd\u30fc\u30c8"), settingText("Layout chu\u1ea9n b\u1ecb cho import CSV ho\u1eb7c \u0111\u1ed3ng b\u1ed9 d\u1eef li\u1ec7u sau n\u00e0y.", "\u5c06\u6765\u306eCSV\u30a4\u30f3\u30dd\u30fc\u30c8\u3084\u30c7\u30fc\u30bf\u540c\u671f\u7528\u30ec\u30a4\u30a2\u30a6\u30c8\u3067\u3059\u3002"), t("prepareLater"), "is-planned")
    ].join("");
  }

  function settingsDetailMeta() {
    const raw = String(state.settingsDetail?.key || "");
    const [group, detail = raw] = raw.split(":");
    if (group === "overview") {
      const map = {
        company: {
          kind: "overview",
          overviewSection: "company",
          title: settingText("Thông tin công ty", "\u4f1a\u793e\u60c5\u5831"),
          desc: settingText("Chỉnh sửa tên công ty, slogan, thông tin liên hệ và logo.", "\u4f1a\u793e\u540d\u3001\u30b9\u30ed\u30fc\u30ac\u30f3\u3001\u9023\u7d61\u5148\u3001\u30ed\u30b4\u3092\u7de8\u96c6\u3057\u307e\u3059\u3002")
        },
        system: {
          kind: "overview",
          overviewSection: "system",
          title: settingText("Cấu hình hệ thống", "\u30b7\u30b9\u30c6\u30e0\u8a2d\u5b9a"),
          desc: settingText("Thiết lập ngôn ngữ mặc định, múi giờ, định dạng ngày giờ và chế độ vận hành.", "\u65e2\u5b9a\u8a00\u8a9e\u3001\u30bf\u30a4\u30e0\u30be\u30fc\u30f3\u3001\u65e5\u6642\u5f62\u5f0f\u3001\u904b\u7528\u30e2\u30fc\u30c9\u3092\u8a2d\u5b9a\u3057\u307e\u3059\u3002")
        },
        requestCode: {
          kind: "overview",
          overviewSection: "requestCode",
          title: settingText("Mã yêu cầu", "\u4f9d\u983cID"),
          desc: settingText("Cấu hình mã cho yêu cầu mới. Yêu cầu cũ không thay đổi.", "\u65b0\u898f\u4f9d\u983c\u306eID\u8a2d\u5b9a\u3067\u3059\u3002\u65e2\u5b58\u4f9d\u983c\u306f\u5909\u66f4\u3057\u307e\u305b\u3093\u3002")
        },
        poc: {
          kind: "overview",
          overviewSection: "poc",
          title: "POC / vận hành",
          desc: settingText("Theo dõi trạng thái POC, thời gian và ghi chú vận hành.", "POC\u306e\u72b6\u614b\u3001\u671f\u9593\u3001\u904b\u7528\u30e1\u30e2\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002")
        },
        dataStatus: {
          kind: "overview",
          overviewSection: "dataStatus",
          readOnly: true,
          title: settingText("Trạng thái dữ liệu", "\u30c7\u30fc\u30bf\u72b6\u614b"),
          desc: settingText("Thông tin hệ thống chỉ để xem nhanh.", "\u30b7\u30b9\u30c6\u30e0\u72b6\u614b\u306e\u78ba\u8a8d\u7528\u60c5\u5831\u3067\u3059\u3002")
        }
      };
      return map[detail] || map.company;
    }
    const title = detail || raw;
    const lower = title.toLowerCase();
    const isDept = title.includes(t("department")) || lower.includes("department") || title.includes("\u90e8\u9580") || title.includes("B\u1ed9 ph\u1eadn");
    const isWork = title.includes(t("workTypes")) || title.includes("N\u1ed9i dung") || title.includes("\u696d\u52d9") || title.includes("c\u00f4ng vi\u1ec7c");
    const isSkill = title.includes("K\u1ef9 n\u0103ng") || title.includes("\u30b9\u30ad\u30eb");
    const isStaffMap = lower.includes("staff mapping");
    const isRule = title.includes("Lu\u1eadt") || title.includes("\u30eb\u30fc\u30eb");
    if (isDept) return {
      kind: "departments",
      title: settingText("Qu\u1ea3n l\u00fd b\u1ed9 ph\u1eadn", "\u90e8\u9580\u7ba1\u7406"),
      desc: settingText("Th\u00eam, s\u1eeda v\u00e0 b\u1eadt/t\u1eaft b\u1ed9 ph\u1eadn d\u00f9ng cho staff v\u00e0 AI ph\u00e2n c\u00f4ng.", "\u30b9\u30bf\u30c3\u30d5\u3068AI\u5272\u308a\u5f53\u3066\u306b\u4f7f\u3046\u90e8\u9580\u3092\u8ffd\u52a0\u30fb\u7de8\u96c6\u30fb\u6709\u52b9\u5316\u3057\u307e\u3059\u3002"),
      add: settingText("+ Th\u00eam b\u1ed9 ph\u1eadn", "+ \u90e8\u9580\u3092\u8ffd\u52a0"),
      headers: [settingText("T\u00ean b\u1ed9 ph\u1eadn", "\u90e8\u9580\u540d"), settingText("M\u00f4 t\u1ea3", "\u8aac\u660e"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9"), settingText("S\u1ed1 staff li\u00ean k\u1ebft", "\u9023\u643a\u30b9\u30bf\u30c3\u30d5\u6570"), settingText("Thao t\u00e1c", "\u64cd\u4f5c")]
    };
    if (isWork) return {
      kind: "workTypes",
      title: settingText("Qu\u1ea3n l\u00fd n\u1ed9i dung c\u00f4ng vi\u1ec7c", "\u696d\u52d9\u5185\u5bb9\u7ba1\u7406"),
      desc: settingText("Qu\u1ea3n l\u00fd danh s\u00e1ch c\u00f4ng vi\u1ec7c d\u00f9ng cho app kh\u00e1ch, staff v\u00e0 AI.", "\u9867\u5ba2\u30a2\u30d7\u30ea\u3001\u30b9\u30bf\u30c3\u30d5\u3001AI\u3067\u4f7f\u3046\u696d\u52d9\u4e00\u89a7\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002"),
      add: settingText("+ Th\u00eam n\u1ed9i dung c\u00f4ng vi\u1ec7c", "+ \u696d\u52d9\u5185\u5bb9\u3092\u8ffd\u52a0"),
      headers: [settingText("T\u00ean c\u00f4ng vi\u1ec7c", "\u696d\u52d9\u540d"), settingText("T\u1eeb kh\u00f3a", "\u30ad\u30fc\u30ef\u30fc\u30c9"), settingText("B\u1ed9 ph\u1eadn", "\u90e8\u9580"), settingText("K\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9"), settingText("Thao t\u00e1c", "\u64cd\u4f5c")]
    };
    if (isSkill) return {
      kind: "skills",
      title: settingText("Qu\u1ea3n l\u00fd k\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb\u7ba1\u7406"),
      desc: settingText("Qu\u1ea3n l\u00fd k\u1ef9 n\u0103ng d\u00f9ng \u0111\u1ec3 g\u00e1n cho staff v\u00e0 AI matching.", "\u30b9\u30bf\u30c3\u30d5\u3068AI\u30de\u30c3\u30c1\u30f3\u30b0\u306b\u4f7f\u3046\u30b9\u30ad\u30eb\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002"),
      add: settingText("+ Th\u00eam k\u1ef9 n\u0103ng", "+ \u30b9\u30ad\u30eb\u3092\u8ffd\u52a0"),
      headers: [settingText("T\u00ean k\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb\u540d"), settingText("M\u00f4 t\u1ea3", "\u8aac\u660e"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9"), settingText("Thao t\u00e1c", "\u64cd\u4f5c")]
    };
    if (isStaffMap) return {
      kind: "staffMap",
      title: "Staff mapping",
      desc: settingText("Li\u00ean k\u1ebft staff v\u1edbi b\u1ed9 ph\u1eadn, k\u1ef9 n\u0103ng v\u00e0 n\u1ed9i dung c\u00f4ng vi\u1ec7c \u0111\u1ec3 AI ph\u00e2n c\u00f4ng ch\u00ednh x\u00e1c h\u01a1n.", "\u30b9\u30bf\u30c3\u30d5\u3092\u90e8\u9580\u30fb\u30b9\u30ad\u30eb\u30fb\u696d\u52d9\u5185\u5bb9\u3068\u7d10\u3065\u3051\u3001AI\u5272\u308a\u5f53\u3066\u7cbe\u5ea6\u3092\u9ad8\u3081\u307e\u3059\u3002"),
      add: settingText("+ Th\u00eam mapping", "+ mapping\u8ffd\u52a0"),
      headers: ["Staff", settingText("B\u1ed9 ph\u1eadn", "\u90e8\u9580"), settingText("K\u1ef9 n\u0103ng", "\u30b9\u30ad\u30eb"), settingText("N\u1ed9i dung c\u00f4ng vi\u1ec7c", "\u696d\u52d9\u5185\u5bb9"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9")]
    };
    if (isRule) return {
      kind: "rules",
      title: settingText("Lu\u1eadt ph\u00e2n c\u00f4ng", "\u5272\u308a\u5f53\u3066\u30eb\u30fc\u30eb"),
      desc: settingText("Thi\u1ebft l\u1eadp tr\u1ecdng s\u1ed1 v\u00e0 ng\u01b0\u1ee1ng g\u1ee3i \u00fd/t\u1ef1 g\u00e1n cho AI.", "AI\u306e\u63d0\u6848/\u81ea\u52d5\u5272\u5f53\u306e\u91cd\u307f\u3068\u95be\u5024\u3092\u8a2d\u5b9a\u3057\u307e\u3059\u3002"),
      add: settingText("Ch\u1ec9nh lu\u1eadt", "\u30eb\u30fc\u30eb\u7de8\u96c6"),
      headers: [settingText("Y\u1ebfu t\u1ed1", "\u8981\u7d20"), settingText("Tr\u1ecdng s\u1ed1", "\u91cd\u307f"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9")]
    };
    return {
      kind: "generic",
      title: title || t("settings"),
      desc: settingText("M\u00e0n chi ti\u1ebft layout cho m\u1ee5c c\u00e0i \u0111\u1eb7t n\u00e0y. Ch\u1ee9c n\u0103ng th\u1eadt s\u1ebd ph\u00e1t tri\u1ec3n sau.", "\u3053\u306e\u8a2d\u5b9a\u9805\u76ee\u306e\u8a73\u7d30\u30ec\u30a4\u30a2\u30a6\u30c8\u3067\u3059\u3002\u5b9f\u6a5f\u80fd\u306f\u5f8c\u65e5\u5b9f\u88c5\u3057\u307e\u3059\u3002"),
      add: settingText("+ Th\u00eam", "+ \u8ffd\u52a0"),
      headers: [settingText("M\u1ee5c", "\u9805\u76ee"), settingText("M\u00f4 t\u1ea3", "\u8aac\u660e"), settingText("Tr\u1ea1ng th\u00e1i", "\u30b9\u30c6\u30fc\u30bf\u30b9"), settingText("Thao t\u00e1c", "\u64cd\u4f5c")]
    };
  }

  function renderSettingsDetailModal() {
    const meta = settingsDetailMeta();
    const isOverview = meta.kind === "overview";
    if (isOverview) {
      return `<div class="settings-detail-overlay" data-settings-detail-overlay>
        <section class="settings-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(meta.title)}">
          <header class="settings-detail-head">
            <div><h2>${escapeHtml(meta.title)}</h2><p>${escapeHtml(meta.desc)}</p></div>
            <button class="settings-detail-close" type="button" data-settings-detail-close aria-label="Close">&times;</button>
          </header>
          <div class="settings-detail-body">
            ${renderOverviewDetailBody(meta)}
          </div>
          <footer class="settings-detail-footer">
            <button class="btn btn-soft" type="button" data-settings-detail-cancel>${escapeHtml(meta.readOnly ? settingText("Đóng", "\u9589\u3058\u308b") : settingText("Hủy", "\u30ad\u30e3\u30f3\u30bb\u30eb"))}</button>
            ${meta.readOnly ? "" : `<button class="primary-button" type="button" data-overview-save="${escapeHtml(meta.overviewSection)}">${escapeHtml(settingText("Lưu", "\u4fdd\u5b58"))}</button>`}
          </footer>
        </section>
      </div>`;
    }
    return `<div class="settings-detail-overlay" data-settings-detail-overlay>
      <section class="settings-detail-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(meta.title)}">
        <header class="settings-detail-head">
          <div><h2>${escapeHtml(meta.title)}</h2><p>${escapeHtml(meta.desc)}</p></div>
          <button class="settings-detail-close" type="button" data-settings-detail-close aria-label="Close">×</button>
        </header>
        <div class="settings-detail-body">
          ${renderSettingsDetailBody(meta)}
        </div>
        <footer class="settings-detail-footer">
          <button class="btn btn-soft" type="button" data-settings-detail-cancel>${escapeHtml(settingText("H\u1ee7y", "\u30ad\u30e3\u30f3\u30bb\u30eb"))}</button>
          <button class="primary-button" type="button" data-settings-detail-save disabled>${escapeHtml(settingText("L\u01b0u", "\u4fdd\u5b58"))}</button>
        </footer>
      </section>
    </div>`;
  }

  function renderSettingsDetailBody(meta) {
    const rows = settingsDetailRows(meta);
    return `<div class="settings-detail-toolbar">
      <button class="primary-button" type="button" data-settings-detail-dirty>${escapeHtml(meta.add)}</button>
      <span>${escapeHtml(settingText("Layout only - ch\u01b0a ghi database.", "\u30ec\u30a4\u30a2\u30a6\u30c8\u306e\u307f - DB\u306b\u306f\u4fdd\u5b58\u3057\u307e\u305b\u3093\u3002"))}</span>
    </div>
    ${settingsTable(meta.headers, rows)}
    <div class="settings-detail-form">
      <label><span>${escapeHtml(settingText("T\u00ean *", "\u540d\u524d *"))}</span><input data-settings-detail-dirty type="text" placeholder="${escapeHtml(settingText("Nh\u1eadp t\u00ean", "\u540d\u524d\u3092\u5165\u529b"))}" /></label>
      <label><span>${escapeHtml(settingText("M\u00f4 t\u1ea3", "\u8aac\u660e"))}</span><textarea data-settings-detail-dirty rows="3"></textarea></label>
      <label class="settings-detail-toggle"><input data-settings-detail-dirty type="checkbox" checked /> ${escapeHtml("active")}</label>
    </div>`;
  }

  function closeSettingsDetail(force = false) {
    if (state.settingsDetail?.dirty && !force) {
      const ok = window.confirm(settingText("B\u1ea1n c\u00f3 thay \u0111\u1ed5i ch\u01b0a l\u01b0u. B\u1ea1n c\u00f3 mu\u1ed1n tho\u00e1t kh\u00f4ng?", "\u672a\u4fdd\u5b58\u306e\u5909\u66f4\u304c\u3042\u308a\u307e\u3059\u3002\u9589\u3058\u307e\u3059\u304b\uff1f"));
      if (!ok) return false;
    }
    if (state.settingsDetail?.overviewSection) {
      delete state.overviewSettingsDrafts[state.settingsDetail.overviewSection];
      state.overviewSettingsErrors = {};
    }
    state.settingsDetail = null;
    renderSettings();
    return true;
  }

  function markSettingsDetailDirty() {
    if (!state.settingsDetail) return;
    state.settingsDetail.dirty = true;
    const save = document.querySelector("[data-settings-detail-save]");
    if (save) save.disabled = false;
  }

  function settingsDetailRows(meta) {
    const action = `<button class="mini-button" type="button" data-settings-detail-dirty>${escapeHtml(settingText("S\u1eeda", "\u7de8\u96c6"))}</button> <button class="mini-button" type="button" data-settings-detail-dirty>active/inactive</button>`;
    if (meta.kind === "rules") return [
      [escapeHtml(settingText("K\u1ef9 n\u0103ng ph\u00f9 h\u1ee3p", "\u30b9\u30ad\u30eb\u9069\u5408")), "40%", "active"],
      [escapeHtml(settingText("B\u1ed9 ph\u1eadn", "\u90e8\u9580")), "15%", "active"],
      [escapeHtml(settingText("Khu v\u1ef1c", "\u30a8\u30ea\u30a2")), "15%", "active"],
      [escapeHtml(settingText("Ng\u01b0\u1ee1ng t\u1ef1 g\u00e1n", "\u81ea\u52d5\u5272\u5f53\u95be\u5024")), "85%", "active"],
      [escapeHtml(settingText("Ng\u01b0\u1ee1ng ch\u1ec9 g\u1ee3i \u00fd", "\u63d0\u6848\u306e\u307f\u95be\u5024")), "60%", "active"]
    ];
    if (meta.kind === "staffMap") return state.staff.slice(0, 5).map(staff => [escapeHtml(staff.name || staff.fullName || "-"), escapeHtml(staff.department || "-"), "-", "-", "active"]);
    if (meta.kind === "workTypes") return (activeMasterItems("workTypes").slice(0, 8).map(item => [escapeHtml(workMasterLabel(item)), "-", escapeHtml(item.departmentCode || "-"), "-", item.active === false ? "inactive" : "active", action]));
    if (meta.kind === "departments") return (activeMasterItems("departments").slice(0, 8).map(item => [escapeHtml(workMasterLabel(item)), escapeHtml(item.descriptionVi || item.descriptionJa || "-"), item.active === false ? "inactive" : "active", "0", action]));
    if (meta.kind === "skills") return [["\u96fb\u6c17\u5de5\u4e8b", "-", "active", action], ["\u7167\u660e", "-", "active", action], ["\u898b\u7a4d\u4f5c\u6210", "-", "active", action]];
    return [["Sample", escapeHtml(meta.desc), "layout", action]];
  }

  async function reloadWorkMaster() {
    state.workMaster = normalizeWorkMaster(await AdminAPI.getWorkMaster());
  }

  function masterPayloadFromForm(form) {
    const raw = new FormData(form);
    return {
      departmentCode: String(raw.get("departmentCode") || ""),
      workGroupCode: String(raw.get("workGroupCode") || ""),
      code: String(raw.get("code") || "").trim(),
      nameVi: String(raw.get("nameVi") || "").trim(),
      nameJa: String(raw.get("nameJa") || "").trim(),
      descriptionVi: String(raw.get("descriptionVi") || "").trim(),
      descriptionJa: String(raw.get("descriptionJa") || "").trim(),
      sortOrder: Number(raw.get("sortOrder") || 0),
      active: raw.get("active") === "on"
    };
  }

  async function saveWorkMasterForm(form) {
    const type = form.dataset.workMasterForm;
    const id = form.dataset.masterId;
    const payload = masterPayloadFromForm(form);
    if (type === "departments") {
      if (id) await AdminAPI.updateDepartment(id, payload);
      else await AdminAPI.createDepartment(payload);
    }
    if (type === "workGroups") {
      if (id) await AdminAPI.updateWorkGroup(id, payload);
      else await AdminAPI.createWorkGroup(payload);
    }
    if (type === "workTypes") {
      if (id) await AdminAPI.updateWorkType(id, payload);
      else await AdminAPI.createWorkType(payload);
    }
    state.filters.workMasterEditId = "";
    await reloadWorkMaster();
    renderWorkMaster();
    toast(type === "workTypes" && !id ? t("workTypeAdded") : t("workMasterUpdated"));
  }

  async function setWorkMasterStatus(type, id, active) {
    if (type === "departments") await AdminAPI.setDepartmentStatus(id, active);
    if (type === "workGroups") await AdminAPI.setWorkGroupStatus(id, active);
    if (type === "workTypes") await AdminAPI.setWorkTypeStatus(id, active);
    await reloadWorkMaster();
    renderWorkMaster();
    toast(t("workMasterUpdated"));
  }

  async function deleteWorkMasterItem(type, id) {
    if (type === "departments") await AdminAPI.deleteDepartment(id);
    if (type === "workGroups") await AdminAPI.deleteWorkGroup(id);
    if (type === "workTypes") await AdminAPI.deleteWorkType(id);
    await reloadWorkMaster();
    renderWorkMaster();
    toast(type === "departments" ? t("relatedDataWarning") : t("workMasterUpdated"));
  }

  function setRequestDetailDirty(dirty) {
    const overlay = $("requestDetailOverlay");
    if (!overlay) return;
    overlay.dataset.dirty = dirty ? "true" : "false";
    const saveButton = overlay.querySelector("[data-save-request]");
    const note = overlay.querySelector("[data-unsaved-note]");
    if (saveButton) saveButton.disabled = !dirty;
    if (note) note.hidden = !dirty;
  }

  async function closeRequestDetail(force = false) {
    const overlay = $("requestDetailOverlay");
    if (!overlay) return;
    if (!force && overlay.dataset.dirty === "true") {
      const discard = await confirmAction({
        title: t("unsavedChanges"),
        message: t("unsavedChangesText"),
        cancelLabel: t("stay"),
        confirmLabel: t("closeWithoutSave"),
        variant: "warning"
      });
      if (!discard) return;
    }
    overlay.remove();
  }

  function openMediaPreview(url, type) {
    const existing = $("mediaPreviewOverlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.id = "mediaPreviewOverlay";
    overlay.className = "media-preview-overlay";
    overlay.innerHTML = `<div class="media-preview-panel"><button class="close-button" type="button" data-close-media-preview>&times;</button>${type === "video" ? `<video src="${escapeHtml(url)}" controls autoplay playsinline></video>` : `<img src="${escapeHtml(url)}" alt="">`}</div>`;
    document.body.appendChild(overlay);
  }

  async function saveRequestFromDrawer(id) {
    const root = $("requestDetailOverlay") || $("drawer");
    const status = root.querySelector("[data-request-edit-field='status']")?.value || root.querySelector("[data-request-status='" + CSS.escape(id) + "']")?.value;
    const reply = root.querySelector("[data-request-edit-field='adminReply']")?.value || $("requestReplyInput")?.value || "";
    const staffId = root.querySelector("[data-request-edit-field='assigneeId']")?.value || $("requestStaffSelect")?.value || "";
    const urgency = root.querySelector("[data-request-edit-field='urgency']")?.value || "";
    const dueAt = root.querySelector("[data-request-edit-field='dueAt']")?.value || "";
    const amount = root.querySelector("[data-request-edit-field='amount']")?.value || "";
    const staff = state.staff.find(item => getRowId(item) === staffId);
    const currentRequest = state.requests.find(item => String(getRowId(item) || getRequestDisplayId(item)) === String(id));
    const previousStaffId = String(currentRequest?.assigneeId || currentRequest?.assignedStaffId || "");
    const payload = {
      status,
      adminReply: reply,
      assigneeId: staff ? getRowId(staff) : "",
      assigneeName: staff ? staff.name || "" : "",
      urgency: urgency === "none" ? "" : urgency,
      dueAt,
      amount
    };
    if (staff && getRowId(staff) !== previousStaffId) {
      payload.assignmentSource = "manual";
    }
    const response = await AdminAPI.updateRequest(id, payload);
    const updated = response?.data || response;
    const index = state.requests.findIndex(item => String(getRowId(item) || getRequestDisplayId(item)) === String(id));
    if (index >= 0 && updated) state.requests[index] = Object.assign({}, state.requests[index], updated);
    if ($("requestDetailOverlay")) {
      setRequestDetailDirty(false);
      if (updated) renderRequestDetail(state.requests[index] || updated);
      if ($("requestResults")) renderRequestResults();
      toast(t("savedChanges"));
      return;
    }
    closeDrawer();
    renderCurrentView();
    toast(t("savedChanges"));
  }

  async function createQuoteFromRequest(requestId) {
    if (!requestId) {
      toast(state.lang === "vi" ? "Kh\u00f4ng t\u00ecm th\u1ea5y ID y\u00eau c\u1ea7u." : "\u4f9d\u983cID\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
      return;
    }
    try {
      let sourceRequest = state.requests.find(item => [getRowId(item), getRequestDisplayId(item)].some(value => value && String(value) === String(requestId)));
      if (!sourceRequest) sourceRequest = await AdminAPI.getRequest(requestId);
      if (normalizeRequestStatus(sourceRequest.status) !== "quoted") {
        toast(state.lang === "vi" ? "H\u00e3y chuy\u1ec3n y\u00eau c\u1ea7u sang tr\u1ea1ng th\u00e1i B\u00e1o gi\u00e1 tr\u01b0\u1edbc." : "\u5148\u306b\u4f9d\u983c\u3092\u898b\u7a4d\u30b9\u30c6\u30fc\u30bf\u30b9\u306b\u5909\u66f4\u3057\u3066\u304f\u3060\u3055\u3044\u3002");
        return;
      }
      await closeRequestDetail(true);
      state.quoteWizardStep = 1;
      state.quoteSelectedFile = null;
      state.quoteSelectedFiles = [];
      renderQuoteDetail(sourceRequest);
    } catch (error) {
      console.error(error);
      toast(error.message || t("failed"));
    }
  }

  function quoteSelectedFiles() {
    if (Array.isArray(state.quoteSelectedFiles)) return state.quoteSelectedFiles.filter(Boolean);
    return state.quoteSelectedFile ? [state.quoteSelectedFile] : [];
  }

  function quoteFileSizeLabel(size) {
    const bytes = Number(size || 0);
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1) + "MB";
    if (bytes >= 1024) return Math.max(1, Math.round(bytes / 1024)) + "KB";
    return bytes + "B";
  }

  function quoteFileExtension(file) {
    const name = String(file?.name || file?.originalName || file?.fileName || "");
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot).toLowerCase() : "";
  }

  function quoteFileIcon(file) {
    const ext = quoteFileExtension(file);
    if (ext === ".pdf") return "PDF";
    if (ext === ".xlsx" || ext === ".xls") return "XLS";
    if (ext === ".docx" || ext === ".doc") return "DOC";
    return "FILE";
  }

  function validateQuoteFile(file) {
    if (!file) return quoteText("selectFileError");
    const ext = quoteFileExtension(file);
    if (!QUOTE_ALLOWED_EXTENSIONS.includes(ext)) {
      return `${quoteText("fileLabel")} ${file.name || ""} ${quoteText("unsupportedFile")}`;
    }
    if (Number(file.size || 0) > QUOTE_MAX_FILE_SIZE) {
      return `${quoteText("fileLabel")} ${file.name || ""} ${quoteText("oversizeFile")}`;
    }
    return "";
  }

  function quoteFileKey(file) {
    return [file?.name || "", file?.size || 0, file?.lastModified || ""].join(":");
  }

  function renderSelectedQuoteFiles() {
    const files = quoteSelectedFiles();
    if (!files.length) {
      return `<div class="quote-selected-empty">${escapeHtml(quoteText("noSelectedFile"))}</div>`;
    }
    return `<div class="quote-selected-file-list">${files.map((file, index) => `
      <div class="quote-selected-file-row" data-selected-quote-file-row="${index}">
        <span class="quote-file-type">${escapeHtml(quoteFileIcon(file))}</span>
        <span class="quote-file-name">${escapeHtml(file.name || "")}</span>
        <span class="quote-file-size">${escapeHtml(quoteFileSizeLabel(file.size))}</span>
        <button class="quote-file-remove" type="button" data-quote-remove-file="${index}" aria-label="Remove file">&times;</button>
      </div>
    `).join("")}</div>`;
  }

  function renderExistingQuoteFiles(quote) {
    const files = getQuoteFiles(quote);
    if (!files.length && (quote.fileUrl || quote.pdfUrl)) files.push(quote);
    if (!files.length) return "";
    return `<div class="quote-existing-file-list">
      <strong>${escapeHtml(quoteText("sentFilesTitle"))}</strong>
      ${files.map(file => {
        const name = file.originalName || file.fileName || "Quote file";
        const url = file.fileUrl || file.pdfUrl || "#";
        return `<a class="quote-existing-file-row" href="${escapeHtml(url)}" target="_blank" rel="noopener">
          <span class="quote-file-type">${escapeHtml(quoteFileIcon(file))}</span>
          <span class="quote-file-name">${escapeHtml(name)}</span>
          <span class="quote-file-size">${escapeHtml(file.fileSize ? quoteFileSizeLabel(file.fileSize) : "")}</span>
        </a>`;
      }).join("")}
    </div>`;
  }

  function updateSelectedQuoteFilesUI() {
    const holder = document.querySelector("[data-quote-selected-files]");
    if (holder) holder.innerHTML = renderSelectedQuoteFiles();
  }

  function addSelectedQuoteFiles(files) {
    const incoming = Array.from(files || []).filter(Boolean);
    if (!incoming.length) return;
    const selected = quoteSelectedFiles();
    const keys = new Set(selected.map(quoteFileKey));
    const incomingUnique = incoming.filter(file => {
      const key = quoteFileKey(file);
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    });
    if (!incomingUnique.length) return;
    if (selected.length + incomingUnique.length > QUOTE_MAX_FILES) {
      toast(quoteText("maxFilesError"));
      return;
    }
    for (const file of incomingUnique) {
      const error = validateQuoteFile(file);
      if (error) {
        toast(error);
        continue;
      }
      selected.push(file);
    }
    state.quoteSelectedFiles = selected;
    state.quoteSelectedFile = selected[0] || null;
    updateSelectedQuoteFilesUI();
  }

  function removeSelectedQuoteFile(index) {
    const selected = quoteSelectedFiles();
    selected.splice(Number(index), 1);
    state.quoteSelectedFiles = selected;
    state.quoteSelectedFile = selected[0] || null;
    updateSelectedQuoteFilesUI();
  }

  function setSelectedQuoteFile(file) {
    state.quoteSelectedFiles = [];
    state.quoteSelectedFile = null;
    if (file) addSelectedQuoteFiles([file]);
    else updateSelectedQuoteFilesUI();
  }

  async function openRequestQuote(requestId, step = 1) {
    let request = toList(state.quoteRequests).find(item => String(getRowId(item)) === String(requestId) || String(getRequestDisplayId(item)) === String(requestId))
      || toList(state.quoteRequestAllRows).find(item => String(getRowId(item)) === String(requestId) || String(getRequestDisplayId(item)) === String(requestId))
      || state.requests.find(item => String(getRowId(item)) === String(requestId) || String(getRequestDisplayId(item)) === String(requestId));
    if (state.currentView === "quotes" && (!request || (!request.quoteSent && !getQuoteFiles(request).length))) {
      try {
        const payload = await AdminAPI.getQuoteRequests({});
        const rows = normalizeList(payload.requests || payload.data);
        state.quoteRequestAllRows = rows;
        request = rows.find(item => String(getRowId(item)) === String(requestId) || String(getRequestDisplayId(item)) === String(requestId)) || request;
      } catch (error) {
        console.warn("Quote request refresh failed:", error);
      }
    }
    if (!request) request = await AdminAPI.getRequest(requestId);
    state.quoteWizardStep = step;
    state.quoteSelectedFile = null;
    state.quoteSelectedFiles = [];
    renderQuoteDetail(request);
  }

  async function sendQuoteFileFromModal() {
    const quote = window.currentQuoteDetail;
    const files = quoteSelectedFiles();
    if (!quote?.requestMongoId) {
      toast(state.lang === "vi" ? "Kh\u00f4ng t\u00ecm th\u1ea5y y\u00eau c\u1ea7u." : "\u4f9d\u983c\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093\u3002");
      return;
    }
    if (!files.length) {
      toast(quoteText("selectFileError"));
      return;
    }
    if (files.length > QUOTE_MAX_FILES) {
      toast(quoteText("maxFilesError"));
      return;
    }
    const invalid = files.map(validateQuoteFile).find(Boolean);
    if (invalid) {
      toast(invalid);
      return;
    }
    try {
      const response = await AdminAPI.uploadRequestQuoteFile(quote.requestMongoId, files);
      state.quoteSelectedFile = null;
      state.quoteSelectedFiles = [];
      const responseQuoteFiles = normalizeList(response.quotes || response.data).filter(file => file.fileUrl || file.pdfUrl);
      const updatedRequest = response.request ? {
        ...response.request,
        quoteFiles: getQuoteFiles(response.request).length ? getQuoteFiles(response.request) : responseQuoteFiles,
        quotationFiles: getQuoteFiles(response.request).length ? getQuoteFiles(response.request) : responseQuoteFiles,
        quoteSent: true,
        quoteStatus: "sent",
        quoteFileCount: Number(response.request.quoteFileCount || responseQuoteFiles.length || getQuoteFiles(response.request).length || 0),
        quoteSentAt: response.request.quoteSentAt || new Date().toISOString()
      } : null;
      if (updatedRequest) {
        const id = getRowId(updatedRequest);
        const index = state.requests.findIndex(item => getRowId(item) === id || getRequestDisplayId(item) === getRequestDisplayId(updatedRequest));
        if (index >= 0) state.requests[index] = Object.assign({}, state.requests[index], updatedRequest);
        const quoteIndex = toList(state.quoteRequestAllRows).findIndex(item => getRowId(item) === id || getRequestDisplayId(item) === getRequestDisplayId(updatedRequest));
        if (quoteIndex >= 0) state.quoteRequestAllRows[quoteIndex] = Object.assign({}, state.quoteRequestAllRows[quoteIndex], updatedRequest);
      }
      toast(state.lang === "vi" ? "G\u1eedi b\u00e1o gi\u00e1 th\u00e0nh c\u00f4ng." : "\u898b\u7a4d\u3092\u9001\u4fe1\u3057\u307e\u3057\u305f\u3002");
      if (state.currentView === "quotes") await renderQuotes();
      if (updatedRequest) {
        state.quoteWizardStep = 2;
        renderQuoteDetail(updatedRequest);
      }
    } catch (error) {
      console.error(error);
      toast(error.message || t("failed"));
    }
  }

  async function refreshData() {
    if (state.currentView === "quotes") {
      await renderQuotes();
      return;
    }
    await loadAll();
    renderCurrentView();
  }

  function sidebarTooltip() {
    return $("sidebarTooltip");
  }

  function shouldShowSidebarTooltip() {
    return $("appShell").classList.contains("sidebar-collapsed") && window.matchMedia("(min-width: 1100px)").matches;
  }

  function showSidebarTooltip(item) {
    if (!item || !shouldShowSidebarTooltip()) return hideSidebarTooltip();
    const tooltip = sidebarTooltip();
    const rect = item.getBoundingClientRect();
    tooltip.textContent = item.dataset.tooltip || item.getAttribute("aria-label") || "";
    tooltip.style.top = `${rect.top + rect.height / 2}px`;
    tooltip.style.left = `calc(var(--sidebar-collapsed-width) + 10px)`;
    tooltip.classList.add("visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideSidebarTooltip() {
    const tooltip = sidebarTooltip();
    tooltip.classList.remove("visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function handleQuoteDashboardClick(event) {
    if (state.currentView !== "quotes") return false;

    const quoteView = event.target.closest("[data-quote-view]");
    if (quoteView) {
      event.preventDefault();
      event.stopPropagation();
      state.filters.quoteView = quoteView.dataset.quoteView === "list" ? "list" : "kanban";
      renderQuotes();
      return true;
    }

    const quoteCard = event.target.closest("[data-quote-card-id]");
    if (quoteCard && !event.target.closest("[data-quote-card-skip]")) {
      event.preventDefault();
      event.stopPropagation();
      openQuoteDetail(quoteCard.dataset.quoteCardId);
      return true;
    }

    const quoteAction = event.target.closest("[data-quote-action]");
    if (quoteAction) {
      event.preventDefault();
      event.stopPropagation();
      const action = quoteAction.dataset.quoteAction;
      if (action === "new") {
        renderQuoteDetail(emptyQuote());
        return true;
      }
      if (action === "detail") {
        openQuoteDetail(quoteAction.dataset.quoteId);
        return true;
      }
    }

    const quoteScroll = event.target.closest("[data-quote-scroll]");
    if (quoteScroll) {
      event.preventDefault();
      event.stopPropagation();
      const board = document.querySelector(".quote-kanban-board");
      if (!board) {
        toast(t("featureLater"));
        return true;
      }
      const column = board.querySelector(".quote-column");
      const gap = Number.parseFloat(getComputedStyle(board).columnGap || getComputedStyle(board).gap || "14") || 14;
      const step = (column?.getBoundingClientRect().width || 320) + gap;
      board.scrollBy({ left: Number(quoteScroll.dataset.quoteScroll || 1) * step, behavior: "smooth" });
      setTimeout(updateQuoteScrollButtons, 260);
      return true;
    }

    const quoteRefresh = event.target.closest("[data-quote-refresh]");
    if (quoteRefresh) {
      event.preventDefault();
      event.stopPropagation();
      refreshQuoteLayoutData();
      return true;
    }

    const quoteCsv = event.target.closest("[data-quote-csv]");
    if (quoteCsv) {
      event.preventDefault();
      event.stopPropagation();
      toast(t("quoteCsvUnavailable"));
      return true;
    }

    return false;
  }

  async function handleRequestViewClick(event) {
    const filter = event.target.closest("[data-request-filter]");
    if (filter) {
      event.preventDefault();
      event.stopPropagation();
      state.filters.requestStatus = filter.dataset.requestFilter;
      console.log("[admin-v2] request filter", state.filters.requestStatus);
      renderRequestResults();
      return true;
    }

    const mode = event.target.closest("[data-view-mode]");
    if (mode) {
      event.preventDefault();
      event.stopPropagation();
      state.filters.requestViewMode = mode.dataset.viewMode;
      console.log("[admin-v2] request view mode", state.filters.requestViewMode);
      renderRequestResults();
      return true;
    }

    const searchButton = event.target.closest("[data-request-search]");
    if (searchButton) {
      event.preventDefault();
      event.stopPropagation();
      state.filters.search = $("requestSearch")?.value || "";
      renderRequestResults();
      return true;
    }

    if (event.target.closest("[data-retry]")) {
      event.preventDefault();
      event.stopPropagation();
      await refreshData();
      return true;
    }

    const requestButton = event.target.closest("[data-request-detail]");
    if (requestButton) {
      event.preventDefault();
      event.stopPropagation();
      const id = requestButton.dataset.requestDetail;
      let request = state.requests.find(item => getRowId(item) === id || getRequestDisplayId(item) === id);
      try {
        request = await AdminAPI.getRequest(id);
      } catch {}
      if (request) renderRequestDetail(request);
      return true;
    }

    return false;
  }

  async function handleRequestViewChange(event) {
    const statusSelect = event.target.closest("[data-request-status]");
    if (statusSelect && !$("drawer").classList.contains("open")) {
      event.stopPropagation();
      try {
        await AdminAPI.updateRequest(statusSelect.dataset.requestStatus, { status: statusSelect.value });
        const item = state.requests.find(request => getRowId(request) === statusSelect.dataset.requestStatus || getRequestDisplayId(request) === statusSelect.dataset.requestStatus);
        if (item) item.status = statusSelect.value;
        renderRequestResults();
        toast(t("saved"));
      } catch (error) {
        console.error("[admin-v2] request status update failed", error);
        toast(t("failed"));
      }
      return true;
    }

    const select = event.target.closest("[data-filter-select]");
    if (select) {
      event.stopPropagation();
      state.filters[select.dataset.filterSelect] = select.value;
      console.log("[admin-v2] request select filter", select.dataset.filterSelect, select.value);
      renderRequestResults();
      return true;
    }

    return false;
  }

  function handleRequestViewInput(event) {
    const quoteFilter = event.target.closest("[data-quote-filter='search']");
    if (quoteFilter) {
      state.filters.quoteSearch = quoteFilter.value || "";
      renderQuotes();
      return true;
    }
    if (event.target.id !== "requestSearch") return false;
    const input = event.target;
    state.filters.search = input.value || "";
    return true;
  }

  async function handleTrashDelegatedClick(event) {
    const trashBtn = event.target.closest("[data-trash-action]");
    if (!trashBtn) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      await handleTrashAction(
        trashBtn.dataset.trashAction,
        trashBtn.dataset.trashType,
        trashBtn.dataset.trashId
      );
    } catch (error) {
      console.error(error);
      toast(t("failed"));
    }
    return true;
  }

  async function handleCustomerDelegatedClick(event) {
    if (state.currentView !== "customers") return false;

    const actionButton = event.target.closest("[data-customer-action]");
    if (actionButton) {
      event.preventDefault();
      event.stopPropagation();
      await handleCustomerAction(actionButton.dataset.customerAction, actionButton);
      return true;
    }

    const customerRow = event.target.closest("[data-customer-id]");
    if (customerRow && customerRow.closest(".customer-list-panel")) {
      event.preventDefault();
      event.stopPropagation();
      await handleCustomerAction("select", customerRow);
      return true;
    }

    return false;
  }

  async function handleStaffStatusSwitchClick(event) {
    const switchButton = event.target.closest("[data-action='toggle-staff-status']");
    if (!switchButton) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (switchButton.disabled) return true;
    const staffId = switchButton.dataset.staffId || switchButton.dataset.staffStatusAction;
    const nextStatus = switchButton.dataset.nextStatus;
    if (!staffId || !nextStatus) return true;
    await updateStaffStatusQuick(staffId, nextStatus, switchButton);
    return true;
  }

  async function updateStaffStatusQuick(id, status, trigger) {
    const staff = state.staff.find(item => String(getRowId(item)) === String(id));
    if (!staff) return;
    if (state.staffStatusUpdating?.has(id)) return;
    const currentStatus = normalizeStaffStatus(staff.status || "active") === "off" ? "off" : "active";
    const nextStatus = status === "off" ? "off" : "active";
    if (currentStatus === nextStatus) return;
    state.staffStatusUpdating.add(id);
    if (trigger) {
      trigger.disabled = true;
      trigger.classList.add("is-loading");
      trigger.setAttribute("aria-disabled", "true");
    }
    try {
      const response = await AdminAPI.updateStaff(id, { status: nextStatus });
      const updated = response?.staff || response?.data?.staff || response?.data || response || { status: nextStatus };
      const index = state.staff.findIndex(item => String(getRowId(item)) === String(id));
      if (index >= 0) state.staff[index] = Object.assign({}, state.staff[index], updated, { status: updated.status || nextStatus });
      state.staffStatusUpdating.delete(id);
      renderStaff();
      toast(t("saved"));
    } catch (error) {
      console.error(error);
      state.staffStatusUpdating.delete(id);
      if (trigger) {
        trigger.disabled = false;
        trigger.classList.remove("is-loading");
        trigger.removeAttribute("aria-disabled");
      }
      toast(t("failed"));
    }
  }

  async function handleStaffAction(action, id) {
    if (action === "close-detail") {
      state.selectedStaff = "";
      renderStaffResultsOnly();
      return;
    }
    if (action === "add") {
      renderStaffForm(null);
      return;
    }
    if (!id) return;
    const staff = state.staff.find(item => getRowId(item) === id);
    if (!staff && !["permanent-delete"].includes(action)) return;
    if (action === "detail") {
      state.selectedStaff = id;
      renderStaffResultsOnly();
      return;
    }
    if (action === "edit") {
      renderStaffForm(staff);
      return;
    }
    try {
      let response;
      if (action === "pause") {
        await updateStaffStatusQuick(id, "off");
        return;
      }
      if (action === "activate") {
        await updateStaffStatusQuick(id, "active");
        return;
      }
      if (action === "delete") {
        if (!await confirmAction({ title: t("confirmDelete"), confirmLabel: t("delete"), danger: true })) return;
        response = await AdminAPI.deleteStaff(id, false);
      }
      if (action === "restore") {
        if (!await confirmAction({ title: t("restoreTrashTitle"), message: t("restoreTrashText"), confirmLabel: t("restore") })) return;
        response = await AdminAPI.restoreStaff(id);
      }
      if (action === "permanent-delete") {
        if (!await confirmAction({ title: t("permanentDeleteTrashTitle"), message: t("permanentDeleteTrashText"), confirmLabel: t("permanentDelete"), danger: true })) return;
        await AdminAPI.deleteStaff(id, true);
        state.staff = state.staff.filter(item => getRowId(item) !== id);
        state.selectedStaff = "";
        renderStaff();
        toast(t("permanentDeletedSuccess"));
        return;
      }
      const updated = response?.data || response;
      if (updated && getRowId(updated)) {
        const index = state.staff.findIndex(item => getRowId(item) === getRowId(updated));
        if (index >= 0) state.staff[index] = Object.assign({}, state.staff[index], updated);
      }
      if (action === "delete") state.selectedStaff = "";
      renderStaff();
      toast(action === "restore" ? t("restoredSuccess") : t("saved"));
    } catch (error) {
      console.error(error);
      toast(t("failed"));
    }
  }

  async function handleStaffDelegatedClick(event) {
    const staffBtn = event.target.closest("[data-staff-action]");
    if (!staffBtn) return false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    await handleStaffAction(staffBtn.dataset.staffAction, staffBtn.dataset.staffId || state.selectedStaff);
    return true;
  }

  function setStaffEditDirty(dirty = true) {
    const form = $("staffForm");
    if (!form) return;
    form.dataset.staffEditDirty = dirty ? "true" : "false";
    document.querySelectorAll("[data-staff-edit-save]").forEach(button => {
      button.disabled = !dirty;
    });
    const note = document.querySelector("[data-staff-edit-unsaved]");
    if (note) note.hidden = !dirty;
  }

  async function closeStaffEditForm(force = false) {
    const form = $("staffForm");
    if (!force && form?.dataset.staffEditDirty === "true") {
      const ok = await confirmAction({
        title: t("staffUnsavedCloseTitle"),
        message: t("unsavedChangesText"),
        cancelLabel: t("continueEditing"),
        confirmLabel: t("closeWithoutSave"),
        variant: "warning"
      });
      if (!ok) return;
    }
    document.querySelector("[data-staff-edit-overlay]")?.remove();
  }

  function previewStaffAvatar(file) {
    const preview = document.querySelector("[data-avatar-preview]");
    const status = document.querySelector("[data-avatar-status]");
    if (!preview || !file) return;
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${escapeHtml(url)}" alt="${escapeHtml(t("preview"))}">`;
    if (status) status.textContent = file.name || t("preview");
  }

  function staffFormPayload(form) {
    const raw = new FormData(form);
    const payload = new FormData();
    ["name", "phone", "email", "note", "introduction", "status"].forEach(field => {
      payload.set(field, raw.get(field) || "");
    });
    const departmentInput = form.querySelector("[data-staff-department-value]");
    const departmentCode = departmentInput?.value || "";
    payload.set("departmentCode", departmentCode);
    payload.set("department", currentStaffDepartmentLabel() === "-" ? "" : currentStaffDepartmentLabel());
    payload.set("autoAssignEnabled", raw.get("autoAssignEnabled") === "on" ? "true" : "false");
    payload.set("staffDescription", raw.get("introduction") || "");
    const selectedWork = readSelectedWorkEntries();
    const departmentTokens = departmentTokenSet();
    [departmentCode, currentStaffDepartmentLabel()].forEach(value => {
      const normalized = normalizeTag(value);
      if (normalized) departmentTokens.add(normalized);
    });
    const workTags = selectedWork
      .map(item => String(item.label || item.code || item.id || "").trim())
      .filter(value => value && !departmentTokens.has(normalizeTag(value)));
    if (workTags.length) workTags.forEach(tag => payload.append("workTags", tag));
    else payload.set("workTags", "");
    const workTypeIds = selectedWork.filter(item => !item.legacy).map(item => item.id || item.code).filter(Boolean);
    if (workTypeIds.length) workTypeIds.forEach(id => payload.append("workTypeIds", id));
    else payload.set("workTypeIds", "");
    payload.set("avatar", raw.get("avatar") || "");
    const file = raw.get("avatarFile");
    if (file && file.size > 0) payload.set("avatar", file);
    return payload;
  }

  function selectedStaffWorkTags() {
    const departmentTokens = departmentTokenSet();
    [currentStaffDepartmentCode(), currentStaffDepartmentLabel()].forEach(value => {
      const normalized = normalizeTag(value);
      if (normalized) departmentTokens.add(normalized);
    });
    return readSelectedWorkEntries()
      .map(item => String(item.label || item.code || item.id || "").trim())
      .filter(value => value && !departmentTokens.has(normalizeTag(value)));
  }

  function renderSelectedStaffTags() {
    const target = document.querySelector("[data-staff-selected-tags]");
    if (!target) return;
    const tags = selectedStaffWorkTags();
    target.innerHTML = tags.length
      ? tags.map(tag => `<button class="staff-selected-tag" type="button" data-staff-tag-remove="${escapeHtml(tag)}">${escapeHtml(tag)} <span aria-hidden="true">\u00d7</span></button>`).join("")
      : `<span class="muted-dash">-</span>`;
  }

  function applyStaffTagFilter() {
    const picker = document.querySelector("[data-staff-tag-picker]");
    if (!picker) return;
    const mode = picker.dataset.tagMode || "department";
    const dept = picker.dataset.currentDept || "other";
    const search = (picker.querySelector("[data-staff-tag-search]")?.value || "").trim().toLowerCase();
    picker.querySelectorAll("[data-staff-tag-item]").forEach(item => {
      const tag = (item.dataset.tag || "").toLowerCase();
      const tagDept = item.dataset.tagDept || "outside";
      const checked = item.querySelector("input")?.checked;
      const modeOk = mode === "all" || (mode === "selected" ? checked : tagDept === dept || checked);
      const searchOk = !search || tag.includes(search);
      item.hidden = !(modeOk && searchOk);
    });
    picker.querySelectorAll("[data-staff-tag-mode]").forEach(button => {
      button.classList.toggle("active", button.dataset.staffTagMode === mode);
    });
    picker.querySelectorAll("[data-staff-work-group]").forEach(button => {
      button.classList.toggle("active", button.dataset.staffWorkGroup === dept);
    });
    renderSelectedStaffTags();
  }

  function refreshStaffTagDepartment() {
    const picker = document.querySelector("[data-staff-tag-picker]");
    const department = document.querySelector("#staffForm select[name='department']");
    if (!picker || !department) return;
    picker.dataset.currentDept = staffDepartmentCode(department.value);
    applyStaffTagFilter();
  }

  function bindEvents() {
    console.log("[admin-v2] binding events");
    const savedSidebarState = localStorage.getItem("adminV2SidebarCollapsed");
    $("appShell").classList.toggle("sidebar-collapsed", savedSidebarState === "true");
    const bind = (target, eventName, handler) => {
      if (!target) {
        console.warn("[admin-v2] missing bind target", eventName);
        return;
      }
      target.addEventListener(eventName, handler);
    };

    const bindSidebarNav = nav => {
      if (!nav) {
        console.warn("[admin-v2] sidebar nav missing");
        return;
      }
      bind(nav, "click", event => {
        const button = event.target.closest("[data-view]");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        hideSidebarTooltip();
        console.log("[admin-v2] nav click", button.dataset.view);
        state.currentView = button.dataset.view;
        console.log("[admin-v2] currentView", state.currentView);
        $("appShell").classList.remove("sidebar-open");
        renderCurrentView();
      });
      bind(nav, "pointerover", event => showSidebarTooltip(event.target.closest(".nav-item")));
      bind(nav, "pointerout", event => {
        const item = event.target.closest(".nav-item");
        if (item && !item.contains(event.relatedTarget)) hideSidebarTooltip();
      });
      bind(nav, "focusin", event => showSidebarTooltip(event.target.closest(".nav-item")));
      bind(nav, "focusout", hideSidebarTooltip);
    };

    bindSidebarNav($("sideNav"));
    bindSidebarNav($("sideNavBottom"));

    bind($("mobileMenuButton"), "click", () => $("appShell").classList.toggle("sidebar-open"));
    bind($("sidebarToggleButton"), "click", () => {
      hideSidebarTooltip();
      const collapsed = $("appShell").classList.toggle("sidebar-collapsed");
      localStorage.setItem("adminV2SidebarCollapsed", String(collapsed));
    });
    bind($("mobileScrim"), "click", () => {
      hideSidebarTooltip();
      $("appShell").classList.remove("sidebar-open");
    });
    bind($("logoutButton"), "click", logout);
    bind($("refreshButton"), "click", refreshData);
    bind($("languageSelect"), "change", event => {
      hideSidebarTooltip();
      state.lang = event.target.value === "vi" ? "vi" : "ja";
      localStorage.setItem("language", state.lang);
      renderCurrentView();
    });
    bind($("viewRoot"), "click", event => {
      if (state.currentView === "settings") {
        const overviewEdit = event.target.closest("[data-overview-edit]");
        if (overviewEdit) {
          event.preventDefault();
          beginOverviewEdit(overviewEdit.dataset.overviewEdit);
          return;
        }
        const overviewCancel = event.target.closest("[data-overview-cancel]");
        if (overviewCancel) {
          event.preventDefault();
          cancelOverviewEdit(overviewCancel.dataset.overviewCancel);
          return;
        }
        const overviewSave = event.target.closest("[data-overview-save]");
        if (overviewSave) {
          event.preventDefault();
          void saveOverviewSection(overviewSave.dataset.overviewSave);
          return;
        }
        if (event.target.closest("[data-settings-detail-save]")) {
          state.settingsDetail = null;
          showToast(settingText("Ch\u1ee9c n\u0103ng s\u1ebd ph\u00e1t tri\u1ec3n sau", "\u6a5f\u80fd\u306f\u5f8c\u65e5\u5b9f\u88c5\u3057\u307e\u3059"));
          renderSettings();
          return;
        }
        if (event.target.closest("[data-settings-detail-dirty]")) {
          markSettingsDetailDirty();
        }
        if (event.target.closest("[data-settings-detail-close]") || event.target.closest("[data-settings-detail-cancel]")) {
          event.preventDefault();
          closeSettingsDetail();
          return;
        }
        if (event.target.matches("[data-settings-detail-overlay]")) {
          closeSettingsDetail();
          return;
        }
      }
      const settingsTab = event.target.closest("[data-settings-tab]");
      if (settingsTab && state.currentView === "settings") {
        event.preventDefault();
        event.stopPropagation();
        state.settingsTab = settingsTab.dataset.settingsTab || "overview";
        state.settingsDetail = null;
        renderSettings();
        return;
      }
      const settingsDetail = event.target.closest("[data-settings-detail]");
      if (settingsDetail && state.currentView === "settings") {
        event.preventDefault();
        event.stopPropagation();
        const key = settingsDetail.dataset.settingsDetail;
        const [, overviewSection] = String(key || "").split(":");
        state.settingsDetail = { key, dirty: false };
        if (String(key || "").startsWith("overview:")) {
          state.settingsDetail.overviewSection = overviewSection;
          if (overviewSection !== "dataStatus") {
            state.overviewSettingsDrafts[overviewSection] = JSON.parse(JSON.stringify(normalizeOverviewSettings(state.overviewSettings)[overviewSection] || {}));
          }
        }
        renderSettings();
        return;
      }
      if (handleQuoteDashboardClick(event)) return;
      void handleRequestViewClick(event);
    });
    bind($("viewRoot"), "change", handleRequestViewChange);
    bind($("viewRoot"), "change", event => {
      if (state.currentView === "settings" && event.target.matches("[data-overview-field]")) {
        const section = event.target.getAttribute("data-overview-field").split(".")[0];
        if (section) state.overviewSettingsDrafts[section] = collectOverviewSection(section);
        if (state.settingsDetail) state.settingsDetail.dirty = true;
      }
    });
    bind($("viewRoot"), "input", event => {
      if (state.currentView === "settings" && event.target.closest("[data-settings-detail-dirty]")) {
        markSettingsDetailDirty();
        return;
      }
      if (state.currentView === "settings" && event.target.matches("[data-overview-field]")) {
        const section = event.target.getAttribute("data-overview-field").split(".")[0];
        if (section) state.overviewSettingsDrafts[section] = collectOverviewSection(section);
        if (state.settingsDetail) state.settingsDetail.dirty = true;
        return;
      }
      if (handleRequestViewInput(event)) event.stopPropagation();
    });
    bind(document, "input", event => {
      if (event.target.closest("[data-quote-form]")) {
        if (event.target.matches("[data-quote-note-preview]")) {
          const mirror = document.querySelector("[data-quote-note-mirror]");
          if (mirror) mirror.value = event.target.value;
        }
        if (event.target.matches("[data-quote-note-mirror]")) {
          const preview = document.querySelector("[data-quote-note-preview]");
          if (preview) preview.value = event.target.value;
        }
        updateQuoteDetailTotals();
      }
    });
    bind($("viewRoot"), "keydown", event => {
      if (event.target.id === "requestSearch" && event.key === "Enter") {
        event.preventDefault();
        state.filters.search = event.target.value || "";
        renderRequestResults();
      }
    });
    document.addEventListener("click", event => {
      void handleStaffStatusSwitchClick(event);
    }, true);
    document.addEventListener("click", event => {
      void handleTrashDelegatedClick(event);
    }, true);
    document.addEventListener("click", event => {
      void handleStaffDelegatedClick(event);
    }, true);
    document.addEventListener("click", event => {
      void handleCustomerDelegatedClick(event);
    }, true);
    document.addEventListener("scroll", event => {
      if (event.target?.classList?.contains("quote-kanban-board")) updateQuoteScrollButtons();
    }, true);
    bind(document, "keydown", event => {
      if (event.key === "Escape" && $("mediaPreviewOverlay")) {
        $("mediaPreviewOverlay").remove();
        return;
      }
      if (event.key === "Escape" && $("requestDetailOverlay")) {
        event.preventDefault();
        void closeRequestDetail();
        return;
      }
      if (event.key === "Escape" && state.currentView === "settings" && state.settingsDetail) {
        event.preventDefault();
        closeSettingsDetail();
        return;
      }
      if (event.key === "Escape" && state.currentView === "customers" && state.selectedUser) {
        closeCustomerDetail();
      }
    });
    if ($("globalSearch")) {
      bind($("globalSearch"), "input", event => {
        state.filters.search = event.target.value || "";
        if (state.currentView === "requests") renderRequestResults();
      });
    }
    bind($("drawer"), "click", event => {
      const tab = event.target.closest("[data-drawer-tab]");
      if (tab) {
        const type = $("drawer").dataset.drawerType;
        const id = $("drawer").dataset.drawerId;
        if (type === "customer") {
          const user = state.users.find(item => getRowId(item) === id);
          if (user) renderCustomerDetail(user, tab.dataset.drawerTab);
        }
        if (type === "staff") {
          const staff = state.staff.find(item => getRowId(item) === id);
          if (staff) renderStaffDetail(staff, tab.dataset.drawerTab);
        }
        return;
      }
      if (event.target.id === "drawer" || event.target.closest("[data-close-drawer]") || event.target.closest("[data-staff-edit-close]")) {
        if ($("drawer").dataset.drawerType === "staff-edit") {
          void closeStaffEditForm();
          return;
        }
        if (state.selectedQuoteId) closeQuoteDetail();
        else closeDrawer();
      }
    });

    bind(document, "change", async event => {
      const quoteFileInput = event.target.closest("[data-quote-file-input]");
      if (quoteFileInput) {
        addSelectedQuoteFiles(quoteFileInput.files || []);
        quoteFileInput.value = "";
        return;
      }
      const staffForm = event.target.closest("#staffForm");
      if (staffForm) {
        setStaffEditDirty(true);
        if (event.target.closest("[data-avatar-file]")) {
          const file = event.target.files && event.target.files[0];
          if (file) previewStaffAvatar(file);
        }
        if (event.target.matches("[data-auto-assign-toggle]")) renderStaffWorkAssignment();
        const workTypeInput = event.target.closest("[data-staff-worktype-item]");
        if (workTypeInput) {
          const selected = readSelectedWorkEntries().filter(item => normalizeTag(item.id || item.code || item.label) !== normalizeTag(workTypeInput.value));
          if (workTypeInput.checked) {
            selected.push({
              id: workTypeInput.value,
              code: workTypeInput.dataset.workCode || workTypeInput.value,
              label: workTypeInput.dataset.workLabel || workTypeInput.value,
              departmentCode: workTypeInput.dataset.workDepartment || "",
              legacy: false
            });
          }
          writeSelectedWorkEntries(selected);
          renderStaffWorkAssignment();
        }
        return;
      }
      if (event.target.closest("[data-request-edit-field]")) {
        setRequestDetailDirty(true);
        return;
      }
      const quoteFilter = event.target.closest("[data-quote-filter]");
      if (quoteFilter) {
        state.filters["quote" + quoteFilter.dataset.quoteFilter.charAt(0).toUpperCase() + quoteFilter.dataset.quoteFilter.slice(1)] = quoteFilter.value || "";
        renderQuotes();
        return;
      }
      const select = event.target.closest("[data-request-status]");
      if (!select || $("drawer").classList.contains("open")) return;
      try {
        await AdminAPI.updateRequest(select.dataset.requestStatus, { status: select.value });
        const item = state.requests.find(request => getRowId(request) === select.dataset.requestStatus || getRequestDisplayId(request) === select.dataset.requestStatus);
        if (item) item.status = select.value;
        renderRequestResults();
        toast(t("saved"));
      } catch {
        toast(t("failed"));
      }
    });

    bind(document, "dragover", event => {
      const dropzone = event.target.closest("[data-quote-file-dropzone]");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.add("is-dragover");
    });
    bind(document, "dragleave", event => {
      const dropzone = event.target.closest("[data-quote-file-dropzone]");
      if (!dropzone) return;
      if (!event.relatedTarget || !dropzone.contains(event.relatedTarget)) dropzone.classList.remove("is-dragover");
    });
    bind(document, "drop", event => {
      const dropzone = event.target.closest("[data-quote-file-dropzone]");
      if (!dropzone) return;
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
      addSelectedQuoteFiles(event.dataTransfer?.files || []);
    });

    bind(document, "click", async event => {
      if (event.defaultPrevented) return;
      if (event.target.closest("[data-close-media-preview]") || event.target.id === "mediaPreviewOverlay") {
        $("mediaPreviewOverlay")?.remove();
        return;
      }
      const mediaPreview = event.target.closest("[data-media-preview]");
      if (mediaPreview) {
        openMediaPreview(mediaPreview.dataset.mediaPreview, mediaPreview.dataset.mediaType);
        return;
      }
      if (event.target.closest("[data-close-request-detail]") || event.target.id === "requestDetailOverlay") {
        await closeRequestDetail();
        return;
      }
      const createQuoteButton = event.target.closest("[data-create-quote-from-request]");
      if (createQuoteButton) {
        await createQuoteFromRequest(createQuoteButton.dataset.createQuoteFromRequest);
        return;
      }
      if (event.target.closest("[data-quote-request-search]")) {
        toast(t("quoteRequestSearchLater"));
        return;
      }
      if (event.target.closest("[data-quote-placeholder-action]")) {
        toast(t("featureLater"));
        return;
      }
      if (event.target.closest("[data-quote-upload-placeholder]")) {
        toast(t("featureLater"));
        return;
      }
      if (event.target.closest("[data-quote-pdf-preview]")) {
        exportCurrentQuotePdf();
        return;
      }
      if (event.target.closest("[data-quote-excel-preview]")) {
        toast(t("fileExportLater"));
        return;
      }
      if (event.target.closest("[data-quote-prev], [data-quote-prev-step]")) {
        prevQuoteStep();
        return;
      }
      if (event.target.closest("[data-quote-next], [data-quote-next-step]")) {
        nextQuoteStep();
        return;
      }
      const openRequestQuoteButton = event.target.closest("[data-open-request-quote]");
      if (openRequestQuoteButton) {
        await openRequestQuote(openRequestQuoteButton.dataset.openRequestQuote, 1);
        return;
      }
      const quoteSendFilter = event.target.closest("[data-quote-send-filter]");
      if (quoteSendFilter) {
        state.filters.quoteSendStatus = quoteSendFilter.dataset.quoteSendFilter || "all";
        await renderQuotes();
        return;
      }
      const quoteDropzone = event.target.closest("[data-quote-file-dropzone]");
      if (quoteDropzone && !event.target.closest("[data-quote-file-input]")) {
        quoteDropzone.querySelector("[data-quote-file-input]")?.click();
        return;
      }
      const removeQuoteFileButton = event.target.closest("[data-quote-remove-file]");
      if (removeQuoteFileButton) {
        removeSelectedQuoteFile(removeQuoteFileButton.dataset.quoteRemoveFile);
        return;
      }
      if (event.target.closest("[data-quote-send-file]")) {
        await sendQuoteFileFromModal();
        return;
      }
      const wizardStep = event.target.closest("[data-quote-wizard-step]");
      if (wizardStep) {
        setQuoteWizardStep(wizardStep.dataset.quoteWizardStep);
        return;
      }
      if (event.target.closest("select,input,textarea,option")) return;

      const navButton = event.target.closest("[data-view]");
      if (navButton) {
        event.preventDefault();
        hideSidebarTooltip();
        console.log("[admin-v2] nav click", navButton.dataset.view);
        state.currentView = navButton.dataset.view;
        console.log("[admin-v2] currentView", state.currentView);
        $("appShell").classList.remove("sidebar-open");
        renderCurrentView();
        return;
      }

      const kpi = event.target.closest("[data-dashboard-filter]");
      if (kpi) {
        const [view, filter, value] = kpi.dataset.dashboardFilter.split(":");
        state.currentView = view || "requests";
        if (state.currentView === "requests" && filter !== "requestStatus") state.filters.requestStatus = "all";
        if (filter === "requestStatus") state.filters.requestStatus = value || "all";
        if (filter === "customerStatus") state.filters.customerStatus = value || "all";
        if (filter === "trashCategory") state.filters.trashCategory = value || "customers";
        if (filter === "media") state.filters.media = value || "all";
        if (filter === "notification") state.currentView = "notifications";
        renderCurrentView();
        return;
      }

      if (event.target.closest("[data-retry]")) {
        refreshData();
        return;
      }

      if (event.target.closest("[data-quote-refresh]")) {
        refreshQuoteLayoutData();
        return;
      }

      if (event.target.closest("[data-quote-csv]")) {
        toast(t("quoteCsvUnavailable"));
        return;
      }

      const settingsTab = event.target.closest("[data-settings-tab]");
      if (settingsTab) {
        state.settingsTab = settingsTab.dataset.settingsTab || "overview";
        renderSettings();
        return;
      }

      const quoteView = event.target.closest("[data-quote-view]");
      if (quoteView) {
        state.filters.quoteView = quoteView.dataset.quoteView || "kanban";
        renderQuotes();
        return;
      }

      const quoteScroll = event.target.closest("[data-quote-scroll]");
      if (quoteScroll) {
        const board = document.querySelector(".quote-kanban-board");
        if (board) {
          const column = board.querySelector(".quote-column");
          const gap = Number.parseFloat(getComputedStyle(board).columnGap || getComputedStyle(board).gap || "14") || 14;
          const step = (column?.getBoundingClientRect().width || 320) + gap;
          board.scrollBy({ left: Number(quoteScroll.dataset.quoteScroll || 1) * step, behavior: "smooth" });
          setTimeout(updateQuoteScrollButtons, 260);
        }
        return;
      }

      const quoteAction = event.target.closest("[data-quote-action]");
      if (quoteAction) {
        const action = quoteAction.dataset.quoteAction;
        if (action === "new") {
          state.quoteWizardStep = 1;
          renderQuoteDetail(emptyQuote());
          return;
        }
        if (action === "detail") {
          state.quoteWizardStep = 1;
          openQuoteDetail(quoteAction.dataset.quoteId);
          return;
        }
      }

      if (event.target.closest("[data-quote-add-item]")) {
        const target = document.querySelector("[data-quote-items]");
        if (target) {
          target.querySelector(".quote-empty-line")?.remove();
          target.insertAdjacentHTML("beforeend", renderQuoteItemRow(normalizeQuoteItem({}, target.querySelectorAll("[data-quote-item-row]").length), target.querySelectorAll("[data-quote-item-row]").length));
        }
        updateQuoteDetailTotals();
        return;
      }

      const copyQuoteItem = event.target.closest("[data-quote-copy-item]");
      if (copyQuoteItem) {
        const row = copyQuoteItem.closest("[data-quote-item-row]");
        const target = document.querySelector("[data-quote-items]");
        if (row && target) {
          const item = normalizeQuoteItem({
            name: row.querySelector("[name='itemName']")?.value || "",
            description: row.querySelector("[name='itemDescription']")?.value || "",
            unit: row.querySelector("[name='itemUnit']")?.value || "",
            quantity: row.querySelector("[name='itemQuantity']")?.value || 0,
            unitPrice: row.querySelector("[name='itemUnitPrice']")?.value || 0,
            discount: row.querySelector("[name='itemDiscount']")?.value || 0
          }, target.querySelectorAll("[data-quote-item-row]").length);
          row.insertAdjacentHTML("afterend", renderQuoteItemRow(item, target.querySelectorAll("[data-quote-item-row]").length));
          updateQuoteDetailTotals();
        }
        return;
      }

      const removeQuoteItem = event.target.closest("[data-quote-remove-item]");
      if (removeQuoteItem) {
        removeQuoteItem.closest("[data-quote-item-row]")?.remove();
        updateQuoteDetailTotals();
        return;
      }

      const quoteSave = event.target.closest("[data-quote-save], [data-quote-send]");
      if (quoteSave) {
        const form = document.querySelector("[data-quote-form]");
        if (!form) return;
        try {
          const existing = quoteRows().find(item => String(item.id) === String(new FormData(form).get("id")));
          const quote = quoteFromForm(form, existing);
          if (quoteSave.matches("[data-quote-send]")) {
            const message = validateQuoteSend(quote);
            if (message) {
              toast(message);
              return;
            }
            quote.status = "sent_to_customer";
            quote.visibleToCustomer = true;
            quote.sentToCustomerAt = new Date().toISOString();
          } else {
            const message = validateQuoteDraft(quote);
            if (message) {
              toast(message);
              return;
            }
            quote.status = "draft";
          }
          const saved = persistMockQuote(quote);
          if (!saved) {
            toast(t("failed"));
            return;
          }
          closeDrawer();
          renderQuotes();
          toast(quoteSave.matches("[data-quote-send]") ? t("quoteSentMock") : t("quoteSavedMock"));
        } catch (error) {
          console.error(error);
          toast(t("failed"));
        }
        return;
      }

      const trashCategory = event.target.closest("[data-trash-category]");
      if (trashCategory) {
        state.filters.trashCategory = trashCategory.dataset.trashCategory || "customers";
        renderTrash();
        return;
      }

      const masterTab = event.target.closest("[data-work-master-tab]");
      if (masterTab) {
        state.filters.workMasterTab = masterTab.dataset.workMasterTab || "departments";
        state.filters.workMasterEditId = "";
        renderWorkMaster();
        return;
      }

      const masterEdit = event.target.closest("[data-master-edit]");
      if (masterEdit) {
        state.filters.workMasterTab = masterEdit.dataset.masterEdit || "departments";
        state.filters.workMasterEditId = masterEdit.dataset.masterId || "";
        renderWorkMaster();
        return;
      }

      const masterStatus = event.target.closest("[data-master-status]");
      if (masterStatus) {
        await setWorkMasterStatus(masterStatus.dataset.masterStatus, masterStatus.dataset.masterId, masterStatus.dataset.masterActive === "true");
        return;
      }

      const masterDelete = event.target.closest("[data-master-delete]");
      if (masterDelete) {
        if (await confirmAction(t("confirmDelete"))) {
          await deleteWorkMasterItem(masterDelete.dataset.masterDelete, masterDelete.dataset.masterId);
        }
        return;
      }

      if (event.target.closest("[data-master-cancel]")) {
        state.filters.workMasterEditId = "";
        renderWorkMaster();
        return;
      }

      const requestButton = event.target.closest("[data-request-detail]");
      if (requestButton) {
        const id = requestButton.dataset.requestDetail;
        let request = state.requests.find(item => getRowId(item) === id || getRequestDisplayId(item) === id);
        try {
          request = await AdminAPI.getRequest(id);
        } catch {}
        if (request) renderRequestDetail(request);
        return;
      }

      const saveRequest = event.target.closest("[data-save-request]");
      if (saveRequest) {
        try {
          await saveRequestFromDrawer(saveRequest.dataset.saveRequest);
        } catch (error) {
          console.error(error);
          toast(t("saveChangesFailed"));
        }
        return;
      }

      const acceptAssignmentCandidate = event.target.closest("[data-accept-assignment-candidate]");
      if (acceptAssignmentCandidate) {
        const requestId = acceptAssignmentCandidate.dataset.acceptAssignmentCandidate;
        const staffId = acceptAssignmentCandidate.dataset.staffId || "";
        const staffName = acceptAssignmentCandidate.dataset.staffName || "";
        try {
          const response = await AdminAPI.updateRequest(requestId, {
            assigneeId: staffId,
            assigneeName: staffName,
            assignmentSource: "admin_from_suggestion",
            assignmentScore: acceptAssignmentCandidate.dataset.assignmentScore || "0",
            assignmentReason: acceptAssignmentCandidate.dataset.assignmentReason || ""
          });
          const updated = response?.data || response;
          const index = state.requests.findIndex(item => String(getRowId(item) || getRequestDisplayId(item)) === String(requestId));
          if (index >= 0 && updated) state.requests[index] = Object.assign({}, state.requests[index], updated);
          if ($("requestDetailOverlay")) {
            setRequestDetailDirty(false);
            renderRequestDetail(state.requests[index] || updated);
          }
          if ($("requestResults")) renderRequestResults();
          toast(t("savedAssignee"));
        } catch (error) {
          console.error(error);
          toast(t("failed"));
        }
        return;
      }

      const applyAssignee = event.target.closest("[data-apply-assignee]");
      if (applyAssignee) {
        const staff = state.staff.find(item => getRowId(item) === applyAssignee.dataset.staffId);
        if (!staff) return;
        const detail = $("requestDetailOverlay");
        if (detail && detail.contains(applyAssignee)) {
          const select = detail.querySelector("[data-request-edit-field='assigneeId']");
          if (select) select.value = getRowId(staff);
          setRequestDetailDirty(true);
          return;
        }
        try {
          await AdminAPI.updateRequest(applyAssignee.dataset.applyAssignee, {
            assigneeId: getRowId(staff),
            assigneeName: staff.name || "",
            assignmentSource: "manual"
          });
          await refreshData();
          closeDrawer();
          toast(t("savedAssignee"));
        } catch (error) {
          console.error(error);
          toast(t("failed"));
        }
        return;
      }

      if (event.target.closest("[data-staff-edit-close]") || event.target.id === "staffEditOverlay") {
        event.preventDefault();
        void closeStaffEditForm();
        return;
      }

      if (event.target.closest("[data-focus-staff-department]")) {
        event.preventDefault();
        document.querySelector("[data-staff-department-option]")?.focus();
        return;
      }

      const departmentOption = event.target.closest("[data-staff-department-option]");
      if (departmentOption) {
        event.preventDefault();
        const input = document.querySelector("[data-staff-department-value]");
        if (input) input.value = departmentOption.dataset.staffDepartmentOption || "";
        setStaffEditDirty(true);
        renderStaffWorkAssignment();
        return;
      }

      const removeWork = event.target.closest("[data-staff-work-remove]");
      if (removeWork) {
        event.preventDefault();
        const value = removeWork.dataset.staffWorkRemove;
        writeSelectedWorkEntries(readSelectedWorkEntries().filter(item => normalizeTag(item.id || item.code || item.label) !== normalizeTag(value)));
        setStaffEditDirty(true);
        renderStaffWorkAssignment();
        return;
      }

      const openWorkMaster = event.target.closest("[data-open-work-master-tab]");
      if (openWorkMaster) {
        event.preventDefault();
        await closeStaffEditForm(true);
        state.currentView = "settings";
        state.filters.workMasterTab = openWorkMaster.dataset.openWorkMasterTab || "workTypes";
        state.filters.workMasterEditId = "";
        renderCurrentView();
        return;
      }

      if (event.target.closest("[data-staff-selected-work-to-content]")) {
        event.preventDefault();
        const content = document.querySelector("#staffForm textarea[name='introduction']");
        if (!content) return;
        if (content.value.trim()) {
          const ok = await confirmAction({
            title: t("overwriteWorkContentTitle"),
            message: t("overwriteWorkContentText"),
            confirmLabel: t("save"),
            cancelLabel: t("cancel")
          });
          if (!ok) return;
        }
        const prefix = state.lang === "vi" ? "Có thể phụ trách: " : "対応可能業務：";
        const suffix = state.lang === "vi" ? "." : "。";
        content.value = selectedStaffWorkTags().length ? prefix + selectedStaffWorkTags().join(", ") + suffix : "";
        setStaffEditDirty(true);
        return;
      }

      const tagMode = event.target.closest("[data-staff-tag-mode]");
      if (tagMode) {
        event.preventDefault();
        const picker = tagMode.closest("[data-staff-tag-picker]");
        if (picker) {
          picker.dataset.tagMode = tagMode.dataset.staffTagMode || "department";
          applyStaffTagFilter();
        }
        return;
      }

      const workGroup = event.target.closest("[data-staff-work-group]");
      if (workGroup) {
        event.preventDefault();
        const department = document.querySelector("#staffForm select[name='department']");
        const label = staffDepartmentLabelByKey(workGroup.dataset.staffWorkGroup);
        if (department && label) {
          const hasCodeOption = Array.from(department.options || []).some(option => option.value === workGroup.dataset.staffWorkGroup);
          department.value = hasCodeOption ? workGroup.dataset.staffWorkGroup : label;
        }
        refreshStaffTagDepartment();
        setStaffEditDirty(true);
        return;
      }

      const removeTag = event.target.closest("[data-staff-tag-remove]");
      if (removeTag) {
        event.preventDefault();
        const tag = removeTag.dataset.staffTagRemove;
        document.querySelectorAll("[data-staff-tag-item] input").forEach(input => {
          if (input.value === tag) input.checked = false;
        });
        setStaffEditDirty(true);
        applyStaffTagFilter();
        return;
      }

      if (event.target.closest("[data-staff-avatar-pick]")) {
        event.preventDefault();
        $("staffAvatarInput")?.click();
        return;
      }

      if (event.target.closest("[data-staff-avatar-remove]")) {
        event.preventDefault();
        const preview = document.querySelector("[data-avatar-preview]");
        const avatarUrl = document.querySelector("[data-avatar-url]");
        const fileInput = document.querySelector("[data-avatar-file]");
        const status = document.querySelector("[data-avatar-status]");
        if (preview) preview.innerHTML = `<span>${escapeHtml(t("noAvatarPreview"))}</span>`;
        if (avatarUrl) avatarUrl.value = "";
        if (fileInput) fileInput.value = "";
        if (status) status.textContent = t("removeImage");
        setStaffEditDirty(true);
        return;
      }

      const statusAction = event.target.closest("[data-staff-status-action]");
      if (statusAction) {
        event.preventDefault();
        event.stopPropagation();
        await updateStaffStatusQuick(statusAction.dataset.staffStatusAction, statusAction.dataset.nextStatus, statusAction);
        return;
      }

      const staffAction = event.target.closest("[data-staff-action]");
      if (staffAction) {
        await handleStaffAction(staffAction.dataset.staffAction, staffAction.dataset.staffId || state.selectedStaff);
        return;
      }

      if (event.target.closest("[data-staff-new]")) {
        renderStaffForm(null);
        return;
      }

      const staffEdit = event.target.closest("[data-staff-edit]");
      if (staffEdit) {
        const staff = state.staff.find(item => getRowId(item) === staffEdit.dataset.staffEdit);
        renderStaffForm(staff);
        return;
      }

      const staffDetail = event.target.closest("[data-staff-detail]");
      if (staffDetail) {
        const staff = state.staff.find(item => getRowId(item) === staffDetail.dataset.staffDetail);
        if (staff) renderStaffDetail(staff);
        return;
      }

      const selectStaff = event.target.closest("[data-select-staff]");
      if (selectStaff) {
        state.selectedStaff = selectStaff.dataset.selectStaff;
        renderStaff();
        return;
      }

      const staffDelete = event.target.closest("[data-staff-delete]");
      if (staffDelete && await confirmAction(t("confirmDelete"))) {
        try {
          await AdminAPI.deleteStaff(staffDelete.dataset.staffDelete);
          await refreshData();
          toast(t("saved"));
        } catch {
          toast(t("failed"));
        }
      }
    });

    bind(document, "submit", async event => {
      const masterForm = event.target.closest("[data-work-master-form]");
      if (masterForm) {
        event.preventDefault();
        try {
          await saveWorkMasterForm(masterForm);
        } catch (error) {
          console.error(error);
          toast(t("failed"));
        }
        return;
      }
      if (event.target.id !== "staffForm") return;
      event.preventDefault();
      const form = event.target;
      if (form.dataset.staffEditDirty !== "true") return;
      const payload = staffFormPayload(form);
      const submit = form.querySelector("button[type='submit']");
      if (submit) {
        submit.disabled = true;
        submit.setAttribute("aria-busy", "true");
      }
      try {
        if (form.dataset.staffId) await AdminAPI.updateStaff(form.dataset.staffId, payload);
        else await AdminAPI.createStaff(payload);
        setStaffEditDirty(false);
        await closeStaffEditForm(true);
        await refreshData();
        toast(t("staffSaved"));
      } catch {
        toast(t("staffSaveFailed"));
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.removeAttribute("aria-busy");
        }
      }
    });

    bind(document, "input", event => {
      if (event.target.closest("[data-request-edit-field]")) {
        setRequestDetailDirty(true);
      }
      if (event.target.closest("[data-staff-work-search]")) {
        renderStaffWorkAssignment({ searchValue: event.target.value, keepSearchFocus: true });
        return;
      }
      if (event.target.closest("#staffForm")) {
        setStaffEditDirty(true);
      }
      if (event.target.closest("[data-staff-tag-search]")) {
        applyStaffTagFilter();
      }
      if (event.target.closest("[data-work-master-search]")) {
        state.filters.workMasterSearch = event.target.value || "";
        renderWorkMaster();
      }
      if (event.target.id === "requestSearch") {
        state.filters.search = event.target.value || "";
      }
      const customerFilter = event.target.closest("[data-customer-filter]");
      if (customerFilter) {
        state.filters["customer" + customerFilter.dataset.customerFilter.charAt(0).toUpperCase() + customerFilter.dataset.customerFilter.slice(1)] = customerFilter.value || "";
        renderCustomerResultsOnly();
      }
      const staffFilter = event.target.closest("[data-staff-filter]");
      if (staffFilter) {
        state.filters["staff" + staffFilter.dataset.staffFilter.charAt(0).toUpperCase() + staffFilter.dataset.staffFilter.slice(1)] = staffFilter.value || "";
        renderStaffResultsOnly();
      }
      const trashSearch = event.target.closest("[data-trash-search]");
      if (trashSearch) {
        state.filters.trashSearch = trashSearch.value || "";
        renderTrash();
      }
    });

    bind(document, "change", event => {
      const customerFilter = event.target.closest("[data-customer-filter]");
      if (customerFilter) {
        state.filters["customer" + customerFilter.dataset.customerFilter.charAt(0).toUpperCase() + customerFilter.dataset.customerFilter.slice(1)] = customerFilter.value || "";
        renderCustomerResultsOnly();
        return;
      }
      const staffFilter = event.target.closest("[data-staff-filter]");
      if (staffFilter) {
        state.filters["staff" + staffFilter.dataset.staffFilter.charAt(0).toUpperCase() + staffFilter.dataset.staffFilter.slice(1)] = staffFilter.value || "";
        renderStaffResultsOnly();
      }
    });
  }

  async function init() {
    console.log("[admin-v2] init start");
    if (!requireAuth()) return;
    try {
      bindEvents();
      renderLayout();
      $("viewRoot").innerHTML = emptyHtml(t("loading"));
      await refreshData();
      console.log("[admin-v2] init done");
    } catch (error) {
      console.error("[admin-v2] init failed", error);
      if ($("viewRoot")) $("viewRoot").innerHTML = showErrorState(error.message || t("failed"));
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
