import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <AppLogo />
          <nav className="hidden md:flex gap-4">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Características</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Precios</Link>
            <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground">FAQ</Link>
          </nav>
        </div>
        <Button asChild>
          <Link href="/home">Iniciar Sesión</Link>
        </Button>
      </div>
    </header>
  );
}
