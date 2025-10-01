"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/data/patients";
import type { Patient } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {patient.name} {patient.lastName}
        </CardTitle>
        <CardDescription>{patient.email} - {patient.phone}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Motivo de consulta:</span> {patient.reasonForConsultation}
        </p>
      </CardContent>
    </Card>
  );
}


export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestiona los registros de tus clientes."
      >
        <Button asChild>
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </PageHeader>
      <div className="p-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          ) : (
            <p className="text-muted-foreground text-center col-span-full">No se encontraron clientes.</p>
          )}
        </div>
      </div>
    </>
  );
}
