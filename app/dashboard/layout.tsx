import { SessionKeeper } from "@/components/session-keeper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionKeeper />
      {children}
    </>
  );
}
