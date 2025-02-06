import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}