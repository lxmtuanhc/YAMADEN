const API=location.hostname==="localhost"||location.hostname==="127.0.0.1"?location.origin:"https://yamaden.onrender.com";const TOKEN_MAX_AGE=86400000;let currentLang=localStorage.getItem("language")||"ja",currentView="dashboard",currentStatusTab="all",currentTab="all",deleteId=null,deleteMode="request",requests=[],currentUsers=[],currentStaff=[];
const $=id=>document.getElementById(id);const dict={"ja":{"dashboard":"ダッシュボード","requestManage":"依頼管理","untreated":"未対応","processing":"対応中","quoted":"見積中","ordered":"受注","completed":"完了","lost":"失注","customerDeal":"顧客・取引","users":"顧客一覧","requestList":"依頼一覧","staffManage":"スタッフ管理","staffList":"スタッフ一覧","setting":"各種設定","urgentNeed":"重要","urgentSub":"未対応","todaySales":"本日の売上","todayOrders":"今週の受注","quoteRate":"見積→受注率","avgTime":"平均対応時間","claimRate":"クレーム率","top5":"すぐ対応すべき依頼 TOP 5","seeAll":"すべて見る ›","priority":"緊急度","content":"依頼内容","elapsed":"放置時間","assignee":"担当者","action":"操作","customer":"お客様","status":"ステータス","reply":"返信","aiAlert":"AI提案・アラート","staffStatus":"スタッフ稼働状況","mapToday":"本日の対応マップ","newReq":"新規依頼を作成","makeQuote":"見積作成","registerCustomer":"顧客登録","schedule":"現場訪問","chatList":"チャット","pageSub":"本日もおつかれさまです。依頼を素早く確認し、対応状況を管理しましょう。","logout":"ログアウト","all":"すべて","guest":"クイック依頼","account":"登録顧客","urgent":"緊急","high":"高","normal":"通常","low":"低","save":"保存","delete":"削除","call":"電話","map":"地図","noData":"データがありません","confirmDelete":"この依頼を削除してもよろしいですか？","confirmUserDelete":"このユーザーを削除しますか？","cancel":"キャンセル","adminRole":"管理者","aiRecommend":"AI推奨","aiUrgent":"緊急（確認が必要）","aiNormal":"通常（確認）","allStaff":"全担当者","urgency":"緊急度","image":"画像","video":"動画","edit":"編集","lock":"停止","unlock":"解除","workItems":"件対応中","workRate":"稼働率","unhandledAlert":"件の依頼が未対応です","earlyAction":"早急に対応してください","staffLoadAlert":"担当者の負荷を確認","autoAssignReview":"自動割当を見直してください","quoteWaiting":"見積返信待ちがあります","reminderRecommend":"リマインド送信をおすすめします"},"vi":{"dashboard":"Dashboard","requestManage":"Quản lý yêu cầu","untreated":"Chưa xử lý","processing":"Đang xử lý","quoted":"Đang báo giá","ordered":"Đã nhận đơn","completed":"Hoàn thành","lost":"Mất đơn","customerDeal":"Khách hàng","users":"Danh sách khách hàng","requestList":"Danh sách yêu cầu","staffManage":"Quản lý nhân viên","staffList":"Nhân viên","setting":"Cài đặt","urgentNeed":"Quan trọng","urgentSub":"Chưa xử lý","todaySales":"Doanh thu hôm nay","todayOrders":"Đơn tuần này","quoteRate":"Tỉ lệ báo giá→đơn","avgTime":"TG xử lý TB","claimRate":"Tỉ lệ claim","top5":"TOP 5 yêu cầu cần xử lý ngay","seeAll":"Xem tất cả ›","priority":"Độ khẩn cấp","content":"Nội dung","elapsed":"Thời gian chờ","assignee":"Phụ trách","action":"Thao tác","customer":"Khách hàng","status":"Trạng thái","reply":"Phản hồi","aiAlert":"Gợi ý / cảnh báo AI","staffStatus":"Tình trạng nhân viên","mapToday":"Bản đồ hôm nay","newReq":"Tạo yêu cầu mới","makeQuote":"Tạo báo giá","registerCustomer":"Đăng ký khách","schedule":"Lên lịch hiện trường","chatList":"Chat","pageSub":"Hôm nay cũng cố lên nhé. Kiểm tra yêu cầu và quản lý tiến độ nhanh hơn.","logout":"Đăng xuất","all":"Tất cả","guest":"Khách nhanh","account":"Tài khoản","urgent":"Khẩn cấp","high":"Cao","normal":"Thường","low":"Thấp","save":"Lưu","delete":"Xóa","call":"Gọi","map":"Bản đồ","noData":"Không có dữ liệu","confirmDelete":"Bạn có chắc muốn xóa yêu cầu này?","confirmUserDelete":"Bạn có chắc muốn xóa user này?","cancel":"Hủy","adminRole":"Quản trị","aiRecommend":"AI đề xuất","aiUrgent":"Khẩn cấp (cần kiểm tra)","aiNormal":"Thường (kiểm tra)","allStaff":"Tất cả phụ trách","urgency":"Độ khẩn","image":"Ảnh","video":"Video","edit":"Sửa","lock":"Khóa","unlock":"Mở khóa","workItems":" yêu cầu đang xử lý","workRate":"Tải công việc","unhandledAlert":" yêu cầu chưa xử lý","earlyAction":"Vui lòng xử lý sớm","staffLoadAlert":"Kiểm tra tải của nhân viên","autoAssignReview":"Nên xem lại phân công tự động","quoteWaiting":"Có yêu cầu đang chờ báo giá","reminderRecommend":"Nên gửi nhắc lại cho khách"}};
function t(k){return(dict[currentLang]&&dict[currentLang][k])||dict.ja[k]||k}function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}function authFailLogout(){localStorage.removeItem("adminToken");localStorage.removeItem("loginTime");location.href="/login.html"}function checkAuth(){const token=localStorage.getItem("adminToken"),lt=Number(localStorage.getItem("loginTime")||0);if(!token||!lt||Date.now()-lt>TOKEN_MAX_AGE)authFailLogout()}function logout(){authFailLogout()}function apiFetch(url,opt={}){return fetch(url,{...opt,headers:{...(opt.headers||{}),Authorization:"Bearer "+localStorage.getItem("adminToken")}})}
function changeLanguage(){currentLang=$("language").value;localStorage.setItem("language",currentLang);applyLanguage();renderAll()}
function applyLanguage(){
  document.documentElement.lang=currentLang;
  $("language").value=currentLang;
  document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));
  $("pageTitle").textContent=t(currentView==="dashboard"?"dashboard":currentView==="users"?"users":currentView==="staff"?"staffList":"requestList");
  $("pageSub").textContent=t("pageSub");
  $("logoutBtn").textContent=t("logout");
  if($("adminRole"))$("adminRole").textContent=t("adminRole");
  if($("brandTitle"))$("brandTitle").textContent=currentLang==="ja"?"株式会社 山電":"YAMADEN";
  if($("brandConsole"))$("brandConsole").textContent=currentLang==="ja"?"管理画面":"Admin Console";
  if($("cancelBtn"))$("cancelBtn").textContent=t("cancel");
  if($("deleteBtn"))$("deleteBtn").textContent=t("delete");
  if($("staffSaveBtn"))$("staffSaveBtn").textContent=t("save");
  renderStaticSelectLabels();
  updateTabs();
}
function showView(v){
  currentView=v;
  const requestFocus=v==="requests";
  document.body.classList.toggle("request-focus", requestFocus);
  ["dashboard","users","staff"].forEach(x=>$(x+"View")?.classList.toggle("hidden", requestFocus ? x!=="dashboard" : x!==v));
  if(requestFocus){$("dashboardView").classList.remove("hidden");}
  document.querySelectorAll(".menu-item").forEach(x=>x.classList.remove("active"));
  if(v==="users")$("menuUsers").classList.add("active");
  else if(v==="staff")$("menuStaff").classList.add("active");
  else if(requestFocus){
    const id={untreated:"menuUntreated",processing:"menuProcessing",quoted:"menuQuoted",ordered:"menuOrdered",completed:"menuCompleted",lost:"menuLost"}[currentStatusTab];
    if($(id))$(id).classList.add("active"); else $("menuDashboard").classList.add("active");
  } else $("menuDashboard").classList.add("active");
  applyLanguage();renderRequests();
  if(v==="users")loadUsers();
  if(v==="staff")loadStaff();
}
function openRequestStatus(st){currentTab="all";currentStatusTab=st;showView("requests");renderRequests()}function updateTabs(){const tabs=[['all',t('all')],['guest',t('guest')],['account',t('account')],['untreated',t('untreated')],['processing',t('processing')],['quoted',t('quoted')],['ordered',t('ordered')],['completed',t('completed')],['lost',t('lost')]];$("mainTabs").innerHTML=tabs.map(([k,l])=>`<button class="tab ${currentStatusTab===k||currentTab===k?'active':''}" onclick="tabClick('${k}')">${l} <span id="tab-${k}"></span></button>`).join("")}function tabClick(k){if(['all','guest','account'].includes(k)){currentTab=k;currentStatusTab='all'}else currentStatusTab=k;updateTabs();renderRequests()}
function normalizeStatus(s){s=String(s||"untreated").toLowerCase();if(["done","complete","completed"].includes(s))return"completed";if(["lost","cancel","canceled","cancelled"].includes(s))return"lost";if(["quote","quoted","estimate"].includes(s))return"quoted";if(["order","ordered"].includes(s))return"ordered";if(["processing","contacted","site"].includes(s))return"processing";return"untreated"}
function statusLabel(s){return t(normalizeStatus(s))}
function statusClass(s){return{untreated:"red",processing:"blue",quoted:"purple",ordered:"green",completed:"green",lost:"orange"}[normalizeStatus(s)]||"blue"}
function statusIcon(s){return{untreated:"⚡",processing:"◷",quoted:"▣",ordered:"✓",completed:"✓",lost:"×"}[normalizeStatus(s)]||"◷"}
function selectOptionsHtml(items,current,onPick){return '<div class="yam-select-menu">'+items.map(it=>'<div class="yam-select-option '+(String(it.value)===String(current)?'active':'')+'" onclick="'+onPick.replace('__VALUE__',String(it.value))+'">'+(it.icon||'')+' <span>'+esc(it.label)+'</span></div>').join('')+'</div>'}
function yamDropdown(id,label,items,current,onPick,extraClass=""){return '<div class="yam-select '+extraClass+'" id="'+id+'"><button type="button" class="yam-select-btn" onclick="toggleYamSelect(\''+id+'\')"><span>'+esc(label)+'</span></button>'+selectOptionsHtml(items,current,onPick)+'</div>'}
function statusDropdown(id,st){const items=['untreated','processing','quoted','ordered','completed','lost'].map(s=>({value:s,label:statusLabel(s),icon:statusIcon(s)}));return yamDropdown('status-dd-'+id,statusIcon(st)+' '+statusLabel(st),items,st,"updateStatus('"+id+"','__VALUE__')",'status-'+statusClass(st))}
function toggleYamSelect(id){document.querySelectorAll('.yam-select.open').forEach(x=>{if(x.id!==id)x.classList.remove('open')});const el=$(id);if(el)el.classList.toggle('open')}
document.addEventListener('click',e=>{if(!e.target.closest('.yam-select'))document.querySelectorAll('.yam-select.open').forEach(x=>x.classList.remove('open'))})
function isAccount(r){return !!(r.userId||r.accountId||r.source==="account")}function isUrgent(r){const text=[r.content,r.category,r.priority].join(" ");return /緊急|漏電|火災|停電|urgent|khẩn|chập|cháy/i.test(text)||String(r.priority||"").toLowerCase()==="high"}function dateText(d){if(!d)return"-";const dt=new Date(d);if(isNaN(dt))return"-";return dt.toLocaleString(currentLang==="ja"?"ja-JP":"vi-VN")}function elapsed(d){const dt=new Date(d||Date.now()),m=Math.max(0,Math.floor((Date.now()-dt)/60000));if(m<60)return m+"分";const h=Math.floor(m/60),mm=m%60;return h+"時間"+(mm?mm+"分":"")}function requestTitle(r){return r.category||r.title||r.content||r.message||"-"}function customerName(r){return r.name||r.customerName||r.userName||"-"}function phone(r){return r.phone||r.tel||""}function address(r){return r.address||r.location||""}
async function loadRequests(){try{const res=await apiFetch(API+"/requests");if(res.status===401)return authFailLogout();if(!res.ok)throw 0;const data=await res.json();requests=Array.isArray(data)?data:(data.requests||[]);renderAll()}catch(e){console.error(e);requests=[];renderAll()}}function renderAll(){renderDashboard();renderRequests();renderStaffStatus();renderAiAlerts();renderSideCounts()}function filteredRequests(){const kw=($("search")?.value||"").toLowerCase(),sf=$("staffFilter")?.value||"all",uf=$("urgentFilter")?.value||"all";return requests.filter(r=>{if(currentTab==="guest"&&isAccount(r))return false;if(currentTab==="account"&&!isAccount(r))return false;if(currentStatusTab!=="all"&&normalizeStatus(r.status)!==currentStatusTab)return false;if(sf!=="all"&&String(r.assigneeId||r.assigneeName||"")!==sf)return false;if(uf==="high"&&!isUrgent(r))return false;if(uf==="normal"&&isUrgent(r))return false;return [requestTitle(r),customerName(r),phone(r),address(r),r.adminReply].join(" ").toLowerCase().includes(kw)})}function renderSideCounts(){const c=s=>requests.filter(r=>normalizeStatus(r.status)===s).length;$("sideUntreated").textContent=c('untreated');$("sideProcessing").textContent=c('processing');$("sideQuoted").textContent=c('quoted');$("sideOrdered").textContent=c('ordered');$("sideCompleted").textContent=c('completed');if($("sideLost"))$("sideLost").textContent=c('lost');if($('tab-all'))$('tab-all').textContent=requests.length;if($('tab-guest'))$('tab-guest').textContent=requests.filter(r=>!isAccount(r)).length;if($('tab-account'))$('tab-account').textContent=requests.filter(r=>isAccount(r)).length;['untreated','processing','quoted','ordered','completed','lost'].forEach(s=>{if($('tab-'+s))$('tab-'+s).textContent=c(s)})}function renderDashboard(){const untreated=requests.filter(r=>normalizeStatus(r.status)==='untreated'),completed=requests.filter(r=>normalizeStatus(r.status)==='completed'),quoted=requests.filter(r=>normalizeStatus(r.status)==='quoted'),ordered=requests.filter(r=>normalizeStatus(r.status)==='ordered');$("kpiUrgent").textContent=untreated.length;$("kpiSales").textContent="¥"+(completed.length*48600).toLocaleString();$("kpiOrders").textContent=ordered.length+"件";$("kpiQuoteRate").textContent=quoted.length?Math.round(ordered.length/quoted.length*100)+"%":"0%";$("kpiAvg").textContent=requests.length?"2.4時間":"-";$("kpiClaim").textContent="2.1%";const top=[...requests].filter(r=>normalizeStatus(r.status)!=='completed').sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0)).slice(0,5);$("queueBody").innerHTML=top.length?top.map(r=>{const id=r.id||r._id;const st=bestStaffForRequest(r);return`<tr><td><span class="prio ${isUrgent(r)?'hot':''}">${isUrgent(r)?t('urgent'):t('high')}</span></td><td><div class="req-title">${esc(requestTitle(r))}</div><div class="muted">${esc(customerName(r))}</div></td><td><span class="time-red">${elapsed(r.createdAt)}</span></td><td><div class="staff-mini"><div class="mini-avatar"></div><div><b>${esc(r.assigneeName||st?.name||'-')}</b><div class="muted">${st?esc(st.skills||''):'AI推奨'}</div></div></div></td><td><div class="action-row"><button class="small-btn" onclick="callCustomer('${esc(phone(r))}')">☎</button><button class="small-btn" onclick="focusReply('${id}')">💬</button><button class="small-btn done" onclick="updateStatus('${id}','processing')">${t('processing')}</button></div></td></tr>`}).join(""):`<tr><td colspan="5" class="muted" style="text-align:center;padding:22px">${t('noData')}</td></tr>`}
function renderRequests(){if(!$("requestBody"))return;updateTabs();const list=filteredRequests();$("requestBody").innerHTML=list.length?list.map(r=>{const id=r.id||r._id,st=normalizeStatus(r.status),ai=isUrgent(r)?t("aiUrgent"):t("aiNormal");return`<tr><td><div class="idline">${esc(r.requestId||('REQ-'+String(id).slice(-6)))}</div></td><td><span class="request-title">${esc(requestTitle(r))}</span><div class="muted request-sub">${esc(address(r))}</div>${mediaHtml(r)}</td><td><b>${esc(customerName(r))}</b><div class="muted">${esc(phone(r))}</div></td><td><span class="pill ${isUrgent(r)?'red':'orange'}">${isUrgent(r)?t('urgent'):t('normal')}</span></td><td>${assigneeHtml(r)}</td><td>${statusDropdown(id,st)}</td><td><span class="time-red">${elapsed(r.createdAt)}</span></td><td><span class="pill blue">${ai}</span></td><td><textarea class="reply-input" id="reply-${id}">${esc(r.adminReply||"")}</textarea><button class="small-btn done" onclick="saveReply('${id}')">${t('save')}</button></td><td><div class="action-row"><button class="small-btn" title="${t('call')}" onclick="callCustomer('${esc(phone(r))}')">☎</button><button class="small-btn" title="${t('map')}" onclick="openMap('${encodeURIComponent(address(r))}')">⌖</button><button class="small-btn" title="${t('delete')}" style="color:#ef4444" onclick="deleteRequest('${id}')">🗑</button></div></td></tr>`}).join(""):`<tr><td colspan="10" class="muted" style="text-align:center;padding:30px">${t('noData')}</td></tr>`;renderSideCounts()}function mediaHtml(r){const arr=[];if(Array.isArray(r.mediaFiles))r.mediaFiles.forEach(x=>arr.push(x));if(Array.isArray(r.images))r.images.forEach(x=>arr.push({url:x,type:"image"}));if(Array.isArray(r.files))r.files.forEach(x=>arr.push({url:x,type:"image"}));if(r.mediaUrl)arr.unshift({url:r.mediaUrl,type:r.mediaType||"image"});if(r.image)arr.unshift({url:r.image,type:"image"});return '<div class="media-list">'+arr.slice(0,4).map(file=>{const url=file.url||file;const type=file.type||(/\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)?"video":"image");return `<button class="media-chip" onclick="openImageModal('${encodeURIComponent(url)}','${type}')">${type==="video"?t('video'):t('image')}</button>`}).join("")+'</div>'}function assigneeHtml(r){const id=r.id||r._id;return`<select class="filter-select" id="assignee-${id}"><option value="">${t('aiRecommend')}</option>${currentStaff.map(s=>`<option value="${s._id}" ${(r.assigneeId==s._id||r.assigneeName==s.name)?'selected':''}>${esc(s.name)}</option>`).join('')}</select><button class="small-btn done" onclick="saveAssignee('${id}')">OK</button>`}
function cycleStatus(id,st){const order=['untreated','processing','quoted','ordered','completed','lost'];updateStatus(id,order[(order.indexOf(st)+1)%order.length])}
function renderAiAlerts(){const old=requests.filter(r=>normalizeStatus(r.status)==='untreated').length;$("aiAlerts").innerHTML=`<div class="alert red"><div class="aico">⚠</div><div><b>${old}${t('unhandledAlert')}</b><br><span class="muted">${t('earlyAction')}</span></div></div><div class="alert orange"><div class="aico">△</div><div><b>${t('staffLoadAlert')}</b><br><span class="muted">${t('autoAssignReview')}</span></div></div><div class="alert blue"><div class="aico">ⓘ</div><div><b>${t('quoteWaiting')}</b><br><span class="muted">${t('reminderRecommend')}</span></div></div>`}
async function loadStaff(silent=false){try{const res=await apiFetch(API+"/admin/staff");if(res.status===401)return authFailLogout();if(!res.ok)throw 0;const data=await res.json();currentStaff=Array.isArray(data)?data:(data.staff||[])}catch(e){if(!silent)console.error(e);currentStaff=[]}renderStaff();renderStaffStatus();renderStaffFilter();if(requests.length)renderRequests()}function renderStaffFilter(){const el=$("staffFilter");if(!el)return;el.innerHTML=`<option value="all">${t('allStaff')}</option>`+currentStaff.map(s=>`<option value="${s._id||s.name}">${esc(s.name)}</option>`).join("")}
function renderStaffStatus(){if(!$("staffStatusList"))return;if(!currentStaff.length){$("staffStatusList").innerHTML=`<div class="muted" style="padding:18px;text-align:center">${t('noData')}</div>`;$("sideStaff").textContent=0;return;}$("staffStatusList").innerHTML=currentStaff.slice(0,5).map((s,i)=>`<div class="staff-row"><div class="mini-avatar"></div><div><b>${esc(s.name)}</b> <span class="pill ${s.status==='off'?'orange':'green'}">${s.status||'active'}</span><div class="muted">${i+1}件対応中</div></div><div><span class="muted">稼働率 ${Math.max(20,92-i*18)}%</span><div class="progress ${i>1?'orange':''}"><span style="width:${Math.max(20,92-i*18)}%"></span></div></div></div>`).join("");$("sideStaff").textContent=currentStaff.length}function renderStaff(){if(!$("staffList"))return;$("staffList").innerHTML=currentStaff.length?currentStaff.map(s=>`<div class="card-row"><div><b>${esc(s.name)}</b><div class="muted">${esc(s.phone)} / ${esc(s.email)}</div></div><div><span class="pill blue">${esc(s.areas||'-')}</span> <span class="pill purple">${esc(s.skills||'-')}</span></div><div class="action-row"><button class="small-btn done" onclick="editStaff('${s._id}')">編集</button><button class="small-btn" style="color:#ef4444" onclick="deleteStaffProfile('${s._id}')">🗑</button></div></div>`).join(""):`<div class="muted" style="padding:20px">${t('noData')}</div>`}function editStaff(id){const s=currentStaff.find(x=>String(x._id)===String(id));if(!s)return;['Name','Phone','Email','Areas','Skills'].forEach(k=>$('staff'+k).value=s[k.toLowerCase()]||'');$('staffStatus').value=s.status||'active';$('staffSaveBtn').dataset.editId=id}async function saveStaffProfile(){const id=$('staffSaveBtn').dataset.editId||'',body={name:$('staffName').value.trim(),phone:$('staffPhone').value.trim(),email:$('staffEmail').value.trim(),areas:$('staffAreas').value.trim(),skills:$('staffSkills').value.trim(),status:$('staffStatus').value};if(!body.name)return;const res=await apiFetch(API+"/admin/staff"+(id?"/"+encodeURIComponent(id):""),{method:id?'PUT':'POST',headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});if(res.status===401)return authFailLogout();['staffName','staffPhone','staffEmail','staffAreas','staffSkills'].forEach(x=>$(x).value='');$('staffSaveBtn').dataset.editId='';loadStaff()}async function deleteStaffProfile(id){await apiFetch(API+"/admin/staff/"+encodeURIComponent(id),{method:'DELETE'});loadStaff()}function bestStaffForRequest(r){return currentStaff.find(s=>s.status!=='off')||null}async function saveAssignee(id){const sel=$('assignee-'+id),s=currentStaff.find(x=>String(x._id)===String(sel.value));await apiFetch(API+"/request/"+encodeURIComponent(id),{method:'PUT',headers:{"Content-Type":"application/json"},body:JSON.stringify({assigneeId:s?._id||'',assigneeName:s?.name||''})});loadRequests()}
async function loadUsers(){try{const res=await apiFetch(API+"/admin/users");if(res.status===401)return authFailLogout();if(!res.ok)throw 0;const data=await res.json();currentUsers=Array.isArray(data)?data:(data.users||[])}catch(e){currentUsers=[]}renderUsers();$("sideUsers").textContent=currentUsers.length}function renderUsers(){const kw=($("userSearch")?.value||"").toLowerCase();const list=currentUsers.filter(u=>[u.name,u.phone,u.email,u.company,u.province].join(" ").toLowerCase().includes(kw));$("usersList").innerHTML=list.length?list.map(u=>`<div class="card-row"><div><b>${esc(u.name||u.phone||'-')}</b><div class="muted">${esc(u.phone||'')} ${esc(u.email||'')}</div></div><div><span class="pill blue">${esc(u.company||'-')}</span> <span class="pill green">${esc(u.status||'active')}</span></div><div class="action-row"><button class="small-btn done" onclick="toggleUserStatus('${u._id}','${u.status==='blocked'?'active':'blocked'}')">${u.status==='blocked'?'解除':'停止'}</button><button class="small-btn" style="color:#ef4444" onclick="deleteUser('${u._id}')">🗑</button></div></div>`).join(""):`<div class="muted" style="padding:20px">${t('noData')}</div>`}async function toggleUserStatus(id,status){await apiFetch(API+"/admin/users/"+encodeURIComponent(id),{method:'PUT',headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});loadUsers()}
async function updateStatus(id,status){const res=await apiFetch(API+"/request/"+encodeURIComponent(id),{method:'PUT',headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});if(res.status===401)return authFailLogout();loadRequests()}async function saveReply(id){const box=$('reply-'+id);const res=await apiFetch(API+"/request/"+encodeURIComponent(id),{method:'PUT',headers:{"Content-Type":"application/json"},body:JSON.stringify({adminReply:box?box.value:''})});if(res.status===401)return authFailLogout();loadRequests()}function deleteRequest(id){deleteId=id;deleteMode='request';$('modalText').textContent=t('confirmDelete');$('modal').style.display='flex'}function deleteUser(id){deleteId=id;deleteMode='user';$('modalText').textContent=t('confirmUserDelete');$('modal').style.display='flex'}function closeModal(){$('modal').style.display='none';deleteId=null;deleteMode='request'}async function confirmDelete(){if(!deleteId)return;const url=deleteMode==='user'?API+"/admin/users/"+encodeURIComponent(deleteId):API+"/request/"+encodeURIComponent(deleteId);const res=await apiFetch(url,{method:'DELETE'});if(res.status===401)return authFailLogout();closeModal();deleteMode==='user'?loadUsers():loadRequests()}function callCustomer(p){if(p)location.href='tel:'+p}function openMap(a){if(a)window.open('https://www.google.com/maps/search/?api=1&query='+a,'_blank')}function openImageModal(src,type='image'){src=decodeURIComponent(src||'');if(!src)return;const img=$('imageModalImg'),v=$('imageModalVideo');if(type==='video'){img.style.display='none';v.style.display='block';v.src=src}else{v.pause();v.style.display='none';img.style.display='block';img.src=src}$('imageModal').style.display='flex'}function closeImageModal(){const v=$('imageModalVideo');v.pause();v.src='';$('imageModalImg').src='';$('imageModal').style.display='none'}

