import { PageHeader } from "@/components/page-header";
import { NewSessionForm } from "@/components/sessions/new-session-form";

export default function NewSessionPage() {
  return (
    <>
      <PageHeader title="New Session" />
      <NewSessionForm />
    </>
  );
}
