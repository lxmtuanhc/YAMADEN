require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const https = require("https");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const distPath = path.join(__dirname, "dist");

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  if (!path.extname(req.path) || req.path.endsWith(".html")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }
  next();
});
app.use(express.static(distPath));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.get("/js/service-worker.js", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.sendFile(path.join(__dirname, "js", "service-worker.js"));
});
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/data", express.static(path.join(__dirname, "data")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/|^video\//.test(file.mimetype || "");
    cb(ok ? null : new Error("Only image or video files are allowed"), ok);
  }
});

const cloudinaryEnvReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (!cloudinaryEnvReady) {
  console.warn("[cloudinary] env missing", {
    CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET)
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || JWT_SECRET;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
const SLACK_ENABLED = process.env.SLACK_ENABLED === "true";
const ADMIN_URL = process.env.ADMIN_URL || "https://yamaden.onrender.com/admin.html";

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function getUserFromRequest(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token || !USER_JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(token, USER_JWT_SECRET);
    if (decoded && decoded.role === "user") return decoded;
  } catch {}

  return null;
}

function requireUser(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "User login required" });
  req.user = user;
  next();
}

function truncateText(text, max = 220) {
  const value = String(text || "").trim();
  return value.length > max ? value.slice(0, max - 3) + "..." : value;
}

function postSlackMessage(text) {
  if (!SLACK_ENABLED || !SLACK_WEBHOOK_URL) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text });
    const url = new URL(SLACK_WEBHOOK_URL);

    const req = https.request({
      method: "POST",
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, res => {
      res.resume();
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve();
        else reject(new Error("Slack webhook failed: " + res.statusCode));
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function notifySlack(text) {
  postSlackMessage(text).catch(error => {
    console.log("Slack notify error:", error.message);
  });
}

const RequestSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  requestCode: String,
  requestId: String,
  userId: String,
  name: String,
  phone: String,
  contact: String,
  address: String,
  title: String,
  category: String,
  content: String,
  image: String,
  mediaUrl: String,
  mediaType: String,
  mediaFiles: [{ url: String, type: { type: String } }],
  status: String,
  adminReply: String,
  createdAt: Date,
  firstResponseAt: Date,
  contactedAt: Date,
  siteVisitedAt: Date,
  quotedAt: Date,
  orderedAt: Date,
  completedAt: Date,
  lostAt: Date,
  assigneeId: String,
  assigneeName: String,
  issueTags: [String],
  quoteRequested: Boolean,
  timeline: [{
    id: String,
    type: String,
    message: String,
    note: String,
    createdAt: Date
  }]
});

const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  contact: String,
  company: String,
  customerType: String,
  province: String,
  projectName: String,
  address: String,
  note: String,
  pinHash: String,
  profileCompleted: { type: Boolean, default: false },
  status: { type: String, default: "pendingApproval" },
  createdAt: Date,
  approvedAt: Date,
  deletedAt: Date,
  reactivatedAt: Date,
  lastLoginAt: Date
});

const StaffSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  phone: String,
  email: String,
  areas: String,
  skills: String,
  department: String,
  workContent: String,
  workTags: [String],
  status: { type: String, default: "active" },
  createdAt: Date
});

const Request = mongoose.model("Request", RequestSchema);
const User = mongoose.model("User", UserSchema);
const Staff = mongoose.model("Staff", StaffSchema);

const USER_STATUS_PENDING = "pendingApproval";

function normalizeUserStatus(status) {
  if (status === "pending") return USER_STATUS_PENDING;
  return status || USER_STATUS_PENDING;
}

function publicUser(user) {
  const item = user.toObject ? user.toObject() : { ...user };
  item.id = String(item._id || item.id || "");
  item.status = normalizeUserStatus(item.status);
  delete item.pinHash;
  return item;
}

function makeIdQuery(id) {
  const query = [{ id }, { requestCode: id }, { requestId: id }];
  if (!isNaN(Number(id))) query.push({ id: Number(id) });
  if (mongoose.Types.ObjectId.isValid(id)) query.push({ _id: id });
  return { $or: query };
}