function focusReply(id){showView('requests');setTimeout(()=>{const box=$('reply-'+id);if(box){box.focus();box.scrollIntoView({behavior:'smooth',block:'center'})}},120)}
function createNewRequest(){window.open('/index.html','_blank')}
function openSettingsPanel(){document.querySelectorAll('.menu-item').forEach(x=>x.classList.remove('active'));if($('menuSettings'))$('menuSettings').classList.add('active');$('modalTitle').textContent=currentLang==='ja'?'設定メニュー':'Menu cài đặt';$('modalText').innerHTML='<div class="settings-modal-list"><div class="settings-modal-item">🔔 Slack / 通知設定</div><div class="settings-modal-item">🤖 AI判定・自動アサインルール</div><div class="settings-modal-item">👥 スタッフ・エリア設定</div><div class="settings-modal-item">📊 KPI / 対応期限設定</div></div>';$('cancelBtn').textContent=currentLang==='ja'?'閉じる':'Đóng';$('deleteBtn').style.display='none';$('modal').style.display='flex'}
const closeModalOriginal=closeModal;closeModal=function(){if($('deleteBtn'))$('deleteBtn').style.display='';closeModalOriginal()}


function renderStaticSelectLabels(){
  const sf=$("staffFilter"); if(sf&&sf.options.length) sf.options[0].textContent=t("allStaff");
  const uf=$("urgentFilter"); if(uf&&uf.options.length){uf.options[0].textContent=t("urgency"); if(uf.options[1])uf.options[1].textContent=t("high"); if(uf.options[2])uf.options[2].textContent=t("normal");}
  const search=$("search"); if(search) search.placeholder=currentLang==="ja"?"検索...":"Tìm kiếm...";
}

document.addEventListener('DOMContentLoaded',()=>{checkAuth();applyLanguage();loadStaff(true);loadUsers();loadRequests()});

/* ===== Split from admin.html ===== */

(function(){
  const cleanDict={
    ja:{dashboard:'ダッシュボード',requestManage:'管理要求',untreated:'未対応',processing:'対応中',estimating:'見積中',quoted:'見積済み',ordered:'受注済み',completed:'完了',lost:'未成約',users:'顧客管理',staffManage:'スタッフプロフィール',staffList:'スタッフプロフィール',setting:'設定',makeQuote:'見積作成',urgentNeed:'未対応',urgentSub:'未対応',todaySales:'本日の売上',todayOrders:'今週の受注',quoteRate:'見積→受注率',avgTime:'平均対応時間',claimRate:'クレーム率',top5:'TOP 5 すぐ対応すべき依頼',currentRequests:'現在の依頼',seeAll:'すべて見る',priority:'緊急度',content:'内容',elapsed:'待機時間',assignee:'担当者',action:'操作',customer:'顧客',status:'ステータス',reply:'返信',pageSub:'依頼と対応状況を管理できます',logout:'ログアウト',all:'すべて',urgent:'緊急',high:'高',normal:'通常',save:'保存',delete:'削除',call:'電話',map:'地図',noData:'データがありません',confirmDelete:'この依頼を削除してもよろしいですか？',confirmUserDelete:'このユーザーを削除しますか？',cancel:'キャンセル',adminRole:'管理者',aiRecommend:'AI推奨',allStaff:'全担当者',urgency:'緊急度',image:'画像',video:'動画',edit:'編集',lock:'停止',unlock:'解除',approve:'承認',detail:'詳細',basic:'基本情報',history:'依頼履歴',addStaff:'スタッフを追加',settingsTitle:'設定',general:'基本設定',security:'権限・セキュリティ',backup:'バックアップ',system:'システム情報'},
    vi:{dashboard:'Trang chủ',requestManage:'Quản lý yêu cầu',untreated:'Chưa xử lý',processing:'Đang xử lý',estimating:'Đang báo giá',quoted:'Đã báo giá',ordered:'Đã nhận đơn',completed:'Hoàn thành',lost:'Không hoàn thành',users:'Khách hàng',staffManage:'Hồ sơ nhân viên',staffList:'Hồ sơ nhân viên',setting:'Cài đặt',makeQuote:'Tạo báo giá',urgentNeed:'Chưa xử lý',urgentSub:'Chưa xử lý',todaySales:'Doanh thu hôm nay',todayOrders:'Đơn tuần này',quoteRate:'Tỉ lệ báo giá→đơn',avgTime:'TG xử lý TB',claimRate:'Tỉ lệ claim',top5:'TOP 5 yêu cầu cần xử lý',currentRequests:'Các yêu cầu hiện có',seeAll:'Xem tất cả',priority:'Độ khẩn',content:'Nội dung',elapsed:'Thời gian chờ',assignee:'Phụ trách',action:'Thao tác',customer:'Khách hàng',status:'Trạng thái',reply:'Phản hồi',pageSub:'Quản lý yêu cầu và tiến độ xử lý',logout:'Đăng xuất',all:'Tất cả',urgent:'Khẩn cấp',high:'Cao',normal:'Thường',save:'Lưu',delete:'Xóa',call:'Gọi',map:'Bản đồ',noData:'Không có dữ liệu',confirmDelete:'Bạn có chắc muốn xóa yêu cầu này?',confirmUserDelete:'Bạn có chắc muốn xóa user này?',cancel:'Hủy',adminRole:'Admin',aiRecommend:'AI đề xuất',allStaff:'Tất cả phụ trách',urgency:'Độ khẩn',image:'Ảnh',video:'Video',edit:'Sửa',lock:'Khóa',unlock:'Mở khóa',approve:'Duyệt',detail:'Chi tiết',basic:'Thông tin cơ bản',history:'Lịch sử yêu cầu',addStaff:'Thêm hồ sơ',settingsTitle:'Cài đặt',general:'Cài đặt chung',security:'Quyền và bảo mật',backup:'Sao lưu dữ liệu',system:'Thông tin hệ thống'}
  };
  try{dict.ja=Object.assign({},dict.ja,cleanDict.ja);dict.vi=Object.assign({},dict.vi,cleanDict.vi);}catch(e){}
  function ft(k){return (dict[currentLang]&&dict[currentLang][k])||cleanDict.ja[k]||k}
  window.normalizeStatus=function(s){s=String(s||'untreated').toLowerCase();if(['done','complete','completed'].includes(s))return'completed';if(['lost','cancel','canceled','cancelled','failed'].includes(s))return'lost';if(['estimating','estimate_pending','quoting'].includes(s))return'estimating';if(['quote','quoted','estimate'].includes(s))return'quoted';if(['order','ordered','accepted'].includes(s))return'ordered';if(['processing','contacted','site','visited'].includes(s))return'processing';return'untreated'};
  window.statusClass=function(s){return{untreated:'red',processing:'blue',estimating:'orange',quoted:'purple',ordered:'green',completed:'green',lost:'orange'}[normalizeStatus(s)]||'blue'};
  window.statusIcon=function(s){return{untreated:'⚡',processing:'◷',estimating:'▣',quoted:'▣',ordered:'✓',completed:'✓',lost:'×'}[normalizeStatus(s)]||'◷'};
  function countStatus(s){return (requests||[]).filter(r=>normalizeStatus(r.status)===s).length}
  function rebuildSidebar(){const side=document.querySelector('.sidebar'); if(!side)return;side.innerHTML='<div class="brand" onclick="logoReload()"><div class="brand-logo"><img src="/assets/icon-admin-192.png" alt="YAMADEN"></div><div><div class="brand-title">YAMADEN</div><div class="brand-sub">YAMADEN.CO.LTD</div></div></div><div class="final-nav"><button class="final-nav-btn" id="finalNavDashboard" onclick="showView(\'dashboard\')"><span class="left"><span class="ico">⌂</span><span>'+ft('dashboard')+'</span></span></button><button class="final-nav-btn" id="finalNavRequests" onclick="showView(\'requests\')"><span class="left"><span class="ico">☷</span><span>'+ft('requestManage')+'</span></span><span class="count" id="finalReqCount">0</span></button><button class="final-nav-btn" id="finalNavUsers" onclick="showView(\'users\')"><span class="left"><span class="ico">♟</span><span>'+ft('users')+'</span></span><span class="count" id="finalUserCount">0</span></button><button class="final-nav-btn" id="finalNavStaff" onclick="showView(\'staff\')"><span class="left"><span class="ico">♙</span><span>'+ft('staffManage')+'</span></span><span class="count" id="finalStaffCount">0</span></button><button class="final-nav-btn quote" id="finalNavQuotes" onclick="showView(\'quotes\')"><span class="left"><span class="ico">Q</span><span>'+ft('makeQuote')+'</span></span></button><button class="final-nav-btn settings" id="finalNavSettings" onclick="showView(\'settings\')"><span class="left"><span class="ico">⚙</span><span>'+ft('setting')+'</span></span></button></div>'}
  function activeNav(v){['Dashboard','Requests','Users','Staff','Quotes','Settings'].forEach(x=>document.getElementById('finalNav'+x)?.classList.remove('active')); const map={dashboard:'Dashboard',requests:'Requests',users:'Users',staff:'Staff',quotes:'Quotes',settings:'Settings'}; document.getElementById('finalNav'+(map[v]||'Dashboard'))?.classList.add('active')}
  function updateFinalCounts(){const r=document.getElementById('finalReqCount'),u=document.getElementById('finalUserCount'),s=document.getElementById('finalStaffCount'); if(r)r.textContent=(requests||[]).length; if(u)u.textContent=(currentUsers||[]).length; if(s)s.textContent=(currentStaff||[]).length; if($('notifyUntreated'))$('notifyUntreated').textContent=countStatus('untreated'); if($('notifyChat'))$('notifyChat').textContent=countStatus('processing')}
  function ensureSettingsView(){if(document.getElementById('settingsView'))return;const content=document.querySelector('.content');if(!content)return;const sec=document.createElement('section');sec.id='settingsView';sec.className='settings-view';sec.innerHTML='<div class="panel"><div class="panel-head"><div class="panel-title" id="settingsTitleFinal"></div></div><div class="settings-grid"><div class="settings-item"><b id="setGeneral"></b><p>Language, company profile, display rules.</p></div><div class="settings-item"><b id="setSecurity"></b><p>Admin permissions and account security.</p></div><div class="settings-item"><b id="setBackup"></b><p>Request and customer data backup.</p></div><div class="settings-item"><b id="setSystem"></b><p>API, app version, and maintenance notes.</p></div></div></div>';content.appendChild(sec)}
  function ensureDashboardRequestHead(){const panel=document.querySelector('.request-panel');if(!panel||document.querySelector('.dashboard-current-head'))return;const head=document.createElement('div');head.className='dashboard-current-head';head.id='dashboardCurrentHead';panel.insertBefore(head,panel.firstChild)}
  function applyFinalLanguage(){ensureDashboardRequestHead();if($('language')){$('language').innerHTML='<option value="ja">日本語</option><option value="vi">Tiếng Việt</option>';$('language').value=currentLang;}const page=$('pageTitle'); if(page) page.textContent=currentView==='requests'?ft('requestManage'):currentView==='users'?ft('users'):currentView==='staff'?ft('staffManage'):currentView==='quotes'?ft('makeQuote'):currentView==='settings'?ft('setting'):ft('dashboard'); if($('pageSub'))$('pageSub').textContent=ft('pageSub'); if($('logoutBtn'))$('logoutBtn').textContent=ft('logout'); if($('adminRole'))$('adminRole').textContent=ft('adminRole'); document.querySelectorAll('[data-i]').forEach(el=>{const key=el.getAttribute('data-i'); if(ft(key)) el.textContent=ft(key)});const dh=$('dashboardCurrentHead'); if(dh)dh.textContent=ft('currentRequests'); ensureSettingsView(); const ids={settingsTitleFinal:'settingsTitle',setGeneral:'general',setSecurity:'security',setBackup:'backup',setSystem:'system'}; Object.entries(ids).forEach(([id,key])=>{const el=$(id);if(el)el.textContent=ft(key)})}
  window.updateTabs=function(){const tabs=[['all',ft('all')],['untreated',ft('untreated')],['processing',ft('processing')],['estimating',ft('estimating')],['quoted',ft('quoted')],['ordered',ft('ordered')],['completed',ft('completed')],['lost',ft('lost')]]; const box=$('mainTabs'); if(!box)return; box.innerHTML=tabs.map(([k,l])=>'<button class="tab '+((currentStatusTab===k||currentTab===k)?'active':'')+'" onclick="tabClick(\''+k+'\')">'+l+' <span id="tab-'+k+'"></span></button>').join('')};
  window.tabClick=function(k){currentTab='all';currentStatusTab=k;updateTabs();renderRequests()}; window.openRequestStatus=function(st){currentTab='all';currentStatusTab=st||'all';showView('requests');renderRequests()};
  function mediaFiles(r){const arr=[]; if(Array.isArray(r.mediaFiles))arr.push(...r.mediaFiles); if(Array.isArray(r.images))arr.push(...r.images.map(x=>({url:x,type:'image'}))); if(Array.isArray(r.files))arr.push(...r.files.map(x=>({url:x,type:/\.(mp4|mov|webm|m4v)(\?|$)/i.test(x)?'video':'image'}))); if(r.mediaUrl)arr.unshift({url:r.mediaUrl,type:r.mediaType||'image'}); if(r.image)arr.unshift({url:r.image,type:'image'}); return arr.filter(x=>x&&(x.url||x))}
  window.renderSideCounts=function(){updateFinalCounts(); if($('tab-all'))$('tab-all').textContent=(requests||[]).length; ['untreated','processing','estimating','quoted','ordered','completed','lost'].forEach(s=>{const el=$('tab-'+s); if(el)el.textContent=countStatus(s)})};
  window.filteredRequests=function(){const kw=($('search')?.value||'').toLowerCase(),sf=$('staffFilter')?.value||'all',uf=$('urgentFilter')?.value||'all'; return (requests||[]).filter(r=>{if(currentStatusTab!=='all'&&normalizeStatus(r.status)!==currentStatusTab)return false;if(sf!=='all'&&String(r.assigneeId||r.assigneeName||'')!==sf)return false;if(uf==='high'&&!isUrgent(r))return false;if(uf==='normal'&&isUrgent(r))return false;return [requestTitle(r),customerName(r),phone(r),address(r),r.adminReply].join(' ').toLowerCase().includes(kw)})};
  window.renderDashboard=function(){const untreated=(requests||[]).filter(r=>normalizeStatus(r.status)==='untreated'),completed=(requests||[]).filter(r=>normalizeStatus(r.status)==='completed'),quoted=(requests||[]).filter(r=>['quoted','estimating'].includes(normalizeStatus(r.status))),ordered=(requests||[]).filter(r=>normalizeStatus(r.status)==='ordered'); if($('kpiUrgent'))$('kpiUrgent').textContent=untreated.length; if($('kpiSales'))$('kpiSales').textContent='¥'+(completed.length*48600).toLocaleString(); if($('kpiOrders'))$('kpiOrders').textContent=ordered.length+'件'; if($('kpiQuoteRate'))$('kpiQuoteRate').textContent=quoted.length?Math.round(ordered.length/quoted.length*100)+'%':'0%'; if($('kpiAvg'))$('kpiAvg').textContent=(requests||[]).length?'2.4時間':'-'; if($('kpiClaim'))$('kpiClaim').textContent='2.1%'; const top=[...(requests||[])].filter(r=>!['completed','lost'].includes(normalizeStatus(r.status))).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0)).slice(0,5); const qb=$('queueBody'); if(qb)qb.innerHTML=top.length?top.map(r=>{const id=r.id||r._id;const st=bestStaffForRequest(r);return '<tr class="req-row" onclick="openRequestDetail(\''+esc(id)+'\')"><td><span class="prio '+(isUrgent(r)?'hot':'')+'">'+(isUrgent(r)?ft('urgent'):ft('high'))+'</span></td><td><div class="req-title">'+esc(requestTitle(r))+'</div><div class="muted">'+esc(customerName(r))+'</div></td><td><span class="time-red">'+elapsed(r.createdAt)+'</span></td><td><div class="staff-mini"><div class="mini-avatar"></div><div><b>'+esc(r.assigneeName||st?.name||'-')+'</b><div class="muted">'+(st?esc(st.skills||''):ft('aiRecommend'))+'</div></div></div></td><td><div class="action-row" onclick="event.stopPropagation()"><button class="small-btn" onclick="callCustomer(\''+esc(phone(r))+'\')">☎</button><button class="small-btn done" onclick="updateStatus(\''+id+'\',\'processing\')">'+ft('processing')+'</button></div></td></tr>'}).join(''):'<tr><td colspan="5" class="muted" style="text-align:center;padding:22px">'+ft('noData')+'</td></tr>'};
  window.renderRequests=function(){const body=$('requestBody');if(!body)return;updateTabs();const list=filteredRequests();body.innerHTML=list.length?list.map(r=>{const id=r.id||r._id,st=normalizeStatus(r.status);return '<tr class="req-row" onclick="openRequestDetail(\''+esc(id)+'\')"><td class="col-id"><div class="idline">'+esc(r.requestId||('REQ-'+String(id).slice(-6)))+'</div></td><td class="col-title"><span class="request-title">'+esc(requestTitle(r))+'</span><div class="muted request-sub">'+esc(address(r))+'</div></td><td class="col-customer"><b>'+esc(customerName(r))+'</b><div class="muted">'+esc(phone(r))+'</div></td><td class="col-priority"><span class="pill '+(isUrgent(r)?'red':'orange')+'">'+(isUrgent(r)?ft('urgent'):ft('normal'))+'</span></td><td class="col-staff">'+esc(r.assigneeName||'-')+'</td><td class="col-status"><span class="pill '+statusClass(st)+'">'+statusLabel(st)+'</span></td><td class="col-time"><span class="time-red">'+elapsed(r.createdAt)+'</span></td><td class="col-action"><button class="small-btn done" onclick="event.stopPropagation();openRequestDetail(\''+esc(id)+'\')">'+ft('detail')+'</button></td></tr>'}).join(''):'<tr><td colspan="8" class="muted" style="text-align:center;padding:30px">'+ft('noData')+'</td></tr>';renderSideCounts()};
  function ensureRequestModal(){if($('requestDetailModal'))return;const modal=document.createElement('div');modal.id='requestDetailModal';modal.className='request-detail-modal';modal.onclick=e=>{if(e.target===modal)modal.classList.remove('show')};modal.innerHTML='<div class="request-detail-box"><div class="request-detail-head"><div><div class="request-detail-title" id="requestDetailTitle"></div><div class="muted" id="requestDetailSub"></div></div><button class="request-detail-close" onclick="document.getElementById(\'requestDetailModal\').classList.remove(\'show\')">×</button></div><div class="request-detail-body"><div><div class="detail-section"><h3 id="requestInfoTitle"></h3><div class="detail-grid" id="requestInfoGrid"></div></div><div class="detail-section" style="margin-top:12px"><h3>Media</h3><div class="detail-media" id="requestMediaGrid"></div></div></div><div class="detail-section"><h3 id="requestActionTitle"></h3><div class="detail-actions" id="requestActionBox"></div></div></div></div>';document.body.appendChild(modal)}
  window.openRequestDetail=function(id){ensureRequestModal();const r=(requests||[]).find(x=>String(x.id||x._id)===String(id));if(!r)return;const st=normalizeStatus(r.status);$('requestDetailTitle').textContent=(r.requestId||('REQ-'+String(id).slice(-6)))+' / '+requestTitle(r);$('requestDetailSub').textContent=customerName(r)+'  '+phone(r);$('requestInfoTitle').textContent=ft('basic');const fields=[[ft('customer'),customerName(r)],[ft('call'),phone(r)],[ft('map'),address(r)],[ft('content'),requestTitle(r)],[ft('status'),statusLabel(st)],[ft('elapsed'),elapsed(r.createdAt)],[ft('assignee'),r.assigneeName||'-'],[ft('priority'),isUrgent(r)?ft('urgent'):ft('normal')]];$('requestInfoGrid').innerHTML=fields.map(([k,v])=>'<div class="detail-field"><b>'+esc(k)+'</b><span>'+esc(v||'-')+'</span></div>').join('');const media=mediaFiles(r);$('requestMediaGrid').innerHTML=media.length?media.map((m)=>{const url=m.url||m,type=m.type||(/\.(mp4|mov|webm|m4v)(\?|$)/i.test(url)?'video':'image');return '<button onclick="openImageModal(\''+encodeURIComponent(url)+'\',\''+type+'\')">'+(type==='video'?'<video src="'+esc(url)+'"></video>':'<img src="'+esc(url)+'" alt="media">')+'</button>'}).join(''):'<div class="muted">'+ft('noData')+'</div>';$('requestActionBox').innerHTML='<button class="small-btn done" onclick="callCustomer(\''+esc(phone(r))+'\')">☎ '+ft('call')+'</button><button class="small-btn done" onclick="openMap(\''+encodeURIComponent(address(r))+'\')">⌖ '+ft('map')+'</button><select class="filter-select" id="detailStatusSelect">'+['untreated','processing','estimating','quoted','ordered','completed','lost'].map(s=>'<option value="'+s+'" '+(s===st?'selected':'')+'>'+statusLabel(s)+'</option>').join('')+'</select><button class="small-btn done" onclick="updateStatus(\''+id+'\',document.getElementById(\'detailStatusSelect\').value);document.getElementById(\'requestDetailModal\').classList.remove(\'show\')">'+ft('save')+'</button><textarea id="detailReply">'+esc(r.adminReply||'')+'</textarea><button class="small-btn done" onclick="saveReplyFromDetail(\''+id+'\')">'+ft('reply')+'</button><button class="small-btn" style="color:#ef4444" onclick="deleteRequest(\''+id+'\')">'+ft('delete')+'</button>';$('requestActionTitle').textContent=ft('action');$('requestDetailModal').classList.add('show')};
  window.saveReplyFromDetail=async function(id){const val=$('detailReply')?.value||'';const res=await apiFetch(API+'/request/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminReply:val})});if(res.status===401)return authFailLogout();$('requestDetailModal')?.classList.remove('show');loadRequests()};
  const previousShow=window.showView;window.showView=function(v){ensureSettingsView();document.body.classList.remove('dashboard-mode','requests-mode','users-mode','staff-mode','settings-mode');document.body.classList.toggle('quote-view-active',v==='quotes');currentView=v;if(v==='dashboard'){currentTab='all';currentStatusTab='all';document.body.classList.add('dashboard-mode');previousShow&&previousShow('dashboard')}else if(v==='requests'){currentTab='all';if(!currentStatusTab)currentStatusTab='all';document.body.classList.add('requests-mode');previousShow&&previousShow('requests')}else if(v==='users'){document.body.classList.add('users-mode');previousShow&&previousShow('users')}else if(v==='staff'){document.body.classList.add('staff-mode');previousShow&&previousShow('staff')}else if(v==='quotes'){previousShow&&previousShow('quotes')}else if(v==='settings'){document.body.classList.add('settings-mode');$('dashboardView')?.classList.add('hidden');$('usersView')?.classList.add('hidden');$('staffView')?.classList.add('hidden')}activeNav(v);applyFinalLanguage();renderSideCounts();if(v==='dashboard'||v==='requests')renderRequests()};
  const prevApply=window.applyLanguage;window.applyLanguage=function(){try{dict.ja=Object.assign({},dict.ja,cleanDict.ja);dict.vi=Object.assign({},dict.vi,cleanDict.vi)}catch(e){} prevApply&&prevApply();rebuildSidebar();activeNav(currentView);applyFinalLanguage();renderSideCounts()};
  const prevRenderAll=window.renderAll;window.renderAll=function(){prevRenderAll&&prevRenderAll();applyFinalLanguage();renderSideCounts()};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{rebuildSidebar();ensureSettingsView();ensureRequestModal();showView(currentView||'dashboard');applyFinalLanguage();renderSideCounts()},120));
})();

