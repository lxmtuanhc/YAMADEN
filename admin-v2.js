(function () {
  "use strict";

  const ADMIN_TOKEN_KEY = "adminToken";
  const LOGIN_TIME_KEY = "loginTime";

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
    staffPreview: "\u30b9\u30bf\u30c3\u30d5\u7a3c\u50cd\u72b6\u6cc1",
    tableView: "\u8868",
    kanbanView: "\u30ab\u30f3\u30d0\u30f3",
    newest: "\u65b0\u3057\u3044\u9806",
    oldest: "\u53e4\u3044\u9806",
    prioritySort: "\u512a\u5148\u9806",
    overdueFirst: "\u671f\u9650\u8d85\u904e\u512a\u5148",
    urgency: "\u7dca\u6025\u5ea6",
    unjudged: "\u672a\u5224\u5b9a",
    media: "\u30e1\u30c7\u30a3\u30a2",
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
    staffPreview: "T\u1ea3i staff",
    tableView: "B\u1ea3ng",
    kanbanView: "Kanban",
    newest: "M\u1edbi nh\u1ea5t",
    oldest: "C\u0169 nh\u1ea5t",
    prioritySort: "\u01afu ti\u00ean x\u1eed l\u00fd",
    overdueFirst: "Qu\u00e1 h\u1ea1n tr\u01b0\u1edbc",
    urgency: "\u0110\u1ed9 kh\u1ea9n",
    unjudged: "Ch\u01b0a \u0111\u00e1nh gi\u00e1",
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
    detailFilter: "\u8a73\u7d30\u30d5\u30a3\u30eb\u30bf\u30fc",
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
    detailFilter: "Bộ lọc chi tiết",
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
    ordered: "Nh\u1eadn \u0111\u01a1n",
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
    ["settings", "settings", "⚙"]
  ];

  const state = {
    currentView: "dashboard",
    requests: [],
    users: [],
    staff: [],
    selectedRequest: null,
    selectedUser: null,
    selectedStaff: null,
    errors: {},
    filters: {
      requestStatus: "all",
      search: "",
      staff: "all",
      urgency: "all",
      sort: "priority",
      requestViewMode: "table"
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

  async function requestJson(url, options) {
    const response = await fetch(url, Object.assign({ cache: "no-store" }, options || {}, {
      headers: authHeaders((options && options.headers) || {})
    }));
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error("Unauthorized");
    }
    if (!response.ok) throw new Error("API failed: " + response.status);
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
    async getUsers() {
      try {
        return await requestJson("/api/admin/users");
      } catch (error) {
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
      return requestJson("/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    },
    updateStaff(id, payload) {
      return requestJson("/admin/staff/" + encodeURIComponent(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
    },
    deleteStaff(id) {
      return requestJson("/admin/staff/" + encodeURIComponent(id), { method: "DELETE" });
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
    const labels = state.lang === "vi" ? requestStatusMapVi : requestStatusMap;
    return labels[normalized] || requestStatusMap[normalized] || normalized;
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
    return collectMedia(request).length;
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
      if (sort === "overdue") return Number(isOverdue(right)) - Number(isOverdue(left)) || getPriorityScore(right) - getPriorityScore(left);
      if (sort === "priority") return getPriorityScore(right) - getPriorityScore(left) || new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
    });
  }

  function filterRequests(items) {
    const search = state.filters.search.toLowerCase();
    return items.filter(item => {
      const statusOk = state.filters.requestStatus === "all" || normalizeRequestStatus(item.status) === state.filters.requestStatus;
      const staffOk = state.filters.staff === "all" || String(item.assigneeId || item.assigneeName || "") === state.filters.staff;
      const urgency = getUrgency(item) || "none";
      const urgencyOk = state.filters.urgency === "all" || urgency === state.filters.urgency;
      const text = [getRequestDisplayId(item), getCustomerName(item), getRequestContent(item), getRequestPhone(item), item.address, getAssigneeName(item)].join(" ").toLowerCase();
      return statusOk && staffOk && urgencyOk && text.includes(search);
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
    el.textContent = message;
    el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 1800);
  }

  function logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    window.location.href = "/login.html";
  }

  function requireAuth() {
    if (!token()) {
      window.location.href = "/login.html";
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

  function confirmAction(message) {
    return new Promise(resolve => {
      openDrawer(`
        <article class="drawer-panel" style="max-width:420px">
          <header class="drawer-head">
            <div><h2>${escapeHtml(message)}</h2></div>
            <button class="close-button" type="button" data-confirm-no>×</button>
          </header>
          <div class="drawer-body">
            <div class="actions">
              <button class="ghost-button" type="button" data-confirm-no>${escapeHtml(t("close"))}</button>
              <button class="danger-button" type="button" data-confirm-yes>${escapeHtml(t("delete"))}</button>
            </div>
          </div>
        </article>
      `);
      window.__adminV2ConfirmResolve = resolve;
    });
  }

  function renderLayout() {
    document.documentElement.lang = state.lang;
    const untreatedCount = state.requests.filter(item => normalizeRequestStatus(item.status) === "untreated").length;
    const pendingUserCount = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length;
    const warningCount = state.requests.filter(isOverdue).length + pendingUserCount;
    const badgeByView = { requests: untreatedCount, customers: pendingUserCount, notifications: warningCount };
    $("globalSearch").placeholder = t("search");
    $("languageSelect").value = state.lang;
    $("logoutButton").textContent = t("logout");
    $("refreshButton").textContent = t("refresh");
    $("sideNav").innerHTML = views.map(([view, labelKey, icon]) => `
      <button class="nav-item ${state.currentView === view ? "active" : ""}" type="button" data-view="${view}">
        <span class="nav-icon">${icon}</span>
        <span>${escapeHtml(navLabel(view, labelKey))}</span>
        ${badgeByView[view] ? `<span class="nav-badge">${badgeByView[view]}</span>` : ""}
      </button>
    `).join("");
    $("viewTitle").textContent = t(state.currentView);
    $("viewEyebrow").textContent = state.currentView === "dashboard" ? "YAMADEN ADMIN" : t(state.currentView).toUpperCase();
  }

  function navLabel(view, fallbackKey) {
    const ja = {
      dashboard: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
      requests: "\u4f9d\u983c\u7ba1\u7406",
      customers: "\u9867\u5ba2\u7ba1\u7406",
      staff: "\u30b9\u30bf\u30c3\u30d5\u7ba1\u7406",
      quotes: "\u898b\u7a4d\u30fb\u63d0\u6848",
      notifications: "\u901a\u77e5",
      settings: "\u8a2d\u5b9a"
    };
    const vi = {
      dashboard: "Dashboard",
      requests: "Y\u00eau c\u1ea7u",
      customers: "Kh\u00e1ch h\u00e0ng",
      staff: "Staff",
      quotes: "B\u00e1o gi\u00e1",
      notifications: "Th\u00f4ng b\u00e1o",
      settings: "C\u00e0i \u0111\u1eb7t"
    };
    return (state.lang === "vi" ? vi[view] : ja[view]) || t(fallbackKey);
  }

  async function loadAll() {
    const [requests, users, staff] = await Promise.allSettled([
      AdminAPI.getRequests(),
      AdminAPI.getUsers(),
      AdminAPI.getStaff()
    ]);
    state.requests = requests.status === "fulfilled" ? normalizeList(requests.value) : [];
    state.users = users.status === "fulfilled" ? normalizeList(users.value) : [];
    state.staff = staff.status === "fulfilled" ? normalizeList(staff.value) : [];
    state.errors.requests = requests.status === "rejected" ? requests.reason?.message || "failed" : "";
    state.errors.users = users.status === "rejected" ? users.reason?.message || "failed" : "";
    state.errors.staff = staff.status === "rejected" ? staff.reason?.message || "failed" : "";
  }

  function normalizeList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.requests)) return payload.requests;
    if (Array.isArray(payload?.staff)) return payload.staff;
    return [];
  }

  function renderCurrentView() {
    renderLayout();
    const map = {
      dashboard: renderDashboard,
      requests: renderRequests,
      customers: renderCustomers,
      staff: renderStaff,
      quotes: renderQuotes,
      notifications: renderNotifications,
      settings: renderSettings
    };
    (map[state.currentView] || renderDashboard)();
  }

  function renderDashboard() {
    const untreated = state.requests.filter(item => normalizeRequestStatus(item.status) === "untreated");
    const overdue = state.requests.filter(isOverdue);
    const quoted = state.requests.filter(item => normalizeRequestStatus(item.status) === "quoted");
    const ordered = state.requests.filter(item => normalizeRequestStatus(item.status) === "ordered");
    const pendingUsers = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending");
    const activeStaff = state.staff.filter(item => !["off", "inactive", "deleted"].includes(String(item.status || "active")));
    const priority = sortRequests(state.requests
      .filter(item => !["completed", "lost"].includes(normalizeRequestStatus(item.status)))
      .filter(item => ["untreated", "contacted", "site_done", "quoted"].includes(normalizeRequestStatus(item.status)) || getPriorityScore(item) > 0))
      .slice(0, 6);
    $("viewRoot").innerHTML = `
      <div class="page-intro">
        <p>${escapeHtml(t("operationCenter"))} - ${escapeHtml(t("dashboardSubtitle"))}</p>
      </div>
      <div class="kpi-grid">
        ${statCard(t("totalRequests"), state.requests.length, t("realData"), "total")}
        ${statCard(t("untreated"), untreated.length, t("realData"), "danger")}
        ${statCard(t("overdue"), overdue.length, t("realData"), "warning")}
        ${statCard(t("customersCount"), state.users.length, t("realData"), "info")}
        ${statCard(t("staffCount"), state.staff.length, activeStaff.length + " active", "success")}
        ${statCard(t("quotingCount"), quoted.length, t("realData"), "warning")}
        ${statCard(t("quoteRate"), quoted.length ? Math.round(ordered.length / Math.max(quoted.length, 1) * 100) + "%" : "-", quoted.length ? t("realData") : t("planned"), "success")}
        ${statCard(t("firstResponse"), "-", t("planned"), "info")}
      </div>
      <div class="dashboard-grid">
        <section class="section-card dashboard-main">
          <div class="panel-head"><h2>${escapeHtml(t("priorityRequests"))}</h2><button class="mini-button" type="button" data-view="requests">${escapeHtml(t("all"))} →</button></div>
          <div class="panel-body">
            ${priority.length ? `<div class="table-wrap table-card compact-table-wrap"><table class="data-table operation-table"><thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("urgency")}</th><th>${t("assignee")}</th><th>${t("status")}</th><th>${t("elapsed")}</th><th>${t("deadline")}</th></tr></thead><tbody>${priority.map(renderPriorityRequest).join("")}</tbody></table></div>` : showEmptyState(t("noPriorityRequests"))}
          </div>
        </section>
        <aside class="section-card">
          <div class="panel-head"><h2>${escapeHtml(t("aiPanel"))}</h2></div>
          <div class="panel-body ai-list">
            ${[t("aiUrgency"), t("aiAssign"), t("aiPriority")].map(label => `<div class="ai-item"><span>${escapeHtml(label)}</span><b>${escapeHtml(t("preparing"))}</b></div>`).join("")}
          </div>
          <div class="panel-head"><h2>${escapeHtml(t("quickActions"))}</h2></div>
          <div class="panel-body quick-actions">
            ${[t("createRequest"), t("assignStaffAction"), t("createQuote"), t("addNote")].map(label => `<button class="btn btn-soft" disabled>${escapeHtml(label)}</button>`).join("")}
          </div>
        </aside>
        <section class="section-card">
          <div class="panel-head"><h2>${escapeHtml(t("customerPreview"))}</h2></div>
          <div class="panel-body priority-list">
            ${pendingUsers.length ? pendingUsers.slice(0, 4).map(user => `<div class="compact-row"><strong>${escapeHtml(user.name || user.phone || "-")}</strong><span>${escapeHtml(user.phone || "")}</span><span class="status-badge status-pendingApproval">${escapeHtml(userStatusMap[user.status] || user.status)}</span></div>`).join("") : showEmptyState()}
          </div>
        </section>
        <section class="section-card">
          <div class="panel-head"><h2>${escapeHtml(t("staffPreview"))}</h2></div>
          <div class="panel-body priority-list">
            ${state.staff.length ? state.staff.slice(0, 4).map(staff => `<div class="compact-row"><strong>${escapeHtml(staff.name || "-")}</strong><span>${escapeHtml(staff.department || staff.areas || staff.workContent || "")}</span><span class="status-badge status-${escapeHtml(staff.status || "active")}">${escapeHtml(staffStatusMap[staff.status || "active"] || staff.status || "active")}</span></div>`).join("") : showEmptyState()}
          </div>
        </section>
      </div>
    `;
  }

  function statCard(label, value, helper, tone) {
    return `<div class="kpi-card kpi-${escapeHtml(tone || "total")}"><div class="kpi-icon"></div><span class="stat-label">${escapeHtml(label)}</span><strong class="stat-value">${escapeHtml(value)}</strong><small>${escapeHtml(helper || "")}</small></div>`;
  }

  function miniMetric(label, value) {
    return `<div class="mini-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
  }

  function renderPriorityRequest(item) {
    const id = getRowId(item);
    const urgency = getUrgency(item);
    return `<tr data-request-detail="${escapeHtml(id)}">
      <td><strong>${escapeHtml(getRequestDisplayId(item))}</strong></td>
      <td>${escapeHtml(getCustomerName(item))}</td>
      <td><div class="text-clamp-1">${escapeHtml(getRequestContent(item))}</div></td>
      <td>${urgency ? `<span class="urgency-badge urgency-${escapeHtml(urgency)}">${escapeHtml(urgency)}</span>` : `<span class="muted-dash">-</span>`}</td>
      <td>${escapeHtml(getAssigneeName(item))}</td>
      <td><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td>${escapeHtml(computeWaitingTime(item))}</td>
      <td>${escapeHtml(getDeadline(item) ? formatDateTime(getDeadline(item)) : "-")}</td>
    </tr>`;
  }

  function emptyHtml(message) {
    return `<div class="empty">${escapeHtml(message || t("noData"))}</div>`;
  }

  function renderRequests() {
    const statuses = ["all", "untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
    const filtered = sortRequests(filterRequests(state.requests));
    const staffOptions = state.staff.map(staff => `<option value="${escapeHtml(getRowId(staff) || staff.name || "")}">${escapeHtml(staff.name || "-")}</option>`).join("");
    if (state.errors.requests) {
      $("viewRoot").innerHTML = showErrorState(t("loadRequestsError"));
      return;
    }
    $("viewRoot").innerHTML = `
      <div class="page-intro">
        <p>${escapeHtml(t("requestSubtitle"))}</p>
      </div>
      <div class="request-command-bar demo-actions">
        <button class="btn btn-soft" disabled>${escapeHtml(t("export"))}</button>
        <button class="btn btn-primary" disabled>+ ${escapeHtml(t("newRequest"))}</button>
        <div class="segmented">
          <button class="active" type="button" data-view-mode="table">${escapeHtml(t("tableFormat"))}</button>
          <button type="button" data-view-mode="kanban">${escapeHtml(t("kanbanView"))}</button>
        </div>
      </div>
      <div class="chips status-filter-row">
        ${statuses.map(status => {
          const count = status === "all" ? state.requests.length : state.requests.filter(item => normalizeRequestStatus(item.status) === status).length;
          return `<button class="filter-chip ${state.filters.requestStatus === status ? "active" : ""}" type="button" data-request-filter="${status}"><span>${escapeHtml(status === "all" ? t("all") : formatStatus(status))}</span><b>${count}</b></button>`;
        }).join("")}
      </div>
      <div class="filter-bar">
        <input id="requestSearch" class="filter-input" value="${escapeHtml(state.filters.search)}" placeholder="${escapeHtml(t("search"))}" />
        <button class="filter-input filter-button" type="button" disabled>${escapeHtml(t("detailFilter"))}</button>
        <select class="filter-input" data-filter-select="staff"><option value="all">${escapeHtml(t("assignee"))}</option>${staffOptions}</select>
        <select class="filter-input" data-filter-select="urgency">
          <option value="all">${escapeHtml(t("urgency"))}</option>
          <option value="urgent">urgent</option><option value="high">high</option><option value="medium">medium</option><option value="low">low</option><option value="none">${escapeHtml(t("unjudged"))}</option>
        </select>
        <select class="filter-input" data-filter-select="sort">
          <option value="priority" ${state.filters.sort === "priority" ? "selected" : ""}>${escapeHtml(t("prioritySort"))}</option>
          <option value="newest" ${state.filters.sort === "newest" ? "selected" : ""}>${escapeHtml(t("newest"))}</option>
          <option value="oldest" ${state.filters.sort === "oldest" ? "selected" : ""}>${escapeHtml(t("oldest"))}</option>
          <option value="overdue" ${state.filters.sort === "overdue" ? "selected" : ""}>${escapeHtml(t("overdueFirst"))}</option>
        </select>
      </div>
      <div class="table-wrap request-table-wrap">
        <table class="data-table request-table">
          <thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("urgency")}</th><th>${t("assignee")}</th><th>${t("status")}</th><th>${t("elapsed")}</th><th>${t("deadline")}</th><th>${t("amount")}</th><th>${t("action")}</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(renderRequestRow).join("") : `<tr><td colspan="10">${showEmptyState(t("noRequests"))}</td></tr>`}
          </tbody>
        </table>
      </div>
      ${renderRequestKanbanPreview(filtered, statuses.slice(1))}
    `;
  }

  function renderRequestRow(item) {
    const id = getRowId(item);
    const deadline = getDeadline(item) ? formatDateTime(getDeadline(item)) : "-";
    const urgency = getUrgency(item);
    return `<tr>
      <td data-label="${t("id")}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong></td>
      <td data-label="${t("customer")}"><div class="row-title">${escapeHtml(getCustomerName(item))}</div><div class="subtext">${escapeHtml(getRequestPhone(item))}</div></td>
      <td data-label="${t("content")}"><div class="text-clamp-1">${escapeHtml(getRequestContent(item))}</div><div class="subtext text-clamp-1">${escapeHtml(item.address || "")}</div></td>
      <td data-label="${t("urgency")}">${urgency ? `<span class="urgency-badge urgency-${escapeHtml(urgency)}">${escapeHtml(urgency)}</span>` : `<span class="muted-dash">-</span>`}</td>
      <td data-label="${t("assignee")}">${escapeHtml(getAssigneeName(item))}</td>
      <td data-label="${t("status")}"><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td data-label="${t("elapsed")}">${escapeHtml(computeWaitingTime(item))}</td>
      <td data-label="${t("deadline")}">${escapeHtml(deadline)}</td>
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
      return `<section class="kanban-column"><h3>${escapeHtml(formatStatus(status))}<span>${rows.length}</span></h3>${rows.length ? rows.map(item => `<button class="request-mobile-card" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span><p>${escapeHtml(getRequestContent(item))}</p><small>${escapeHtml(getCustomerName(item))} / ${escapeHtml(computeWaitingTime(item))}</small></button>`).join("") : showEmptyState()}</section>`;
    }).join("")}</div>`;
  }

  function statusSelectHtml(id, current) {
    const statuses = ["untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
    return `<select class="status-select" data-request-status="${escapeHtml(id)}">${statuses.map(status => `<option value="${status}" ${normalizeRequestStatus(current) === status ? "selected" : ""}>${escapeHtml(formatStatus(status))}</option>`).join("")}</select>`;
  }

  function renderRequestDetail(request) {
    const id = getRowId(request);
    const media = collectMedia(request);
    const timeline = Array.isArray(request.timeline) ? request.timeline : [];
    openDrawer(`
      <article class="drawer-panel">
        <header class="drawer-head">
          <div><h2>${escapeHtml(getRequestDisplayId(request))}</h2><p class="note">${escapeHtml(getCustomerName(request))}</p></div>
          <button class="close-button" type="button" data-close-drawer>×</button>
        </header>
        <div class="drawer-body">
          <div class="info-grid">
            ${infoItem(t("phone"), getRequestPhone(request))}
            ${infoItem(t("address"), request.address)}
            ${infoItem(t("content"), getRequestContent(request))}
            ${infoItem(t("issueTags"), Array.isArray(request.issueTags) ? request.issueTags.join(", ") : "")}
            ${infoItem(t("status"), formatStatus(request.status))}
            ${infoItem(t("assignee"), getAssigneeName(request))}
            ${infoItem(t("urgency"), getUrgency(request) || t("unjudged"))}
            ${infoItem(t("createdAt"), formatDateTime(request.createdAt))}
          </div>
          <section>
            <h3>${escapeHtml(t("media"))}</h3>
            <div class="media-grid">${media.length ? media.map(renderMedia).join("") : emptyHtml()}</div>
          </section>
          <section class="field">
            <label>${escapeHtml(t("adminReply"))}</label>
            <textarea id="requestReplyInput">${escapeHtml(request.adminReply || "")}</textarea>
          </section>
          <section class="form-grid">
            <label class="field"><span>${escapeHtml(t("updateStatus"))}</span>${statusSelectHtml(id, request.status)}</label>
            <label class="field"><span>${escapeHtml(t("assignStaff"))}</span>${staffSelectHtml(request.assigneeId)}</label>
          </section>
          <div class="actions">
            <button class="primary-button" type="button" data-save-request="${escapeHtml(id)}">${escapeHtml(t("save"))}</button>
            <button class="ghost-button" type="button" disabled>${escapeHtml(t("quoteRegister"))}</button>
            <button class="ghost-button" type="button" disabled>${escapeHtml(t("proposalCreate"))}</button>
            <button class="ghost-button" type="button" disabled>${escapeHtml(t("recordAdd"))}</button>
          </div>
          <section>
            <h3>${escapeHtml(t("timeline"))}</h3>
            <div class="timeline">${timeline.length ? timeline.map(item => `<div class="timeline-item"><strong>${escapeHtml(formatStatus(item.status || item.type))}</strong><div class="subtext">${escapeHtml(formatDate(item.createdAt))}</div><div>${escapeHtml(item.note || item.message || "")}</div></div>`).join("") : emptyHtml()}</div>
          </section>
        </div>
      </article>
    `);
  }

  function infoItem(label, value) {
    return `<div class="info-item"><b>${escapeHtml(label)}</b><span>${escapeHtml(value || "-")}</span></div>`;
  }

  function collectMedia(request) {
    const media = [];
    if (Array.isArray(request.mediaFiles)) media.push(...request.mediaFiles);
    if (request.mediaUrl) media.push({ url: request.mediaUrl, type: request.mediaType });
    if (request.image) media.push({ url: request.image, type: "image" });
    if (Array.isArray(request.images)) request.images.forEach(url => media.push({ url, type: "image" }));
    return media.filter(item => item && (item.url || item.secureUrl));
  }

  function renderMedia(item) {
    const url = item.secureUrl || item.url;
    const type = item.type || item.resourceType || (/(\.mp4|\.mov|\.webm|\.m4v)(\?|$)/i.test(url) ? "video" : "image");
    return type === "video"
      ? `<video src="${escapeHtml(url)}" controls playsinline></video>`
      : `<img src="${escapeHtml(url)}" alt="">`;
  }

  function staffSelectHtml(selectedId) {
    return `<select id="requestStaffSelect">${[""].concat(state.staff.map(item => getRowId(item))).map(id => {
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

  function avatarHtml(item, sizeClass) {
    const name = item?.name || item?.phone || item?.email || "A";
    const avatar = item?.avatar;
    return `<div class="avatar ${sizeClass || ""}">${avatar ? `<img class="avatar-img" src="${escapeHtml(avatar)}" alt="">` : escapeHtml(initials(name))}</div>`;
  }

  function userRequestCount(user) {
    return Number(user?.requestCount || state.requests.filter(request => String(request.userId || "") === String(getRowId(user))).length || 0);
  }

  function filterUsers() {
    const search = state.filters.customerSearch || "";
    const status = state.filters.customerStatus || "all";
    const sort = state.filters.customerSort || "created";
    return [...state.users].filter(user => {
      const statusOk = status === "all" || String(user.status || "pendingApproval") === status;
      const text = [user.name, user.phone, user.email, user.company, user.companyName, user.customerType, user.address, user.province].join(" ").toLowerCase();
      return statusOk && text.includes(search.toLowerCase());
    }).sort((a, b) => {
      if (sort === "name") return compactText(a.name || a.phone).localeCompare(compactText(b.name || b.phone));
      if (sort === "status") return compactText(a.status).localeCompare(compactText(b.status));
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
    return [...state.staff].filter(staff => {
      const deptText = staffDepartment(staff);
      const statusText = staff.status || "active";
      const text = [staff.name, staff.email, staff.phone, deptText, staffRole(staff), staff.workContent, staff.skills, toList(staff.workTags).join(" ")].join(" ").toLowerCase();
      return (dept === "all" || deptText === dept) && (status === "all" || statusText === status) && text.includes(search.toLowerCase());
    }).sort((a, b) => {
      if (sort === "status") return compactText(a.status).localeCompare(compactText(b.status));
      if (sort === "created") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return compactText(a.name).localeCompare(compactText(b.name));
    });
  }

  function drawerTabs(active, tabs) {
    return `<div class="drawer-tabs">${tabs.map(([key, label]) => `<button class="tab-button ${active === key ? "active" : ""}" type="button" data-drawer-tab="${key}">${escapeHtml(label)}</button>`).join("")}</div>`;
  }

  function renderCustomers() {
    const rows = filterUsers();
    const totalWithRequests = state.users.filter(user => userRequestCount(user) > 0).length;
    const statusOptions = ["all", "pendingApproval", "active", "blocked", "deleted"];
    const selected = rows.find(user => getRowId(user) === state.selectedUser) || rows[0] || null;
    if (selected) state.selectedUser = getRowId(selected);
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("customerSubtitle"))}</p></div>
      <div class="kpi-grid kpi-grid-small">
        ${statCard(t("customersCount"), state.users.length, t("realData"), "info")}
        ${statCard(userStatusMap.pendingApproval, state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length, t("realData"), "warning")}
        ${statCard(t("active"), state.users.filter(user => user.status === "active").length, t("realData"), "success")}
        ${statCard(t("blocked"), state.users.filter(user => user.status === "blocked").length, t("realData"), "danger")}
        ${statCard(t("deleted"), state.users.filter(user => user.status === "deleted").length, t("realData"), "total")}
        ${statCard(t("hasRequests"), totalWithRequests, t("realData"), "info")}
      </div>
      <div class="crm-filter-bar">
        <input class="filter-input" data-customer-filter="search" value="${escapeHtml(state.filters.customerSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
        <select class="filter-input" data-customer-filter="status">${statusOptions.map(status => `<option value="${status}" ${String(state.filters.customerStatus || "all") === status ? "selected" : ""}>${escapeHtml(status === "all" ? t("all") : userStatusMap[status] || status)}</option>`).join("")}</select>
        <select class="filter-input" data-customer-filter="sort">
          <option value="created" ${(state.filters.customerSort || "created") === "created" ? "selected" : ""}>${escapeHtml(t("sortCreated"))}</option>
          <option value="name" ${state.filters.customerSort === "name" ? "selected" : ""}>${escapeHtml(t("sortName"))}</option>
          <option value="status" ${state.filters.customerSort === "status" ? "selected" : ""}>${escapeHtml(t("sortStatus"))}</option>
        </select>
      </div>
      <div class="split-layout customer-crm-layout">
        <section class="section-card split-main">
          <div class="panel-head"><h2>${escapeHtml(t("customers"))}</h2><span class="note">${rows.length} / ${state.users.length}</span></div>
          <div class="panel-body crm-table-body">
            ${rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table crm-table"><thead><tr><th>${t("company")}</th><th>${t("phone")}</th><th>${t("customerRank")}</th><th>${t("status")}</th><th>${t("lastActivity")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(user => renderCustomerRow(user, selected)).join("")}</tbody></table></div>` : showEmptyState()}
          </div>
        </section>
        ${renderCustomerPanel(selected)}
      </div>
    `;
  }

  function renderCustomerRow(user, selected) {
    const id = getRowId(user);
    const status = user.status || "pendingApproval";
    const isSelected = selected && getRowId(selected) === id;
    return `<tr class="${isSelected ? "selected-row" : ""}" data-select-customer="${escapeHtml(id)}">
      <td><div class="identity-cell">${avatarHtml(user)}<div><strong>${escapeHtml(user.company || user.companyName || user.name || user.phone || "-")}</strong><span>${escapeHtml(user.name || user.contact || "-")}</span></div></div></td>
      <td>${escapeHtml(user.phone || "-")}<div class="subtext">${escapeHtml(user.email || "")}</div></td>
      <td><span class="rank-badge">${escapeHtml(user.rank || user.customerType || "-")}</span></td>
      <td><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(userStatusMap[status] || status)}</span></td>
      <td>${escapeHtml(formatDate(user.lastLoginAt || user.updatedAt || user.createdAt))}</td>
      <td><div class="actions crm-actions">
        <button class="btn btn-soft" data-select-customer="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
        ${status === "pendingApproval" || status === "pending" ? `<button class="btn btn-soft" data-approve-user="${escapeHtml(id)}">${escapeHtml(t("approve"))}</button>` : ""}
        <button class="btn btn-soft" data-toggle-user="${escapeHtml(id)}" data-next-status="${status === "blocked" ? "active" : "blocked"}">${status === "blocked" ? escapeHtml(t("activate")) : escapeHtml(t("block"))}</button>
        <button class="btn btn-danger" data-delete-user="${escapeHtml(id)}">${escapeHtml(t("delete"))}</button>
      </div></td>
    </tr>`;
  }

  function renderCustomerPanel(user) {
    if (!user) return `<aside class="detail-panel">${showEmptyState()}</aside>`;
    const id = getRowId(user);
    const status = user.status || "pendingApproval";
    const related = state.requests.filter(request => String(request.userId || request.customerId || "") === String(id)).slice(0, 5);
    const activeRequests = related.filter(request => !["completed", "lost"].includes(normalizeRequestStatus(request.status))).length;
    const lastRequest = related[0]?.createdAt || user.lastRequestAt || user.updatedAt || user.createdAt;
    return `<aside class="detail-panel customer-detail-panel">
      <div class="detail-panel-head">
        ${avatarHtml(user, "avatar-large")}
        <div><h2>${escapeHtml(user.company || user.companyName || user.name || user.phone || "-")}</h2><p>${escapeHtml(user.name || user.contact || t("selectedDetail"))}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(userStatusMap[status] || status)}</span></div>
        <button class="btn btn-soft" data-customer-detail="${escapeHtml(id)}">${escapeHtml(t("edit"))}</button>
      </div>
      <div class="contact-grid">
        ${infoItem(t("phone"), user.phone)}
        ${infoItem(t("email"), user.email)}
        ${infoItem(t("address"), user.address || user.companyAddress)}
      </div>
      <div class="mini-kpi-row">
        ${miniMetric(t("requestCount"), userRequestCount(user))}
        ${miniMetric(t("activeRequests"), activeRequests)}
        ${miniMetric(t("quoteRegister"), "-")}
        ${miniMetric(t("lastRequest"), formatDate(lastRequest))}
      </div>
      <section><h3>${escapeHtml(t("recentRequests"))}</h3><div class="priority-list">${related.length ? related.map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getRequestContent(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState()}</div></section>
      <section><h3>${escapeHtml(t("internalNotes"))}</h3><div class="note-card">${escapeHtml(user.note || t("planned"))}</div></section>
      <section><h3>${escapeHtml(t("tags"))}</h3>${tagChips([user.customerType, user.province, user.constructionType].filter(Boolean))}</section>
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
    const status = user.status || "pendingApproval";
    const infoFields = [
      [t("name"), user.name],
      [t("phone"), user.phone],
      [t("email"), user.email],
      ["Contact", user.contact],
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
          <div class="profile-title">${avatarHtml(user, "avatar-large")}<div><h2>${escapeHtml(user.name || user.phone || "-")}</h2><p class="note">${escapeHtml(user.phone || "-")}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(userStatusMap[status] || status)}</span></div></div>
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

  function renderStaff() {
    const rows = filterStaff();
    const departments = [...new Set(state.staff.map(staffDepartment).filter(value => value && value !== "-"))];
    const allTags = state.staff.flatMap(staff => toList(staff.workTags));
    const selected = rows.find(staff => getRowId(staff) === state.selectedStaff) || rows[0] || null;
    if (selected) state.selectedStaff = getRowId(selected);
    $("viewRoot").innerHTML = `
      <div class="page-intro"><p>${escapeHtml(t("staffSubtitle"))}</p></div>
      <div class="toolbar demo-actions"><button class="btn btn-soft" disabled>CSV ${escapeHtml(t("export"))}</button><button class="primary-button" type="button" data-staff-new>+ ${escapeHtml(t("addStaff"))}</button></div>
      <div class="kpi-grid kpi-grid-small">
        ${statCard(t("staffCount"), state.staff.length, t("realData"), "info")}
        ${statCard(t("active"), state.staff.filter(staff => (staff.status || "active") === "active").length, t("realData"), "success")}
        ${statCard(staffStatusMap.busy, state.staff.filter(staff => staff.status === "busy").length, t("realData"), "warning")}
        ${statCard(t("off"), state.staff.filter(staff => ["off", "inactive"].includes(staff.status)).length, t("realData"), "danger")}
        ${statCard(t("departments"), departments.length, t("realData"), "total")}
        ${statCard(t("totalTags"), new Set(allTags).size, t("realData"), "info")}
      </div>
      <div class="crm-filter-bar">
        <input class="filter-input" data-staff-filter="search" value="${escapeHtml(state.filters.staffSearch || "")}" placeholder="${escapeHtml(t("search"))}" />
        <select class="filter-input" data-staff-filter="department"><option value="all">${escapeHtml(t("allDepartments"))}</option>${departments.map(item => `<option value="${escapeHtml(item)}" ${state.filters.staffDepartment === item ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="status"><option value="all">${escapeHtml(t("statusFilter"))}</option>${["active", "busy", "off", "inactive"].map(status => `<option value="${status}" ${state.filters.staffStatus === status ? "selected" : ""}>${escapeHtml(staffStatusMap[status] || status)}</option>`).join("")}</select>
        <select class="filter-input" data-staff-filter="sort">
          <option value="name" ${(state.filters.staffSort || "name") === "name" ? "selected" : ""}>${escapeHtml(t("sortName"))}</option>
          <option value="created" ${state.filters.staffSort === "created" ? "selected" : ""}>${escapeHtml(t("sortCreated"))}</option>
          <option value="status" ${state.filters.staffSort === "status" ? "selected" : ""}>${escapeHtml(t("sortStatus"))}</option>
        </select>
      </div>
      <div class="split-layout staff-workforce-layout">
        <section class="section-card split-main">
          <div class="panel-head"><h2>${escapeHtml(t("staff"))}</h2><span class="note">${rows.length} / ${state.staff.length}</span></div>
          <div class="panel-body crm-table-body">
            ${rows.length ? `<div class="table-wrap crm-table-wrap"><table class="data-table staff-table"><thead><tr><th>${t("staff")}</th><th>${t("role")} / ${t("department")}</th><th>Skills</th><th>${t("assignedCount")}</th><th>${t("workload")}</th><th>${t("status")}</th><th>${t("action")}</th></tr></thead><tbody>${rows.map(staff => renderStaffRow(staff, selected)).join("")}</tbody></table></div>` : showEmptyState()}
          </div>
        </section>
        ${renderStaffPanel(selected)}
      </div>
    `;
  }

  function renderStaffRow(staff, selected) {
    const id = getRowId(staff);
    const status = staff.status || "active";
    const assigned = state.requests.filter(request => String(request.assigneeId || request.assignedStaffId || "") === String(id) || getAssigneeName(request) === staff.name).length;
    const workload = assigned ? Math.min(95, 30 + assigned * 8) : 0;
    const isSelected = selected && getRowId(selected) === id;
    return `<tr class="${isSelected ? "selected-row" : ""}" data-select-staff="${escapeHtml(id)}">
      <td><div class="identity-cell">${avatarHtml(staff)}<div><strong>${escapeHtml(staff.name || "-")}</strong><span>${escapeHtml(staff.email || staff.phone || "-")}</span></div></div></td>
      <td>${escapeHtml(staffRole(staff))}<div class="subtext">${escapeHtml(staffDepartment(staff))}</div></td>
      <td>${tagChips(staff.workTags || staff.skills || staff.areas, 4)}<div class="subtext text-clamp-1">${escapeHtml(staff.workContent || "")}</div></td>
      <td>${assigned}</td>
      <td><div class="progress-cell"><span style="width:${workload}%"></span></div><small>${workload}%</small></td>
      <td><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></td>
      <td><div class="actions crm-actions">
        <button class="btn btn-soft" data-select-staff="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button>
        <button class="btn btn-soft" data-staff-edit="${escapeHtml(id)}">${escapeHtml(t("edit"))}</button>
        <button class="btn btn-danger" data-staff-delete="${escapeHtml(id)}">${escapeHtml(t("delete"))}</button>
      </div></td>
    </tr>`;
  }

  function renderStaffPanel(staff) {
    if (!staff) return `<aside class="detail-panel">${showEmptyState()}</aside>`;
    const id = getRowId(staff);
    const status = staff.status || "active";
    const assigned = state.requests.filter(request => String(request.assigneeId || request.assignedStaffId || "") === String(id) || getAssigneeName(request) === staff.name).slice(0, 5);
    return `<aside class="detail-panel staff-detail-panel">
      <div class="detail-panel-head">
        ${avatarHtml(staff, "avatar-large")}
        <div><h2>${escapeHtml(staff.name || "-")}</h2><p>ID: ${escapeHtml(id || "-")}</p><span class="status-badge status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></div>
        <button class="close-button" type="button" data-staff-detail="${escapeHtml(id)}">×</button>
      </div>
      <div class="contact-grid">
        ${infoItem(t("phone"), staff.phone)}
        ${infoItem(t("email"), staff.email)}
        ${infoItem(t("department"), staffDepartment(staff))}
        ${infoItem(t("role"), staffRole(staff))}
      </div>
      <section><h3>${escapeHtml(t("strengths"))}</h3>${tagChips(staff.workTags || staff.skills || staff.areas)}</section>
      <section><h3>${escapeHtml(t("recentRequests"))} (${assigned.length})</h3><div class="priority-list">${assigned.length ? assigned.map(item => `<button class="compact-request" type="button" data-request-detail="${escapeHtml(getRowId(item))}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getCustomerName(item))}</span><span class="status-badge ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></button>`).join("") : showEmptyState(t("planned"))}</div></section>
      <section><h3>${escapeHtml(t("performance"))}</h3><div class="mini-kpi-row">${miniMetric(t("assignedCount"), assigned.length)}${miniMetric(t("workload"), assigned.length ? Math.min(95, 30 + assigned.length * 8) + "%" : "0%")}</div></section>
      <section><h3>${escapeHtml(t("aiSuitability"))}</h3><div class="score-list">${["緊急対応", "現場管理", "提案対応"].map(label => `<div><span>${label}</span><b>${escapeHtml(t("preparing"))}</b><i style="width:0%"></i></div>`).join("")}</div></section>
      <div class="modal-actions"><button class="btn btn-soft" data-staff-edit="${escapeHtml(id)}">${escapeHtml(t("edit"))}</button><button class="btn btn-primary" data-staff-detail="${escapeHtml(id)}">${escapeHtml(t("detail"))}</button></div>
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

  function renderStaffForm(staff) {
    const item = staff || {};
    const id = getRowId(item);
    openDrawer(`
      <article class="drawer-panel">
        <header class="drawer-head"><h2>${escapeHtml(t("staffForm"))}</h2><button class="close-button" type="button" data-close-drawer>×</button></header>
        <form class="drawer-body" id="staffForm" data-staff-id="${escapeHtml(id)}">
          <div class="form-grid">
            ${field("name", t("name"), item.name)}
            ${field("avatar", "Avatar URL", item.avatar)}
            ${field("phone", t("phone"), item.phone)}
            ${field("email", t("email"), item.email)}
            ${field("areas", "Areas", toList(item.areas).join(", "))}
            ${field("skills", "Skills", toList(item.skills).join(", "))}
            ${field("department", t("department"), item.department)}
            ${field("role", "Role", item.role)}
            ${field("position", "Position", item.position)}
            ${field("title", "Title", item.title)}
            ${field("workContent", t("workContent"), item.workContent, true)}
            ${field("workTags", t("workTags"), toList(item.workTags).join(", "))}
            ${field("note", "Note", item.note, true)}
            ${field("introduction", "Introduction", item.introduction, true)}
            <label class="field"><span>${escapeHtml(t("status"))}</span><select name="status">${["active", "busy", "off", "inactive"].map(status => `<option value="${status}" ${item.status === status ? "selected" : ""}>${escapeHtml(staffStatusMap[status])}</option>`).join("")}</select></label>
          </div>
          <div class="actions"><button class="primary-button" type="submit">${escapeHtml(t("save"))}</button></div>
        </form>
      </article>
    `);
  }

  function field(name, label, value, textarea) {
    const input = textarea
      ? `<textarea name="${name}">${escapeHtml(value || "")}</textarea>`
      : `<input name="${name}" value="${escapeHtml(value || "")}" />`;
    return `<label class="field ${textarea ? "full" : ""}"><span>${escapeHtml(label)}</span>${input}</label>`;
  }

  function renderQuotes() {
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
            ${stages.map(stage => `<section class="pipeline-column"><header><strong>${escapeHtml(stage)}</strong><span>0</span></header>${showEmptyState(t("emptyColumn"))}<button class="mini-button" disabled>+ ${escapeHtml(t("quoteRegister"))}</button></section>`).join("")}
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

  function renderNotifications() {
    const oldUntreated = state.requests.filter(isOverdue).length;
    const pendingUsers = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length;
    $("viewRoot").innerHTML = `<div class="notification-grid">
      ${notificationCard(t("longUntreated"), oldUntreated)}
      ${notificationCard(t("pendingUsers"), pendingUsers)}
      ${notificationCard(t("quoteDeadline"), 0)}
    </div>`;
  }

  function notificationCard(label, count) {
    return `<div class="notification-card"><strong>${escapeHtml(label)}</strong><span class="stat-value">${escapeHtml(count)}</span><p class="note">${escapeHtml(count ? t("realData") : t("planned"))}</p></div>`;
  }

  function renderSettings() {
    const items = ["automationGoal", "settingsSla", "settingsAssign", "settingsUrgency", "settingsNotice", "roles", "companyInfo", "dataApi", "settingsColor"];
    $("viewRoot").innerHTML = `<div class="settings-grid settings-demo-grid">${items.map((key, index) => `<section class="settings-card"><div class="settings-card-head"><h2>${escapeHtml(t(key))}</h2><span class="status-badge status-${index % 3 === 0 ? "active" : "quoted"}">${escapeHtml(index % 3 === 0 ? t("active") : t("preparing"))}</span></div><div class="settings-placeholder"><label>${escapeHtml(t("status"))}</label><div class="placeholder-input">${escapeHtml(t("planned"))}</div><label>${escapeHtml(t("settingsSystem"))}</label><div class="placeholder-toggle"><span></span></div></div><p class="note">${escapeHtml(t("kpiPlanned"))}</p></section>`).join("")}</div>`;
  }

  async function saveRequestFromDrawer(id) {
    const status = document.querySelector("[data-request-status='" + CSS.escape(id) + "']")?.value;
    const reply = $("requestReplyInput")?.value || "";
    const staffId = $("requestStaffSelect")?.value || "";
    const staff = state.staff.find(item => getRowId(item) === staffId);
    await AdminAPI.updateRequest(id, {
      status,
      adminReply: reply,
      assigneeId: staff ? getRowId(staff) : "",
      assigneeName: staff ? staff.name || "" : ""
    });
    closeDrawer();
    await refreshData();
    toast(t("saved"));
  }

  async function refreshData() {
    await loadAll();
    renderCurrentView();
  }

  function bindEvents() {
    $("sideNav").addEventListener("click", event => {
      const button = event.target.closest("[data-view]");
      if (!button) return;
      state.currentView = button.dataset.view;
      $("appShell").classList.remove("sidebar-open");
      renderCurrentView();
    });

    $("mobileMenuButton").addEventListener("click", () => $("appShell").classList.toggle("sidebar-open"));
    $("mobileScrim").addEventListener("click", () => $("appShell").classList.remove("sidebar-open"));
    $("logoutButton").addEventListener("click", logout);
    $("refreshButton").addEventListener("click", refreshData);
    $("languageSelect").addEventListener("change", event => {
      state.lang = event.target.value === "vi" ? "vi" : "ja";
      localStorage.setItem("language", state.lang);
      renderCurrentView();
    });
    $("globalSearch").addEventListener("input", event => {
      state.filters.search = event.target.value || "";
      if (state.currentView === "requests") renderRequests();
    });
    $("drawer").addEventListener("click", event => {
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
      const confirmYes = event.target.closest("[data-confirm-yes]");
      const confirmNo = event.target.closest("[data-confirm-no]");
      const confirmOverlay = event.target.id === "drawer" && window.__adminV2ConfirmResolve;
      if (confirmYes || confirmNo || confirmOverlay) {
        const resolve = window.__adminV2ConfirmResolve;
        window.__adminV2ConfirmResolve = null;
        closeDrawer();
        if (typeof resolve === "function") resolve(Boolean(confirmYes));
        return;
      }
      if (event.target.id === "drawer" || event.target.closest("[data-close-drawer]")) closeDrawer();
    });

    document.addEventListener("change", async event => {
      const select = event.target.closest("[data-request-status]");
      if (!select || $("drawer").classList.contains("open")) return;
      try {
        await AdminAPI.updateRequest(select.dataset.requestStatus, { status: select.value });
        const item = state.requests.find(request => getRowId(request) === select.dataset.requestStatus || getRequestDisplayId(request) === select.dataset.requestStatus);
        if (item) item.status = select.value;
        renderRequests();
        toast(t("saved"));
      } catch {
        toast(t("failed"));
      }
    });

    document.addEventListener("click", async event => {
      const navButton = event.target.closest("[data-view]");
      if (navButton && !navButton.closest("#sideNav")) {
        state.currentView = navButton.dataset.view;
        renderCurrentView();
        return;
      }

      const filter = event.target.closest("[data-request-filter]");
      if (filter) {
        state.filters.requestStatus = filter.dataset.requestFilter;
        renderRequests();
        return;
      }

      const mode = event.target.closest("[data-view-mode]");
      if (mode) {
        state.filters.requestViewMode = mode.dataset.viewMode;
        renderRequests();
        return;
      }

      if (event.target.closest("[data-retry]")) {
        refreshData();
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
        } catch {
          toast(t("failed"));
        }
        return;
      }

      const approve = event.target.closest("[data-approve-user]");
      if (approve) {
        try {
          await AdminAPI.approveUser(approve.dataset.approveUser);
          await refreshData();
          toast(t("saved"));
        } catch {
          toast(t("failed"));
        }
        return;
      }

      const toggleUser = event.target.closest("[data-toggle-user]");
      if (toggleUser) {
        try {
          await AdminAPI.updateUser(toggleUser.dataset.toggleUser, { status: toggleUser.dataset.nextStatus });
          await refreshData();
          toast(t("saved"));
        } catch {
          toast(t("failed"));
        }
        return;
      }

      const customerDetail = event.target.closest("[data-customer-detail]");
      if (customerDetail) {
        const user = state.users.find(item => getRowId(item) === customerDetail.dataset.customerDetail);
        if (user) renderCustomerDetail(user);
        return;
      }

      const selectCustomer = event.target.closest("[data-select-customer]");
      if (selectCustomer) {
        state.selectedUser = selectCustomer.dataset.selectCustomer;
        renderCustomers();
        return;
      }

      const deleteUser = event.target.closest("[data-delete-user]");
      if (deleteUser && await confirmAction(t("confirmDelete"))) {
        try {
          await AdminAPI.deleteUser(deleteUser.dataset.deleteUser, false);
          await refreshData();
          toast(t("saved"));
        } catch {
          toast(t("failed"));
        }
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

    document.addEventListener("submit", async event => {
      if (event.target.id !== "staffForm") return;
      event.preventDefault();
      const form = event.target;
      const payload = Object.fromEntries(new FormData(form).entries());
      const areas = toList(payload.areas);
      const skills = toList(payload.skills);
      payload.areas = areas.join(", ");
      payload.skills = skills.join(", ");
      payload.workTags = toList(payload.workTags);
      try {
        if (form.dataset.staffId) await AdminAPI.updateStaff(form.dataset.staffId, payload);
        else await AdminAPI.createStaff(payload);
        closeDrawer();
        await refreshData();
        toast(t("saved"));
      } catch {
        toast(t("failed"));
      }
    });

    document.addEventListener("input", event => {
      if (event.target.id === "requestSearch") {
        state.filters.search = event.target.value || "";
        renderRequests();
      }
      const customerFilter = event.target.closest("[data-customer-filter]");
      if (customerFilter) {
        state.filters["customer" + customerFilter.dataset.customerFilter.charAt(0).toUpperCase() + customerFilter.dataset.customerFilter.slice(1)] = customerFilter.value || "";
        renderCustomers();
      }
      const staffFilter = event.target.closest("[data-staff-filter]");
      if (staffFilter) {
        state.filters["staff" + staffFilter.dataset.staffFilter.charAt(0).toUpperCase() + staffFilter.dataset.staffFilter.slice(1)] = staffFilter.value || "";
        renderStaff();
      }
    });

    document.addEventListener("change", event => {
      const select = event.target.closest("[data-filter-select]");
      if (select) {
        state.filters[select.dataset.filterSelect] = select.value;
        renderRequests();
        return;
      }
      const customerFilter = event.target.closest("[data-customer-filter]");
      if (customerFilter) {
        state.filters["customer" + customerFilter.dataset.customerFilter.charAt(0).toUpperCase() + customerFilter.dataset.customerFilter.slice(1)] = customerFilter.value || "";
        renderCustomers();
        return;
      }
      const staffFilter = event.target.closest("[data-staff-filter]");
      if (staffFilter) {
        state.filters["staff" + staffFilter.dataset.staffFilter.charAt(0).toUpperCase() + staffFilter.dataset.staffFilter.slice(1)] = staffFilter.value || "";
        renderStaff();
      }
    });
  }

  async function init() {
    if (!requireAuth()) return;
    bindEvents();
    renderLayout();
    $("viewRoot").innerHTML = emptyHtml("Loading...");
    await refreshData();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
