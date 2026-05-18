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

  const views = [
    ["dashboard", "dashboard", "▦"],
    ["requests", "requests", "◆"],
    ["customers", "customers", "●"],
    ["staff", "staff", "◎"],
    ["quotes", "quotes", "□"],
    ["notifications", "notifications", "!"],
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
    filters: {
      requestStatus: "all",
      search: ""
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
    $("globalSearch").placeholder = t("search");
    $("languageSelect").value = state.lang;
    $("logoutButton").textContent = t("logout");
    $("refreshButton").textContent = t("refresh");
    $("sideNav").innerHTML = views.map(([view, labelKey, icon]) => `
      <button class="nav-item ${state.currentView === view ? "active" : ""}" type="button" data-view="${view}">
        <span class="nav-icon">${icon}</span>
        <span>${escapeHtml(t(labelKey))}</span>
      </button>
    `).join("");
    $("viewTitle").textContent = t(state.currentView);
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
    const priority = [...state.requests]
      .filter(item => !["completed", "lost"].includes(normalizeRequestStatus(item.status)))
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .slice(0, 6);
    $("viewRoot").innerHTML = `
      <div class="grid stats-grid">
        ${statCard(t("totalRequests"), state.requests.length)}
        ${statCard(t("untreated"), untreated.length)}
        ${statCard(t("overdue"), overdue.length)}
        ${statCard(t("customersCount"), state.users.length)}
        ${statCard(t("staffCount"), state.staff.length)}
      </div>
      <div class="grid two" style="margin-top:16px">
        <section class="panel">
          <div class="panel-head"><h2>${escapeHtml(t("priorityRequests"))}</h2><span class="note">${escapeHtml(t("kpiPlanned"))}</span></div>
          <div class="panel-body priority-list">
            ${priority.length ? priority.map(item => `
              <div class="priority-item">
                <strong>${escapeHtml(getRequestDisplayId(item))} / ${escapeHtml(getCustomerName(item))}</strong>
                <span>${escapeHtml(getRequestContent(item))}</span>
                <span class="status-pill ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span>
              </div>
            `).join("") : emptyHtml()}
          </div>
        </section>
        <section class="panel">
          <div class="panel-head"><h2>${escapeHtml(t("aiPanel"))}</h2></div>
          <div class="panel-body ai-list">
            <div class="ai-item">${escapeHtml(t("aiUrgency"))}</div>
            <div class="ai-item">${escapeHtml(t("aiAssign"))}</div>
            <div class="ai-item">${escapeHtml(t("aiPriority"))}</div>
          </div>
        </section>
      </div>
    `;
  }

  function statCard(label, value) {
    return `<div class="card"><span class="stat-label">${escapeHtml(label)}</span><strong class="stat-value">${escapeHtml(value)}</strong></div>`;
  }

  function emptyHtml(message) {
    return `<div class="empty">${escapeHtml(message || t("noData"))}</div>`;
  }

  function renderRequests() {
    const statuses = ["all", "untreated", "contacted", "site_done", "quoted", "ordered", "completed", "lost"];
    const search = state.filters.search.toLowerCase();
    const filtered = state.requests.filter(item => {
      const statusOk = state.filters.requestStatus === "all" || normalizeRequestStatus(item.status) === state.filters.requestStatus;
      const text = [getRequestDisplayId(item), getCustomerName(item), getRequestContent(item), item.phone, item.address, getAssigneeName(item)].join(" ").toLowerCase();
      return statusOk && text.includes(search);
    });
    $("viewRoot").innerHTML = `
      <div class="toolbar">
        <div class="chips">
          ${statuses.map(status => `<button class="chip ${state.filters.requestStatus === status ? "active" : ""}" type="button" data-request-filter="${status}">${escapeHtml(status === "all" ? t("all") : formatStatus(status))}</button>`).join("")}
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t("id")}</th><th>${t("customer")}</th><th>${t("content")}</th><th>${t("status")}</th><th>${t("assignee")}</th><th>${t("elapsed")}</th><th>${t("deadline")}</th><th>${t("action")}</th></tr></thead>
          <tbody>
            ${filtered.length ? filtered.map(renderRequestRow).join("") : `<tr><td colspan="8">${emptyHtml()}</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRequestRow(item) {
    const id = getRowId(item);
    const deadline = isOverdue(item) ? t("overdue") : "-";
    return `<tr>
      <td data-label="${t("id")}"><strong>${escapeHtml(getRequestDisplayId(item))}</strong></td>
      <td data-label="${t("customer")}"><div class="row-title">${escapeHtml(getCustomerName(item))}</div><div class="subtext">${escapeHtml(item.phone || item.contact || "")}</div></td>
      <td data-label="${t("content")}">${escapeHtml(getRequestContent(item))}<div class="subtext">${escapeHtml(item.address || "")}</div></td>
      <td data-label="${t("status")}"><span class="status-pill ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></td>
      <td data-label="${t("assignee")}">${escapeHtml(getAssigneeName(item))}</td>
      <td data-label="${t("elapsed")}">${escapeHtml(elapsedText(item.createdAt))}</td>
      <td data-label="${t("deadline")}">${escapeHtml(deadline)}</td>
      <td data-label="${t("action")}"><div class="actions"><button class="mini-button" type="button" data-request-detail="${escapeHtml(id)}">${t("detail")}</button>${statusSelectHtml(id, item.status)}</div></td>
    </tr>`;
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
            ${infoItem(t("phone"), request.phone || request.contact)}
            ${infoItem(t("address"), request.address)}
            ${infoItem(t("content"), getRequestContent(request))}
            ${infoItem(t("issueTags"), Array.isArray(request.issueTags) ? request.issueTags.join(", ") : "")}
            ${infoItem(t("status"), formatStatus(request.status))}
            ${infoItem(t("assignee"), getAssigneeName(request))}
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

  function renderCustomers() {
    $("viewRoot").innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t("name")}</th><th>${t("phone")}</th><th>${t("company")}</th><th>${t("address")}</th><th>${t("status")}</th><th>${t("createdAt")}</th><th>${t("action")}</th></tr></thead>
          <tbody>${state.users.length ? state.users.map(renderCustomerRow).join("") : `<tr><td colspan="7">${emptyHtml()}</td></tr>`}</tbody>
        </table>
      </div>
    `;
  }

  function renderCustomerRow(user) {
    const id = getRowId(user);
    const status = user.status || "pendingApproval";
    return `<tr>
      <td data-label="${t("name")}"><strong>${escapeHtml(user.name || "-")}</strong></td>
      <td data-label="${t("phone")}">${escapeHtml(user.phone || "-")}</td>
      <td data-label="${t("company")}">${escapeHtml(user.company || user.companyName || user.customerType || "-")}</td>
      <td data-label="${t("address")}">${escapeHtml(user.address || user.province || "-")}</td>
      <td data-label="${t("status")}"><span class="status-pill status-${escapeHtml(status)}">${escapeHtml(userStatusMap[status] || status)}</span></td>
      <td data-label="${t("createdAt")}">${escapeHtml(formatDate(user.createdAt))}</td>
      <td data-label="${t("action")}"><div class="actions">
        ${status === "pendingApproval" || status === "pending" ? `<button class="mini-button" data-approve-user="${escapeHtml(id)}">${t("approve")}</button>` : ""}
        <button class="mini-button" data-customer-detail="${escapeHtml(id)}">${t("detail")}</button>
        <button class="mini-button" data-toggle-user="${escapeHtml(id)}" data-next-status="${status === "blocked" ? "active" : "blocked"}">${status === "blocked" ? t("activate") : t("block")}</button>
      </div></td>
    </tr>`;
  }

  async function renderCustomerDetail(user) {
    let history = [];
    try {
      history = normalizeList(await AdminAPI.getUserRequests(getRowId(user)));
    } catch {}
    openDrawer(`
      <article class="drawer-panel">
        <header class="drawer-head"><div><h2>${escapeHtml(user.name || user.phone || "-")}</h2><p class="note">${escapeHtml(user.phone || "")}</p></div><button class="close-button" type="button" data-close-drawer>×</button></header>
        <div class="drawer-body">
          <div class="info-grid">
            ${infoItem(t("email"), user.email)}
            ${infoItem(t("company"), user.company || user.companyName || user.customerType)}
            ${infoItem(t("address"), user.address || user.province)}
            ${infoItem(t("status"), userStatusMap[user.status] || user.status)}
          </div>
          <section><h3>${escapeHtml(t("userHistory"))}</h3><div class="priority-list">${history.length ? history.map(item => `<div class="priority-item"><strong>${escapeHtml(getRequestDisplayId(item))}</strong><span>${escapeHtml(getRequestContent(item))}</span><span class="status-pill ${getStatusClass(item.status)}">${escapeHtml(formatStatus(item.status))}</span></div>`).join("") : emptyHtml()}</div></section>
        </div>
      </article>
    `);
  }

  function renderStaff() {
    $("viewRoot").innerHTML = `
      <div class="toolbar"><button class="primary-button" type="button" data-staff-new>${escapeHtml(t("addStaff"))}</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>${t("name")}</th><th>${t("department")}</th><th>${t("role")}</th><th>${t("phone")}</th><th>${t("email")}</th><th>${t("workContent")}</th><th>${t("workTags")}</th><th>${t("status")}</th><th>${t("action")}</th></tr></thead>
          <tbody>${state.staff.length ? state.staff.map(renderStaffRow).join("") : `<tr><td colspan="9">${emptyHtml()}</td></tr>`}</tbody>
        </table>
      </div>
    `;
  }

  function renderStaffRow(staff) {
    const id = getRowId(staff);
    const status = staff.status || "active";
    return `<tr>
      <td data-label="${t("name")}"><strong>${escapeHtml(staff.name || "-")}</strong></td>
      <td data-label="${t("department")}">${escapeHtml(staff.department || staff.areas || "-")}</td>
      <td data-label="${t("role")}">${escapeHtml(staff.role || staff.position || staff.title || "-")}</td>
      <td data-label="${t("phone")}">${escapeHtml(staff.phone || "-")}</td>
      <td data-label="${t("email")}">${escapeHtml(staff.email || "-")}</td>
      <td data-label="${t("workContent")}">${escapeHtml(staff.workContent || staff.skills || "-")}</td>
      <td data-label="${t("workTags")}">${escapeHtml(Array.isArray(staff.workTags) ? staff.workTags.join(", ") : "")}</td>
      <td data-label="${t("status")}"><span class="status-pill status-${escapeHtml(status)}">${escapeHtml(staffStatusMap[status] || status)}</span></td>
      <td data-label="${t("action")}"><div class="actions"><button class="mini-button" data-staff-edit="${escapeHtml(id)}">${t("edit")}</button><button class="mini-button" data-staff-delete="${escapeHtml(id)}">${t("delete")}</button></div></td>
    </tr>`;
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
            ${field("areas", "Areas", item.areas)}
            ${field("skills", "Skills", item.skills)}
            ${field("department", t("department"), item.department)}
            ${field("role", "Role", item.role)}
            ${field("position", "Position", item.position)}
            ${field("title", "Title", item.title)}
            ${field("workContent", t("workContent"), item.workContent, true)}
            ${field("workTags", t("workTags"), Array.isArray(item.workTags) ? item.workTags.join(", ") : item.workTags)}
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
    $("viewRoot").innerHTML = `
      ${emptyHtml(t("quoteShell"))}
      <div class="actions" style="margin-top:16px">
        <button class="ghost-button" disabled>${escapeHtml(t("quoteRegister"))}</button>
        <button class="ghost-button" disabled>${escapeHtml(t("proposalCreate"))}</button>
        <button class="ghost-button" disabled>${escapeHtml(t("pdfExport"))}</button>
      </div>
    `;
  }

  function renderNotifications() {
    const oldUntreated = state.requests.filter(isOverdue).length;
    const pendingUsers = state.users.filter(user => user.status === "pendingApproval" || user.status === "pending").length;
    $("viewRoot").innerHTML = `<div class="grid">
      ${notificationCard(t("longUntreated"), oldUntreated)}
      ${notificationCard(t("pendingUsers"), pendingUsers)}
      ${notificationCard(t("quoteDeadline"), 0)}
    </div>`;
  }

  function notificationCard(label, count) {
    return `<div class="card"><strong>${escapeHtml(label)}</strong><span class="stat-value">${escapeHtml(count)}</span></div>`;
  }

  function renderSettings() {
    const items = ["settingsSla", "settingsAssign", "settingsUrgency", "settingsNotice", "settingsColor", "settingsSystem"];
    $("viewRoot").innerHTML = `<div class="grid two">${items.map(key => `<section class="card"><h2>${escapeHtml(t(key))}</h2><p class="note">${escapeHtml(t("kpiPlanned"))}</p></section>`).join("")}</div>`;
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
      const filter = event.target.closest("[data-request-filter]");
      if (filter) {
        state.filters.requestStatus = filter.dataset.requestFilter;
        renderRequests();
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
      payload.workTags = String(payload.workTags || "").split(",").map(item => item.trim()).filter(Boolean);
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
