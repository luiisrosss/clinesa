import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function LandingFaq() {
  const faqs = [
    {
      question: "¿Es segura la plataforma para los datos de mis pacientes?",
      answer: "Sí. La seguridad es nuestra máxima prioridad. Utilizamos encriptación de extremo a extremo y cumplimos con las normativas de protección de datos como RGPD y HIPAA para garantizar que toda la información esté segura y confidencial."
    },
    {
      question: "¿Qué tipo de audio puedo subir?",
      answer: "Puedes subir grabaciones de audio en formato MP3. Nuestra IA está optimizada para transcribir con alta precisión el habla en este formato."
    },
    {
      question: "¿La IA reemplaza mi juicio clínico?",
      answer: "No, en absoluto. Clinesa es una herramienta de apoyo diseñada para potenciar tus habilidades. La IA proporciona resúmenes, análisis y métricas para informarte, pero el juicio clínico y las decisiones finales siempre son tuyas."
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer: "Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones. Tendrás acceso a la plataforma hasta el final de tu ciclo de facturación actual."
    }
  ];

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-headline">Preguntas Frecuentes</h2>
          <p className="text-muted-foreground">Resolvemos algunas de tus dudas.</p>
        </div>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
