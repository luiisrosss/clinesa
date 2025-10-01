import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingCta() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold font-headline mb-4">Transforma tu Práctica Hoy</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Deja que la inteligencia artificial se encargue del trabajo pesado y dedica más tiempo a lo que realmente importa: tus pacientes.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">Empieza Gratis</Link>
        </Button>
      </div>
    </section>
  );
}
