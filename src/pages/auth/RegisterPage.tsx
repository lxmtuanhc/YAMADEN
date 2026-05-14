import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useAppStore(state => state.register);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim() || pin.length !== 6 || pin !== confirmPin) {
      setError(t("common.required"));
      return;
    }
    register(phone.trim(), pin);
    navigate("/profile-setup");
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <h1>{t("auth.register")}</h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("auth.phone")}</span>
            <input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("auth.pin")}</span>
            <input value={pin} maxLength={6} type="password" inputMode="numeric" onChange={event => setPin(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("auth.confirmPin")}</span>
            <input value={confirmPin} maxLength={6} type="password" inputMode="numeric" onChange={event => setConfirmPin(event.target.value)} />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <Button type="submit">{t("auth.register")}</Button>
        </form>
        <button className="text-link" type="button" onClick={() => navigate("/login")}>
          {t("auth.hasAccount")} {t("auth.login")}
        </button>
        <Button type="button" variant="outline" icon={<ArrowLeft size={18} />} onClick={() => navigate("/login")}>
          {t("common.back")}
        </Button>
      </Card>
    </section>
  );
}