/* ===== Split from admin.html ===== */

(function(){
  function fixQuoteActive(){
    const q=document.getElementById('finalNavQuotes');
    if(q && currentView!=='quotes') q.classList.remove('active');
    if(q && currentView==='quotes') q.classList.add('active');
  }
  const oldShowPolish=window.showView;
  window.showView=function(v){oldShowPolish&&oldShowPolish(v);setTimeout(fixQuoteActive,0)};
  const oldApplyPolish=window.applyLanguage;
  window.applyLanguage=function(){oldApplyPolish&&oldApplyPolish();setTimeout(fixQuoteActive,0)};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(fixQuoteActive,160));
})();

/* ===== Split from admin.html ===== */

(function(){
  function labelFix(k){return (dict[currentLang]&&dict[currentLang][k])||k}
  function setOnlyActive(v){
    document.querySelectorAll('.final-nav-btn').forEach(btn=>btn.classList.remove('active'));
    const map={dashboard:'finalNavDashboard',requests:'finalNavRequests',users:'finalNavUsers',staff:'finalNavStaff',quotes:'finalNavQuotes',settings:'finalNavSettings'};
    const el=document.getElementById(map[v]||'finalNavDashboard');
    if(el)el.classList.add('active');
  }
  function setRequestHead(){
    const head=document.querySelector('.request-panel .data-table thead');
    if(!head)return;
    if(currentView==='dashboard'){
      head.innerHTML='<tr><th>'+labelFix('requestId')+'</th><th>'+labelFix('content')+'</th><th>'+labelFix('customer')+'</th><th>'+labelFix('priority')+'</th><th>'+labelFix('elapsed')+'</th><th>'+labelFix('detail')+'</th></tr>';
    }else{
      head.innerHTML='<tr><th>'+labelFix('requestId')+'</th><th>'+labelFix('content')+'</th><th>'+labelFix('customer')+'</th><th>'+labelFix('priority')+'</th><th>'+labelFix('assignee')+'</th><th>'+labelFix('status')+'</th><th>'+labelFix('elapsed')+'</th><th>'+labelFix('detail')+'</th></tr>';
    }
  }
  function statusCountFix(s){return (requests||[]).filter(r=>normalizeStatus(r.status)===s).length}
  function filteredFix(){
    const kw=(document.getElementById('search')?.value||'').toLowerCase();
    const sf=document.getElementById('staffFilter')?.value||'all';
    const uf=document.getElementById('urgentFilter')?.value||'all';
    return (requests||[]).filter(r=>{
      if(currentStatusTab!=='all'&&normalizeStatus(r.status)!==currentStatusTab)return false;
      if(sf!=='all'&&String(r.assigneeId||r.assigneeName||'')!==sf)return false;
      if(uf==='high'&&!isUrgent(r))return false;
      if(uf==='normal'&&isUrgent(r))return false;
      return [requestTitle(r),customerName(r),phone(r),address(r),r.adminReply].join(' ').toLowerCase().includes(kw);
    });
  }
  window.renderRequests=function(){
    const body=document.getElementById('requestBody'); if(!body)return;
    updateTabs(); setRequestHead();
    const list=filteredFix();
    body.innerHTML=list.length?list.map(r=>{
      const id=r.id||r._id, st=normalizeStatus(r.status);
      if(currentView==='dashboard'){
        return '<tr class="req-row" onclick="openRequestDetail(\''+esc(id)+'\')"><td><div class="idline">'+esc(r.requestId||('REQ-'+String(id).slice(-6)))+'</div></td><td><span class="request-title">'+esc(requestTitle(r))+'</span><div class="muted request-sub">'+esc(address(r))+'</div></td><td><b>'+esc(customerName(r))+'</b><div class="muted">'+esc(phone(r))+'</div></td><td><span class="pill '+(isUrgent(r)?'red':'orange')+'">'+(isUrgent(r)?labelFix('urgent'):labelFix('normal'))+'</span></td><td><span class="time-red">'+elapsed(r.createdAt)+'</span></td><td><button class="small-btn done" onclick="event.stopPropagation();openRequestDetail(\''+esc(id)+'\')">'+labelFix('detail')+'</button></td></tr>';
      }
      return '<tr class="req-row" onclick="openRequestDetail(\''+esc(id)+'\')"><td><div class="idline">'+esc(r.requestId||('REQ-'+String(id).slice(-6)))+'</div></td><td><span class="request-title">'+esc(requestTitle(r))+'</span><div class="muted request-sub">'+esc(address(r))+'</div></td><td><b>'+esc(customerName(r))+'</b><div class="muted">'+esc(phone(r))+'</div></td><td><span class="pill '+(isUrgent(r)?'red':'orange')+'">'+(isUrgent(r)?labelFix('urgent'):labelFix('normal'))+'</span></td><td>'+esc(r.assigneeName||'-')+'</td><td><span class="pill '+statusClass(st)+'">'+statusLabel(st)+'</span></td><td><span class="time-red">'+elapsed(r.createdAt)+'</span></td><td><button class="small-btn done" onclick="event.stopPropagation();openRequestDetail(\''+esc(id)+'\')">'+labelFix('detail')+'</button></td></tr>';
    }).join(''):'<tr><td colspan="'+(currentView==='dashboard'?6:8)+'" class="muted" style="text-align:center;padding:30px">'+labelFix('noData')+'</td></tr>';
    if(document.getElementById('tab-all'))document.getElementById('tab-all').textContent=(requests||[]).length;
    ['untreated','processing','estimating','quoted','ordered','completed','lost'].forEach(s=>{const el=document.getElementById('tab-'+s);if(el)el.textContent=statusCountFix(s)});
  };
  const oldShowV3=window.showView;
  window.showView=function(v){oldShowV3&&oldShowV3(v);setTimeout(()=>{setOnlyActive(v);setRequestHead();if(v==='dashboard'||v==='requests')renderRequests();},0)};
  const oldApplyV3=window.applyLanguage;
  window.applyLanguage=function(){oldApplyV3&&oldApplyV3();setTimeout(()=>{setOnlyActive(currentView);setRequestHead();},0)};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{setOnlyActive(currentView||'dashboard');setRequestHead();renderRequests();},220));
})();

/* ===== Split from admin.html ===== */

(function(){
  const titleMap={dashboard:'dashboard',requests:'requestManage',users:'users',staff:'staffManage',quotes:'makeQuote',settings:'setting'};
  function label(k){return (dict[currentLang]&&dict[currentLang][k])||k}
  function ensureSettings(){
    if(document.getElementById('settingsView'))return;
    const content=document.querySelector('.content'); if(!content)return;
    const sec=document.createElement('section'); sec.id='settingsView'; sec.className='settings-view';
    sec.innerHTML='<div class="panel"><div class="panel-head"><div class="panel-title">'+label('setting')+'</div></div><div class="settings-grid"><div class="settings-item"><b>'+label('general')+'</b><p>Language, company profile, display rules.</p></div><div class="settings-item"><b>'+label('security')+'</b><p>Admin permissions and account security.</p></div><div class="settings-item"><b>'+label('backup')+'</b><p>Request and customer data backup.</p></div><div class="settings-item"><b>'+label('system')+'</b><p>API, app version, and maintenance notes.</p></div></div></div>';
    content.appendChild(sec);
  }
  function navActive(view){
    document.querySelectorAll('.final-nav-btn').forEach(btn=>btn.classList.remove('active'));
    const id={dashboard:'finalNavDashboard',requests:'finalNavRequests',users:'finalNavUsers',staff:'finalNavStaff',quotes:'finalNavQuotes',settings:'finalNavSettings'}[view]||'finalNavDashboard';
    document.getElementById(id)?.classList.add('active');
  }
  function showSection(view){
    ensureSettings();
    const dash=document.getElementById('dashboardView'), users=document.getElementById('usersView'), staff=document.getElementById('staffView'), settings=document.getElementById('settingsView'), quote=document.getElementById('quoteView');
    [dash,users,staff,settings,quote].forEach(el=>el&&el.classList.add('hidden'));
    document.body.classList.remove('dashboard-mode','requests-mode','users-mode','staff-mode','settings-mode','quote-view-active');
    if(view==='dashboard'||view==='requests'){dash&&dash.classList.remove('hidden');document.body.classList.add(view==='dashboard'?'dashboard-mode':'requests-mode');}
    if(view==='users'){users&&users.classList.remove('hidden');document.body.classList.add('users-mode');}
    if(view==='staff'){staff&&staff.classList.remove('hidden');document.body.classList.add('staff-mode');}
    if(view==='settings'){settings&&settings.classList.remove('hidden');document.body.classList.add('settings-mode');}
    if(view==='quotes'){quote&&quote.classList.remove('hidden');document.body.classList.add('quote-view-active');}
  }
  function syncHeader(view){
    currentView=view;
    const p=document.getElementById('pageTitle'); if(p)p.textContent=label(titleMap[view]||'dashboard');
    const s=document.getElementById('pageSub'); if(s)s.textContent=label('pageSub');
    navActive(view);
  }
  const previous=window.showView;
  window.showView=function(view){
    view=view||'dashboard';
    if(view==='quotes' && previous){ previous('quotes'); }
    showSection(view);
    syncHeader(view);
    if(view==='dashboard'){currentTab='all';currentStatusTab='all'; if(window.renderDashboard)renderDashboard(); if(window.renderRequests)renderRequests();}
    if(view==='requests'){currentTab='all'; if(!currentStatusTab)currentStatusTab='all'; if(window.renderRequests)renderRequests();}
    if(view==='users' && window.renderUsers)renderUsers();
    if(view==='staff' && window.renderStaff)renderStaff();
  };
  document.addEventListener('click',function(e){
    const btn=e.target.closest('.final-nav-btn'); if(!btn)return;
    const map={finalNavDashboard:'dashboard',finalNavRequests:'requests',finalNavUsers:'users',finalNavStaff:'staff',finalNavQuotes:'quotes',finalNavSettings:'settings'};
    const view=map[btn.id]; if(!view)return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    window.showView(view);
  },true);
  const oldApply=window.applyLanguage;
  window.applyLanguage=function(){oldApply&&oldApply();setTimeout(()=>{syncHeader(currentView||'dashboard');showSection(currentView||'dashboard');},0)};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>window.showView(currentView||'dashboard'),260));
})();

/* ===== Split from admin.html ===== */

(function(){
  function resetContentScroll(){const c=document.querySelector('.content'); if(c)c.scrollTop=0; window.scrollTo(0,0)}
  const oldShowFixed=window.showView;
  window.showView=function(v){oldShowFixed&&oldShowFixed(v);setTimeout(resetContentScroll,0)};
  document.addEventListener('click',function(e){if(e.target.closest('.final-nav-btn'))setTimeout(resetContentScroll,0)},true);
})();

/* ===== Split from admin.html ===== */

(function(){
  function fixIdLabel(){
    try{ if(window.dict){dict.ja.requestId='ID';dict.vi.requestId='ID';} }catch(e){}
    document.querySelectorAll('.request-panel .data-table thead th:first-child,.queue-table thead th:first-child').forEach(th=>{
      if(/requestid|依頼ID|yêu cầu/i.test((th.textContent||'').trim())) th.textContent='ID';
    });
  }
  const oldRenderId=window.renderRequests;
  window.renderRequests=function(){oldRenderId&&oldRenderId();fixIdLabel()};
  const oldApplyId=window.applyLanguage;
  window.applyLanguage=function(){oldApplyId&&oldApplyId();setTimeout(fixIdLabel,0)};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(fixIdLabel,300));
})();

/* ===== Split from admin.html ===== */

