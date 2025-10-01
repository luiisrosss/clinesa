"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Home, Users, PlusCircle, ClipboardList, CalendarDays } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NewEntryDialog } from "./new-entry-dialog";
import { SidebarSearch } from "./sidebar-search";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/patients", icon: Users, label: "Clientes" },
  { href: "/sessions", icon: ClipboardList, label: "Sesiones" },
  { href: "/calendar", icon: CalendarDays, label: "Calendario" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);

  return (
    <>
      <aside className="w-64 flex-col border-r bg-card p-4 hidden md:flex">
        <div className="p-2 mb-4">
          <AppLogo />
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="default" className="w-full justify-start" onClick={() => setIsNewEntryDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Nota
          </Button>
          
          <SidebarSearch />

          <Separator className="my-2" />

          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <NewEntryDialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen} />
    </>
  );
}
