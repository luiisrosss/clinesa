import { CalendarClient } from "@/components/calendar/calendar-client";
import { PageHeader } from "@/components/page-header";

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendario"
        description="Gestiona y visualiza tus sesiones."
      />
      <CalendarClient />
    </>
  );
}
