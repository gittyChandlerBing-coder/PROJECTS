import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function Home() {
  return (
    <AuthGuard>
      <DashboardShell />
    </AuthGuard>
  );
}
