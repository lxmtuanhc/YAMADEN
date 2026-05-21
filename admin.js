(function () {
  "use strict";

  console.log("[admin-v2] script loaded");

  const ADMIN_TOKEN_KEY = "adminToken";
  const LOGIN_TIME_KEY = "loginTime";
  const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000;
  const ADMIN_PATH = "/admin.html";

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
      quotes: "Báo giá / đề xuất",
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
    quotes: "B\u00e1o gi\u00e1 / \u0111\u1ec1 xu\u1ea5t",
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

  const state = {
    currentView: "dashboard",
    requests: [],
    users: [],
    staff: [],
    quotes: [],
    selectedRequest: null,
    selectedUser: null,
    selectedStaff: null,
    errors: {},
    loading: {
      requests: false,
      users: false,
      staff: false,
      quotes: false
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
      lost: "M\u1ea5t \u0111\u01a1n"
    };
    const cleanLabels = state.lang === "vi" ? cleanLabelsVi : cleanLabelsJa;
    return cleanLabels[normalized] || cleanLabelsJa[normalized] || normalized;
  }

  function getStatusClass(status) {
    return "status-" + normalizeRequestStatus(status);
  }

  function getRequestDisplayId(request) {
    return String(request?.requestCode || request?.requestId || request?.id || request?._id || "-");
  }

  function getCustomerName(request) {
    return request?.name || request?.customerName || request?.userName || "-";
  }

  function getRequestContent(request) {
    return request?.content || request?.description || request?.title || request?.category || "-";
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
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = "";
  }

  function openDrawer(html) {
    const drawer = $("drawer");
    drawer.innerHTML = html;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
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
    const [requests, users, staff, quotes] = await Promise.allSettled([
      AdminAPI.getRequests(),
      AdminAPI.getUsers(),
      AdminAPI.getStaff(),
      AdminAPI.getQuotes()
    ]);
    state.requests = requests.status === "fulfilled" ? normalizeList(requests.value) : [];
    state.users = users.status === "fulfilled" ? normalizeList(users.value) : [];
    state.staff = staff.status === "fulfilled" ? normalizeList(staff.value) : [];
    state.quotes = quotes.status === "fulfilled" ? normalizeList(quotes.value) : [];
    state.errors.requests = requests.status === "rejected" ? requests.reason?.message || "failed" : "";
    state.errors.users = users.status === "rejected" ? users.reason?.message || "failed" : "";
    state.errors.staff = staff.status === "rejected" ? staff.reason?.message || "failed" : "";
    state.errors.quotes = quotes.status === "rejected" ? quotes.reason?.message || "failed" : "";
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
    const activeStaff = state.staff.filter(item => !["off", "inactive", "deleted"].includes(String(item.status || "active")));
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
    return ["all", "untreated", "contacted", "site_done", "quoted", "completed", "lost"];
  }

  function requestBoardStatuses() {
    return ["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
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
    const statuses = ["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
    return `<select class="status-select" data-request-status="${escapeHtml(id)}">${statuses.map(status => `<option value="${status}" ${normalizeRequestStatus(current) === status ? "selected" : ""}>${escapeHtml(formatStatus(status))}</option>`).join("")}</select>`;
  }

  function requestStatusOptions(current) {
    return ["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"]
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
    const type = item.type || item.resourceType || (/(\.mp4|\.mov|\.webm|\.m4v)(\?|$)/i.test(url) ? "video" : "image");
    const attrs = `data-media-preview="${escapeHtml(url)}" data-media-type="${escapeHtml(type)}"`;
    return `<button class="request-media-item" type="button" ${attrs} aria-label="${escapeHtml(t("media"))} ${index + 1}">${type === "video"
      ? `<video src="${escapeHtml(url)}" controls playsinline></video>`
      : `<img src="${escapeHtml(url)}" alt="">`}</button>`;
  }

  function renderRequestDetail(request) {
    const id = getRowId(request);
    const media = normalizeRequestMedia(request);
    const timeline = Array.isArray(request.timeline) ? request.timeline : [];
    const suggestion = recommendAssignee(request);
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
              <div class="info-item wide"><b>${escapeHtml(t("content"))}</b><span>${escapeHtml(getRequestContent(request) || "-")}</span></div>
              <div class="info-item wide"><b>${escapeHtml(t("issueTags"))}</b><span>${escapeHtml(Array.isArray(request.issueTags) ? request.issueTags.join(", ") : "-")}</span></div>
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
              <section class="assign-suggestion">
                <div>
                  <strong>${escapeHtml(t("suggestAssignee"))}</strong>
                  <p class="note">${suggestion ? `${escapeHtml(suggestion.staff.name || "-")} - ${escapeHtml(t("assigneeReason"))}: ${escapeHtml(suggestion.matched.join(", "))}` : escapeHtml(t("noAssigneeSuggestion"))}</p>
                </div>
                ${suggestion ? `<button class="btn btn-soft" type="button" data-apply-assignee="${escapeHtml(id)}" data-staff-id="${escapeHtml(getRowId(suggestion.staff))}">${escapeHtml(t("applyAssignee"))}</button>` : ""}
              </section>
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
      .concat(toList(staff?.skills))
      .concat(toList(staff?.workContent))
      .concat(toList(staff?.areas))
      .concat(toList(staff?.department));
    return [...new Set(raw.map(item => String(item || "").trim()).filter(Boolean))];
  }

  function activeAssignmentCount(staff) {
    const id = getRowId(staff);
    return state.requests.filter(request => {
      const status = normalizeRequestStatus(request.status);
      return !["completed", "lost"].includes(status)
        && (String(request.assigneeId || "") === id || getAssigneeName(request) === staff.name);
    }).length;
  }

  function recommendAssignee(request) {
    const reqTags = requestTags(request);
    const normalizedReqTags = reqTags.map(normalizeTag).filter(Boolean);
    let best = null;
    state.staff.filter(staff => !["off", "inactive", "deleted"].includes(String(staff.status || "active"))).forEach(staff => {
      const tags = staffTags(staff);
      const normalizedStaffTags = tags.map(normalizeTag);
      const matched = reqTags.filter((tag, index) => {
        const normalized = normalizedReqTags[index];
        return normalized && normalizedStaffTags.some(staffTag => staffTag === normalized || staffTag.includes(normalized) || normalized.includes(staffTag));
      });
      const workload = activeAssignmentCount(staff);
      const score = matched.length * 100 - workload;
      const candidate = { staff, matched: [...new Set(matched)], workload, score };
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
    return compactText(staff?.department || staff?.areas);
  }

  function staffRole(staff) {
    return compactText(staff?.role || staff?.position || staff?.title);
  }

  function filterStaff() {
    const search = state.filters.staffSearch || "";
    const dept = state.filters.staffDepartment || "all";
    const status = state.filters.staffStatus || "all";
    const sort = state.filters.staffSort || "name";
    const assignedFilter = state.filters.staffAssigned || "all";
    return [...state.staff].filter(staff => {
      const deptText = staffDepartment(staff);
      const statusText = staff.status || "active";
      if (statusText === "deleted" || staff.deletedAt) return false;
      const text = [staff.name, staff.email, staff.phone, deptText, staffRole(staff), staff.workContent, staffTags(staff).join(" ")].join(" ").toLowerCase();
      const assigned = activeAssignmentCount(staff);
      const assignedOk = assignedFilter === "all" || (assignedFilter === "has" ? assigned > 0 : assigned === 0);
      return (dept === "all" || deptText === dept) && (status === "all" || statusText === status) && assignedOk && text.includes(search.toLowerCase());
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

  function renderStaff() {
    if (state.loading.staff) {
      $("viewRoot").innerHTML = `<div class="loading-state">${escapeHtml(t("loading"))}</div>`;
      return;
    }
    if (state.errors.staff) {
      $("viewRoot").innerHTML = showErrorState(state.lang === "vi" ? "Không thể tải staff" : "スタッフ一覧を読み込めません");
      return;
    }
    const rows = filterStaff();
    const departments = [...new Set(state.staff.map(staffDepartment).filter(value => value && value !== "-"))];
    const allTags = state.staff.flatMap(staff => staffTags(staff));
    const selected = state.selectedStaff ? rows.find(staff => String(getRowId(staff)) === String(state.selectedStaff)) : null;
    if (state.selectedStaff && !selected) state.selectedStaff = "";
    const visibleStaff = state.staff.filter(staff => String(staff.status || "active") !== "deleted" && !staff.deletedAt);
    const activeStaff = visibleStaff.filter(staff => !["off", "inactive"].includes(String(staff.status || "active")));
    const assignedStaffCount = activeStaff.filter(staff => activeAssignmentCount(staff) > 0).length;
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("staffSubtitle"))}</p></div>
      <div class="toolbar demo-actions"><button class="btn btn-soft" disabled>CSV ${escapeHtml(t("export"))}</button><button class="primary-button" type="button" data-staff-action="add">+ ${escapeHtml(t("addStaff"))}</button></div>
      <div class="kpi-grid kpi-grid-small">
        ${statCard(t("staffCount"), visibleStaff.length, t("realData"), "info")}
        ${statCard(t("active"), activeStaff.length, t("realData"), "success")}
        ${statCard(t("currentAssignments"), assignedStaffCount, t("realData"), "warning")}
        ${statCard(t("off"), state.staff.filter(staff => ["off", "inactive"].includes(staff.status)).length, t("realData"), "danger")}
        ${statCard(t("departments"), departments.length, t("realData"), "total")}
        ${statCard(t("totalTags"), new Set(allTags).size, t("realData"), "info")}
      </div>
      <div class="crm-filter-bar staff-filter-bar">
        <input class="filter-input" data-staff-search data-staff-filter="search" value="${escapeHtml(state.filters.staffSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
        <select class="filter-input" data-staff-filter="department"><option value="all">${escapeHtml(t("allDepartments"))}</option>${departments.map(item => `<option value="${escapeHtml(item)}" ${state.filters.staffDepartment === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="status"><option value="all">${escapeHtml(t("statusFilter"))}</option>${["active", "busy", "off", "inactive"].map(status => `<option value="${status}" ${state.filters.staffStatus === status ? "selected" : ""}>${escapeHtml(staffStatusMap[status] || status)}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="assigned"><option value="all">${escapeHtml(t("currentAssignments"))}</option><option value="has" ${state.filters.staffAssigned === "has" ? "selected" : ""}>${escapeHtml(t("currentAssignments"))}</option><option value="none" ${state.filters.staffAssigned === "none" ? "selected" : ""}>${escapeHtml(t("noData"))}</option></select>
        <select class="filter-input" data-staff-filter="sort">
          <option value="name" ${(state.filters.staffSort || "name") === "name" ? "selected" : ""}>${escapeHtml(t("sortName"))}</option>
          <option value="workload" ${state.filters.staffSort === "workload" ? "selected" : ""}>${escapeHtml(t("workload"))}</option>
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
    const assigned = state.requests.filter(request => String(request.assigneeId || request.assignedStaffId || "") === String(id) || getAssigneeName(request) === staff.name).length;
    const workload = assigned ? Math.min(95, 30 + assigned * 8) : 0;
    const isSelected = selected && String(getRowId(selected)) === String(id);
    return `<tr class="${isSelected ? "selected-row" : ""}">
      <td><div class="identity-cell">${avatarHtml(staff)}<div><strong>${escapeHtml(staff.name || "-")}</strong><span>${escapeHtml(staff.email || staff.phone || "-")}</span></div></div></td>
      <td>${escapeHtml(staffRole(staff))}<div class="subtext">${escapeHtml(staffDepartment(staff))}</div></td>
      <td>${tagChips(staffTags(staff), 3)}<div class="subtext text-clamp-1">${escapeHtml(staff.workContent || "")}</div></td>
      <td>${assigned}</td>
      <td><div class="progress-cell"><span style="width:${workload}%"></span></div><small>${workload}%</small></td>
      <td><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></td>
      <td><div class="actions crm-actions">
        <button class="btn btn-soft" type="button" data-staff-action="detail" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
      </div></td>
    </tr>`;
  }

  function renderStaffTableHtml(rows, selected) {
    return rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table staff-table"><thead><tr><th>${t("staff")}</th><th>${t("role")} / ${t("department")}</th><th>${t("skillsWork")}</th><th>${t("assignedCount")}</th><th>${t("workload")}</th><th>${t("status")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(staff => renderStaffRow(staff, selected)).join("")}</tbody></table></div>` : showEmptyState();
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
    const isPaused = ["off", "inactive"].includes(status);
    const isDeleted = status === "deleted" || staff.deletedAt;
    const actionButtons = isDeleted
      ? `<button class="btn btn-soft" type="button" data-staff-action="restore" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("restore"))}</button><button class="btn btn-danger" type="button" data-staff-action="permanent-delete" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("permanentDelete"))}</button>`
      : `<button class="btn btn-soft" type="button" data-staff-action="edit" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("editStaffProfile"))}</button><button class="btn btn-soft" type="button" data-staff-action="${isPaused ? "activate" : "pause"}" data-staff-id="${escapeHtml(id)}">${escapeHtml(isPaused ? t("reactivateStaff") : t("pauseStaff"))}</button><button class="btn btn-danger" type="button" data-staff-action="delete" data-staff-id="${escapeHtml(id)}">${escapeHtml(t("delete"))}</button>`;
    return `<aside class="detail-panel staff-detail-panel">
      <div class="detail-panel-head">
        ${avatarHtml(staff, "avatar-large")}
        <div><h2>${escapeHtml(staff.name || "-")}</h2><p>${escapeHtml(staff.email || "")}</p><p>ID: ${escapeHtml(id || "-")}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></div>
        <button class="close-button" type="button" data-staff-action="close-detail" aria-label="${escapeHtml(t("close"))}">&times;</button>
      </div>
      <section><h3>${escapeHtml(t("staffBasicInfo"))}</h3><div class="contact-grid">
        ${infoItem(t("staffId"), id)}
        ${infoItem(t("name"), staff.name)}
        ${infoItem(t("email"), staff.email)}
        ${infoItem(t("phone"), staff.phone)}
        ${infoItem(t("status"), staffStatusMap[status] || status)}
        ${infoItem(t("createdAt"), formatDate(staff.createdAt))}
        ${staff.updatedAt ? infoItem(t("updatedAt"), formatDate(staff.updatedAt)) : ""}
      </div></section>
      <section><h3>${escapeHtml(t("staffDepartmentRole"))}</h3><div class="contact-grid">
        ${infoItem(t("department"), staffDepartment(staff))}
        ${infoItem(t("role"), staffRole(staff))}
        ${infoItem(t("province"), staff.areas)}
        ${infoItem(t("workContent"), staff.workContent)}
      </div></section>
      <section><h3>${escapeHtml(t("staffSkillsWork"))}</h3>${tagChips(staffTags(staff))}</section>
      <section><h3>${escapeHtml(t("staffCurrentWorkload"))}</h3><div class="mini-kpi-row">${miniMetric(t("currentAssignments"), assignedActive.length)}${miniMetric(t("workload"), workload + "%")}${miniMetric(t("overdueAssigned"), overdue)}</div><div class="priority-list">${assignedActive.length ? assignedActive.slice(0, 4).map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getCustomerName(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState(t("noAssignedRequests"))}</div></section>
      <section><h3>${escapeHtml(t("staffAutoAssign"))}</h3><div class="contact-grid">${infoItem(t("status"), isPaused || isDeleted ? t("off") : t("active"))}${infoItem(t("workTags"), staffTags(staff).join(", "))}${infoItem(t("department"), staffDepartment(staff))}${infoItem(t("workload"), workload + "%")}</div><p class="note">${escapeHtml(t("autoAssignPlanned"))}</p></section>
      <section><h3>${escapeHtml(t("staffRecentHistory"))}</h3><div class="priority-list">${assigned.length ? assigned.map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getCustomerName(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState(t("noStaffHistory"))}</div></section>
      <section><h3>${escapeHtml(t("staffOperations"))}</h3><div class="modal-actions">${actionButtons}</div></section>
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
    const infoFields = [
      [t("name"), staff.name],
      [t("phone"), staff.phone],
      [t("email"), staff.email],
      [t("department"), staff.department],
      ["Role", staff.role],
      ["Position", staff.position],
      ["Title", staff.title],
      [t("status"), staffStatusMap[status] || status],
      [t("note"), staff.note],
      ["Introduction", staff.introduction],
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
          ${activeTab === "work" ? `<section class="work-detail"><h3>${escapeHtml(t("workContent"))}</h3><p>${escapeHtml(staff.workContent || "-")}</p><h3>${escapeHtml(t("workTags"))}</h3>${tagChips(staff.workTags)}<h3>Skills</h3>${tagChips(staff.skills)}<h3>Areas</h3>${tagChips(staff.areas)}</section>` : ""}
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

  function staffDepartmentOptions(current) {
    const base = state.lang === "vi"
      ? ["B\u1ed9 thi\u1ebft k\u1ebf", "B\u1ed9 thi c\u00f4ng", "B\u1ed9 kh\u1ea3o s\u00e1t", "B\u1ed9 b\u1ea3o tr\u00ec", "B\u1ed9 kinh doanh", "B\u1ed9 nghi\u1ec7p v\u1ee5", "B\u1ed9 kh\u00e1c"]
      : ["\u8a2d\u8a08\u90e8", "\u5de5\u52d9\u90e8", "\u55b6\u696d\u90e8", "\u4fdd\u5168\u90e8", "\u696d\u52d9\u90e8", "\u305d\u306e\u4ed6"];
    return optionPool(base.concat(state.staff.map(staffDepartment)), current);
  }

  function staffTagOptions(current) {
    const base = state.lang === "vi"
      ? ["Thi\u1ebft k\u1ebf b\u1ea3n v\u1ebd", "Ch\u1ec9nh s\u1eeda b\u1ea3n v\u1ebd", "Thi\u1ebft k\u1ebf s\u01a1 \u0111\u1ed3 \u0111i\u1ec7n", "V\u1ebd CAD", "Kh\u1ea3o s\u00e1t hi\u1ec7n tr\u01b0\u1eddng", "B\u00e1o gi\u00e1", "Thi c\u00f4ng", "B\u1ea3o tr\u00ec"]
      : ["\u56f3\u9762\u8a2d\u8a08", "\u56f3\u9762\u4fee\u6b63", "\u96fb\u6c17\u56f3\u9762\u8a2d\u8a08", "CAD\u4f5c\u56f3", "\u73fe\u5730\u8abf\u67fb", "\u898b\u7a4d", "\u65bd\u5de5", "\u4fdd\u5168"];
    return optionPool(base.concat(state.staff.flatMap(staffTags)), current);
  }

  function staffStatusLabel(status) {
    const labels = state.lang === "vi"
      ? { active: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", off: "Ngh\u1ec9 / off", deleted: "\u0110\u00e3 x\u00f3a" }
      : { active: "\u7a3c\u50cd\u4e2d", off: "\u4f11\u6b62\u4e2d", deleted: "\u524a\u9664\u6e08\u307f" };
    return labels[status] || staffStatusMap[status] || status || "-";
  }

  function renderSelectOptions(options, selected, placeholder) {
    const selectedValue = compactText(selected, "");
    const normalized = optionPool(options, selectedValue);
    return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ""}${normalized.map(value => `<option value="${escapeHtml(value)}" ${String(value) === String(selectedValue) ? "selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
  }

  function staffTextField(name, label, value, type = "text", extra = "") {
    return `<label class="staff-edit-field"><span>${escapeHtml(label)}</span><input name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value || "")}" ${extra}></label>`;
  }

  function staffTextareaField(name, label, value) {
    return `<label class="staff-edit-field full"><span>${escapeHtml(label)}</span><textarea name="${escapeHtml(name)}">${escapeHtml(value || "")}</textarea></label>`;
  }

  function staffSelectField(name, label, options, selected) {
    return `<label class="staff-edit-field"><span>${escapeHtml(label)}</span><select name="${escapeHtml(name)}">${renderSelectOptions(options, selected)}</select></label>`;
  }

  function staffTagPickerField(name, label, options, selected) {
    const selectedSet = new Set(toList(selected).map(item => item.toLowerCase()));
    const html = optionPool(options, selected).map((tag, index) => {
      const id = `${name}-${normalizeTag(tag) || "tag"}-${index}`;
      return `<label class="staff-tag-option" for="${escapeHtml(id)}"><input id="${escapeHtml(id)}" type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(tag)}" ${selectedSet.has(tag.toLowerCase()) ? "checked" : ""}><span>${escapeHtml(tag)}</span></label>`;
    }).join("");
    return `<div class="staff-edit-field full"><span>${escapeHtml(label)}</span><div class="staff-tag-picker">${html || `<span class="muted-dash">-</span>`}</div></div>`;
  }

  function renderStaffForm(staff) {
    const item = staff || {};
    const id = getRowId(item);
    const avatar = item.avatar || "";
    const statusOptions = ["active", "off"];
    const selectedStatus = ["off", "inactive"].includes(String(item.status || "")) ? "off" : "active";
    const mergedTags = uniqueOptions([].concat(toList(item.skills)).concat(toList(item.workTags)));
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
                  </div>
                </section>

                <section class="staff-edit-section">
                  <h3>${escapeHtml(t("staffOrganization"))}</h3>
                  <div class="staff-edit-grid">
                    ${staffSelectField("department", t("department"), staffDepartmentOptions(item.department), item.department)}
                    <label class="staff-edit-field"><span>${escapeHtml(t("status"))}</span><select name="status">${statusOptions.map(status => `<option value="${status}" ${selectedStatus === status ? "selected" : ""}>${escapeHtml(staffStatusLabel(status))}</option>`).join("")}</select></label>
                  </div>
                </section>
              </div>

              <div class="staff-edit-column">
                <section class="staff-edit-section">
                  <h3>${escapeHtml(t("staffAssignableWork"))}</h3>
                  <div class="staff-edit-grid">
                    ${staffTagPickerField("workTags", t("workTags"), staffTagOptions(mergedTags), mergedTags)}
                    ${staffTextareaField("workContent", t("workContent"), item.workContent)}
                  </div>
                </section>

                <section class="staff-edit-section">
                  <h3>${escapeHtml(t("internalMemo"))}</h3>
                  <div class="staff-edit-grid">
                    ${staffTextareaField("note", t("internalMemo"), item.note)}
                  </div>
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

  function renderSettings() {
    const items = ["automationGoal", "settingsSla", "settingsAssign", "settingsUrgency", "settingsNotice", "roles", "companyInfo", "dataApi", "settingsColor"];
    $("viewRoot").innerHTML = `<div class="settings-grid settings-demo-grid">${items.map(key => `<section class="settings-card"><div class="settings-card-head"><h2>${escapeHtml(t(key))}</h2><span class="status-badge status-quoted">${escapeHtml(t("preparing"))}</span></div><div class="settings-placeholder"><label>${escapeHtml(t("status"))}</label><div class="placeholder-input">${escapeHtml(t("planned"))}</div><label>${escapeHtml(t("settingsSystem"))}</label><button class="btn btn-soft" type="button" disabled>${escapeHtml(t("planned"))}</button></div><p class="note">${escapeHtml(t("kpiPlanned"))}</p></section>`).join("")}</div>`;
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
    const response = await AdminAPI.updateRequest(id, {
      status,
      adminReply: reply,
      assigneeId: staff ? getRowId(staff) : "",
      assigneeName: staff ? staff.name || "" : "",
      urgency: urgency === "none" ? "" : urgency,
      dueAt,
      amount
    });
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

  async function refreshData() {
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
        if (!await confirmAction({ title: t("pauseStaff"), confirmLabel: t("pauseStaff"), variant: "warning" })) return;
        response = await AdminAPI.updateStaff(id, { status: "off" });
      }
      if (action === "activate") {
        if (!await confirmAction({ title: t("reactivateStaff"), confirmLabel: t("reactivateStaff") })) return;
        response = await AdminAPI.updateStaff(id, { status: "active" });
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
    ["name", "phone", "email", "department", "workContent", "note", "status"].forEach(field => {
      payload.set(field, raw.get(field) || "");
    });
    const workTags = raw.getAll("workTags").map(item => String(item || "").trim()).filter(Boolean);
    if (workTags.length) workTags.forEach(tag => payload.append("workTags", tag));
    else payload.set("workTags", "");
    payload.set("avatar", raw.get("avatar") || "");
    const file = raw.get("avatarFile");
    if (file && file.size > 0) payload.set("avatar", file);
    return payload;
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
    bind($("viewRoot"), "click", handleRequestViewClick);
    bind($("viewRoot"), "change", handleRequestViewChange);
    bind($("viewRoot"), "input", event => {
      if (handleRequestViewInput(event)) event.stopPropagation();
    });
    bind($("viewRoot"), "keydown", event => {
      if (event.target.id === "requestSearch" && event.key === "Enter") {
        event.preventDefault();
        state.filters.search = event.target.value || "";
        renderRequestResults();
      }
    });
    document.addEventListener("click", event => {
      void handleTrashDelegatedClick(event);
    }, true);
    document.addEventListener("click", event => {
      void handleStaffDelegatedClick(event);
    }, true);
    document.addEventListener("click", event => {
      void handleCustomerDelegatedClick(event);
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
        closeDrawer();
      }
    });

    bind(document, "change", async event => {
      const staffForm = event.target.closest("#staffForm");
      if (staffForm) {
        setStaffEditDirty(true);
        if (event.target.closest("[data-avatar-file]")) {
          const file = event.target.files && event.target.files[0];
          if (file) previewStaffAvatar(file);
        }
        return;
      }
      if (event.target.closest("[data-request-edit-field]")) {
        setRequestDetailDirty(true);
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

      const trashCategory = event.target.closest("[data-trash-category]");
      if (trashCategory) {
        state.filters.trashCategory = trashCategory.dataset.trashCategory || "customers";
        renderTrash();
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
            assigneeName: staff.name || ""
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
      if (event.target.closest("#staffForm")) {
        setStaffEditDirty(true);
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
