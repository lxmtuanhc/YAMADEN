import { Download, ExternalLink, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ActionConfirmModal } from "../../components/ActionConfirmModal";
import { AppToast } from "../../components/AppToast";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";
import {
  formatQuoteFileSize,
  getQuoteFiles,
  isPreviewableFile,
  isSpecialSoftwareFile,
  isValidFileUrl,
  quoteFileType
} from "../../utils/quoteFiles";

export function QuoteDetailPage() {
  const { id } = useParams();
  const { t, language } = useTranslation();
  const labels = quoteDetailLabels(language);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    if (!id) {
      setIsLoading(false);
      setError(t("common.empty"));
      return;
    }
    quoteService
      .getQuoteById(id)
      .then(result => {
        if (!mounted) return;
        if (result) setQuote(result);
        else setError(t("common.empty"));
      })
      .catch(() => {
        if (mounted) setError(t("common.empty"));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, language, t]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const files = useMemo(() => getQuoteFiles(quote), [quote]);

  if (!id) return <Navigate to="/quotes" replace />;

  async function acceptQuote() {
    if (!quote) return;
    setActionLoading("accepted");
    try {
      const updated = await quoteService.approveQuote(quote.id);
      setQuote(updated);
      setToast({ message: labels.accepted, tone: "success" });
    } catch {
      setToast({ message: labels.sendFailed, tone: "error" });
    } finally {
      setActionLoading("");
      setAcceptConfirmOpen(false);
    }
  }

  async function submitRevision() {
    if (!quote) return;
    if (!revisionMessage.trim()) {
      setToast({ message: labels.revisionRequired, tone: "error" });
      return;
    }
    setActionLoading("revision_requested");
    try {
      const updated = await quoteService.requestRevision(quote.id, revisionMessage.trim());
      setQuote(updated);
      setToast({ message: labels.revisionSent, tone: "success" });
      setRevisionOpen(false);
      setRevisionMessage("");
    } catch {
      setToast({ message: labels.sendFailed, tone: "error" });
    } finally {
      setActionLoading("");
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <LoadingState />
      </section>
    );
  }

  if (!quote) {
    return (
      <section className="page">
        <ErrorState message={error || t("common.empty")} />
      </section>
    );
  }

  const status = quoteResponseStatus(quote, labels);
  const acceptedAt = quote.acceptedAt || "";
  const revisionAt = quote.quoteRevisionRequestedAt || quote.changeRequestedAt || "";
  const revisionText = quote.quoteRevisionMessage || quote.changeRequestMessage || "";
  const requestCode = getRequestCode(quote, labels);
  const requestTitle = getRequestTitle(quote, labels);
  const quoteSentAt = getQuoteSentAt(quote, files);

  return (
    <section className="page request-detail-page quote-detail-page">
      <div className="page-header">
        <div>
          <h1>{labels.detailTitle}</h1>
        </div>
        <span className={`quote-file-status ${status.tone}`}>{status.label}</span>
      </div>

      <Card>
        <h2 className="section-title">{labels.quoteSummary}</h2>
        <div className="info-grid">
          <InfoRow label={labels.requestId} value={requestCode} />
          <InfoRow label={labels.subject} value={requestTitle} />
          <InfoRow label={labels.status} value={status.label} />
          <InfoRow label={labels.sentAt} value={quoteSentAt ? formatQuoteDate(quoteSentAt, language) : labels.noDate} />
          <InfoRow label={labels.fileCount} value={String(files.length)} />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{labels.requestInfo}</h2>
        <div className="info-grid">
          <InfoRow label={labels.requestId} value={requestCode} />
          <InfoRow label={labels.subject} value={requestTitle} />
          <InfoRow label={labels.content} value={safeText(quote.content || quote.description, labels.noContent)} />
          <InfoRow label={labels.customer} value={safeText(quote.customerName, "-")} />
          <InfoRow label={labels.company} value={safeText((quote as Quote & Record<string, unknown>).companyName, "-")} />
          <InfoRow label={labels.phone} value={safeText(quote.customerPhone, "-")} />
          <InfoRow label={labels.email} value={safeText(quote.customerEmail, "-")} />
          <InfoRow label={labels.address} value={safeText(quote.projectAddress || quote.customerAddress || quote.address, "-")} />
          <InfoRow label={labels.requestDate} value={quote.createdAt ? formatQuoteDate(quote.createdAt, language) : labels.noDate} />
          <InfoRow label={labels.requestStatus} value={safeText((quote as Quote & Record<string, unknown>).requestStatus || quote.status, "-")} />
          <InfoRow label={labels.assignee} value={safeText(quote.assigneeName || quote.staffName, "-")} />
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{labels.quoteFiles}</h2>
        <div className="quote-file-list-compact">
          {files.length ? files.map((file, index) => (
            <QuoteFileRow key={`${file.displayUrl || file.displayName}-${index}`} file={file} index={index} labels={labels} onToast={setToast} />
          )) : <div className="muted-line">{labels.noQuoteFiles}</div>}
        </div>
      </Card>

      <Card>
        <h2 className="section-title">{labels.responseTitle}</h2>
        {status.key === "accepted" ? (
          <div className="quote-response-state">
            <span className="quote-file-status success">{labels.accepted}</span>
            {acceptedAt ? <p>{labels.acceptedAt}: {formatQuoteDate(acceptedAt, language)}</p> : null}
          </div>
        ) : status.key === "revision_requested" ? (
          <div className="quote-response-state">
            <span className="quote-file-status warning">{labels.revisionRequested}</span>
            {revisionText ? <p>{revisionText}</p> : null}
            {revisionAt ? <p>{labels.revisionAt}: {formatQuoteDate(revisionAt, language)}</p> : null}
          </div>
        ) : (
          <>
            <div className="quote-response-actions">
              <Button disabled={!!actionLoading} onClick={() => setAcceptConfirmOpen(true)}>
                {labels.acceptQuote}
              </Button>
              <button type="button" className="quote-secondary-button" disabled={!!actionLoading} onClick={() => setRevisionOpen(true)}>
                {labels.requestRevision}
              </button>
            </div>
            <p className="muted-line">{labels.responseHint}</p>
          </>
        )}
      </Card>

      {error ? <ErrorState message={error} /> : null}

      <ActionConfirmModal
        open={acceptConfirmOpen}
        title={labels.acceptQuote}
        message={labels.acceptConfirm}
        confirmLabel={labels.acceptConfirmButton}
        onCancel={() => setAcceptConfirmOpen(false)}
        onConfirm={acceptQuote}
      />
      {revisionOpen ? (
        <div className="assignee-modal-overlay assignee-modal-backdrop" role="presentation" onClick={() => setRevisionOpen(false)}>
          <div className="assignee-modal" role="dialog" aria-modal="true" aria-labelledby="quote-revision-title" onClick={event => event.stopPropagation()}>
            <div className="assignee-modal-header">
              <h2 id="quote-revision-title">{labels.revisionTitle}</h2>
              <button type="button" className="assignee-modal-close" aria-label={labels.cancel} onClick={() => setRevisionOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="assignee-modal-body">
              <label className="field">
                <span>{labels.revisionContent}</span>
                <textarea value={revisionMessage} onChange={event => setRevisionMessage(event.target.value)} />
              </label>
              <div className="two-actions">
                <button type="button" className="quote-secondary-button" onClick={() => setRevisionOpen(false)}>{labels.cancel}</button>
                <button type="button" className="media-picker-button" disabled={!!actionLoading} onClick={submitRevision}>{labels.sendResponse}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <AppToast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}

type DisplayFile = ReturnType<typeof getQuoteFiles>[number];
type Labels = ReturnType<typeof quoteDetailLabels>;

function QuoteFileRow({
  file,
  index,
  labels,
  onToast
}: {
  file: DisplayFile;
  index: number;
  labels: Labels;
  onToast: (toast: { message: string; tone: "success" | "error" }) => void;
}) {
  const validUrl = hasUsableFileUrl(file.displayUrl);
  const previewable = isPreviewableFile(file);
  const specialFile = isSpecialSoftwareFile(file);

  function openFile() {
    if (!validUrl) {
      onToast({ message: labels.notFound, tone: "error" });
      return;
    }
    if (!previewable) {
      onToast({ message: specialFile ? labels.specialFileNote : labels.cannotPreview, tone: "error" });
      return;
    }
    window.open(file.displayUrl, "_blank", "noopener,noreferrer");
  }

  function downloadFile() {
    if (!validUrl) {
      onToast({ message: labels.notFound, tone: "error" });
      return;
    }
    const link = document.createElement("a");
    link.href = file.displayUrl;
    link.download = file.displayName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="quote-file-link-row">
      <span className="quote-file-link-index">{index + 1}.</span>
      <FileText size={16} />
      <div className="quote-file-link-main">
        <strong>{file.displayName}</strong>
        <span>{[quoteFileType(file), formatQuoteFileSize(file.displaySize), file.displayDate ? formatQuoteDate(file.displayDate, labels.language) : ""].filter(Boolean).join(" · ")}</span>
        {specialFile ? <em>{labels.specialFileNote}</em> : null}
      </div>
      {validUrl ? (
        <div className="quote-file-link-actions">
          {previewable ? (
            <button type="button" onClick={openFile}>
              <ExternalLink size={14} />
              <span>{labels.open}</span>
            </button>
          ) : null}
          <button type="button" onClick={downloadFile}>
            <Download size={14} />
            <span>{labels.download}</span>
          </button>
        </div>
      ) : <span className="muted-line">{labels.notFound}</span>}
    </div>
  );
}

function quoteDetailLabels(language: string) {
  if (language === "ja") {
    return {
      language,
      detailTitle: "見積詳細",
      quoteSummary: "見積",
      requestInfo: "依頼情報",
      requestId: "依頼ID",
      subject: "件名",
      status: "ステータス",
      fileCount: "ファイル数",
      customer: "お客様名",
      company: "会社名",
      phone: "電話番号",
      email: "メール",
      address: "住所",
      requestDate: "依頼日",
      requestStatus: "依頼ステータス",
      sentAt: "見積送信日",
      assignee: "担当者",
      content: "依頼内容",
      quoteFiles: "見積ファイル",
      responseTitle: "見積への回答",
      received: "見積受信済み",
      accepted: "見積承認済み",
      revisionRequested: "修正依頼送信済み",
      acceptQuote: "見積を承認する",
      requestRevision: "修正を依頼する",
      acceptConfirm: "この見積を承認してもよろしいですか？",
      acceptConfirmButton: "承認",
      acceptedAt: "承認日時",
      revisionAt: "送信日時",
      revisionTitle: "見積修正依頼",
      revisionContent: "修正内容",
      revisionRequired: "修正内容を入力してください。",
      sendResponse: "送信する",
      cancel: "キャンセル",
      revisionSent: "修正依頼送信済み",
      responseHint: "見積ファイルを確認してから回答してください。",
      sendFailed: "送信できませんでした。",
      open: "開く",
      download: "ダウンロード",
      notFound: "ファイルが見つかりません。",
      noDate: "送信日未設定",
      noContent: "依頼内容はありません",
      noCode: "YMD-未設定",
      noTitle: "タイトル未設定",
      noQuoteFiles: "見積はまだありません。",
      cannotPreview: "このファイルは直接表示できません。ダウンロードしてください。",
      specialFileNote: "このファイルは専用ソフトが必要です。ダウンロードして開いてください。"
    };
  }
  return {
    language,
    detailTitle: "Chi tiết báo giá",
    quoteSummary: "Báo giá",
    requestInfo: "Thông tin yêu cầu",
    requestId: "Mã yêu cầu",
    subject: "Tiêu đề",
    status: "Trạng thái",
    fileCount: "Số file",
    customer: "Khách hàng",
    company: "Công ty",
    phone: "Số điện thoại",
    email: "Email",
    address: "Địa chỉ",
    requestDate: "Ngày gửi yêu cầu",
    requestStatus: "Trạng thái yêu cầu",
    sentAt: "Ngày gửi báo giá",
    assignee: "Người phụ trách",
    content: "Nội dung yêu cầu",
    quoteFiles: "File báo giá",
    responseTitle: "Phản hồi báo giá",
    received: "Đã nhận báo giá",
    accepted: "Đã chấp nhận báo giá",
    revisionRequested: "Đã yêu cầu chỉnh sửa",
    acceptQuote: "Chấp nhận báo giá",
    requestRevision: "Yêu cầu chỉnh sửa",
    acceptConfirm: "Bạn có chắc muốn chấp nhận báo giá này không?",
    acceptConfirmButton: "Đồng ý",
    acceptedAt: "Thời gian chấp nhận",
    revisionAt: "Thời gian gửi phản hồi",
    revisionTitle: "Yêu cầu chỉnh sửa báo giá",
    revisionContent: "Nội dung cần chỉnh sửa",
    revisionRequired: "Vui lòng nhập nội dung cần chỉnh sửa.",
    sendResponse: "Gửi phản hồi",
    cancel: "Hủy",
    revisionSent: "Đã yêu cầu chỉnh sửa",
    responseHint: "Vui lòng kiểm tra file báo giá trước khi phản hồi.",
    sendFailed: "Không thể gửi phản hồi.",
    open: "Mở",
    download: "Tải về",
    notFound: "Không tìm thấy file.",
    noDate: "Chưa có ngày gửi",
    noContent: "Chưa có nội dung yêu cầu",
    noCode: "Không có mã",
    noTitle: "Không có tiêu đề",
    noQuoteFiles: "Chưa có báo giá.",
    cannotPreview: "File này không thể xem trực tiếp. Vui lòng tải về.",
    specialFileNote: "File này cần phần mềm chuyên dụng. Vui lòng tải về để mở."
  };
}

function quoteResponseStatus(quote: Quote, labels: Labels) {
  if (quote.quoteResponseStatus === "accepted" || quote.status === "accepted") {
    return { key: "accepted", label: labels.accepted, tone: "success" };
  }
  if (quote.quoteResponseStatus === "revision_requested" || quote.status === "revision_requested" || quote.status === "change_requested") {
    return { key: "revision_requested", label: labels.revisionRequested, tone: "warning" };
  }
  return { key: "received", label: labels.received, tone: "" };
}

function getRequestCode(quote: Quote, labels: Labels) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(item.requestCode || item.code || item.requestNo || item.displayId || quote.requestId || quote.quoteCode || quote.id, labels.noCode);
}

function getRequestTitle(quote: Quote, labels: Labels) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(quote.title || item.requestTitle || item.subject || quote.projectName || quote.content || quote.description, labels.noTitle);
}

function getQuoteSentAt(quote: Quote, files: DisplayFile[]) {
  const item = quote as Quote & Record<string, unknown>;
  return safeText(quote.quoteSentAt || item.quoteUpdatedAt || quote.sentAt || quote.sentToCustomerAt || files[0]?.displayDate || quote.updatedAt || quote.createdAt, "");
}

function safeText(value: unknown, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

function hasUsableFileUrl(url: string) {
  if (!isValidFileUrl(url)) return false;
  try {
    const parsed = new URL(url);
    return !parsed.pathname.includes("/uploads/quote-files/");
  } catch {
    return false;
  }
}

function formatQuoteDate(value: string, language = "vi") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
