import { cn } from "@/lib/cn";

export type IconName =
  | "add"
  | "arrow_back"
  | "arrow_forward"
  | "bookmark"
  | "check"
  | "close"
  | "cloud_off"
  | "content_copy"
  | "delete"
  | "description"
  | "download"
  | "edit"
  | "image"
  | "link"
  | "lock"
  | "logout"
  | "mail"
  | "open_in_new"
  | "person"
  | "search"
  | "settings"
  | "subject"
  | "sync"
  | "visibility"
  | "visibility_off";

type IconProps = {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
};

export function Icon({ name, size = 20, filled = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined shrink-0", className)}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}
