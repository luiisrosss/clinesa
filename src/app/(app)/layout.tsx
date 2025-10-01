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
        <div className="p-4">
            <SidebarTrigger />
        </div>
        {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
