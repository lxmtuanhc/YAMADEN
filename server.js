require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createQuotationPdf, normalizeQuoteForPdf, quotePdfFileName } = require("./lib/quotationPdf");
const { sendMail } = require("./server/mail/mailProvider");
const {
  uploadConfig,
  mb,
  customerFileKind,
  customerFileLimitBytes,
  extensionOf,
  isCustomerFileAllowed,
  isQuoteFileAllowed
} = require("./uploadConfig");

const app = express();
const distPath = path.join(__dirname, "dist");
const quoteUploadDir = path.join(__dirname, "uploads", "quote-files");
fs.mkdirSync(quoteUploadDir, { recursive: true });

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/js/service-worker.js", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.sendFile(path.join(__dirname, "js", "service-worker.js"));
});
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/data", express.static(path.join(__dirname, "data")));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: mb(uploadConfig.VIDEO_MAX_SIZE_MB),
    files: uploadConfig.CUSTOMER_MAX_FILES
  },
  fileFilter: (req, file, cb) => {
    const ok = isCustomerFileAllowed(file);
    cb(ok ? null : new Error(`File ${file.originalname} không được hỗ trợ.`), ok);
  }
});

const quoteFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: mb(uploadConfig.QUOTE_MAX_FILE_SIZE_MB),
    files: uploadConfig.QUOTE_MAX_FILES
  },
  fileFilter: (req, file, cb) => {
    const ok = isQuoteFileAllowed(file);
    cb(ok ? null : new Error("File báo giá không được hỗ trợ."), ok);
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
const SLACK_ENABLED = false;
const ADMIN_URL = process.env.ADMIN_URL || "https://yamaden.onrender.com/admin.html";
const MAIL_PROVIDER = process.env.MAIL_PROVIDER || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const MAIL_FROM = process.env.MAIL_FROM || "";

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedWorkMasterData().catch(error => console.log("Work master seed error:", error.message));
    cleanupExpiredDeletedItems();
    setInterval(cleanupExpiredDeletedItems, 6 * 60 * 60 * 1000).unref?.();
  })
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

async function requireUser(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: "User login required" });
  try {
    const account = await User.findById(user.userId);
    if (!account) return res.status(401).json({ message: "User not found" });
    if (account.status === "blocked") {
      return res.status(403).json({
        error: "ACCOUNT_BLOCKED",
        message: "Account is blocked. Please contact YAMADEN support."
      });
    }
    if (account.status === "deleted") {
      return res.status(403).json({
        error: "ACCOUNT_DELETED",
        message: "This account is deleted or inactive."
      });
    }
    req.user = user;
    req.accountUser = account;
    next();
  } catch (error) {
    next(error);
  }
}

function truncateText(text, max = 220) {
  const value = String(text || "").trim();
  return value.length > max ? value.slice(0, max - 3) + "..." : value;
}

function formatMailDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

function mailValue(value, fallback = "-") {
  const text = String(value || "").trim();
  return text || fallback;
}

function requestStatusForMail(request) {
  return mailValue(request?.status || request?.quoteStatus || "");
}

async function sendEmailNotification({ to = ADMIN_NOTIFICATION_EMAIL, subject, text, html, eventType = "", requestCode = "" }) {
  console.log("[MAIL_EVENT_START]", {
    eventType,
    requestCode
  });
  const recipient = String(to || "").trim();
  console.log("[MAIL_RECIPIENT_RESOLVED]", {
    eventType,
    requestCode,
    to: recipient
  });
  if (!recipient) {
    console.log("[MAIL_SKIP] Email not found");
    return { status: "skipped", provider: MAIL_PROVIDER || "none", reason: "RECIPIENT_NOT_FOUND" };
  }

  const result = await sendMail({ to: recipient, subject, html, text, eventType, requestCode });
  const logPayload = {
    provider: result.provider,
    status: result.status,
    reason: result.reason,
    errorCode: result.errorCode,
    errorMessage: result.errorMessage,
    recipient: Boolean(recipient)
  };
  if (result.status === "sent") {
    console.log("[MAIL_SENT] Notification sent", logPayload);
  } else if (result.status === "skipped") {
    console.log("[MAIL_SKIP] Notification skipped", logPayload);
  } else {
    console.log("[MAIL_ERROR] Failed to send notification", logPayload);
  }
  return result;
}

async function requestNotificationContext(request) {
  const requestNo = getRequestDisplayId(request) || request?.requestCode || request?.id || "";
  const emailResult = await getCustomerNotificationEmail(request);
  const user = emailResult.user;
  return {
    requestNo,
    customerName: request?.name || user?.name || "",
    companyName: user?.company || user?.companyName || user?.projectName || "",
    phone: request?.phone || user?.phone || "",
    customerEmail: emailResult.email,
    address: request?.address || user?.address || "",
    title: request?.title || request?.content || request?.category || "",
    content: request?.content || request?.title || request?.category || "",
    status: requestStatusForMail(request),
    adminNote: request?.adminReply || request?.note || "",
    hasAttachments: normalizeRequestMediaForMail(request).length > 0
  };
}

function getCustomerProfileIds(request) {
  const ids = [
    request?.customerId,
    request?.userId,
    request?.customer?._id,
    request?.customer?.id,
    request?.user?._id,
    request?.user?.id
  ].map(id => String(id || "").trim()).filter(Boolean);
  return [...new Set(ids)];
}

async function findCustomerProfileForRequest(request) {
  const profileIds = getCustomerProfileIds(request).filter(id => mongoose.Types.ObjectId.isValid(id));
  for (const profileId of profileIds) {
    const user = await User.findById(profileId).lean().catch(error => {
      console.log("[CUSTOMER_EMAIL_PROFILE_LOOKUP_FAILED]", {
        customerId: profileId,
        message: error.message
      });
      return null;
    });
    if (user) return { found: true, user };
  }
  return { found: false, user: null };
}

function getCustomerSnapshotEmail(request) {
  const contact = String(request?.contact || "").trim();
  return String(
    request?.customer?.email ||
    request?.user?.email ||
    request?.customerEmail ||
    request?.contactEmail ||
    request?.email ||
    (contact.includes("@") ? contact : "") ||
    ""
  ).trim();
}

function getCustomerEmail(request, user = null) {
  return String(user?.email || getCustomerSnapshotEmail(request)).trim();
}

async function getCustomerNotificationEmail(request) {
  const profile = await findCustomerProfileForRequest(request);
  if (profile.found) {
    return {
      email: String(profile.user?.email || "").trim(),
      source: "user_profile",
      user: profile.user
    };
  }
  const email = getCustomerSnapshotEmail(request);
  return {
    email,
    source: email ? "request_snapshot" : "not_found",
    user: null
  };
}

async function publicRequestWithLatestCustomerEmail(request) {
  const item = typeof request?.toObject === "function" ? request.toObject() : { ...(request || {}) };
  const emailResult = await getCustomerNotificationEmail(item);
  if (emailResult.source === "user_profile" || emailResult.email) {
    const customer = item.customer && typeof item.customer === "object" ? item.customer : {};
    const user = item.user && typeof item.user === "object" ? item.user : {};
    item.latestCustomerEmail = emailResult.email;
    item.customerEmailSource = emailResult.source;
    item.email = emailResult.email;
    item.customerEmail = emailResult.email;
    item.contactEmail = emailResult.email;
    item.customer = { ...customer, email: emailResult.email };
    item.user = { ...user, email: emailResult.email };
  }
  return item;
}

async function publicRequestsWithLatestCustomerEmail(requests) {
  return Promise.all((requests || []).map(publicRequestWithLatestCustomerEmail));
}

function normalizeRequestMediaForMail(request) {
  return []
    .concat(Array.isArray(request?.mediaFiles) ? request.mediaFiles : [])
    .concat(Array.isArray(request?.attachments) ? request.attachments : [])
    .concat(Array.isArray(request?.files) ? request.files : [])
    .concat(request?.mediaUrl ? [request.mediaUrl] : [])
    .concat(request?.image ? [request.image] : [])
    .filter(Boolean);
}

function newRequestMailPayload(request, context) {
  return {
    subject: `\u3010YAMADEN\u3011\u65b0\u3057\u3044\u4f9d\u983c\u304c\u5c4a\u304d\u307e\u3057\u305f\uff08${context.requestNo}\uff09`,
    text: [
      "\u65b0\u3057\u3044\u4f9d\u983c\u304c\u5c4a\u304d\u307e\u3057\u305f\u3002",
      "",
      `\u4f9d\u983cID: ${mailValue(context.requestNo)}`,
      `\u304a\u5ba2\u69d8\u540d: ${mailValue(context.customerName)}`,
      `\u4f1a\u793e\u540d: ${mailValue(context.companyName)}`,
      `\u96fb\u8a71\u756a\u53f7: ${mailValue(context.phone)}`,
      `メール: ${mailValue(context.customerEmail)}`,
      `\u4f4f\u6240: ${mailValue(context.address)}`,
      `\u4f9d\u983c\u5185\u5bb9: ${mailValue(truncateText(context.content, 500))}`,
      `ステータス: ${mailValue(context.status)}`,
      `備考: ${mailValue(context.adminNote)}`,
      `\u6dfb\u4ed8\u30d5\u30a1\u30a4\u30eb: ${context.hasAttachments ? "\u3042\u308a" : "\u306a\u3057"}`,
      `\u9001\u4fe1\u65e5\u6642: ${formatMailDate(request?.createdAt || new Date())}`,
      "",
      "\u7ba1\u7406\u753b\u9762\u3067\u8a73\u7d30\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
    ].join("\n")
  };
}

function notifyAdminEmail(kind, payload = {}) {
  Promise.resolve()
    .then(async () => {
      const context = await requestNotificationContext(payload.request);
      const sendEventMail = data => sendEmailNotification({
        eventType: kind,
        requestCode: context.requestNo,
        ...data
      });
      if (kind === "request_created") {
        return sendEventMail(newRequestMailPayload(payload.request, context));
      }
      if (kind === "quote_requested") {
        return sendEventMail({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `【YAMADEN】見積依頼が届きました（${context.requestNo}）`,
          text: [
            "お客様から見積依頼が届きました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `会社名: ${mailValue(context.companyName)}`,
            `電話番号: ${mailValue(context.phone)}`,
            `メール: ${mailValue(context.customerEmail)}`,
            `送信日時: ${formatMailDate(payload.request?.quoteRequestedAt || new Date())}`,
            "",
            "管理画面で詳細を確認してください。"
          ].join("\n")
        });
      }
      if (kind === "quote_accepted") {
        return sendEventMail({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `【YAMADEN】見積が承認されました（${context.requestNo}）`,
          text: [
            "お客様が見積を承認しました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `承認日時: ${formatMailDate(payload.request?.quoteAcceptedAt || new Date())}`,
            "",
            "管理画面で詳細を確認してください。"
          ].join("\n")
        });
      }
      if (kind === "quote_revision_requested") {
        return sendEventMail({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `【YAMADEN】見積修正依頼が届きました（${context.requestNo}）`,
          text: [
            "お客様から見積修正依頼が届きました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            "修正依頼内容:",
            mailValue(payload.request?.quoteRevisionMessage),
            "",
            `送信日時: ${formatMailDate(payload.request?.quoteRevisionRequestedAt || new Date())}`,
            "",
            "管理画面で詳細を確認してください。"
          ].join("\n")
        });
      }
      if (kind === "appointment_created") {
        return sendEventMail({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `【YAMADEN】新しい予約が作成されました（${context.requestNo}）`,
          text: [
            "新しい予約が作成されました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `予約ID: ${mailValue(payload.appointment?.appointmentCode || payload.appointment?.id)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `電話番号: ${mailValue(context.phone)}`,
            `メール: ${mailValue(context.customerEmail)}`,
            `工事名: ${mailValue(payload.appointment?.projectName || context.title)}`,
            `予約日: ${mailValue(payload.appointment?.date)}`,
            `予約時間: ${mailValue(payload.appointment?.timeStart || payload.appointment?.time)}`,
            `お客様メモ: ${mailValue(payload.appointment?.customerNote)}`,
            "",
            "管理画面で予約を確認してください。"
          ].join("\n")
        });
      }
      if (kind === "appointment_slot_selected") {
        const appointment = payload.appointment || {};
        const selectedDate = appointment.selectedDate || appointment.date || appointment.appointmentDate || "";
        const selectedTime = [appointment.selectedStartTime || appointment.timeStart, appointment.selectedEndTime || appointment.timeEnd].filter(Boolean).join(" - ") || appointment.time || "";
        return sendEventMail({
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: `【YAMADEN】予約日時が選択されました（${context.requestNo}）`,
          text: [
            "お客様が予約候補から日時を選択しました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `予約ID: ${mailValue(appointment.appointmentCode || appointment.id)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `電話番号: ${mailValue(context.phone)}`,
            `メール: ${mailValue(context.customerEmail)}`,
            `選択日時: ${mailValue([selectedDate, selectedTime].filter(Boolean).join(" "))}`,
            "",
            "管理画面で詳細を確認してください。"
          ].join("\n")
        });
      }
      return false;
    })
    .then(result => {
      if (result?.status === "sent") console.log("[MAIL_SENT] Notification sent");
    })
    .catch(error => {
      console.log("[MAIL_ERROR] Failed to send notification", {
        kind,
        message: error.message
      });
    });
  return;

  Promise.resolve()
    .then(async () => {
      if (kind === "request_created") {
        const context = await requestNotificationContext(payload.request);
        return sendEmailNotification({
          subject: `【YAMADEN】新しい依頼が届きました（${context.requestNo}）`,
          text: [
            "新しい依頼が届きました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `会社名: ${mailValue(context.companyName)}`,
            `電話番号: ${mailValue(context.phone)}`,
            `住所: ${mailValue(context.address)}`,
            `依頼内容: ${mailValue(truncateText(context.content, 500))}`,
            `添付ファイル: ${context.hasAttachments ? "あり" : "なし"}`,
            `送信日時: ${formatMailDate(payload.request?.createdAt || new Date())}`,
            "",
            "管理画面で詳細を確認してください。",
            ADMIN_URL
          ].join("\n")
        });
      }

      if (kind === "legacy_quote_status") {
        const context = await requestNotificationContext(payload.request);
        return sendEmailNotification({
          subject: `【YAMADEN】見積対応が必要な依頼があります（${context.requestNo}）`,
          text: [
            "見積対応が必要な依頼があります。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `会社名: ${mailValue(context.companyName)}`,
            `依頼内容: ${mailValue(truncateText(context.content, 500))}`,
            "現在ステータス: 見積",
            "",
            "管理画面の「見積」タブから対応してください。",
            ADMIN_URL
          ].join("\n")
        });
      }

      if (kind === "quote_sent") {
        const context = await requestNotificationContext(payload.request);
        return sendEmailNotification({
          subject: `【YAMADEN】見積書を送信しました（${context.requestNo}）`,
          text: [
            "見積書をお客様へ送信しました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `お客様名: ${mailValue(context.customerName)}`,
            `会社名: ${mailValue(context.companyName)}`,
            `見積ファイル名: ${mailValue(payload.quote?.originalName || payload.quote?.fileName)}`,
            `送信日時: ${formatMailDate(payload.quote?.sentAt || new Date())}`,
            "",
            "管理画面で送信履歴を確認してください。",
            ADMIN_URL
          ].join("\n")
        });
      }

      return false;
    })
    .then(result => {
      if (result?.status !== "sent") return;
      const messageByKind = {
        request_created: "New request notification sent",
        legacy_quote_status: "Quote status notification sent",
        quote_sent: "Quote sent notification sent"
      };
      console.log("[MAIL_SENT] " + (messageByKind[kind] || "Admin notification sent"));
    })
    .catch(error => {
      console.log("[MAIL_ERROR] Failed to send notification", {
        kind,
        message: error.message
      });
    });
}

function notifyCustomerEmail(kind, payload = {}) {
  Promise.resolve()
    .then(async () => {
      const context = await requestNotificationContext(payload.request);
      const to = context.customerEmail;
      if (!to) {
        const message = kind === "quote_sent" || kind === "quote_updated"
          ? "Customer email is empty, skip quote notification email."
          : "Customer email is empty, skip customer notification email.";
        console.log(message, {
          eventType: kind,
          requestCode: context.requestNo
        });
        return { status: "skipped", provider: MAIL_PROVIDER || "resend", reason: "CUSTOMER_EMAIL_EMPTY" };
      }
      const sendEventMail = data => sendEmailNotification({
        eventType: kind,
        requestCode: context.requestNo,
        ...data
      });
      if (kind === "request_accepted") {
        return sendEventMail({
          to,
          subject: `【YAMADEN】ご依頼を受け付けました（${context.requestNo}）`,
          text: [
            "ご依頼を受け付けました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `受付日時: ${formatMailDate(payload.request?.contactedAt || payload.request?.firstResponseAt || new Date())}`,
            "",
            "担当者より順次ご連絡いたします。"
          ].join("\n")
        });
      }
      if (kind === "request_status_updated") {
        return sendEventMail({
          to,
          subject: `【YAMADEN】依頼のステータスが更新されました（${context.requestNo}）`,
          text: [
            "依頼のステータスが更新されました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `新しいステータス: ${mailValue(context.status)}`,
            `管理者メモ: ${mailValue(payload.adminNote || context.adminNote)}`,
            `更新日時: ${formatMailDate(new Date())}`,
            "",
            "アプリを開いて詳細をご確認ください。"
          ].join("\n")
        });
      }
      if (kind === "quote_sent" || kind === "quote_updated") {
        const isUpdate = kind === "quote_updated";
        return sendEventMail({
          to,
          subject: `【YAMADEN】${isUpdate ? "お見積書が更新されました" : "お見積書が届きました"}（${context.requestNo}）`,
          text: [
            isUpdate ? "お見積書が更新されました。" : "お見積書が届きました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            "ステータス: 見積 / Báo giá",
            `管理者メモ: ${mailValue(payload.adminNote || context.adminNote)}`,
            `${isUpdate ? "更新日時" : "送信日時"}: ${formatMailDate(payload.request?.quoteUpdatedAt || payload.request?.quoteSentAt || new Date())}`,
            "",
            "見積はメールに添付していません。",
            "アプリの依頼詳細画面を開いて、見積内容をご確認ください。"
          ].join("\n")
        });
      }
      if (kind === "quote_sent" || kind === "quote_updated") {
        const isUpdate = kind === "quote_updated";
        return sendEventMail({
          to,
          subject: `【YAMADEN】${isUpdate ? "お見積書が更新されました" : "お見積書が届きました"}（${context.requestNo}）`,
          text: [
            isUpdate ? "お見積書が更新されました。" : "お見積書が届きました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `見積ファイル数: ${mailValue(payload.fileCount)}`,
            `${isUpdate ? "更新日時" : "送信日時"}: ${formatMailDate(payload.request?.quoteUpdatedAt || payload.request?.quoteSentAt || new Date())}`,
            "",
            isUpdate
              ? "アプリの依頼詳細画面から最新のお見積書をご確認ください。"
              : "アプリの依頼詳細画面からお見積書をご確認ください。"
          ].join("\n")
        });
      }
      if (kind === "request_completed") {
        return sendEventMail({
          to,
          subject: `【YAMADEN】対応が完了しました（${context.requestNo}）`,
          text: [
            "ご依頼の対応が完了しました。",
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `件名: ${mailValue(context.title)}`,
            `完了日時: ${formatMailDate(payload.request?.completedAt || new Date())}`,
            "",
            "詳細はアプリの依頼詳細画面からご確認ください。"
          ].join("\n")
        });
      }
      if (["appointment_confirmed", "appointment_rescheduled", "appointment_cancelled"].includes(kind)) {
        const label = kind === "appointment_confirmed"
          ? "予約が確定しました。"
          : kind === "appointment_rescheduled"
            ? "予約日時が変更されました。"
            : "予約がキャンセルされました。";
        return sendEventMail({
          to,
          subject: `【YAMADEN】${label.replace("。", "")}（${context.requestNo}）`,
          text: [
            label,
            "",
            `依頼ID: ${mailValue(context.requestNo)}`,
            `工事名: ${mailValue(payload.appointment?.projectName || context.title)}`,
            `予約日: ${mailValue(payload.appointment?.date)}`,
            `予約時間: ${mailValue(payload.appointment?.timeStart || payload.appointment?.time)}`,
            `技術者: ${mailValue(payload.appointment?.technicianName || payload.appointment?.technician)}`,
            `管理者メモ: ${mailValue(payload.adminNote || payload.appointment?.adminNote)}`,
            "",
            "アプリで予約の詳細をご確認ください。"
          ].join("\n")
        });
      }
      return false;
    })
    .then(result => {
      if (result?.status === "sent") console.log("[MAIL_SENT] Notification sent");
    })
    .catch(error => {
      console.log("[MAIL_ERROR] Failed to send notification", {
        kind,
        message: error.message
      });
    });
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

const MediaFileSchema = new mongoose.Schema({
  id: String,
  url: String,
  secureUrl: String,
  downloadUrl: String,
  publicId: String,
  resourceType: String,
  format: String,
  filename: String,
  originalName: String,
  mimeType: String,
  mimetype: String,
  ext: String,
  size: Number,
  kind: String,
  uploadedAt: Date,
  type: { type: String }
}, { _id: false });

const TimelineEventSchema = new mongoose.Schema({
  id: { type: String },
  type: { type: String },
  status: { type: String },
  message: { type: String },
  note: { type: String },
  actor: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const RequestSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  requestCode: String,
  requestId: String,
  userId: String,
  name: String,
  phone: String,
  email: String,
  contact: String,
  address: String,
  title: String,
  category: String,
  content: String,
  image: String,
  mediaUrl: String,
  mediaType: String,
  mediaFiles: [MediaFileSchema],
  status: String,
  urgency: String,
  priority: String,
  dueAt: Date,
  deadline: Date,
  amount: mongoose.Schema.Types.Mixed,
  totalAmount: mongoose.Schema.Types.Mixed,
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
  assignedStaff: mongoose.Schema.Types.Mixed,
  assignedTo: mongoose.Schema.Types.Mixed,
  assignee: mongoose.Schema.Types.Mixed,
  staff: mongoose.Schema.Types.Mixed,
  responsiblePerson: mongoose.Schema.Types.Mixed,
  issueTags: [String],
  workTypeIds: [String],
  departmentCode: String,
  autoTags: [String],
  autoCategory: { type: String, default: null },
  autoUrgency: { type: String, default: null },
  autoArea: { type: String, default: null },
  aiAnalysisEnabled: { type: Boolean, default: true },
  aiSuggestedUrgency: { type: String, default: null },
  aiSuggestedDueDate: { type: Date, default: null },
  aiSuggestedStaffId: { type: String, default: null },
  aiSuggestedStaffName: { type: String, default: null },
  aiSuggestedDepartmentCode: { type: String, default: null },
  aiSuggestedReason: { type: String, default: null },
  assignmentCandidates: [mongoose.Schema.Types.Mixed],
  assignmentConfidence: { type: Number, default: null },
  assignmentReason: { type: String, default: null },
  assignmentSource: { type: String, default: null },
  assignmentAcceptedAt: { type: Date, default: null },
  assignmentHistory: [mongoose.Schema.Types.Mixed],
  assignedBy: { type: String, default: null },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quote",
    default: null
  },
  quoteRequested: { type: Boolean, default: false },
  quoteRequestedAt: { type: Date, default: null },
  quoteResponseStatus: { type: String, default: null },
  quoteAcceptedAt: { type: Date, default: null },
  quoteRevisionMessage: String,
  quoteRevisionRequestedAt: { type: Date, default: null },
  quoteSent: { type: Boolean, default: false },
  quoteSentAt: { type: Date, default: null },
  quoteUpdatedAt: { type: Date, default: null },
  quoteFiles: [mongoose.Schema.Types.Mixed],
  quotationFiles: [mongoose.Schema.Types.Mixed],
  quoteFileCount: { type: Number, default: 0 },
  quoteSentBy: String,
  quoteStatus: { type: String, default: "not_sent" },
  customerNotifiedAccepted: { type: Boolean, default: false },
  customerNotifiedCompleted: { type: Boolean, default: false },
  timeline: [TimelineEventSchema],
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: String,
  deletedByRole: String
});

const AppSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
  updatedBy: String
});

const QuoteItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  title: String,
  description: String,
  spec: String,
  unit: String,
  quantity: Number,
  qty: Number,
  unitPrice: Number,
  price: Number,
  discount: Number,
  discountRate: Number,
  amount: Number
}, { _id: false });

const QuoteSchema = new mongoose.Schema({
  id: String,
  quoteCode: String,
  quoteNo: String,
  quoteNumber: String,
  code: String,
  number: String,
  requestId: String,
  userId: String,
  customerId: String,
  customerName: String,
  customerCompany: String,
  customerPerson: String,
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  phone: String,
  email: String,
  address: String,
  company: String,
  name: String,
  projectName: String,
  title: String,
  content: String,
  description: String,
  assigneeName: String,
  staffName: String,
  departmentName: String,
  department: String,
  validUntil: String,
  expireDate: String,
  validDate: String,
  status: String,
  quoteItems: [QuoteItemSchema],
  items: [QuoteItemSchema],
  subtotal: Number,
  discount: Number,
  discountTotal: Number,
  tax: Number,
  taxAmount: Number,
  vatAmount: Number,
  vatRate: Number,
  taxRate: Number,
  rounding: Number,
  total: Number,
  currency: String,
  paymentTerms: String,
  note: String,
  customerNote: String,
  internalNote: String,
  pdfUrl: String,
  pdfPublicId: String,
  fileUrl: String,
  filePath: String,
  originalName: String,
  fileName: String,
  filename: String,
  url: String,
  downloadUrl: String,
  mimeType: String,
  fileSize: Number,
  size: Number,
  ext: String,
  uploadedAt: Date,
  uploadedBy: String,
  quoteFiles: [mongoose.Schema.Types.Mixed],
  quotationFiles: [mongoose.Schema.Types.Mixed],
  quoteFileCount: { type: Number, default: 0 },
  sentToCustomer: { type: Boolean, default: false },
  visibleToCustomer: { type: Boolean, default: false },
  sentAt: Date,
  customerResponse: {
    type: String,
    enum: ["pending", "accepted", "revision_requested", "rejected"],
    default: "pending"
  },
  customerResponseNote: String,
  customerRespondedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: String,
  deletedByRole: String
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
  companyAddress: String,
  departmentCode: String,
  department: String,
  departmentId: String,
  workTypeIds: [String],
  issueTags: [String],
  skillIds: [String],
  skills: String,
  taxId: String,
  constructionType: String,
  notificationsEnabled: Boolean,
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
  role: String,
  position: String,
  title: String,
  workContent: String,
  workTags: [String],
  workTypeIds: [String],
  departmentCode: String,
  autoAssignEnabled: { type: Boolean, default: true },
  staffDescription: String,
  note: String,
  introduction: String,
  status: { type: String, default: "active" },
  createdAt: Date,
  deletedAt: Date
});

const DepartmentSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true },
  name: String,
  nameVi: String,
  nameJa: String,
  description: String,
  descriptionVi: String,
  descriptionJa: String,
  sortOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  isSystemDefault: { type: Boolean, default: false },
  protected: { type: Boolean, default: false },
  systemRequired: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String,
  trashType: String,
  createdAt: Date,
  updatedAt: Date
});

const WorkGroupSchema = new mongoose.Schema({
  departmentCode: { type: String, index: true },
  code: { type: String, unique: true, index: true },
  nameVi: String,
  nameJa: String,
  descriptionVi: String,
  descriptionJa: String,
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
});

const WorkTypeSchema = new mongoose.Schema({
  departmentCode: { type: String, index: true },
  departmentCodes: [String],
  department: String,
  departmentId: String,
  workGroupCode: String,
  code: { type: String, unique: true, index: true },
  name: String,
  nameVi: String,
  nameJa: String,
  description: String,
  descriptionVi: String,
  descriptionJa: String,
  keywords: [String],
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  protected: { type: Boolean, default: false },
  systemRequired: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String,
  trashType: String,
  createdAt: Date,
  updatedAt: Date
});

const SkillSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true },
  departmentCode: String,
  departmentCodes: [String],
  department: String,
  departmentId: String,
  name: String,
  nameVi: String,
  nameJa: String,
  description: String,
  descriptionVi: String,
  descriptionJa: String,
  relatedWorkTypeIds: [String],
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  protected: { type: Boolean, default: false },
  systemRequired: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: String,
  trashType: String,
  createdAt: Date,
  updatedAt: Date
});

const AppointmentHistorySchema = new mongoose.Schema({
  type: String,
  message: String,
  actor: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const AppointmentSlotSchema = new mongoose.Schema({
  slotId: String,
  date: String,
  startTime: String,
  endTime: String,
  status: { type: String, default: "available" }
}, { _id: false });

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, index: true },
  appointmentCode: { type: String, index: true },
  requestId: { type: String, index: true },
  requestCode: { type: String, index: true },
  customerId: { type: String, index: true },
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  assigneeId: String,
  assigneeName: String,
  projectName: String,
  address: String,
  appointmentDate: String,
  date: String,
  timeStart: String,
  timeEnd: String,
  technicianName: String,
  technicianId: String,
  slots: [AppointmentSlotSchema],
  selectedSlotId: String,
  selectedDate: String,
  selectedStartTime: String,
  selectedEndTime: String,
  sentAt: Date,
  selectedAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  status: { type: String, default: "draft", index: true },
  customerNote: String,
  adminNote: String,
  createdBy: { type: String, default: "customer" },
  history: [AppointmentHistorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Request = mongoose.model("Request", RequestSchema);
const Quote = mongoose.model("Quote", QuoteSchema);
const User = mongoose.model("User", UserSchema);
const Staff = mongoose.model("Staff", StaffSchema);
const Department = mongoose.model("Department", DepartmentSchema);
const WorkGroup = mongoose.model("WorkGroup", WorkGroupSchema);
const WorkType = mongoose.model("WorkType", WorkTypeSchema);
const Skill = mongoose.model("Skill", SkillSchema);
const Appointment = mongoose.model("Appointment", AppointmentSchema);
const AppSetting = mongoose.model("AppSetting", AppSettingSchema);

const DEFAULT_OVERVIEW_SETTINGS = Object.freeze({
  company: {
    nameJa: "株式会社 山電",
    nameEn: "YAMADEN.CO.LTD",
    sloganJa: "人を守り、幸せを創る",
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
    groupName: "みどりグループ",
    status: "running",
    note: "",
    startDate: "",
    expectedEndDate: ""
  },
  aiSettings: {
    aiRequestAnalysisEnabled: true,
    aiSuggestUrgencyEnabled: true,
    aiSuggestAssigneeEnabled: true,
    aiSuggestDueDateEnabled: true,
    aiAutoFillProcessingFormEnabled: true
  }
});

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function mergeOverviewSettings(value) {
  const incoming = value || {};
  const merged = cloneJson(DEFAULT_OVERVIEW_SETTINGS);
  ["company", "system", "requestCode", "poc", "aiSettings"].forEach(section => {
    merged[section] = Object.assign({}, merged[section], incoming[section] || {});
  });
  merged.system.defaultLanguage = ["vi", "ja"].includes(merged.system.defaultLanguage) ? merged.system.defaultLanguage : "vi";
  merged.system.timezone = String(merged.system.timezone || "Asia/Tokyo").trim() || "Asia/Tokyo";
  merged.system.dateFormat = String(merged.system.dateFormat || "YYYY/MM/DD HH:mm").trim() || "YYYY/MM/DD HH:mm";
  merged.system.pocMode = merged.system.pocMode !== false;
  merged.requestCode.prefix = String(merged.requestCode.prefix || "YMD").trim().replace(/[^A-Za-z0-9]/g, "") || "YMD";
  merged.requestCode.digits = Math.min(8, Math.max(4, Number(merged.requestCode.digits || 6) || 6));
  merged.requestCode.format = `${merged.requestCode.prefix}-${"x".repeat(merged.requestCode.digits)}`;
  Object.keys(DEFAULT_OVERVIEW_SETTINGS.aiSettings).forEach(key => {
    merged.aiSettings[key] = merged.aiSettings[key] !== false;
  });
  return merged;
}

async function getOverviewSettings() {
  const doc = await AppSetting.findOne({ key: "overview" }).lean();
  return mergeOverviewSettings(doc?.value);
}

function validateOverviewSettings(settings) {
  const errors = {};
  const companyName = String(settings?.company?.nameJa || settings?.company?.nameEn || "").trim();
  const prefix = String(settings?.requestCode?.prefix || "").trim();
  const email = String(settings?.company?.email || "").trim();
  const digits = Number(settings?.requestCode?.digits);

  if (!companyName) errors["company.nameJa"] = "Tên công ty không được rỗng.";
  if (!prefix) errors["requestCode.prefix"] = "Prefix mã yêu cầu không được rỗng.";
  if (!["vi", "ja"].includes(settings?.system?.defaultLanguage)) errors["system.defaultLanguage"] = "Ngôn ngữ mặc định chỉ được là vi hoặc ja.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors["company.email"] = "Email không đúng định dạng.";
  if (!Number.isFinite(digits) || digits < 4 || digits > 8) errors["requestCode.digits"] = "Số chữ số phải từ 4 đến 8.";
  return errors;
}

const USER_STATUS_PENDING = "pendingApproval";
const SOFT_DELETE_RETENTION_DAYS = 30;
const SOFT_DELETE_RETENTION_MS = SOFT_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const DEFAULT_DEPARTMENTS = [
  ["design", "Bộ thiết kế", "設計部"],
  ["construction", "Bộ thi công", "工務部"],
  ["survey", "Bộ khảo sát", "調査部"],
  ["maintenance", "Bộ bảo trì", "保全部"],
  ["sales", "Bộ kinh doanh", "営業部"],
  ["operations", "Bộ nghiệp vụ", "業務部"],
  ["executive", "Ban giám đốc", "社長・代表"],
  ["other", "Bộ khác", "その他"]
].map(([code, nameVi, nameJa], index) => ({
  code,
  nameVi,
  nameJa,
  descriptionVi: "",
  descriptionJa: "",
  sortOrder: (index + 1) * 10,
  active: true,
  isSystemDefault: true
}));

const DEFAULT_WORK_GROUPS = {
  design: [
    ["drawing", "Bản vẽ", "図面"],
    ["panel", "Tủ điện", "盤"],
    ["calculation", "Tính toán", "計算"],
    ["technical_check", "Kiểm tra kỹ thuật", "技術確認"]
  ],
  construction: [
    ["construction", "Thi công", "工事"],
    ["inspection", "Kiểm tra", "確認"],
    ["acceptance", "Nghiệm thu", "検査"],
    ["handover", "Bàn giao", "引渡し"]
  ],
  survey: [
    ["survey", "Khảo sát", "調査"],
    ["proposal", "Tư vấn", "提案"]
  ],
  maintenance: [
    ["maintenance", "Bảo trì", "保守"],
    ["trouble", "Xử lý sự cố", "トラブル対応"]
  ],
  sales: [
    ["customer", "Khách hàng", "顧客"],
    ["estimate", "Báo giá", "見積"],
    ["contract", "Hợp đồng", "契約"]
  ],
  operations: [
    ["management", "Quản lý", "管理"],
    ["approval", "Xác nhận / phê duyệt", "確認・承認"]
  ],
  executive: [
    ["approval", "Phê duyệt", "承認"],
    ["important", "Vấn đề quan trọng", "重要案件"]
  ],
  other: [
    ["general", "Chung", "共通"]
  ]
};

const DEFAULT_WORK_TYPES = {
  design: [
    ["drawing_design", "drawing", "Thiết kế bản vẽ", "図面設計"],
    ["drawing_revision", "drawing", "Chỉnh sửa bản vẽ", "図面修正"],
    ["electrical_diagram_design", "drawing", "Thiết kế sơ đồ điện", "電気系統設計"],
    ["cad_drafting", "drawing", "Vẽ CAD", "CAD作図"],
    ["panel_design", "panel", "Thiết kế tủ điện", "盤設計"],
    ["equipment_layout_design", "panel", "Thiết kế bố trí thiết bị", "機器配置設計"],
    ["electrical_system_design", "drawing", "Thiết kế hệ thống điện", "電気設備設計"],
    ["construction_drawing", "drawing", "Làm bản vẽ thi công", "施工図作成"],
    ["as_built_drawing", "drawing", "Làm bản vẽ hoàn công", "竣工図作成"],
    ["technical_drawing_check", "technical_check", "Kiểm tra bản vẽ kỹ thuật", "技術図面確認"],
    ["material_quantity_calculation", "calculation", "Tính toán vật tư", "材料数量計算"],
    ["power_capacity_calculation", "calculation", "Tính toán công suất", "電力容量計算"],
    ["construction_plan_design", "drawing", "Thiết kế phương án thi công", "施工計画設計"],
    ["technical_standard_check", "technical_check", "Kiểm tra tiêu chuẩn kỹ thuật", "技術基準確認"]
  ],
  construction: [
    ["electrical_construction", "construction", "Thi công điện", "電気工事"],
    ["site_check", "inspection", "Kiểm tra công trình", "現場確認"],
    ["construction_progress_check", "inspection", "Kiểm tra tiến độ thi công", "工事進捗確認"],
    ["site_safety_check", "inspection", "Kiểm tra an toàn công trình", "安全確認"],
    ["construction_quality_check", "inspection", "Kiểm tra chất lượng công trình", "品質確認"],
    ["completion_inspection", "acceptance", "Nghiệm thu công trình", "完了検査"],
    ["post_construction_check", "inspection", "Kiểm tra sau thi công", "施工後点検"],
    ["construction_coordination", "construction", "Điều phối thi công", "工事調整"],
    ["handover_support", "handover", "Hỗ trợ bàn giao công trình", "引渡し支援"]
  ],
  survey: [
    ["site_survey", "Khảo sát hiện trường", "現地調査"],
    ["estimate_survey", "Khảo sát để báo giá", "見積調査"],
    ["equipment_condition_check", "Kiểm tra tình trạng thiết bị", "設備状態確認"],
    ["equipment_consultation", "Tư vấn thiết bị phù hợp", "適正機器提案"]
  ],
  maintenance: [
    ["equipment_maintenance", "Bảo trì thiết bị", "設備保守"],
    ["post_construction_check_maintenance", "Kiểm tra sau thi công", "施工後点検"],
    ["site_trouble_support", "Hỗ trợ xử lý vấn đề tại công trình", "現場トラブル対応"],
    ["major_trouble_support", "Hỗ trợ xử lý sự cố nghiêm trọng", "重大トラブル対応"]
  ],
  sales: [
    ["customer_support", "Chăm sóc khách hàng", "顧客対応"],
    ["service_consultation", "Tư vấn dịch vụ", "サービス相談"],
    ["request_reception", "Tiếp nhận yêu cầu khách hàng", "依頼受付"],
    ["customer_meeting", "Họp với khách hàng", "顧客打合せ"],
    ["repair_estimate", "Báo giá sửa chữa", "修理見積"],
    ["construction_estimate", "Báo giá thi công", "工事見積"],
    ["contract_support", "Hỗ trợ hợp đồng", "契約支援"],
    ["contract_adjustment", "Điều chỉnh nội dung hợp đồng", "契約内容調整"]
  ],
  operations: [
    ["business_coordination", "Điều phối hoạt động công ty", "業務調整"],
    ["operations_management", "Quản lý vận hành công ty", "運営管理"],
    ["hr_management", "Quản lý nhân sự", "人事管理"],
    ["sales_check", "Kiểm tra doanh thu công trình", "売上確認"],
    ["construction_plan_confirmation", "Xác nhận kế hoạch thi công", "工事計画確認"],
    ["technical_document_approval", "Phê duyệt hồ sơ kỹ thuật", "技術資料承認"]
  ],
  executive: [
    ["construction_approval", "Phê duyệt công trình", "工事承認"],
    ["estimate_approval", "Phê duyệt báo giá", "見積承認"],
    ["contract_approval", "Phê duyệt hợp đồng", "契約承認"],
    ["large_project_reception", "Tiếp nhận dự án lớn", "大型案件対応"],
    ["important_issue_handling", "Xử lý vấn đề quan trọng", "重要問題対応"],
    ["customer_complaint_resolution", "Giải quyết khiếu nại khách hàng", "クレーム対応"]
  ],
  other: [
    ["other", "Khác", "その他"],
    ["general_support", "Hỗ trợ chung", "共通支援"]
  ]
};

const LEGACY_DEPARTMENT_CODES = ["survey", "maintenance", "operations", "other"];

const OFFICIAL_DEPARTMENTS = [
  ["executive", "Giám đốc", "社長・代表"],
  ["koumu", "Bộ công vụ", "工務部"],
  ["fs", "Bộ FS", "FS部"],
  ["sales", "Bộ kinh doanh", "営業部"],
  ["construction", "Bộ thi công", "工事部"],
  ["design", "Bộ thiết kế", "設計部"],
  ["estimate", "Bộ dự toán", "予算書"]
].map(([code, nameVi, nameJa], index) => ({
  code,
  nameVi,
  nameJa,
  descriptionVi: "",
  descriptionJa: "",
  sortOrder: index + 1,
  active: true,
  isSystemDefault: true
}));

const OFFICIAL_DEPARTMENT_LABELS = {
  executive: { nameVi: "Gi\u00e1m \u0111\u1ed1c", nameJa: "\u793e\u9577\u30fb\u4ee3\u8868" },
  koumu: { nameVi: "B\u1ed9 c\u00f4ng v\u1ee5", nameJa: "\u5de5\u52d9\u90e8" },
  fs: { nameVi: "B\u1ed9 FS", nameJa: "FS\u90e8" },
  sales: { nameVi: "B\u1ed9 kinh doanh", nameJa: "\u55b6\u696d\u90e8" },
  construction: { nameVi: "B\u1ed9 thi c\u00f4ng", nameJa: "\u5de5\u4e8b\u90e8" },
  design: { nameVi: "B\u1ed9 thi\u1ebft k\u1ebf", nameJa: "\u8a2d\u8a08\u90e8" },
  estimate: { nameVi: "B\u1ed9 d\u1ef1 to\u00e1n", nameJa: "\u4e88\u7b97\u66f8" }
};

OFFICIAL_DEPARTMENTS.forEach(item => {
  const labels = OFFICIAL_DEPARTMENT_LABELS[item.code];
  if (labels) Object.assign(item, labels);
});

const OFFICIAL_WORK_GROUPS = {
  executive: [["approval", "Phê duyệt", "承認"], ["important", "Dự án / vấn đề quan trọng", "重要案件"]],
  koumu: [["coordination", "Điều phối", "調整"], ["inspection", "Kiểm tra", "確認"]],
  fs: [["field_service", "Khảo sát / xử lý hiện trường", "現地対応"], ["maintenance", "Bảo trì", "保守"]],
  sales: [["customer", "Khách hàng", "顧客"], ["contract", "Hợp đồng", "契約"]],
  construction: [["construction", "Thi công", "工事"], ["trouble", "Sửa chữa / xử lý vấn đề", "修理・トラブル対応"]],
  design: [["drawing", "Bản vẽ", "図面"], ["panel", "Tủ điện", "盤"], ["technical_check", "Kiểm tra kỹ thuật", "技術確認"]],
  estimate: [["estimate", "Dự toán / báo giá", "予算・見積"], ["calculation", "Tính toán", "計算"]]
};

const OFFICIAL_WORK_TYPES = {
  executive: [
    ["construction_approval", "approval", "Phê duyệt công trình", "工事承認"],
    ["estimate_approval", "approval", "Phê duyệt báo giá", "見積承認"],
    ["contract_approval", "approval", "Phê duyệt hợp đồng", "契約承認"],
    ["large_project_reception", "important", "Tiếp nhận dự án lớn", "大型案件対応"],
    ["important_issue_handling", "important", "Xử lý vấn đề quan trọng", "重要問題対応"],
    ["customer_complaint_resolution", "important", "Giải quyết khiếu nại khách hàng", "クレーム対応"]
  ],
  koumu: [
    ["construction_coordination", "coordination", "Điều phối công trình", "工事調整"],
    ["schedule_management", "coordination", "Quản lý tiến độ", "工程管理"],
    ["site_check", "inspection", "Kiểm tra công trình", "現場確認"],
    ["safety_check", "inspection", "Kiểm tra an toàn", "安全確認"],
    ["quality_check", "inspection", "Kiểm tra chất lượng", "品質確認"],
    ["completion_inspection", "inspection", "Nghiệm thu công trình", "完了検査"],
    ["handover_support", "coordination", "Hỗ trợ bàn giao", "引渡し支援"]
  ],
  fs: [
    ["site_survey", "field_service", "Khảo sát hiện trường", "現地調査"],
    ["equipment_condition_check", "field_service", "Kiểm tra tình trạng thiết bị", "設備状態確認"],
    ["trouble_response", "field_service", "Xử lý sự cố", "トラブル対応"],
    ["maintenance_support", "maintenance", "Hỗ trợ bảo trì", "保守支援"],
    ["post_construction_check_fs", "field_service", "Kiểm tra sau thi công", "施工後点検"]
  ],
  sales: [
    ["customer_support", "customer", "Chăm sóc khách hàng", "顧客対応"],
    ["service_consultation", "customer", "Tư vấn dịch vụ", "サービス相談"],
    ["request_reception", "customer", "Tiếp nhận yêu cầu khách hàng", "依頼受付"],
    ["customer_meeting", "customer", "Họp với khách hàng", "顧客打合せ"],
    ["contract_support", "contract", "Hỗ trợ hợp đồng", "契約支援"]
  ],
  construction: [
    ["electrical_construction", "construction", "Thi công điện", "電気工事"],
    ["equipment_installation", "construction", "Lắp đặt thiết bị", "機器取付"],
    ["post_construction_check", "construction", "Kiểm tra sau thi công", "施工後点検"],
    ["site_repair", "trouble", "Sửa chữa tại công trình", "現場修理"],
    ["site_trouble_support", "trouble", "Hỗ trợ xử lý vấn đề tại công trình", "現場トラブル対応"]
  ],
  design: [
    ["drawing_design", "drawing", "Thiết kế bản vẽ", "図面設計"],
    ["drawing_revision", "drawing", "Chỉnh sửa bản vẽ", "図面修正"],
    ["electrical_diagram_design", "drawing", "Thiết kế sơ đồ điện", "電気系統設計"],
    ["cad_drafting", "drawing", "Vẽ CAD", "CAD作図"],
    ["panel_design", "panel", "Thiết kế tủ điện", "盤設計"],
    ["equipment_layout_design", "drawing", "Thiết kế bố trí thiết bị", "機器配置設計"],
    ["electrical_system_design", "drawing", "Thiết kế hệ thống điện", "電気設備設計"],
    ["construction_drawing", "drawing", "Làm bản vẽ thi công", "施工図作成"],
    ["as_built_drawing", "drawing", "Làm bản vẽ hoàn công", "竣工図作成"],
    ["technical_drawing_check", "technical_check", "Kiểm tra bản vẽ kỹ thuật", "技術図面確認"]
  ],
  estimate: [
    ["budget_creation", "estimate", "Lập dự toán", "予算書作成"],
    ["material_quantity_calculation", "calculation", "Tính toán vật tư", "材料数量計算"],
    ["power_capacity_calculation", "calculation", "Tính toán công suất", "電力容量計算"],
    ["repair_estimate", "estimate", "Báo giá sửa chữa", "修理見積"],
    ["construction_estimate", "estimate", "Báo giá thi công", "工事見積"],
    ["cost_check", "estimate", "Kiểm tra chi phí", "原価確認"],
    ["estimate_adjustment", "estimate", "Điều chỉnh báo giá", "見積調整"]
  ]
};

function normalizeUserStatus(status) {
  if (status === "pending") return USER_STATUS_PENDING;
  return status || USER_STATUS_PENDING;
}

function publicUser(user) {
  const item = user.toObject ? user.toObject() : { ...user };
  item.id = String(item._id || item.id || "");
  item.status = normalizeUserStatus(item.status);
  item.hasPin = Boolean(item.pinHash);
  if (item.deletedAt) item.daysUntilPermanentDelete = daysLeftBeforePermanentDelete(item.deletedAt);
  delete item.pinHash;
  return item;
}

function publicDepartment(item) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  data.id = String(data._id || data.id || "");
  delete data._id;
  delete data.__v;
  return data;
}

function publicWorkType(item) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  data.id = String(data._id || data.id || "");
  delete data._id;
  delete data.__v;
  return data;
}