(function(){
  const statsWords={ja:{stats:'統計',statsSub:'依頼データをグラフで確認できます',total:'総依頼数',untreated:'未対応',completed:'完了',quoteRate:'見積→受注率',statusChart:'ステータス別依頼数',sourceChart:'依頼の内訳',weekChart:'直近7日の依頼数',noData:'データがありません'},vi:{stats:'Thông số',statsSub:'Xem dữ liệu yêu cầu bằng biểu đồ',total:'Tổng yêu cầu',untreated:'Chưa xử lý',completed:'Hoàn thành',quoteRate:'Tỉ lệ báo giá→đơn',statusChart:'Yêu cầu theo trạng thái',sourceChart:'Cơ cấu yêu cầu',weekChart:'Yêu cầu 7 ngày gần đây',noData:'Không có dữ liệu'}};
  const sw=k=>(statsWords[currentLang||'ja']&&statsWords[currentLang||'ja'][k])||statsWords.ja[k]||k;
  const statusKeys=['untreated','processing','estimating','quoted','ordered','completed','lost'];
  const statusColors={untreated:'#ef4444',processing:'#2563eb',estimating:'#f59e0b',quoted:'#7c3aed',ordered:'#16a34a',completed:'#22c55e',lost:'#64748b'};
  function countStatusV10(s){return (requests||[]).filter(r=>normalizeStatus(r.status)===s).length}
  function ensureStatsView(){
    if(document.getElementById('statsView'))return;
    const content=document.querySelector('.content'); if(!content)return;
    const sec=document.createElement('section'); sec.id='statsView'; sec.className='stats-view';
    sec.innerHTML='<div class="stats-grid"><div class="stats-card"><div class="stats-label" id="statsTotalLabel"></div><div class="stats-number" id="statsTotal">0</div></div><div class="stats-card"><div class="stats-label" id="statsUntreatedLabel"></div><div class="stats-number" id="statsUntreated">0</div></div><div class="stats-card"><div class="stats-label" id="statsCompletedLabel"></div><div class="stats-number" id="statsCompleted">0</div></div><div class="stats-card"><div class="stats-label" id="statsQuoteRateLabel"></div><div class="stats-number" id="statsQuoteRate">0%</div></div></div><div class="chart-grid"><div class="chart-panel"><div class="chart-head"><span id="statusChartTitle"></span></div><div class="chart-body" id="statusChartBody"></div></div><div class="chart-panel"><div class="chart-head"><span id="sourceChartTitle"></span></div><div class="chart-body"><div class="donut-wrap"><div class="donut" id="sourceDonut"></div><div class="legend-list" id="sourceLegend"></div></div></div></div><div class="chart-panel" style="grid-column:1/-1"><div class="chart-head"><span id="weekChartTitle"></span></div><div class="chart-body"><div class="trend-bars" id="weekBars"></div></div></div></div>';
    content.appendChild(sec);
  }
  function ensureStatsNav(){
    const req=document.getElementById('finalNavRequests'); if(!req||document.getElementById('finalNavStats'))return;
    const btn=document.createElement('button'); btn.className='final-nav-btn'; btn.id='finalNavStats'; btn.onclick=()=>showView('stats');
    btn.innerHTML='<span class="left"><span class="ico">▥</span><span>'+sw('stats')+'</span></span>';
    req.parentElement.insertBefore(btn,req);
  }
  function statusLabelV10(k){try{return statusLabel(k)}catch(e){return k}}
  function renderStats(){
    ensureStatsView();
    const total=(requests||[]).length, untreated=countStatusV10('untreated'), completed=countStatusV10('completed'), quoted=countStatusV10('quoted')+countStatusV10('estimating'), ordered=countStatusV10('ordered');
    const qRate=quoted?Math.round(ordered/quoted*100):0;
    const labels={statsTotalLabel:'total',statsUntreatedLabel:'untreated',statsCompletedLabel:'completed',statsQuoteRateLabel:'quoteRate',statusChartTitle:'statusChart',sourceChartTitle:'sourceChart',weekChartTitle:'weekChart'};
    Object.entries(labels).forEach(([id,k])=>{const el=document.getElementById(id);if(el)el.textContent=sw(k)});
    if(document.getElementById('statsTotal'))document.getElementById('statsTotal').textContent=total;
    if(document.getElementById('statsUntreated'))document.getElementById('statsUntreated').textContent=untreated;
    if(document.getElementById('statsCompleted'))document.getElementById('statsCompleted').textContent=completed;
    if(document.getElementById('statsQuoteRate'))document.getElementById('statsQuoteRate').textContent=qRate+'%';
    const max=Math.max(1,...statusKeys.map(countStatusV10));
    const body=document.getElementById('statusChartBody');
    if(body)body.innerHTML=statusKeys.map(k=>{const n=countStatusV10(k);return '<div class="bar-row"><div class="bar-name">'+statusLabelV10(k)+'</div><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(n/max*100)+'%;background:'+statusColors[k]+'"></div></div><div class="bar-value">'+n+'</div></div>'}).join('');
    const account=(requests||[]).filter(r=>r.userId||r.accountId||r.source==='account').length, guest=Math.max(0,total-account), aDeg=total?Math.round(account/total*360):0;
    const donut=document.getElementById('sourceDonut'); if(donut)donut.style.background='conic-gradient(#2563eb 0deg '+aDeg+'deg,#f59e0b '+aDeg+'deg 360deg)';
    const legend=document.getElementById('sourceLegend'); if(legend)legend.innerHTML='<div class="legend-item"><span class="legend-dot" style="background:#2563eb"></span>'+(currentLang==='ja'?'登録顧客':'Có tài khoản')+': '+account+'</div><div class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>'+(currentLang==='ja'?'クイック依頼':'Gửi nhanh')+': '+guest+'</div>';
    const now=new Date(); const days=[]; for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d)}
    const counts=days.map(d=>(requests||[]).filter(r=>{const x=new Date(r.createdAt||0);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()&&x.getDate()===d.getDate()}).length);
    const m=Math.max(1,...counts); const week=document.getElementById('weekBars'); if(week)week.innerHTML=days.map((d,i)=>'<div class="trend-bar"><div class="trend-col" style="height:'+Math.max(4,Math.round(counts[i]/m*190))+'px"></div><div class="trend-day">'+(d.getMonth()+1)+'/'+d.getDate()+'</div></div>').join('');
  }
  const oldShowStats=window.showView;
  window.showView=function(v){
    ensureStatsView();ensureStatsNav();
    if(v==='stats'){
      currentView='stats';
      document.body.classList.remove('dashboard-mode','requests-mode','users-mode','staff-mode','settings-mode','quote-view-active');
      document.body.classList.add('stats-mode');
      ['dashboardView','usersView','staffView','settingsView','quoteView'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
      document.getElementById('statsView')?.classList.remove('hidden');
      document.querySelectorAll('.final-nav-btn').forEach(b=>b.classList.remove('active'));
      document.getElementById('finalNavStats')?.classList.add('active');
      if(document.getElementById('pageTitle'))document.getElementById('pageTitle').textContent=sw('stats');
      if(document.getElementById('pageSub'))document.getElementById('pageSub').textContent=sw('statsSub');
      renderStats();
      return;
    }
    document.body.classList.remove('stats-mode');
    oldShowStats&&oldShowStats(v);
    setTimeout(()=>{ensureStatsNav(); if(v==='requests'){document.querySelector('.request-panel')?.scrollIntoView({block:'nearest'});} },0);
  };
  const oldRenderAllStats=window.renderAll;
  window.renderAll=function(){oldRenderAllStats&&oldRenderAllStats();ensureStatsNav();if(currentView==='stats')renderStats()};
  const oldApplyStats=window.applyLanguage;
  window.applyLanguage=function(){oldApplyStats&&oldApplyStats();ensureStatsNav();if(document.getElementById('finalNavStats'))document.querySelector('#finalNavStats span span:last-child').textContent=sw('stats');if(currentView==='stats')showView('stats')};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ensureStatsView();ensureStatsNav();if(currentView==='stats')renderStats()},380));
})();

/* ===== Split from admin.html ===== */

(function(){
  const words={ja:{stats:'統計',sub:'日別・月別・年別の推移をグラフで確認できます。平均値や割合はダッシュボードに表示します。',daily:'日別依頼数',monthly:'月別依頼数',yearly:'年別依頼数',status:'ステータス別依頼数'},vi:{stats:'Thông số',sub:'Các chỉ số theo ngày, tháng, năm được hiển thị bằng biểu đồ. Giá trị trung bình và phần trăm nằm ở Dashboard.',daily:'Yêu cầu theo ngày',monthly:'Yêu cầu theo tháng',yearly:'Yêu cầu theo năm',status:'Yêu cầu theo trạng thái'}};
  const w=k=>(words[currentLang||'ja']&&words[currentLang||'ja'][k])||words.ja[k]||k;
  function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
  function reqDate(r){const d=new Date(r.createdAt||r.date||0);return isNaN(d)?null:d}
  function barHtml(items,cls,colorCls=''){
    const max=Math.max(1,...items.map(x=>x.value));
    return '<div class="period-bars '+cls+'">'+items.map(x=>'<div class="period-item"><div class="period-value">'+x.value+'</div><div class="period-col '+colorCls+'" style="height:'+Math.max(4,Math.round(x.value/max*190))+'px"></div><div class="period-label">'+x.label+'</div></div>').join('')+'</div>';
  }
  function statusBars(){
    const keys=['untreated','processing','estimating','quoted','ordered','completed','lost'];
    const colors={untreated:'#ef4444',processing:'#2563eb',estimating:'#f59e0b',quoted:'#7c3aed',ordered:'#16a34a',completed:'#22c55e',lost:'#64748b'};
    const counts=keys.map(k=>({key:k,label:statusLabel(k),value:(requests||[]).filter(r=>normalizeStatus(r.status)===k).length}));
    const max=Math.max(1,...counts.map(x=>x.value));
    return counts.map(x=>'<div class="bar-row"><div class="bar-name">'+x.label+'</div><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(x.value/max*100)+'%;background:'+colors[x.key]+'"></div></div><div class="bar-value">'+x.value+'</div></div>').join('');
  }
  window.renderPeriodStats=function(){
    let view=document.getElementById('statsView'); if(!view)return;
    const now=new Date();
    const days=[]; for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d)}
    const dayItems=days.map(d=>({label:(d.getMonth()+1)+'/'+d.getDate(),value:(requests||[]).filter(r=>{const x=reqDate(r);return x&&sameDay(x,d)}).length}));
    const monthItems=Array.from({length:12},(_,i)=>({label:(i+1)+'月',value:(requests||[]).filter(r=>{const x=reqDate(r);return x&&x.getFullYear()===now.getFullYear()&&x.getMonth()===i}).length}));
    const startYear=now.getFullYear()-4;
    const yearItems=Array.from({length:5},(_,i)=>{const y=startYear+i;return{label:String(y),value:(requests||[]).filter(r=>{const x=reqDate(r);return x&&x.getFullYear()===y}).length}});
    view.innerHTML='<div class="stats-note">'+w('sub')+'</div><div class="period-chart-grid"><div class="chart-panel wide"><div class="chart-head">'+w('daily')+'</div><div class="chart-body">'+barHtml(dayItems,'day')+'</div></div><div class="chart-panel"><div class="chart-head">'+w('monthly')+'</div><div class="chart-body">'+barHtml(monthItems,'month','orange')+'</div></div><div class="chart-panel"><div class="chart-head">'+w('yearly')+'</div><div class="chart-body">'+barHtml(yearItems,'year','green')+'</div></div><div class="chart-panel wide"><div class="chart-head">'+w('status')+'</div><div class="chart-body">'+statusBars()+'</div></div></div>';
  };
  const oldShowPeriod=window.showView;
  window.showView=function(v){oldShowPeriod&&oldShowPeriod(v);if(v==='stats')setTimeout(()=>{if(document.getElementById('pageTitle'))document.getElementById('pageTitle').textContent=w('stats');if(document.getElementById('pageSub'))document.getElementById('pageSub').textContent=w('sub');renderPeriodStats()},0)};
  const oldRenderAllPeriod=window.renderAll;
  window.renderAll=function(){oldRenderAllPeriod&&oldRenderAllPeriod();if(currentView==='stats')renderPeriodStats()};
  const oldApplyPeriod=window.applyLanguage;
  window.applyLanguage=function(){oldApplyPeriod&&oldApplyPeriod();if(currentView==='stats')setTimeout(()=>{if(document.getElementById('pageTitle'))document.getElementById('pageTitle').textContent=w('stats');if(document.getElementById('pageSub'))document.getElementById('pageSub').textContent=w('sub');renderPeriodStats()},0)};
})();

/* ===== Split from admin.html ===== */

