import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface RiskBadgeProps {
  level: "low" | "moderate" | "high" | "critical" | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const riskConfig = {
  low: {
    icon: CheckCircle,
    label: "Low Risk",
    className: "bg-success/10 text-success border-success/20",
  },
  moderate: {
    icon: AlertCircle,
    label: "Moderate Risk",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  high: {
    icon: AlertTriangle,
    label: "High Risk",
    className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  critical: {
    icon: XCircle,
    label: "Critical",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function RiskBadge({ level, size = "md", showLabel = true }: RiskBadgeProps) {
  if (!level) return null;

  const config = riskConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        config.className,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  );
}
