import { BrainCircuit, FileText, Mic, Users, Clock, Zap } from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: <Mic className="h-10 w-10 text-primary" />,
      title: "Transcripción Automática",
      description: "Convierte horas de audio en texto preciso en cuestión de minutos. Compatible con archivos MP3."
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Análisis con IA",
      description: "Obtén resúmenes, puntos clave y detecta patrones emocionales para una comprensión más profunda de cada sesión."
    },
    {
      icon: <FileText className="h-10 w-10 text-primary" />,
      title: "Notas SOAP Estructuradas",
      description: "Documenta tus sesiones de forma rápida y organizada con el método SOAP, asistido por sugerencias de la IA."
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Gestión de Clientes",
      description: "Mantén un registro centralizado y seguro de todos tus clientes y su historial de sesiones."
    },
  ];

  const benefits = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Ahorra Horas de Trabajo",
      description: "Reduce drásticamente el tiempo dedicado a tareas administrativas y de documentación."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Enfócate en tus Clientes",
      description: "Libera tu mente del papeleo y dedica tu energía a lo que mejor sabes hacer: la terapia."
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Mejora la Calidad de tus Notas",
      description: "Genera notas de sesión más completas, objetivas y consistentes con la ayuda de la IA."
    }
  ]

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Features */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-headline">Todo lo que Necesitas en un Solo Lugar</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Desde la transcripción hasta el análisis, Clinesa te ofrece las herramientas para optimizar tu práctica clínica.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 border rounded-lg bg-card">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-24">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-headline">Traduce Características en Beneficios Reales</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                No se trata de lo que hace, sino de lo que consigues.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
                 <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">{benefit.icon}</div>
                    <div>
                        <h3 className="text-lg font-semibold">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
