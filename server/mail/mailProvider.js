function clean(value) {
  return String(value || "").trim();
}

function configuredProvider() {
  return clean(process.env.MAIL_PROVIDER || "resend").toLowerCase();
}

async function sendResendMail({ to, subject, html, text, eventType, requestCode }) {
  const from = clean(process.env.MAIL_FROM);
  const apiKey = clean(process.env.RESEND_API_KEY);

  console.log("[MAIL_SEND_ATTEMPT]", {
    provider: "resend",
    from,
    to,
    subject,
    eventType,
    requestCode
  });

  if (!apiKey || !from) {
    return {
      status: "skipped",
      provider: "resend",
      reason: "RESEND_NOT_CONFIGURED"
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
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

  console.log("[MAIL_SEND_SUCCESS]", {
    provider: "resend",
    to,
    eventType,
    requestCode
  });

  return {
    status: "sent",
    provider: "resend",
    reason: ""
  };
}

async function sendMail({ to, subject, html, text, eventType, requestCode } = {}) {
  const provider = configuredProvider();
  const recipient = clean(to);
  console.log("[MAIL_PROVIDER]", provider || "resend");

  if (!recipient) {
    return {
      status: "skipped",
      provider,
      reason: "RECIPIENT_NOT_FOUND",
      eventType,
      requestCode
    };
  }

  try {
    if (provider !== "resend") {
      return {
        status: "skipped",
        provider,
        reason: "MAIL_PROVIDER_NOT_SUPPORTED",
        eventType,
        requestCode
      };
    }

    const result = await sendResendMail({
      to: recipient,
      subject,
      html,
      text,
      eventType,
      requestCode
    });

    if (result.status === "failed") {
      console.log("[MAIL_SEND_FAILED]", {
        provider: "resend",
        to: recipient,
        eventType,
        requestCode,
        errorMessage: result.errorMessage || result.reason || ""
      });
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
    console.log("[MAIL_SEND_FAILED]", {
      provider: "resend",
      to: recipient,
      eventType,
      requestCode,
      errorMessage: error.message || ""
    });
    return {
      status: "failed",
      provider: "resend",
      reason: "RESEND_SEND_FAILED",
      errorCode: error.code || "",
      errorMessage: error.message || "",
      eventType,
      requestCode
    };
  }
}

module.exports = {
  sendMail
};