function publicWorkGroup(item) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  data.id = String(data._id || data.id || "");
  delete data._id;
  delete data.__v;
  return data;
}

function publicSkill(item) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  data.id = String(data._id || data.id || "");
  delete data._id;
  delete data.__v;
  return data;
}

function slugifyCode(value, fallback = "item") {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function cleanMasterPayload(body, fields) {
  const payload = {};
  fields.forEach(field => {
    if (body[field] !== undefined) payload[field] = cleanText(body[field]);
  });
  if (body.relatedWorkTypeIds !== undefined) {
    payload.relatedWorkTypeIds = Array.isArray(body.relatedWorkTypeIds)
      ? body.relatedWorkTypeIds.map(item => cleanText(item)).filter(Boolean)
      : parseRequestTags(body.relatedWorkTypeIds);
  }
  if (body.keywords !== undefined) {
    payload.keywords = Array.isArray(body.keywords)
      ? body.keywords.map(item => cleanText(item)).filter(Boolean)
      : parseRequestTags(body.keywords);
  }
  if (body.sortOrder !== undefined) payload.sortOrder = Number(body.sortOrder) || 0;
  if (body.active !== undefined) payload.active = body.active === true || body.active === "true";
  return payload;
}

function normalizeLocalizedMasterPayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  if (!payload.name) payload.name = payload.nameVi || payload.nameJa || "";
  if (!payload.nameVi && payload.name) payload.nameVi = payload.name;
  if (!payload.description) payload.description = payload.descriptionVi || payload.descriptionJa || "";
  if (!payload.descriptionVi && payload.description) payload.descriptionVi = payload.description;
  return payload;
}

function nonDeletedCondition() {
  return { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
}

function nonDeletedMasterCondition() {
  return { $and: [{ isDeleted: { $ne: true } }, nonDeletedCondition()] };
}

function masterReferenceValues(item) {
  return [item?._id, item?.id, item?.code, item?.name, item?.label, item?.nameVi, item?.nameJa]
    .map(value => String(value || "").trim())
    .filter(Boolean);
}

function matchAnyField(fields, values) {
  const cleanValues = [...new Set((values || []).map(value => String(value || "").trim()).filter(Boolean))];
  if (!cleanValues.length) return { _id: null };
  return { $or: fields.map(field => ({ [field]: { $in: cleanValues } })) };
}

function adminDeletedBy(req) {
  return req.admin?.email || req.admin?.name || req.admin?.username || "admin";
}

function isMasterProtected(item) {
  return item?.protected === true || item?.systemRequired === true;
}

async function departmentRelationCounts(item) {
  const values = masterReferenceValues(item);
  const [relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount] = await Promise.all([
    Staff.countDocuments({ $and: [
      matchAnyField(["departmentCode", "department", "departmentId"], values),
      { status: { $ne: "deleted" } },
      nonDeletedCondition()
    ] }),
    Request.countDocuments({ $and: [
      matchAnyField(["departmentCode", "department", "departmentId"], values),
      nonDeletedMasterCondition()
    ] }),
    User.countDocuments({ $and: [
      matchAnyField(["departmentCode", "department", "departmentId"], values),
      nonDeletedCondition()
    ] }),
    WorkType.countDocuments({ $and: [
      matchAnyField(["departmentCode", "departmentCodes", "department", "departmentId"], values),
      nonDeletedMasterCondition()
    ] }),
    Skill.countDocuments({ $and: [
      matchAnyField(["departmentCode", "departmentCodes", "department", "departmentId"], values),
      nonDeletedMasterCondition()
    ] })
  ]);
  return { relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount };
}

function departmentSoftRelationQuery(item) {
  const values = masterReferenceValues(item);
  return { $and: [
    matchAnyField(["departmentCode", "departmentCodes", "department", "departmentId"], values),
    nonDeletedMasterCondition()
  ] };
}

async function departmentRelatedWorkTypes(item) {
  const rows = await WorkType.find(departmentSoftRelationQuery(item)).sort({ sortOrder: 1, createdAt: 1 }).limit(20);
  return rows.map(publicWorkType);
}

async function unlinkDepartmentSoftRelations(item) {
  const values = masterReferenceValues(item);
  await Promise.all([
    WorkType.updateMany(departmentSoftRelationQuery(item), {
      $set: { departmentCode: "", department: "", departmentId: "", updatedAt: new Date() },
      $pull: { departmentCodes: { $in: values } }
    }),
    Skill.updateMany(departmentSoftRelationQuery(item), {
      $set: { departmentCode: "", department: "", departmentId: "", updatedAt: new Date() },
      $pull: { departmentCodes: { $in: values } }
    })
  ]);
}

async function workTypeRelationCounts(item) {
  const values = masterReferenceValues(item);
  const [relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount] = await Promise.all([
    Staff.countDocuments({ $and: [
      { $or: [
        { workTypeIds: { $in: values } },
        { workTags: { $in: values } },
        { workContent: { $in: values } }
      ] },
      { status: { $ne: "deleted" } },
      nonDeletedCondition()
    ] }),
    Request.countDocuments({ $and: [
      { $or: [
        { workTypeIds: { $in: values } },
        { issueTags: { $in: values } },
        { autoTags: { $in: values } },
        { autoCategory: { $in: values } }
      ] },
      nonDeletedMasterCondition()
    ] }),
    User.countDocuments({ $and: [
      { $or: [{ workTypeIds: { $in: values } }, { issueTags: { $in: values } }] },
      nonDeletedCondition()
    ] }),
    WorkType.countDocuments({ _id: null }),
    Skill.countDocuments({ $and: [
      { relatedWorkTypeIds: { $in: values } },
      nonDeletedMasterCondition()
    ] })
  ]);
  return { relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount };
}

async function skillRelationCounts(item) {
  const values = masterReferenceValues(item);
  const regexes = values.map(value => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  const [relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount] = await Promise.all([
    Staff.countDocuments({ $and: [
      { $or: [
        { workTags: { $in: values } },
        { skills: { $in: values } },
        ...regexes.map(regex => ({ skills: regex }))
      ] },
      { status: { $ne: "deleted" } },
      nonDeletedCondition()
    ] }),
    Request.countDocuments({ $and: [
      { $or: [{ issueTags: { $in: values } }, { autoTags: { $in: values } }] },
      nonDeletedMasterCondition()
    ] }),
    User.countDocuments({ $and: [
      { $or: [{ skillIds: { $in: values } }, { skills: { $in: values } }] },
      nonDeletedCondition()
    ] }),
    WorkType.countDocuments({ _id: null }),
    Skill.countDocuments({ _id: null })
  ]);
  return { relatedStaffCount, relatedRequestCount, relatedCustomerCount, relatedWorkTypeCount, relatedSkillCount };
}

function totalMasterRelations(counts) {
  return Number(counts.relatedStaffCount || 0)
    + Number(counts.relatedRequestCount || 0)
    + Number(counts.relatedCustomerCount || 0)
    + Number(counts.relatedWorkTypeCount || 0)
    + Number(counts.relatedSkillCount || 0);
}

function hardDepartmentRelationCount(counts) {
  return Number(counts.relatedStaffCount || 0)
    + Number(counts.relatedRequestCount || 0)
    + Number(counts.relatedCustomerCount || 0);
}

function softDepartmentRelationCount(counts) {
  return Number(counts.relatedWorkTypeCount || 0)
    + Number(counts.relatedSkillCount || 0);
}

function departmentDeleteDecision(counts, protected) {
  const hardRelations = {
    staff: Number(counts.relatedStaffCount || 0),
    requests: Number(counts.relatedRequestCount || 0),
    customers: Number(counts.relatedCustomerCount || 0)
  };
  const softRelations = {
    workTypes: Number(counts.relatedWorkTypeCount || 0),
    skills: Number(counts.relatedSkillCount || 0),
    mappings: 0
  };
  if (protected) {
    return { canDelete: false, canDeleteWithSoftUnlink: false, hardRelations, softRelations, reason: "PROTECTED" };
  }
  if (hardDepartmentRelationCount(counts) > 0) {
    return { canDelete: false, canDeleteWithSoftUnlink: false, hardRelations, softRelations, reason: "HARD_RELATIONS" };
  }
  if (softDepartmentRelationCount(counts) > 0) {
    return { canDelete: false, canDeleteWithSoftUnlink: true, hardRelations, softRelations, reason: "SOFT_RELATIONS_ONLY" };
  }
  return { canDelete: true, canDeleteWithSoftUnlink: false, hardRelations, softRelations, reason: "NO_RELATIONS" };
}

function masterRelationError(item, counts) {
  return {
    errorCode: "MASTER_HAS_RELATIONS",
    message: "Dữ liệu này đang được liên kết với dữ liệu khác, không thể xóa. Vui lòng Ẩn hoặc chuyển dữ liệu liên kết trước khi xóa.",
    data: item,
    relatedCount: totalMasterRelations(counts),
    relatedMappingCount: counts.relatedSkillCount || 0,
    ...counts
  };
}

function departmentHardRelationError(item, counts, decision) {
  return {
    errorCode: "DEPARTMENT_HARD_RELATIONS",
    message: "Bộ phận này đang được sử dụng bởi dữ liệu nghiệp vụ, nên không thể xóa trực tiếp.",
    data: item,
    relatedCount: hardDepartmentRelationCount(counts),
    ...counts,
    ...decision
  };
}

function departmentSoftRelationResponse(item, counts, decision, workTypes = []) {
  return {
    errorCode: "DEPARTMENT_SOFT_RELATIONS",
    message: "Bộ phận này đang được liên kết với nội dung công việc. Có thể gỡ liên kết và chuyển bộ phận vào Thùng rác.",
    data: item,
    relatedCount: softDepartmentRelationCount(counts),
    ...counts,
    ...decision,
    relatedWorkTypes: workTypes
  };
}

function protectedMasterError(item) {
  return {
    errorCode: "MASTER_PROTECTED",
    message: "Đây là dữ liệu bắt buộc của hệ thống, không thể xóa.",
    data: item
  };
}

async function softDeleteMasterItem(item, trashType, req) {
  item.isDeleted = true;
  item.deletedAt = new Date();
  item.deletedBy = adminDeletedBy(req);
  item.trashType = trashType;
  item.active = false;
  item.updatedAt = new Date();
  await item.save();
  return item;
}

async function seedWorkMasterData() {
  const [departmentCount, workGroupCount, workTypeCount] = await Promise.all([
    Department.countDocuments(),
    WorkGroup.countDocuments(),
    WorkType.countDocuments()
  ]);
  const now = new Date();

  await Department.bulkWrite(OFFICIAL_DEPARTMENTS.map(item => ({
    updateOne: {
      filter: { code: item.code },
      update: { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now } },
      upsert: true
    }
  })));
  await Department.updateMany({ code: { $in: LEGACY_DEPARTMENT_CODES } }, { $set: { active: false, updatedAt: now } });

  const groupRows = Object.entries(OFFICIAL_WORK_GROUPS).flatMap(([departmentCode, items]) =>
    items.map(([code, nameVi, nameJa], index) => ({
      departmentCode,
      code: `${departmentCode}_${code}`,
      nameVi,
      nameJa,
      descriptionVi: "",
      descriptionJa: "",
      active: true,
      sortOrder: (index + 1) * 10
    }))
  );
  if (groupRows.length) {
    await WorkGroup.bulkWrite(groupRows.map(item => ({
      updateOne: {
        filter: { code: item.code },
        update: { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now } },
        upsert: true
      }
    })));
  }
  await WorkGroup.updateMany({ departmentCode: { $in: LEGACY_DEPARTMENT_CODES } }, { $set: { active: false, updatedAt: now } });

  const typeRows = Object.entries(OFFICIAL_WORK_TYPES).flatMap(([departmentCode, items]) =>
      items.map((item, index) => {
        const [code, maybeGroup, maybeVi, maybeJa] = item;
        const hasGroup = item.length >= 4;
        const workGroupCode = hasGroup ? `${departmentCode}_${maybeGroup}` : "";
        const nameVi = hasGroup ? maybeVi : maybeGroup;
        const nameJa = hasGroup ? maybeJa : maybeVi;
        return {
        departmentCode,
        workGroupCode,
        code,
        nameVi,
        nameJa,
        descriptionVi: "",
        descriptionJa: "",
        active: true,
        sortOrder: (index + 1) * 10
        };
      })
  );
  if (typeRows.length) {
    await WorkType.bulkWrite(typeRows.map(item => ({
      updateOne: {
        filter: { code: item.code },
        update: { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now } },
        upsert: true
      }
    })));
  }
  await WorkType.updateMany({ departmentCode: { $in: LEGACY_DEPARTMENT_CODES } }, { $set: { active: false, updatedAt: now } });
}

async function loadWorkMaster({ activeOnly = false } = {}) {
  await seedWorkMasterData();
  const notDeletedQuery = { isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] };
  const departmentQuery = activeOnly ? { active: true, ...notDeletedQuery } : {};
  const activeDepartments = await Department.find(departmentQuery).sort({ sortOrder: 1, createdAt: 1 });
  const departmentCodes = activeDepartments.filter(item => item.isDeleted !== true && !item.deletedAt).map(item => item.code);
  const workGroupQuery = activeOnly
    ? { active: true, departmentCode: { $in: departmentCodes } }
    : {};
  const workTypeQuery = activeOnly
    ? { active: true, departmentCode: { $in: departmentCodes }, ...notDeletedQuery }
    : {};
  const workGroups = await WorkGroup.find(workGroupQuery).sort({ departmentCode: 1, sortOrder: 1, createdAt: 1 });
  const activeGroupCodes = workGroups.map(item => item.code);
  const workTypes = await WorkType.find(workTypeQuery).sort({ departmentCode: 1, sortOrder: 1, createdAt: 1 });
  const visibleWorkTypes = activeOnly
    ? workTypes.filter(item => !item.workGroupCode || activeGroupCodes.includes(item.workGroupCode))
    : workTypes;
  const skills = await Skill.find(activeOnly ? { active: true, ...notDeletedQuery } : {}).sort({ sortOrder: 1, createdAt: 1 });
  return {
    departments: activeDepartments.map(publicDepartment),
    workGroups: workGroups.map(publicWorkGroup),
    workTypes: visibleWorkTypes.map(publicWorkType),
    skills: skills.map(publicSkill)
  };
}

function publicSettingsTrashItem(item, type) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  const name = data.name || data.nameVi || data.nameJa || data.code || "";
  const description = data.description || data.descriptionVi || data.descriptionJa || "";
  return {
    id: String(data._id || data.id || ""),
    type,
    typeLabel: type === "department" ? "Bộ phận" : type === "workType" ? "Nội dung công việc" : type === "skill" ? "Kỹ năng" : "Cài đặt",
    name,
    code: data.code || "",
    description,
    deletedAt: data.deletedAt || null,
    deletedBy: data.deletedBy || "",
    canRestore: true,
    canDeleteForever: true,
    originalData: data
  };
}

async function loadSettingsTrash(type = "settings") {
  const deletedQuery = { isDeleted: true };
  const jobs = [];
  if (type === "settings" || type === "department") jobs.push(Department.find(deletedQuery).sort({ deletedAt: -1 }).then(rows => rows.map(item => publicSettingsTrashItem(item, "department"))));
  if (type === "settings" || type === "workType") jobs.push(WorkType.find(deletedQuery).sort({ deletedAt: -1 }).then(rows => rows.map(item => publicSettingsTrashItem(item, "workType"))));
  if (type === "settings" || type === "skill") jobs.push(Skill.find(deletedQuery).sort({ deletedAt: -1 }).then(rows => rows.map(item => publicSettingsTrashItem(item, "skill"))));
  const groups = await Promise.all(jobs);
  return groups.flat().sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
}

