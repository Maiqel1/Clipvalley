import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

type ChipProps = {
  icon?: IconName;
  tone?: "neutral" | "primary" | "tertiary";
  className?: string;
  children: React.ReactNode;
};

const TONES = {
  neutral: "bg-secondary-container text-secondary",
  primary: "bg-primary/10 text-primary",
  tertiary: "bg-tertiary/10 text-tertiary",
} as const;

export function Chip({ icon, tone = "neutral", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-sm font-medium",
        TONES[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
