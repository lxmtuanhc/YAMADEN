// ========== CONFIGURATION ==========
const API = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? location.origin
  : "https://yamaden.onrender.com";
let lang = localStorage.getItem("language") || "ja";
let currentUser = null;
let accountMode = "welcome";
let previewUrls = [];
let selectedMediaFiles = [];
let lastCheckedId = "";
let lastAdminReply = "";

const ICONS = {
  user: `<svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`,
  phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.6a2 2 0 0 1-.45 2.11L9 10.6a16 16 0 0 0 4.4 4.4l1.17-1.15a2 2 0 0 1 2.11-.45c.83.28 1.7.48 2.6.6A2 2 0 0 1 22 16.92Z"/></svg>`,
  message: `<svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8"/><path d="M12 3v12"/></svg>`,
  send: `<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
  copy: `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  chart: `<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`,
  file: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`,
  zap: `<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z"/></svg>`,
  tool: `<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.8-2.8 2.2-2.6Z"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.8Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 4v16"/></svg>`,
  bell: `<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
  edit: `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  spinner: `<svg class="spin" viewBox="0 0 24 24"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`
};

const texts = {
  vi: { welcomeTitle:"Chúng tôi luôn sẵn sàng hỗ trợ bạn", welcomeText:"Gửi yêu cầu và chúng tôi sẽ liên hệ hỗ trợ bạn.", homeSend:"Gửi yêu cầu", homeCheck:"Tra cứu trạng thái", trust1:"Tiếp nhận nhanh", trust2:"Hỗ trợ Việt / Nhật", trust3:"Tra cứu bằng ID", name:"Họ và tên", phone:"Số điện thoại", contact:"Liên hệ", address:"Địa chỉ", content:"Nội dung yêu cầu", image:"Hình ảnh", send:"Gửi yêu cầu", check:"Kiểm tra", success:"Thành công!", fail:"Thất bại!", required:"Vui lòng nhập đầy đủ thông tin!", requestId:"Mã yêu cầu", copy:"Sao chép ID", copied:"Đã copy ID!", notFound:"Không tìm thấy!", status:"Trạng thái", pending:"Chờ xử lý", processing:"Đang xử lý", completed:"Hoàn thành", adminReply:"Phản hồi admin", noReply:"Chưa có phản hồi", noImage:"Không có hình", newReply:"Admin đã phản hồi!", myRequests:"Yêu cầu của tôi", noHistory:"Chưa có lịch sử", clearHistory:"Xóa lịch sử", saveIdTip:"Vui lòng lưu ID để tra cứu sau.", networkError:"Lỗi kết nối", issueTitle:"Chọn vấn đề", issueSub:"Tìm và chọn nội dung công việc", issueRequired:"Chọn ít nhất 1 vấn đề", freeDesc:"Hãy nhập tình trạng, vị trí và điều bạn cần hỗ trợ.", quote:"Muốn nhận báo giá", settingsTitle:"Cài đặt", language:"Ngôn ngữ", languageSub:"日本語 / Tiếng Việt", accountText:"Đăng nhập để lưu lịch sử.", accountLogin:"Đăng nhập", accountLogout:"Đăng xuất", profileActive:"Hoạt động", profilePhone:"Số điện thoại", profileProvince:"Tỉnh/thành", profileProject:"Công trình", profileCompany:"Công ty", profileRequests:"Yêu cầu", accountTab:"Tài khoản", accountRegister:"Khách mới", accountLoginMode:"Đã có TK", quickSupportTitle:"Cần hỗ trợ?", quickSupportText:"Gửi yêu cầu không cần đăng nhập", quickSupportBtn:"Gửi nhanh", sideStep1:"Gửi sự cố", sideStep2:"Theo dõi", sideStep3:"Nhận phản hồi", tabSend:"Gửi yêu cầu", tabCheck:"Tra cứu", uploadText:"Chọn ảnh/video", chooseImage:"Chọn file", fileSelected:"Đã chọn", copyId:"Copy ID", history:"Lịch sử", sending:"Đang gửi...", loading:"Đang tải...", successSub:"Cảm ơn bạn!", copyIdText:"Copy ID", historyText:"Lịch sử", tabServices:"Dịch vụ", servicesPageTitle:"Dịch vụ chi tiết", detail1Title:"Điện tổng hợp", detail1Text:"Thi công điện cho nhà ở, tòa nhà", detail2Title:"Đo lường điều khiển", detail2Text:"Hỗ trợ hệ thống điều khiển", detail3Title:"Bảo trì tự động", detail3Text:"Kiểm tra bảo trì hệ thống", detailBtn:"Gửi yêu cầu", companyTitle:"Thông tin công ty", companyNameLabel:"Tên công ty", companyNameValue:"Công ty TNHH YAMADEN", companyServiceLabel:"Lĩnh vực", companyServiceValue:"Điện / Điều khiển / Bảo trì", companyAddressLabel:"Địa chỉ", companyTelLabel:"Điện thoại", callCompany:"Gọi", mapCompany:"Bản đồ", safetyTitle:"An toàn điện", safetyText:"Nếu có mùi khét, ổ cắm nóng, hãy ngừng sử dụng và gửi yêu cầu.", maintenanceTitle:"Bảo trì định kỳ", maintenanceText:"Kiểm tra thiết bị định kỳ để vận hành ổn định.", galleryMain:"Điện công trình, đo lường điều khiển và bảo trì", gallery1:"Phản hồi linh hoạt", gallery2:"Chất lượng ổn định", serviceTitle:"Dịch vụ", service1Title:"Sửa chữa điện", service1Desc:"Xử lý sự cố đèn, ổ cắm", service2Title:"Lắp đặt thiết bị", service2Desc:"Hỗ trợ thiết bị, đi dây", service3Title:"Theo dõi yêu cầu", service3Desc:"Kiểm tra trạng thái bằng ID", philosophyKicker:"TRIẾT LÝ", philosophyTitle:"Bảo vệ con người", philosophyText:"YAMADEN đặt con người ở trung tâm.", philosophyVisual:"Công ty TNHH YAMADEN", homeKicker:"YAMADEN SUPPORT", homeTitle:"Dịch vụ hỗ trợ điện", homeDesc:"Gửi yêu cầu, đính kèm ảnh và theo dõi trạng thái." },
  ja: { welcomeTitle:"いつでもサポートします", welcomeText:"依頼を送信すると、担当者がご連絡します。", homeSend:"依頼を送信", homeCheck:"状況を確認", trust1:"迅速受付", trust2:"日越対応", trust3:"IDで確認", name:"お名前", phone:"電話番号", contact:"連絡先", address:"住所", content:"依頼内容", image:"画像", send:"送信", check:"確認", success:"送信完了！", fail:"送信失敗！", required:"必須項目を入力してください。", requestId:"受付ID", copy:"IDをコピー", copied:"IDをコピーしました！", notFound:"見つかりませんでした", status:"状態", pending:"受付済み", processing:"処理中", completed:"完了", adminReply:"管理者コメント", noReply:"返信なし", noImage:"画像なし", newReply:"管理者から返信あり！", myRequests:"自分の依頼", noHistory:"履歴がありません", clearHistory:"履歴を削除", saveIdTip:"IDを保存してください", networkError:"サーバーに接続できません", issueTitle:"依頼内容を選択", issueSub:"作業内容を検索して選択", issueRequired:"依頼内容を選択してください", freeDesc:"状況、場所、必要なサポート内容を入力してください。", quote:"見積を希望する", settingsTitle:"設定", language:"言語", languageSub:"日本語 / Tiếng Việt", accountText:"ログインすると履歴を保存できます", accountLogin:"ログイン", accountLogout:"ログアウト", profileActive:"有効", profilePhone:"電話番号", profileProvince:"都道府県", profileProject:"工事名", profileCompany:"会社名", profileRequests:"依頼数", accountTab:"アカウント", accountRegister:"新規登録", accountLoginMode:"登録済み", quickSupportTitle:"すぐに依頼？", quickSupportText:"ログインなしでも依頼できます", quickSupportBtn:"クイック依頼", sideStep1:"不具合を送信", sideStep2:"状況を確認", sideStep3:"返信を受信", tabSend:"依頼送信", tabCheck:"自分の依頼", uploadText:"画像/動画を選択", chooseImage:"ファイル選択", fileSelected:"ファイル選択済み", copyId:"IDコピー", history:"履歴", sending:"送信中...", loading:"読み込み中...", successSub:"担当者よりご連絡します。", copyIdText:"IDコピー", historyText:"履歴", tabServices:"サービス", servicesPageTitle:"サービス詳細", detail1Title:"一般電気工事", detail1Text:"住宅、ビルの配線工事", detail2Title:"計装工事", detail2Text:"制御システムを計測・管理", detail3Title:"自動制御保守", detail3Text:"システムの点検保守", detailBtn:"この内容で依頼", companyTitle:"会社情報", companyNameLabel:"会社名", companyNameValue:"株式会社山電", companyServiceLabel:"事業内容", companyServiceValue:"電気工事 / 計装工事 / 保守", companyAddressLabel:"所在地", companyTelLabel:"電話番号", callCompany:"山電へ電話", mapCompany:"地図を開く", safetyTitle:"今日の安全", safetyText:"焦げた臭い、発熱、火花の場合は使用を止めて依頼してください。", maintenanceTitle:"定期メンテナンス", maintenanceText:"トラブル前に点検することで安定運用できます。", galleryMain:"電気工事・計装工事・保守メンテナンス", gallery1:"現場ニーズに柔軟対応", gallery2:"施工後まで品質管理", serviceTitle:"サービス", service1Title:"一般電気工事", service1Desc:"建物内配線、引き込み工事", service2Title:"計装工事", service2Desc:"制御装置を計測・管理", service3Title:"自動制御保守", service3Desc:"設備の点検保守", philosophyKicker:"理念", philosophyTitle:"人を守り、幸せを創る", philosophyText:"山電は、仲間・家族・お客様を大切にします。", philosophyVisual:"株式会社山電", homeKicker:"YAMADEN SUPPORT", homeTitle:"電気工事・修理の依頼", homeDesc:"写真を添付し、IDで状況を確認できます。" }
};