async function generateRequestCode() {
  let code;
  let exists;

  do {
    code = "YMD-" + Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    exists = await Request.findOne({
      $or: [
        { requestCode: code },
        { requestId: code },
        { id: code }
      ]
    });
  } while (exists);

  return code;
}

async function ensureRequestCode(item) {
  if (!item) return "";
  if (item.requestCode && /^YMD-\d{6}$/.test(String(item.requestCode))) {
    if (!item.requestId) item.requestId = item.requestCode;
    return item.requestCode;
  }

  const code = await generateRequestCode();
  item.requestCode = code;
  item.requestId = code;
  return code;
}

function uploadMediaToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "yamaden_requests", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

function requestUploadMiddleware(req, res, next) {
  upload.array("image", 12)(req, res, error => {
    if (!error) return next();

    const isMulterError = error instanceof multer.MulterError;
    console.error("[request:create] multer failed before handler", {
      method: req.method,
      path: req.path,
      expectedField: "image",
      code: error.code || "UPLOAD_ERROR",
      message: error.message,
      field: error.field,
      contentType: req.headers["content-type"] || "",
      contentLength: req.headers["content-length"] || ""
    });

    return res.status(isMulterError ? 400 : 415).json({
      success: false,
      code: error.code || "UPLOAD_ERROR",
      message: "Upload failed",
      error: error.message,
      field: error.field
    });
  });
}

function normalizeRequestStatus(status) {
  if (status === "pending") return "untreated";
  if (status === "received") return "contacted";
  if (status === "waiting_customer") return "estimating";
  if (status === "scheduled") return "ordered";
  if (status === "cancelled") return "lost";
  if (status === "completed") return "completed";
  return status || "untreated";
}

const REQUEST_STATUS_TIMESTAMPS = {
  contacted: ["firstResponseAt", "contactedAt"],
  processing: ["firstResponseAt", "contactedAt"],
  estimating: ["firstResponseAt"],
  site_done: ["siteVisitedAt"],
  quoted: ["quotedAt"],
  ordered: ["orderedAt"],
  completed: ["completedAt"],
  lost: ["lostAt"]
};

const REQUEST_STATUS_TO_CUSTOMER = {
  untreated: "submitted",
  contacted: "received",
  processing: "processing",
  site_done: "processing",
  estimating: "waiting_customer",
  quoted: "waiting_customer",
  ordered: "scheduled",
  completed: "completed",
  lost: "cancelled"
};

const CUSTOMER_TIMELINE_MESSAGES = {
  submitted: "request.timelineSubmitted",
  received: "request.timelineReceived",
  processing: "request.timelineProcessing",
  waiting_customer: "request.timelineWaiting",
  scheduled: "request.timelineScheduled",
  completed: "request.timelineCompleted",
  cancelled: "status.cancelled"
};

function customerStatus(status) {
  return REQUEST_STATUS_TO_CUSTOMER[status] || REQUEST_STATUS_TO_CUSTOMER[normalizeRequestStatus(status)] || status || "submitted";
}

function mergeStatusTimeline(item, status, note) {
  const type = customerStatus(status);
  const message = CUSTOMER_TIMELINE_MESSAGES[type] || "request.timelineSubmitted";
  const existing = Array.isArray(item.timeline) ? item.timeline : [];
  item.timeline = existing
    .filter(event => event && event.type !== type)
    .concat([{
      id: "tl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      type,
      message,
      note: String(note || "").trim(),
      createdAt: new Date()
    }]);
}

function applyStatusTimestamps(item, nextStatus) {
  const normalized = normalizeRequestStatus(nextStatus);
  const now = new Date();
  const fields = REQUEST_STATUS_TIMESTAMPS[normalized] || [];
  fields.forEach(field => {
    if (!item[field]) item[field] = now;
  });
}

