import { PageHeader } from "@/components/page-header";
import { NewPatientForm } from "@/components/patients/new-patient-form";

export default function NewPatientPage() {
  return (
    <>
      <PageHeader title="Nuevo Cliente" description="Añade un nuevo cliente a tus registros." />
      <NewPatientForm />
    </>
  );
}