const YAMADEN_WEB_COPY = {
  vi: {
    welcomeTitle: "YAMADEN luôn sẵn sàng hỗ trợ bạn",
    welcomeText: "Gửi yêu cầu để đội ngũ phụ trách kiểm tra, phản hồi và hỗ trợ công trình nhanh chóng.",
    homeKicker: "YAMADEN SUPPORT",
    homeTitle: "Điện công trình, đo lường điều khiển và bảo trì từ Hiroshima",
    homeDesc: "YAMADEN hỗ trợ công trình điện tổng hợp, hệ thống điều khiển và bảo trì thiết bị tự động với tinh thần chất lượng, tốc độ và sự tin cậy.",
    homeSend: "Gửi yêu cầu",
    homeCheck: "Tra cứu trạng thái",
    trust1: "Tiếp nhận nhanh",
    trust2: "Hỗ trợ Việt / Nhật",
    trust3: "Theo dõi bằng ID",
    philosophyVisual: "Công ty TNHH YAMADEN",
    philosophyKicker: "TRIẾT LÝ",
    philosophyTitle: "Bảo vệ con người, tạo dựng hạnh phúc",
    philosophyText: "Từ mong muốn bảo vệ con người, YAMADEN đặt đồng nghiệp, gia đình, khách hàng và cộng đồng ở trung tâm. Công ty coi trọng khu vực, kỹ thuật và niềm tin.",
    serviceTitle: "Dịch vụ chính của YAMADEN",
    service1Title: "Công trình điện tổng hợp",
    service1Desc: "Thi công dây điện trong tòa nhà, kéo nguồn, thiết bị điện cho nhà ở, nhà máy và các công trình lớn.",
    service2Title: "Công trình đo lường điều khiển",
    service2Desc: "Đo lường và quản lý hệ thống điện, điều hòa và thiết bị điều khiển để duy trì môi trường tòa nhà ổn định.",
    service3Title: "Bảo trì thiết bị điều khiển tự động",
    service3Desc: "Kiểm tra, bảo trì hệ thống điều khiển điều hòa và thiết bị công trình để phòng ngừa sự cố.",
    galleryMain: "Kỹ thuật chắc chắn, phản hồi nhanh và thái độ trung thực cho từng hiện trường.",
    gallery1: "Ưu tiên nhu cầu khách hàng",
    gallery2: "Quản lý chất lượng sau thi công",
    accountText: "Đăng nhập bằng số điện thoại và mã PIN. Nếu đăng ký mới, hãy nhập đầy đủ thông tin để YAMADEN lưu lịch sử yêu cầu và liên hệ hỗ trợ thuận tiện hơn.",
    accountLogin: "Đăng nhập / Lưu",
    accountRegister: "Khách mới",
    accountLoginMode: "Đã có tài khoản",
    accountLogout: "Đăng xuất",
    accountProfileTitle: "Thông tin khách hàng",
    accountProfileText: "Vui lòng nhập thông tin chi tiết để admin duyệt tài khoản.",
    accountPending: "Tài khoản đang chờ admin duyệt. Sau khi được duyệt bạn mới có thể vào app chính.",
    accountApproved: "Tài khoản đã được duyệt. Bạn có thể vào app chính.",
    registerDone: "Đăng ký thành công. Vui lòng nhập thông tin chi tiết.",
    profileSaved: "Đã gửi thông tin. Vui lòng chờ admin duyệt.",
    profileActive: "Tài khoản đang hoạt động",
    profilePhone: "Số điện thoại",
    profileProvince: "Tỉnh / thành",
    profileProject: "Tên công trình",
    profileCompany: "Công ty / cá nhân",
    profileRequests: "Yêu cầu đã gửi",
    accountTab: "Tài khoản",
    tabSend: "Gửi yêu cầu",
    tabCheck: "Tra cứu",
    settingsTitle: "Cài đặt",
    language: "Ngôn ngữ",
    languageSub: "日本語 / Tiếng Việt",
    quickSupportTitle: "Cần hỗ trợ nhanh?",
    quickSupportText: "Bạn vẫn có thể gửi yêu cầu không cần đăng nhập.",
    quickSupportBtn: "Gửi hỗ trợ nhanh",
    safetyTitle: "An toàn và chất lượng",
    safetyText: "YAMADEN tích lũy chất lượng ổn định và công việc chính xác để đáp ứng niềm tin của khách hàng.",
    maintenanceTitle: "Bảo trì định kỳ",
    maintenanceText: "Bảo trì thiết bị tòa nhà là yếu tố quan trọng để giữ môi trường sử dụng thoải mái và ổn định quanh năm.",
    companyTitle: "Thông tin công ty",
    companyNameLabel: "Tên công ty",
    companyNameValue: "Công ty TNHH YAMADEN",
    companyServiceLabel: "Lĩnh vực",
    companyServiceValue: "Điện công trình / đo lường điều khiển / bảo trì thiết bị điều khiển tự động",
    companyAddressLabel: "Địa chỉ",
    companyTelLabel: "Điện thoại",
    callCompany: "Gọi YAMADEN",
    mapCompany: "Mở bản đồ"
  },
  ja: {
    welcomeTitle: "いつでもサポートします",
    welcomeText: "依頼内容を送信すると、担当者が確認してご連絡します。",
    homeKicker: "YAMADEN SUPPORT",
    homeTitle: "広島で電気工事、計装工事、自動制御設備保守メンテナンス",
    homeDesc: "株式会社山電は、確かな品質と迅速な対応で、一般電気工事・計装工事・自動制御設備の保守を支えています。",
    homeSend: "依頼を送信",
    homeCheck: "状況を確認",
    trust1: "迅速受付",
    trust2: "日越対応",
    trust3: "IDで確認",
    philosophyVisual: "株式会社山電",
    philosophyKicker: "理念",
    philosophyTitle: "人を守り、幸せを創る",
    philosophyText: "山電は、仲間・家族・お客様・地域を守るという想いを原点に、地域・技術・信頼を大切にしています。",
    serviceTitle: "山電の事業",
    service1Title: "一般電気工事",
    service1Desc: "建物内配線、電柱からの引き込み工事、住宅から工場・ビルまで幅広い電気設備に対応します。",
    service2Title: "計装工事",
    service2Desc: "建築物内の電気・空調設備などの制御装置を計測・管理し、安定した環境を維持します。",
    service3Title: "自動制御設備保守メンテナンス",
    service3Desc: "空調設備の制御システムをはじめ、設備の点検保守管理を行います。",
    galleryMain: "専門性に裏打ちされた施工、迅速な対応、誠実な姿勢で信頼に応えます。",
    gallery1: "お客様のニーズを最優先",
    gallery2: "施工後まで品質管理",
    accountText: "電話番号とPINでログインしてください。新規登録の場合は、お客様情報を入力すると依頼履歴を保存できます。",
    accountLogin: "ログイン / 保存",
    accountRegister: "新規登録",
    accountLoginMode: "登録済み",
    accountLogout: "ログアウト",
    accountProfileTitle: "お客様情報",
    accountProfileText: "管理者承認のため、お客様情報を入力してください。",
    accountPending: "管理者承認待ちです。承認後にアプリをご利用いただけます。",
    accountApproved: "管理者承認済みです。アプリをご利用いただけます。",
    registerDone: "登録しました。続けてお客様情報を入力してください。",
    profileSaved: "お客様情報を送信しました。管理者承認をお待ちください。",
    profileActive: "アカウント有効",
    profilePhone: "電話番号",
    profileProvince: "都道府県",
    profileProject: "工事件名",
    profileCompany: "会社名 / 個人",
    profileRequests: "依頼数",
    accountTab: "アカウント",
    tabSend: "依頼送信",
    tabCheck: "確認",
    settingsTitle: "設定",
    language: "言語",
    languageSub: "日本語 / Tiếng Việt",
    quickSupportTitle: "すぐに依頼しますか？",
    quickSupportText: "ログインしなくても依頼できます。",
    quickSupportBtn: "クイック依頼",
    safetyTitle: "安全と品質",
    safetyText: "確かな品質と正確な仕事を積み重ね、お客様の事業と社会の安心を支えます。",
    maintenanceTitle: "定期メンテナンス",
    maintenanceText: "一年を通して稼働する設備だからこそ、確かな技術と経験、迅速な対応が必要です。",
    companyTitle: "会社情報",
    companyNameLabel: "会社名",
    companyNameValue: "株式会社山電",
    companyServiceLabel: "事業内容",
    companyServiceValue: "一般電気工事 / 計装工事 / 自動制御設備保守メンテナンス",
    companyAddressLabel: "所在地",
    companyTelLabel: "電話番号",
    callCompany: "山電へ電話",
    mapCompany: "地図を開く"
  }
};
Object.assign(texts.vi, YAMADEN_WEB_COPY.vi);
Object.assign(texts.ja, YAMADEN_WEB_COPY.ja);
Object.assign(texts.vi, {
  historySetting: "Lịch sử yêu cầu",
  clearHistorySetting: "Xóa lịch sử",
  appInfo: "Thông tin app",
  settingsLogout: "Đăng xuất",
  settingsLogoutSub: "Đăng xuất khỏi tài khoản hiện tại.",
  issuePh: "Tìm và chọn nội dung công việc",
  noResult: "Không tìm thấy nội dung phù hợp",
  uploadSub: "Tối đa 12 file · JPG / PNG / MP4"
});
Object.assign(texts.ja, {
  historySetting: "依頼履歴",
  clearHistorySetting: "履歴を削除",
  appInfo: "アプリ情報",
  settingsLogout: "ログアウト",
  settingsLogoutSub: "現在のアカウントからログアウトします。",
  issuePh: "作業内容を検索して選択",
  noResult: "該当する内容がありません",
  uploadSub: "最大12ファイル · JPG / PNG / MP4"
});

