"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, PlusCircle, ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/patients", icon: Users, label: "Pacientes" },
  { href: "/sessions", icon: ClipboardList, label: "Sesiones" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-col border-r bg-card p-4 hidden md:flex">
      <div className="p-2 mb-4">
        <AppLogo />
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Button asChild variant="default" className="w-full justify-start">
          <Link href="/sessions/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Sesión
          </Link>
        </Button>
        <Separator className="my-4" />
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
  );
}