const ASSIGNMENT_TAG_MAP = Object.freeze({
  "Thiết kế bản vẽ điện": "電気図面設計",
  "電気図面設計": "電気図面設計",
  "Thiết kế tủ điện": "盤設計",
  "盤設計": "盤設計",
  "Thiết kế chiếu sáng": "照明設計",
  "照明設計": "照明設計",
  "Tính tải điện": "電気容量計算",
  "電気容量計算": "電気容量計算",
  "Bóc tách vật tư": "材料拾い出し",
  "材料拾い出し": "材料拾い出し",
  "Lập bản vẽ hoàn công": "竣工図作成",
  "竣工図作成": "竣工図作成",
  "Kiểm tra bản vẽ": "図面チェック",
  "図面チェック": "図面チェック",
  "Chuẩn bị vật tư": "材料準備",
  "材料準備": "材料準備",
  "Điều phối công trình": "現場調整",
  "現場調整": "現場調整",
  "Quản lý tiến độ": "工程管理",
  "工程管理": "工程管理",
  "Đặt hàng vật tư": "材料発注",
  "材料発注": "材料発注",
  "Kiểm tra tồn kho": "在庫確認",
  "在庫確認": "在庫確認",
  "Sắp xếp lịch thi công": "施工スケジュール",
  "施工スケジュール": "施工スケジュール",
  "Hỗ trợ hiện trường": "現場サポート",
  "現場サポート": "現場サポート",
  "Tư vấn khách hàng": "顧客相談",
  "顧客相談": "顧客相談",
  "Báo giá": "見積作成",
  "見積作成": "見積作成",
  "Theo dõi hợp đồng": "契約フォロー",
  "契約フォロー": "契約フォロー",
  "Chăm sóc khách hàng": "顧客対応",
  "顧客対応": "顧客対応",
  "Thi công điện": "電気工事",
  "電気工事": "電気工事",
  "Đi dây điện": "配線工事",
  "配線工事": "配線工事",
  "Lắp ổ cắm": "コンセント取付",
  "コンセント取付": "コンセント取付",
  "Lắp đèn": "照明取付",
  "照明取付": "照明取付",
  "Lắp tủ điện": "分電盤工事",
  "分電盤工事": "分電盤工事",
  "Xử lý mất điện": "停電対応",
  "停電対応": "停電対応",
  "Xử lý rò điện": "漏電対応",
  "漏電対応": "漏電対応",
  "Kiểm tra hiện trường": "現場確認",
  "現場確認": "現場確認",
  "Sửa breaker": "ブレーカー修理",
  "ブレーカー修理": "ブレーカー修理",
  "Bảo trì định kỳ": "定期メンテナンス",
  "定期メンテナンス": "定期メンテナンス",
  "Kiểm tra sau thi công": "施工後点検",
  "施工後点検": "施工後点検",
  "Xử lý sự cố": "トラブル対応",
  "トラブル対応": "トラブル対応",
  "Bảo hành": "保証対応",
  "保証対応": "保証対応",
  "Kiểm tra thiết bị": "設備点検",
  "設備点検": "設備点検",
  "Hỗ trợ khách hàng": "顧客サポート",
  "顧客サポート": "顧客サポート",
  "Bảo trì tủ điện": "分電盤メンテナンス",
  "分電盤メンテナンス": "分電盤メンテナンス"
});

function normalizeAssignmentTag(tag) {
  const clean = String(tag || "").trim();
  return ASSIGNMENT_TAG_MAP[clean] || clean;
}

function normalizeTagList(list) {
  const values = (Array.isArray(list) ? list : [])
    .map(normalizeAssignmentTag)
    .map(item => String(item || "").trim())
    .filter(Boolean);

  return Array.from(new Set(values));
}

function parseRequestTags(value) {
  if (Array.isArray(value)) return normalizeTagList(value);

  const raw = String(value || "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return normalizeTagList(parsed);
  } catch {}

  return normalizeTagList(raw.split(/[,、\n]/));
}

