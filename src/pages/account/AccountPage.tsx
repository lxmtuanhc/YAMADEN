import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  FileLock2,
  FileText,
  Languages,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogoutConfirmModal } from "../../components/LogoutConfirmModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { TranslationKey } from "../../i18n";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppStore } from "../../stores/appStore";
import type { Language, User } from "../../types";

const notificationKey = "yamaden-notifications-enabled";

type AccountScreen =
  | "main"
  | "personal"
  | "company"
  | "address"
  | "notifications"
  | "language"
  | "support"
  | "chat"
  | "terms"
  | "privacy";

export function AccountPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);
  const setLanguage = useAppStore(state => state.setLanguage);
  const updateUserProfile = useAppStore(state => state.updateUserProfile);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem(notificationKey);
    if (stored) return stored === "true";
    return user?.notificationsEnabled ?? true;
  });

  useEffect(() => {
    if (user?.notificationsEnabled !== undefined && !localStorage.getItem(notificationKey)) {
      setNotificationsEnabled(Boolean(user.notificationsEnabled));
    }
  }, [user?.notificationsEnabled]);

  const screen = useMemo<AccountScreen>(() => {
    const name = location.pathname.replace(/^\/account\/?/, "");
    if (!name) return "main";
    if (["personal", "company", "address", "notifications", "language", "support", "chat", "terms", "privacy"].includes(name)) {
      return name as AccountScreen;
    }
    return "main";
  }, [location.pathname]);

  function handleLogout() {
    setIsLogoutConfirmOpen(true);
  }

  function confirmLogout() {
    logout();
    setIsLogoutConfirmOpen(false);
    navigate("/login");
  }

  async function handleNotificationChange(value: boolean) {
    setNotificationsEnabled(value);
    localStorage.setItem(notificationKey, String(value));
    if (user) {
      try {
        await updateUserProfile({ notificationsEnabled: value });
      } catch {
        // Keep the local preference; backend sync can be retried from the screen.
      }
    }
  }

  if (screen === "personal") {
    return (
      <AccountEditScreen
        titleKey="account.personalInfo"
        successKey="account.updateSuccess"
        fields={[
          { name: "name", labelKey: "auth.name", value: user?.name || "", required: true },
          { name: "email", labelKey: "auth.email", value: user?.email || "", type: "email" },
          { name: "phone", labelKey: "auth.phone", value: user?.phone || "", disabled: true }
        ]}
        onSave={updateUserProfile}
      />
    );
  }

  if (screen === "company") {
    return (
      <AccountEditScreen
        titleKey="account.companyInfo"
        successKey="account.updateSuccess"
        fields={[
          { name: "companyName", labelKey: "auth.companyName", value: user?.companyName || "" },
          { name: "contactPerson", labelKey: "auth.contactPerson", value: user?.contactPerson || "" },
          { name: "companyAddress", labelKey: "account.companyAddress", value: user?.companyAddress || "" },
          { name: "taxId", labelKey: "account.taxId", value: user?.taxId || "" }
        ]}
        onSave={updateUserProfile}
      />
    );
  }

  if (screen === "address") {
    return (
      <AccountEditScreen
        titleKey="account.siteAddress"
        successKey="account.updateSuccess"
        fields={[
          { name: "projectName", labelKey: "auth.projectName", value: user?.projectName || "" },
          { name: "address", labelKey: "account.siteAddress", value: user?.address || "", required: true },
          { name: "constructionType", labelKey: "account.constructionType", value: user?.constructionType || "" },
          { name: "note", labelKey: "account.notes", value: user?.note || "", multiline: true }
        ]}
        onSave={updateUserProfile}
      />
    );
  }

  if (screen === "notifications") {
    return (
      <section className="page account-page">
        <AccountHeader title={t("account.notifications")} />
        <Card className="settings-card">
          <button className="settings-row" type="button" onClick={() => handleNotificationChange(!notificationsEnabled)}>
            <span className="settings-icon"><Bell size={18} /></span>
            <span className="settings-main">
              <strong>{t("account.notifications")}</strong>
              <small>{notificationsEnabled ? t("account.notificationsOn") : t("account.notificationsOff")}</small>
            </span>
            <span className={`settings-toggle${notificationsEnabled ? " active" : ""}`} aria-hidden="true"><span /></span>
          </button>
        </Card>
      </section>
    );
  }

  if (screen === "language") {
    const options: Array<{ value: Language; labelKey: TranslationKey; short: string }> = [
      { value: "vi", labelKey: "language.vi", short: "VI" },
      { value: "ja", labelKey: "language.ja", short: "JA" }
    ];
    return (
      <section className="page account-page">
        <AccountHeader title={t("account.language")} />
        <Card className="settings-card">
          {options.map(option => (
            <button className="settings-row" type="button" key={option.value} onClick={() => setLanguage(option.value)}>
              <span className="settings-icon"><Languages size={18} /></span>
              <span className="settings-main">
                <strong>{t(option.labelKey)}</strong>
                <small>{option.short}</small>
              </span>
              {language === option.value ? <Check className="settings-check" size={20} /> : <ChevronRight size={18} />}
            </button>
          ))}
        </Card>
      </section>
    );
  }

  if (["support", "chat", "terms", "privacy"].includes(screen)) {
    const meta: Record<string, { title: TranslationKey; body: TranslationKey; Icon: typeof CircleHelp }> = {
      support: { title: "account.supportCenter", body: "account.supportPlaceholder", Icon: CircleHelp },
      chat: { title: "account.supportChat", body: "account.chatPlaceholder", Icon: MessageCircle },
      terms: { title: "account.terms", body: "account.termsPlaceholder", Icon: FileText },
      privacy: { title: "account.privacy", body: "account.privacyPlaceholder", Icon: FileLock2 }
    };
    const item = meta[screen];
    return (
      <section className="page account-page">
        <AccountHeader title={t(item.title)} />
        <Card className="account-placeholder-card">
          <div className="account-placeholder-icon"><item.Icon size={24} /></div>
          <h2>{t(item.title)}</h2>
          <p>{t(item.body)}</p>
        </Card>
      </section>
    );
  }

  const isCompany = user?.accountType === "company";
  return (
    <section className="page account-page">
      <div className="page-header"><h1>{t("account.title")}</h1></div>
      <Card className="account-profile-card">
        <div className="account-avatar">{initials(user)}</div>
        <div className="account-profile-main">
          <h2>{user?.name || t("common.notProvided")}</h2>
          <p>{user?.phone || t("common.notProvided")}</p>
          <p>{user?.email || t("common.notProvided")}</p>
          <span>{isCompany ? t("auth.profileCompany") : t("auth.profilePersonal")}</span>
        </div>
        <button className="account-profile-edit" type="button" aria-label={t("account.personalInfo")} onClick={() => navigate("/account/personal")}>
          <UserRound size={18} />
        </button>
      </Card>

      <SettingsSection>
        <SettingsRow icon={<UserRound size={18} />} label={t("account.personalInfo")} value={user?.name} onClick={() => navigate("/account/personal")} />
        <SettingsRow icon={<MapPin size={18} />} label={t("account.siteAddress")} value={user?.address} onClick={() => navigate("/account/address")} />
        {isCompany ? <SettingsRow icon={<Building2 size={18} />} label={t("account.companyInfo")} value={user?.companyName} onClick={() => navigate("/account/company")} /> : null}
      </SettingsSection>

      <SettingsSection>
        <SettingsRow icon={<Bell size={18} />} label={t("account.notifications")} value={notificationsEnabled ? t("account.notificationsOn") : t("account.notificationsOff")} onClick={() => navigate("/account/notifications")} />
        <SettingsRow icon={<Languages size={18} />} label={t("account.language")} value={language.toUpperCase()} onClick={() => navigate("/account/language")} />
      </SettingsSection>

      <SettingsSection>
        <SettingsRow icon={<CircleHelp size={18} />} label={t("account.supportCenter")} onClick={() => navigate("/account/support")} />
        <SettingsRow icon={<MessageCircle size={18} />} label={t("account.supportChat")} onClick={() => navigate("/account/chat")} />
        <SettingsRow icon={<FileText size={18} />} label={t("account.terms")} onClick={() => navigate("/account/terms")} />
        <SettingsRow icon={<ShieldCheck size={18} />} label={t("account.privacy")} onClick={() => navigate("/account/privacy")} />
      </SettingsSection>

      <Card className="account-logout-card">
        <Button variant="danger" icon={<LogOut size={18} />} onClick={handleLogout}>{t("account.logout")}</Button>
      </Card>
      <LogoutConfirmModal open={isLogoutConfirmOpen} onCancel={() => setIsLogoutConfirmOpen(false)} onConfirm={confirmLogout} />
    </section>
  );
}

