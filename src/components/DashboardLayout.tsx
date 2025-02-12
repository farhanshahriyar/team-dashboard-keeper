
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-8 w-full overflow-auto pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
