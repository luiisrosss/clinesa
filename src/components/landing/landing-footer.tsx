import { AppLogo } from "@/components/app-logo";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <AppLogo />
        </div>
        <nav className="flex gap-4 mb-4 md:mb-0">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Características</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Precios</Link>
          <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
        </nav>
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Clinesa. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