(function(){
  const clean={
    ja:{dashboard:'ダッシュボード',stats:'統計',requestManage:'管理要求',users:'顧客管理',staffManage:'スタッフプロフィール',makeQuote:'見積作成',setting:'設定',pageSub:'依頼と対応状況を管理できます',statsSub:'日別・月別・年別の推移をグラフで確認できます。平均値や割合はダッシュボードに表示します。',quoteSub:'依頼IDを入力すると、顧客情報と依頼内容を自動入力できます。',logout:'ログアウト',adminRole:'管理者',untreated:'未対応',processing:'対応中',estimating:'見積中',quoted:'見積済み',ordered:'受注',completed:'完了',lost:'失注',all:'すべて',guest:'クイック依頼',account:'登録顧客',urgentNeed:'未対応',urgentSub:'未対応',todaySales:'本日の売上',todayOrders:'今週の受注',quoteRate:'見積→受注率',avgTime:'平均対応時間',claimRate:'クレーム率',top5:'TOP 5 すぐ対応すべき依頼',currentRequests:'現在の依頼',priority:'緊急度',content:'内容',elapsed:'待機時間',assignee:'担当者',action:'操作',customer:'顧客',status:'ステータス',reply:'返信',save:'保存',delete:'削除',detail:'詳細',call:'電話',map:'地図',noData:'データがありません',allStaff:'全担当者',urgency:'緊急度',urgent:'緊急',high:'高',normal:'通常',low:'低',image:'画像',video:'動画',aiRecommend:'AI推奨',aiUrgent:'高（要確認）',aiNormal:'中（確認要）',lock:'停止',unlock:'解除',edit:'編集',approve:'承認',pendingApproval:'承認待ち',active:'有効',blocked:'停止中',customerInfo:'基本情報',requestHistory:'依頼履歴',contactInfo:'連絡先',name:'氏名',phone:'電話番号',email:'メール',area:'地域',project:'工事件名',company:'会社 / 個人',registeredAt:'登録日',lastLogin:'最終ログイン',requestCount:'依頼数',historyEmpty:'履歴がありません',close:'閉じる',quoteTitle:'見積作成',quoteFind:'依頼検索',requestId:'ID',loadInfo:'情報を取得',quoteContent:'見積内容',quoteAmount:'見積金額',note:'備考',createQuote:'見積を作成'},
    vi:{dashboard:'Trang chủ',stats:'Thông số',requestManage:'Quản lý yêu cầu',users:'Khách hàng',staffManage:'Hồ sơ nhân viên',makeQuote:'Tạo báo giá',setting:'Cài đặt',pageSub:'Quản lý yêu cầu và tiến độ xử lý',statsSub:'Các chỉ số theo ngày, tháng, năm được hiển thị bằng biểu đồ. Giá trị trung bình và phần trăm nằm ở Dashboard.',quoteSub:'Nhập ID yêu cầu để tự động điền thông tin khách hàng và nội dung yêu cầu.',logout:'Đăng xuất',adminRole:'Admin',untreated:'Chưa xử lý',processing:'Đang xử lý',estimating:'Đang báo giá',quoted:'Đã báo giá',ordered:'Đã nhận đơn',completed:'Hoàn thành',lost:'Không hoàn thành',all:'Tất cả',guest:'Khách nhanh',account:'Tài khoản',urgentNeed:'Chưa xử lý',urgentSub:'Chưa xử lý',todaySales:'Doanh thu hôm nay',todayOrders:'Đơn tuần này',quoteRate:'Tỉ lệ báo giá→đơn',avgTime:'TG xử lý TB',claimRate:'Tỉ lệ claim',top5:'TOP 5 yêu cầu cần xử lý',currentRequests:'Các yêu cầu hiện có',priority:'Độ khẩn',content:'Nội dung',elapsed:'Thời gian chờ',assignee:'Phụ trách',action:'Thao tác',customer:'Khách hàng',status:'Trạng thái',reply:'Phản hồi',save:'Lưu',delete:'Xóa',detail:'Chi tiết',call:'Gọi',map:'Bản đồ',noData:'Không có dữ liệu',allStaff:'Tất cả phụ trách',urgency:'Độ khẩn',urgent:'Khẩn cấp',high:'Cao',normal:'Trung bình',low:'Thấp',image:'Ảnh',video:'Video',aiRecommend:'AI đề xuất',aiUrgent:'Cao (cần kiểm tra)',aiNormal:'Trung bình (cần kiểm tra)',lock:'Khóa',unlock:'Mở khóa',edit:'Sửa',approve:'Duyệt',pendingApproval:'Chờ duyệt',active:'Đang hoạt động',blocked:'Đã khóa',customerInfo:'Thông tin cơ bản',requestHistory:'Lịch sử yêu cầu',contactInfo:'Liên hệ',name:'Họ tên',phone:'Số điện thoại',email:'Email',area:'Khu vực',project:'Tên công trình',company:'Công ty / cá nhân',registeredAt:'Ngày đăng ký',lastLogin:'Lần đăng nhập cuối',requestCount:'Số yêu cầu',historyEmpty:'Không có lịch sử',close:'Đóng',quoteTitle:'Tạo báo giá',quoteFind:'Tìm yêu cầu',requestId:'ID',loadInfo:'Tải thông tin',quoteContent:'Nội dung báo giá',quoteAmount:'Số tiền báo giá',note:'Ghi chú',createQuote:'Tạo báo giá'}
  };
  function langNow(){try{return currentLang==='vi'?'vi':'ja'}catch(e){return 'ja'}}
  function cleanHeader(){try{dict.ja=Object.assign({},dict.ja,clean.ja);dict.vi=Object.assign({},dict.vi,clean.vi);if(typeof applyFinalLanguage==='function')applyFinalLanguage()}catch(e){}}
  function A(k){const l=langNow();return(clean[l]&&clean[l][k])||(dict[l]&&dict[l][k])||(clean.ja&&clean.ja[k])||k}
  window.renderPeriodStats=function(){const view=document.getElementById('statsView');if(!view)return;const statuses=['untreated','processing','estimating','quoted','ordered','completed','lost'];const max=Math.max(1,...statuses.map(s=>(requests||[]).filter(r=>normalizeStatus(r.status)===s).length));view.innerHTML='<div class="stats-note">'+A('statsSub')+'</div><div class="period-chart-grid"><div class="chart-panel wide"><div class="chart-head">'+(langNow()==='ja'?'ステータス別依頼数':'Yêu cầu theo trạng thái')+'</div><div class="chart-body">'+statuses.map(s=>{const n=(requests||[]).filter(r=>normalizeStatus(r.status)===s).length;return '<div class="bar-row"><div class="bar-name">'+A(s)+'</div><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(n/max*100)+'%"></div></div><div class="bar-value">'+n+'</div></div>'}).join('')+'</div></div></div>'};
  const prevApply=window.applyLanguage;window.applyLanguage=function(){if(prevApply)prevApply();setTimeout(()=>{cleanHeader();if(currentView==='staff')renderStaff();if(currentView==='stats')renderPeriodStats()},0)};
  const prevChange=window.changeLanguage;window.changeLanguage=function(){const language=document.getElementById('language');if(language){currentLang=language.value;localStorage.setItem('language',currentLang)}if(prevChange)prevChange();setTimeout(()=>{cleanHeader();if(currentView==='staff')renderStaff();if(currentView==='stats')renderPeriodStats();if(window.renderRequests)renderRequests();if(window.renderDashboard)renderDashboard()},0)};
  const prevShow=window.showView;window.showView=function(v){if(prevShow)prevShow(v);setTimeout(()=>{cleanHeader();if(v==='staff')renderStaff();if(v==='stats')renderPeriodStats()},0)};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{cleanHeader();if(currentView==='staff')renderStaff();if(currentView==='stats')renderPeriodStats()},700));setTimeout(cleanHeader,0);
})();

/* ===== Split from admin.html ===== */

(function(){
  function langNow(){try{return currentLang==='vi'?'vi':'ja'}catch(e){return 'ja'}}
  const words={ja:{assignee:'担当者',save:'担当者を保存',auto:'AI推奨 / 未割当',saved:'担当者を更新しました'},vi:{assignee:'Người phụ trách',save:'Lưu phụ trách',auto:'AI đề xuất / chưa phân công',saved:'Đã cập nhật người phụ trách'}};
  const w=k=>(words[langNow()]&&words[langNow()][k])||words.ja[k]||k;
  function rid(r){return r?.id||r?._id||''}
  function sid(s){return s?._id||s?.id||''}
  function currentRequest(id){return (requests||[]).find(r=>String(rid(r))===String(id))}
  function staffOptions(selectedId,selectedName){
    const selected=String(selectedId||'');
    return '<option value="">'+w('auto')+'</option>'+(currentStaff||[]).map(s=>{
      const id=String(sid(s));
      const sel=(selected&&id===selected)||(!selected&&selectedName&&s.name===selectedName)?' selected':'';
      return '<option value="'+esc(id)+'" data-name="'+esc(s.name||'')+'"'+sel+'>'+esc(s.name||'-')+(s.department||s.areas?' / '+esc(s.department||s.areas):'')+'</option>';
    }).join('');
  }
  window.injectManualAssignee=function(id){
    const box=document.getElementById('requestActionBox');if(!box||document.getElementById('manualAssigneeBox'))return;
    const r=currentRequest(id)||{};
    const wrap=document.createElement('div');wrap.id='manualAssigneeBox';wrap.className='manual-assignee-box';
    wrap.innerHTML='<div><label>'+w('assignee')+'</label><select id="manualAssigneeSelect">'+staffOptions(r.assigneeId,r.assigneeName)+'</select></div><button class="small-btn done" onclick="saveManualAssignee(\''+esc(id)+'\')">'+w('save')+'</button>';
    box.prepend(wrap);
  };
  window.saveManualAssignee=async function(id){
    const sel=document.getElementById('manualAssigneeSelect');if(!sel)return;
    const opt=sel.options[sel.selectedIndex];
    const assigneeId=sel.value;
    const assigneeName=assigneeId?(opt?.dataset?.name||opt?.textContent?.split(' / ')[0]||''):'';
    const res=await apiFetch(API+'/request/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({assigneeId,assigneeName})});
    if(res.status===401)return authFailLogout();
    const r=currentRequest(id);if(r){r.assigneeId=assigneeId;r.assigneeName=assigneeName;}
    if(window.showToast)showToast(w('saved'));
    if(window.renderRequests)renderRequests();
    if(window.renderDashboard)renderDashboard();
    injectManualAssignee(id);
  };
  const oldOpenReqV17=window.openRequestDetail;
  window.openRequestDetail=function(id){if(oldOpenReqV17)oldOpenReqV17(id);setTimeout(()=>injectManualAssignee(id),0)};
  const oldApplyV17=window.applyLanguage;
  window.applyLanguage=function(){if(oldApplyV17)oldApplyV17();const modal=document.getElementById('requestDetailModal');if(modal?.classList.contains('show')){const title=document.getElementById('requestDetailTitle')?.textContent||'';const match=title.match(/REQ-[\w-]+|YD-[\w-]+|[a-f0-9]{12,}/i);const r=(requests||[]).find(x=>title.includes(x.requestId||String(rid(x)).slice(-6)));if(r)setTimeout(()=>injectManualAssignee(rid(r)),0)}};
})();

/* ===== Split from admin.html ===== */

(function(){
  const words={
    ja:{stats:'統計',sub:'日別・月別・年別の推移をグラフで確認できます。平均値や割合はダッシュボードに表示します。',total:'総依頼数',avgTime:'平均対応時間',firstTime:'初動対応時間',quoteRate:'見積→受注率',claimRate:'クレーム率',daily:'日別依頼数',monthly:'月別依頼数',yearly:'年別依頼数',status:'ステータス別依頼数',thisWeek:'直近7日',thisYear:'今年',fiveYears:'直近5年',trend:'推移',untreated:'未対応',processing:'対応中',estimating:'見積中',quoted:'見積済み',ordered:'受注',completed:'完了',lost:'失注',noData:'データがありません'},
    vi:{stats:'Thống kê',sub:'Biểu đồ theo ngày, tháng, năm. Các giá trị trung bình và phần trăm vẫn hiển thị trên Dashboard.',total:'Tổng yêu cầu',avgTime:'Thời gian xử lý TB',firstTime:'Thời gian phản hồi đầu',quoteRate:'Tỉ lệ báo giá→đơn',claimRate:'Tỉ lệ claim',daily:'Yêu cầu theo ngày',monthly:'Yêu cầu theo tháng',yearly:'Yêu cầu theo năm',status:'Yêu cầu theo trạng thái',thisWeek:'7 ngày gần đây',thisYear:'Năm hiện tại',fiveYears:'5 năm gần đây',trend:'Xu hướng',untreated:'Chưa xử lý',processing:'Đang xử lý',estimating:'Đang báo giá',quoted:'Đã báo giá',ordered:'Đã nhận đơn',completed:'Hoàn thành',lost:'Không hoàn thành',noData:'Không có dữ liệu'}
  };
  function lang(){try{return currentLang==='vi'?'vi':'ja'}catch(e){return String(localStorage.getItem('language')||'ja').startsWith('vi')?'vi':'ja'}}
  function W(k){return (words[lang()]&&words[lang()][k])||words.ja[k]||k}
  function reqs(){try{return Array.isArray(requests)?requests:[]}catch(e){return []}}
  function norm(s){try{return normalizeStatus(s)}catch(e){s=String(s||'untreated').toLowerCase();if(['done','complete','completed'].includes(s))return'completed';if(['lost','cancel','canceled','cancelled','failed'].includes(s))return'lost';if(['estimating','estimate_pending','quoting'].includes(s))return'estimating';if(['quote','quoted','estimate'].includes(s))return'quoted';if(['order','ordered','accepted'].includes(s))return'ordered';if(['processing','contacted','site','visited'].includes(s))return'processing';return'untreated'}}
  function dval(r){const d=new Date(r.createdAt||r.date||r.updatedAt||0);return isNaN(d)?null:d}
  function sameDay(a,b){return a&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
  function countStatus(k){return reqs().filter(r=>norm(r.status)===k).length}
  function countDay(d){return reqs().filter(r=>sameDay(dval(r),d)).length}
  function countMonth(y,m){return reqs().filter(r=>{const d=dval(r);return d&&d.getFullYear()===y&&d.getMonth()===m}).length}
  function countYear(y){return reqs().filter(r=>{const d=dval(r);return d&&d.getFullYear()===y}).length}
  function colChart(items,cls,color){const max=Math.max(1,...items.map(x=>x.value));return '<div class="stats-column-chart '+cls+'">'+items.map(x=>'<div class="stats-column-item"><div class="stats-column-value">'+x.value+'</div><div class="stats-column-bar '+(color||'')+'" style="height:'+Math.max(5,Math.round(x.value/max*190))+'px"></div><div class="stats-column-label">'+x.label+'</div></div>').join('')+'</div>'}
  function statusBars(){const keys=['untreated','processing','estimating','quoted','ordered','completed','lost'];const colors={untreated:'#ef4444',processing:'#2563eb',estimating:'#f59e0b',quoted:'#7c3aed',ordered:'#16a34a',completed:'#22c55e',lost:'#64748b'};const values=keys.map(k=>({key:k,label:W(k),value:countStatus(k)}));const max=Math.max(1,...values.map(x=>x.value));return values.map(x=>'<div class="stats-bar-row"><div class="stats-bar-name">'+x.label+'</div><div class="stats-bar-track"><div class="stats-bar-fill" style="width:'+Math.round(x.value/max*100)+'%;background:'+colors[x.key]+'"></div></div><div class="stats-bar-value">'+x.value+'</div></div>').join('')}
  function ensureStatsViewFinal(){let view=document.getElementById('statsView');const content=document.querySelector('.content');if(!content)return null;if(!view){view=document.createElement('section');view.id='statsView';content.appendChild(view)}view.className='yamaden-stats-view'+(document.body.classList.contains('stats-mode')?'':' hidden');return view}
  function ensureStatsNavFinal(){const dash=document.getElementById('finalNavDashboard');if(!dash)return;let btn=document.getElementById('finalNavStats');if(!btn){btn=document.createElement('button');btn.id='finalNavStats';btn.className='final-nav-btn stats';btn.onclick=()=>showView('stats');btn.innerHTML='<span class="left"><span class="ico">▥</span><span class="stats-nav-label"></span></span>';dash.insertAdjacentElement('afterend',btn)}const label=btn.querySelector('.stats-nav-label');if(label)label.textContent=W('stats')}
  window.renderFinalStatsCharts=function(){const view=ensureStatsViewFinal();if(!view)return;const now=new Date();const days=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d)}const dayItems=days.map(d=>({label:(d.getMonth()+1)+'/'+d.getDate(),value:countDay(d)}));const monthItems=Array.from({length:12},(_,i)=>({label:lang()==='ja'?(i+1)+'月':String(i+1),value:countMonth(now.getFullYear(),i)}));const start=now.getFullYear()-4;const yearItems=Array.from({length:5},(_,i)=>{const y=start+i;return{label:String(y),value:countYear(y)}});const quoted=countStatus('quoted')+countStatus('estimating'),ordered=countStatus('ordered');const qRate=quoted?Math.round(ordered/quoted*100):0;view.innerHTML='<div class="stats-summary-grid"><div class="stats-summary-card"><div class="stats-summary-label">'+W('total')+'</div><div class="stats-summary-value">'+reqs().length+'</div><div class="stats-summary-sub">'+W('trend')+'</div></div><div class="stats-summary-card"><div class="stats-summary-label">'+W('avgTime')+'</div><div class="stats-summary-value">'+(reqs().length?'2.4h':'-')+'</div><div class="stats-summary-sub">Dashboard KPI</div></div><div class="stats-summary-card"><div class="stats-summary-label">'+W('firstTime')+'</div><div class="stats-summary-value">'+(reqs().length?'18m':'-')+'</div><div class="stats-summary-sub">Dashboard KPI</div></div><div class="stats-summary-card"><div class="stats-summary-label">'+W('quoteRate')+'</div><div class="stats-summary-value">'+qRate+'%</div><div class="stats-summary-sub">Dashboard KPI</div></div><div class="stats-summary-card"><div class="stats-summary-label">'+W('claimRate')+'</div><div class="stats-summary-value">2.1%</div><div class="stats-summary-sub">Dashboard KPI</div></div></div><div class="stats-chart-grid"><div class="stats-chart-card wide"><div class="stats-chart-head"><span>'+W('daily')+'</span><span class="stats-chart-note">'+W('thisWeek')+'</span></div><div class="stats-chart-body">'+colChart(dayItems,'day','')+'</div></div><div class="stats-chart-card"><div class="stats-chart-head"><span>'+W('monthly')+'</span><span class="stats-chart-note">'+W('thisYear')+'</span></div><div class="stats-chart-body">'+colChart(monthItems,'month','orange')+'</div></div><div class="stats-chart-card"><div class="stats-chart-head"><span>'+W('yearly')+'</span><span class="stats-chart-note">'+W('fiveYears')+'</span></div><div class="stats-chart-body">'+colChart(yearItems,'year','green')+'</div></div><div class="stats-chart-card wide"><div class="stats-chart-head"><span>'+W('status')+'</span></div><div class="stats-chart-body">'+statusBars()+'</div></div></div>'};
  const prevShow=window.showView;window.showView=function(v){ensureStatsViewFinal();ensureStatsNavFinal();if(v==='stats'){try{currentView='stats'}catch(e){}document.body.classList.remove('dashboard-mode','requests-mode','users-mode','staff-mode','settings-mode','quote-view-active');document.body.classList.add('stats-mode');['dashboardView','usersView','staffView','settingsView','quoteView'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));document.getElementById('statsView')?.classList.remove('hidden');document.querySelectorAll('.final-nav-btn').forEach(b=>b.classList.remove('active'));document.getElementById('finalNavStats')?.classList.add('active');const title=document.getElementById('pageTitle');if(title)title.textContent=W('stats');const sub=document.getElementById('pageSub');if(sub)sub.textContent=W('sub');renderFinalStatsCharts();return}document.body.classList.remove('stats-mode');if(prevShow)prevShow(v);setTimeout(ensureStatsNavFinal,0)};
  const prevApply=window.applyLanguage;window.applyLanguage=function(){if(prevApply)prevApply();setTimeout(()=>{ensureStatsNavFinal();if((typeof currentView!=='undefined'?currentView:'')==='stats')showView('stats')},0)};
  const prevRenderAll=window.renderAll;window.renderAll=function(){if(prevRenderAll)prevRenderAll();ensureStatsNavFinal();if((typeof currentView!=='undefined'?currentView:'')==='stats')renderFinalStatsCharts()};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ensureStatsViewFinal();ensureStatsNavFinal();if((typeof currentView!=='undefined'?currentView:'')==='stats')renderFinalStatsCharts()},900));
})();

/* ===== Split from admin.html ===== */

(function(){
  const labels={ja:{logout:'ログアウト',role:'管理者',search:'検索...',dashboard:'ダッシュボード',settings:'設定'},vi:{logout:'Đăng xuất',role:'Quản trị',search:'Tìm kiếm...',dashboard:'Trang chủ',settings:'Cài đặt'}};
  const L=()=>((window.currentLang||localStorage.getItem('language')||'ja')==='vi'?'vi':'ja'), A=k=>(labels[L()]&&labels[L()][k])||labels.ja[k]||k;
  window.__yamadenAdminStableText=function(){const language=document.getElementById('language');if(language){language.innerHTML='<option value="ja">日本語</option><option value="vi">Tiếng Việt</option>';language.value=L()}const logout=document.getElementById('logoutBtn');if(logout)logout.textContent=A('logout');const role=document.getElementById('adminRole');if(role)role.textContent=A('role');const s=document.getElementById('userSearch');if(s)s.placeholder=A('search');document.querySelectorAll('[data-i="dashboard"]').forEach(e=>e.textContent=A('dashboard'));document.querySelectorAll('[data-i="setting"]').forEach(e=>e.textContent=A('settings'));const subs=L()==='ja'?['言語、会社情報、表示ルール。','管理者権限とアカウント保護。','依頼・顧客データのバックアップ。','API、アプリ版数、保守メモ。']:['Ngôn ngữ, hồ sơ công ty, quy tắc hiển thị.','Quyền admin và bảo mật tài khoản.','Sao lưu dữ liệu yêu cầu và khách hàng.','API, phiên bản app và ghi chú bảo trì.'];document.querySelectorAll('.settings-item p,.settings-grid p').forEach((p,i)=>p.textContent=subs[i%4])};
  const oldShow=window.showView;window.showView=function(v){const r=oldShow&&oldShow(v);setTimeout(window.__yamadenAdminStableText,0);return r};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(window.__yamadenAdminStableText,1100));setInterval(window.__yamadenAdminStableText,2500);
})();

/* ===== Split from admin.html ===== */

(function(){
  async function fetchFreshUsers(){
    var separator=API.indexOf('?')>=0?'&':'?';
    var res=await apiFetch(API+'/admin/users'+separator+'_ts='+Date.now(),{cache:'no-store'});
    if(res.status===401)return authFailLogout();
    if(!res.ok)throw new Error('users load failed');
    var data=await res.json();
    return Array.isArray(data)?data:(data.users||[]);
  }
  window.loadUsers=async function(){
    try{
      var list=await fetchFreshUsers();
      currentUsers=list;
      window.currentUsers=list;
    }catch(e){
      currentUsers=[];
      window.currentUsers=[];
    }
    if(typeof renderUsers==='function')renderUsers();
    var side=document.getElementById('sideUsers');
    if(side)side.textContent=currentUsers.length;
    var final=document.getElementById('finalUserCount');
    if(final)final.textContent=currentUsers.length;
  };
  document.addEventListener('visibilitychange',function(){
    try{if(!document.hidden&&currentView==='users')loadUsers()}catch(e){}
  });
  setInterval(function(){
    try{if(currentView==='users')loadUsers()}catch(e){}
  },15000);
})();

/* ===== Split from admin.html ===== */