function daysLeftBeforePermanentDelete(deletedAt) {
  if (!deletedAt) return SOFT_DELETE_RETENTION_DAYS;
  const expiresAt = new Date(deletedAt).getTime() + SOFT_DELETE_RETENTION_MS;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

function publicDeletedItem(item) {
  const data = item && item.toObject ? item.toObject() : { ...(item || {}) };
  data.id = String(data.id || data.requestCode || data.quoteCode || data._id || "");
  data.daysLeftBeforePermanentDelete = daysLeftBeforePermanentDelete(data.deletedAt);
  return data;
}

async function cleanupExpiredDeletedItems() {
  try {
    const cutoff = new Date(Date.now() - SOFT_DELETE_RETENTION_MS);
    const [requestResult, quoteResult] = await Promise.all([
      Request.deleteMany({ isDeleted: true, deletedAt: { $lt: cutoff } }),
      Quote.deleteMany({ isDeleted: true, deletedAt: { $lt: cutoff } })
    ]);
    console.info("[soft-delete-cleanup] completed", {
      requests: requestResult.deletedCount || 0,
      quotes: quoteResult.deletedCount || 0
    });
  } catch (error) {
    console.error("[soft-delete-cleanup] failed", error.message);
  }
}

function makeIdQuery(id) {
  const query = [{ id }, { requestCode: id }, { requestId: id }];
  if (!isNaN(Number(id))) query.push({ id: Number(id) });
  if (mongoose.Types.ObjectId.isValid(id)) query.push({ _id: id });
  return { $or: query };
}

function cleanText(value) {
  return String(value || "").trim();
}

function staffHistoryQuery(staffId) {
  const id = cleanText(staffId);
  if (!id) return null;
  const ids = [id];
  if (mongoose.Types.ObjectId.isValid(id)) {
    ids.push(new mongoose.Types.ObjectId(id));
  }
  return {
    $or: [
      { assigneeId: { $in: ids } },
      { "assignedStaff.id": { $in: ids } },
      { "assignedStaff._id": { $in: ids } },
      { "assignedStaff.staffId": { $in: ids } },
      { "assignedTo.id": { $in: ids } },
      { "assignedTo._id": { $in: ids } },
      { "assignedTo.staffId": { $in: ids } },
      { "assignee.id": { $in: ids } },
      { "assignee._id": { $in: ids } },
      { "assignee.staffId": { $in: ids } },
      { "staff.id": { $in: ids } },
      { "staff._id": { $in: ids } },
      { "staff.staffId": { $in: ids } },
      { "responsiblePerson.id": { $in: ids } },
      { "responsiblePerson._id": { $in: ids } },
      { "responsiblePerson.staffId": { $in: ids } }
    ]
  };
}

function latestTimelineEvent(item) {
  const events = Array.isArray(item.timeline) ? item.timeline : [];
  return events
    .filter(event => event && event.createdAt)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] || null;
}

function latestTimelineNoteForRequest(item) {
  const events = Array.isArray(item.timeline) ? item.timeline : [];
  const event = [...events].reverse().find(value => value && cleanText(value.note));
  return event ? cleanText(event.note) : "";
}

function publicAssigneeHistoryRequest(item) {
  const latestEvent = latestTimelineEvent(item);
  return {
    id: String(item.id || item._id || ""),
    requestCode: item.requestCode || item.requestId || "",
    title: item.title || item.content || item.category || "",
    status: customerStatus(item.status),
    createdAt: item.createdAt || "",
    updatedAt: latestEvent ? latestEvent.createdAt : (item.completedAt || item.orderedAt || item.quotedAt || item.siteVisitedAt || item.contactedAt || item.firstResponseAt || ""),
    completedAt: item.completedAt || "",
    latestNote: latestTimelineNoteForRequest(item),
    issueTags: Array.isArray(item.issueTags) ? item.issueTags : []
  };
}

function publicStaffProfile(staff) {
  if (!staff) return null;
  return {
    id: String(staff._id || staff.id || ""),
    name: staff.name || "",
    avatar: staff.avatar || "",
    department: staff.department || staff.areas || "",
    areas: staff.areas || "",
    role: staff.role || staff.position || staff.title || "",
    position: staff.position || "",
    title: staff.title || "",
    workContent: staff.workContent || "",
    staffDescription: staff.staffDescription || staff.introduction || "",
    skills: staff.skills || "",
    workTags: staffTags(staff),
    workTypeIds: Array.isArray(staff.workTypeIds) ? staff.workTypeIds : [],
    departmentCode: staff.departmentCode || "",
    autoAssignEnabled: staff.autoAssignEnabled !== false,
    email: staff.email || "",
    phone: staff.phone || "",
    note: staff.note || staff.introduction || "",
    introduction: staff.introduction || ""
  };
}

function handledRequestRank(item) {
  const status = customerStatus(item.status);
  if (status === "completed") return 0;
  if (status === "ordered" || status === "scheduled") return 1;
  if (status === "processing" || status === "quoted" || status === "estimating") return 2;
  return 3;
}

function latestRequestTime(item) {
  const latestEvent = latestTimelineEvent(item);
  const value = latestEvent?.createdAt || item.completedAt || item.updatedAt || item.createdAt || 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

async function generateRequestCode() {
  let code;
  let exists;
  const overview = await getOverviewSettings();
  const prefix = String(overview?.requestCode?.prefix || "YMD").trim().replace(/[^A-Za-z0-9]/g, "") || "YMD";
  const digits = Math.min(8, Math.max(4, Number(overview?.requestCode?.digits || 6) || 6));

  do {
    const max = 10 ** digits;
    code = prefix + "-" + Math.floor(Math.random() * max).toString().padStart(digits, "0");
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
  if (item.requestCode && /^[A-Za-z0-9]+-\d{4,8}$/.test(String(item.requestCode))) {
    if (!item.requestId) item.requestId = item.requestCode;
    return item.requestCode;
  }

  const code = await generateRequestCode();
  item.requestCode = code;
  item.requestId = code;
  return code;
}

function normalizeAppointmentStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  if (["draft", "pending_selection", "customer_selected", "confirmed", "completed", "cancelled", "expired"].includes(status)) return status;
  if (status === "sent_to_customer" || status === "pending" || status === "rescheduled" || status === "upcoming") return "pending_selection";
  if (status === "in_progress") return "confirmed";
  if (status === "canceled") return "cancelled";
  return "draft";
}

async function generateAppointmentCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = "APT-" + String(Math.floor(10000 + Math.random() * 90000));
    const exists = await Appointment.exists({ appointmentCode: code });
    if (!exists) return code;
  }
  return "APT-" + String(Date.now()).slice(-5);
}

function appointmentIdQuery(id) {
  const query = {
    $or: [
      { id },
      { appointmentCode: id },
      { requestId: id },
      { requestCode: id }
    ]
  };
  if (mongoose.Types.ObjectId.isValid(id)) query.$or.push({ _id: id });
  return query;
}

function appointmentPublic(item) {
  const data = typeof item?.toObject === "function" ? item.toObject() : { ...(item || {}) };
  const appointmentDate = data.appointmentDate || data.date || "";
  const slots = Array.isArray(data.slots) && data.slots.length
    ? data.slots
    : appointmentDate
      ? [{
          slotId: "legacy-slot-1",
          date: appointmentDate,
          startTime: data.timeStart || data.time || "",
          endTime: data.timeEnd || "",
          status: data.selectedSlotId ? "selected" : "available"
        }]
      : [];
  return {
    ...data,
    id: String(data.id || data.appointmentCode || data._id || ""),
    appointmentCode: data.appointmentCode || data.id || "",
    appointmentDate,
    date: appointmentDate,
    status: normalizeAppointmentStatus(data.status),
    slots,
    technician: data.technicianName || data.technician || "",
    time: [data.selectedStartTime || data.timeStart, data.selectedEndTime || data.timeEnd].filter(Boolean).join(" - "),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

function pushAppointmentHistory(item, type, message, actor = "admin") {
  item.history = Array.isArray(item.history) ? item.history : [];
  item.history.push({ type, message, actor, createdAt: new Date() });
  item.updatedAt = new Date();
}

function appointmentSlotId(index = 0) {
  return "slot-" + Date.now() + "-" + String(index + 1);
}

function normalizeAppointmentSlots(slots = []) {
  return (Array.isArray(slots) ? slots : [])
    .map((slot, index) => ({
      slotId: String(slot?.slotId || appointmentSlotId(index)),
      date: String(slot?.date || "").trim(),
      startTime: String(slot?.startTime || slot?.timeStart || "").trim(),
      endTime: String(slot?.endTime || slot?.timeEnd || "").trim(),
      status: ["available", "selected", "unavailable"].includes(String(slot?.status || "")) ? String(slot.status) : "available"
    }))
    .filter(slot => slot.date && slot.startTime && slot.endTime);
}

function appointmentSlotKey(slot) {
  return `${slot.date} ${slot.startTime}-${slot.endTime}`;
}

function validateAppointmentSlots(slots) {
  if (!slots.length) return "At least one appointment slot is required";
  const seen = new Set();
  for (const slot of slots) {
    if (slot.startTime >= slot.endTime) return "Appointment slot start time must be before end time";
    const key = appointmentSlotKey(slot);
    if (seen.has(key)) return "Duplicate appointment slot";
    seen.add(key);
  }
  return "";
}

function applySelectedAppointmentSlot(item, slot) {
  item.selectedSlotId = slot.slotId;
  item.selectedDate = slot.date;
  item.selectedStartTime = slot.startTime;
  item.selectedEndTime = slot.endTime;
  item.appointmentDate = slot.date;
  item.date = slot.date;
  item.timeStart = slot.startTime;
  item.timeEnd = slot.endTime;
}

function uploadMediaToCloudinary(fileBuffer, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "yamaden_requests", resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

function uploadResourceTypeForFile(file) {
  const kind = customerFileKind(file);
  if (kind === "image") return "image";
  if (kind === "video") return "video";
  return "raw";
}

function requestFileKind(file, uploadResult = {}) {
  const mimetype = String(file?.mimetype || uploadResult?.mime_type || "").toLowerCase();
  const ext = extensionOf(file?.originalname || uploadResult?.original_filename || uploadResult?.secure_url || "").replace(/^\./, "");
  if (mimetype.startsWith("image/") || uploadResult.resource_type === "image" || ["jpg", "jpeg", "png", "webp"].includes(ext)) return "image";
  if (mimetype.startsWith("video/") || uploadResult.resource_type === "video" || ["mp4", "mov", "quicktime"].includes(ext)) return "video";
  if (mimetype === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext) || mimetype.includes("word") || mimetype.includes("document")) return "document";
  if (["xls", "xlsx", "csv"].includes(ext) || mimetype.includes("spreadsheet") || mimetype.includes("excel") || mimetype.includes("csv")) return "spreadsheet";
  if (["ppt", "pptx"].includes(ext) || mimetype.includes("presentation") || mimetype.includes("powerpoint")) return "presentation";
  if (["jww", "jwc", "dxf", "dwg"].includes(ext)) return "cad";
  if (ext === "zip" || mimetype.includes("zip")) return "archive";
  return "other";
}

function requestFileExt(file, uploadResult = {}) {
  const ext = extensionOf(file?.originalname || "").replace(/^\./, "");
  if (ext) return ext;
  return String(uploadResult?.format || "").toLowerCase();
}

function validateCustomerUploadFiles(files) {
  const list = Array.isArray(files) ? files : [];
  if (list.length > uploadConfig.CUSTOMER_MAX_FILES) {
    return `Chỉ có thể đính kèm tối đa ${uploadConfig.CUSTOMER_MAX_FILES} file.`;
  }
  const total = list.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (total > mb(uploadConfig.CUSTOMER_MAX_TOTAL_SIZE_MB)) {
    return `Tổng dung lượng file vượt quá ${uploadConfig.CUSTOMER_MAX_TOTAL_SIZE_MB}MB.`;
  }
  for (const file of list) {
    if (!isCustomerFileAllowed(file)) return `File ${file.originalname} không được hỗ trợ.`;
    const limit = customerFileLimitBytes(file);
    if (!limit || Number(file.size || 0) > limit) {
      return `File ${file.originalname} vượt quá dung lượng cho phép.`;
    }
  }
  return "";
}

function quoteFileValidationMessage(file) {
  if (!file) return "Vui lòng chọn file báo giá.";
  if (!isQuoteFileAllowed(file)) return "File báo giá không được hỗ trợ.";
  if (Number(file.size || 0) > mb(uploadConfig.QUOTE_MAX_FILE_SIZE_MB)) {
    return "File báo giá vượt quá dung lượng cho phép.";
  }
  return "";
}

function quoteFilesValidationMessage(files) {
  const list = Array.isArray(files) ? files.filter(Boolean) : [];
  if (!list.length) return "Vui long chon file bao gia.";
  if (list.length > uploadConfig.QUOTE_MAX_FILES) {
    return `Chi co the gui toi da ${uploadConfig.QUOTE_MAX_FILES} file bao gia.`;
  }
  for (const file of list) {
    const error = quoteFileValidationMessage(file);
    if (error) return error;
  }
  return "";
}

function requestUploadMiddleware(req, res, next) {
  upload.array("image", uploadConfig.CUSTOMER_MAX_FILES)(req, res, error => {
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

    const message = error.code === "LIMIT_FILE_SIZE"
      ? `File vượt quá dung lượng cho phép. Video tối đa ${uploadConfig.VIDEO_MAX_SIZE_MB}MB, file thường tối đa ${uploadConfig.DOCUMENT_MAX_SIZE_MB}MB.`
      : error.code === "LIMIT_FILE_COUNT"
        ? `Chỉ có thể đính kèm tối đa ${uploadConfig.CUSTOMER_MAX_FILES} file.`
        : error.message || "Upload failed";
    return res.status(isMulterError ? 400 : 415).json({
      success: false,
      code: error.code || "UPLOAD_ERROR",
      message,
      error: error.message,
      field: error.field
    });
  });
}

function quoteUploadMiddleware(req, res, next) {
  quoteFileUpload.array("file", uploadConfig.QUOTE_MAX_FILES)(req, res, error => {
    if (!error) return next();
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "File báo giá vượt quá dung lượng cho phép."
      : error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE"
        ? `Chỉ có thể upload tối đa ${uploadConfig.QUOTE_MAX_FILES} file báo giá.`
        : error.message || "Upload quote file failed";
    return res.status(400).json({
      ok: false,
      code: error.code || "QUOTE_UPLOAD_ERROR",
      message,
      error: error.message
    });
  });
}

function normalizeRequestStatus(status) {
  const value = String(status || "").trim();
  const lower = value.toLowerCase();
  if (status === "pending") return "untreated";
  if (status === "received") return "contacted";
  if (status === "waiting_customer") return "estimating";
  if (status === "scheduled") return "ordered";
  if (status === "cancelled") return "lost";
  if (status === "completed") return "completed";
  if (value === "見積" || lower === "báo giá" || lower === "bao gia" || lower === "quote" || lower === "estimate") return "quoted";
  return value || "untreated";
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
  untreated: "untreated",
  contacted: "received",
  processing: "processing",
  site_done: "processing",
  estimating: "estimating",
  quoted: "quoted",
  ordered: "ordered",
  completed: "completed",
  lost: "lost"
};

const CUSTOMER_TIMELINE_MESSAGES = {
  submitted: "request.timelineSubmitted",
  untreated: "request.timelineUntreated",
  received: "request.timelineReceived",
  processing: "request.timelineProcessing",
  estimating: "request.timelineEstimating",
  quoted: "request.timelineQuoted",
  waiting_customer: "request.timelineWaiting",
  ordered: "request.timelineOrdered",
  scheduled: "request.timelineScheduled",
  completed: "request.timelineCompleted",
  lost: "request.timelineLost",
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
      status: type,
      message,
      note: String(note || "").trim(),
      actor: "admin",
      createdAt: new Date()
    }]);
}

function normalizeTimelineEvents(value) {
  const rawItems = Array.isArray(value) ? value : [];
  const items = rawItems.length ? rawItems : [{
    id: "tl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    type: "submitted",
    status: "submitted",
    message: "request.timelineSubmitted",
    note: "",
    actor: "user",
    createdAt: new Date()
  }];

  return items.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: "tl-string-" + Date.now() + "-" + index,
        type: "submitted",
        status: "submitted",
        message: item || "request.timelineSubmitted",
        note: "",
        actor: "",
        createdAt: new Date()
      };
    }

    const event = item && typeof item === "object" ? item : {};
    const type = String(event.type || event.status || "submitted");
    return {
      id: String(event.id || "tl-" + Date.now() + "-" + index),
      type,
      status: String(event.status || type),
      message: String(event.message || "request.timelineSubmitted"),
      note: String(event.note || ""),
      actor: String(event.actor || ""),
      createdAt: event.createdAt ? new Date(event.createdAt) : new Date()
    };
  });
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

  return normalizeTagList(raw.split(/[,;、；\n\r]+/));
}

function staffTags(staff) {
  const fromArray = Array.isArray(staff.workTags) ? staff.workTags : [];
  const departmentTokens = normalizeTagList([staff.department, staff.departmentCode, staff.areas]);
  const fromText = [staff.skills]
    .join(",")
    .split(/[,;、；\n\r]+/);

  return normalizeTagList(fromArray.concat(fromText)).filter(tag => !departmentTokens.includes(normalizeAssignmentTag(tag)));
}

function normalizeMatchText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function masterTextTokens(item) {
  return normalizeTagList([
    item?.code,
    item?.name,
    item?.nameVi,
    item?.nameJa,
    item?.description,
    item?.descriptionVi,
    item?.descriptionJa,
    ...(Array.isArray(item?.keywords) ? item.keywords : [])
  ]).map(normalizeMatchText).filter(Boolean);
}

