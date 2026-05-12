(function () {
  function $(id) { return document.getElementById(id); }

  function getLang() {
    return (localStorage.getItem("language") || localStorage.getItem("lang") || window.lang || "ja") === "vi" ? "vi" : "ja";
  }

  function setText(id, text) {
    const el = $(id);
    if (el) el.innerText = text;
  }

  function setHtml(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
  }

  function show(el, visible) {
    if (el) el.classList.toggle("hidden", !visible);
  }

  function getSavedUser() {
    try {
      return JSON.parse(localStorage.getItem("userProfile") || "null");
    } catch (e) {
      return null;
    }
  }

  function isActiveUser(user) {
    return !!(user && user.status === "active" && user.profileCompleted);
  }

  function isPendingUser(user) {
    return !!(user && user.profileCompleted && user.status !== "active");
  }

  const copy = {
    vi: {
      welcomeTitle: "Chào mừng",
      welcomeText: "Đăng ký hoặc đăng nhập để tiếp tục sử dụng ứng dụng YAMADEN.",
      loginTitle: "Đăng nhập",
      loginText: "Nhập số điện thoại và mã PIN 6 số để đăng nhập.",
      registerTitle: "Đăng ký",
      registerText: "Vui lòng nhập số điện thoại, mã PIN 6 số và xác nhận PIN.",
      profileTitle: "Thông tin tài khoản",
      profileText: "Vui lòng nhập thông tin để admin duyệt tài khoản.",
      pendingTitle: "Tài khoản đang chờ duyệt",
      pendingText: "Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và duyệt tài khoản trong thời gian sớm nhất.",
      pendingTimeTitle: "Thời gian dự kiến:",
      pendingTimeText: "24 - 48 giờ làm việc",
      backLogin: "Quay về trang chủ",
      login: "Đăng nhập",
      register: "Đăng ký",
      next: "Tiếp tục",
      submit: "Gửi duyệt admin",
      phone: "Số điện thoại",
      contact: "Email hoặc LINE/Zalo",
      pin: "Mã PIN 6 số",
      pinConfirm: "Xác nhận PIN",
      pinPlaceholder: "Nhập mã PIN 6 số",
      pinConfirmPlaceholder: "Nhập lại mã PIN 6 số",
      name: "Họ và tên",
      email: "Email",
      address: "Địa chỉ",
      project: "Ghi chú / tên công trình",
      company: "Công ty / cá nhân",
      note: "Ghi chú thêm",
      remember: "Ghi nhớ đăng nhập",
      forgotPin: "Quên PIN?",
      noAccount: "Chưa có tài khoản?",
      hasAccount: "Đã có tài khoản?",
      terms: "Tôi đồng ý với <b>Điều khoản sử dụng</b> và <b>Chính sách bảo mật</b>",
      profileNameLabel: "1. Họ và tên",
      profilePhoneLabel: "2. Số điện thoại",
      profileEmailLabel: "3. Email",
      profileAddressLabel: "4. Địa chỉ",
      profileProjectLabel: "5. Tên công trình",
      profileCompanyLabel: "6. Công ty hoặc cá nhân",
      profileNoteLabel: "7. Ghi chú thêm"
    },
    ja: {
      welcomeTitle: "ようこそ",
      welcomeText: "ログインまたは登録してYAMADENアプリをご利用ください。",
      loginTitle: "ログイン",
      loginText: "電話番号と6桁のPINコードを入力してください。",
      registerTitle: "新規登録",
      registerText: "電話番号、6桁のPINコード、確認用PINを入力してください。",
      profileTitle: "お客様情報",
      profileText: "管理者承認のため、お客様情報を入力してください。",
      pendingTitle: "アカウント承認待ち",
      pendingText: "プロフィール情報を送信しました。内容を確認後、できるだけ早くアカウントを承認します。",
      pendingTimeTitle: "目安時間:",
      pendingTimeText: "24〜48営業時間",
      backLogin: "ホームへ戻る",
      login: "ログイン",
      register: "新規登録",
      next: "次へ",
      submit: "管理者へ送信",
      phone: "電話番号",
      contact: "連絡先",
      pin: "PINコード（6桁）",
      pinConfirm: "PINコード確認",
      pinPlaceholder: "6桁のPINコード",
      pinConfirmPlaceholder: "PINコードを再入力",
      name: "お名前",
      email: "Email",
      address: "住所",
      project: "工事件名",
      company: "会社名・個人",
      note: "備考",
      remember: "ログインを保持",
      forgotPin: "PINを忘れた場合",
      noAccount: "アカウント未登録？",
      hasAccount: "すでにアカウントがありますか？",
      terms: "利用規約とプライバシーポリシーに同意します",
      profileNameLabel: "1. お名前",
      profilePhoneLabel: "2. 電話番号",
      profileEmailLabel: "3. Email",
      profileAddressLabel: "4. 住所",
      profileProjectLabel: "5. 工事件名",
      profileCompanyLabel: "6. 会社名・個人",
      profileNoteLabel: "7. 備考"
    }
  };

  function c(key) {
    const lang = getLang();
    return (copy[lang] && copy[lang][key]) || copy.ja[key] || key;
  }

  function syncLangButtons() {
    const lang = getLang();
    const vi = $("authLangVi");
    const ja = $("authLangJa");
    const mainLang = $("language");

    if (vi) {
      vi.classList.toggle("active", lang === "vi");
      vi.classList.toggle("is-active", lang === "vi");
    }

    if (ja) {
      ja.classList.toggle("active", lang === "ja");
      ja.classList.toggle("is-active", lang === "ja");
    }

    if (mainLang) mainLang.value = lang;
  }

  function ensureStartLogo() {
    const startLogo = document.querySelector(".auth-start-logo");
    if (!startLogo) return;
    startLogo.innerHTML = '<img src="/assets/icon-192.png" alt="YAMADEN"><div><b>&#x682a;&#x5f0f;&#x4f1a;&#x793e; &#x5c71;&#x96fb;</b><span>YAMADEN.CO.LTD</span></div>';
  }

  function setupPinNumericOnly() {
    ["accountPin", "accountPinConfirm"].forEach(function (id) {
      const el = $(id);
      if (!el || el.dataset.pinNumericReady === "1") return;
      el.dataset.pinNumericReady = "1";
      el.setAttribute("maxlength", "6");
      el.setAttribute("inputmode", "numeric");
      el.setAttribute("pattern", "[0-9]*");
      el.addEventListener("input", function () {
        el.value = el.value.replace(/\D/g, "").slice(0, 6);
      });
    });
  }

  function updateAuthTextsOnly() {
    const mode = window.accountMode || "welcome";

    if (mode === "welcome") {
      setText("authStartTitle", c("welcomeTitle"));
      setText("authStartText", c("welcomeText"));
      setText("authStartLoginBtn", c("login"));
      setText("authStartRegisterBtn", c("register"));
    }

    if (mode === "login") {
      setText("accountWelcome", c("loginTitle"));
      setText("accountText", c("loginText"));
      setText("accountLoginText", c("login"));
      setText("authRememberText", c("remember"));
      setText("authForgotPin", c("forgotPin"));
      setText("authSwitchPromptText", c("noAccount"));
      setText("authSwitchPromptBtn", c("register"));
      setText("accountPhoneAuthLabel", c("phone"));
      setText("accountPinAuthLabel", c("pin"));
      if ($("accountPhone")) $("accountPhone").placeholder = c("phone");
      if ($("accountPin")) $("accountPin").placeholder = c("pinPlaceholder");
    }

    if (mode === "register") {
      setText("accountWelcome", c("registerTitle"));
      setText("accountText", c("registerText"));
      setText("accountLoginText", c("next"));
      setText("accountPhoneAuthLabel", c("phone"));
      setText("accountPinAuthLabel", c("pin"));
      setText("accountPinConfirmAuthLabel", c("pinConfirm"));
      setHtml("authRegisterTermsText", c("terms"));
      setText("authSwitchPromptText", c("hasAccount"));
      setText("authSwitchPromptBtn", c("login"));
      if ($("accountPhone")) $("accountPhone").placeholder = c("phone");
      if ($("accountPin")) $("accountPin").placeholder = c("pinPlaceholder");
      if ($("accountPinConfirm")) $("accountPinConfirm").placeholder = c("pinConfirmPlaceholder");
    }

    if (mode === "profile") {
      setText("accountWelcome", c("profileTitle"));
      setText("accountText", c("profileText"));
      setText("accountLoginText", c("submit"));
      setText("accountNameAuthLabel", c("profileNameLabel"));
      setText("accountPhoneAuthLabel", c("profilePhoneLabel"));
      setText("accountEmailAuthLabel", c("profileEmailLabel"));
      setText("accountAddressAuthLabel", c("profileAddressLabel"));
      setText("accountProjectAuthLabel", c("profileProjectLabel"));
      setText("accountCompanyAuthLabel", c("profileCompanyLabel"));
      setText("accountNoteAuthLabel", c("profileNoteLabel"));
      if ($("accountName")) $("accountName").placeholder = c("name");
      if ($("accountPhone")) $("accountPhone").placeholder = c("phone");
      if ($("accountEmail")) $("accountEmail").placeholder = c("email");
      if ($("accountAddress")) $("accountAddress").placeholder = c("address");
      if ($("accountProjectName")) $("accountProjectName").placeholder = c("project");
      if ($("accountCompany")) $("accountCompany").placeholder = c("company");
      if ($("accountNote")) $("accountNote").placeholder = c("note");
    }

    if (mode === "pending") {
      ensurePendingScreen();
      setText("authPendingTitle", c("pendingTitle"));
      setText("authPendingText", c("pendingText"));
      setText("pendingTimeTitle", c("pendingTimeTitle"));
      setText("pendingTimeText", c("pendingTimeText"));
      setText("authPendingLoginBtn", c("backLogin"));
    }
  }
  window.updateAuthTextsOnly = updateAuthTextsOnly;

  function ensurePendingScreen() {
    const screen = $("authPendingScreen");
    if (!screen || screen.dataset.finalPendingReady === "1") return;
    screen.dataset.finalPendingReady = "1";
    screen.innerHTML =
      '<div class="pending-status-icon" aria-hidden="true"><span></span></div>' +
      '<div class="auth-pending-title" id="authPendingTitle"></div>' +
      '<div class="auth-pending-text" id="authPendingText"></div>' +
      '<div class="pending-time-box">' +
        '<div class="pending-time-icon" aria-hidden="true">⏱</div>' +
        '<div><b id="pendingTimeTitle"></b><span id="pendingTimeText"></span></div>' +
      '</div>' +
      '<button type="button" class="main-btn auth-primary" id="authPendingLoginBtn"></button>';

    const btn = $("authPendingLoginBtn");
    if (btn) {
      btn.onclick = function () {
        try {
          localStorage.removeItem("userToken");
          localStorage.removeItem("userProfile");
        } catch (e) {}
        window.currentUser = null;
        try { currentUser = null; } catch (e) {}
        if (typeof window.setAccountMode === "function") window.setAccountMode("welcome");
      };
    }
  }

   window.setAuthLanguage = function (next) {
  const lang = next === "vi" ? "vi" : "ja";

  window.lang = lang;

  localStorage.setItem("language", lang);
  localStorage.setItem("lang", lang);
  if ($("language")) $("language").value = lang;

  const mode = window.accountMode || "welcome";
  const authOnly = ["welcome", "login", "register", "profile", "pending"].includes(mode);
  if (!authOnly && typeof window.applyLanguage === "function") {
    window.applyLanguage();
  }

  syncLangButtons();
  updateAuthTextsOnly();

  if (window.__updateIssueList) {
    window.__updateIssueList();
  }
  };

  window.setAccountMode = function (mode) {
    const card = $("accountFormCard");
    if (!card) return;

    const allowed = ["welcome", "login", "register", "profile", "pending"];
    mode = allowed.includes(mode) ? mode : "welcome";
    window.accountMode = mode;
    try { accountMode = mode; } catch (e) {}

    const isWelcome = mode === "welcome";
    const isLogin = mode === "login";
    const isRegister = mode === "register";
    const isProfile = mode === "profile";
    const isPending = mode === "pending";

    card.classList.toggle("auth-mode-welcome", isWelcome);
    card.classList.toggle("auth-mode-form", isLogin || isRegister || isProfile);
    card.classList.toggle("auth-mode-login", isLogin);
    card.classList.toggle("auth-mode-register", isRegister || isLogin);
    card.classList.toggle("auth-mode-profile", isProfile);
    card.classList.toggle("auth-mode-pending", isPending);

    show($("authStartScreen"), isWelcome);
    show($("authPendingScreen"), isPending);
    show($("authBackBtn"), isLogin || isRegister || isProfile);
    show(document.querySelector(".account-welcome"), isLogin || isRegister || isProfile);
    show(document.querySelector(".account-mode"), false);
    show($("accountFields"), isLogin || isRegister || isProfile);
    show(document.querySelector("#accountFormCard > .main-btn"), isLogin || isRegister || isProfile);

    const fields = {
      name: $("accountName"),
      phone: $("accountPhone"),
      pin: $("accountPin"),
      pinConfirm: $("accountPinConfirm"),
      email: $("accountEmail"),
      contact: $("accountContact"),
      address: $("accountAddress"),
      province: $("accountProvince"),
      project: $("accountProjectName"),
      company: $("accountCompany"),
      note: $("accountNote")
    };

    const labels = {
      name: $("accountNameAuthLabel"),
      phone: $("accountPhoneAuthLabel"),
      pin: $("accountPinAuthLabel"),
      pinConfirm: $("accountPinConfirmAuthLabel"),
      email: $("accountEmailAuthLabel"),
      contact: $("accountContactAuthLabel"),
      address: $("accountAddressAuthLabel"),
      project: $("accountProjectAuthLabel"),
      company: $("accountCompanyAuthLabel"),
      note: $("accountNoteAuthLabel")
    };

    Object.values(fields).forEach(el => show(el, false));
    Object.values(labels).forEach(el => show(el, false));
    [fields.pinConfirm, labels.pinConfirm].forEach(el => {
      if (el) el.classList.remove("auth-login-placeholder");
    });
    if (fields.pinConfirm) fields.pinConfirm.disabled = false;
    show($("authLoginOptions"), false);
    show($("authRegisterTerms"), false);
    show($("authSwitchPrompt"), false);

    if (isLogin) {
      show(fields.phone, true);
      show(fields.pin, true);
      show(fields.pinConfirm, true);
      show(labels.phone, true);
      show(labels.pin, true);
      show(labels.pinConfirm, true);
      [fields.pinConfirm, labels.pinConfirm].forEach(el => {
        if (el) el.classList.add("auth-login-placeholder");
      });
      if (fields.pinConfirm) fields.pinConfirm.disabled = true;
      show($("authLoginOptions"), true);
      show($("authSwitchPrompt"), true);
      const switchBtn = $("authSwitchPromptBtn");
      if (switchBtn) switchBtn.onclick = () => window.setAccountMode("register");
    }

    if (isRegister) {
      show(fields.phone, true);
      show(fields.pin, true);
      show(fields.pinConfirm, true);
      show(labels.phone, true);
      show(labels.pin, true);
      show(labels.pinConfirm, true);
      show($("authRegisterTerms"), true);
      show($("authSwitchPrompt"), true);
      const switchBtn = $("authSwitchPromptBtn");
      if (switchBtn) switchBtn.onclick = () => window.setAccountMode("login");
    }

    if (isProfile) {
      show(fields.name, true);
      show(fields.phone, true);
      show(fields.email, true);
      show(fields.contact, true);
      show(fields.address, true);
      show(fields.project, true);
      show(fields.company, true);
      show(fields.note, true);
      show(labels.name, true);
      show(labels.phone, true);
      show(labels.email, true);
      show(labels.contact, true);
      show(labels.address, true);
      show(labels.project, true);
      show(labels.company, true);
      show(labels.note, true);
    }

    updateAuthTextsOnly();
    syncLangButtons();
  };

  window.updateAccountUI = function () {
    const user = getSavedUser();
    window.currentUser = user;
    try { currentUser = user; } catch (e) {}

    const loggedIn = isActiveUser(user);
    const pending = isPendingUser(user);
    const formCard = $("accountFormCard");
    const profileCard = $("profileCard");

    if (formCard) formCard.style.display = loggedIn ? "none" : "block";
    if (profileCard) profileCard.style.display = loggedIn ? "block" : "none";

    if (user) {
      if ($("profileName")) $("profileName").innerText = user.name || user.phone || "";
      if ($("profilePhone")) $("profilePhone").innerText = user.phone || "";
      if ($("profileEmail")) $("profileEmail").innerText = user.email || "";
      if ($("profileProvince")) $("profileProvince").innerText = user.province || "";
      if ($("profileProject")) $("profileProject").innerText = user.projectName || "";
      if ($("profileCompany")) $("profileCompany").innerText = user.company || "";
      if ($("profileRequests") && typeof window.getMyRequests === "function") $("profileRequests").innerText = window.getMyRequests().length;

      if ($("accountName")) $("accountName").value = user.name || "";
      if ($("accountPhone")) $("accountPhone").value = user.phone || "";
      if ($("accountEmail")) $("accountEmail").value = user.email || "";
      if ($("accountAddress")) $("accountAddress").value = user.address || user.province || "";
      if ($("accountNote")) $("accountNote").value = user.note || "";
      if ($("accountProvince")) $("accountProvince").value = user.province || user.address || "";
      if ($("accountProjectName")) $("accountProjectName").value = user.projectName || "";
      if ($("accountCompany")) $("accountCompany").value = user.company || "";
      if ($("name")) $("name").value = user.name || "";
      if ($("phone")) $("phone").value = user.phone || "";
      if ($("address")) $("address").value = user.address || user.projectName || "";
    }

    if (loggedIn) return;
    if (pending) return window.setAccountMode("pending");

    const current = window.accountMode || "welcome";
    window.setAccountMode(["login", "register", "profile"].includes(current) ? current : "welcome");
  };

  const oldShowTab = window.showTab;
  window.showTab = function (tab) {
    if (typeof oldShowTab === "function") oldShowTab(tab);

    const app = document.querySelector(".app");
    const loggedIn = isActiveUser(getSavedUser());

    if (app) {
      app.classList.toggle("auth-login-mode", tab === "account" && !loggedIn);
      app.classList.toggle("auth-app-mode", loggedIn);
    }

    if (tab === "account" && !loggedIn) window.updateAccountUI();
    syncLangButtons();
  };

  const oldUserLogout = window.userLogout;
  window.userLogout = function () {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    window.currentUser = null;
    window.accountMode = "welcome";
    try { accountMode = "welcome"; } catch (e) {}
    if (typeof oldUserLogout === "function") {
      try { oldUserLogout(); } catch (e) {}
    }
    window.showTab("account");
    window.setAccountMode("welcome");
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupPinNumericOnly();
    ensureStartLogo();

    const vi = $("authLangVi");
    const ja = $("authLangJa");
    if (vi) vi.onclick = () => window.setAuthLanguage("vi");
    if (ja) ja.onclick = () => window.setAuthLanguage("ja");

    const user = getSavedUser();
    if (isActiveUser(user)) {
      if (typeof window.showTab === "function") window.showTab("home");
    } else {
      window.accountMode = "welcome";
      try { accountMode = "welcome"; } catch (e) {}
      if (typeof window.showTab === "function") window.showTab("account");
      window.setAccountMode("welcome");
    }

    syncLangButtons();
  });

  setTimeout(function () {
    ensureStartLogo();
    syncLangButtons();
    setupPinNumericOnly();
  }, 300);
})();
