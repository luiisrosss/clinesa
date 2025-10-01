"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/actions/patients";
import type { Patient } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, User, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const allPatients = await getPatients();
        setPatients(allPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);

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
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : patients.length > 0 ? (
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