function mediaTextForAnalysis(mediaFiles) {
  return (Array.isArray(mediaFiles) ? mediaFiles : [])
    .map(file => [file?.originalName, file?.type, file?.mimetype, file?.resourceType].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(" ");
}

async function inferWorkContextForRequest(payload = {}) {
  const requestText = normalizeMatchText([
    payload.title,
    payload.content,
    payload.category,
    payload.address,
    mediaTextForAnalysis(payload.mediaFiles),
    Array.isArray(payload.issueTags) ? payload.issueTags.join(" ") : payload.issueTags,
    Array.isArray(payload.workTypeIds) ? payload.workTypeIds.join(" ") : payload.workTypeIds
  ].filter(Boolean).join(" "));
  const explicitWorkTypeIds = normalizeTagList(payload.workTypeIds);
  const explicitDepartment = cleanText(payload.departmentCode);
  const [workTypes, departments] = await Promise.all([
    WorkType.find({ active: { $ne: false }, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }).lean(),
    Department.find({ active: { $ne: false }, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }).lean()
  ]);

  const workMatches = workTypes.map(workType => {
    const keys = masterTextTokens(workType);
    const score = keys.reduce((sum, key) => {
      if (!key) return sum;
      if (explicitWorkTypeIds.includes(String(workType._id)) || explicitWorkTypeIds.includes(workType.code)) return sum + 40;
      if (requestText.includes(key)) return sum + Math.min(30, Math.max(8, key.length));
      return sum;
    }, 0);
    return { workType, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  const inferredDepartment = explicitDepartment || workMatches[0]?.workType?.departmentCode || "";
  const departmentMatches = departments.map(department => {
    const keys = masterTextTokens(department);
    const score = keys.reduce((sum, key) => {
      if (!key) return sum;
      if (inferredDepartment && department.code === inferredDepartment) return sum + 40;
      if (requestText.includes(key)) return sum + Math.min(20, Math.max(6, key.length));
      return sum;
    }, 0);
    return { department, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

  const workTypeIds = Array.from(new Set(explicitWorkTypeIds.concat(workMatches.slice(0, 5).flatMap(({ workType }) => [String(workType._id), workType.code].filter(Boolean)))));
  const issueTags = Array.from(new Set(normalizeTagList(payload.issueTags).concat(workMatches.slice(0, 5).map(({ workType }) => workType.nameJa || workType.nameVi || workType.name || workType.code).filter(Boolean))));
  return {
    requestText,
    workTypeIds,
    issueTags,
    departmentCode: inferredDepartment || departmentMatches[0]?.department?.code || "",
    matchedWorkTypes: workMatches.slice(0, 5).map(({ workType, score }) => ({
      id: String(workType._id),
      code: workType.code || "",
      name: workType.nameJa || workType.nameVi || workType.name || workType.code || "",
      departmentCode: workType.departmentCode || "",
      score
    })),
    matchedDepartments: departmentMatches.slice(0, 3).map(({ department, score }) => ({
      code: department.code || "",
      name: department.nameJa || department.nameVi || department.name || department.code || "",
      score
    }))
  };
}

function uniqueStaffWorkOptions(staffList) {
  const seen = new Set();
  const options = [];

  staffList.forEach(staff => {
    const values = normalizeTagList(
      (Array.isArray(staff.workTags) ? staff.workTags : [])
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

  const staffList = await Staff.find({
    status: { $nin: ["off", "inactive", "deleted"] },
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    autoAssignEnabled: { $ne: false }
  });
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

function staffDepartmentMatchesRequest(staff, departmentCode) {
  const requested = String(departmentCode || "").trim();
  if (!requested) return true;
  return String(staff.departmentCode || "").trim() === requested;
}

async function findBestAssigneeForRequest({ issueTags, workTypeIds, departmentCode }) {
  const ids = normalizeTagList(workTypeIds);
  if (ids.length) {
    const staffList = await Staff.find({
      status: { $nin: ["off", "inactive", "deleted"] },
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      autoAssignEnabled: { $ne: false }
    });
    const best = staffList.find(staff => {
      const staffIds = normalizeTagList(staff.workTypeIds);
      return staffDepartmentMatchesRequest(staff, departmentCode) && ids.some(id => staffIds.includes(id));
    });
    if (best) return best;
  }
  return findBestAssignee(issueTags);
}

async function buildAssignmentSuggestion({ issueTags, workTypeIds, departmentCode, matchedWorkTypes = [], matchedDepartments = [], requestText = "" }) {
  const tags = parseRequestTags(issueTags);
  const ids = normalizeTagList(workTypeIds);
  const department = String(departmentCode || "").trim();

  if (!department && !ids.length && !tags.length) {
    console.info("[AUTO_ASSIGN_SKIP] insufficient data for suggestion");
    return {
      assignmentCandidates: [],
      assignmentConfidence: 0,
      assignmentReason: "Chưa đủ dữ liệu để gợi ý người phụ trách",
      assignmentSource: "insufficient_data"
    };
  }

  const staffList = await Staff.find({
    status: { $nin: ["off", "inactive", "deleted"] },
    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    autoAssignEnabled: { $ne: false }
  });

  const normalizedTags = normalizeTagList(tags);
  const candidates = staffList.map(staff => {
    const reasons = [];
    let score = 0;
    const staffDept = String(staff.departmentCode || "").trim();
    const staffWorkTypeIds = normalizeTagList(staff.workTypeIds);
    const staffTagList = staffTags(staff);
    const workMatches = ids.filter(id => staffWorkTypeIds.includes(id));
    const tagMatches = normalizedTags.filter(tag => staffTagList.includes(tag));
    const textMatches = staffTagList.filter(tag => requestText && normalizeMatchText(tag) && requestText.includes(normalizeMatchText(tag)));

    if (department && staffDept && staffDept === department) {
      score += 30;
      reasons.push(`Bộ phận phù hợp: ${department}`);
    }
    if (!department && matchedDepartments.length && staffDept && matchedDepartments.some(item => item.code === staffDept)) {
      score += 20;
      reasons.push(`Bộ phận khớp theo phân tích nội dung: ${staffDept}`);
    }
    if (workMatches.length) {
      score += Math.min(30, workMatches.length * 15);
      reasons.push(`Nội dung công việc phù hợp: ${workMatches.join(", ")}`);
    }
    if (!workMatches.length && matchedWorkTypes.length && staffWorkTypeIds.length) {
      const inferredWorkMatches = matchedWorkTypes.filter(item => staffWorkTypeIds.includes(item.id) || staffWorkTypeIds.includes(item.code));
      if (inferredWorkMatches.length) {
        score += Math.min(30, inferredWorkMatches.length * 15);
        reasons.push(`Staff mapping khớp nội dung công việc: ${inferredWorkMatches.map(item => item.name || item.code).join(", ")}`);
      }
    }
    if (tagMatches.length) {
      score += Math.min(20, tagMatches.length * 10);
      reasons.push(`Tag phù hợp: ${tagMatches.join(", ")}`);
    }
    if (textMatches.length) {
      score += Math.min(20, textMatches.length * 10);
      reasons.push(`Kỹ năng/tag khớp nội dung yêu cầu: ${textMatches.join(", ")}`);
    }

    if (staff.autoAssignEnabled !== false) {
      score += 10;
      reasons.push("Staff is active for auto assignment");
    }

    if (!score) return null;

    return {
      staffId: String(staff._id),
      staffName: staff.name || staff.email || staff.phone || "",
      departmentCode: staff.departmentCode || "",
      score: Math.min(100, score),
      confidence: Math.min(100, score),
      reason: reasons.join("; "),
      reasons
    };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 3);

  if (!candidates.length) {
    console.info("[AUTO_ASSIGN_SKIP] no matching staff for suggestion");
    return {
      assignmentCandidates: [],
      assignmentConfidence: 0,
      assignmentReason: "Chưa tìm thấy nhân viên phù hợp với dữ liệu hiện tại",
      assignmentSource: "rule_suggestion"
    };
  }

  console.info("[AUTO_ASSIGN_SUGGESTION] candidates generated", {
    count: candidates.length,
    topScore: candidates[0]?.score || 0
  });

  return {
    assignmentCandidates: candidates,
    assignmentConfidence: candidates[0]?.score || 0,
    assignmentReason: candidates[0]?.reasons?.join("; ") || "Đã tạo gợi ý phân công",
    assignmentSource: "rule_suggestion"
  };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin-v2.html", (req, res) => {
  res.redirect(302, "/admin.html");
});

app.get("/admin-reference.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-reference.html"));
});

app.get("/admin.css", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.sendFile(path.join(__dirname, "admin.css"));
});

app.get("/admin.js", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.sendFile(path.join(__dirname, "admin.js"));
});

app.get("/admin-v2.css", (req, res) => {
  res.redirect(302, "/admin.css");
});

app.get("/admin-v2.js", (req, res) => {
  res.redirect(302, "/admin.js");
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

app.get("/api/admin/settings/overview", requireAdmin, async (req, res) => {
  try {
    const settings = await getOverviewSettings();
    const [requestCount, customerCount, staffCount, sentQuoteCount] = await Promise.all([
      Request.countDocuments({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] }),
      User.countDocuments({ $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }),
      Staff.countDocuments({ status: { $nin: ["deleted"] }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] }),
      Request.countDocuments({
        $or: [
          { quoteSent: true },
          { "quotationFiles.0": { $exists: true } },
          { "quoteFiles.0": { $exists: true } }
        ]
      })
    ]);

    res.json({
      ok: true,
      settings,
      status: {
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        emailProvider: process.env.MAIL_PROVIDER || (process.env.RESEND_API_KEY ? "Resend" : "not configured"),
        adminNotificationEmailConfigured: Boolean(process.env.ADMIN_NOTIFICATION_EMAIL),
        requestCount,
        customerCount,
        staffCount,
        sentQuoteCount
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Settings read failed", error: error.message });
  }
});

app.put("/api/admin/settings/overview", requireAdmin, async (req, res) => {
  try {
    const merged = mergeOverviewSettings(req.body || {});
    const errors = validateOverviewSettings(merged);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Validation failed", errors });
    }

    const doc = await AppSetting.findOneAndUpdate(
      { key: "overview" },
      { key: "overview", value: merged, updatedAt: new Date(), updatedBy: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ ok: true, settings: mergeOverviewSettings(doc.value) });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Settings save failed", error: error.message });
  }
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
      return res.status(403).json({ error: "ACCOUNT_DELETED", message: "This account is deleted or inactive." });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ error: "ACCOUNT_BLOCKED", message: "Account is blocked. Please contact YAMADEN support." });
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

app.put("/api/users/profile", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fieldMap = {
      name: ["name", "fullName"],
      email: ["email"],
      phone: ["phone"],
      company: ["companyName"],
      contact: ["personInCharge", "contactPerson"],
      companyAddress: ["companyAddress"],
      taxId: ["taxId"],
      projectName: ["projectName"],
      address: ["siteAddress", "address"],
      province: ["siteAddress", "address"],
      constructionType: ["constructionType"],
      note: ["notes", "note"]
    };

    Object.entries(fieldMap).forEach(([target, sources]) => {
      const key = sources.find(source => req.body[source] !== undefined);
      if (!key) return;
      user[target] = String(req.body[key] || "").trim();
    });

    if (req.body.notificationsEnabled !== undefined) {
      user.notificationsEnabled = Boolean(req.body.notificationsEnabled);
    }

    user.profileCompleted = Boolean(user.name && user.email && user.address && user.projectName);
    await user.save();

    res.json({
      data: {
        user: publicUser(user),
        status: normalizeUserStatus(user.status)
      },
      message: "Profile updated"
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed", error: error.message });
  }
});

app.get("/user/requests", requireUser, async (req, res) => {
  try {
    const requests = await Request.find({
      userId: req.user.userId,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

function customerItemQuery(id, userId) {
  return { $and: [makeIdQuery(id), { userId }, { isDeleted: { $ne: true } }] };
}

function customerDeletedItemQuery(id, userId) {
  return { $and: [makeIdQuery(id), { userId }, { isDeleted: true }] };
}

async function findCustomerQuote(id, userId, deleted) {
  const idQuery = { $or: [{ id }, { quoteCode: id }] };
  if (mongoose.Types.ObjectId.isValid(id)) idQuery.$or.push({ _id: id });
  const direct = await Quote.findOne({
    $and: [
      idQuery,
      { userId },
      deleted ? { isDeleted: true } : { isDeleted: { $ne: true } }
    ]
  });
  if (direct) return direct;

  const requestIds = await Request.find({ userId }).distinct("id");
  const requestCodes = await Request.find({ userId }).distinct("requestCode");
  return Quote.findOne({
    $and: [
      idQuery,
      { requestId: { $in: [...requestIds, ...requestCodes].filter(Boolean) } },
      deleted ? { isDeleted: true } : { isDeleted: { $ne: true } }
    ]
  });
}

app.get("/api/customer/requests/deleted", requireUser, async (req, res) => {
  try {
    const requests = await Request.find({
      userId: req.user.userId,
      isDeleted: true
    }).sort({ deletedAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: requests.map(publicDeletedItem) });
  } catch (error) {
    res.status(500).json({ message: "Deleted requests load failed", error: error.message });
  }
});

app.delete("/api/customer/requests/:id", requireUser, async (req, res) => {
  try {
    const item = await Request.findOne(customerItemQuery(req.params.id, req.user.userId));
    if (!item) return res.status(404).json({ message: "Not found" });
    item.isDeleted = true;
    item.deletedAt = new Date();
    item.deletedBy = req.user.userId;
    item.deletedByRole = "user";
    await item.save();
    res.json({ data: publicDeletedItem(item), message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

app.patch("/api/customer/requests/:id/restore", requireUser, async (req, res) => {
  try {
    const item = await Request.findOne(customerDeletedItemQuery(req.params.id, req.user.userId));
    if (!item) return res.status(404).json({ message: "Not found" });
    item.isDeleted = false;
    item.deletedAt = null;
    item.deletedBy = "";
    item.deletedByRole = "";
    await item.save();
    res.json({ data: item, message: "Restored" });
  } catch (error) {
    res.status(500).json({ message: "Restore failed", error: error.message });
  }
});

app.post("/api/customer/requests/:id/quote-request", requireUser, async (req, res) => {
  try {
    const item = await Request.findOne(customerItemQuery(req.params.id, req.user.userId));
    if (!item) return res.status(404).json({ message: "Not found" });
    const files = []
      .concat(Array.isArray(item.quotationFiles) ? item.quotationFiles : [])
      .concat(Array.isArray(item.quoteFiles) ? item.quoteFiles : [])
      .filter(file => file && (file.fileUrl || file.url || file.secureUrl));
    if (item.quoteSent === true || files.length > 0) {
      return res.status(400).json({ message: "Quote has already been sent" });
    }
    if (!item.quoteRequested) {
      item.quoteRequested = true;
      item.quoteRequestedAt = new Date();
      mergeStatusTimeline(item, item.status || "untreated", "quote_requested");
      await item.save();
      notifyAdminEmail("quote_requested", { request: item });
    }
    res.json({ data: item, message: "Quote requested" });
  } catch (error) {
    res.status(500).json({ message: "Quote request failed", error: error.message });
  }
});

app.delete("/api/customer/requests/:id/permanent", requireUser, async (req, res) => {
  try {
    const result = await Request.deleteOne(customerDeletedItemQuery(req.params.id, req.user.userId));
    if (result.deletedCount === 0) return res.status(404).json({ message: "Not found" });
    res.json({ data: { success: true }, message: "Permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Permanent delete failed", error: error.message });
  }
});

app.post("/api/appointments", requireUser, async (req, res) => {
  res.status(405).json({ message: "Appointments are proposed by admin. Please select a proposed slot." });
});

app.get("/api/appointments/my", requireUser, async (req, res) => {
  try {
    const items = await Appointment.find({ customerId: String(req.user.userId) }).sort({ createdAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: items.map(appointmentPublic) });
  } catch (error) {
    res.status(500).json({ message: "Appointments load failed", error: error.message });
  }
});

app.get("/api/appointments/:id", requireUser, async (req, res) => {
  try {
    const item = await Appointment.findOne({ $and: [appointmentIdQuery(req.params.id), { customerId: String(req.user.userId) }] });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ data: appointmentPublic(item) });
  } catch (error) {
    res.status(500).json({ message: "Appointment load failed", error: error.message });
  }
});

app.post("/api/appointments/:id/select-slot", requireUser, async (req, res) => {
  try {
    const item = await Appointment.findOne({ $and: [appointmentIdQuery(req.params.id), { customerId: String(req.user.userId) }] });
    if (!item) return res.status(404).json({ message: "Not found" });
    if (!["pending_selection", "customer_selected"].includes(normalizeAppointmentStatus(item.status))) {
      return res.status(400).json({ message: "Appointment is not selectable" });
    }
    const slotId = String(req.body?.slotId || "").trim();
    const slots = normalizeAppointmentSlots(item.slots);
    const selectedSlot = slots.find(slot => slot.slotId === slotId);
    if (!selectedSlot) return res.status(404).json({ message: "Slot not found" });
    if (selectedSlot.status !== "available" && selectedSlot.status !== "selected") return res.status(400).json({ message: "Slot is unavailable" });
    item.slots = slots.map(slot => ({ ...slot, status: slot.slotId === slotId ? "selected" : "available" }));
    applySelectedAppointmentSlot(item, selectedSlot);
    item.status = "customer_selected";
    item.selectedAt = new Date();
    pushAppointmentHistory(item, "appointment_slot_selected", "Customer selected appointment slot", "customer");
    await item.save();
    const request = await findRequestByAnyId(item.requestCode || item.requestId);
    if (request) notifyAdminEmail("appointment_slot_selected", { request, appointment: item });
    res.json({ data: appointmentPublic(item), message: "Appointment slot selected" });
  } catch (error) {
    res.status(500).json({ message: "Appointment slot select failed", error: error.message });
  }
});

app.get("/api/customer/quotes", requireUser, async (req, res) => {
  try {
    const quotes = await Quote.find({
      userId: req.user.userId,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: quotes.map(quote => {
      const item = quote.toObject();
      const quotationFiles = Array.isArray(item.quotationFiles) ? item.quotationFiles.map(file => publicQuoteFile(file, req)) : [];
      const quoteFiles = Array.isArray(item.quoteFiles) ? item.quoteFiles.map(file => publicQuoteFile(file, req)) : [];
      return publicQuoteFile({ ...item, quotationFiles, quoteFiles }, req);
    }) });
  } catch (error) {
    res.status(500).json({ message: "Quotes load failed", error: error.message });
  }
});

app.get("/api/customer/quotes/deleted", requireUser, async (req, res) => {
  try {
    const quotes = await Quote.find({
      userId: req.user.userId,
      isDeleted: true
    }).sort({ deletedAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: quotes.map(publicDeletedItem) });
  } catch (error) {
    res.status(500).json({ message: "Deleted quotes load failed", error: error.message });
  }
});

app.delete("/api/customer/quotes/:id", requireUser, async (req, res) => {
  try {
    const quote = await findCustomerQuote(req.params.id, req.user.userId, false);
    if (!quote) return res.status(404).json({ message: "Not found" });
    quote.isDeleted = true;
    quote.deletedAt = new Date();
    quote.deletedBy = req.user.userId;
    quote.deletedByRole = "user";
    if (!quote.userId) quote.userId = req.user.userId;
    await quote.save();
    res.json({ data: publicDeletedItem(quote), message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

app.post("/api/customer/quotes/:id/response", requireUser, async (req, res) => {
  try {
    const quote = await findCustomerQuote(req.params.id, req.user.userId, false);
    if (!quote) return res.status(404).json({ message: "Not found" });
    const action = String(req.body?.action || req.body?.status || "").trim();
    const request = await findRequestByAnyId(quote.requestId);
    if (!request || String(request.userId || "") !== String(req.user.userId)) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (action === "accepted") {
      const now = new Date();
      quote.status = "accepted";
      quote.customerResponse = "accepted";
      quote.customerRespondedAt = now;
      quote.acceptedAt = now;
      request.quoteResponseStatus = "accepted";
      request.quoteAcceptedAt = now;
      await quote.save();
      await request.save();
      notifyAdminEmail("quote_accepted", { request, quote });
      return res.json({ data: quote, request, message: "Quote accepted" });
    }
    if (action === "revision_requested") {
      const message = String(req.body?.message || req.body?.note || "").trim();
      if (!message) return res.status(400).json({ message: "Revision message is required" });
      const now = new Date();
      quote.status = "revision_requested";
      quote.customerResponse = "revision_requested";
      quote.customerResponseNote = message;
      quote.customerRespondedAt = now;
      quote.changeRequestedAt = now;
      quote.changeRequestMessage = message;
      request.quoteResponseStatus = "revision_requested";
      request.quoteRevisionMessage = message;
      request.quoteRevisionRequestedAt = now;
      await quote.save();
      await request.save();
      notifyAdminEmail("quote_revision_requested", { request, quote });
      return res.json({ data: quote, request, message: "Quote revision requested" });
    }
    return res.status(400).json({ message: "Unsupported quote response" });
  } catch (error) {
    res.status(500).json({ message: "Quote response failed", error: error.message });
  }
});

app.patch("/api/customer/quotes/:id/restore", requireUser, async (req, res) => {
  try {
    const quote = await findCustomerQuote(req.params.id, req.user.userId, true);
    if (!quote) return res.status(404).json({ message: "Not found" });
    quote.isDeleted = false;
    quote.deletedAt = null;
    quote.deletedBy = "";
    quote.deletedByRole = "";
    if (!quote.userId) quote.userId = req.user.userId;
    await quote.save();
    res.json({ data: quote, message: "Restored" });
  } catch (error) {
    res.status(500).json({ message: "Restore failed", error: error.message });
  }
});

app.delete("/api/customer/quotes/:id/permanent", requireUser, async (req, res) => {
  try {
    const quote = await findCustomerQuote(req.params.id, req.user.userId, true);
    if (!quote) return res.status(404).json({ message: "Not found" });
    await Quote.deleteOne({ _id: quote._id });
    res.json({ data: { success: true }, message: "Permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Permanent delete failed", error: error.message });
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

app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const requestCount = await Request.countDocuments({ userId: String(user._id) });
    const item = publicUser(user);
    item.requestCount = requestCount;
    res.json({ data: item });
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
    res.json(await publicRequestsWithLatestCustomerEmail(requests));
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/admin/quotes", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
  }
});

app.get("/admin/quote-requests", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const search = String(req.query.search || "").trim().toLowerCase();
    const requests = await Request.find({ status: "quoted", isDeleted: { $ne: true } }).sort({ quotedAt: -1, createdAt: -1 });
    for (const request of requests) {
      if (!request.requestCode) {
        await ensureRequestCode(request);
        await request.save();
      }
    }
    const requestKeys = requests.flatMap(request => [
      String(request._id || ""),
      request.id,
      request.requestCode,
      request.requestNo,
      request.code,
      request.requestId
    ].filter(Boolean));
    const quotes = requestKeys.length
      ? await Quote.find({ requestId: { $in: requestKeys }, isDeleted: { $ne: true } }).sort({ sentAt: -1, createdAt: -1 }).lean()
      : [];
    const quotesByRequest = new Map();
    quotes.forEach(quote => {
      const key = String(quote.requestId || "");
      if (!quotesByRequest.has(key)) quotesByRequest.set(key, []);
      quotesByRequest.get(key).push(quote);
    });
    let data = requests.map(request => {
      const requestNo = getRequestDisplayId(request);
      const keys = [String(request._id || ""), request.id, request.requestCode, request.requestNo, request.code, request.requestId].filter(Boolean);
      const quoteFiles = keys
        .flatMap(key => quotesByRequest.get(String(key)) || [])
        .filter(file => file.fileUrl || file.pdfUrl);
      const storedQuoteFiles = [
        ...(Array.isArray(request.quotationFiles) ? request.quotationFiles : []),
        ...(Array.isArray(request.quoteFiles) ? request.quoteFiles : [])
      ].filter(file => file && (file.fileUrl || file.pdfUrl));
      const quotationFiles = quoteFiles.length ? quoteFiles : storedQuoteFiles;
      const quoteSent = request.quoteSent === true || quotationFiles.length > 0;
      const quoteSentAt = request.quoteSentAt || quotationFiles[0]?.sentAt || quotationFiles[0]?.createdAt || null;
      return {
        ...request.toObject(),
        id: String(request._id || request.id || ""),
        requestNo,
        requestCode: requestNo,
        quoteFiles: quotationFiles,
        quotationFiles,
        quoteFileCount: quotationFiles.length,
        latestQuoteFile: quotationFiles[0] || null,
        quoteSent,
        quoteSentAt,
        quoteStatus: quoteSent ? "sent" : "not_sent",
        quoteSentBy: request.quoteSentBy || ""
      };
    });
    data = await publicRequestsWithLatestCustomerEmail(data);
    if (search) {
      data = data.filter(item => [
        item.requestNo,
        item.requestCode,
        item.name,
        item.phone,
        item.address,
        item.title,
        item.content,
        item.assigneeName,
        ...(item.quoteFiles || []).map(file => file.originalName || file.fileName || "")
      ].join(" ").toLowerCase().includes(search));
    }
    res.json({ ok: true, requests: data, data });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Quote requests load failed", error: error.message });
  }
});

function adminQuoteQuery(id) {
  const clauses = [{ id }, { quoteCode: id }, { quoteNo: id }, { quoteNumber: id }, { code: id }, { number: id }];
  if (mongoose.Types.ObjectId.isValid(id)) clauses.unshift({ _id: id });
  return { $or: clauses };
}

async function findQuoteByAnyId(id) {
  let quote = null;
  if (mongoose.Types.ObjectId.isValid(id)) quote = await Quote.findById(id).lean();
  if (!quote) quote = await Quote.findOne(adminQuoteQuery(id)).lean();
  return quote;
}

async function findQuoteDocumentByAnyId(id) {
  let quote = null;
  if (id && mongoose.Types.ObjectId.isValid(id)) quote = await Quote.findById(id);
  if (!quote && id) quote = await Quote.findOne(adminQuoteQuery(id));
  return quote;
}

function quoteFileExt(name) {
  return path.extname(String(name || "")).toLowerCase();
}

function decodeUploadOriginalName(name) {
  const text = String(name || "").trim();
  if (!text) return "quote";
  try {
    const decoded = Buffer.from(text, "latin1").toString("utf8");
    return /Ã|Â|ã|Ná|á»|�/.test(text) && decoded ? decoded : text;
  } catch {
    return text;
  }
}

function absolutePublicUrl(req, url) {
  const text = String(url || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  const host = req.get("x-forwarded-host") || req.get("host");
  if (!host) return text;
  return `${proto}://${host}${text.startsWith("/") ? text : `/${text}`}`;
}

function publicQuoteFile(file, req) {
  if (!file) return file;
  const item = typeof file.toObject === "function" ? file.toObject() : { ...file };
  const url = absolutePublicUrl(req, item.fileUrl || item.url || item.secureUrl || item.secure_url || item.downloadUrl || item.pdfUrl || "");
  return {
    ...item,
    fileUrl: url,
    url,
    downloadUrl: absolutePublicUrl(req, item.downloadUrl || url),
    originalName: decodeUploadOriginalName(item.originalName || item.name || item.fileName || item.filename || ""),
    filename: item.filename || item.fileName || "",
    size: Number(item.size || item.fileSize || 0),
    fileSize: Number(item.fileSize || item.size || 0)
  };
}

function aiSettingsFromOverview(overview) {
  const defaults = DEFAULT_OVERVIEW_SETTINGS.aiSettings;
  const settings = Object.assign({}, defaults, overview?.aiSettings || {});
  Object.keys(defaults).forEach(key => {
    settings[key] = settings[key] !== false;
  });
  return settings;
}

function requestAnalysisText(payload = {}) {
  return [
    payload.title,
    payload.category,
    payload.content,
    payload.address,
    mediaTextForAnalysis(payload.mediaFiles),
    Array.isArray(payload.issueTags) ? payload.issueTags.join(" ") : payload.issueTags,
    Array.isArray(payload.workTypeIds) ? payload.workTypeIds.join(" ") : payload.workTypeIds,
    payload.note,
    payload.contact
  ].filter(Boolean).join(" ").toLowerCase();
}

function suggestRequestUrgency(payload = {}) {
  const text = requestAnalysisText(payload);
  const urgentWords = [
    "mất điện", "mat dien", "chập điện", "chap dien", "rò điện", "ro dien",
    "nguy hiểm", "nguy hiem", "không hoạt động", "khong hoat dong",
    "cần gấp", "can gap", "hôm nay", "hom nay", "khẩn cấp", "khan cap",
    "緊急", "至急", "急ぎ", "停電", "漏電", "危険", "動かない", "本日中"
  ];
  const highWords = ["gấp", "gap", "sớm", "som", "trong ngày", "trong ngay", "早め", "早急", "できるだけ早く"];
  const lowWords = ["tham khảo", "tham khao", "hỏi", "hoi", "tư vấn", "tu van", "見積だけ", "相談", "参考"];
  if (urgentWords.some(word => text.includes(word.toLowerCase()))) {
    return { urgency: "urgent", reason: "AI detected urgent safety/outage keywords in the request." };
  }
  if (highWords.some(word => text.includes(word.toLowerCase()))) {
    return { urgency: "high", reason: "AI detected words that indicate quick handling is preferred." };
  }
  if (lowWords.some(word => text.includes(word.toLowerCase()))) {
    return { urgency: "low", reason: "AI detected consultation/reference wording without immediate handling need." };
  }
  return { urgency: "normal", reason: "AI did not detect urgent terms, so normal priority is suggested." };
}

function suggestedDueDateForUrgency(urgency) {
  const daysByUrgency = { urgent: 0, high: 1, normal: 3, low: 7 };
  const due = new Date();
  due.setHours(18, 0, 0, 0);
  due.setDate(due.getDate() + (daysByUrgency[urgency] ?? 3));
  return due;
}

function pushAssignmentHistory(item, action, note, actor = "ai") {
  item.assignmentHistory = Array.isArray(item.assignmentHistory) ? item.assignmentHistory : [];
  item.assignmentHistory.push({
    time: new Date(),
    actor,
    action,
    note: String(note || "").trim()
  });
}

function saveQuoteUploadFile(file, requestNo) {
  const originalName = decodeUploadOriginalName(file.originalname);
  const ext = quoteFileExt(originalName);
  const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "quote";
  const fileName = `${requestNo}-${Date.now()}-${safeBase}${ext}`;
  const filePath = path.join(quoteUploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  const fileUrl = `/uploads/quote-files/${encodeURIComponent(fileName)}`;
  return {
    fileName,
    filename: fileName,
    filePath,
    fileUrl,
    url: fileUrl,
    downloadUrl: fileUrl,
    originalName,
    ext
  };
}

function newServerQuoteNo() {
  return "Q-" + new Date().getFullYear() + "-" + String(Date.now()).slice(-5);
}

async function generateQuoteNo() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const quoteNo = "Q-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const exists = await Quote.exists({ $or: [{ quoteNo }, { quoteCode: quoteNo }, { code: quoteNo }, { number: quoteNo }] });
    if (!exists) return quoteNo;
  }
  return newServerQuoteNo();
}

async function findRequestByAnyId(id) {
  let request = null;
  if (mongoose.Types.ObjectId.isValid(id)) request = await Request.findById(id);
  if (!request) {
    request = await Request.findOne({
      $or: [
        { id },
        { requestCode: id },
        { requestId: id },
        { requestNo: id },
        { code: id }
      ]
    });
  }
  return request;
}

function getRequestDisplayId(request) {
  return (
    request?.requestNo ||
    request?.code ||
    request?.requestCode ||
    (/^[a-f\d]{24}$/i.test(String(request?.requestId || "")) ? "" : request?.requestId) ||
    ""
  );
}

function normalizeQuotePayloadForDb(body = {}) {
  const quoteNo = body.quoteNo || body.quoteCode || body.quoteNumber || body.code || body.number || newServerQuoteNo();
  const rawItems = Array.isArray(body.quoteItems) && body.quoteItems.length ? body.quoteItems : Array.isArray(body.items) ? body.items : [];
  const items = rawItems.map(item => {
    const quantity = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unitPrice || item.price || 0);
    const discountRate = Number(item.discountPercent ?? item.discountRate ?? item.discount ?? 0);
    const lineSubtotal = quantity * unitPrice;
    const amount = Number(item.amount ?? Math.max(0, lineSubtotal - Math.round(lineSubtotal * discountRate / 100)));
    return {
      id: item.id || "",
      name: item.name || item.title || "",
      title: item.title || item.name || "",
      description: item.description || item.spec || "",
      spec: item.spec || item.description || "",
      unit: item.unit || "\u5f0f",
      quantity,
      qty: Number(item.qty || item.quantity || 1),
      unitPrice,
      price: Number(item.price || item.unitPrice || 0),
      discount: discountRate,
      discountRate,
      amount
    };
  });
  const subtotal = Number(body.subtotal ?? items.reduce((sum, item) => sum + Number(item.amount || 0), 0));
  const discount = Number(body.discountTotal ?? body.discount ?? 0);
  const taxable = Math.max(0, subtotal - discount);
  const rawTaxRate = body.vatRate ?? body.taxRate ?? 0.1;
  const taxRate = Number(rawTaxRate) <= 1 ? Number(rawTaxRate || 0.1) : Number(rawTaxRate || 10) / 100;
  const taxAmount = Number(body.taxAmount ?? body.tax ?? body.vatAmount ?? Math.round(taxable * taxRate));
  const rounding = Number(body.rounding || 0);
  const total = Math.max(0, Number(body.total ?? taxable + taxAmount + rounding));
  return {
    id: body.id || "",
    quoteCode: quoteNo,
    quoteNo,
    quoteNumber: body.quoteNumber || quoteNo,
    code: body.code || quoteNo,
    number: body.number || quoteNo,
    requestId: body.requestId || body.linkedRequestId || "",
    userId: body.userId || "",
    customerId: body.customerId || "",
    customerName: body.customerName || body.name || "",
    customerCompany: body.customerCompany || body.company || "",
    customerPerson: body.customerPerson || body.contactPerson || "",
    customerPhone: body.customerPhone || body.phone || "",
    customerEmail: body.customerEmail || body.email || "",
    customerAddress: body.customerAddress || body.projectAddress || body.address || "",
    phone: body.phone || body.customerPhone || "",
    email: body.email || body.customerEmail || "",
    address: body.address || body.projectAddress || body.customerAddress || "",
    company: body.company || body.customerCompany || "",
    name: body.name || body.customerName || "",
    projectName: body.projectName || body.title || "",
    title: body.title || body.projectName || "",
    content: body.content || body.projectName || body.title || "",
    description: body.description || body.customerNote || "",
    assigneeName: body.assigneeName || body.staffName || "",
    staffName: body.staffName || body.assigneeName || "",
    departmentName: body.departmentName || body.department || "",
    department: body.department || body.departmentName || "",
    validUntil: body.validUntil || body.expireDate || body.validDate || "",
    expireDate: body.expireDate || body.validUntil || "",
    validDate: body.validDate || body.validUntil || "",
    status: body.status || "draft",
    items,
    quoteItems: items,
    subtotal,
    discount,
    discountTotal: discount,
    tax: taxAmount,
    taxAmount,
    vatAmount: taxAmount,
    taxRate,
    vatRate: Number(body.vatRate ?? taxRate),
    rounding,
    total,
    currency: body.currency || "JPY",
    paymentTerms: body.paymentTerms || "",
    note: body.note || body.customerNote || "",
    customerNote: body.customerNote || body.note || "",
    internalNote: body.internalNote || "",
    pdfUrl: body.pdfUrl || "",
    pdfPublicId: body.pdfPublicId || "",
    sentToCustomer: body.sentToCustomer === true || body.visibleToCustomer === true,
    sentAt: body.sentAt || body.sentToCustomerAt || null,
    customerResponse: ["pending", "accepted", "revision_requested", "rejected"].includes(body.customerResponse) ? body.customerResponse : "pending",
    customerResponseNote: body.customerResponseNote || "",
    customerRespondedAt: body.customerRespondedAt || null,
    isDeleted: body.isDeleted === true,
    deletedAt: body.deletedAt || null,
    updatedAt: new Date()
  };
}

app.post("/admin/quotes", requireAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    const lookupIds = [
      body._id,
      body.quoteNo,
      body.quoteCode,
      body.quoteNumber,
      body.code,
      body.id,
      body.number
    ].filter(Boolean);
    let quote = null;
    for (const id of lookupIds) {
      quote = await findQuoteDocumentByAnyId(String(id));
      if (quote) break;
    }
    const payload = normalizeQuotePayloadForDb(body);
    if (!quote) {
      quote = new Quote({ ...payload, createdAt: body.createdAt || new Date() });
    } else {
      Object.assign(quote, payload);
      if (!quote.createdAt) quote.createdAt = body.createdAt || new Date();
    }
    await quote.save();
    res.json({ ok: true, quote: quote.toObject() });
  } catch (error) {
    console.error("Quote save failed:", error);
    res.status(500).json({ ok: false, message: "Quote save failed", error: error.message });
  }
});

app.post("/admin/requests/:requestId/quote-file", requireAdmin, quoteUploadMiddleware, async (req, res) => {
  try {
    const request = await findRequestByAnyId(req.params.requestId);
    if (!request) return res.status(404).json({ ok: false, message: "Request not found" });
    const uploadFiles = Array.isArray(req.files) ? req.files : (req.file ? [req.file] : []);
    const quoteFileError = quoteFilesValidationMessage(uploadFiles);
    if (quoteFileError) return res.status(400).json({ ok: false, message: quoteFileError });
    const requestNo = await ensureRequestCode(request);
    const now = new Date();
    const wasQuoteSent = request.quoteSent === true || Number(request.quoteFileCount || 0) > 0 ||
      (Array.isArray(request.quotationFiles) && request.quotationFiles.length > 0) ||
      (Array.isArray(request.quoteFiles) && request.quoteFiles.length > 0);
    const uploadedBy = req.admin?.email || req.admin?.name || "admin";
    const quoteFileRecords = uploadFiles.map((file, index) => {
      const saved = saveQuoteUploadFile(file, requestNo);
      const quoteId = `${requestNo}-quote-file-${Date.now()}-${index + 1}`;
      return {
        quoteId,
        id: quoteId,
        requestId: requestNo,
        fileName: saved.fileName,
        filename: saved.filename || saved.fileName,
        originalName: saved.originalName,
        fileUrl: saved.fileUrl,
        url: saved.url || saved.fileUrl,
        downloadUrl: saved.downloadUrl || saved.fileUrl,
        filePath: saved.filePath,
        mimeType: file.mimetype,
        fileSize: file.size,
        size: file.size,
        ext: saved.ext,
        sentAt: now,
        uploadedAt: now,
        uploadedBy
      };
    });
    const quotes = [];
    for (const [index, file] of uploadFiles.entries()) {
      const savedRecord = quoteFileRecords[index];
      const payload = {
      id: savedRecord.id,
      quoteCode: requestNo,
      quoteNo: requestNo,
      quoteNumber: requestNo,
      code: requestNo,
      number: requestNo,
      requestId: requestNo,
      userId: request.userId ? String(request.userId) : "",
      customerId: request.userId ? String(request.userId) : "",
      customerName: request.name || "",
      name: request.name || "",
      customerPhone: request.phone || "",
      phone: request.phone || "",
      customerEmail: request.email || request.contact || "",
      email: request.email || request.contact || "",
      customerAddress: request.address || "",
      address: request.address || "",
      projectName: request.projectName || request.title || request.content || "",
      title: request.projectName || request.title || request.content || "",
      content: request.content || "",
      description: request.content || "",
      assigneeName: request.assigneeName || "",
      status: "sent_to_customer",
      quoteItems: [],
      items: [],
      subtotal: 0,
      taxAmount: 0,
      vatAmount: 0,
      total: 0,
      currency: "JPY",
      sentToCustomer: true,
      visibleToCustomer: true,
      sentAt: now,
      fileUrl: savedRecord.fileUrl,
      url: savedRecord.url,
      downloadUrl: savedRecord.downloadUrl,
      filePath: savedRecord.filePath,
      originalName: savedRecord.originalName,
      fileName: savedRecord.fileName,
      filename: savedRecord.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      size: file.size,
      ext: savedRecord.ext,
      quoteFiles: quoteFileRecords,
      quotationFiles: quoteFileRecords,
      quoteFileCount: quoteFileRecords.length,
      updatedAt: now
      };
      const quote = new Quote({ ...payload, createdAt: now });
      await quote.save();
      quotes.push(quote);
    }

    request.quoteId = quotes[0]?._id || request.quoteId;
    request.quoteRequested = true;
    request.quotedAt = request.quotedAt || now;
    request.quoteSent = true;
    request.quoteSentAt = now;
    if (wasQuoteSent) request.quoteUpdatedAt = now;
    request.quoteFiles = quoteFileRecords;
    request.quotationFiles = quoteFileRecords;
    request.quoteFileCount = quoteFileRecords.length;
    request.quoteSentBy = req.admin?.email || req.admin?.name || "admin";
    request.quoteStatus = "sent";
    await request.save();
    notifyCustomerEmail(wasQuoteSent ? "quote_updated" : "quote_sent", {
      request,
      fileCount: quoteFileRecords.length,
      adminNote: req.body?.adminNote || req.body?.adminReply || req.body?.note || ""
    });

    const data = quotes.map(quote => quote.toObject());
    res.json({ ok: true, quote: data[0] || null, quotes: data, data, request: await publicRequestWithLatestCustomerEmail(request) });
  } catch (error) {
    console.error("Quote file upload failed:", error);
    res.status(500).json({ ok: false, message: error.message || "Quote file upload failed" });
  }
});

app.post("/admin/requests/:requestId/create-quote", requireAdmin, async (req, res) => {
  try {
    const request = await findRequestByAnyId(req.params.requestId);
    if (!request) return res.status(404).json({ ok: false, message: "Request not found" });
    const requestDisplayId = String(getRequestDisplayId(request) || req.params.requestId);

    if (request.quoteId) {
      const existingQuote = await Quote.findById(request.quoteId);
      if (existingQuote) {
        if (requestDisplayId && String(existingQuote.requestId || "") !== requestDisplayId) {
          existingQuote.requestId = requestDisplayId;
          await existingQuote.save();
        }
        return res.json({ ok: true, quote: existingQuote.toObject(), request: await publicRequestWithLatestCustomerEmail(request), reused: true });
      }
    }

    const quoteNo = await generateQuoteNo();
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const spec = Array.isArray(request.issueTags) && request.issueTags.length
      ? request.issueTags.join(", ")
      : (request.issueTags || request.content || "");
    const item = {
      name: request.content || request.title || "\u5de5\u4e8b\u4e00\u5f0f",
      title: request.content || request.title || "\u5de5\u4e8b\u4e00\u5f0f",
      description: spec,
      spec,
      unit: "\u5f0f",
      quantity: 1,
      qty: 1,
      unitPrice: 0,
      price: 0,
      discount: 0,
      discountRate: 0,
      amount: 0
    };
    const payload = {
      id: quoteNo,
      quoteCode: quoteNo,
      quoteNo,
      quoteNumber: quoteNo,
      code: quoteNo,
      number: quoteNo,
      requestId: requestDisplayId,
      userId: request.userId ? String(request.userId) : "",
      customerName: request.name || "",
      name: request.name || "",
      customerPhone: request.phone || "",
      phone: request.phone || "",
      customerEmail: request.email || request.contact || "",
      email: request.email || request.contact || "",
      customerAddress: request.address || "",
      address: request.address || "",
      projectName: request.projectName || request.title || request.content || "\u5de5\u4e8b\u4e00\u5f0f",
      title: request.projectName || request.title || request.content || "\u5de5\u4e8b\u4e00\u5f0f",
      content: request.content || "",
      description: request.content || "",
      assigneeName: request.assigneeName || "",
      validUntil,
      expireDate: validUntil,
      validDate: validUntil,
      status: "draft",
      quoteItems: [item],
      items: [item],
      subtotal: 0,
      discount: 0,
      tax: 0,
      taxAmount: 0,
      vatAmount: 0,
      total: 0,
      currency: "JPY",
      paymentTerms: "\u691c\u53ce\u5f8c30\u65e5\u4ee5\u5185",
      note: "",
      customerNote: "",
      sentToCustomer: false,
      customerResponse: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const quote = await Quote.create(payload);

    request.quoteId = quote._id;
    request.quoteRequested = true;
    request.quotedAt = new Date();
    if (typeof request.status === "string") request.status = "quoted";
    await request.save();

    res.json({ ok: true, quote: quote.toObject(), request: await publicRequestWithLatestCustomerEmail(request), reused: false });
  } catch (error) {
    console.error("Create quote from request error:", error);
    res.status(500).json({ ok: false, message: "Create quote from request failed", error: error.message });
  }
});

app.get("/admin/quotes/:id/pdf", requireAdmin, async (req, res) => {
  try {
    console.log("PDF quote lookup id:", req.params.id);
    const quote = await findQuoteByAnyId(req.params.id);
    console.log("PDF quote found:", !!quote);
    if (!quote) return res.status(404).json({ ok: false, message: "Quote not found", id: req.params.id });
    const normalized = normalizeQuoteForPdf(quote);
    const pdfFileName = quotePdfFileName(normalized);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${pdfFileName}"`);
    const doc = createQuotationPdf(normalized, { lang: req.query.lang === "vi" ? "vi" : "ja" });
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    if (!res.headersSent) res.status(500).json({ ok: false, message: "PDF export failed" });
    else res.end();
  }
});

app.delete("/admin/quotes/:id", requireAdmin, async (req, res) => {
  try {
    const quote = await Quote.findOne(adminQuoteQuery(req.params.id));
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    if (req.query.permanent === "true") {
      await Quote.deleteOne({ _id: quote._id });
      return res.json({ message: "Quote permanently deleted" });
    }
    quote.isDeleted = true;
    quote.deletedAt = new Date();
    quote.deletedByRole = "admin";
    await quote.save();
    res.json({ message: "Quote moved to trash", data: quote });
  } catch (error) {
    res.status(500).json({ message: "Quote delete failed", error: error.message });
  }
});

app.patch("/admin/quotes/:id/restore", requireAdmin, async (req, res) => {
  try {
    const quote = await Quote.findOne(adminQuoteQuery(req.params.id));
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    quote.isDeleted = false;
    quote.deletedAt = null;
    quote.deletedBy = "";
    quote.deletedByRole = "";
    await quote.save();
    res.json({ message: "Quote restored", data: quote });
  } catch (error) {
    res.status(500).json({ message: "Quote restore failed", error: error.message });
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

    if (req.query.permanent === "true") {
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

app.get("/api/staff/:id/profile", async (req, res) => {
  try {
    const staff = mongoose.Types.ObjectId.isValid(req.params.id)
      ? await Staff.findById(req.params.id)
      : null;

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({
      data: publicStaffProfile(staff)
    });
  } catch (error) {
    res.status(500).json({
      message: "Staff profile read failed",
      error: error.message
    });
  }
});

app.post("/admin/staff", requireAdmin, upload.single("avatar"), async (req, res) => {
  try {
    const workTags = Array.isArray(req.body.workTags)
      ? req.body.workTags.map(item => String(item || "").trim()).filter(Boolean)
      : parseRequestTags(req.body.workTags);
    const workTypeIds = Array.isArray(req.body.workTypeIds)
      ? req.body.workTypeIds.map(item => String(item || "").trim()).filter(Boolean)
      : parseRequestTags(req.body.workTypeIds);
    const departmentTokens = normalizeTagList([req.body.department, req.body.departmentCode, req.body.areas]);
    const cleanWorkTags = workTags.filter(tag => !departmentTokens.includes(normalizeAssignmentTag(tag)));

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
      skills: req.body.skills || cleanWorkTags.join(", "),
      department: req.body.department || req.body.areas || "",
      departmentCode: req.body.departmentCode || "",
      autoAssignEnabled: req.body.autoAssignEnabled === undefined ? true : req.body.autoAssignEnabled === true || req.body.autoAssignEnabled === "true",
      role: req.body.role || req.body.position || req.body.title || "",
      position: req.body.position || "",
      title: req.body.title || "",
      workContent: "",
      workTags: cleanWorkTags,
      workTypeIds,
      staffDescription: req.body.staffDescription || req.body.introduction || "",
      note: req.body.note || req.body.introduction || "",
      introduction: req.body.introduction || "",
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

    ["name", "phone", "email", "areas", "skills", "department", "role", "position", "title", "staffDescription", "note", "introduction", "status"].forEach(field => {
      if (req.body[field] !== undefined) staff[field] = req.body[field];
    });
    if (req.body.departmentCode !== undefined) staff.departmentCode = req.body.departmentCode;
    if (req.body.autoAssignEnabled !== undefined) staff.autoAssignEnabled = req.body.autoAssignEnabled === true || req.body.autoAssignEnabled === "true";

    if (req.body.workTags !== undefined) {
      const departmentTokens = normalizeTagList([req.body.department ?? staff.department, req.body.departmentCode ?? staff.departmentCode, req.body.areas ?? staff.areas]);
      staff.workTags = Array.isArray(req.body.workTags)
        ? req.body.workTags.map(item => String(item || "").trim()).filter(Boolean)
        : parseRequestTags(req.body.workTags);
      staff.workTags = staff.workTags.filter(tag => !departmentTokens.includes(normalizeAssignmentTag(tag)));
    }
    if (req.body.workTypeIds !== undefined) {
      staff.workTypeIds = Array.isArray(req.body.workTypeIds)
        ? req.body.workTypeIds.map(item => String(item || "").trim()).filter(Boolean)
        : parseRequestTags(req.body.workTypeIds);
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

    if (req.query.permanent === "true") {
      await Staff.deleteOne({ _id: req.params.id });
      await Request.updateMany(
        { assigneeId: req.params.id },
        { $set: { assigneeId: "", assigneeName: "" } }
      );
      return res.json({ message: "Staff permanently deleted" });
    }

    staff.status = "deleted";
    staff.deletedAt = new Date();
    await staff.save();

    res.json({ message: "Staff moved to trash", data: staff });

  } catch (error) {
    res.status(500).json({
      message: "Staff delete failed",
      error: error.message
    });
  }
});

app.patch("/admin/staff/:id/restore", requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.status = "active";
    staff.deletedAt = undefined;
    await staff.save();
    res.json({ message: "Staff restored", data: staff });
  } catch (error) {
    res.status(500).json({
      message: "Staff restore failed",
      error: error.message
    });
  }
});

app.get("/api/work-master", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await loadWorkMaster({ activeOnly: true }));
  } catch (error) {
    res.status(500).json({ message: "Work master load failed", error: error.message });
  }
});

app.get("/admin/work-master", requireAdmin, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    res.json(await loadWorkMaster({ activeOnly: false }));
  } catch (error) {
    res.status(500).json({ message: "Work master load failed", error: error.message });
  }
});

app.get("/api/admin/trash", requireAdmin, async (req, res) => {
  try {
    const type = cleanText(req.query.type || "settings");
    const normalized = ["settings", "department", "workType", "skill"].includes(type) ? type : "settings";
    const items = await loadSettingsTrash(normalized);
    res.set("Cache-Control", "no-store");
    res.json({ ok: true, type: normalized, count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: "Trash load failed", error: error.message });
  }
});

app.get("/api/admin/trash/settings", requireAdmin, async (req, res) => {
  try {
    const items = await loadSettingsTrash("settings");
    res.set("Cache-Control", "no-store");
    res.json({ ok: true, type: "settings", count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: "Trash load failed", error: error.message });
  }
});

app.post("/admin/departments", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa"]));
    payload.code = slugifyCode(payload.code || payload.name || payload.nameVi || payload.nameJa, "department");
    payload.createdAt = now;
    payload.updatedAt = now;
    const item = await Department.create(payload);
    res.json({ message: "Department saved", data: publicDepartment(item) });
  } catch (error) {
    res.status(400).json({ message: "Department save failed", error: error.message });
  }
});

app.put("/admin/departments/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Department.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Department not found" });
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa"]));
    if (payload.code) {
      const nextCode = slugifyCode(payload.code, item.code);
      if (nextCode !== item.code) {
        const related = await Promise.all([
          Staff.countDocuments({ $or: [{ departmentCode: item.code }, { department: new RegExp(item.nameVi || item.nameJa || item.code, "i") }] }),
          Request.countDocuments({ departmentCode: item.code }),
          WorkType.countDocuments({ departmentCode: item.code }),
          WorkGroup.countDocuments({ departmentCode: item.code })
        ]);
        const relatedCount = related.reduce((sum, count) => sum + count, 0);
        if (relatedCount > 0) {
          delete payload.code;
        } else {
          payload.code = nextCode;
        }
      } else {
        payload.code = nextCode;
      }
    }
    Object.assign(item, payload, { updatedAt: new Date() });
    await item.save();
    res.json({ message: "Department saved", data: publicDepartment(item) });
  } catch (error) {
    res.status(400).json({ message: "Department save failed", error: error.message });
  }
});

app.put("/admin/departments/:id/status", requireAdmin, async (req, res) => {
  try {
    const item = await Department.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Department not found" });
    item.active = req.body.active === true || req.body.active === "true";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Department status saved", data: publicDepartment(item) });
  } catch (error) {
    res.status(400).json({ message: "Department status failed", error: error.message });
  }
});

app.delete("/admin/departments/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Department.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Department not found" });
    const counts = await departmentRelationCounts(item);
    const protected = isMasterProtected(item);
    const decision = departmentDeleteDecision(counts, protected);
    const relatedWorkTypes = decision.reason === "SOFT_RELATIONS_ONLY" ? await departmentRelatedWorkTypes(item) : [];
    console.log("[DEPARTMENT_DELETE_CHECK]", {
      departmentId: String(item._id || ""),
      departmentCode: item.code || "",
      ...counts,
      protected,
      canDelete: decision.canDelete,
      canDeleteWithSoftUnlink: decision.canDeleteWithSoftUnlink,
      hardRelations: decision.hardRelations,
      softRelations: decision.softRelations,
      reason: decision.reason
    });
    if (protected) return res.status(409).json(protectedMasterError(publicDepartment(item)));
    if (decision.reason === "HARD_RELATIONS") {
      return res.status(409).json(departmentHardRelationError(publicDepartment(item), counts, decision));
    }
    if (decision.reason === "SOFT_RELATIONS_ONLY" && req.query.unlinkSoftRelations !== "true") {
      return res.status(409).json(departmentSoftRelationResponse(publicDepartment(item), counts, decision, relatedWorkTypes));
    }
    if (req.query.permanent === "true") {
      await item.deleteOne();
      return res.json({ message: "Department permanently deleted", data: publicDepartment(item), relatedCount: 0 });
    }
    if (decision.reason === "SOFT_RELATIONS_ONLY") {
      await unlinkDepartmentSoftRelations(item);
    }
    await softDeleteMasterItem(item, "department", req);
    res.json({
      message: "Department moved to trash",
      data: publicDepartment(item),
      relatedCount: 0,
      ...decision
    });
  } catch (error) {
    res.status(400).json({ message: "Department delete failed", error: error.message });
  }
});

app.patch("/admin/departments/:id/restore", requireAdmin, async (req, res) => {
  try {
    const item = await Department.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Department not found" });
    const duplicate = await Department.findOne({ _id: { $ne: item._id }, code: item.code, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
    if (duplicate) return res.status(409).json({ errorCode: "MASTER_CODE_CONFLICT", message: "Mã bộ phận đã tồn tại, không thể khôi phục." });
    item.isDeleted = false;
    item.deletedAt = null;
    item.deletedBy = "";
    item.trashType = "";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Department restored", data: publicDepartment(item) });
  } catch (error) {
    res.status(400).json({ message: "Department restore failed", error: error.message });
  }
});

app.post("/admin/work-groups", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const payload = cleanMasterPayload(req.body || {}, ["departmentCode", "code", "nameVi", "nameJa", "descriptionVi", "descriptionJa"]);
    payload.departmentCode = slugifyCode(payload.departmentCode, "other");
    payload.code = payload.code ? slugifyCode(payload.code, "group") : `${payload.departmentCode}_${slugifyCode(payload.nameVi || payload.nameJa, "group")}`;
    payload.createdAt = now;
    payload.updatedAt = now;
    const item = await WorkGroup.create(payload);
    res.json({ message: "Work group saved", data: publicWorkGroup(item) });
  } catch (error) {
    res.status(400).json({ message: "Work group save failed", error: error.message });
  }
});

app.put("/admin/work-groups/:id", requireAdmin, async (req, res) => {
  try {
    const item = await WorkGroup.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work group not found" });
    const payload = cleanMasterPayload(req.body || {}, ["departmentCode", "code", "nameVi", "nameJa", "descriptionVi", "descriptionJa"]);
    if (payload.departmentCode) payload.departmentCode = slugifyCode(payload.departmentCode, item.departmentCode);
    if (payload.code) payload.code = slugifyCode(payload.code, item.code);
    Object.assign(item, payload, { updatedAt: new Date() });
    await item.save();
    res.json({ message: "Work group saved", data: publicWorkGroup(item) });
  } catch (error) {
    res.status(400).json({ message: "Work group save failed", error: error.message });
  }
});

app.put("/admin/work-groups/:id/status", requireAdmin, async (req, res) => {
  try {
    const item = await WorkGroup.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work group not found" });
    item.active = req.body.active === true || req.body.active === "true";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Work group status saved", data: publicWorkGroup(item) });
  } catch (error) {
    res.status(400).json({ message: "Work group status failed", error: error.message });
  }
});

app.delete("/admin/work-groups/:id", requireAdmin, async (req, res) => {
  try {
    const item = await WorkGroup.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work group not found" });
    const relatedCount = await WorkType.countDocuments({ workGroupCode: item.code });
    item.active = false;
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: relatedCount ? "Work group has related data and was hidden" : "Work group hidden", data: publicWorkGroup(item), relatedCount });
  } catch (error) {
    res.status(400).json({ message: "Work group delete failed", error: error.message });
  }
});

app.post("/admin/work-types", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["departmentCode", "workGroupCode", "code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa", "keywords"]));
    payload.departmentCode = slugifyCode(payload.departmentCode, "other");
    payload.workGroupCode = payload.workGroupCode ? slugifyCode(payload.workGroupCode, "") : "";
    payload.code = slugifyCode(payload.code || payload.name || payload.nameVi || payload.nameJa, "work_type");
    payload.createdAt = now;
    payload.updatedAt = now;
    const item = await WorkType.create(payload);
    res.json({ message: "Work type saved", data: publicWorkType(item) });
  } catch (error) {
    res.status(400).json({ message: "Work type save failed", error: error.message });
  }
});

