import { PageHeader } from "@/components/page-header";
import { NewPatientForm } from "@/components/patients/new-patient-form";

export default function NewPatientPage() {
  return (
    <>
      <PageHeader title="Nuevo Paciente" description="Añade un nuevo paciente a tus registros." />
      <NewPatientForm />
    </>
  );
}
