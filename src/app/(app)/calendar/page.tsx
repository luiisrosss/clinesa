import { PageHeader } from "@/components/page-header";
import { getSessions } from "@/data/sessions";
import { CalendarClient } from "@/components/calendar/calendar-client";

export default function CalendarPage() {
  const sessions = getSessions();

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Visualiza tus sesiones programadas."
      />
      <CalendarClient sessions={sessions} />
    </>
  );
}
