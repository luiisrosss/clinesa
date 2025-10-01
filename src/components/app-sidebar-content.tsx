"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { NewEntryDialog } from "./new-entry-dialog";
import { SidebarSearch } from "./sidebar-search";
import { 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarMenuLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Home, Users, PlusCircle, ClipboardList, CalendarDays, Settings, LifeBuoy, BrainCircuit } from "lucide-react";


const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/patients", icon: Users, label: "Clientes" },
  { href: "/sessions", icon: ClipboardList, label: "Sesiones" },
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
];

const secondaryNavItems = [
    { href: "/settings", icon: Settings, label: "Ajustes" },
    { href: "/support", icon: LifeBuoy, label: "Soporte" },
];

export default function AppSidebarContent() {
  const pathname = usePathname();
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const { state: sidebarState } = useSidebar();


  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground transition-opacity duration-100 group-data-[state=collapsed]/sidebar-wrapper:opacity-0">
                Clinesa
            </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarSearch />
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsNewEntryDialogOpen(true)} tooltip="Nueva Nota">
                    <PlusCircle />
                    <SidebarMenuLabel>Nueva Nota</SidebarMenuLabel>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarMenu>
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

        <SidebarFooter>
            <SidebarSeparator />
            <SidebarMenu>
                 {secondaryNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href} passHref>
                        <SidebarMenuButton
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                        >
                            <item.icon />
                            <SidebarMenuLabel>{item.label}</SidebarMenuLabel>
                        </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarFooter>

      <NewEntryDialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen} />
    </>
  );
}
