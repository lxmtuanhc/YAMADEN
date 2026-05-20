import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import type { AuthRequestError } from "../../services/authService";

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppStore(state => state.user);
  const login = useAppStore(state => state.login);
  const [phone, setPhone] = useState(user?.phone || "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPin("");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim() || !pin.trim()) {
      setError(t("auth.loginErrorRequired"));
      return;
    }
    try {
      if (await login(phone, pin)) {
        navigate("/home");
        return;
      }
      const latestUser = useAppStore.getState().user || user;
      const isPendingAccount = latestUser?.phone === phone.trim() && latestUser.status === "pendingApproval";
      if (isPendingAccount) {
        navigate("/pending");
        return;
      }
      setError(isPendingAccount ? t("auth.loginErrorPending") : t("auth.loginErrorInvalid"));
    } catch (caught) {
      const error = caught as AuthRequestError;
      if (error.code === "ACCOUNT_BLOCKED") {
        setError(t("auth.loginErrorBlocked"));
        return;
      }
      if (error.code === "ACCOUNT_DELETED") {
        setError(t("auth.loginErrorDeleted"));
        return;
      }
      setError(t("auth.loginErrorInvalid"));
    }
  }

  return (
    <section className="auth-card-wrap">
      <Card className="auth-card">
        <h1>{t("auth.login")}</h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>{t("auth.phone")}</span>
            <input value={phone} inputMode="tel" autoComplete="username" onChange={event => setPhone(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("auth.pin")}</span>
            <input value={pin} maxLength={6} type="password" inputMode="numeric" autoComplete="new-password" onChange={event => setPin(event.target.value)} />
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