app.put("/admin/work-types/:id", requireAdmin, async (req, res) => {
  try {
    const item = await WorkType.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work type not found" });
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["departmentCode", "workGroupCode", "code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa", "keywords"]));
    if (payload.departmentCode) payload.departmentCode = slugifyCode(payload.departmentCode, item.departmentCode);
    if (payload.workGroupCode) payload.workGroupCode = slugifyCode(payload.workGroupCode, "");
    if (payload.code) payload.code = slugifyCode(payload.code, item.code);
    Object.assign(item, payload, { updatedAt: new Date() });
    await item.save();
    res.json({ message: "Work type saved", data: publicWorkType(item) });
  } catch (error) {
    res.status(400).json({ message: "Work type save failed", error: error.message });
  }
});

app.put("/admin/work-types/:id/status", requireAdmin, async (req, res) => {
  try {
    const item = await WorkType.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work type not found" });
    item.active = req.body.active === true || req.body.active === "true";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Work type status saved", data: publicWorkType(item) });
  } catch (error) {
    res.status(400).json({ message: "Work type status failed", error: error.message });
  }
});

app.delete("/admin/work-types/:id", requireAdmin, async (req, res) => {
  try {
    const item = await WorkType.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work type not found" });
    const counts = await workTypeRelationCounts(item);
    const relatedCount = totalMasterRelations(counts);
    const protected = isMasterProtected(item);
    const canDelete = !protected && relatedCount === 0;
    console.log("[WORKTYPE_DELETE_CHECK]", {
      workTypeId: String(item._id || ""),
      code: item.code || "",
      ...counts,
      relatedMappingCount: counts.relatedSkillCount || 0,
      protected,
      canDelete
    });
    if (protected) return res.status(409).json(protectedMasterError(publicWorkType(item)));
    if (relatedCount > 0) return res.status(409).json(masterRelationError(publicWorkType(item), counts));
    if (req.query.permanent === "true") {
      await item.deleteOne();
      return res.json({ message: "Work type permanently deleted", data: publicWorkType(item), relatedCount: 0 });
    }
    await softDeleteMasterItem(item, "workType", req);
    res.json({ message: "Work type moved to trash", data: publicWorkType(item), relatedCount: 0 });
  } catch (error) {
    res.status(400).json({ message: "Work type delete failed", error: error.message });
  }
});

