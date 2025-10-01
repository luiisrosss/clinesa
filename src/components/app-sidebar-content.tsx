"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { Users, PlusCircle, ClipboardList, CalendarDays, Settings, BrainCircuit, LayoutDashboard } from "lucide-react";


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patients", icon: Users, label: "Clientes" },
  { href: "/sessions", icon: ClipboardList, label: "Sesiones" },
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
];

const secondaryNavItems = [
    { href: "/settings", icon: Settings, label: "Ajustes" },
];

export default function AppSidebarContent() {
  const pathname = usePathname();
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);


  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Home">
            <BrainCircuit className="h-6 w-6 text-primary flex-shrink-0" />
            <SidebarMenuLabel>
                <h1 className="text-xl font-bold font-headline text-foreground">
                    Clinesa
                </h1>
            </SidebarMenuLabel>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarSearch />
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsNewEntryDialogOpen(true)} tooltip="Nueva Nota">
                    <PlusCircle className="h-5 w-5 flex-shrink-0" />
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
                    <item.icon className="h-5 w-5 flex-shrink-0" />
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
                            <item.icon className="h-5 w-5 flex-shrink-0" />
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
