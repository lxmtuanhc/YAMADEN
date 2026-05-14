import { Check } from "lucide-react";

interface TimelineProps {
  steps: string[];
  activeIndex: number;
}

export function Timeline({ steps, activeIndex }: TimelineProps) {
  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div className={`timeline-item ${index <= activeIndex ? "done" : ""}`} key={step}>
          <div className="timeline-dot">{index <= activeIndex ? <Check size={12} /> : null}</div>
          <div className="timeline-text">{step}</div>
        </div>
      ))}
    </div>
  );
}