(function(){
  function L(){try{return currentLang==='vi'?'vi':'ja'}catch(e){return String(localStorage.getItem('language')||'ja').startsWith('vi')?'vi':'ja'}}
  function W(key){
    var words={
      ja:{approve:'承認',block:'停止',unblock:'解除',delete:'削除',permanentDelete:'完全削除',reactivate:'再有効化',pending:'承認待ち',active:'有効',blocked:'停止中',deleted:'削除済み',requestCount:'依頼数',noData:'データがありません',deletedNote:'この顧客は削除リストに保存されています',confirmPermanent:'この顧客を完全に削除しますか？この操作は元に戻せません。'},
      vi:{approve:'Duyệt',block:'Khóa',unblock:'Mở khóa',delete:'Xóa',permanentDelete:'Xóa vĩnh viễn',reactivate:'Tái kích hoạt',pending:'Chờ duyệt',active:'Đang hoạt động',blocked:'Đã khóa',deleted:'Đã xóa',requestCount:'Số yêu cầu',noData:'Không có dữ liệu',deletedNote:'Khách này đang được lưu trong danh sách đã xóa',confirmPermanent:'Xóa vĩnh viễn khách này? Thao tác này không thể khôi phục.'}
    };
    return (words[L()]&&words[L()][key])||words.ja[key]||key;
  }
  function safe(value){return String(value==null?'':value).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function list(){try{return Array.isArray(currentUsers)?currentUsers:[]}catch(e){return []}}
  function uid(user){return String((user&&(user._id||user.id||user.userId))||'')}
  function statusText(status){return W(status||'pending')||status||'-'}
  function modalText(key){
    var words={
      ja:{
        permanentTitle:'完全削除の確認',
        permanentText:'この顧客を完全に削除しますか？この操作は元に戻せません。',
        permanentBusy:'削除しています...',
        permanentFail:'サーバー側がまだ完全削除に対応していません。server.jsを更新してからもう一度お試しください。',
        close:'閉じる'
      },
      vi:{
        permanentTitle:'Xác nhận xóa vĩnh viễn',
        permanentText:'Xóa vĩnh viễn khách này? Thao tác này không thể khôi phục.',
        permanentBusy:'Đang xóa...',
        permanentFail:'Server chưa cập nhật chức năng xóa vĩnh viễn. Hãy up lại server.js rồi thử lại.',
        close:'Đóng'
      }
    };
    return (words[L()]&&words[L()][key])||words.ja[key]||key;
  }
  function removeUserLocal(id){
    try{
      currentUsers=list().filter(function(user){return uid(user)!==String(id)});
      window.currentUsers=currentUsers;
      renderUsers();
    }catch(e){}
  }
  async function permanentDeleteUser(id){
    if(!id)return;
    var button=document.getElementById('deleteBtn');
    if(button){button.disabled=true;button.textContent=modalText('permanentBusy')}
    var res;
    try{
      res=await apiFetch(API+'/admin/users/'+encodeURIComponent(id)+'?permanent=true',{method:'DELETE'});
    }catch(e){
      if(button){button.disabled=false;button.textContent=W('permanentDelete')}
      document.getElementById('modalText').textContent=modalText('permanentFail');
      return;
    }
    if(res.status===401)return authFailLogout();
    if(button)button.disabled=false;
    var data=null;
    try{data=await res.json()}catch(e){}
    var permanentlyDeleted=data&&/permanent/i.test(String(data.message||''));
    if(!res.ok||!permanentlyDeleted){
      document.getElementById('modalText').textContent=(data&&data.message&&!res.ok)?data.message:modalText('permanentFail');
      if(button)button.textContent=W('permanentDelete');
      return;
    }
    if(typeof closeModal==='function')closeModal();
    removeUserLocal(id);
    if(typeof loadUsers==='function')loadUsers();
  }
  window.permanentDeleteUser=permanentDeleteUser;
  window.openPermanentDeleteModal=function(id){
    if(!id)return;
    deleteId=id;
    deleteMode='permanentUser';
    var title=document.getElementById('modalTitle');
    var text=document.getElementById('modalText');
    var cancel=document.getElementById('cancelBtn');
    var del=document.getElementById('deleteBtn');
    if(title)title.textContent=modalText('permanentTitle');
    if(text)text.textContent=modalText('permanentText');
    if(cancel){cancel.textContent=(typeof t==='function'?t('cancel'):modalText('close'));cancel.style.display=''}
    if(del){del.textContent=W('permanentDelete');del.style.display='';del.disabled=false}
    var modal=document.getElementById('modal');
    if(modal)modal.style.display='flex';
  };
  var baseConfirmDelete=window.confirmDelete;
  window.confirmDelete=async function(){
    if(deleteMode==='permanentUser')return permanentDeleteUser(deleteId);
    if(typeof baseConfirmDelete==='function')return baseConfirmDelete();
  };
  window.deleteUser=function(id){
    if(!id)return;
    removeUserLocal(id);
    apiFetch(API+'/admin/users/'+encodeURIComponent(id),{method:'DELETE'}).then(function(res){
      if(res.status===401)return authFailLogout();
      if(!res.ok&&typeof loadUsers==='function')loadUsers();
    }).catch(function(){if(typeof loadUsers==='function')loadUsers()});
  };
  function card(user){
    var id=uid(user), status=user.status||'pending', pending=status==='pending', blocked=status==='blocked', deleted=status==='deleted';
    var pill=deleted?'red':pending?'orange':blocked?'red':'green';
    var approve=pending?'<button class="approve" data-act="approve" data-id="'+safe(id)+'">'+W('approve')+'</button>':'';
    var reactivate=deleted?'<button class="reactivate" data-act="reactivate" data-id="'+safe(id)+'">'+W('reactivate')+'</button>':'';
    var block=!deleted?'<button class="block" data-act="block" data-next="'+(blocked?'active':'blocked')+'" data-id="'+safe(id)+'">'+(blocked?W('unblock'):W('block'))+'</button>':'';
    var softDelete=!deleted?'<button class="delete" data-act="delete" data-id="'+safe(id)+'">'+W('delete')+'</button>':'';
    var permanent=deleted?'<button class="permanent-delete" data-act="permanent" data-id="'+safe(id)+'">'+W('permanentDelete')+'</button>':'';
    var note=deleted?'<div class="user-deleted-note">'+W('deletedNote')+'</div>':'';
    return '<div class="customer-card-v30 '+(deleted?'deleted-user':'')+'" data-id="'+safe(id)+'"><div><b>'+safe(user.name||user.phone||'-')+'</b><div class="muted">'+safe(user.phone||'-')+' / '+safe(user.email||'-')+'</div><div class="muted">'+safe(user.company||user.customerType||'-')+'</div>'+note+'</div><div><span class="pill '+pill+'">'+safe(statusText(status))+'</span> <span class="pill blue">'+safe(user.province||'-')+'</span><div class="muted">'+safe(user.requestCount||0)+' '+W('requestCount')+'</div></div><div class="customer-actions-v30">'+approve+reactivate+block+softDelete+permanent+'</div></div>';
  }
  window.renderUsers=function(){
    var box=document.getElementById('usersList');
    if(!box)return;
    var kw=String((document.getElementById('userSearch')&&document.getElementById('userSearch').value)||'').toLowerCase();
    var rows=list().filter(function(user){return [user.name,user.phone,user.email,user.company,user.customerType,user.province,user.projectName,user.status].join(' ').toLowerCase().indexOf(kw)>=0});
    box.innerHTML=rows.length?rows.map(card).join(''):'<div class="no-data-v30">'+W('noData')+'</div>';
    box.querySelectorAll('.customer-card-v30').forEach(function(row){row.addEventListener('click',function(){if(typeof openUserDetail==='function')openUserDetail(row.dataset.id)})});
    box.querySelectorAll('.customer-actions-v30').forEach(function(actions){
      actions.addEventListener('click',function(event){
        event.stopPropagation();
        var button=event.target.closest('button');
        if(!button)return;
        var id=button.dataset.id;
        if(button.dataset.act==='approve'&&typeof toggleUserStatus==='function')toggleUserStatus(id,'active');
        if(button.dataset.act==='reactivate'&&typeof toggleUserStatus==='function')toggleUserStatus(id,'active');
        if(button.dataset.act==='block'&&typeof toggleUserStatus==='function')toggleUserStatus(id,button.dataset.next);
        if(button.dataset.act==='delete'&&typeof deleteUser==='function')deleteUser(id);
        if(button.dataset.act==='permanent')openPermanentDeleteModal(id);
      });
    });
    var side=document.getElementById('sideUsers');
    if(side)side.textContent=list().length;
    var final=document.getElementById('finalUserCount');
    if(final)final.textContent=list().length;
  };
})();

/* ===== Split from admin.html ===== */

(function(){
  function lang(){try{return currentLang==='vi'?'vi':'ja'}catch(e){return String(localStorage.getItem('language')||'ja').startsWith('vi')?'vi':'ja'}}
  function T(key){
    var words={
      ja:{basic:'基本情報',history:'依頼履歴',name:'氏名',phone:'電話番号',email:'メール',company:'会社 / 個人',province:'地域',project:'工事件名',address:'住所',contact:'連絡先',status:'ステータス',created:'登録日',lastLogin:'最終ログイン',requestCount:'依頼数',requestId:'ID',content:'内容',wait:'待機時間',noHistory:'履歴がありません'},
      vi:{basic:'Thông tin',history:'Lịch sử yêu cầu',name:'Họ tên',phone:'Số điện thoại',email:'Email',company:'Công ty / cá nhân',province:'Tỉnh / thành',project:'Tên công trình',address:'Địa chỉ',contact:'Liên hệ',status:'Trạng thái',created:'Ngày đăng ký',lastLogin:'Lần đăng nhập cuối',requestCount:'Số yêu cầu',requestId:'ID',content:'Nội dung',wait:'Thời gian chờ',noHistory:'Chưa có lịch sử'}
    };
    return (words[lang()]&&words[lang()][key])||words.ja[key]||key;
  }
  function escText(value){return String(value==null?'':value).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function uid(user){return String((user&&(user._id||user.id||user.userId))||'')}
  function date(value){if(!value)return '-';var d=new Date(value);return isNaN(d)?'-':d.toLocaleDateString(lang()==='ja'?'ja-JP':'vi-VN')}
  function elapsedText(value){try{return typeof elapsed==='function'?elapsed(value):date(value)}catch(e){return date(value)}}
  function titleOf(request){try{return typeof requestTitle==='function'?requestTitle(request):(request.content||request.title||request.message||'-')}catch(e){return request.content||request.title||request.message||'-'}}
  function statusOf(status){try{return typeof statusLabel==='function'?statusLabel(status):String(status||'-')}catch(e){return String(status||'-')}}
  function close(){var modal=document.getElementById('customerStaffLikeModal');if(modal)modal.remove()}
  window.closeCustomerStaffLikeDetail=close;
  window.switchCustomerStaffLikeTab=function(tab){
    document.querySelectorAll('#customerStaffLikeModal .staff-detail-tab').forEach(function(btn){btn.classList.toggle('active',btn.dataset.customerTab===tab)});
    document.querySelectorAll('#customerStaffLikeModal .staff-detail-pane').forEach(function(pane){pane.classList.toggle('active',pane.id==='customerPane'+(tab==='basic'?'Basic':'History'))});
  };
  async function loadHistory(userId){
    var rows=[];
    try{
      var res=await apiFetch(API+'/admin/users/'+encodeURIComponent(userId)+'/requests');
      if(res.ok){
        var data=await res.json();
        if(Array.isArray(data))rows=data;
      }
    }catch(e){}
    if(!rows.length){
      try{rows=(requests||[]).filter(function(request){return String(request.userId||'')===String(userId)})}catch(e){}
    }
    return rows;
  }
  window.openUserDetail=async function(id){
    var users=Array.isArray(window.currentUsers)?window.currentUsers:(Array.isArray(currentUsers)?currentUsers:[]);
    var user=users.find(function(item){return uid(item)===String(id)});
    if(!user)return;
    close();
    var history=await loadHistory(uid(user));
    var fields=[
      [T('name'),user.name||'-'],
      [T('phone'),user.phone||'-'],
      [T('email'),user.email||'-'],
      [T('company'),user.company||user.customerType||'-'],
      [T('province'),user.province||'-'],
      [T('project'),user.projectName||'-'],
      [T('address'),user.address||'-'],
      [T('contact'),user.contact||'-'],
      [T('status'),user.status||'pending'],
      [T('created'),date(user.createdAt)],
      [T('lastLogin'),date(user.lastLoginAt)],
      [T('requestCount'),user.requestCount||history.length||0]
    ];
    var modal=document.createElement('div');
    modal.id='customerStaffLikeModal';
    modal.className='staff-detail-modal show';
    modal.onclick=function(event){if(event.target===modal)close()};
    modal.innerHTML='<div class="staff-detail-box"><div class="staff-detail-top"><div class="staff-detail-tabs"><button class="staff-detail-tab active" data-customer-tab="basic" onclick="switchCustomerStaffLikeTab(\'basic\')">'+T('basic')+'</button><button class="staff-detail-tab" data-customer-tab="history" onclick="switchCustomerStaffLikeTab(\'history\')">'+T('history')+'</button></div><button class="staff-detail-close" onclick="closeCustomerStaffLikeDetail()"></button></div><div class="staff-detail-body"><div class="staff-detail-pane active" id="customerPaneBasic"><div class="staff-detail-pane-inner"><div class="staff-profile-center"><div class="staff-avatar-large">'+escText(String(user.name||user.phone||'?').trim().slice(0,1).toUpperCase()||'?')+'</div><div class="staff-profile-name">'+escText(user.name||user.phone||'-')+'</div><div class="staff-profile-role">'+escText(user.phone||'-')+'</div></div><div class="staff-detail-section-title">'+T('basic')+'</div><div class="staff-info-grid">'+fields.map(function(pair){return '<div class="staff-info-item"><b>'+escText(pair[0])+'</b><span>'+escText(pair[1])+'</span></div>'}).join('')+'</div></div></div><div class="staff-detail-pane" id="customerPaneHistory"><div class="staff-detail-pane-inner"><div class="staff-detail-section-title">'+T('history')+'</div><div class="staff-history-table"><div class="staff-history-row staff-history-head"><div>'+T('requestId')+'</div><div>'+T('content')+'</div><div>'+T('status')+'</div><div>'+T('wait')+'</div></div>'+(history.length?history.map(function(request){return '<div class="staff-history-row"><div>'+escText(request.requestId||request.id||request._id||'-')+'</div><div>'+escText(titleOf(request))+'</div><div>'+escText(statusOf(request.status))+'</div><div>'+escText(elapsedText(request.createdAt))+'</div></div>'}).join(''):'<div class="staff-history-row"><div style="grid-column:1/-1;color:#64748b">'+T('noHistory')+'</div></div>')+'</div></div></div></div></div>';
    document.body.appendChild(modal);
  };
})();

/* ===== Split from admin.html ===== */

(function(){
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  function tagsOf(r){
    const raw=r?.issueTags ?? r?.issues ?? r?.workTags ?? "";
    if(Array.isArray(raw))return raw.map(x=>String(x).trim()).filter(Boolean);
    return String(raw).split(/[,、\n]/).map(x=>x.trim()).filter(Boolean);
  }
  window.__yamadenRequestIssueTagsHtml=function(r){
    const tags=tagsOf(r);
    return tags.length?'<div class="request-issue-tags-admin">'+tags.map(tag=>'<span class="request-issue-tag-admin">'+esc(tag)+'</span>').join("")+'</div>':'';
  };
  const oldTitle=window.requestTitle;
  window.requestTitle=function(r){
    const tags=tagsOf(r);
    return tags[0]||((oldTitle&&oldTitle(r))||r?.category||r?.title||r?.content||r?.message||"-");
  };
  const oldMedia=window.mediaHtml;
  window.mediaHtml=function(r){
    return (window.__yamadenRequestIssueTagsHtml?window.__yamadenRequestIssueTagsHtml(r):"")+(oldMedia?oldMedia(r):"");
  };
})();

/* ===== Split from admin.html ===== */

(function(){
  const catalog=[
    {code:"01",ja:"\u793e\u9577\u30fb\u4ee3\u8868",vi:"Gi\u00e1m \u0111\u1ed1c / \u0111\u1ea1i di\u1ec7n c\u00f4ng ty",items:[]},
    {code:"02",ja:"\u5de5\u52d9\u90e8",vi:"B\u1ed9 ph\u1eadn qu\u1ea3n l\u00fd c\u00f4ng tr\u00ecnh",items:[]},
    {code:"03",ja:"FS\u90e8",vi:"B\u1ed9 ph\u1eadn b\u1ea3o tr\u00ec / h\u1ed7 tr\u1ee3 k\u1ef9 thu\u1eadt",items:[]},
    {code:"04",ja:"\u55b6\u696d\u90e8",vi:"B\u1ed9 ph\u1eadn kinh doanh / t\u01b0 v\u1ea5n",items:[]},
    {code:"05",ja:"\u5de5\u4e8b\u90e8",vi:"B\u1ed9 ph\u1eadn thi c\u00f4ng",items:[]},
    {code:"06",ja:"\u8a2d\u8a08\u90e8",vi:"B\u1ed9 ph\u1eadn thi\u1ebft k\u1ebf",items:[]},
    {code:"07",ja:"\u7dcf\u52d9\u90e8",vi:"B\u1ed9 ph\u1eadn t\u1ed5ng v\u1ee5",items:[]}
  ];
  window.YAMADEN_WORK_CATALOG=catalog;
  const workLabels={
    "01":[{vi:"Phê duyệt công trình",ja:"工事承認"},{vi:"Phê duyệt báo giá",ja:"見積承認"},{vi:"Phê duyệt hợp đồng",ja:"契約承認"},{vi:"Kiểm tra tiến độ tổng thể",ja:"全体進捗確認"},{vi:"Kiểm tra tình trạng công ty",ja:"会社状況確認"},{vi:"Họp với khách hàng",ja:"顧客打合せ"},{vi:"Tiếp nhận dự án lớn",ja:"大型案件受付"},{vi:"Xử lý vấn đề quan trọng",ja:"重要事項対応"},{vi:"Điều phối hoạt động công ty",ja:"会社活動調整"},{vi:"Quản lý vận hành công ty",ja:"会社運営管理"},{vi:"Quản lý nhân sự",ja:"人事管理"},{vi:"Kiểm tra doanh thu công trình",ja:"工事売上確認"},{vi:"Xác nhận kế hoạch thi công",ja:"施工計画確認"},{vi:"Phê duyệt hồ sơ kỹ thuật",ja:"技術書類承認"},{vi:"Giải quyết khiếu nại khách hàng",ja:"苦情対応"},{vi:"Hỗ trợ xử lý sự cố nghiêm trọng",ja:"重大問題支援"}],
    "02":[{vi:"Khảo sát hiện trường",ja:"現場調査"},{vi:"Kiểm tra công trình",ja:"工事確認"},{vi:"Kiểm tra tiến độ thi công",ja:"施工進捗確認"},{vi:"Kiểm tra an toàn công trình",ja:"現場安全確認"},{vi:"Kiểm tra chất lượng công trình",ja:"工事品質確認"},{vi:"Nghiệm thu công trình",ja:"工事検収"},{vi:"Kiểm tra sau thi công",ja:"施工後確認"},{vi:"Điều phối thi công",ja:"施工調整"},{vi:"Điều chỉnh lịch thi công",ja:"施工日程調整"},{vi:"Hỗ trợ bàn giao công trình",ja:"引渡支援"},{vi:"Kiểm tra tình trạng thiết bị",ja:"設備状況確認"},{vi:"Quản lý công trình đang thi công",ja:"施工中案件管理"},{vi:"Hỗ trợ xử lý vấn đề tại công trình",ja:"現場問題支援"}],
    "03":[{vi:"Kiểm tra thiết bị bị lỗi",ja:"故障設備確認"},{vi:"Sửa chữa sự cố",ja:"不具合修理"},{vi:"Bảo trì định kỳ",ja:"定期保守"},{vi:"Kiểm tra hệ thống điện",ja:"電気系統確認"},{vi:"Kiểm tra thiết bị hoạt động không ổn định",ja:"動作不安定設備確認"},{vi:"Xử lý sự cố khẩn cấp",ja:"緊急対応"},{vi:"Vệ sinh thiết bị",ja:"設備清掃"},{vi:"Thay thế linh kiện",ja:"部品交換"},{vi:"Kiểm tra nguyên nhân lỗi",ja:"故障原因調査"},{vi:"Hỗ trợ kỹ thuật",ja:"技術支援"},{vi:"Kiểm tra máy móc",ja:"機械確認"},{vi:"Khôi phục hoạt động hệ thống",ja:"システム復旧"},{vi:"Kiểm tra kết nối thiết bị",ja:"機器接続確認"},{vi:"Kiểm tra sau sửa chữa",ja:"修理後確認"},{vi:"Hỗ trợ tại hiện trường",ja:"現場支援"}],
    "04":[{vi:"Tư vấn dịch vụ",ja:"サービス相談"},{vi:"Tư vấn công trình mới",ja:"新規工事相談"},{vi:"Khảo sát để báo giá",ja:"見積調査"},{vi:"Báo giá sửa chữa",ja:"修理見積"},{vi:"Báo giá thi công",ja:"施工見積"},{vi:"Tư vấn thiết bị phù hợp",ja:"適切機器提案"},{vi:"Tư vấn phương án thi công",ja:"施工方法提案"},{vi:"Tư vấn phương án tiết kiệm chi phí",ja:"コスト削減提案"},{vi:"Giải thích dịch vụ",ja:"サービス説明"},{vi:"Hỗ trợ hợp đồng",ja:"契約支援"},{vi:"Điều chỉnh nội dung hợp đồng",ja:"契約内容調整"},{vi:"Chăm sóc khách hàng",ja:"顧客フォロー"},{vi:"Hỗ trợ đặt lịch dịch vụ",ja:"サービス予約支援"},{vi:"Tiếp nhận yêu cầu khách hàng",ja:"顧客依頼受付"}],
    "05":[{vi:"Lắp đặt thiết bị",ja:"設備取付"},{vi:"Tháo dỡ thiết bị",ja:"設備撤去"},{vi:"Di dời thiết bị",ja:"設備移設"},{vi:"Đi dây điện",ja:"電気配線"},{vi:"Sửa dây điện",ja:"配線修理"},{vi:"Lắp đèn",ja:"照明取付"},{vi:"Thay đèn",ja:"照明交換"},{vi:"Lắp ổ cắm / công tắc",ja:"コンセント・スイッチ取付"},{vi:"Lắp CB / breaker",ja:"ブレーカー取付"},{vi:"Lắp camera",ja:"カメラ取付"},{vi:"Sửa camera",ja:"カメラ修理"},{vi:"Đi dây mạng LAN",ja:"LAN配線"},{vi:"Lắp Wi-Fi / router",ja:"Wi-Fi・ルーター設置"},{vi:"Lắp máy lạnh",ja:"エアコン取付"},{vi:"Tháo máy lạnh",ja:"エアコン撤去"},{vi:"Lắp quạt thông gió",ja:"換気扇取付"},{vi:"Thi công hệ thống điện",ja:"電気設備工事"},{vi:"Thi công tủ điện",ja:"制御盤工事"},{vi:"Thi công tại công trình",ja:"現場施工"},{vi:"Lắp đặt máy móc",ja:"機械設置"},{vi:"Sửa chữa tại công trình",ja:"現場修理"},{vi:"Lắp đặt hệ thống mới",ja:"新規システム設置"},{vi:"Cải tạo hệ thống cũ",ja:"既存システム改修"}],
    "06":[{vi:"Thiết kế bản vẽ",ja:"図面設計"},{vi:"Chỉnh sửa bản vẽ",ja:"図面修正"},{vi:"Thiết kế sơ đồ điện",ja:"電気系統図設計"},{vi:"Vẽ CAD",ja:"CAD作図"},{vi:"Thiết kế tủ điện",ja:"制御盤設計"},{vi:"Thiết kế bố trí thiết bị",ja:"設備配置設計"},{vi:"Thiết kế hệ thống điện",ja:"電気システム設計"},{vi:"Làm bản vẽ thi công",ja:"施工図作成"},{vi:"Làm bản vẽ hoàn công",ja:"竣工図作成"},{vi:"Kiểm tra bản vẽ kỹ thuật",ja:"技術図面確認"},{vi:"Tính toán vật tư",ja:"材料拾い出し"},{vi:"Tính toán công suất",ja:"電気容量計算"},{vi:"Thiết kế phương án thi công",ja:"施工方法設計"},{vi:"Kiểm tra tiêu chuẩn kỹ thuật",ja:"技術基準確認"}],
    "07":[{vi:"Hỗ trợ thủ tục",ja:"手続支援"},{vi:"Xử lý giấy tờ",ja:"書類処理"},{vi:"Cập nhật thông tin khách hàng",ja:"顧客情報更新"},{vi:"Xác nhận thông tin dịch vụ",ja:"サービス情報確認"},{vi:"Hỗ trợ đặt lịch",ja:"予約支援"},{vi:"Điều chỉnh lịch hẹn",ja:"予約日程調整"},{vi:"Hỗ trợ thanh toán",ja:"支払支援"},{vi:"Xác nhận thanh toán",ja:"入金確認"},{vi:"Xử lý yêu cầu hành chính",ja:"事務依頼対応"},{vi:"Hỗ trợ hồ sơ dịch vụ",ja:"サービス書類支援"},{vi:"Tiếp nhận yêu cầu chung",ja:"一般依頼受付"},{vi:"Hướng dẫn sử dụng dịch vụ",ja:"サービス利用案内"},{vi:"Kiểm tra thông tin khách hàng",ja:"顧客情報確認"},{vi:"Hỗ trợ xử lý thông tin",ja:"情報処理支援"},{vi:"Xác nhận hồ sơ",ja:"書類確認"}]
  };
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const lang=()=>{try{return currentLang==="vi"?"vi":"ja"}catch(e){return String(localStorage.getItem("language")||"ja").startsWith("vi")?"vi":"ja"}};
  const txt={ja:{title:"\u30b9\u30bf\u30c3\u30d5\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb",sub:"\u90e8\u9580\u30fb\u62c5\u5f53\u4f5c\u696d\u30fb\u30a2\u30d0\u30bf\u30fc\u3092\u7ba1\u7406\u3057\u307e\u3059\u3002",add:"\u65b0\u898f\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u8ffd\u52a0",avt:"\u30a2\u30d0\u30bf\u30fc",pickAvatar:"\u5199\u771f\u3092\u9078\u629e",name:"\u540d\u524d",email:"Email",dept:"\u90e8\u7f72",deptVi:"\u30d9\u30c8\u30ca\u30e0\u8a9e",work:"\u62c5\u5f53\u4f5c\u696d\u5185\u5bb9",hint:"\u90e8\u7f72\u306b\u5408\u308f\u305b\u3066\u62c5\u5f53\u3067\u304d\u308b\u4f5c\u696d\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002",edit:"\u7de8\u96c6",delete:"\u524a\u9664",cancel:"\u30ad\u30e3\u30f3\u30bb\u30eb",save:"\u4fdd\u5b58",noData:"\u30c7\u30fc\u30bf\u304c\u3042\u308a\u307e\u305b\u3093",basic:"\u57fa\u672c\u60c5\u5831",history:"\u4f9d\u983c\u5c65\u6b74",requestId:"ID",content:"\u5185\u5bb9",status:"\u30b9\u30c6\u30fc\u30bf\u30b9",wait:"\u5f85\u6a5f\u6642\u9593",registered:"\u767b\u9332\u65e5"},vi:{title:"H\u1ed3 s\u01a1 nh\u00e2n vi\u00ean",sub:"Qu\u1ea3n l\u00fd b\u1ed9 ph\u1eadn, n\u1ed9i dung c\u00f4ng vi\u1ec7c v\u00e0 avatar.",add:"Th\u00eam h\u1ed3 s\u01a1 m\u1edbi",avt:"Avatar",pickAvatar:"Ch\u1ecdn \u1ea3nh",name:"T\u00ean",email:"Email",dept:"B\u1ed9 ph\u1eadn l\u00e0m vi\u1ec7c",deptVi:"T\u00ean ti\u1ebfng Vi\u1ec7t",work:"N\u1ed9i dung c\u00f4ng vi\u1ec7c ph\u1ee5 tr\u00e1ch",hint:"Ch\u1ecdn c\u00e1c c\u00f4ng vi\u1ec7c nh\u00e2n vi\u00ean ph\u1ee5 tr\u00e1ch theo b\u1ed9 ph\u1eadn.",edit:"S\u1eeda",delete:"X\u00f3a",cancel:"H\u1ee7y",save:"L\u01b0u",noData:"Kh\u00f4ng c\u00f3 d\u1eef li\u1ec7u",basic:"Th\u00f4ng tin",history:"L\u1ecbch s\u1eed y\u00eau c\u1ea7u",requestId:"ID",content:"N\u1ed9i dung",status:"Tr\u1ea1ng th\u00e1i",wait:"Th\u1eddi gian ch\u1edd",registered:"Ng\u00e0y \u0111\u0103ng k\u00fd"}};
  const T=k=>(txt[lang()]&&txt[lang()][k])||txt.ja[k]||k;
  const rows=()=>((typeof currentStaff!=="undefined"?currentStaff:window.currentStaff)||[]);
  const sid=s=>String((s&&((s._id)||(s.id)||(s.staffId)))||"");
  const rawDept=s=>String((s&&(s.department||s.areas||s.dept))||"");
  const deptOf=value=>{const raw=String(value||"");return catalog.find(d=>raw===d.ja||raw===d.vi||raw===`${d.code} ${d.ja}`||raw.includes(d.ja)||raw.includes(d.vi))||catalog[0]};
  const parseTags=s=>{if(Array.isArray(s?.workTags))return s.workTags;if(Array.isArray(s?.tags))return s.tags;return String(s?.workContent||s?.work||s?.skills||"").split(/[,、\n]/).map(x=>x.trim()).filter(Boolean)};
  const avatarUrl=s=>s?.avatarUrl||s?.avatar||s?.photoUrl||s?.image||"";
  const initial=s=>String(s?.name||"?").trim().slice(0,1).toUpperCase()||"?";
  const avatar=(s,cls="staff-avatar")=>avatarUrl(s)?`<div class="${cls}"><img src="${esc(avatarUrl(s))}" alt=""></div>`:`<div class="${cls}">${esc(initial(s))}</div>`;
  const deptOptions=()=>catalog.map(d=>`<option value="${esc(d.ja)}">${esc(d.code+" "+d.ja)}</option>`).join("");
  const deptHtml=value=>{const d=deptOf(value);const label=lang()==="ja"?d.ja:d.vi;return `<span class="staff-dept-pill final-dept"><b>${esc(d.code+" "+label)}</b></span>`};
  const staffRequests=s=>{const id=sid(s);const name=String(s?.name||"");try{return (requests||[]).filter(r=>String(r.assigneeId||"")===id||String(r.assigneeName||"")===name)}catch(e){return []}};
  const normText=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\u0111/g,"d").replace(/\u0110/g,"D").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const legacyWork=[
    {vi:"Thi\u1ebft k\u1ebf b\u1ea3n v\u1ebd",ja:"\u56f3\u9762\u8a2d\u8a08"},
    {vi:"Ch\u1ec9nh s\u1eeda b\u1ea3n v\u1ebd",ja:"\u56f3\u9762\u4fee\u6b63"},
    {vi:"Thi\u1ebft k\u1ebf s\u01a1 \u0111\u1ed3 \u0111i\u1ec7n",ja:"\u96fb\u6c17\u7cfb\u7d71\u56f3\u8a2d\u8a08"},
    {vi:"V\u1ebd CAD",ja:"CAD\u4f5c\u56f3"},
    {vi:"Thi\u1ebft k\u1ebf t\u1ee7 \u0111i\u1ec7n",ja:"\u5236\u5fa1\u76e4\u8a2d\u8a08"},
    {vi:"Thi\u1ebft k\u1ebf b\u1ed1 tr\u00ed thi\u1ebft b\u1ecb",ja:"\u8a2d\u5099\u914d\u7f6e\u8a2d\u8a08"},
    {vi:"Thi\u1ebft k\u1ebf h\u1ec7 th\u1ed1ng \u0111i\u1ec7n",ja:"\u96fb\u6c17\u30b7\u30b9\u30c6\u30e0\u8a2d\u8a08"},
    {vi:"L\u00e0m b\u1ea3n v\u1ebd thi c\u00f4ng",ja:"\u65bd\u5de5\u56f3\u4f5c\u6210"},
    {vi:"L\u00e0m b\u1ea3n v\u1ebd ho\u00e0n c\u00f4ng",ja:"\u7ae3\u5de5\u56f3\u4f5c\u6210"},
    {vi:"Ki\u1ec3m tra b\u1ea3n v\u1ebd k\u1ef9 thu\u1eadt",ja:"\u6280\u8853\u56f3\u9762\u78ba\u8a8d"},
    {vi:"T\u00ednh to\u00e1n v\u1eadt t\u01b0",ja:"\u6750\u6599\u8a08\u7b97"},
    {vi:"T\u00ednh to\u00e1n c\u00f4ng su\u1ea5t",ja:"\u5bb9\u91cf\u8a08\u7b97"},
    {vi:"Thi\u1ebft k\u1ebf ph\u01b0\u01a1ng \u00e1n thi c\u00f4ng",ja:"\u65bd\u5de5\u65b9\u6848\u8a2d\u8a08"},
    {vi:"Ki\u1ec3m tra ti\u00eau chu\u1ea9n k\u1ef9 thu\u1eadt",ja:"\u6280\u8853\u57fa\u6e96\u78ba\u8a8d"}
  ];
  const legacyWorkLabel=value=>{const raw=String(value||"").trim();const n=normText(raw);const item=legacyWork.find(x=>raw===x.vi||raw===x.ja||n===normText(x.vi)||n===normText(x.ja));return item?(lang()==="ja"?item.ja:item.vi):""};
  const workLabel=value=>{const raw=String(value||"").trim();for(const list of Object.values(workLabels)){const item=list.find(x=>raw===x.vi||raw===x.ja||normText(raw)===normText(x.vi)||normText(raw)===normText(x.ja));if(item)return lang()==="ja"?item.ja:item.vi}return legacyWorkLabel(raw)||raw};
  const workListLabel=list=>{const labels=(Array.isArray(list)?list:[]).map(workLabel).filter(Boolean);return labels.length?labels.join(", "):"-"};
  function syncDeptNote(){}
  window.renderStaffWorkTagOptionsFinal=function(selected=[]){const sel=$("staffProfileDept"),box=$("staffWorkTagBox");if(!sel||!box)return;const chosen=new Set(Array.isArray(selected)?selected:[]);const d=deptOf(sel.value);const items=workLabels[d.code]||d.items.map(item=>({vi:item,ja:item}));box.innerHTML=items.map(item=>{const value=item.vi;const label=lang()==="ja"?item.ja:item.vi;const checked=chosen.has(item.vi)||chosen.has(item.ja);return '<label class="work-tag-item"><input type="checkbox" value="'+esc(value)+'" '+(checked?"checked":"")+'><span>'+esc(label)+'</span></label>'}).join("");syncDeptNote()};
  window.openStaffProfileForm=function(id=""){let old=$("staffFormModal");if(old)old.remove();const s=rows().find(x=>sid(x)===String(id));const d=deptOf(rawDept(s||{}));const modal=document.createElement("div");modal.id="staffFormModal";modal.className="staff-form-modal show";modal.onclick=e=>{if(e.target===modal)closeStaffProfileForm()};modal.innerHTML=`<div class="staff-form-box"><div class="staff-form-head"><div class="staff-form-title">${esc(T("title"))}</div><button class="staff-form-close" onclick="closeStaffProfileForm()"></button></div><div class="staff-form-body"><input type="hidden" id="staffProfileId" value="${esc(id)}"><input type="hidden" id="staffProfileAvatarUrl" value="${esc(avatarUrl(s))}"><div class="staff-avatar-field"><div class="staff-avatar-preview" id="staffAvatarPreview">${avatarUrl(s)?`<img src="${esc(avatarUrl(s))}" alt="">`:esc(initial(s))}</div><div class="staff-avatar-input-wrap"><label>${esc(T("avt"))}</label><input id="staffProfileAvatar" class="staff-avatar-file" type="file" accept="image/*"><button type="button" class="staff-avatar-pick" onclick="document.getElementById('staffProfileAvatar').click()">${esc(T("pickAvatar"))}</button></div></div><div class="staff-field"><label>${esc(T("name"))}</label><input id="staffProfileName" value="${esc(s?.name||"")}"></div><div class="staff-field"><label>${esc(T("email"))}</label><input id="staffProfileEmail" type="email" value="${esc(s?.email||"")}"></div><div class="staff-field"><label>${esc(T("dept"))}</label><select id="staffProfileDept" onchange="renderStaffWorkTagOptionsFinal()">${deptOptions()}</select></div><div class="staff-field"><label>${esc(T("work"))}</label><div class="muted" style="font-size:12px;font-weight:800">${esc(T("hint"))}</div><div class="work-tag-box" id="staffWorkTagBox"></div></div><div class="staff-form-actions"><button class="staff-cancel-profile" onclick="closeStaffProfileForm()">${esc(T("cancel"))}</button><button class="staff-save-profile" onclick="saveStaffProfileV8()">${esc(T("save"))}</button></div></div></div>`;document.body.appendChild(modal);$("staffProfileDept").value=d.ja;renderStaffWorkTagOptionsFinal(parseTags(s||{}));$("staffProfileAvatar").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];if(f)$("staffAvatarPreview").innerHTML=`<img src="${URL.createObjectURL(f)}" alt="">`})};
  window.closeStaffProfileForm=function(){$("staffFormModal")?.remove()};
  window.saveStaffProfileV8=async function(){const id=$("staffProfileId")?.value||"";const name=$("staffProfileName")?.value.trim()||"";if(!name)return;const dept=deptOf($("staffProfileDept")?.value||"").ja;const tags=[...document.querySelectorAll("#staffWorkTagBox input:checked")].map(x=>x.value);const fd=new FormData();fd.append("name",name);fd.append("email",$("staffProfileEmail")?.value.trim()||"");fd.append("phone","");fd.append("areas",dept);fd.append("department",dept);fd.append("skills",tags.join(", "));fd.append("workContent",tags.join(", "));fd.append("workTags",JSON.stringify(tags));fd.append("status","active");const keep=$("staffProfileAvatarUrl")?.value||"";if(keep)fd.append("avatar",keep);const file=$("staffProfileAvatar")?.files?.[0];if(file)fd.append("avatar",file);const res=await apiFetch(API+"/admin/staff"+(id?"/"+encodeURIComponent(id):""),{method:id?"PUT":"POST",body:fd});if(res.status===401)return authFailLogout();closeStaffProfileForm();loadStaff()};
  window.renderStaff=function(){const root=$("staffView");if(!root)return;root.innerHTML=`<div class="panel"><div class="staff-profile-shell"><div class="staff-profile-head"><div><div class="staff-profile-title">${esc(T("title"))}</div><div class="muted" style="font-size:12px;font-weight:750;margin-top:4px">${esc(T("sub"))}</div></div><button type="button" class="staff-add-btn">+ ${esc(T("add"))}</button></div><div class="staff-profile-list-head"><div>${esc(T("avt"))}</div><div>${esc(T("name"))}</div><div>${esc(T("dept"))}</div><div>${esc(T("email"))}</div><div>${esc(T("edit"))}</div><div>${esc(T("delete"))}</div></div><div class="staff-profile-list" id="staffProfileList"></div></div></div>`;const list=$("staffProfileList");list.innerHTML=rows().length?rows().map(s=>{const id=sid(s);return `<div class="staff-profile-row" data-staff-id="${esc(id)}"><div>${avatar(s)}</div><div><div class="staff-row-name">${esc(s.name||"-")}</div></div><div class="staff-dept-cell">${deptHtml(rawDept(s))}</div><div class="staff-mail-cell staff-row-mail">${esc(s.email||"-")}</div><div class="staff-action-cell"><button type="button" class="staff-row-btn edit" data-edit-staff="${esc(id)}">${esc(T("edit"))}</button></div><div class="staff-action-cell"><button type="button" class="staff-row-btn delete" data-delete-staff="${esc(id)}">${esc(T("delete"))}</button></div></div>`}).join(""):`<div class="muted" style="padding:24px;text-align:center">${esc(T("noData"))}</div>`;const count=$("finalStaffCount");if(count)count.textContent=rows().length};
  window.openStaffDetail=function(id){const s=rows().find(x=>sid(x)===String(id));if(!s)return;let old=$("staffDetailModal");if(old)old.remove();const reqs=staffRequests(s);const tags=parseTags(s);const fields=[[T("name"),s.name||"-"],[T("dept"),deptOf(rawDept(s)).code+" "+(lang()==="ja"?deptOf(rawDept(s)).ja:deptOf(rawDept(s)).vi)],[T("email"),s.email||"-"],[T("work"),workListLabel(tags)],[T("registered"),s.createdAt?new Date(s.createdAt).toLocaleDateString(lang()==="ja"?"ja-JP":"vi-VN"):"-"],[T("history"),reqs.length]];const modal=document.createElement("div");modal.id="staffDetailModal";modal.className="staff-detail-modal show";modal.onclick=e=>{if(e.target===modal)closeStaffDetail()};modal.innerHTML=`<div class="staff-detail-box"><div class="staff-detail-top"><div class="staff-detail-tabs"><button class="staff-detail-tab active" data-staff-tab="basic">${esc(T("basic"))}</button><button class="staff-detail-tab" data-staff-tab="history">${esc(T("history"))}</button></div><button class="staff-detail-close" onclick="closeStaffDetail()"></button></div><div class="staff-detail-body"><div class="staff-detail-pane active" id="staffDetailPaneBasic"><div class="staff-profile-center">${avatar(s,"staff-avatar-large")}<div class="staff-profile-name">${esc(s.name||"-")}</div><div class="staff-profile-role"><span class="staff-dept-pill final-dept"><b>${esc(deptOf(rawDept(s)).code+" "+(lang()==="ja"?deptOf(rawDept(s)).ja:deptOf(rawDept(s)).vi))}</b></span></div></div><div class="staff-detail-section-title">${esc(T("basic"))}</div><div class="staff-info-grid">${fields.map(([k,v])=>`<div class="staff-info-item"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div></div><div class="staff-detail-pane" id="staffDetailPaneHistory"><div class="staff-detail-section-title">${esc(T("history"))}</div><div class="staff-history-table"><div class="staff-history-row staff-history-head"><div>${esc(T("requestId"))}</div><div>${esc(T("content"))}</div><div>${esc(T("status"))}</div><div>${esc(T("wait"))}</div></div>${reqs.length?reqs.map(r=>`<div class="staff-history-row"><div>${esc(r.requestId||r.id||r._id||"-")}</div><div>${esc(typeof requestTitle==="function"?requestTitle(r):(r.content||"-"))}</div><div>${esc(r.status||"-")}</div><div>${esc(typeof elapsed==="function"?elapsed(r.createdAt):"-")}</div></div>`).join(""):`<div style="padding:16px;color:#64748b">${esc(T("noData"))}</div>`}</div></div></div></div>`;document.body.appendChild(modal)};
  window.closeStaffDetail=function(){$("staffDetailModal")?.remove()};
  function refreshStaffModalLanguage(){if(!$("staffFormModal"))return;const selected=[...document.querySelectorAll("#staffWorkTagBox input:checked")].map(x=>x.value);renderStaffWorkTagOptionsFinal(selected);const title=document.querySelector("#staffFormModal .staff-form-title");if(title)title.textContent=T("title");const labels=document.querySelectorAll("#staffFormModal .staff-field label");if(labels[0])labels[0].textContent=T("name");if(labels[1])labels[1].textContent=T("email");if(labels[2])labels[2].textContent=T("dept");if(labels[3])labels[3].textContent=T("work");const hint=document.querySelector("#staffFormModal .staff-field .muted");if(hint)hint.textContent=T("hint");const cancel=document.querySelector("#staffFormModal .staff-cancel-profile");if(cancel)cancel.textContent=T("cancel");const save=document.querySelector("#staffFormModal .staff-save-profile");if(save)save.textContent=T("save");const pick=document.querySelector("#staffFormModal .staff-avatar-pick");if(pick)pick.textContent=T("pickAvatar")};
  document.addEventListener("click",e=>{const add=e.target.closest(".staff-add-btn");if(add){e.preventDefault();return openStaffProfileForm("")}const edit=e.target.closest("[data-edit-staff]");if(edit){e.preventDefault();e.stopPropagation();return openStaffProfileForm(edit.dataset.editStaff)}const del=e.target.closest("[data-delete-staff]");if(del){e.preventDefault();e.stopPropagation();return window.deleteStaffProfile&&window.deleteStaffProfile(del.dataset.deleteStaff)}const row=e.target.closest(".staff-profile-row[data-staff-id]");if(row&&!e.target.closest("button"))openStaffDetail(row.dataset.staffId);const tab=e.target.closest(".staff-detail-tab");if(tab){document.querySelectorAll(".staff-detail-tab").forEach(x=>x.classList.toggle("active",x===tab));document.querySelectorAll(".staff-detail-pane").forEach(p=>p.classList.toggle("active",p.id==="staffDetailPane"+(tab.dataset.staffTab==="basic"?"Basic":"History")))}});const oldApply=window.applyLanguage;window.applyLanguage=function(){if(oldApply)oldApply();setTimeout(()=>{refreshStaffModalLanguage();if((typeof currentView!=="undefined"?currentView:"")==="staff")renderStaff()},0)};document.addEventListener("change",e=>{if(e.target&&e.target.matches("#language,#authLanguage,.language-select,select"))setTimeout(refreshStaffModalLanguage,0)});document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{refreshStaffModalLanguage();if((typeof currentView!=="undefined"?currentView:"")==="staff")renderStaff()},300));
})();


/* ===== Final stable admin user approval workflow ===== */
(function(){
  const byId=id=>document.getElementById(id);
  const lang=()=>{try{return currentLang==='vi'?'vi':'ja'}catch(e){return String(localStorage.getItem('language')||'ja').startsWith('vi')?'vi':'ja'}};
  const words={
    ja:{approve:'\u627f\u8a8d',reject:'\u975e\u627f\u8a8d',block:'\u505c\u6b62',unblock:'\u89e3\u9664',delete:'\u524a\u9664',permanentDelete:'\u5b8c\u5168\u524a\u9664',reactivate:'\u518d\u6709\u52b9\u5316',pending:'\u627f\u8a8d\u5f85\u3061',active:'\u6709\u52b9',blocked:'\u505c\u6b62\u4e2d',deleted:'\u524a\u9664\u6e08\u307f',requestCount:'\u4f9d\u983c\u6570',noData:'\u30c7\u30fc\u30bf\u304c\u3042\u308a\u307e\u305b\u3093',confirmTitle:'\u64cd\u4f5c\u306e\u78ba\u8a8d',approveText:'\u3053\u306e\u30e6\u30fc\u30b6\u30fc\u3092\u627f\u8a8d\u3057\u307e\u3059\u304b\uff1f',rejectText:'\u975e\u627f\u8a8d\u306b\u3057\u3066\u5b8c\u5168\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f',blockText:'\u3053\u306e\u30e6\u30fc\u30b6\u30fc\u3092\u505c\u6b62\u3057\u307e\u3059\u304b\uff1f',unblockText:'\u3053\u306e\u30e6\u30fc\u30b6\u30fc\u306e\u505c\u6b62\u3092\u89e3\u9664\u3057\u307e\u3059\u304b\uff1f',deleteText:'\u3053\u306e\u627f\u8a8d\u6e08\u307f\u30e6\u30fc\u30b6\u30fc\u3092\u524a\u9664\u30ea\u30b9\u30c8\u3078\u79fb\u52d5\u3057\u307e\u3059\u304b\uff1f',reactivateText:'\u3053\u306e\u30e6\u30fc\u30b6\u30fc\u3092\u518d\u6709\u52b9\u5316\u3057\u307e\u3059\u304b\uff1f',permanentText:'\u3053\u306e\u627f\u8a8d\u6e08\u307f\u30e6\u30fc\u30b6\u30fc\u3092\u5b8c\u5168\u306b\u524a\u9664\u3057\u307e\u3059\u304b\uff1f',working:'\u51e6\u7406\u4e2d...',failed:'\u51e6\u7406\u306b\u5931\u6557\u3057\u307e\u3057\u305f'},
    vi:{approve:'Duyet',reject:'Khong duyet',block:'Khoa',unblock:'Mo khoa',delete:'Xoa',permanentDelete:'Xoa vinh vien',reactivate:'Tai kich hoat',pending:'Cho duyet',active:'Dang hoat dong',blocked:'Da khoa',deleted:'Da xoa',requestCount:'So yeu cau',noData:'Khong co du lieu',confirmTitle:'Xac nhan thao tac',approveText:'Ban muon duyet user nay? Sau khi duyet, user co the dung app.',rejectText:'Ban muon khong duyet va xoa luon user nay? Thao tac nay khong the khoi phuc.',blockText:'Ban muon khoa user nay?',unblockText:'Ban muon mo khoa user nay?',deleteText:'Ban muon chuyen user da duyet nay vao danh sach da xoa?',reactivateText:'Ban muon tai kich hoat user nay?',permanentText:'Ban muon xoa vinh vien user da duyet nay? Thao tac nay khong the khoi phuc.',working:'Dang xu ly...',failed:'Thao tac that bai. Vui long thu lai.'}
  };
  const T=k=>(words[lang()]&&words[lang()][k])||words.ja[k]||k;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const rows=()=>Array.isArray(window.currentUsers)?window.currentUsers:(Array.isArray(currentUsers)?currentUsers:[]);
  const setRows=list=>{currentUsers=Array.isArray(list)?list:[];window.currentUsers=currentUsers};
  const uid=u=>String((u&&(u._id||u.id||u.userId))||'');
  const labelStatus=s=>T(s||'pending')||s||'-';
  const labelAction=a=>({approve:T('approve'),reject:T('reject'),block:T('block'),unblock:T('unblock'),delete:T('delete'),reactivate:T('reactivate'),permanent:T('permanentDelete')})[a]||T('confirmTitle');
  const messageAction=a=>({approve:T('approveText'),reject:T('rejectText'),block:T('blockText'),unblock:T('unblockText'),delete:T('deleteText'),reactivate:T('reactivateText'),permanent:T('permanentText')})[a]||T('confirmTitle');
  async function fetchUsersFresh(){const sep=API.indexOf('?')>=0?'&':'?';const res=await apiFetch(API+'/admin/users'+sep+'_ts='+Date.now(),{cache:'no-store'});if(res.status===401)return authFailLogout();if(!res.ok)throw new Error('users load failed');const data=await res.json();return Array.isArray(data)?data:(data.users||[])}
  function syncCounts(){const total=rows().length;const side=byId('sideUsers'),final=byId('finalUserCount');if(side)side.textContent=total;if(final)final.textContent=total}
  function renderCard(u){const id=uid(u),status=u.status||'pending',pending=status==='pending',blocked=status==='blocked',deleted=status==='deleted',pill=deleted?'red':pending?'orange':blocked?'red':'green';let actions='';if(pending){actions='<button class="approve" data-user-action="approve" data-user-id="'+esc(id)+'">'+T('approve')+'</button><button class="delete" data-user-action="reject" data-user-id="'+esc(id)+'">'+T('reject')+'</button>'}else if(deleted){actions='<button class="reactivate" data-user-action="reactivate" data-user-id="'+esc(id)+'">'+T('reactivate')+'</button><button class="permanent-delete" data-user-action="permanent" data-user-id="'+esc(id)+'">'+T('permanentDelete')+'</button>'}else{actions='<button class="block" data-user-action="'+(blocked?'unblock':'block')+'" data-user-id="'+esc(id)+'">'+(blocked?T('unblock'):T('block'))+'</button><button class="delete" data-user-action="delete" data-user-id="'+esc(id)+'">'+T('delete')+'</button>'}return '<div class="customer-card-v30 admin-user-card-final '+(deleted?'deleted-user':'')+'" data-user-row="'+esc(id)+'"><div><b>'+esc(u.name||u.phone||'-')+'</b><div class="muted">'+esc(u.phone||'-')+' / '+esc(u.email||'-')+'</div><div class="muted">'+esc(u.company||u.customerType||'-')+'</div></div><div><span class="pill '+pill+'">'+esc(labelStatus(status))+'</span> <span class="pill blue">'+esc(u.province||'-')+'</span><div class="muted">'+esc(u.requestCount||0)+' '+T('requestCount')+'</div></div><div class="customer-actions-v30">'+actions+'</div></div>'}
  window.loadUsers=async function(){try{setRows(await fetchUsersFresh())}catch(e){setRows([])}if(typeof renderUsers==='function')renderUsers();syncCounts()};
  window.renderUsers=function(){const box=byId('usersList');if(!box)return;const kw=String((byId('userSearch')&&byId('userSearch').value)||'').toLowerCase();const list=rows().filter(u=>[u.name,u.phone,u.email,u.company,u.customerType,u.province,u.projectName,u.status].join(' ').toLowerCase().includes(kw));box.innerHTML=list.length?list.map(renderCard).join(''):'<div class="no-data-v30">'+T('noData')+'</div>';syncCounts()};
  function openAction(id,action){if(!id||!action)return;deleteId=id;deleteMode='stableUserAction';window.__stableUserAction={id,action};const title=byId('modalTitle'),body=byId('modalText'),cancel=byId('cancelBtn'),confirm=byId('deleteBtn');if(title)title.textContent=T('confirmTitle');if(body)body.textContent=messageAction(action);if(cancel){cancel.style.display='';cancel.textContent=typeof t==='function'?t('cancel'):(lang()==='vi'?'Huy':'Cancel')}if(confirm){confirm.style.display='';confirm.disabled=false;confirm.textContent=labelAction(action)}const modal=byId('modal');if(modal)modal.style.display='flex'}
  async function runAction(){const item=window.__stableUserAction;if(!item)return;const confirm=byId('deleteBtn');if(confirm){confirm.disabled=true;confirm.textContent=T('working')}let url=API+'/admin/users/'+encodeURIComponent(item.id),options={method:'PUT',headers:{'Content-Type':'application/json'},body:'{}'};if(['approve','reactivate','unblock'].includes(item.action))options.body=JSON.stringify({status:'active'});else if(item.action==='block')options.body=JSON.stringify({status:'blocked'});else if(item.action==='delete')options={method:'DELETE'};else if(item.action==='reject'||item.action==='permanent'){url+='?permanent=true';options={method:'DELETE'}}try{const res=await apiFetch(url,options);if(res.status===401)return authFailLogout();if(!res.ok)throw new Error('action failed');if(typeof closeModal==='function')closeModal();window.__stableUserAction=null;await window.loadUsers()}catch(e){const body=byId('modalText');if(body)body.textContent=T('failed');if(confirm){confirm.disabled=false;confirm.textContent=labelAction(item.action)}}}
  const oldConfirm=window.confirmDelete;window.confirmDelete=async function(){if(deleteMode==='stableUserAction')return runAction();if(typeof oldConfirm==='function')return oldConfirm.apply(this,arguments)};
  document.addEventListener('click',function(e){const btn=e.target.closest('[data-user-action]');if(btn){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openAction(btn.dataset.userId,btn.dataset.userAction);return}const row=e.target.closest('.admin-user-card-final[data-user-row]');if(row&&!e.target.closest('button')&&typeof openUserDetail==='function')openUserDetail(row.dataset.userRow)},true);
  let busy=false;async function autoRefresh(){if(busy||document.hidden)return;try{if((typeof currentView==='undefined'?'':currentView)!=='users')return;busy=true;await window.loadUsers()}finally{busy=false}}
  const oldShow=window.showView;window.showView=function(view){const result=oldShow&&oldShow.apply(this,arguments);if(view==='users')setTimeout(autoRefresh,0);return result};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)autoRefresh()});
  window.addEventListener('focus',autoRefresh);
  setInterval(autoRefresh,5000);
})();

/* ===== Shared localStorage bridge for Vite customer app ===== */
(function(){
  const keys=window.YAMADEN_STORAGE_KEYS||{APP_STATE:"yamaden-mobile-spa"};
  const STORAGE_KEY=keys.APP_STATE;
  const CUSTOMER_TO_ADMIN_STATUS={
    submitted:"untreated",
    received:"processing",
    processing:"processing",
    waiting_customer:"quoted",
    scheduled:"ordered",
    completed:"completed",
    cancelled:"lost"
  };
  const ADMIN_TO_CUSTOMER_STATUS={
    untreated:"submitted",
    processing:"processing",
    quoted:"waiting_customer",
    ordered:"scheduled",
    completed:"completed",
    lost:"cancelled"
  };
  const TIMELINE_MESSAGE_BY_STATUS={
    submitted:"request.timelineSubmitted",
    received:"request.timelineReceived",
    processing:"request.timelineProcessing",
    waiting_customer:"request.timelineWaiting",
    scheduled:"request.timelineScheduled",
    completed:"request.timelineCompleted",
    cancelled:"request.timelineCompleted"
  };
  function readState(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
      return raw&&raw.state?raw:{state:{}};
    }catch(e){
      return {state:{}};
    }
  }
  function writeState(raw){
    localStorage.setItem(STORAGE_KEY,JSON.stringify({state:raw.state||{},version:raw.version||0}));
  }
  function state(){
    return readState().state||{};
  }
  function savePatch(patch){
    const raw=readState();
    raw.state=Object.assign({},raw.state||{},patch);
    writeState(raw);
    return raw.state;
  }
  function timelineEvent(status,message){
    return {
      id:"tl-admin-"+Date.now()+"-"+Math.floor(Math.random()*1000),
      type:status,
      message:message||TIMELINE_MESSAGE_BY_STATUS[status]||TIMELINE_MESSAGE_BY_STATUS.submitted,
      createdAt:new Date().toLocaleString()
    };
  }
  function localUserToAdmin(user){
    if(!user)return null;
    return {
      _id:user.id,
      id:user.id,
      name:user.name||user.phone||"",
      phone:user.phone||"",
      email:user.email||"",
      company:user.companyName||user.accountType||"",
      customerType:user.accountType||"",
      projectName:user.projectName||"",
      province:user.address||"",
      status:user.status==="pendingApproval"?"pending":user.status,
      requestCount:Array.isArray(state().requests)?state().requests.length:0,
      source:"localStorage"
    };
  }
  function localRequestToAdmin(request){
    const user=state().user||{};
    return Object.assign({},request,{
      _id:request.id,
      requestId:request.id,
      name:request.createdBy||user.name||user.phone||"Customer",
      phone:user.phone||request.phone||"",
      email:user.email||request.email||"",
      content:request.description||request.title||"",
      category:request.category||request.title||"",
      location:request.address||"",
      status:CUSTOMER_TO_ADMIN_STATUS[request.status]||request.status||"untreated",
      source:"account",
      userId:user.id||request.userId||""
    });
  }
  function mergeById(apiRows,localRows){
    const map=new Map();
    (Array.isArray(apiRows)?apiRows:[]).forEach(item=>map.set(String(item._id||item.id||item.requestId),item));
    (Array.isArray(localRows)?localRows:[]).forEach(item=>map.set(String(item._id||item.id||item.requestId),item));
    return Array.from(map.values());
  }
  function localUsers(){
    const current=state().user;
    const all=Array.isArray(state().users)?state().users.slice():[];
    if(current&&current.status&&current.status!=="notLoggedIn"&&!all.some(user=>String(user.id)===String(current.id))){
      all.unshift(current);
    }
    return all.filter(user=>user&&user.status&&user.status!=="notLoggedIn").map(localUserToAdmin).filter(Boolean);
  }
  function localRequests(){
    return (Array.isArray(state().requests)?state().requests:[]).map(localRequestToAdmin);
  }
  function hasLocalUser(id){
    const current=state().user;
    const users=Array.isArray(state().users)?state().users:[];
    return !!((current&&String(current.id)===String(id))||users.some(user=>String(user.id)===String(id)));
  }
  function updateLocalUser(id,patch){
    const current=state().user;
    const users=Array.isArray(state().users)?state().users:[];
    const target=users.find(user=>String(user.id)===String(id))||(current&&String(current.id)===String(id)?current:null);
    if(!target)return false;
    const status=patch.status==="pending"?"pendingApproval":patch.status;
    const next=Object.assign({},target,patch,status?{status}:null);
    const nextUsers=users.some(user=>String(user.id)===String(id))
      ?users.map(user=>String(user.id)===String(id)?next:user)
      :[next].concat(users);
    const isCurrent=current&&String(current.id)===String(id);
    const authStatus=isCurrent&&status==="active"?"notLoggedIn":isCurrent&&status==="pendingApproval"?"pendingApproval":state().authStatus;
    savePatch(Object.assign({users:nextUsers},isCurrent?{user:next,authStatus}:{}));
    return true;
  }
  function removeLocalUser(id){
    const current=state().user;
    const users=Array.isArray(state().users)?state().users:[];
    if(!hasLocalUser(id))return false;
    const isCurrent=current&&String(current.id)===String(id);
    savePatch(Object.assign(
      {users:users.filter(user=>String(user.id)!==String(id))},
      isCurrent?{user:null,authStatus:"notLoggedIn"}:{}
    ));
    return true;
  }
  function applyLocalUserAction(id,action){
    if(!hasLocalUser(id))return false;
    if(action==="approve"||action==="reactivate"||action==="unblock")return updateLocalUser(id,{status:"active"});
    if(action==="block")return updateLocalUser(id,{status:"blocked"});
    if(action==="reject"||action==="delete"||action==="permanent")return removeLocalUser(id);
    return false;
  }
  function updateLocalRequest(id,patch){
    const current=Array.isArray(state().requests)?state().requests:[];
    let changed=false;
    const next=current.map(request=>{
      if(String(request.id)!==String(id))return request;
      changed=true;
      const status=patch.status?ADMIN_TO_CUSTOMER_STATUS[patch.status]||patch.status:request.status;
      const base=Object.assign({},request,patch,{status});
      delete base._id;
      delete base.requestId;
      delete base.name;
      delete base.phone;
      delete base.content;
      if(status!==request.status){
        base.timeline=[...(Array.isArray(request.timeline)?request.timeline:[]),timelineEvent(status)];
      }
      if(patch.status==="quoted"){
        upsertLocalQuoteForRequest(base);
      }
      return base;
    });
    if(changed)savePatch({requests:next});
    return changed;
  }
  function deleteLocalRequest(id){
    const current=Array.isArray(state().requests)?state().requests:[];
    const next=current.filter(request=>String(request.id)!==String(id));
    if(next.length!==current.length){
      savePatch({requests:next});
      return true;
    }
    return false;
  }
  function upsertLocalQuoteForRequest(request,patch){
    const current=Array.isArray(state().quotes)?state().quotes:[];
    const existing=current.find(quote=>String(quote.requestId)===String(request.id));
    const quote=Object.assign({
      id:existing?existing.id:"Q-"+new Date().getFullYear()+"-"+Math.floor(1000+Math.random()*9000),
      requestId:request.id,
      projectName:request.projectName||request.title||request.address||request.id,
      validUntil:"",
      status:"pending",
      items:[]
    },existing||{},patch||{});
    const next=existing?current.map(item=>String(item.id)===String(existing.id)?quote:item):[quote].concat(current);
    savePatch({quotes:next});
    return quote;
  }
  const oldNormalizeStatus=window.normalizeStatus||normalizeStatus;
  window.normalizeStatus=function(s){
    return oldNormalizeStatus(CUSTOMER_TO_ADMIN_STATUS[String(s||"").toLowerCase()]||s);
  };
  const oldLoadRequests=window.loadRequests||loadRequests;
  window.loadRequests=async function(){
    let apiRows=[];
    try{
      const res=await apiFetch(API+"/requests");
      if(res.status===401)return authFailLogout();
      if(res.ok){
        const data=await res.json();
        apiRows=Array.isArray(data)?data:(data.requests||[]);
      }
    }catch(e){}
    requests=mergeById(apiRows,localRequests());
    renderAll();
  };
  const oldUpdateStatus=window.updateStatus||updateStatus;
  window.updateStatus=async function(id,status){
    if(updateLocalRequest(id,{status})){
      requests=localRequests();
      renderAll();
      return;
    }
    return oldUpdateStatus(id,status);
  };
  window.createLocalQuote=function(requestId,quotePatch){
    const request=(Array.isArray(state().requests)?state().requests:[]).find(item=>String(item.id)===String(requestId));
    if(!request)return null;
    const quote=upsertLocalQuoteForRequest(request,quotePatch);
    updateLocalRequest(requestId,{status:"quoted"});
    return quote;
  };
  window.updateLocalQuote=function(id,quotePatch){
    const current=Array.isArray(state().quotes)?state().quotes:[];
    let found=false;
    const next=current.map(quote=>{
      if(String(quote.id)!==String(id))return quote;
      found=true;
      return Object.assign({},quote,quotePatch||{});
    });
    if(found)savePatch({quotes:next});
    return found;
  };
  const oldSaveReply=window.saveReply||saveReply;
  window.saveReply=async function(id){
    const box=$("reply-"+id);
    if(updateLocalRequest(id,{adminReply:box?box.value:""})){
      requests=localRequests();
      renderAll();
      return;
    }
    return oldSaveReply(id);
  };
  const oldConfirmDelete=window.confirmDelete||confirmDelete;
  window.confirmDelete=async function(){
    if(deleteMode==="stableUserAction"&&window.__stableUserAction){
      const item=window.__stableUserAction;
      if(applyLocalUserAction(item.id,item.action)){
        window.__stableUserAction=null;
        closeModal();
        window.loadUsers();
        return;
      }
    }
    if(deleteMode==="request"&&deleteId&&deleteLocalRequest(deleteId)){
      closeModal();
      requests=localRequests();
      renderAll();
      return;
    }
    return oldConfirmDelete.apply(this,arguments);
  };
  const oldLoadUsers=window.loadUsers||loadUsers;
  window.loadUsers=async function(){
    let apiRows=[];
    try{
      const sep=API.indexOf("?")>=0?"&":"?";
      const res=await apiFetch(API+"/admin/users"+sep+"_ts="+Date.now(),{cache:"no-store"});
      if(res.status===401)return authFailLogout();
      if(res.ok){
        const data=await res.json();
        apiRows=Array.isArray(data)?data:(data.users||[]);
      }
    }catch(e){}
    currentUsers=mergeById(apiRows,localUsers());
    window.currentUsers=currentUsers;
    if(typeof renderUsers==="function")renderUsers();
    const side=$("sideUsers");
    if(side)side.textContent=currentUsers.length;
    const final=$("finalUserCount");
    if(final)final.textContent=currentUsers.length;
  };
  const oldConfirmUserAction=window.confirmDelete;
  const originalOpenAction=window.__stableUserAction;
  document.addEventListener("click",function(e){
    const btn=e.target.closest("[data-user-action]");
    if(!btn)return;
    const id=btn.dataset.userId;
    const action=btn.dataset.userAction;
    if(!hasLocalUser(id))return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    applyLocalUserAction(id,action);
    window.loadUsers();
  },true);
  window.addEventListener("storage",function(e){
    if(e.key!==STORAGE_KEY)return;
    if((typeof currentView==="undefined"?currentView:"")==="users")window.loadUsers();
    window.loadRequests();
  });
})();