function staffTags(staff) {
  const fromArray = Array.isArray(staff.workTags) ? staff.workTags : [];
  const fromText = [staff.skills, staff.workContent, staff.areas, staff.department]
    .join(",")
    .split(/[,、\n]/);

  return normalizeTagList(fromArray.concat(fromText));
}

function uniqueStaffWorkOptions(staffList) {
  const seen = new Set();
  const options = [];

  staffList.forEach(staff => {
    const values = normalizeTagList(
      (Array.isArray(staff.workTags) ? staff.workTags : [])
        .concat(parseRequestTags(staff.workContent))
        .concat(parseRequestTags(staff.skills))
    );

    values.forEach(value => {
      const key = value.toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      options.push(value);
    });
  });

  return options.sort((a, b) => a.localeCompare(b, "ja"));
}

async function findBestAssignee(issueTags) {
  const tags = parseRequestTags(issueTags);
  if (!tags.length) return null;

  const staffList = await Staff.find();
  let best = null;
  let bestScore = 0;

  staffList.forEach(staff => {
    const list = staffTags(staff);
    const score = tags.filter(tag => list.includes(tag)).length;

    if (score > bestScore) {
      bestScore = score;
      best = staff;
    }
  });

  if (!best || bestScore <= 0) return null;
  return best;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/admin/login", (req, res) => {
  const password = req.body.password || "";

  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(500).json({ message: "Admin login is not configured" });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
  res.json({ message: "Login success", token });
});

