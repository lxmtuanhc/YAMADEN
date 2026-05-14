import { Upload } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import { categoryOptions } from "./requestHelpers";

export function RequestCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createRequest = useAppStore(state => state.createRequest);
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [datetime, setDatetime] = useState("");
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category || !title.trim() || !description.trim() || !address.trim()) {
      setError(t("common.required"));
      return;
    }
    const request = createRequest({
      category,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      datetime: datetime.trim(),
      imageName
    });
    navigate(`/requests/${request.id}`);
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{t("request.createTitle")}</h1>
        </div>
      </div>

      <Card>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("request.category")} *</span>
            <select value={category} onChange={event => setCategory(event.target.value)}>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t("request.subject")} *</span>
            <input value={title} placeholder={t("request.titlePlaceholder")} onChange={event => setTitle(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.description")} *</span>
            <textarea value={description} placeholder={t("request.descriptionPlaceholder")} onChange={event => setDescription(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.address")} *</span>
            <input value={address} placeholder={t("request.addressPlaceholder")} onChange={event => setAddress(event.target.value)} />
          </label>

          <label className="field">
            <span>{t("request.datetime")}</span>
            <input value={datetime} placeholder={t("request.datetimePlaceholder")} onChange={event => setDatetime(event.target.value)} />
          </label>

          <label className="upload-field">
            <Upload size={22} />
            <span>{imageName || t("request.uploadHint")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={event => setImageName(event.target.files?.[0]?.name || "")}
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <Button type="submit">{t("request.submit")}</Button>
        </form>
      </Card>
    </section>
  );
}