function AccountHeader({ title }: { title: string }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
    </div>
  );
}

function SettingsSection({ children }: { children: ReactNode }) {
  return <Card className="settings-card">{children}</Card>;
}

function SettingsRow({ icon, label, value, onClick }: { icon: ReactNode; label: string; value?: string; onClick: () => void }) {
  return (
    <button className="settings-row" type="button" onClick={onClick}>
      <span className="settings-icon">{icon}</span>
      <span className="settings-label">{label}</span>
      {value ? <span className="settings-value">{value}</span> : null}
      <ChevronRight size={18} />
    </button>
  );
}

type AccountField = {
  name: keyof Pick<User, "name" | "email" | "phone" | "companyName" | "contactPerson" | "companyAddress" | "taxId" | "projectName" | "address" | "constructionType" | "note">;
  labelKey: TranslationKey;
  value: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  disabled?: boolean;
};

function AccountEditScreen({
  titleKey,
  successKey,
  fields,
  onSave
}: {
  titleKey: TranslationKey;
  successKey: TranslationKey;
  fields: AccountField[];
  onSave: (profile: Partial<User>) => Promise<User>;
}) {
  const { t } = useTranslation();
  const [values, setValues] = useState(() => Object.fromEntries(fields.map(field => [field.name, field.value])) as Record<string, string>);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function validate() {
    const missing = fields.some(field => field.required && !values[field.name]?.trim());
    if (missing) return t("validation.required");
    const email = values.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("validation.email");
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const enabledValues = Object.fromEntries(fields.filter(field => !field.disabled).map(field => [field.name, values[field.name]]));
      await onSave(enabledValues as Partial<User>);
      setMessage(t(successKey));
    } catch {
      setError(t("account.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page account-page">
      <AccountHeader title={t(titleKey)} />
      <Card>
        <form className="account-edit-form" onSubmit={handleSubmit}>
          {fields.map(field => (
            <label className="field" key={field.name}>
              <span>{t(field.labelKey)}{field.required ? " *" : ""}</span>
              {field.multiline ? (
                <textarea value={values[field.name] || ""} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} />
              ) : (
                <input
                  type={field.type || "text"}
                  value={values[field.name] || ""}
                  disabled={field.disabled}
                  onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))}
                />
              )}
            </label>
          ))}
          {message ? <div className="form-message success">{message}</div> : null}
          {error ? <div className="form-message error">{error}</div> : null}
          <Button type="submit" disabled={isSaving}>{isSaving ? t("common.loading") : t("account.saveChanges")}</Button>
        </form>
      </Card>
    </section>
  );
}

function initials(user: User | null) {
  const value = user?.name || user?.phone || "Y";
  return value.trim().slice(0, 1).toUpperCase();
}