app.post("/user/register", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();

    if (!phone || !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({
        message: "Phone and 4-6 digit PIN are required"
      });
    }

    let user = await User.findOne({ phone });

    const wasDeleted = user && user.status === "deleted";

    if (user && user.pinHash && !wasDeleted) {
      const ok = await bcrypt.compare(pin, user.pinHash);

      if (!ok) {
        return res.status(409).json({
          message: "Phone is already registered"
        });
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = jwt.sign(
        { role: "user", userId: String(user._id), phone: user.phone },
        USER_JWT_SECRET,
        { expiresIn: "180d" }
      );

      return res.json({
        message: "Already registered",
        token,
        user: publicUser(user)
      });
    }

    user = user || new User({ phone });

    user.phone = phone;
    user.pinHash = await bcrypt.hash(pin, 10);
    user.status = USER_STATUS_PENDING;
    user.deletedAt = undefined;
    user.reactivatedAt = wasDeleted ? new Date() : user.reactivatedAt;
    user.createdAt = new Date();
    if (wasDeleted) {
      user.name = "";
      user.email = "";
      user.contact = "";
      user.company = "";
      user.customerType = "";
      user.province = "";
      user.projectName = "";
      user.address = "";
      user.note = "";
    }
    user.profileCompleted = Boolean(user.name && user.email && user.province && user.projectName);
    user.lastLoginAt = new Date();

    await user.save();

    notifySlack(
      "*YAMADEN - User mới đăng ký*\n" +
      "SĐT: " + user.phone + "\n" +
      "Trạng thái: " + (user.status || USER_STATUS_PENDING) + "\n" +
      "Admin: " + ADMIN_URL
    );

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({
      message: "Register success",
      token,
      user: publicUser(user)
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Register failed",
      error: error.message
    });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();

    if (!phone || !pin) {
      return res.status(400).json({ message: "Phone and PIN are required" });
    }

    const user = await User.findOne({ phone });

    if (!user || !user.pinHash) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    if (user.status === "deleted") {
      return res.status(403).json({ message: "User was deleted. Please register again." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "User is blocked" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({
      message: "Login success",
      token,
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

app.put("/user/profile", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    ["name", "phone", "email", "company", "province", "projectName", "address", "contact", "note"].forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = String(req.body[field] || "").trim();
      }
    });

    user.profileCompleted = Boolean(user.name && user.email && user.province && user.projectName);
    if (user.status !== "active") user.status = USER_STATUS_PENDING;
    await user.save();

    notifySlack(
      "*YAMADEN - Khách hàng cập nhật hồ sơ*\n" +
      "Tên: " + (user.name || "-") + "\n" +
      "SĐT: " + (user.phone || "-") + "\n" +
      "Email: " + (user.email || "-") + "\n" +
      "Khu vực: " + (user.province || "-") + "\n" +
      "Liên hệ: " + (user.contact || "-") + "\n" +
      "Địa chỉ: " + (user.address || "-") + "\n" +
      "Công trình: " + (user.projectName || "-") + "\n" +
      "Công ty/cá nhân: " + (user.company || "-") + "\n" +
      "Ghi chú: " + (user.note || "-") + "\n" +
      "Trạng thái: " + (user.status || USER_STATUS_PENDING) + "\n" +
      "Admin: " + ADMIN_URL
    );

    res.json({
      message: "Profile updated",
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
});

app.get("/user/me", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(publicUser(user));
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/user/requests", requireUser, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const users = await User.find().sort({ createdAt: -1 });

    const counts = await Request.aggregate([
      { $match: { userId: { $ne: "" } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map(item => [String(item._id), item.count]));

    res.json(users.map(user => {
      const item = publicUser(user);
      item.requestCount = countMap.get(String(user._id)) || 0;
      return item;
    }));

  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.patch("/api/admin/users/:id/approve", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "active";
    if (!user.approvedAt) user.approvedAt = new Date();
    user.deletedAt = undefined;
    await user.save();

    res.json({
      data: publicUser(user),
      message: "Approved"
    });

  } catch (error) {
    res.status(500).json({ message: "Approve failed", error: error.message });
  }
});

app.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const users = await User.find().sort({ createdAt: -1 });

    const counts = await Request.aggregate([
      { $match: { userId: { $ne: "" } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);

    const countMap = new Map(counts.map(item => [String(item._id), item.count]));

    res.json(users.map(user => {
      const item = publicUser(user);
      item.requestCount = countMap.get(String(user._id)) || 0;
      return item;
    }));

  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/admin/users/:id/requests", requireAdmin, async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const previousStatus = user.status;

    ["name", "phone", "email", "contact", "company", "customerType", "province", "projectName", "address", "note", "status"].forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });
    user.status = normalizeUserStatus(user.status);
    if ((previousStatus === "pending" || previousStatus === USER_STATUS_PENDING) && req.body.status === "active" && !user.approvedAt) {
      user.approvedAt = new Date();
    }
    if (req.body.status && req.body.status !== "deleted") {
      user.deletedAt = undefined;
      user.reactivatedAt = new Date();
    }

    await user.save();

    res.json({
      message: "Updated",
      data: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
});

app.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.query.permanent === "true" || user.status === "pending" || user.status === USER_STATUS_PENDING) {
      await Request.updateMany({ userId }, { $set: { userId: "" } });
      await User.deleteOne({ _id: userId });
      return res.json({ message: "User permanently deleted" });
    }

    user.status = "deleted";
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: "User marked as deleted", data: publicUser(user) });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
});

app.get("/admin/staff", requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({
      message: "Staff load failed",
      error: error.message
    });
  }
});

app.post("/admin/staff", requireAdmin, upload.single("avatar"), async (req, res) => {
  try {
    const workTags = Array.isArray(req.body.workTags)
      ? req.body.workTags.map(item => String(item || "").trim()).filter(Boolean)
      : parseRequestTags(req.body.workTags);

    let avatar = req.body.avatar || "";

    if (req.file) {
      const uploadResult = await uploadMediaToCloudinary(req.file.buffer);
      avatar = uploadResult.secure_url || "";
    }

    const staff = new Staff({
      name: req.body.name || "",
      avatar,
      phone: req.body.phone || "",
      email: req.body.email || "",
      areas: req.body.areas || req.body.department || "",
      skills: req.body.skills || req.body.workContent || workTags.join(", "),
      department: req.body.department || req.body.areas || "",
      workContent: req.body.workContent || req.body.skills || workTags.join(", "),
      workTags,
      status: req.body.status || "active",
      createdAt: new Date()
    });

    await staff.save();
    res.json(staff);

  } catch (error) {
    res.status(500).json({
      message: "Staff create failed",
      error: error.message
    });
  }
});

app.put("/admin/staff/:id", requireAdmin, upload.single("avatar"), async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    ["name", "phone", "email", "areas", "skills", "department", "workContent", "status"].forEach(field => {
      if (req.body[field] !== undefined) staff[field] = req.body[field];
    });

    if (req.body.workTags !== undefined) {
      staff.workTags = Array.isArray(req.body.workTags)
        ? req.body.workTags.map(item => String(item || "").trim()).filter(Boolean)
        : parseRequestTags(req.body.workTags);
    }

    if (req.body.avatar !== undefined) staff.avatar = req.body.avatar || "";

    if (req.file) {
      const uploadResult = await uploadMediaToCloudinary(req.file.buffer);
      staff.avatar = uploadResult.secure_url || "";
    }

    await staff.save();
    res.json(staff);

  } catch (error) {
    res.status(500).json({
      message: "Staff update failed",
      error: error.message
    });
  }
});

