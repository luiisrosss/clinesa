import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import AppSidebarContent from "@/components/app-sidebar-content";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="md:hidden"/>
            </div>
            {children}
        </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
