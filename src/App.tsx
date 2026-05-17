import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { AppShell } from "./layouts/AppShell";
import { useAppStore } from "./stores/appStore";
import { WelcomePage } from "./pages/auth/WelcomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ProfileSetupPage } from "./pages/auth/ProfileSetupPage";
import { PendingApprovalPage } from "./pages/auth/PendingApprovalPage";
import { HomePage } from "./pages/main/HomePage";
import { RequestCreatePage } from "./pages/requests/RequestCreatePage";
import { RequestDetailPage } from "./pages/requests/RequestDetailPage";
import { RequestsPage } from "./pages/requests/RequestsPage";
import { QuotesPage } from "./pages/quotes/QuotesPage";
import { QuoteDetailPage } from "./pages/quotes/QuoteDetailPage";
import { SchedulePage } from "./pages/schedule/SchedulePage";
import { AccountPage } from "./pages/account/AccountPage";
import { SplashScreen } from "./components/SplashScreen";
import { LegacyServiceWorkerCleanup } from "./components/LegacyServiceWorkerCleanup";
import { useTranslation } from "./hooks/useTranslation";

function AuthBootstrapScreen() {
  const { t } = useTranslation();
  return (
    <div className="auth-bootstrap-screen" role="status" aria-live="polite">
      <Loader2 size={26} />
      <span>{t("common.loading")}</span>
    </div>
  );
}

function AuthGate() {
  const authStatus = useAppStore(state => state.authStatus);
  if (authStatus === "active") return <AppShell />;
  if (authStatus === "profileIncomplete") return <Navigate to="/profile-setup" replace />;
  if (authStatus === "pendingApproval") return <Navigate to="/pending" replace />;
  return <Navigate to="/login" replace />;
}

function AuthRouteGate() {
  const location = useLocation();
  const authStatus = useAppStore(state => state.authStatus);

  if (authStatus === "active") return <Navigate to="/home" replace />;
  if (authStatus === "profileIncomplete" && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }
  if (authStatus === "pendingApproval" && location.pathname !== "/pending") {
    return <Navigate to="/pending" replace />;
  }
  if (authStatus === "notLoggedIn" && location.pathname === "/") {
    return <Navigate to="/login" replace />;
  }

  return <AuthLayout />;
}

export function App() {
  const initializeAuth = useAppStore(state => state.initializeAuth);
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    initializeAuth().finally(() => {
      if (mounted) setIsAuthBootstrapping(false);
    });
    return () => {
      mounted = false;
    };
  }, [initializeAuth]);

  return (
    <>
      <LegacyServiceWorkerCleanup />
      <SplashScreen />
      {isAuthBootstrapping ? (
        <AuthBootstrapScreen />
      ) : (
        <Routes>
          <Route element={<AuthRouteGate />}>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile-setup" element={<ProfileSetupPage />} />
            <Route path="/pending" element={<PendingApprovalPage />} />
          </Route>
          <Route element={<AuthGate />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/new" element={<RequestCreatePage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/quotes/:id" element={<QuoteDetailPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/:section" element={<AccountPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}
    </>
  );
}