app.delete("/admin/staff/:id", requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await Staff.deleteOne({ _id: req.params.id });
    await Request.updateMany(
      { assigneeId: req.params.id },
      { $set: { assigneeId: "", assigneeName: "" } }
    );

    res.json({ message: "Deleted" });

  } catch (error) {
    res.status(500).json({
      message: "Staff delete failed",
      error: error.message
    });
  }
});

app.get("/api/work-options", requireUser, async (req, res) => {
  try {
    const staff = await Staff.find({ status: { $ne: "off" } }).sort({ createdAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: uniqueStaffWorkOptions(staff) });
  } catch (error) {
    res.status(500).json({
      message: "Work options load failed",
      error: error.message
    });
  }
});

app.post("/request", requireUser, requestUploadMiddleware, async (req, res) => {
  try {
    const requestCode = await generateRequestCode();

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is waiting for admin approval"
      });
    }

    const mediaFiles = [];
    const files = Array.isArray(req.files) ? req.files : [];
    console.info("[request:create] multipart debug", {
      requestCode,
      method: req.method,
      path: req.path,
      contentType: req.headers["content-type"] || "",
      contentLength: req.headers["content-length"] || "",
      bodyKeys: Object.keys(req.body || {}),
      hasReqFile: Boolean(req.file),
      hasReqFiles: Boolean(req.files),
      reqFilesLength: files.length,
      multerField: "image",
      cloudinaryEnv: {
        CLOUDINARY_CLOUD_NAME: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
        CLOUDINARY_API_KEY: Boolean(process.env.CLOUDINARY_API_KEY),
        CLOUDINARY_API_SECRET: Boolean(process.env.CLOUDINARY_API_SECRET)
      },
      files: files.map(file => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: Boolean(file.buffer),
        bufferLength: file.buffer ? file.buffer.length : 0
      }))
    });

    if ((req.headers["content-type"] || "").includes("multipart/form-data") && files.length === 0) {
      console.warn("[request:create] multipart request contained no multer files", {
        requestCode,
        expectedField: "image",
        bodyKeys: Object.keys(req.body || {})
      });
    }

    const CONCURRENT_LIMIT = 3;
    for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
      const batch = files.slice(i, i + CONCURRENT_LIMIT);
      const results = await Promise.all(batch.map(async file => {
        try {
          console.info("[request:create] cloudinary upload start", {
            requestCode,
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: Boolean(file.buffer)
          });
          const uploadResult = await uploadMediaToCloudinary(file.buffer);
          const type = uploadResult.resource_type === "video" || (file.mimetype || "").startsWith("video/")
            ? "video"
            : "image";

          return {
            url: uploadResult.secure_url,
            type
          };

        } catch (uploadError) {
          console.error("[request:create] cloudinary upload failed", {
            requestCode,
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            code: uploadError.http_code || uploadError.code,
            http_code: uploadError.http_code,
            name: uploadError.name,
            message: uploadError.message
          });
          return null;
        }
      }));

      results.filter(result => result !== null).forEach(result => mediaFiles.push(result));
    }

    const firstMedia = mediaFiles[0] || { url: "", type: "" };
    const issueTags = parseRequestTags(req.body.issueTags);
    const bestAssignee = await findBestAssignee(issueTags);

    const newRequest = new Request({
      id: requestCode,
      requestCode,
      requestId: requestCode,
      userId: String(user._id),
      name: req.body.name || user.name || "",
      phone: req.body.phone || user.phone || "",
      contact: req.body.contact || user.contact || "",
      address: req.body.address || user.address || "",
      title: req.body.title || "",
      category: req.body.category || "",
      content: req.body.content || "",
      image: firstMedia.type === "image" ? firstMedia.url : "",
      mediaUrl: firstMedia.url,
      mediaType: firstMedia.type,
      mediaFiles,
      issueTags,
      quoteRequested: req.body.quoteRequested === "true" || req.body.quoteRequested === true,
      assigneeId: bestAssignee ? String(bestAssignee._id) : "",
      assigneeName: bestAssignee ? bestAssignee.name : "",
      status: "untreated",
      adminReply: "",
      timeline: [{
        id: "tl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        type: "submitted",
        message: "request.timelineSubmitted",
        note: "",
        createdAt: new Date()
      }],
      createdAt: new Date()
    });

    await newRequest.save();

    const mediaSummary = mediaFiles.length > 0
      ? mediaFiles.length + " file (" + mediaFiles.map(file => file.type).join(", ") + ")"
      : "Không có";

    notifySlack(
      "*YAMADEN - Yêu cầu mới*\n" +
      "ID: " + requestCode + "\n" +
      "Nguồn: Tài khoản khách hàng\n" +
      "Tên: " + (newRequest.name || "-") + "\n" +
      "SĐT: " + (newRequest.phone || "-") + "\n" +
      "Địa chỉ: " + (newRequest.address || "-") + "\n" +
      "Nội dung: " + truncateText(newRequest.content) + "\n" +
      "Ảnh/video: " + mediaSummary + "\n" +
      "Admin: " + ADMIN_URL
    );

    res.json({
      message: "Saved to MongoDB",
      data: newRequest
    });

  } catch (error) {
    console.error("[request:create] save failed", {
      name: error.name,
      code: error.code,
      message: error.message,
      errors: error.errors ? Object.keys(error.errors) : undefined
    });
    res.status(500).json({
      success: false,
      code: error.name === "ValidationError" ? "MONGOOSE_VALIDATION_FAILED" : "REQUEST_SAVE_FAILED",
      message: "Save failed",
      error: error.message
    });
  }
});

