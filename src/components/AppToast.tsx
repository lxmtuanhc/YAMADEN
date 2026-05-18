type AppToastProps = {
  message: string;
  tone?: "success" | "error";
};

export function AppToast({ message, tone = "success" }: AppToastProps) {
  if (!message) return null;
  return (
    <div className={`app-toast ${tone}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
