const nodemailer = require("nodemailer");

function clean(value) {
  return String(value || "").trim();
}

function configuredProvider() {
  return clean(process.env.MAIL_PROVIDER || (process.env.RESEND_API_KEY ? "resend" : "none")).toLowerCase();
}

function smtpConfig() {
  const smtpUser = process.env.GMAIL_SMTP_USER || process.env.SMTP_USER;
  const smtpPass = process.env.GMAIL_SMTP_APP_PASSWORD || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);

  return {
    smtpUser: clean(smtpUser),
    smtpPass: clean(smtpPass),
    smtpHost: clean(smtpHost) || "smtp.gmail.com",
    smtpPort: Number.isFinite(smtpPort) ? smtpPort : 465,
    secure: smtpPort === 465
  };
}

async function sendGmailSmtpMail({ to, subject, html, text }) {
  const { smtpUser, smtpPass, smtpHost, smtpPort, secure } = smtpConfig();
  if (!smtpUser || !smtpPass) {
    return {
      status: "skipped",
      provider: "gmail_smtp",
      reason: "SMTP_AUTH_NOT_CONFIGURED"
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || smtpUser,
    to,
    subject,
    html,
    text: text || subject || ""
  });

  return {
    status: "sent",
    provider: "gmail_smtp",
    reason: ""
  };
}

async function sendResendMail({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) {
    return {
      status: "skipped",
      provider: "resend",
      reason: "RESEND_NOT_CONFIGURED"
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      status: "failed",
      provider: "resend",
      reason: "RESEND_API_ERROR",
      errorCode: String(response.status),
      errorMessage: detail.slice(0, 500)
    };
  }

  return {
    status: "sent",
    provider: "resend",
    reason: ""
  };
}

async function sendMail({ to, subject, html, text, eventType, requestCode } = {}) {
  const provider = configuredProvider();
  const recipient = clean(to);
  console.log("[MAIL_PROVIDER]", provider || "none");

  if (!recipient) {
    return {
      status: "skipped",
      provider,
      reason: "RECIPIENT_NOT_FOUND"
    };
  }

  try {
    let result;
    if (provider === "gmail_smtp") {
      result = await sendGmailSmtpMail({ to: recipient, subject, html, text });
    } else if (provider === "resend") {
      result = await sendResendMail({ to: recipient, subject, html, text });
    } else {
      result = {
        status: "skipped",
        provider: provider || "none",
        reason: "MAIL_PROVIDER_NOT_CONFIGURED"
      };
    }

    return {
      status: result.status,
      provider: result.provider || provider,
      reason: result.reason || "",
      errorCode: result.errorCode || "",
      errorMessage: result.errorMessage || "",
      eventType,
      requestCode
    };
  } catch (error) {
    return {
      status: "failed",
      provider,
      reason: provider === "gmail_smtp" ? "SMTP_SEND_FAILED" : "MAIL_SEND_FAILED",
      errorCode: error.code || error.responseCode || "",
      errorMessage: error.message,
      eventType,
      requestCode
    };
  }
}

module.exports = {
  sendMail
};
