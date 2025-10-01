import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function LandingPricing() {
  const plans = [
    {
      name: "Básico",
      price: "0€",
      period: "para siempre",
      description: "Ideal para empezar y probar las funcionalidades clave.",
      features: [
        "10 transcripciones al mes",
        "Análisis de IA en 5 sesiones",
        "Gestión de hasta 15 pacientes",
        "Soporte por email"
      ],
      cta: "Empieza Gratis",
      href: "/dashboard"
    },
    {
      name: "Profesional",
      price: "29€",
      period: "por mes",
      description: "Para profesionales que buscan optimizar su práctica a fondo.",
      features: [
        "Transcripciones ilimitadas",
        "Análisis de IA ilimitados",
        "Pacientes ilimitados",
        "Soporte prioritario"
      ],
      cta: "Elige Profesional",
      href: "/dashboard",
      popular: true
    },
     {
      name: "Equipos",
      price: "Consultar",
      period: "",
      description: "Soluciones a medida para clínicas y equipos de trabajo.",
      features: [
        "Todo lo del plan Profesional",
        "Facturación centralizada",
        "Roles y permisos de equipo",
        "Manager de cuenta dedicado"
      ],
      cta: "Contacta con Ventas",
      href: "#"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-headline">Un Plan para Cada Necesidad</h2>
          <p className="text-muted-foreground">Elige el plan que mejor se adapte a tu forma de trabajar.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className={`border rounded-lg p-8 flex flex-col ${plan.popular ? 'border-primary shadow-2xl' : 'bg-card'}`}>
              {plan.popular && <div className="text-center mb-4 font-semibold text-primary">Más Popular</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground">/{plan.period.split('/')[1]}</span>}
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" variant={plan.popular ? 'default' : 'outline'} className="w-full">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
