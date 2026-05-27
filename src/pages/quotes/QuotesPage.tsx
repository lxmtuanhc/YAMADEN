import { useEffect, useState } from "react";
import { ActionConfirmModal } from "../../components/ActionConfirmModal";
import { AppToast } from "../../components/AppToast";
import { QuoteCard } from "../../components/quotes/QuoteCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useTranslation } from "../../hooks/useTranslation";
import { quoteService } from "../../services/quoteService";
import type { Quote } from "../../types";
import { groupQuotesByRequest } from "../../utils/quoteFiles";

export function QuotesPage() {
  const { t, language } = useTranslation();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Quote | null>(null);
  const [revisionTarget, setRevisionTarget] = useState<Quote | null>(null);
  const [revisionMessage, setRevisionMessage] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError("");
    quoteService
      .getQuotes()
      .then(result => {
        if (mounted) setQuotes(result);
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
  }, [language, t]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await quoteService.deleteQuote(deleteTarget.id);
      setQuotes(current => current.filter(quote => quote.id !== deleteTarget.id && quote.quoteCode !== deleteTarget.quoteCode));
      setToast({ message: t("quote.deleteSuccess"), tone: "success" });
    } catch {
      setToast({ message: t("quote.deleteError"), tone: "error" });
    } finally {
      setDeleteTarget(null);
    }
  }

  async function confirmAccept() {
    if (!acceptTarget) return;
    try {
      const updated = await quoteService.approveQuote(acceptTarget.id);
      setQuotes(current => current.map(quote => quote.id === updated.id || quote.quoteCode === updated.quoteCode ? updated : quote));
      setToast({ message: language === "ja" ? "見積を承認しました" : "Đã chấp nhận báo giá", tone: "success" });
    } catch {
      setToast({ message: language === "ja" ? "送信できませんでした" : "Không thể gửi phản hồi.", tone: "error" });
    } finally {
      setAcceptTarget(null);
    }
  }

  async function submitRevision() {
    if (!revisionTarget) return;
    if (!revisionMessage.trim()) {
      setToast({ message: language === "ja" ? "修正内容を入力してください" : "Vui lòng nhập nội dung cần chỉnh sửa.", tone: "error" });
      return;
    }
    try {
      const updated = await quoteService.requestRevision(revisionTarget.id, revisionMessage.trim());
      setQuotes(current => current.map(quote => quote.id === updated.id || quote.quoteCode === updated.quoteCode ? updated : quote));
      setToast({ message: language === "ja" ? "見積修正依頼を送信しました" : "Đã gửi yêu cầu chỉnh sửa báo giá", tone: "success" });
    } catch {
      setToast({ message: language === "ja" ? "送信できませんでした" : "Không thể gửi phản hồi.", tone: "error" });
    } finally {
      setRevisionTarget(null);
      setRevisionMessage("");
    }
  }

  return (
    <section className="page">
      <div className="page-header"><h1>{t("quote.title")}</h1></div>
      <h2 className="section-title">{t("quote.list")}</h2>
      <div className="list-stack">
        {isLoading ? <LoadingState /> : null}
        {!isLoading && error ? <ErrorState message={error} /> : null}
        {!isLoading && !error && quotes.length ? groupQuotesByRequest(quotes).map(quote => (
          <QuoteCard
            key={quote.requestId || quote.id}
            quote={quote}
            onDelete={setDeleteTarget}
            onAccept={setAcceptTarget}
            onRequestRevision={quoteItem => {
              setRevisionTarget(quoteItem);
              setRevisionMessage("");
            }}
          />
        )) : null}
        {!isLoading && !error && !quotes.length ? <EmptyState message={t("quote.empty")} /> : null}
      </div>
      <ActionConfirmModal
        open={Boolean(deleteTarget)}
        title={t("quote.deleteTitle")}
        message={t("quote.deleteConfirmText")}
        confirmLabel={t("common.delete")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <ActionConfirmModal
        open={Boolean(acceptTarget)}
        title={language === "ja" ? "見積を承認する" : "Chấp nhận báo giá"}
        message={language === "ja" ? "この見積を承認してもよろしいですか？" : "Bạn có chắc muốn chấp nhận báo giá này không?"}
        confirmLabel={language === "ja" ? "承認" : "Đồng ý"}
        onCancel={() => setAcceptTarget(null)}
        onConfirm={confirmAccept}
      />
      {revisionTarget ? (
        <div className="assignee-modal-overlay assignee-modal-backdrop" role="presentation" onClick={() => setRevisionTarget(null)}>
          <div className="assignee-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
            <div className="assignee-modal-header">
              <h2>{language === "ja" ? "修正を依頼する" : "Yêu cầu chỉnh sửa"}</h2>
              <button type="button" className="assignee-modal-close" onClick={() => setRevisionTarget(null)}>×</button>
            </div>
            <div className="assignee-modal-body">
              <label className="field">
                <span>{language === "ja" ? "修正内容" : "Nội dung cần chỉnh sửa"}</span>
                <textarea value={revisionMessage} onChange={event => setRevisionMessage(event.target.value)} />
              </label>
              <div className="two-actions">
                <button type="button" className="quote-secondary-button" onClick={() => setRevisionTarget(null)}>{language === "ja" ? "キャンセル" : "Hủy"}</button>
                <button type="button" className="media-picker-button" onClick={submitRevision}>{language === "ja" ? "送信する" : "Gửi phản hồi"}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <AppToast message={toast.message} tone={toast.tone} /> : null}
    </section>
  );
}
