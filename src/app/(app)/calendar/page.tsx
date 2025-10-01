import { PageHeader } from "@/components/page-header";
import { CalendarClient } from "@/components/calendar/calendar-client";

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendario"
        description="Visualiza tus sesiones programadas."
      />
      <CalendarClient />
    </>
  );
}
