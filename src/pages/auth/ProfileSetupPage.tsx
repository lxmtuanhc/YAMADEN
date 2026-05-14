import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

const profileStepCount = 3;
const profileStepKeys = ["auth.profileStep1", "auth.profileStep2", "auth.profileStep3"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ProfileSetupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const saveProfile = useAppStore(state => state.saveProfile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [projectName, setProjectName] = useState(user?.projectName || "");
  const [accountType, setAccountType] = useState(user?.accountType || "personal");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [contactPerson, setContactPerson] = useState(user?.contactPerson || "");
  const needsPhone = !user?.phone;

  const errors = {
    name: name.trim() ? "" : t("validation.required"),
    email: !email.trim() ? t("validation.required") : emailPattern.test(email.trim()) ? "" : t("validation.email"),
    phone: !needsPhone || phone.trim() ? "" : t("validation.required"),
    projectName: projectName.trim() ? "" : t("validation.required"),
    address: address.trim() ? "" : t("validation.required"),
    companyName: accountType !== "company" || companyName.trim() ? "" : t("validation.required"),
    contactPerson: accountType !== "company" || contactPerson.trim() ? "" : t("validation.required")
  };

  function validateStep(stepIndex = step) {
    if (stepIndex === 0) return !errors.name && !errors.email && !errors.phone;
    if (stepIndex === 1) return !errors.projectName && !errors.address;
    return !errors.companyName && !errors.contactPerson;
  }

  function goNext() {
    if (!validateStep()) {
      return;
    }
    setStep(current => Math.min(current + 1, profileStepCount - 1));
  }

  function goBack() {
    if (step > 0) {
      setStep(current => current - 1);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      return;
    }
    saveProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      projectName: projectName.trim(),
      accountType,
      companyName: accountType === "company" ? companyName.trim() : "",
      contactPerson: accountType === "company" ? contactPerson.trim() : ""
    });
    navigate("/pending");
  }

  const canContinue = validateStep(step);

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <h1>{t("auth.profileTitle")}</h1>
        <p>{t("auth.profileText")}</p>
        <div className="profile-progress" aria-label={t("auth.profileProgress")}>
          <div className="profile-progress-label">
            <span>{t(profileStepKeys[step])}</span>
            <strong>{step + 1}/{profileStepCount}</strong>
          </div>
          <div className="profile-progress-track">
            <span style={{ width: `${((step + 1) / profileStepCount) * 100}%` }} />
          </div>
        </div>
        <form className="form-stack" onSubmit={handleSubmit}>
          {step === 0 ? (
            <>
              <label className="field">
                <span>{t("auth.name")}</span>
                <input value={name} autoComplete="name" onChange={event => setName(event.target.value)} />
                {errors.name ? <small className="field-error">{errors.name}</small> : null}
              </label>
              <label className="field">
                <span>{t("auth.email")}</span>
                <input value={email} type="email" autoComplete="email" onChange={event => setEmail(event.target.value)} />
                {errors.email ? <small className="field-error">{errors.email}</small> : null}
              </label>
              {needsPhone ? (
                <label className="field">
                  <span>{t("auth.phone")}</span>
                  <input value={phone} inputMode="tel" autoComplete="tel" onChange={event => setPhone(event.target.value)} />
                  {errors.phone ? <small className="field-error">{errors.phone}</small> : null}
                </label>
              ) : null}
            </>
          ) : null}
          {step === 1 ? (
            <>
              <label className="field">
                <span>{t("auth.projectName")}</span>
                <input value={projectName} onChange={event => setProjectName(event.target.value)} />
                {errors.projectName ? <small className="field-error">{errors.projectName}</small> : null}
              </label>
              <label className="field">
                <span>{t("auth.address")}</span>
                <input value={address} autoComplete="street-address" onChange={event => setAddress(event.target.value)} />
                {errors.address ? <small className="field-error">{errors.address}</small> : null}
              </label>
            </>
          ) : null}
          {step === 2 ? (
            <>
              <label className="field">
                <span>{t("auth.companyType")}</span>
                <select value={accountType} onChange={event => setAccountType(event.target.value as "personal" | "company")}>
                  <option value="personal">{t("auth.profilePersonal")}</option>
                  <option value="company">{t("auth.profileCompany")}</option>
                </select>
              </label>
              {accountType === "company" ? (
                <>
                  <label className="field">
                    <span>{t("auth.companyName")}</span>
                    <input value={companyName} onChange={event => setCompanyName(event.target.value)} />
                    {errors.companyName ? <small className="field-error">{errors.companyName}</small> : null}
                  </label>
                  <label className="field">
                    <span>{t("auth.contactPerson")}</span>
                    <input value={contactPerson} onChange={event => setContactPerson(event.target.value)} />
                    {errors.contactPerson ? <small className="field-error">{errors.contactPerson}</small> : null}
                  </label>
                </>
              ) : null}
              <div className="profile-review">
                <div><span>{t("auth.name")}</span><strong>{name || t("common.notProvided")}</strong></div>
                <div><span>{t("auth.email")}</span><strong>{email || t("common.notProvided")}</strong></div>
                <div><span>{t("auth.phone")}</span><strong>{phone || t("common.notProvided")}</strong></div>
                <div><span>{t("auth.projectName")}</span><strong>{projectName || t("common.notProvided")}</strong></div>
                <div><span>{t("auth.address")}</span><strong>{address || t("common.notProvided")}</strong></div>
              </div>
            </>
          ) : null}
          <div className="form-actions two-actions">
            <Button type="button" variant="outline" icon={<ArrowLeft size={18} />} onClick={goBack} disabled={step === 0}>{t("common.back")}</Button>
            {step < profileStepCount - 1 ? (
              <Button type="button" icon={<ArrowRight size={18} />} onClick={goNext} disabled={!canContinue}>{t("common.next")}</Button>
            ) : (
              <Button type="submit" disabled={!canContinue}>{t("auth.submitProfile")}</Button>
            )}
          </div>
        </form>
      </Card>
    </section>
  );
}