function $(id) { return document.getElementById(id); }
function escapeHtml(s) { return String(s||"").replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]); }
function escapeJsString(s) { return String(s||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n"); }
function showToast(msg) { let t=$("toast"); t.innerText=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }
function t(key) { return texts[lang]&&texts[lang][key] ? texts[lang][key] : (texts.ja[key]||key); }
function setIcon(id,name) { let el=$(id); if(el && ICONS[name]) el.innerHTML=ICONS[name]; }
function syncAuthLanguageButtons() {
  const vi = $("authLangVi");
  const ja = $("authLangJa");
  const isVi = lang === "vi";
  if (vi) {
    vi.classList.toggle("active", isVi);
    vi.classList.toggle("is-active", isVi);
    vi.setAttribute("aria-pressed", isVi ? "true" : "false");
  }
  if (ja) {
    ja.classList.toggle("active", !isVi);
    ja.classList.toggle("is-active", !isVi);
    ja.setAttribute("aria-pressed", !isVi ? "true" : "false");
  }
}

function setAuthLanguage(next) {
  const keepMode = accountMode || "welcome";

  lang = next === "vi" ? "vi" : "ja";
  localStorage.setItem("language", lang);
  localStorage.setItem("lang", lang);

  if ($("language")) $("language").value = lang;

  const authOnly = ["welcome", "register", "login", "profile", "pending"].includes(keepMode);
  if (!authOnly) {
    applyLanguage();
  }

  // Khi đổi VN/JP trong màn hình đăng ký hoặc đăng nhập, giữ nguyên màn hình hiện tại.
  // Không tự nhảy sang màn hình chờ duyệt dù localStorage đang có tài khoản pending.
  if (authOnly && typeof updateAuthTextsOnly === "function") {
    updateAuthTextsOnly();
    syncAuthLanguageButtons();
  }

  window.__updateIssueList && window.__updateIssueList();
}

function changeLanguage() { setAuthLanguage($("language").value); }

function applyLanguage() {
  $("welcomeTitle").innerText=t("welcomeTitle"); $("welcomeText").innerText=t("welcomeText");
  $("homeKicker").innerText=t("homeKicker"); $("homeTitle").innerText=t("homeTitle"); $("homeDesc").innerText=t("homeDesc");
  $("homeSendText").innerText=t("homeSend"); $("homeCheckText").innerText=t("homeCheck");
  $("trust1").innerText=t("trust1"); $("trust2").innerText=t("trust2"); $("trust3").innerText=t("trust3");
  $("philosophyVisual").innerText=t("philosophyVisual"); $("philosophyKicker").innerText=t("philosophyKicker");
  $("philosophyTitle").innerText=t("philosophyTitle"); $("philosophyText").innerText=t("philosophyText");
  $("serviceTitle").innerText=t("serviceTitle"); $("service1Title").innerText=t("service1Title"); $("service1Desc").innerText=t("service1Desc");
  $("service2Title").innerText=t("service2Title"); $("service2Desc").innerText=t("service2Desc");
  $("service3Title").innerText=t("service3Title"); $("service3Desc").innerText=t("service3Desc");
  $("galleryMain").innerText=t("galleryMain"); $("gallery1").innerText=t("gallery1"); $("gallery2").innerText=t("gallery2");
  $("companyTitle").innerText=t("companyTitle"); $("companyNameLabel").innerText=t("companyNameLabel");
  $("companyNameValue").innerText=t("companyNameValue"); $("companyServiceLabel").innerText=t("companyServiceLabel");
  $("companyServiceValue").innerText=t("companyServiceValue"); $("companyAddressLabel").innerText=t("companyAddressLabel");
  $("companyTelLabel").innerText=t("companyTelLabel"); $("safetyTitle").innerText=t("safetyTitle"); $("safetyText").innerText=t("safetyText");
  $("maintenanceTitle").innerText=t("maintenanceTitle"); $("maintenanceText").innerText=t("maintenanceText");
  $("callCompanyText").innerText=t("callCompany"); $("mapCompanyText").innerText=t("mapCompany");
  $("servicesPageTitle").innerText=t("servicesPageTitle"); $("detail1Title").innerText=t("detail1Title"); $("detail1Text").innerText=t("detail1Text");
  $("detail2Title").innerText=t("detail2Title"); $("detail2Text").innerText=t("detail2Text"); $("detail3Title").innerText=t("detail3Title");
  $("detail3Text").innerText=t("detail3Text"); $("detail1Btn").innerText=t("detailBtn"); $("detail2Btn").innerText=t("detailBtn"); $("detail3Btn").innerText=t("detailBtn");
  $("accountText").innerHTML=t("accountText"); $("accountModeRegister").innerText=t("accountRegister");
  $("accountModeLogin").innerText=t("accountLoginMode"); $("accountLoginText").innerText=t("accountLogin");
  $("accountName").placeholder=t("name"); $("accountPhone").placeholder=t("phone");
  $("accountPin").placeholder=lang==="ja"?"6桁のPINコード":"Nhập mã PIN 6 số";
  $("accountPinConfirm").placeholder=lang==="ja"?"PINコードを再入力":"Nhập lại mã PIN 6 số";
  $("accountEmail").placeholder="Email"; $("accountProvince").placeholder=t("profileProvince");
  $("accountProjectName").placeholder=t("profileProject"); $("accountCompany").placeholder=t("profileCompany");
  $("approvalPendingText").innerText=t("accountPending"); $("approvalApprovedText").innerText=t("accountApproved");
  $("accountBrandSub").innerText="YAMADEN.CO.LTD";
  $("quickSupportTitle").innerText=t("quickSupportTitle"); $("quickSupportText").innerText=t("quickSupportText");
  $("quickSupportBtn").innerText=t("quickSupportBtn"); $("profileSub").innerText=t("profileActive");
  $("profilePhoneLabel").innerText=t("profilePhone"); $("profileProvinceLabel").innerText=t("profileProvince");
  $("profileProjectLabel").innerText=t("profileProject"); $("profileCompanyLabel").innerText=t("profileCompany");
  $("profileRequestsLabel").innerText=t("profileRequests"); $("profileSendText").innerText=t("send"); $("profileHistoryText").innerText=t("tabCheck");
  $("profileLogoutText").innerText=t("accountLogout"); $("sideStep1").innerText=t("sideStep1"); $("sideStep2").innerText=t("sideStep2");
  $("sideStep3").innerText=t("sideStep3"); $("sendTitle").innerText=t("sendTitle"); $("checkTitle").innerText=t("checkTitle");
  $("labelName").innerHTML=t("name")+' <span class="required">*</span>'; $("labelPhone").innerHTML=t("phone")+' <span class="required">*</span>';
  $("labelContact").innerText=t("contact"); $("labelAddress").innerHTML=t("address")+' <span class="required">*</span>';
  $("labelContent").innerHTML=t("content")+' <span class="required">*</span>'; $("labelImage").innerText=t("image");
  $("content").placeholder=t("freeDesc");
  $("labelCheckId").innerText=t("requestId"); if(selectedMediaFiles.length===0) $("uploadText").innerText=t("uploadText");
  if($(".upload-sub")) $(".upload-sub").innerText=lang==="ja"?"最大12ファイル · JPG / PNG / MP4":"Tối đa 12 file · JPG / PNG / MP4";
  $("chooseImageBtn").innerText=t("chooseImage"); $("copyIdText").innerText=t("copyId"); $("historyText").innerText=t("history");
  $("sendBtnText").innerText=t("send"); $("checkBtnText").innerText=t("check"); $("checkId").placeholder=t("checkPlaceholder");
  $("myRequestTitle").innerText=t("myRequests"); $("clearHistoryBtn").innerText=t("clearHistory");
  $("issueTitle").innerText=t("issueTitle"); $("issueSub").innerText=t("issueSub"); $("issueRequiredText").innerText=t("issueRequired");
  if($(".issue-free-note")) $(".issue-free-note").innerText=t("freeDesc");
  $("quoteOptionText").innerText=t("quote"); $("settingsTitleCustomer").innerText=t("settingsTitle");
  $("settingsLangTitle").innerText=t("language"); $("settingsLangSub").innerText=t("languageSub");
  $("settingsHistoryTitle").innerText=t("historySetting"); $("settingsClearTitle").innerText=t("clearHistorySetting");
  $("settingsAppTitle").innerText=t("appInfo");
  let nav={tabHome:t("homeKicker")==="YAMADEN SUPPORT"?"Trang chủ":"ホーム",tabAccount:t("accountTab"),tabSend:t("tabSend"),tabServices:t("settingsTitle")};
  document.querySelectorAll("#tabHome span:last-child, #tabAccount span:last-child, #tabSend span:last-child, #tabServices span:last-child").forEach(el=>{
    if(el.closest("#tabHome")) el.innerText=nav.tabHome;
    else if(el.closest("#tabAccount")) el.innerText=nav.tabAccount;
    else if(el.closest("#tabSend")) el.innerText=nav.tabSend;
    else if(el.closest("#tabServices")) el.innerText=nav.tabServices;
  });
  // Không gọi updateAccountUI khi người dùng đang ở màn hình đăng ký/đăng nhập.
  // Việc này tránh lỗi bấm chuyển VN/JP bị tự nhảy sang màn hình chờ duyệt.
  if (!["register", "login", "welcome", "profile"].includes(accountMode)) {
    updateAccountUI();
  }
  renderMyRequests();
}

function getUserToken() { return localStorage.getItem("userToken")||""; }

function updateAccountUI() {
  let saved=localStorage.getItem("userProfile"); currentUser=saved?JSON.parse(saved):null;
  let loggedIn=currentUser && currentUser.status==="active" && currentUser.profileCompleted;
  let hasProfile=currentUser && currentUser.profileCompleted;
  let pending=currentUser && currentUser.status!=="active" && currentUser.profileCompleted;
  $("accountFormCard").style.display=loggedIn?"none":"block";
  $("profileCard").style.display=loggedIn?"block":"none";
  $("approvalPendingText")?.classList.toggle("show",!!pending);
  $("approvalApprovedText")?.classList.toggle("show",!!loggedIn);
  if(currentUser){
    $("profileName").innerText=currentUser.name||currentUser.phone||"";
    $("profilePhone").innerText=currentUser.phone||""; $("profileEmail").innerText=currentUser.email||"";
    $("profileProvince").innerText=currentUser.province||""; $("profileProject").innerText=currentUser.projectName||"";
    $("profileCompany").innerText=currentUser.company||""; $("profileRequests").innerText=getMyRequests().length;
    $("accountName").value=currentUser.name||""; $("accountPhone").value=currentUser.phone||""; $("accountEmail").value=currentUser.email||"";
    if($("accountContact")) $("accountContact").value=currentUser.contact||"";
    if($("accountAddress")) $("accountAddress").value=currentUser.address||currentUser.province||"";
    if($("accountNote")) $("accountNote").value=currentUser.note||"";
    $("accountProvince").value=currentUser.province||currentUser.address||""; $("accountProjectName").value=currentUser.projectName||"";
    $("accountCompany").value=currentUser.company||""; $("name").value=currentUser.name||""; $("phone").value=currentUser.phone||"";
    $("contact").value=currentUser.contact||currentUser.email||""; $("address").value=currentUser.address||currentUser.projectName||"";
  }
  setAccountMode(currentUser&&!currentUser.profileCompleted?"profile":(hasProfile&&!loggedIn?"pending":accountMode));
}

function setAccountMode(mode) {
  accountMode=mode;
  let isWelcome=mode==="welcome", isLogin=mode==="login", isProfile=mode==="profile", isRegister=mode==="register", isPending=mode==="pending";
  $("accountFormCard")?.classList.toggle("auth-mode-welcome",isWelcome);
  $("accountFormCard")?.classList.toggle("auth-mode-form",isLogin||isRegister||isProfile);
  $("accountFormCard")?.classList.toggle("auth-mode-login",isLogin);
  $("accountFormCard")?.classList.toggle("auth-mode-register",isRegister);
  $("accountFormCard")?.classList.toggle("auth-mode-pending",isPending);
  $("authStartScreen")?.classList.toggle("hidden",!isWelcome);
  $("authPendingScreen")?.classList.toggle("hidden",!isPending);
  $("authBackBtn")?.classList.toggle("hidden",isWelcome||isProfile||isPending);
  document.querySelector(".account-welcome")?.classList.toggle("hidden",isWelcome||isPending);
  document.querySelector(".account-mode")?.classList.toggle("hidden",isWelcome||isProfile||isPending);
  $("accountFields")?.classList.toggle("hidden",isWelcome||isPending);
  document.querySelector("#accountFormCard > .main-btn")?.classList.toggle("hidden",isWelcome||isPending);
  $("accountModeRegister").classList.toggle("active",isRegister);
  $("accountModeLogin").classList.toggle("active",isLogin);
  ["accountName","accountEmail","accountProvince","accountProjectName","accountCompany"].forEach(id=>$(id)?.classList.toggle("hidden",!isProfile));
  $("accountPhone").classList.toggle("hidden",isProfile||isPending||isWelcome);
  $("accountPin").classList.toggle("hidden",isProfile||isPending||isWelcome);
  $("accountPinConfirm").classList.toggle("hidden",!(isRegister||isLogin));
  $("accountPinConfirm").classList.toggle("auth-login-placeholder",isLogin);
  $("accountPinConfirm").disabled=!!isLogin;
  $("accountLoginText").innerText=isProfile?(lang==="ja"?"送信":t("send")):(isLogin?t("accountLogin"):(lang==="ja"?"続ける":"Tiếp tục"));
  $("accountWelcome").innerText=isProfile?(lang==="ja"?"お客様情報":"Thông tin tài khoản"):(isLogin?(lang==="ja"?"ログイン":"Đăng nhập"):(lang==="ja"?"新規登録":"Đăng ký"));
  $("accountText").innerHTML=isProfile?(lang==="ja"?"管理者承認のため、お客様情報を入力してください。":"Vui lòng cung cấp đầy đủ thông tin để admin duyệt tài khoản của bạn."):(isLogin?(lang==="ja"?"電話番号と6桁のPINコードを入力してください。":"Nhập số điện thoại và mã PIN 6 số để đăng nhập."):(lang==="ja"?"電話番号と6桁のPINコードだけで登録できます。":"Chỉ cần số điện thoại và mã PIN 6 số để tạo tài khoản."));
  $("authStartTitle") && ($("authStartTitle").innerText=lang==="ja"?"ようこそ":"Chào mừng");
  $("authStartText") && ($("authStartText").innerText=lang==="ja"?"ログインまたは登録してYAMADENアプリをご利用ください。":"Đăng ký hoặc đăng nhập để tiếp tục sử dụng ứng dụng YAMADEN.");
  $("authStartLoginBtn") && ($("authStartLoginBtn").innerText=t("accountLogin"));
  $("authStartRegisterBtn") && ($("authStartRegisterBtn").innerText=lang==="ja"?"新規登録":"Đăng ký");
  $("authStartNote") && ($("authStartNote").innerText=lang==="ja"?"アカウントは管理者承認後に利用できます。":"Tài khoản cần được admin duyệt trước khi sử dụng app.");
  $("authPendingTitle") && ($("authPendingTitle").innerText=lang==="ja"?"情報を送信しました":"Thông tin đã được gửi");
  $("authPendingText") && ($("authPendingText").innerText=lang==="ja"?"管理者承認待ちです。承認後にアプリをご利用いただけます。":"Tài khoản của bạn đang chờ admin duyệt. Sau khi được phê duyệt, bạn mới có thể sử dụng đầy đủ chức năng của app.");
  $("authPendingPill") && ($("authPendingPill").innerText=lang==="ja"?"承認待ち":"Đang chờ duyệt");
  $("authPendingLoginBtn") && ($("authPendingLoginBtn").innerText=lang==="ja"?"ログインに戻る":"Quay lại đăng nhập");
  syncAuthLanguageButtons();
  if(isLogin||isRegister){
    $("accountPhone").placeholder=lang==="ja"?"電話番号":"Số điện thoại";
    $("accountPin").placeholder=lang==="ja"?"6桁のPINコード":"Nhập mã PIN 6 số";
    $("accountPinConfirm").placeholder=lang==="ja"?"PINコードを再入力":"Nhập lại mã PIN 6 số";
  }
  if(isProfile){
    $("accountName").placeholder=lang==="ja"?"お名前":"Họ và tên";
    $("accountEmail").placeholder="Email";
    $("accountProvince").placeholder=lang==="ja"?"住所":"Địa chỉ";
    $("accountProjectName").placeholder=lang==="ja"?"備考 / 工事名":"Ghi chú / tên công trình";
    $("accountCompany").placeholder=lang==="ja"?"会社名（任意）":"Công ty / cá nhân (nếu có)";
  }
}

async function userLogin() {
  let mode=accountMode;
  let phone=$("accountPhone").value.trim(), pin=$("accountPin").value.trim(), pinConfirm=$("accountPinConfirm").value.trim();
  let name=$("accountName").value.trim(), email=$("accountEmail").value.trim(), province=($("accountAddress")?.value||$("accountProvince").value).trim();
  let projectName=$("accountProjectName").value.trim(), company=$("accountCompany").value.trim();
  let contact=($("accountContact")?.value||"").trim(), address=($("accountAddress")?.value||province).trim(), note=($("accountNote")?.value||"").trim();
  if(mode!=="profile" && (!phone||!/^[0-9]{6}$/.test(pin))){ showToast(lang==="ja"?"PINコードは6桁の数字で入力してください。":"PIN phải gồm đúng 6 chữ số."); return; }
  if(mode==="register" && pin!==pinConfirm){ showToast(lang==="ja"?"確認用PINが一致しません。":"PIN xác nhận không khớp."); return; }
  if(mode==="profile" && (!name||!email||!province||!projectName)){ showToast(t("required")); return; }
  try{
    let endpoint=mode==="register"?"/user/register":mode==="profile"?"/user/profile":"/user/login";
    let method=mode==="profile"?"PUT":"POST";
    let body=mode==="profile"?{name,email,contact,province,address,projectName,company,note}:{phone,pin};
    let headers={"Content-Type":"application/json"};
    let token=getUserToken();
    if(mode==="profile" && token) headers.Authorization="Bearer "+token;
    let res=await fetch(API+endpoint,{method,headers,body:JSON.stringify(body)});
    let data=await res.json();
    if(!res.ok||!data.user) throw new Error(data.message||"Auth failed");

    if(mode==="register" && !data.token){
      let loginRes=await fetch(API+"/user/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,pin})});
      let loginData=await loginRes.json();
      if(loginData.token) data={...data,...loginData};
    }
    if(data.token) localStorage.setItem("userToken",data.token);
    localStorage.setItem("userProfile",JSON.stringify(data.user));
    currentUser=data.user;

    if(mode==="register"){
      updateAccountUI();
      setAccountMode("profile");
      showToast(t("registerDone"));
      return;
    }

    if(mode==="profile"){
      updateAccountUI();
      if(data.user.status==="active" && data.user.profileCompleted){
        $("approvalApprovedText")?.classList.add("show");
        showToast(t("accountApproved"));
        showTab("home");
      } else {
        $("approvalPendingText")?.classList.add("show");
        showToast(t("profileSaved"));
        showTab("account");
      }
      return;
    }

    updateAccountUI();
    if(data.user.status==="active" && data.user.profileCompleted){
      $("approvalApprovedText")?.classList.add("show");
      showToast(t("accountApproved"));
      showTab("home");
    } else if(!data.user.profileCompleted){
      setAccountMode("profile");
      showToast(t("accountProfileText"));
      showTab("account");
    } else {
      $("approvalPendingText")?.classList.add("show");
      showToast(t("accountPending"));
      showTab("account");
    }
  } catch(err){ showToast(t("fail")); }
}

function userLogout(){ localStorage.removeItem("userToken"); localStorage.removeItem("userProfile"); currentUser=null; accountMode="welcome"; updateAccountUI(); showTab("account"); }

function getMyRequests(){ try{ return JSON.parse(localStorage.getItem("myRequests")||"[]"); }catch(e){ return []; } }
function saveMyRequest(id,meta={}){ if(!id)return; let list=getMyRequests().filter(i=>String(i.id)!==String(id)); list.unshift({id,time:Date.now(),...meta}); localStorage.setItem("myRequests",JSON.stringify(list.slice(0,20))); }
function clearMyRequests(){ localStorage.removeItem("myRequests"); renderMyRequests(); showToast(t("clearHistory")); }
function renderMyRequests(){ let reqs=getMyRequests(); $("myRequests").innerHTML=reqs.length?reqs.map(i=>`<div class="request-card" onclick="openCheck('${escapeJsString(i.id)}')"><div class="request-thumb">${ICONS.file}</div><div class="request-info"><div class="request-id">#${escapeHtml(i.id)}</div><div class="request-desc">${escapeHtml(i.content||i.id)}</div></div></div>`).join(""):`<div class="success-box">${t("noHistory")}</div>`; }
function copyId(id){ navigator.clipboard.writeText(String(id)).then(()=>showToast(t("copied"))); }
function copyLastId(){ let id=localStorage.getItem("lastRequestId"); if(!id) showToast(t("noHistory")); else copyId(id); }
function openCheck(id){ showTab("check"); $("checkId").value=id; checkStatus(false); }

async function checkStatus(isAuto){
  let id=$("checkId").value.trim(); if(!id)return; saveMyRequest(id); renderMyRequests();
  if(!isAuto){ $("checkResult").innerHTML=t("loading"); }
  try{
    let res=await fetch(API+"/request/"+encodeURIComponent(id));
    let data=await res.json();
    if(!res.ok||!data.id){ $("checkResult").innerHTML=`<div class="success-box">${t("notFound")}</div>`; return; }
    let rawStatus=String(data.status||"untreated").toLowerCase();
    let normalizedStatus={pending:"untreated",processing:"processing",contacted:"processing",site_done:"processing",quoted:"quoted",ordered:"ordered",completed:"completed",lost:"lost"}[rawStatus]||rawStatus;
    let statusLabels={
      ja:{untreated:"未対応",processing:"対応中",quoted:"見積中",ordered:"受注",completed:"完了",lost:"失注"},
      vi:{untreated:"Chưa xử lý",processing:"Đang xử lý",quoted:"Đang báo giá",ordered:"Đã nhận đơn",completed:"Hoàn thành",lost:"Không hoàn thành"}
    };
    let statusClass={untreated:"pending",processing:"processing",quoted:"processing",ordered:"completed",completed:"completed",lost:"pending"}[normalizedStatus]||"pending";
    let statusText=(statusLabels[lang]&&statusLabels[lang][normalizedStatus])||statusLabels.ja[normalizedStatus]||t("pending");
    let step={untreated:1,processing:2,quoted:3,ordered:3,completed:4,lost:4}[normalizedStatus]||1;
    let mediaHtml=data.mediaFiles&&data.mediaFiles.length?`<div class="media-gallery">${data.mediaFiles.map(f=>{let url=escapeHtml(f.url||"");return f.type==="video"?`<video src="${url}" controls playsinline></video>`:`<img src="${url}" alt="">`}).join("")}</div>`:`<div>${t("noImage")}</div>`;
    let assigneeName=String(data.assigneeName||"").trim();
    let assigneeHtml=assigneeName?`<hr><div><b>${lang==="ja"?"担当者":"Người phụ trách"}:</b><br>${escapeHtml(assigneeName)}</div>`:"";
    $("checkResult").innerHTML=`<div class="success-box"><div><b>${t("requestId")}:</b> #${escapeHtml(data.id)}</div><div class="status-timeline"><div class="step ${step>=1?"done":""} ${step===1?"active":""}">1<br>${lang==="ja"?"受付":"Tiếp nhận"}</div><div class="step ${step>=2?"done":""} ${step===2?"active":""}">2<br>${t("processing")}</div><div class="step ${step>=3?"done":""} ${step===3?"active":""}">3<br>${lang==="ja"?"見積/対応":"Báo giá/Xử lý"}</div><div class="step ${step===4?"active":""}">4<br>${t("completed")}</div></div><div><b>${t("status")}:</b> <span class="badge ${statusClass}">${escapeHtml(statusText)}</span></div>${assigneeHtml}<hr><div><b>${t("name")}:</b> ${escapeHtml(data.name)}</div><div><b>${t("phone")}:</b> ${escapeHtml(data.phone)}</div><div><b>${t("content")}:</b><br>${escapeHtml(data.content)}</div><div><b>${t("image")}:</b><br>${mediaHtml}</div><hr><div><b>${t("adminReply")}:</b><br>${data.adminReply?escapeHtml(data.adminReply):t("noReply")}</div></div>`;
  } catch(err){ if(!isAuto) $("checkResult").innerHTML=`<div class="success-box">${t("networkError")}</div>`; }
}

async function prepareUploadFile(file){
  if(!file.type.startsWith("image/")) return file;
  return new Promise(resolve=>{
    let img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url); let maxSide=1600, scale=Math.min(1,maxSide/Math.max(img.width,img.height));
      if(scale>=1 && file.size<1200000){ resolve(file); return; }
      let canvas=document.createElement("canvas"); canvas.width=Math.max(1,Math.round(img.width*scale)); canvas.height=Math.max(1,Math.round(img.height*scale));
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      canvas.toBlob(blob=>{ resolve(new File([blob],file.name.replace(/\.[^.]+$/,"")+".jpg",{type:"image/jpeg",lastModified:Date.now()})); },"image/jpeg",0.78);
    }; img.onerror=()=>{ URL.revokeObjectURL(url); resolve(file); }; img.src=url;
  });
}

function renderSelectedMedia(){
  previewUrls.forEach(u=>URL.revokeObjectURL(u)); previewUrls=[];
  if(selectedMediaFiles.length===0){ $("uploadText").innerHTML=t("uploadText"); return; }
  let preview=selectedMediaFiles.slice(0,12).map((f,i)=>{let u=URL.createObjectURL(f); previewUrls.push(u); let media=f.type.startsWith("video/")?`<video src="${u}" class="preview-video" controls playsinline></video>`:`<img src="${u}" class="preview-img" alt="">`; return `<div class="preview-item">${media}<button type="button" class="remove-media-btn" onclick="removeSelectedMedia(${i})"></button></div>`; }).join("");
  $("uploadText").innerHTML=`<div class="preview-grid">${preview}</div><div>${t("fileSelected")} (${selectedMediaFiles.length}/12)</div>`;
}
function removeSelectedMedia(i){ selectedMediaFiles.splice(i,1); renderSelectedMedia(); }

async function sendRequest(){
  let name=$("name").value.trim(), phone=$("phone").value.trim(), contact=$("contact").value.trim();
  let address=$("address").value.trim(), content=$("content").value.trim(), files=selectedMediaFiles.slice(0,12);
  let issueTags=window.__yamadenChosenIssues||[];
  if(!name||!phone||!address||!content){ showToast(t("required")); return; }
  if(issueTags.length===0){ showToast(t("issueRequired")); return; }
  let btn=$("sendBtn"); btn.disabled=true; btn.innerHTML=`<span class="icon">${ICONS.spinner}</span><span>${t("sending")}</span>`;
  try{
    let formData=new FormData();
    formData.append("name",name); formData.append("phone",phone); formData.append("contact",contact);
    formData.append("address",address); formData.append("content",content);
    formData.append("issueTags",JSON.stringify(issueTags));
    formData.append("quoteRequested",$("quoteRequested").checked?"true":"false");
    let uploadFiles=await Promise.all(files.map(prepareUploadFile));
    uploadFiles.forEach(f=>formData.append("image",f));
    let headers={}; let token=getUserToken();
    if(token) headers.Authorization="Bearer "+token;
    let res=await fetch(API+"/request",{method:"POST",headers,body:formData});
    let data={};
    try{ data=await res.json(); }catch(e){}
    if(!res.ok||!data.data?.id) throw new Error(data.message||data.error||"Send failed");
    let id=String(data.data.id); saveMyRequest(id,{name,content}); localStorage.setItem("lastRequestId",id); renderMyRequests();
    $("result").innerHTML=`<div class="success-box"><div class="success-center"><div class="success-icon">${ICONS.check}</div><div class="success-title">${t("success")}</div><div>${t("successSub")}</div></div><div class="id-box"><div>${t("requestId")}</div><div class="id-number">#${escapeHtml(id)}</div></div><div class="tip-box"><div class="icon">${ICONS.check}</div><div>${t("saveIdTip")}</div></div><button class="copy-btn" onclick="copyId('${escapeJsString(id)}')"><span class="icon">${ICONS.copy}</span>${t("copy")}</button><button class="soft-btn" style="margin-top:10px;" onclick="openCheck('${escapeJsString(id)}')"><span class="icon">${ICONS.search}</span>${t("tabCheck")}</button></div>`;
    $("name").value=""; $("phone").value=""; $("contact").value=""; $("address").value=""; $("content").value="";
    selectedMediaFiles=[]; renderSelectedMedia(); window.__yamadenChosenIssues=[]; renderIssueChips(); showToast(t("success"));
  } catch(err){
    let detail=err&&err.message&&err.message!=="Failed to fetch"?err.message:t("networkError");
    $("result").innerHTML=`<div class="success-box">${escapeHtml(detail||t("fail"))}</div>`;
    showToast(detail||t("fail"));
  } finally{ btn.disabled=false; btn.innerHTML=`<span class="icon">${ICONS.send}</span><span>${t("send")}</span>`; }
}

const issueLists={ vi:["Thiết kế bản vẽ điện","Thiết kế tủ điện","Thiết kế chiếu sáng","Tính tải điện","Bóc tách vật tư","Lập bản vẽ hoàn công","Kiểm tra bản vẽ","Chuẩn bị vật tư","Điều phối công trình","Quản lý tiến độ","Đặt hàng vật tư","Kiểm tra tồn kho","Sắp xếp lịch thi công","Hỗ trợ hiện trường","Tư vấn khách hàng","Báo giá","Theo dõi hợp đồng","Chăm sóc khách hàng","Khảo sát nhu cầu","Gửi đề xuất","Theo dõi thanh toán","Thi công điện","Đi dây điện","Lắp ổ cắm","Lắp đèn","Lắp tủ điện","Xử lý mất điện","Xử lý rò điện","Kiểm tra hiện trường","Sửa breaker","Bảo trì định kỳ","Kiểm tra sau thi công","Xử lý sự cố","Bảo hành","Kiểm tra thiết bị","Hỗ trợ khách hàng","Bảo trì tủ điện"], ja:["電気図面設計","盤設計","照明設計","電気容量計算","材料拾い出し","竣工図作成","図面チェック","材料準備","現場調整","工程管理","材料発注","在庫確認","施工スケジュール","現場サポート","顧客相談","見積作成","契約フォロー","顧客対応","ニーズ確認","提案送付","入金確認","電気工事","配線工事","コンセント取付","照明取付","分電盤工事","停電対応","漏電対応","現場確認","ブレーカー修理","定期メンテナンス","施工後点検","トラブル対応","保証対応","設備点検","顧客サポート","分電盤メンテナンス"] };
window.__yamadenChosenIssues=window.__yamadenChosenIssues||[];
function getAllIssues(){ return [...new Set(issueLists[lang]||issueLists.vi)]; }
function renderIssueOptions(){ let i=$("issueSearchInput"), d=$("issueDropdown"); if(!i||!d)return; let kw=i.value.trim().toLowerCase(); let items=getAllIssues().filter(x=>!window.__yamadenChosenIssues.includes(x)&&x.toLowerCase().includes(kw)); d.innerHTML=items.length?items.slice(0,36).map(x=>`<button type="button" class="issue-option" onclick="selectIssueItem('${escapeJsString(x)}')">${escapeHtml(x)}</button>`).join(""):`<div class="issue-empty">${t("noResult")||"Không tìm thấy"}</div>`; d.classList.add("show"); }
function renderIssueChips(){ let w=$("selectedIssues"), h=$("hiddenIssueInputs"); if(!w||!h)return; w.innerHTML=window.__yamadenChosenIssues.map((x,i)=>`<span class="selected-issue-tag">${escapeHtml(x)}<button type="button" onclick="removeIssueItem(${i})"></button></span>`).join(""); h.innerHTML=window.__yamadenChosenIssues.map(x=>`<input type="checkbox" checked value="${escapeHtml(x)}">`).join(""); $("issuePanel")?.classList.remove("required-missing"); let i=$("issueSearchInput"); if(i) i.placeholder=lang==="ja"?"作業内容を検索して選択":"Tìm và chọn nội dung công việc"; }
window.selectIssueItem=function(x){ if(!window.__yamadenChosenIssues.includes(x)) window.__yamadenChosenIssues.push(x); let i=$("issueSearchInput"); if(i) i.value=""; renderIssueChips(); renderIssueOptions(); };
window.removeIssueItem=function(i){ window.__yamadenChosenIssues.splice(i,1); renderIssueChips(); renderIssueOptions(); };
window.__updateIssueList=function(){ renderIssueChips(); renderIssueOptions(); };

function showTab(tab){
  let isAccount=tab==="account", isHome=tab==="home", isServices=tab==="services", isSend=tab==="send", isCheck=tab==="check", isSettings=tab==="settings";
  $("accountSection").classList.toggle("hidden",!isAccount); $("homeSection").classList.toggle("hidden",!isHome);
  $("servicesSection").classList.toggle("hidden",!isServices); $("sendSection").classList.toggle("hidden",!isSend);
  $("checkSection").classList.toggle("hidden",!isCheck); $("settingsSection").classList.toggle("hidden",!isSettings);
  let app=document.querySelector(".app"); let loggedIn=false;
  try{ let u=JSON.parse(localStorage.getItem("userProfile")||"null"); loggedIn=!!(u&&u.status==="active"&&u.profileCompleted); }catch(e){}
  if(app) app.classList.toggle("auth-login-mode",isAccount && !loggedIn);
  document.querySelectorAll(".bottom-nav button").forEach(btn=>btn.classList.remove("active"));
  if(isAccount) $("tabAccount").classList.add("active"); else if(isHome) $("tabHome").classList.add("active");
  else if(isSend) $("tabSend").classList.add("active"); else if(isSettings) $("tabServices").classList.add("active");
  if(isCheck) renderMyRequests();
}

function showInitialScreen(){ let user=localStorage.getItem("userProfile"); let loggedIn=user&&JSON.parse(user)?.status==="active"&&JSON.parse(user)?.profileCompleted; showTab(loggedIn?"home":"account"); }

function initIntro(){
  let intro=$("introScreen"), video=$("introVideo"), fb=$("introFallbackLogo"); if(!intro)return;
  let closed=false;
  function close(){ if(closed)return; closed=true; intro.classList.add("hide"); setTimeout(()=>intro.remove(),520); }
  if(!video){ if(fb) fb.style.display="block"; setTimeout(close,1200); return; }
  video.addEventListener("ended",close,{once:true}); video.addEventListener("error",()=>{ if(fb) fb.style.display="block"; video.style.display="none"; setTimeout(close,1200); },{once:true});
  video.play().catch(()=>{ if(fb) fb.style.display="block"; video.style.display="none"; setTimeout(close,1200); });
  intro.addEventListener("click",close,{once:true}); setTimeout(close,2800);
}

document.addEventListener("DOMContentLoaded",()=>{
  let iconMap=[["homeKickerIcon","zap"],["homeSendIcon","send"],["homeCheckIcon","search"],["serviceTitleIcon","tool"],["service1Icon","zap"],["service2Icon","tool"],["service3Icon","clock"],["gallery1Icon","map"],["gallery2Icon","check"],["companyTitleIcon","file"],["safetyIcon","bell"],["maintenanceIcon","clock"],["profileIcon","user"],["profileSendIcon","send"],["profileHistoryIcon","clock"],["profileLogoutIcon","logout"],["quickSupportIcon","message"],["accountLoginIcon","user"],["sendTitleIcon","edit"],["nameIcon","user"],["phoneIcon","phone"],["contactIcon","message"],["addressIcon","map"],["contentIcon","message"],["uploadIcon","upload"],["sendBtnIcon","send"],["copyIdIcon","copy"],["historyIcon","chart"],["checkTitleIcon","clock"],["checkIdIcon","file"],["checkBtnIcon","search"],["tabHomeIcon","home"],["tabAccountIcon","user"],["tabSendIcon","send"],["tabServicesIcon","tool"],["servicesPageIcon","tool"],["detail1Icon","zap"],["detail2Icon","tool"],["detail3Icon","clock"],["detail1BtnIcon","send"],["detail2BtnIcon","send"],["detail3BtnIcon","send"],["callCompanyIcon","phone"],["mapCompanyIcon","map"],["sideSendIcon","send"],["sideTrackIcon","clock"],["sideReplyIcon","message"],["settingsIcon","tool"]];
  iconMap.forEach(([id,icon])=>setIcon(id,icon));
  window.imageEl=$("image"); $("image").addEventListener("change",()=>{ let f=Array.from($("image").files||[]); selectedMediaFiles=[...selectedMediaFiles,...f].slice(0,12); $("image").value=""; renderSelectedMedia(); });
  $("language").addEventListener("change",changeLanguage);
  $("issueSearchInput").addEventListener("input",renderIssueOptions);
  $("issueSearchInput").addEventListener("focus",()=>{ $("issueDropdown")?.classList.add("show"); window.renderIssueOptions?.(); });
  document.addEventListener("click",e=>{ if(!e.target.closest(".issue-search-wrap")) $("issueDropdown")?.classList.remove("show"); });
  applyLanguage(); updateAccountUI(); showInitialScreen();
  setInterval(()=>{ if(!$("checkSection").classList.contains("hidden") && $("checkId").value) checkStatus(true); },5000);
  initIntro();
});

/* ===== Module boundary: original app code ===== */

(function(){
  const WORK_CATALOG = [{"code":"01","deptJa":"社長・代表","deptVi":"Giám đốc / đại diện công ty","items":[{"vi":"Phê duyệt công trình","ja":"工事承認"},{"vi":"Phê duyệt báo giá","ja":"見積承認"},{"vi":"Phê duyệt hợp đồng","ja":"契約承認"},{"vi":"Kiểm tra tiến độ tổng thể","ja":"全体進捗確認"},{"vi":"Kiểm tra tình trạng công ty","ja":"会社状況確認"},{"vi":"Họp với khách hàng","ja":"顧客打合せ"},{"vi":"Tiếp nhận dự án lớn","ja":"大型案件受付"},{"vi":"Xử lý vấn đề quan trọng","ja":"重要事項対応"},{"vi":"Điều phối hoạt động công ty","ja":"会社活動調整"},{"vi":"Quản lý vận hành công ty","ja":"会社運営管理"},{"vi":"Quản lý nhân sự","ja":"人事管理"},{"vi":"Kiểm tra doanh thu công trình","ja":"工事売上確認"},{"vi":"Xác nhận kế hoạch thi công","ja":"施工計画確認"},{"vi":"Phê duyệt hồ sơ kỹ thuật","ja":"技術書類承認"},{"vi":"Giải quyết khiếu nại khách hàng","ja":"苦情対応"},{"vi":"Hỗ trợ xử lý sự cố nghiêm trọng","ja":"重大問題支援"}]},{"code":"02","deptJa":"工務部","deptVi":"Bộ phận quản lý công trình","items":[{"vi":"Khảo sát hiện trường","ja":"現場調査"},{"vi":"Kiểm tra công trình","ja":"工事確認"},{"vi":"Kiểm tra tiến độ thi công","ja":"施工進捗確認"},{"vi":"Kiểm tra an toàn công trình","ja":"現場安全確認"},{"vi":"Kiểm tra chất lượng công trình","ja":"工事品質確認"},{"vi":"Nghiệm thu công trình","ja":"工事検収"},{"vi":"Kiểm tra sau thi công","ja":"施工後確認"},{"vi":"Điều phối thi công","ja":"施工調整"},{"vi":"Điều chỉnh lịch thi công","ja":"施工日程調整"},{"vi":"Hỗ trợ bàn giao công trình","ja":"引渡支援"},{"vi":"Kiểm tra tình trạng thiết bị","ja":"設備状況確認"},{"vi":"Quản lý công trình đang thi công","ja":"施工中案件管理"},{"vi":"Hỗ trợ xử lý vấn đề tại công trình","ja":"現場問題支援"}]},{"code":"03","deptJa":"FS部","deptVi":"Bộ phận bảo trì / hỗ trợ kỹ thuật","items":[{"vi":"Kiểm tra thiết bị bị lỗi","ja":"故障設備確認"},{"vi":"Sửa chữa sự cố","ja":"不具合修理"},{"vi":"Bảo trì định kỳ","ja":"定期保守"},{"vi":"Kiểm tra hệ thống điện","ja":"電気系統確認"},{"vi":"Kiểm tra thiết bị hoạt động không ổn định","ja":"動作不安定設備確認"},{"vi":"Xử lý sự cố khẩn cấp","ja":"緊急対応"},{"vi":"Vệ sinh thiết bị","ja":"設備清掃"},{"vi":"Thay thế linh kiện","ja":"部品交換"},{"vi":"Kiểm tra nguyên nhân lỗi","ja":"故障原因調査"},{"vi":"Hỗ trợ kỹ thuật","ja":"技術支援"},{"vi":"Kiểm tra máy móc","ja":"機械確認"},{"vi":"Khôi phục hoạt động hệ thống","ja":"システム復旧"},{"vi":"Kiểm tra kết nối thiết bị","ja":"機器接続確認"},{"vi":"Kiểm tra sau sửa chữa","ja":"修理後確認"},{"vi":"Hỗ trợ tại hiện trường","ja":"現場支援"}]},{"code":"04","deptJa":"営業部","deptVi":"Bộ phận kinh doanh / tư vấn","items":[{"vi":"Tư vấn dịch vụ","ja":"サービス相談"},{"vi":"Tư vấn công trình mới","ja":"新規工事相談"},{"vi":"Khảo sát để báo giá","ja":"見積調査"},{"vi":"Báo giá sửa chữa","ja":"修理見積"},{"vi":"Báo giá thi công","ja":"施工見積"},{"vi":"Tư vấn thiết bị phù hợp","ja":"適切機器提案"},{"vi":"Tư vấn phương án thi công","ja":"施工方法提案"},{"vi":"Tư vấn phương án tiết kiệm chi phí","ja":"コスト削減提案"},{"vi":"Giải thích dịch vụ","ja":"サービス説明"},{"vi":"Hỗ trợ hợp đồng","ja":"契約支援"},{"vi":"Điều chỉnh nội dung hợp đồng","ja":"契約内容調整"},{"vi":"Chăm sóc khách hàng","ja":"顧客フォロー"},{"vi":"Hỗ trợ đặt lịch dịch vụ","ja":"サービス予約支援"},{"vi":"Tiếp nhận yêu cầu khách hàng","ja":"顧客依頼受付"}]},{"code":"05","deptJa":"工事部","deptVi":"Bộ phận thi công","items":[{"vi":"Lắp đặt thiết bị","ja":"設備取付"},{"vi":"Tháo dỡ thiết bị","ja":"設備撤去"},{"vi":"Di dời thiết bị","ja":"設備移設"},{"vi":"Đi dây điện","ja":"電気配線"},{"vi":"Sửa dây điện","ja":"配線修理"},{"vi":"Lắp đèn","ja":"照明取付"},{"vi":"Thay đèn","ja":"照明交換"},{"vi":"Lắp ổ cắm / công tắc","ja":"コンセント・スイッチ取付"},{"vi":"Lắp CB / breaker","ja":"ブレーカー取付"},{"vi":"Lắp camera","ja":"カメラ取付"},{"vi":"Sửa camera","ja":"カメラ修理"},{"vi":"Đi dây mạng LAN","ja":"LAN配線"},{"vi":"Lắp Wi-Fi / router","ja":"Wi-Fi・ルーター設置"},{"vi":"Lắp máy lạnh","ja":"エアコン取付"},{"vi":"Tháo máy lạnh","ja":"エアコン撤去"},{"vi":"Lắp quạt thông gió","ja":"換気扇取付"},{"vi":"Thi công hệ thống điện","ja":"電気設備工事"},{"vi":"Thi công tủ điện","ja":"制御盤工事"},{"vi":"Thi công tại công trình","ja":"現場施工"},{"vi":"Lắp đặt máy móc","ja":"機械設置"},{"vi":"Sửa chữa tại công trình","ja":"現場修理"},{"vi":"Lắp đặt hệ thống mới","ja":"新規システム設置"},{"vi":"Cải tạo hệ thống cũ","ja":"既存システム改修"}]},{"code":"06","deptJa":"設計部","deptVi":"Bộ phận thiết kế","items":[{"vi":"Thiết kế bản vẽ","ja":"図面設計"},{"vi":"Chỉnh sửa bản vẽ","ja":"図面修正"},{"vi":"Thiết kế sơ đồ điện","ja":"電気系統図設計"},{"vi":"Vẽ CAD","ja":"CAD作図"},{"vi":"Thiết kế tủ điện","ja":"制御盤設計"},{"vi":"Thiết kế bố trí thiết bị","ja":"設備配置設計"},{"vi":"Thiết kế hệ thống điện","ja":"電気システム設計"},{"vi":"Làm bản vẽ thi công","ja":"施工図作成"},{"vi":"Làm bản vẽ hoàn công","ja":"竣工図作成"},{"vi":"Kiểm tra bản vẽ kỹ thuật","ja":"技術図面確認"},{"vi":"Tính toán vật tư","ja":"材料拾い出し"},{"vi":"Tính toán công suất","ja":"電気容量計算"},{"vi":"Thiết kế phương án thi công","ja":"施工方法設計"},{"vi":"Kiểm tra tiêu chuẩn kỹ thuật","ja":"技術基準確認"}]},{"code":"07","deptJa":"総務部","deptVi":"Bộ phận tổng vụ","items":[{"vi":"Hỗ trợ thủ tục","ja":"手続支援"},{"vi":"Xử lý giấy tờ","ja":"書類処理"},{"vi":"Cập nhật thông tin khách hàng","ja":"顧客情報更新"},{"vi":"Xác nhận thông tin dịch vụ","ja":"サービス情報確認"},{"vi":"Hỗ trợ đặt lịch","ja":"予約支援"},{"vi":"Điều chỉnh lịch hẹn","ja":"予約日程調整"},{"vi":"Hỗ trợ thanh toán","ja":"支払支援"},{"vi":"Xác nhận thanh toán","ja":"入金確認"},{"vi":"Xử lý yêu cầu hành chính","ja":"事務依頼対応"},{"vi":"Hỗ trợ hồ sơ dịch vụ","ja":"サービス書類支援"},{"vi":"Tiếp nhận yêu cầu chung","ja":"一般依頼受付"},{"vi":"Hướng dẫn sử dụng dịch vụ","ja":"サービス利用案内"},{"vi":"Kiểm tra thông tin khách hàng","ja":"顧客情報確認"},{"vi":"Hỗ trợ xử lý thông tin","ja":"情報処理支援"},{"vi":"Xác nhận hồ sơ","ja":"書類確認"}]}];
  window.YAMADEN_WORK_CATALOG = WORK_CATALOG;
  const SEND_TEXT = {
    ja:{issueTitle:"依頼内容を選択",issueSub:"作業内容を検索して選択し、下に詳しい状況を入力してください。",issuePh:"作業内容を検索して選択",issueRequired:"依頼内容を1つ以上選択してください。",quote:"見積を希望する",freeDesc:"状況、場所、必要なサポート内容を入力してください。",uploadSub:"最大12ファイル・JPG / PNG / MP4",noResult:"該当する項目がありません",sendTitle:"サポート依頼を送信",content:"依頼内容",image:"画像",chooseImage:"ファイルを選択",uploadText:"画像/動画を選択",settingsLogout:"ログアウト",settingsLogoutSub:"現在のアカウントからログアウトします。"},
    vi:{issueTitle:"Chọn vấn đề",issueSub:"Tìm và chọn nội dung công việc, sau đó mô tả chi tiết bên dưới.",issuePh:"Tìm và chọn nội dung công việc",issueRequired:"Vui lòng chọn ít nhất 1 vấn đề yêu cầu.",quote:"Muốn nhận báo giá",freeDesc:"Hãy nhập tình trạng, vị trí và điều bạn cần hỗ trợ.",uploadSub:"Tối đa 12 file · JPG / PNG / MP4",noResult:"Không có mục phù hợp",sendTitle:"Gửi yêu cầu",content:"Mô tả yêu cầu",image:"Hình ảnh / Video",chooseImage:"Chọn file",uploadText:"Chọn ảnh/video",settingsLogout:"Đăng xuất",settingsLogoutSub:"Đăng xuất khỏi tài khoản hiện tại."}
  };
  function langNow(){return ((localStorage.getItem("language")||localStorage.getItem("lang")||window.lang||"ja")==="vi")?"vi":"ja";}
  function tr(key){const l=langNow();return (SEND_TEXT[l]&&SEND_TEXT[l][key])||SEND_TEXT.ja[key]||key;}
  function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}
  function js(v){return String(v==null?"":v).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n");}
  function normalizeLang(){const l=langNow();try{window.lang=l;}catch(e){} localStorage.setItem("language",l); localStorage.setItem("lang",l); document.documentElement.lang=l;}
  function allIssues(){
    const l=langNow();
    return WORK_CATALOG.flatMap(dept => dept.items.map(item => ({
      code: dept.code,
      dept: l==="ja" ? dept.deptJa : dept.deptVi,
      label: l==="ja" ? item.ja : item.vi,
      ja: item.ja,
      vi: item.vi
    })));
  }
  function selectedIssues(){return Array.isArray(window.__yamadenChosenIssues)?window.__yamadenChosenIssues:(window.__yamadenChosenIssues=[]);}
  function canonicalIssues(){
    const chosen=selectedIssues();
    return chosen.map(value=>{
      const found=allIssues().find(x=>x.label===value||x.ja===value||x.vi===value);
      return found ? found.ja : value;
    });
  }
  function renderChosen(){
    const wrap=document.getElementById("selectedIssues"), hidden=document.getElementById("hiddenIssueInputs");
    if(!wrap||!hidden)return;
    wrap.innerHTML=selectedIssues().map((item,i)=>'<span class="selected-issue-tag">'+esc(item)+'<button type="button" onclick="removeIssueItem('+i+')" aria-label="remove"></button></span>').join("");
    hidden.innerHTML=canonicalIssues().map(item=>'<input type="checkbox" checked value="'+esc(item)+'">').join("");
    document.getElementById("issuePanel")?.classList.remove("required-missing");
  }
  window.renderIssueOptions=function(){
    const input=document.getElementById("issueSearchInput"), dd=document.getElementById("issueDropdown");
    if(!input||!dd)return;
    const kw=input.value.trim().toLowerCase();
    const chosen=new Set(selectedIssues());
    const items=allIssues().filter(item=>!chosen.has(item.label)&&(!kw||item.label.toLowerCase().includes(kw)||item.dept.toLowerCase().includes(kw)||item.ja.toLowerCase().includes(kw)||item.vi.toLowerCase().includes(kw)));
    dd.innerHTML=items.length ? items.slice(0,40).map(item=>'<button type="button" class="issue-option" onclick="selectIssueItem(\''+js(item.label)+'\')"><b>'+esc(item.label)+'</b><span>'+esc(item.dept)+'</span></button>').join("") : '<div class="issue-empty">'+esc(tr("noResult"))+'</div>';
    dd.classList.add("show");
  };
  window.renderIssueChips=function(){
    const box=document.getElementById("issueChipList"); if(!box)return;
    if(!document.getElementById("issueSearchInput")){
      box.innerHTML='<div class="issue-search-wrap"><input id="issueSearchInput" class="issue-search-input" autocomplete="off"><div id="issueDropdown" class="issue-dropdown"></div></div><div id="selectedIssues" class="selected-issues"></div><div id="hiddenIssueInputs" class="hidden-issue-inputs"></div>';
      const input=document.getElementById("issueSearchInput");
      input.addEventListener("input",window.renderIssueOptions);
      input.addEventListener("focus",()=>{document.getElementById("issueDropdown")?.classList.add("show");window.renderIssueOptions();});
    }
    const input=document.getElementById("issueSearchInput"); if(input)input.placeholder=tr("issuePh");
    const allowed=new Set(allIssues().map(x=>x.label));
    const current=selectedIssues();
    window.__yamadenChosenIssues=current.map(value=>{
      const found=allIssues().find(x=>x.ja===value||x.vi===value||x.label===value);
      return found?found.label:value;
    }).filter(value=>allowed.has(value));
    renderChosen();
  };
  window.selectIssueItem=function(item){if(!selectedIssues().includes(item))selectedIssues().push(item);const input=document.getElementById("issueSearchInput");if(input)input.value="";renderChosen();window.renderIssueOptions();};
  window.removeIssueItem=function(index){selectedIssues().splice(index,1);renderChosen();window.renderIssueOptions();};
  window.__updateIssueList=function(){window.renderIssueChips();};

  function syncBrand(){
    const jp=document.querySelector(".logo-jp"); if(jp)jp.textContent="株式会社 山電";
    const en=document.querySelector(".logo-en"); if(en)en.textContent="YAMADEN.CO.LTD";
    const pbn=document.querySelector("#homeSection .poster-brand-name"); if(pbn)pbn.textContent="株式会社 山電";
    const slogan=document.querySelector("#homeSection .poster-slogan"); if(slogan)slogan.textContent="人を守り、幸せを創る";
    const sub=document.querySelector("#homeSection .poster-slogan-sub"); if(sub)sub.textContent="Protecting people. Creating happiness.";
  }
  function syncSendLanguage(){
    const ids={issueTitle:"issueTitle",issueSub:"issueSub",issueRequiredText:"issueRequired",quoteOptionText:"quote",sendTitle:"sendTitle",labelImage:"image",chooseImageBtn:"chooseImage"};
    Object.entries(ids).forEach(([id,key])=>{const el=document.getElementById(id); if(el)el.textContent=tr(key);});
    const labelContent=document.getElementById("labelContent"); if(labelContent)labelContent.innerHTML=esc(tr("content"))+' <span class="required">*</span>';
    const content=document.getElementById("content"); if(content)content.placeholder=tr("freeDesc");
    document.querySelectorAll(".issue-free-note").forEach(el=>el.textContent=tr("freeDesc"));
    document.querySelectorAll(".upload-sub").forEach(el=>el.textContent=tr("uploadSub"));
    const input=document.getElementById("issueSearchInput"); if(input)input.placeholder=tr("issuePh");
    if(window.selectedMediaFiles&&window.selectedMediaFiles.length===0){const upload=document.getElementById("uploadText"); if(upload)upload.textContent=tr("uploadText");}
  }
  function syncSettings(){
    const icon=document.getElementById("tabServicesIcon"); if(icon)icon.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M4 12H2m20 0h-2M12 4V2m0 20v-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4m0-12.8 1.4-1.4M4.2 19.8l1.4-1.4"/></svg>';
    const list=document.querySelector("#settingsSection .settings-list");
    if(list&&!document.getElementById("settingsLogoutRow")){
      const row=document.createElement("div"); row.className="settings-row"; row.id="settingsLogoutRow";
      row.innerHTML='<div><b id="settingsLogoutTitle"></b><span id="settingsLogoutSub"></span></div><button class="settings-action" type="button" onclick="userLogout()" id="settingsLogoutBtn"></button>';
      list.appendChild(row);
    }
    const title=document.getElementById("settingsLogoutTitle"), sub=document.getElementById("settingsLogoutSub"), btn=document.getElementById("settingsLogoutBtn");
    if(title)title.textContent=tr("settingsLogout"); if(sub)sub.textContent=tr("settingsLogoutSub"); if(btn)btn.textContent=tr("settingsLogout");
  }
  function ensureAuthLanguageSwitch(){
    document.getElementById("authLanguageSwitch")?.remove();
    const current=langNow();
    const vi=document.getElementById("authLangVi"), ja=document.getElementById("authLangJa");
    if(vi){vi.classList.toggle("active",current==="vi");vi.classList.toggle("is-active",current==="vi");vi.setAttribute("aria-pressed",current==="vi"?"true":"false");}
    if(ja){ja.classList.toggle("active",current==="ja");ja.classList.toggle("is-active",current==="ja");ja.setAttribute("aria-pressed",current==="ja"?"true":"false");}
  }
  function syncUnified(){
    normalizeLang(); syncBrand(); syncSendLanguage(); syncSettings(); ensureAuthLanguageSwitch(); window.renderIssueChips();
  }
  const baseApply=window.applyLanguage;
  window.applyLanguage=function(){if(baseApply)baseApply();setTimeout(syncUnified,0);};
  const baseShow=window.showTab;
  window.showTab=function(tab){if(baseShow)baseShow(tab);setTimeout(syncUnified,0);};
  const baseSend=window.sendRequest;
  window.sendRequest=async function(){
    if(!canonicalIssues().length){document.getElementById("issuePanel")?.classList.add("required-missing"); if(window.showToast)showToast(tr("issueRequired")); return;}
    const oldFetch=window.fetch;
    window.fetch=function(url,opt){if(String(url).includes("/request")&&opt&&opt.body instanceof FormData){opt.body.set("issueTags",JSON.stringify(canonicalIssues()));opt.body.set("quoteRequested",document.getElementById("quoteRequested")?.checked?"true":"false");}return oldFetch.apply(this,arguments);};
    try{return await baseSend.apply(this,arguments);} finally {window.fetch=oldFetch;}
  };
  document.addEventListener("click",e=>{if(!e.target.closest(".issue-search-wrap"))document.getElementById("issueDropdown")?.classList.remove("show");});
  document.addEventListener("DOMContentLoaded",()=>setTimeout(syncUnified,400));
  setTimeout(syncUnified,0);
})();
