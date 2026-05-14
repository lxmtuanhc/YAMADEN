import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-state">
      <AlertCircle size={22} />
      <span>{message}</span>
    </div>
  );
}