app.patch("/admin/work-types/:id/restore", requireAdmin, async (req, res) => {
  try {
    const item = await WorkType.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Work type not found" });
    const duplicate = await WorkType.findOne({ _id: { $ne: item._id }, code: item.code, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
    if (duplicate) return res.status(409).json({ errorCode: "MASTER_CODE_CONFLICT", message: "Mã nội dung công việc đã tồn tại, không thể khôi phục." });
    if (item.departmentCode) {
      const department = await Department.findOne({ code: item.departmentCode, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
      if (!department) item.departmentCode = "";
    }
    item.isDeleted = false;
    item.deletedAt = null;
    item.deletedBy = "";
    item.trashType = "";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Work type restored", data: publicWorkType(item) });
  } catch (error) {
    res.status(400).json({ message: "Work type restore failed", error: error.message });
  }
});

app.get("/admin/skills", requireAdmin, async (req, res) => {
  try {
    const skills = await Skill.find().sort({ sortOrder: 1, createdAt: 1 });
    res.json({ data: skills.map(publicSkill) });
  } catch (error) {
    res.status(500).json({ message: "Skill load failed", error: error.message });
  }
});

app.post("/admin/skills", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa"]));
    payload.code = slugifyCode(payload.code || payload.name || payload.nameVi || payload.nameJa, "skill");
    payload.createdAt = now;
    payload.updatedAt = now;
    const item = await Skill.create(payload);
    res.json({ message: "Skill saved", data: publicSkill(item) });
  } catch (error) {
    res.status(400).json({ message: "Skill save failed", error: error.message });
  }
});

app.put("/admin/skills/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Skill.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Skill not found" });
    const payload = normalizeLocalizedMasterPayload(cleanMasterPayload(req.body || {}, ["code", "name", "nameVi", "nameJa", "description", "descriptionVi", "descriptionJa"]));
    if (payload.code) payload.code = slugifyCode(payload.code, item.code);
    Object.assign(item, payload, { updatedAt: new Date() });
    await item.save();
    res.json({ message: "Skill saved", data: publicSkill(item) });
  } catch (error) {
    res.status(400).json({ message: "Skill save failed", error: error.message });
  }
});

app.put("/admin/skills/:id/status", requireAdmin, async (req, res) => {
  try {
    const item = await Skill.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Skill not found" });
    item.active = req.body.active === true || req.body.active === "true";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Skill status saved", data: publicSkill(item) });
  } catch (error) {
    res.status(400).json({ message: "Skill status failed", error: error.message });
  }
});

app.delete("/admin/skills/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Skill.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Skill not found" });
    const counts = await skillRelationCounts(item);
    const relatedCount = totalMasterRelations(counts);
    const protected = isMasterProtected(item);
    const canDelete = !protected && relatedCount === 0;
    console.log("[SKILL_DELETE_CHECK]", {
      skillId: String(item._id || ""),
      skillCode: item.code || "",
      ...counts,
      protected,
      canDelete
    });
    if (protected) return res.status(409).json(protectedMasterError(publicSkill(item)));
    if (relatedCount > 0) return res.status(409).json(masterRelationError(publicSkill(item), counts));
    if (req.query.permanent === "true") {
      await item.deleteOne();
      return res.json({ message: "Skill permanently deleted", data: publicSkill(item), relatedCount: 0 });
    }
    await softDeleteMasterItem(item, "skill", req);
    res.json({ message: "Skill moved to trash", data: publicSkill(item), relatedCount: 0 });
  } catch (error) {
    res.status(400).json({ message: "Skill delete failed", error: error.message });
  }
});

app.patch("/admin/skills/:id/restore", requireAdmin, async (req, res) => {
  try {
    const item = await Skill.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Skill not found" });
    const duplicate = await Skill.findOne({ _id: { $ne: item._id }, code: item.code, isDeleted: { $ne: true }, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
    if (duplicate) return res.status(409).json({ errorCode: "MASTER_CODE_CONFLICT", message: "Mã kỹ năng đã tồn tại, không thể khôi phục." });
    item.isDeleted = false;
    item.deletedAt = null;
    item.deletedBy = "";
    item.trashType = "";
    item.updatedAt = new Date();
    await item.save();
    res.json({ message: "Skill restored", data: publicSkill(item) });
  } catch (error) {
    res.status(400).json({ message: "Skill restore failed", error: error.message });
  }
});

app.get("/admin/staff-mapping", requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ data: staff });
  } catch (error) {
    res.status(500).json({ message: "Staff mapping load failed", error: error.message });
  }
});

app.put("/admin/staff/:id/mapping", requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    const workTypeIds = Array.isArray(req.body.workTypeIds) ? req.body.workTypeIds : parseRequestTags(req.body.workTypeIds);
    const skillIds = Array.isArray(req.body.skillIds) ? req.body.skillIds : parseRequestTags(req.body.skillIds);
    if (req.body.departmentCode !== undefined) staff.departmentCode = cleanText(req.body.departmentCode);
    if (req.body.department !== undefined) staff.department = cleanText(req.body.department);
    if (req.body.areas !== undefined) staff.areas = cleanText(req.body.areas);
    if (req.body.workTypeIds !== undefined) staff.workTypeIds = workTypeIds.map(item => cleanText(item)).filter(Boolean);
    if (req.body.workTags !== undefined) staff.workTags = parseRequestTags(req.body.workTags);
    if (req.body.skills !== undefined || req.body.skillIds !== undefined) staff.skills = parseRequestTags(req.body.skills || skillIds).join(", ");
    if (req.body.autoAssignEnabled !== undefined) staff.autoAssignEnabled = req.body.autoAssignEnabled === true || req.body.autoAssignEnabled === "true";
    if (req.body.status !== undefined) staff.status = cleanText(req.body.status) || "active";
    await staff.save();
    res.json({ message: "Staff mapping saved", data: staff });
  } catch (error) {
    res.status(400).json({ message: "Staff mapping save failed", error: error.message });
  }
});

