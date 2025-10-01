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
} from "@/components/ui/sidebar";
import { Home, Users, PlusCircle, ClipboardList, CalendarDays } from "lucide-react";


const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/patients", icon: Users, label: "Clientes" },
  { href: "/sessions", icon: ClipboardList, label: "Sesiones" },
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
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
            <SidebarMenuButton onClick={() => setIsNewEntryDialogOpen(true)} variant="outline" className="w-full justify-start text-sm bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground">
              <PlusCircle />
              <span>Nueva Nota</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarSearch />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <NewEntryDialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen} />
    </>
  );
}
