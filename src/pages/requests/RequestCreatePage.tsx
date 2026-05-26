import { FileVideo, Upload, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { requestService } from "../../services/requestService";
import { useAppStore } from "../../stores/appStore";
import { customerFileLimitBytes, isCustomerFileAllowed, uploadConfig } from "../../constants/uploadConfig";
import { categoryOptions } from "./requestHelpers";

const maxUploadFiles = uploadConfig.CUSTOMER_MAX_FILES;
const defaultCategory = categoryOptions[0].value;
const customerAccept = [
  ...uploadConfig.ALLOWED_IMAGE_EXTENSIONS,
  ...uploadConfig.ALLOWED_VIDEO_EXTENSIONS,
  ...uploadConfig.ALLOWED_DOCUMENT_EXTENSIONS,
  ...uploadConfig.ALLOWED_DRAWING_EXTENSIONS
].join(",");

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function totalFileSize(files: File[]) {
  return files.reduce((sum, file) => sum + file.size, 0);
}

export function RequestCreatePage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [contact, setContact] = useState(user?.contactPerson || user?.email || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [datetime, setDatetime] = useState("");
  const [selectedMediaFiles, setSelectedMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<Array<{ key: string; name: string; type: string; url: string }>>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(current => current || user?.name || "");
    setPhone(current => current || user?.phone || "");
    setContact(current => current || user?.contactPerson || user?.email || "");
    setAddress(current => current || user?.address || "");
  }, [user]);

  useEffect(() => {
    const previews = selectedMediaFiles.map(file => ({
      key: fileKey(file),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setMediaPreviews(previews);
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [selectedMediaFiles]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitInFlightRef.current || isSubmitting) {
      console.warn("[request:create] duplicate submit blocked");
      return;
    }
    if (!name.trim() || !phone.trim() || !title.trim() || !address.trim()) {
      setError(t("common.required"));
      return;
    }
    setError("");
    submitInFlightRef.current = true;
    setIsSubmitting(true);
    try {
      console.log("[request:create] submit media state", {
        selectedMediaFilesLength: selectedMediaFiles.length,
        files: selectedMediaFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      });
      const request = await requestService.createRequest({
        category: defaultCategory,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        datetime: datetime.trim(),
        files: selectedMediaFiles,
        name: name.trim(),
        phone: phone.trim(),
        contact: contact.trim(),
        issueTags: [],
        workTypeIds: [],
        departmentCode: ""
      });
      navigate(`/requests/${request.id}`);
    } catch (submitError) {
      console.warn("Request submit failed", submitError);
      setError(submitError instanceof Error ? submitError.message : t("request.uploadFailed"));
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  function handleFileChange(selectedFiles: FileList | null) {
    if (!selectedFiles?.length) return;
    setSelectedMediaFiles(current => {
      const next = [...current];
      let hitLimit = false;
      let errorMessage = "";
      Array.from(selectedFiles).forEach(file => {
        if (errorMessage) return;
        if (!isCustomerFileAllowed(file)) {
          errorMessage = language === "vi" ? `File ${file.name} không được hỗ trợ.` : `ファイル ${file.name} はサポートされていません。`;
          return;
        }
        const limit = customerFileLimitBytes(file);
        if (!limit || file.size > limit) {
          errorMessage = language === "vi" ? `File ${file.name} vượt quá dung lượng cho phép.` : `ファイル ${file.name} は許可サイズを超えています。`;
          return;
        }
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
      if (!errorMessage && totalFileSize(next) > uploadConfig.CUSTOMER_MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        errorMessage = language === "vi"
          ? `Tổng dung lượng file vượt quá ${uploadConfig.CUSTOMER_MAX_TOTAL_SIZE_MB}MB.`
          : `添付ファイルの合計サイズが${uploadConfig.CUSTOMER_MAX_TOTAL_SIZE_MB}MBを超えています。`;
      }
      if (hitLimit) errorMessage = language === "vi" ? "Chỉ có thể đính kèm tối đa 12 file." : "添付できるファイルは最大12件です。";
      if (errorMessage) setError(errorMessage);
      else setError("");
      return next;
    });
  }

  function removeFile(fileToRemove: File) {
    setSelectedMediaFiles(current => current.filter(file => (
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
            <span>
              {t("request.description")} <small>{language === "vi" ? "Không bắt buộc" : "任意"}</small>
            </span>
            <textarea value={description} placeholder={t("request.descriptionPlaceholder")} onChange={event => setDescription(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.datetime")}</span>
            <input value={datetime} placeholder={t("request.datetimePlaceholder")} onChange={event => setDatetime(event.target.value)} />
          </label>

          <div className="upload-field">
            <Upload size={22} />
            <span>
              {t("request.attachments")} <small>{language === "vi" ? "Không bắt buộc" : "任意"}</small>
            </span>
            <span>
              {selectedMediaFiles.length
                ? (language === "vi" ? `Đã chọn ${selectedMediaFiles.length} file` : `${selectedMediaFiles.length}件のファイルを選択済み`)
                : (language === "vi" ? "Chọn ảnh/video/tài liệu hoặc kéo thả vào đây" : "画像・動画・書類を選択してください")}
            </span>
            <span className="upload-limit-text">
              {language === "vi"
                ? "Có thể gửi ảnh, video, PDF, Excel, Word, JWW/DXF. Tối đa 12 file. Ảnh tối đa 10MB/file, tài liệu 25MB/file, video 100MB/file."
                : "画像、動画、PDF、Excel、Word、JWW/DXFを添付できます。最大12件。画像10MB、書類25MB、動画100MBまで。"}
            </span>
            <button className="media-picker-button" type="button" onClick={() => mediaInputRef.current?.click()}>
              {t("request.chooseMedia")}
            </button>
            <input
              ref={mediaInputRef}
              id="request-media-input"
              className="request-media-input"
              type="file"
              accept={customerAccept}
              multiple
              onChange={event => {
                handleFileChange(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          {selectedMediaFiles.length ? (
            <div className="upload-file-list" aria-label={t("request.attachments")}>
              {mediaPreviews.map(preview => (
                <div className="upload-file-item" key={preview.key}>
                  <div className="upload-preview">
                    {preview.type.startsWith("image/") ? (
                      <img src={preview.url} alt={preview.name} />
                    ) : preview.type.startsWith("video/") ? (
                      <video src={preview.url} muted preload="metadata" />
                    ) : (
                      <FileVideo size={18} />
                    )}
                  </div>
                  <span>{preview.name}</span>
                  <button type="button" onClick={() => {
                    const file = selectedMediaFiles.find(item => fileKey(item) === preview.key);
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
