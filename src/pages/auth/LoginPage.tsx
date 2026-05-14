import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAppStore(state => state.login);
  const [phone, setPhone] = useState("08062417758");
  const [pin, setPin] = useState("123456");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!login(phone, pin)) {
      setError(t("common.required"));
      return;
    }
    navigate("/home");
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <h1>{t("auth.login")}</h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("auth.phone")}</span>
            <input value={phone} inputMode="tel" onChange={event => setPhone(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("auth.pin")}</span>
            <input value={pin} maxLength={6} type="password" inputMode="numeric" onChange={event => setPin(event.target.value)} />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <Button type="submit">{t("auth.login")}</Button>
        </form>
        <button className="text-link" type="button" onClick={() => navigate("/register")}>
          {t("auth.noAccount")} {t("auth.register")}
        </button>
      </Card>
    </section>
  );
}