app.get("/api/work-options", requireUser, async (req, res) => {
  try {
    const master = await loadWorkMaster({ activeOnly: true });
    const options = master.workTypes.map(item => item.nameJa || item.nameVi || item.code).filter(Boolean);
    if (!options.length) {
      const staff = await Staff.find({ status: { $nin: ["off", "deleted"] } }).sort({ createdAt: -1 });
      options.push(...uniqueStaffWorkOptions(staff));
    }
    res.set("Cache-Control", "no-store");
    res.json({ data: options });
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
    const uploadValidationError = validateCustomerUploadFiles(files);
    if (uploadValidationError) {
      return res.status(400).json({
        success: false,
        code: "UPLOAD_LIMIT",
        message: uploadValidationError
      });
    }
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
          const uploadResult = await uploadMediaToCloudinary(file.buffer, uploadResourceTypeForFile(file));
          const ext = requestFileExt(file, uploadResult);
          const kind = requestFileKind(file, uploadResult);
          const secureUrl = uploadResult.secure_url || uploadResult.url || "";

          return {
            id: uploadResult.public_id || `${requestCode}-${file.originalname}`,
            url: secureUrl,
            secureUrl,
            downloadUrl: secureUrl,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type,
            format: uploadResult.format,
            filename: file.originalname,
            originalName: file.originalname,
            mimeType: file.mimetype,
            mimetype: file.mimetype,
            ext,
            size: file.size,
            kind,
            uploadedAt: new Date(),
            type: kind
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
    const overviewSettings = await getOverviewSettings();
    const aiSettings = aiSettingsFromOverview(overviewSettings);
    const initialIssueTags = parseRequestTags(req.body.issueTags);
    const initialWorkTypeIds = parseRequestTags(req.body.workTypeIds);
    const initialDepartmentCode = cleanText(req.body.departmentCode);
    const inferredWorkContext = aiSettings.aiRequestAnalysisEnabled
      ? await inferWorkContextForRequest({
          title: req.body.title || "",
          category: req.body.category || "",
          content: req.body.content || "",
          address: req.body.address || user.address || "",
          issueTags: initialIssueTags,
          workTypeIds: initialWorkTypeIds,
          departmentCode: initialDepartmentCode,
          mediaFiles
        })
      : {
          issueTags: initialIssueTags,
          workTypeIds: initialWorkTypeIds,
          departmentCode: initialDepartmentCode,
          matchedWorkTypes: [],
          matchedDepartments: [],
          requestText: ""
        };
    const issueTags = inferredWorkContext.issueTags;
    const workTypeIds = inferredWorkContext.workTypeIds;
    const departmentCode = inferredWorkContext.departmentCode;
    const requestAnalysisPayload = {
      title: req.body.title || "",
      category: req.body.category || "",
      content: req.body.content || "",
      address: req.body.address || user.address || "",
      issueTags,
      workTypeIds,
      departmentCode,
      mediaFiles,
      contact: req.body.contact || user.contact || ""
    };
    const urgencySuggestion = aiSettings.aiRequestAnalysisEnabled && aiSettings.aiSuggestUrgencyEnabled
      ? suggestRequestUrgency(requestAnalysisPayload)
      : { urgency: null, reason: "" };
    const dueSuggestion = aiSettings.aiRequestAnalysisEnabled && aiSettings.aiSuggestDueDateEnabled && urgencySuggestion.urgency
      ? suggestedDueDateForUrgency(urgencySuggestion.urgency)
      : null;
    const assignmentSuggestion = aiSettings.aiRequestAnalysisEnabled && aiSettings.aiSuggestAssigneeEnabled
      ? await buildAssignmentSuggestion({
          issueTags,
          workTypeIds,
          departmentCode,
          matchedWorkTypes: inferredWorkContext.matchedWorkTypes,
          matchedDepartments: inferredWorkContext.matchedDepartments,
          requestText: inferredWorkContext.requestText
        })
      : {
          assignmentCandidates: [],
          assignmentConfidence: 0,
          assignmentReason: aiSettings.aiRequestAnalysisEnabled
            ? "AI assignee suggestion is disabled in settings."
            : "AI request analysis is disabled in settings.",
          assignmentSource: "ai_disabled"
        };
    const primaryCandidate = assignmentSuggestion.assignmentCandidates?.[0] || null;
    const timeline = normalizeTimelineEvents([{
      id: "tl-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      type: "submitted",
      status: "submitted",
      message: "request.timelineSubmitted",
      note: "",
      actor: "user",
      createdAt: new Date()
    }]);
    const requestPayload = {
      id: requestCode,
      requestCode,
      requestId: requestCode,
      userId: String(user._id),
      name: req.body.name || user.name || "",
      phone: req.body.phone || user.phone || "",
      email: req.body.email || user.email || "",
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
      workTypeIds,
      departmentCode,
      autoTags: inferredWorkContext.matchedWorkTypes?.map(item => item.name || item.code).filter(Boolean) || [],
      autoCategory: inferredWorkContext.matchedWorkTypes?.[0]?.name || null,
      autoUrgency: urgencySuggestion.urgency || null,
      autoArea: null,
      aiAnalysisEnabled: aiSettings.aiRequestAnalysisEnabled,
      aiSuggestedUrgency: urgencySuggestion.urgency || null,
      aiSuggestedDueDate: dueSuggestion,
      aiSuggestedStaffId: primaryCandidate?.staffId || null,
      aiSuggestedStaffName: primaryCandidate?.staffName || null,
      aiSuggestedDepartmentCode: primaryCandidate?.departmentCode || null,
      aiSuggestedReason: [urgencySuggestion.reason, assignmentSuggestion.assignmentReason].filter(Boolean).join(" "),
      assignmentCandidates: assignmentSuggestion.assignmentCandidates,
      assignmentConfidence: assignmentSuggestion.assignmentConfidence,
      assignmentReason: assignmentSuggestion.assignmentReason,
      assignmentSource: assignmentSuggestion.assignmentSource,
      assignmentAcceptedAt: null,
      assignmentHistory: [],
      assignedBy: null,
      quoteRequested: req.body.quoteRequested === "true" || req.body.quoteRequested === true,
      quoteRequestedAt: null,
      quoteResponseStatus: null,
      quoteAcceptedAt: null,
      quoteRevisionMessage: "",
      quoteRevisionRequestedAt: null,
      quoteSent: false,
      quoteSentAt: null,
      quoteUpdatedAt: null,
      customerNotifiedAccepted: false,
      customerNotifiedCompleted: false,
      assigneeId: "",
      assigneeName: "",
      assignedStaff: null,
      assignedTo: null,
      responsiblePerson: null,
      status: "untreated",
      urgency: aiSettings.aiAutoFillProcessingFormEnabled ? urgencySuggestion.urgency || "" : "",
      dueAt: aiSettings.aiAutoFillProcessingFormEnabled ? dueSuggestion : null,
      deadline: aiSettings.aiAutoFillProcessingFormEnabled ? dueSuggestion : null,
      adminReply: "",
      timeline,
      createdAt: new Date()
    };
    if (aiSettings.aiRequestAnalysisEnabled) {
      pushAssignmentHistory(requestPayload, "AI analyzed request", "AI analyzed request content and metadata.");
      if (urgencySuggestion.urgency) {
        pushAssignmentHistory(requestPayload, "AI suggested urgency", urgencySuggestion.reason);
      }
      if (assignmentSuggestion.assignmentSource !== "ai_disabled") {
        pushAssignmentHistory(requestPayload, "AI suggested assignment candidates", assignmentSuggestion.assignmentReason);
      }
    }

    console.info("[request:create] save payload debug", {
      requestCode,
      bodyKeys: Object.keys(req.body || {}),
      title: requestPayload.title,
      name: requestPayload.name,
      phone: requestPayload.phone,
      contact: requestPayload.contact,
      address: requestPayload.address,
      content: requestPayload.content,
      issueTags: requestPayload.issueTags,
      mediaFiles: requestPayload.mediaFiles,
      mediaUrl: requestPayload.mediaUrl,
      mediaType: requestPayload.mediaType,
      image: requestPayload.image,
      timelineIsArray: Array.isArray(requestPayload.timeline),
      timelineFirstType: typeof requestPayload.timeline[0],
      timelineFirst: requestPayload.timeline[0],
      userId: requestPayload.userId
    });

    const newRequest = new Request(requestPayload);

    await newRequest.save();
    console.info("[request:create] saved", {
      requestCode,
      mongoId: String(newRequest._id)
    });
    notifyAdminEmail("request_created", { request: newRequest });

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
    const validationErrors = error.errors
      ? Object.keys(error.errors).reduce((acc, field) => {
        acc[field] = error.errors[field].message;
        return acc;
      }, {})
      : undefined;

    console.error("REQUEST_SAVE_ERROR", {
      name: error.name,
      code: error.code,
      message: error.message,
      errors: validationErrors,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      code: error.name === "ValidationError" ? "MONGOOSE_VALIDATION_FAILED" : "REQUEST_SAVE_FAILED",
      message: "Save failed",
      detail: error.message,
      fields: validationErrors
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
    res.json(await publicRequestsWithLatestCustomerEmail(requests));
  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/api/admin/appointments", requireAdmin, async (req, res) => {
  try {
    const status = normalizeAppointmentStatus(req.query.status);
    const search = String(req.query.search || "").trim();
    const query = {};
    if (req.query.status && String(req.query.status) !== "all") query.status = status;
    if (search) {
      query.$or = [
        { appointmentCode: new RegExp(search, "i") },
        { requestCode: new RegExp(search, "i") },
        { customerName: new RegExp(search, "i") },
        { customerPhone: new RegExp(search, "i") },
        { projectName: new RegExp(search, "i") },
        { technicianName: new RegExp(search, "i") }
      ];
    }
    const items = await Appointment.find(query).sort({ appointmentDate: 1, date: 1, timeStart: 1, createdAt: -1 });
    res.set("Cache-Control", "no-store");
    res.json({ data: items.map(appointmentPublic) });
  } catch (error) {
    res.status(500).json({ message: "Appointments load failed", error: error.message });
  }
});

app.post("/api/admin/appointments/proposals", requireAdmin, async (req, res) => {
  try {
    const requestId = String(req.body?.requestId || req.body?.requestCode || "").trim();
    if (!requestId) return res.status(400).json({ message: "Request is required" });
    const request = await findRequestByAnyId(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const slots = normalizeAppointmentSlots(req.body?.slots);
    const slotError = validateAppointmentSlots(slots);
    if (slotError) return res.status(400).json({ message: slotError });
    const code = await generateAppointmentCode();
    const status = req.body?.sendNow === false ? "draft" : "pending_selection";
    const appointment = new Appointment({
      id: code,
      appointmentCode: code,
      requestId: String(request.id || request._id || request.requestCode || ""),
      requestCode: request.requestCode || request.requestId || request.id || "",
      customerId: String(request.userId || request.customerId || ""),
      customerName: request.name || request.customerName || request.contactPerson || "",
      customerPhone: request.phone || request.customerPhone || "",
      customerEmail: request.email || request.customerEmail || "",
      assigneeId: String(req.body?.assigneeId || request.assigneeId || ""),
      assigneeName: String(req.body?.assigneeName || request.assigneeName || request.staffName || ""),
      projectName: String(req.body?.projectName || request.projectName || request.title || request.address || ""),
      address: String(req.body?.address || request.address || ""),
      technicianName: String(req.body?.technicianName || req.body?.assigneeName || request.assigneeName || ""),
      technicianId: String(req.body?.technicianId || req.body?.assigneeId || request.assigneeId || ""),
      slots,
      status,
      customerNote: String(req.body?.customerNote || "").trim(),
      adminNote: String(req.body?.adminNote || req.body?.note || "").trim(),
      createdBy: "admin",
      sentAt: status === "pending_selection" ? new Date() : null,
      history: [
        { type: "appointment_proposal_created", message: "Admin created appointment proposal", actor: "admin", createdAt: new Date() },
        ...(status === "pending_selection" ? [{ type: "appointment_proposed", message: "Admin sent appointment proposal to customer", actor: "admin", createdAt: new Date() }] : [])
      ]
    });
    await appointment.save();
    if (status === "pending_selection") notifyCustomerEmail("appointment_proposed", { request, appointment, adminNote: appointment.adminNote });
    res.status(201).json({ data: appointmentPublic(appointment), message: "Appointment proposal created" });
  } catch (error) {
    res.status(500).json({ message: "Appointment proposal create failed", error: error.message });
  }
});

app.get("/api/admin/appointments/:id", requireAdmin, async (req, res) => {
  try {
    const item = await Appointment.findOne(appointmentIdQuery(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ data: appointmentPublic(item) });
  } catch (error) {
    res.status(500).json({ message: "Appointment load failed", error: error.message });
  }
});

async function updateAppointmentByAdmin(req, res, actionStatus = "") {
  try {
    const item = await Appointment.findOne(appointmentIdQuery(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    const previousStatus = item.status;
    if (req.body?.appointmentDate !== undefined || req.body?.date !== undefined) {
      const appointmentDate = String(req.body.appointmentDate || req.body.date || "").trim();
      item.appointmentDate = appointmentDate;
      item.date = appointmentDate;
    }
    if (req.body?.appointmentTime !== undefined || req.body?.time !== undefined) item.timeStart = String(req.body.appointmentTime || req.body.time || "").trim();
    if (req.body?.timeStart !== undefined) item.timeStart = String(req.body.timeStart || "").trim();
    if (req.body?.timeEnd !== undefined) item.timeEnd = String(req.body.timeEnd || "").trim();
    if (req.body?.technicianName !== undefined || req.body?.technician !== undefined) item.technicianName = String(req.body.technicianName || req.body.technician || "").trim();
    if (req.body?.technicianId !== undefined) item.technicianId = String(req.body.technicianId || "").trim();
    if (req.body?.adminNote !== undefined || req.body?.note !== undefined) item.adminNote = String(req.body.adminNote || req.body.note || "").trim();
    if (req.body?.customerNote !== undefined) item.customerNote = String(req.body.customerNote || "").trim();
    if (req.body?.projectName !== undefined) item.projectName = String(req.body.projectName || "").trim();
    if (req.body?.address !== undefined) item.address = String(req.body.address || "").trim();
    if (req.body?.assigneeName !== undefined) {
      item.assigneeName = String(req.body.assigneeName || "").trim();
      item.technicianName = item.assigneeName;
    }
    if (req.body?.assigneeId !== undefined) {
      item.assigneeId = String(req.body.assigneeId || "").trim();
      item.technicianId = item.assigneeId;
    }
    if (req.body?.slots !== undefined) {
      const slots = normalizeAppointmentSlots(req.body.slots);
      const slotError = validateAppointmentSlots(slots);
      if (slotError) return res.status(400).json({ message: slotError });
      item.slots = slots.map(slot => ({ ...slot, status: slot.slotId === item.selectedSlotId ? "selected" : slot.status }));
    }
    if (actionStatus || req.body?.status) item.status = normalizeAppointmentStatus(actionStatus || req.body.status);
    if (item.status === "pending_selection" && !item.sentAt) item.sentAt = new Date();
    if (item.status === "confirmed" && !item.confirmedAt) item.confirmedAt = new Date();
    if (item.status === "completed" && !item.completedAt) item.completedAt = new Date();
    if (item.status === "cancelled" && !item.cancelledAt) item.cancelledAt = new Date();
    const action = actionStatus || (previousStatus !== item.status ? item.status : "updated");
    pushAppointmentHistory(item, action, `Appointment ${action}`, "admin");
    await item.save();
    const request = await findRequestByAnyId(item.requestCode || item.requestId);
    if (request) {
      const eventByStatus = {
        pending_selection: "appointment_proposed",
        confirmed: "appointment_confirmed",
        cancelled: "appointment_cancelled",
        completed: "appointment_completed"
      };
      const eventType = eventByStatus[item.status];
      if (eventType) notifyCustomerEmail(eventType, { request, appointment: item, adminNote: item.adminNote });
    }
    res.json({ data: appointmentPublic(item), message: "Appointment updated" });
  } catch (error) {
    res.status(500).json({ message: "Appointment update failed", error: error.message });
  }
}

app.patch("/api/admin/appointments/:id", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res));
app.post("/api/admin/appointments/:id/send", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res, "pending_selection"));
app.post("/api/admin/appointments/:id/confirm", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res, "confirmed"));
app.post("/api/admin/appointments/:id/reschedule", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res, "rescheduled"));
app.post("/api/admin/appointments/:id/cancel", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res, "cancelled"));
app.post("/api/admin/appointments/:id/complete", requireAdmin, (req, res) => updateAppointmentByAdmin(req, res, "completed"));

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

    res.json(await publicRequestWithLatestCustomerEmail(item));

  } catch (error) {
    res.status(500).json({
      message: "Read failed",
      error: error.message
    });
  }
});

app.get("/api/requests/staff/:staffId/history", async (req, res) => {
  try {
    const query = staffHistoryQuery(req.params.staffId);
    if (!query) {
      return res.json({ data: [] });
    }

    const requests = await Request.find(query).sort({ createdAt: -1 }).limit(100);
    const sorted = requests
      .sort((left, right) => handledRequestRank(left) - handledRequestRank(right) || latestRequestTime(right) - latestRequestTime(left))
      .slice(0, 50);
    res.json({
      data: sorted.map(publicAssigneeHistoryRequest)
    });

  } catch (error) {
    res.status(500).json({
      message: "Staff request history read failed",
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
    const previousStatus = item.status;
    const previousAssigneeId = String(item.assigneeId || "");
    const previousAssigneeName = String(item.assigneeName || "");
    if (req.body.status) {
      item.status = normalizeRequestStatus(req.body.status);
      applyStatusTimestamps(item, item.status);
      mergeStatusTimeline(item, item.status, req.body.adminReply);
    }

    const hasAssigneeUpdate = req.body.assigneeId !== undefined || req.body.assigneeName !== undefined;
    if (hasAssigneeUpdate) {
      const nextAssigneeId = String(req.body.assigneeId || "");
      const nextAssigneeName = String(req.body.assigneeName || "");
      item.assigneeId = nextAssigneeId;
      item.assigneeName = nextAssigneeName;

      const changed = nextAssigneeId !== previousAssigneeId || nextAssigneeName !== previousAssigneeName;
      if (changed && (nextAssigneeId || nextAssigneeName)) {
        const now = new Date();
        const source = req.body.assignmentSource === "admin_from_suggestion" ? "admin_from_suggestion" : "manual";
        const score = Number(req.body.assignmentScore || 0);
        const reason = String(req.body.assignmentReason || "").trim();
        item.assignedBy = source === "admin_from_suggestion" ? "admin_confirmed" : "admin_manual";
        item.assignmentAcceptedAt = now;
        item.assignmentHistory = Array.isArray(item.assignmentHistory) ? item.assignmentHistory : [];
        item.assignmentHistory.push({
          staffId: nextAssigneeId,
          staffName: nextAssigneeName,
          action: "assigned",
          source,
          score,
          reason,
          assignedAt: now,
          assignedBy: item.assignedBy
        });
        pushAssignmentHistory(
          item,
          source === "admin_from_suggestion" ? "Admin applied AI assignment suggestion" : "Admin manually selected assignee",
          reason || (nextAssigneeName ? `Assignee: ${nextAssigneeName}` : ""),
          "admin"
        );
        item.timeline = Array.isArray(item.timeline) ? item.timeline : [];
        item.timeline.push({
          id: "tl-assign-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
          type: "assignment",
          status: item.status || "untreated",
          message: "assignment.assigned",
          note: nextAssigneeName ? `Phân công phụ trách: ${nextAssigneeName}` : "Phân công phụ trách",
          actor: "admin",
          createdAt: now
        });
        if (source === "admin_from_suggestion") {
          console.info("[ASSIGNMENT_ACCEPTED] admin selected suggested staff", {
            requestCode: item.requestCode || item.requestId || item.id,
            staffId: nextAssigneeId,
            score
          });
        } else {
          console.info("[ASSIGNMENT_MANUAL] admin selected staff manually", {
            requestCode: item.requestCode || item.requestId || item.id,
            staffId: nextAssigneeId
          });
        }
      }
    }
    if (req.body.urgency !== undefined) item.urgency = req.body.urgency;
    if (req.body.dueAt !== undefined) {
      const dueAt = req.body.dueAt ? new Date(req.body.dueAt) : null;
      item.dueAt = dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null;
      item.deadline = item.dueAt;
    }
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
    if (item.status === "contacted" && previousStatus !== "contacted" && !item.customerNotifiedAccepted) {
      item.customerNotifiedAccepted = true;
      await item.save();
      notifyCustomerEmail("request_accepted", { request: item, adminNote: req.body.adminReply });
    }
    if (item.status === "completed" && previousStatus !== "completed" && !item.customerNotifiedCompleted) {
      item.customerNotifiedCompleted = true;
      await item.save();
      notifyCustomerEmail("request_completed", { request: item, adminNote: req.body.adminReply });
    }
    if (
      req.body.status &&
      item.status !== previousStatus &&
      item.status !== "contacted" &&
      item.status !== "quoted" &&
      item.status !== "completed"
    ) {
      notifyCustomerEmail("request_status_updated", { request: item, adminNote: req.body.adminReply });
    }

    res.json({
      message: "Updated",
      data: await publicRequestWithLatestCustomerEmail(item)
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
    const item = await Request.findOne(makeIdQuery(req.params.id));

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    if (req.query.permanent === "true") {
      await Request.deleteOne({ _id: item._id });
      return res.json({ message: "Permanently deleted" });
    }

    item.isDeleted = true;
    item.deletedAt = new Date();
    item.deletedByRole = "admin";
    await item.save();

    res.json({ message: "Moved to trash", data: item });

  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message
    });
  }
});

app.patch("/request/:id/restore", requireAdmin, async (req, res) => {
  try {
    const item = await Request.findOne(makeIdQuery(req.params.id));
    if (!item) return res.status(404).json({ message: "Not found" });
    item.isDeleted = false;
    item.deletedAt = null;
    item.deletedBy = "";
    item.deletedByRole = "";
    await item.save();
    res.json({ message: "Restored", data: item });
  } catch (error) {
    res.status(500).json({
      message: "Restore failed",
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

    if (user.status === "deleted") return res.status(403).json({ error: "ACCOUNT_DELETED", message: "This account is deleted or inactive." });
    if (user.status === "blocked") return res.status(403).json({ error: "ACCOUNT_BLOCKED", message: "Account is blocked. Please contact YAMADEN support." });

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

app.get("/api/auth/me", requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.status === "deleted") return res.status(403).json({ error: "ACCOUNT_DELETED", message: "This account is deleted or inactive." });
    if (user.status === "blocked") return res.status(403).json({ error: "ACCOUNT_BLOCKED", message: "Account is blocked. Please contact YAMADEN support." });

    user.status = normalizeUserStatus(user.status);

    res.set("Cache-Control", "no-store");
    res.json({
      data: {
        user: publicUser(user),
        status: normalizeUserStatus(user.status)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Read failed", error: error.message });
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
