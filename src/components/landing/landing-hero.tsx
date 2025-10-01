import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function LandingHero() {
  return (
    <section className="py-20 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight mb-4">
          Recupera tu Tiempo. Eleva tu Terapia.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          La plataforma con IA que automatiza tus notas de sesión y te ofrece análisis inteligentes para que puedas centrarte en tus pacientes.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard">Empieza Gratis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Descubre Más</Link>
          </Button>
        </div>
        <div className="mt-12">
            <div className="relative mx-auto rounded-xl shadow-2xl" style={{ maxWidth: '800px' }}>
                <Image
                    src="https://picsum.photos/seed/clinesa-dashboard/1200/800"
                    alt="Clinesa Dashboard"
                    width={1200}
                    height={800}
                    className="rounded-xl"
                    data-ai-hint="dashboard professional"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
