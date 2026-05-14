import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function ProfileSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const saveProfile = useAppStore(state => state.saveProfile);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.address || "");
  const [projectName, setProjectName] = useState(user?.projectName || "");
  const [companyType, setCompanyType] = useState(user?.companyType || "");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !address.trim() || !projectName.trim()) {
      setError(t("common.required"));
      return;
    }
    saveProfile({ name, email, address, projectName, companyType });
    navigate("/pending");
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <h1>{t("auth.profileTitle")}</h1>
        <p>{t("auth.profileText")}</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field"><span>{t("auth.name")}</span><input value={name} onChange={event => setName(event.target.value)} /></label>
          <label className="field"><span>{t("auth.email")}</span><input value={email} onChange={event => setEmail(event.target.value)} /></label>
          <label className="field"><span>{t("auth.address")}</span><input value={address} onChange={event => setAddress(event.target.value)} /></label>
          <label className="field"><span>{t("auth.projectName")}</span><input value={projectName} onChange={event => setProjectName(event.target.value)} /></label>
          <label className="field"><span>{t("auth.companyType")}</span><input value={companyType} onChange={event => setCompanyType(event.target.value)} /></label>
          {error ? <div className="form-error">{error}</div> : null}
          <Button type="submit">{t("auth.submitProfile")}</Button>
        </form>
      </Card>
    </section>
  );
}
