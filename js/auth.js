(function () {
  function $(id) { return document.getElementById(id); }
  function getLang() { return (localStorage.getItem("language") || localStorage.getItem("lang") || window.lang || "ja") === "vi" ? "vi" : "ja"; }
  function setText(id, text) { const el = $(id); if (el) el.innerText = text; }
  function setHtml(id, html) { const el = $(id); if (el) el.innerHTML = html; }
  function show(el, visible) { if (el) el.classList.toggle("hidden", !visible); }
  function getSavedUser() { try { return JSON.parse(localStorage.getItem("userProfile") || "null"); } catch (e) { return null; } }
  function isActiveUser(user) { return !!(user && user.status === "active" && user.profileCompleted); }
  function isPendingUser(user) { return !!(user && user.profileCompleted && user.status !== "active"); }

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
      pendingTitle: "Thông tin đã được gửi",
      pendingText: "Tài khoản của bạn đang chờ admin duyệt. Sau khi đuợc phê duyệt, bạn mới có thể sử dụng đầy đủ chức năng của app.",
      pendingPill: "Đang chờ duyệt",
      backLogin: "Quay lại đăng nhập",
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
      note: "Ghi chú thêm"
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
      pendingTitle: "情報を送信しました",
      pendingText: "管理者承認待ちです。承認後にアプリをご利用いただけます。",
      pendingPill: "承認待ち",
      backLogin: "ログインに戻る",
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
      note: "備考"
    }
  };

  function c(key) { const lang = getLang(); return (copy[lang] && copy[lang][key]) || copy.ja[key] || key; }

  function syncLangButtons() {
    const lang = getLang();
    const vi = $("authLangVi");
    const ja = $("authLangJa");
    if (vi) vi.classList.toggle("active", lang === "vi");
    if (ja) ja.classList.toggle("active", lang === "ja");
    const mainLang = $("language");
    if (mainLang) mainLang.value = lang;
  }

  function ensureStartLogo() {
    const startLogo = document.querySelector(".auth-start-logo");
    if (!startLogo) return;
    startLogo.innerHTML = '<img src="/icon-192.png" alt="YAMADEN"><div><b>&#x682a;&#x5f0f;&#x4f1a;&#x793e; &#x5c71;&#x96fb;</b><span>YAMADEN.CO.LTD</span></div>';
  }

  const oldSetAuthLanguage = window.setAuthLanguage;
  window.setAuthLanguage = function (next) {
    const lang = next === "vi" ? "vi" : "ja";
    window.lang = lang;
    localStorage.setItem("language", lang);
    localStorage.setItem("lang", lang);
    if (typeof oldSetAuthLanguage === "function") {
      try { oldSetAuthLanguage(lang); } catch (e) {}
    } else if (typeof window.applyLanguage === "function") {
      try { window.applyLanguage(); } catch (e) {}
    }
    const currentMode = (typeof accountMode !== "undefined" ? accountMode : window.accountMode) || "welcome";
    window.setAccountMode(currentMode);
    syncLangButtons();
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
      name: $("accountName"), phone: $("accountPhone"), pin: $("accountPin"), pinConfirm: $("accountPinConfirm"),
      email: $("accountEmail"), contact: $("accountContact"), address: $("accountAddress"), province: $("accountProvince"),
      project: $("accountProjectName"), company: $("accountCompany"), note: $("accountNote")
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
    show($("authLoginOptions"), false);
    show($("authRegisterTerms"), false);
    show($("authSwitchPrompt"), false);

    if (isWelcome) {
      setText("authStartTitle", c("welcomeTitle"));
      setText("authStartText", c("welcomeText"));
      setText("authStartLoginBtn", c("login"));
      setText("authStartRegisterBtn", c("register"));
    }

    if (isLogin) {
      show(fields.phone, true); show(fields.pin, true);
      show(labels.phone, true); show(labels.pin, true);
      show($("authLoginOptions"), true);
      show($("authSwitchPrompt"), true);
      setText("accountWelcome", c("loginTitle"));
      setText("accountText", c("loginText"));
      setText("accountLoginText", c("login"));
      setText("authRememberText", getLang() === "ja" ? "ログインを保持" : "Ghi nhớ đăng nhập");
      setText("authForgotPin", getLang() === "ja" ? "PINを忘れた場合" : "Quên PIN?");
      setText("authSwitchPromptText", getLang() === "ja" ? "アカウント未登録？" : "Chưa có tài khoản?");
      setText("authSwitchPromptBtn", c("register"));
      const switchBtn = $("authSwitchPromptBtn");
      if (switchBtn) switchBtn.onclick = () => window.setAccountMode("register");
      setText("accountPhoneAuthLabel", c("phone"));
      setText("accountPinAuthLabel", c("pin"));
      if (fields.phone) fields.phone.placeholder = c("phone");
      if (fields.pin) fields.pin.placeholder = c("pinPlaceholder");
    }

    if (isRegister) {
      show(fields.phone, true); show(fields.pin, true); show(fields.pinConfirm, true);
      show(labels.phone, true); show(labels.pin, true); show(labels.pinConfirm, true);
      show($("authRegisterTerms"), true);
      show($("authSwitchPrompt"), true);
      setText("accountWelcome", c("registerTitle"));
      setText("accountText", c("registerText"));
      setText("accountLoginText", c("next"));
      setText("accountPhoneAuthLabel", c("phone"));
      setText("accountPinAuthLabel", c("pin"));
      setText("accountPinConfirmAuthLabel", c("pinConfirm"));
      setHtml("authRegisterTermsText", getLang() === "ja" ? "利用規約とプライバシーポリシーに同意します" : "Tôi đồng ý với <b>Điều khoản sử dụng</b> và <b>Chính sách bảo mật</b>");
      setText("authSwitchPromptText", getLang() === "ja" ? "すでにアカウントがありますか？" : "Đã có tài khoản?");
      setText("authSwitchPromptBtn", c("login"));
      const switchBtn = $("authSwitchPromptBtn");
      if (switchBtn) switchBtn.onclick = () => window.setAccountMode("login");
      if (fields.phone) fields.phone.placeholder = c("phone");
      if (fields.pin) fields.pin.placeholder = c("pinPlaceholder");
      if (fields.pinConfirm) fields.pinConfirm.placeholder = c("pinConfirmPlaceholder");
    }

    if (isProfile) {
      show(fields.name, true); show(fields.phone, true); show(fields.email, true); show(fields.contact, true); show(fields.address, true); show(fields.project, true); show(fields.company, true); show(fields.note, true);
      show(labels.name, true); show(labels.phone, true); show(labels.email, true); show(labels.contact, true); show(labels.address, true); show(labels.project, true); show(labels.company, true); show(labels.note, true);
      setText("accountWelcome", c("profileTitle"));
      setText("accountText", c("profileText"));
      setText("accountLoginText", c("submit"));
      setText("accountNameAuthLabel", getLang() === "ja" ? "1. お名前" : "1. Họ và tên");
      setText("accountPhoneAuthLabel", getLang() === "ja" ? "2. 電話番号" : "2. Số điện thoại");
      setText("accountEmailAuthLabel", getLang() === "ja" ? "3. Email" : "3. Email");
      setText("accountAddressAuthLabel", getLang() === "ja" ? "4. 住所" : "4. Địa chỉ");
      setText("accountProjectAuthLabel", getLang() === "ja" ? "5. 工事件名" : "5. Tên công trình");
      setText("accountCompanyAuthLabel", getLang() === "ja" ? "6. 会社名・個人" : "6. Công ty hoặc cá nhân");
      setText("accountNoteAuthLabel", getLang() === "ja" ? "7. 備考" : "7. Ghi chú thêm");
      if (fields.name) fields.name.placeholder = c("name");
      if (fields.phone) fields.phone.placeholder = c("phone");
      if (fields.email) fields.email.placeholder = c("email");
      if (fields.address) fields.address.placeholder = c("address");
      if (fields.province) fields.province.value = fields.address ? fields.address.value : fields.province.value;
      if (fields.project) fields.project.placeholder = c("project");
      if (fields.company) fields.company.placeholder = c("company");
      if (fields.note) fields.note.placeholder = c("note");
    }

    if (isPending) {
      setText("authPendingTitle", c("pendingTitle"));
      setText("authPendingText", c("pendingText"));
      setText("authPendingPill", c("pendingPill"));
      setText("authPendingLoginBtn", c("backLogin"));
    }

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
    const current = (typeof accountMode !== "undefined" ? accountMode : window.accountMode) || "welcome";
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
    if (typeof oldUserLogout === "function") { try { oldUserLogout(); } catch (e) {} }
    window.showTab("account");
    window.setAccountMode("welcome");
  };

  function setupPinNumericOnly() {
    ["accountPin", "accountPinConfirm"].forEach(function(id) {
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

  setTimeout(function () { ensureStartLogo(); syncLangButtons(); }, 300);
})();

/* ===== Module boundary: auth UI patches/fixes ===== */

(function(){
  function getLang(){
    try{return window.lang==='vi'?'vi':'ja'}catch(e){return String(localStorage.getItem('language')||'ja').indexOf('vi')===0?'vi':'ja'}
  }
  function applyPendingDemo(){
    var card=document.getElementById('accountFormCard');
    if(!card||!card.classList.contains('auth-mode-pending'))return;
    var isVi=getLang()==='vi';
    var title=document.getElementById('authPendingTitle');
    var text=document.getElementById('authPendingText');
    var pill=document.getElementById('authPendingPill');
    var btn=document.getElementById('authPendingLoginBtn');
    if(title)title.textContent=isVi?'Tài khoản đang chờ duyệt':'アカウント承認待ち';
    if(text)text.textContent=isVi?'Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và duyệt tài khoản trong thời gian sớm nhất.':'プロフィール情報を送信しました。内容を確認後、できるだけ早くアカウントを承認します。';
    if(pill)pill.textContent=isVi?'Thời gian dự kiến:\n24 – 48 giờ làm việc':'目安時間:\n24〜48営業時間';
    if(btn){
      btn.textContent=isVi?'Quay về trang chủ':'ホームへ戻る';
      btn.onclick=function(){
        try{localStorage.removeItem('userToken');localStorage.removeItem('userProfile')}catch(e){}
        if(typeof window.setAccountMode==='function')window.setAccountMode('welcome');
      };
    }
  }
  var oldSet=window.setAccountMode;
  window.setAccountMode=function(){var r=typeof oldSet==='function'?oldSet.apply(this,arguments):undefined;setTimeout(applyPendingDemo,0);return r};
  var oldApply=window.applyLanguage;
  window.applyLanguage=function(){if(typeof oldApply==='function')oldApply.apply(this,arguments);setTimeout(applyPendingDemo,0)};
  document.addEventListener('DOMContentLoaded',function(){setTimeout(applyPendingDemo,0)});
  setTimeout(applyPendingDemo,0);
})();

/* ===== Module boundary: auth UI patches/fixes ===== */

(function(){
  function fixProfileFields(){
    var card=document.getElementById('accountFormCard');
    if(!card||!card.classList.contains('auth-mode-profile'))return;
    var contact=document.getElementById('accountContact');
    var contactLabel=document.getElementById('accountContactAuthLabel');
    if(contact)contact.classList.add('hidden');
    if(contactLabel)contactLabel.classList.add('hidden');
    var emailLabel=document.getElementById('accountEmailAuthLabel');
    if(emailLabel)emailLabel.textContent=(window.lang==='ja')?'3. Email':'3. Email';
    var noteLabel=document.getElementById('accountNoteAuthLabel');
    if(noteLabel)noteLabel.textContent=(window.lang==='ja')?'7. 備考':'7. Ghi chú thêm';
    var note=document.getElementById('accountNote');
    if(note)note.placeholder=(window.lang==='ja')?'備考':'Ghi chú thêm';
  }
  var oldSet=window.setAccountMode;
  window.setAccountMode=function(){var r=typeof oldSet==='function'?oldSet.apply(this,arguments):undefined;setTimeout(fixProfileFields,0);return r};
  var oldApply=window.applyLanguage;
  window.applyLanguage=function(){if(typeof oldApply==='function')oldApply.apply(this,arguments);setTimeout(fixProfileFields,0)};
  document.addEventListener('DOMContentLoaded',function(){setTimeout(fixProfileFields,0)});
  setTimeout(fixProfileFields,0);
})();

/* ===== Module boundary: auth UI patches/fixes ===== */

(function(){
  function getLang(){
    try{return (window.lang==='vi'||localStorage.getItem('language')==='vi'||localStorage.getItem('lang')==='vi')?'vi':'ja';}
    catch(e){return 'ja';}
  }
  function ensurePendingLogo(){
    var screen=document.getElementById('authPendingScreen');
    if(!screen)return;
    if(!screen.querySelector('.auth-pending-logo')){
      var logo=document.createElement('div');
      logo.className='auth-pending-logo';
      logo.innerHTML='<img src="/icon-192.png" alt="YAMADEN"><div><b>株式会社 山電</b><span>YAMADEN.CO.LTD</span></div>';
      screen.insertBefore(logo,screen.firstChild);
    }
  }
  function applyPendingUI(){
    ensurePendingLogo();
    var card=document.getElementById('accountFormCard');
    if(!card||!card.classList.contains('auth-mode-pending'))return;
    var isVi=getLang()==='vi';
    var title=document.getElementById('authPendingTitle');
    var text=document.getElementById('authPendingText');
    var pill=document.getElementById('authPendingPill');
    var btn=document.getElementById('authPendingLoginBtn');
    if(title)title.textContent=isVi?'Tài khoản đang chờ duyệt':'アカウント承認待ち';
    if(text)text.textContent=isVi?'Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và duyệt tài khoản trong thời gian sớm nhất.':'プロフィール情報を送信しました。内容を確認後、できるだけ早くアカウントを承認します。';
    if(pill)pill.textContent=isVi?'Thời gian dự kiến:\n24 – 48 giờ làm việc':'目安時間:\n24〜48営業時間';
    if(btn){
      btn.textContent=isVi?'Quay về trang chủ':'ホームへ戻る';
      btn.classList.remove('soft-btn','auth-secondary');
      btn.classList.add('main-btn','auth-primary');
      btn.onclick=function(){
        try{localStorage.removeItem('userToken');localStorage.removeItem('userProfile');}catch(e){}
        if(typeof window.setAccountMode==='function')window.setAccountMode('welcome');
      };
    }
  }
  var oldSet=window.setAccountMode;
  window.setAccountMode=function(){
    var result=typeof oldSet==='function'?oldSet.apply(this,arguments):undefined;
    setTimeout(applyPendingUI,0);
    return result;
  };
  var oldApply=window.applyLanguage;
  window.applyLanguage=function(){
    if(typeof oldApply==='function')oldApply.apply(this,arguments);
    setTimeout(applyPendingUI,0);
  };
  document.addEventListener('DOMContentLoaded',function(){setTimeout(applyPendingUI,0);});
  setTimeout(applyPendingUI,0);
})();

/* ===== Module boundary: auth UI patches/fixes ===== */

(function(){
  function getLang(){
    try{
      return (window.lang === 'vi' ||
        localStorage.getItem('language') === 'vi' ||
        localStorage.getItem('lang') === 'vi') ? 'vi' : 'ja';
    }catch(e){
      return 'ja';
    }
  }

  function setActiveLangButton(){
    var isVi = getLang() === 'vi';
    var vi = document.getElementById('authLangVi');
    var ja = document.getElementById('authLangJa');
    if(vi){
      vi.classList.toggle('active', isVi);
      vi.classList.toggle('is-active', isVi);
    }
    if(ja){
      ja.classList.toggle('active', !isVi);
      ja.classList.toggle('is-active', !isVi);
    }
  }

  function rebuildPendingScreen(){
    var screen = document.getElementById('authPendingScreen');
    if(!screen) return;

    var isVi = getLang() === 'vi';

    screen.innerHTML =
      '<div class="pending-status-icon" aria-hidden="true"><span></span></div>' +
      '<div class="auth-pending-title" id="authPendingTitle">' +
        (isVi ? 'Tài khoản đang chờ duyệt' : 'アカウント承認待ち') +
      '</div>' +
      '<div class="auth-pending-text" id="authPendingText">' +
        (isVi
          ? 'Hồ sơ của bạn đã được gửi thành công. Chúng tôi sẽ xem xét và duyệt tài khoản trong thời gian sớm nhất.'
          : 'プロフィール情報を送信しました。内容を確認後、できるだけ早くアカウントを承認します。') +
      '</div>' +
      '<div class="pending-time-box">' +
        '<div class="pending-time-icon" aria-hidden="true">⏱</div>' +
        '<div>' +
          '<b id="pendingTimeTitle">' + (isVi ? 'Thời gian dự kiến:' : '目安時間:') + '</b>' +
          '<span id="pendingTimeText">' + (isVi ? '24 – 48 giờ làm việc' : '24〜48営業時間') + '</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="main-btn auth-primary" id="authPendingLoginBtn">' +
        (isVi ? 'Quay về trang chủ' : 'ホームへ戻る') +
      '</button>';

    var btn = document.getElementById('authPendingLoginBtn');
    if(btn){
      btn.onclick = function(){
        try{
          localStorage.removeItem('userToken');
          localStorage.removeItem('userProfile');
        }catch(e){}
        if(typeof window.setAccountMode === 'function'){
          window.setAccountMode('welcome');
        }
      };
    }
  }

  function applyPendingUI(){
    var card = document.getElementById('accountFormCard');
    if(!card || !card.classList.contains('auth-mode-pending')) return;

    var back = document.getElementById('authBackBtn');
    if(back){
      back.classList.remove('hidden');
      back.setAttribute('aria-label', 'Back');
    }

    rebuildPendingScreen();
    setActiveLangButton();
  }

  var oldSetAccountMode = window.setAccountMode;
  window.setAccountMode = function(){
    var result = typeof oldSetAccountMode === 'function'
      ? oldSetAccountMode.apply(this, arguments)
      : undefined;

    setTimeout(applyPendingUI, 0);
    setTimeout(applyPendingUI, 80);
    return result;
  };

  var oldApplyLanguage = window.applyLanguage;
  window.applyLanguage = function(){
    if(typeof oldApplyLanguage === 'function'){
      oldApplyLanguage.apply(this, arguments);
    }
    setTimeout(applyPendingUI, 0);
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(applyPendingUI, 0);
    setTimeout(applyPendingUI, 120);
  });

  setTimeout(applyPendingUI, 0);
})();
