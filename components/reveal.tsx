import { cn } from "@/lib/cn";

type RevealProps = {
  index?: number;
  whileInView?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ index = 0, whileInView = false, className, children }: RevealProps) {
  return (
    <div
      className={cn("animate-slide-fade-in", whileInView && "reveal-in-view", className)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {children}
    </div>
  );
}
