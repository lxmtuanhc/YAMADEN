import { Upload, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { requestService } from "../../services/requestService";
import { useAppStore } from "../../stores/appStore";
import { categoryOptions } from "./requestHelpers";

const maxUploadFiles = 12;
const defaultCategory = categoryOptions[0].value;

export function RequestCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [contact, setContact] = useState(user?.contactPerson || user?.email || "");
  const [title, setTitle] = useState("");
  const [issue, setIssue] = useState("");
  const [issueOptions, setIssueOptions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [datetime, setDatetime] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(current => current || user?.name || "");
    setPhone(current => current || user?.phone || "");
    setContact(current => current || user?.contactPerson || user?.email || "");
    setAddress(current => current || user?.address || "");
  }, [user]);

  useEffect(() => {
    let mounted = true;
    requestService.getIssueOptions()
      .then(options => {
        if (!mounted) return;
        setIssueOptions(options);
        setIssue(current => current || options[0] || "");
      })
      .catch(() => {
        if (mounted) setIssueOptions([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !title.trim() || !issue.trim() || !description.trim() || !address.trim()) {
      setError(t("common.required"));
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const request = await requestService.createRequest({
        category: defaultCategory,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        datetime: datetime.trim(),
        files,
        name: name.trim(),
        phone: phone.trim(),
        contact: contact.trim(),
        issueTags: [issue.trim()]
      });
      navigate(`/requests/${request.id}`);
    } catch {
      setError(t("common.required"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFileChange(selectedFiles: FileList | null) {
    if (!selectedFiles?.length) return;
    setFiles(current => {
      const next = [...current];
      Array.from(selectedFiles).forEach(file => {
        const duplicate = next.some(item => (
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified
        ));
        if (!duplicate && next.length < maxUploadFiles) next.push(file);
      });
      return next;
    });
  }

  function removeFile(fileToRemove: File) {
    setFiles(current => current.filter(file => (
      file.name !== fileToRemove.name ||
      file.size !== fileToRemove.size ||
      file.lastModified !== fileToRemove.lastModified
    )));
  }

  return (
    <section className="page request-create-page">
      <div className="page-header">
        <div>
          <h1>{t("request.createTitle")}</h1>
        </div>
      </div>

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("request.subject")} *</span>
            <input value={title} placeholder={t("request.titlePlaceholder")} onChange={event => setTitle(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.issue")} *</span>
            <select value={issue} onChange={event => setIssue(event.target.value)}>
              {issueOptions.length ? (
                issueOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
              ) : (
                <option value="">{t("common.empty")}</option>
              )}
            </select>
          </label>

          <label className="field">
            <span>{t("auth.name")} *</span>
            <input value={name} onChange={event => setName(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("auth.phone")} *</span>
            <input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.contact")}</span>
            <input value={contact} onChange={event => setContact(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.address")} *</span>
            <input value={address} placeholder={t("request.addressPlaceholder")} onChange={event => setAddress(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.description")} *</span>
            <textarea value={description} placeholder={t("request.descriptionPlaceholder")} onChange={event => setDescription(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.datetime")}</span>
            <input value={datetime} placeholder={t("request.datetimePlaceholder")} onChange={event => setDatetime(event.target.value)} />
          </label>

          <label className="upload-field">
            <Upload size={22} />
            <span>{t("request.attachments")}</span>
            <span>{files.length ? t("request.filesSelected").replace("{count}", String(files.length)) : t("request.uploadHint")}</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={event => {
                handleFileChange(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {files.length ? (
            <div className="upload-file-list" aria-label={t("request.attachments")}>
              {files.map(file => (
                <div className="upload-file-item" key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeFile(file)} aria-label={t("request.removeAttachment")}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}

          <Button type="submit" disabled={isSubmitting}>{t("request.submit")}</Button>
        </form>
      </Card>
    </section>
  );
}
