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
} from "@/components/ui/sidebar";
import { Home, Users, PlusCircle, ClipboardList, CalendarDays, Settings, LifeBuoy } from "lucide-react";


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

  return (
    <>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarSearch />
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsNewEntryDialogOpen(true)}>
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
