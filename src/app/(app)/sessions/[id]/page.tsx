import { PageHeader } from "@/components/page-header";
import { SessionDetailsClient } from "@/components/sessions/session-details-client";
import { getSessionById } from "@/data/sessions"; // This is only for the header title, won't work server-side for real data
import { format } from "date-fns";

// This is a server component, but localStorage access happens in the client component.
// To provide a dynamic title we do a client-side fetch in the component itself. 
// A better approach with a real DB would be to fetch here on the server.
export default function SessionPage({ params }: { params: { id: string } }) {
  
  // A hypothetical server-side fetch for the title. Since we use localStorage, this is a bit tricky.
  // We'll just pass the ID and let the client component handle everything.
  // const session = getSessionById(params.id); // This will not work as expected on the server
  // const title = session ? `${session.patientName} - ${format(new Date(session.sessionDate), "PPP")}` : "Session Details";

  return (
    <>
      <PageHeader
        title="Session Details"
        description={`Viewing record for session ID: ${params.id}`}
      />
      <SessionDetailsClient sessionId={params.id} />
    </>
  );
}