app.get("/requests", requireAdmin, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    for (const request of requests) {
      if (!request.requestCode) {
        await ensureRequestCode(request);
        await request.save();
      }
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/request/:id", async (req, res) => {
  try {
    const item = await Request.findOne(makeIdQuery(req.params.id));

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    if (!item.requestCode) {
      await ensureRequestCode(item);
      await item.save();
    }

    res.json(item);

  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.put("/request/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Request.findOne(makeIdQuery(req.params.id));

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    if (!item.requestCode) await ensureRequestCode(item);

    if (req.body.status) {
      item.status = normalizeRequestStatus(req.body.status);
      applyStatusTimestamps(item, item.status);
      mergeStatusTimeline(item, item.status, req.body.adminReply);
    }

    if (req.body.assigneeId !== undefined) item.assigneeId = req.body.assigneeId;
    if (req.body.assigneeName !== undefined) item.assigneeName = req.body.assigneeName;

    if (req.body.adminReply !== undefined) {
      item.adminReply = req.body.adminReply;

      if (!item.firstResponseAt && String(req.body.adminReply || "").trim()) {
        item.firstResponseAt = new Date();
      }

      if (!req.body.status && String(req.body.adminReply || "").trim()) {
        mergeStatusTimeline(item, item.status, req.body.adminReply);
      }
    }

    await item.save();

    res.json({
      message: "Updated",
      data: item
    });

  } catch (error) {
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
});

app.delete("/request/:id", requireAdmin, async (req, res) => {
  try {
    const result = await Request.deleteOne(makeIdQuery(req.params.id));

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();

    if (!phone || !/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ message: "Phone and 4-6 digit PIN are required" });
    }

    let user = await User.findOne({ phone });
    const wasDeleted = user && user.status === "deleted";

    if (user && user.pinHash && !wasDeleted) {
      const ok = await bcrypt.compare(pin, user.pinHash);
      if (!ok) return res.status(409).json({ message: "Phone is already registered" });
    }

    user = user || new User({ phone });
    user.phone = phone;
    user.pinHash = await bcrypt.hash(pin, 10);
    user.status = USER_STATUS_PENDING;
    user.profileCompleted = false;
    user.deletedAt = undefined;
    user.reactivatedAt = wasDeleted ? new Date() : user.reactivatedAt;
    user.createdAt = user.createdAt || new Date();
    user.lastLoginAt = new Date();

    if (wasDeleted) {
      user.name = "";
      user.email = "";
      user.contact = "";
      user.company = "";
      user.customerType = "";
      user.province = "";
      user.projectName = "";
      user.address = "";
      user.note = "";
    }

    await user.save();

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({
      data: {
        user: publicUser(user),
        token,
        status: "profileIncomplete"
      }
    });

  } catch (error) {
    console.log("API REGISTER ERROR:", error);
    res.status(500).json({ message: "Register failed", error: error.message });
  }
});

