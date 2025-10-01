import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LandingTestimonials() {
  const testimonials = [
    {
      name: "Dr. Ana García",
      title: "Psicóloga Clínica",
      quote: "Clinesa ha cambiado mi forma de trabajar. Ahora dedico más tiempo a la terapia y menos a la burocracia. Los análisis de IA son sorprendentemente precisos.",
      avatar: "https://picsum.photos/seed/ana/100/100"
    },
    {
      name: "Carlos Martínez",
      title: "Terapeuta Cognitivo-Conductual",
      quote: "La función de transcripción es un salvavidas. Me ahorra al menos 5 horas a la semana. Es una herramienta indispensable en mi práctica diaria.",
      avatar: "https://picsum.photos/seed/carlos/100/100"
    },
    {
      name: "Sofía Lorenzo",
      title: "Psicoterapeuta",
      quote: "Estaba escéptica sobre la IA en terapia, pero Clinesa me ha demostrado que puede ser un aliado increíble para mejorar la continuidad del tratamiento y no perder detalles importantes.",
      avatar: "https://picsum.photos/seed/sofia/100/100"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-headline">Lo que Dicen los Profesionales</h2>
          <p className="text-muted-foreground">Descubre por qué tus colegas confían en Clinesa.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="border rounded-lg p-6 flex flex-col bg-card">
              <p className="text-muted-foreground mb-6 flex-grow">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
