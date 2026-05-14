import { Upload, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { requestService } from "../../services/requestService";
import { useAppStore } from "../../stores/appStore";
import { categoryOptions } from "./requestHelpers";

const maxUploadFiles = 12;
const defaultCategory = categoryOptions[0].value;

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function RequestCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [contact, setContact] = useState(user?.contactPerson || user?.email || "");
  const [title, setTitle] = useState("");
  const [issueSearch, setIssueSearch] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [issueOptions, setIssueOptions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [datetime, setDatetime] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ key: string; name: string; type: string; url: string }>>([]);
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
        setIssueOptions(Array.from(new Set(options.map(option => option.trim()).filter(Boolean))));
      })
      .catch(() => {
        if (mounted) setIssueOptions([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const previews = files.map(file => ({
      key: fileKey(file),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setMediaPreviews(previews);
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const filteredIssueOptions = useMemo(() => {
    const keyword = issueSearch.trim().toLowerCase();
    return issueOptions.filter(option => (
      !selectedIssues.includes(option) &&
      (!keyword || option.toLowerCase().includes(keyword))
    ));
  }, [issueOptions, issueSearch, selectedIssues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !title.trim() || !selectedIssues.length || !description.trim() || !address.trim()) {
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
        issueTags: selectedIssues
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
      let hitLimit = false;
      Array.from(selectedFiles).forEach(file => {
        const duplicate = next.some(item => (
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified
        ));
        if (duplicate) return;
        if (next.length < maxUploadFiles) {
          next.push(file);
        } else {
          hitLimit = true;
        }
      });
      if (hitLimit) setError(t("request.fileLimit").replace("{count}", String(maxUploadFiles)));
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

  function addIssue(issue: string) {
    const value = issue.trim();
    if (!value || selectedIssues.includes(value)) return;
    setSelectedIssues(current => [...current, value]);
    setIssueSearch("");
  }

  function removeIssue(issueToRemove: string) {
    setSelectedIssues(current => current.filter(issue => issue !== issueToRemove));
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

          <div className="field issue-multi-select">
            <span>{t("request.issue")} *</span>
            <div className="issue-search-box">
              {selectedIssues.length ? (
                <div className="issue-chip-list">
                  {selectedIssues.map(selectedIssue => (
                    <span className="issue-chip" key={selectedIssue}>
                      {selectedIssue}
                      <button type="button" onClick={() => removeIssue(selectedIssue)} aria-label={t("request.removeIssue")}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <input
                value={issueSearch}
                placeholder={t("request.issueSearchPlaceholder")}
                onChange={event => setIssueSearch(event.target.value)}
              />
            </div>
            <div className="issue-option-list">
              {filteredIssueOptions.length ? (
                filteredIssueOptions.slice(0, 8).map(option => (
                  <button type="button" key={option} onClick={() => addIssue(option)}>
                    {option}
                  </button>
                ))
              ) : (
                <span>{t("common.empty")}</span>
              )}
            </div>
          </div>

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
              {mediaPreviews.map(preview => (
                <div className="upload-file-item" key={preview.key}>
                  <div className="upload-preview">
                    {preview.type.startsWith("image/") ? (
                      <img src={preview.url} alt={preview.name} />
                    ) : preview.type.startsWith("video/") ? (
                      <video src={preview.url} muted preload="metadata" />
                    ) : (
                      <Upload size={18} />
                    )}
                  </div>
                  <span>{preview.name}</span>
                  <button type="button" onClick={() => {
                    const file = files.find(item => fileKey(item) === preview.key);
                    if (file) removeFile(file);
                  }} aria-label={t("request.removeAttachment")}>
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