app.post("/api/auth/profile", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = String(req.body.name || "").trim();
    user.phone = String(req.body.phone || user.phone || "").trim();
    user.email = String(req.body.email || "").trim();
    user.address = String(req.body.address || "").trim();
    user.province = user.address;
    user.projectName = String(req.body.projectName || "").trim();
    user.customerType = String(req.body.companyType || req.body.accountType || "personal").trim();
    user.company = String(req.body.companyName || "").trim();
    user.contact = String(req.body.contactPerson || "").trim();
    user.profileCompleted = Boolean(user.name && user.email && user.address && user.projectName);
    if (user.status !== "active") user.status = USER_STATUS_PENDING;

    await user.save();

    res.json({
      data: {
        user: publicUser(user),
        status: normalizeUserStatus(user.status)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    if (!USER_JWT_SECRET) {
      return res.status(500).json({ message: "User login is not configured" });
    }

    const phone = String(req.body.phone || "").trim();
    const pin = String(req.body.pin || "").trim();
    const user = await User.findOne({ phone });

    if (!user || !user.pinHash) return res.status(401).json({ message: "Invalid phone or PIN" });

    const ok = await bcrypt.compare(pin, user.pinHash);
    if (!ok) return res.status(401).json({ message: "Invalid phone or PIN" });

    if (user.status === "deleted") return res.status(403).json({ message: "User was deleted. Please register again." });
    if (user.status === "blocked") return res.status(403).json({ message: "User is blocked" });

    user.status = normalizeUserStatus(user.status);
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { role: "user", userId: String(user._id), phone: user.phone },
      USER_JWT_SECRET,
      { expiresIn: "180d" }
    );

    res.json({
      data: {
        user: publicUser(user),
        token,
        status: normalizeUserStatus(user.status)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.get("*", (req, res, next) => {
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error("[request:create] multer upload failed", {
      field: "image",
      code: error.code,
      message: error.message,
      contentType: req.headers["content-type"] || "",
      contentLength: req.headers["content-length"] || "",
      limitBytes: 50 * 1024 * 1024
    });
    return res.status(400).json({
      message: "Upload failed",
      code: error.code,
      error: error.message,
      limitBytes: error.code === "LIMIT_FILE_SIZE" ? 50 * 1024 * 1024 : undefined
    });
  }

  if (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }

  next();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
