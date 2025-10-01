"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/data/sessions";
import { getPatients, savePatient } from "@/data/patients";
import type { Session, Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { NewPatientForm } from "@/components/patients/new-patient-form";

function NewPatientModal({ open, onOpenChange, onPatientCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onPatientCreated: (patientId: string) => void }) {
  
  // This modal now re-uses the full NewPatientForm.
  // We can't directly get the new patient object back from the form.
  // Instead, we just close the modal and expect the parent component to refetch patients.
  const handleModalClose = (patientId?: string) => {
    onOpenChange(false);
    if(patientId) {
      onPatientCreated(patientId);
    }
  }

  // This is a simplified version, as the full form handles its own logic.
  // We just need a way to close the modal and refresh the patient list.
  // A better implementation might use a global state manager.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <NewPatientForm />
      </DialogContent>
    </Dialog>
  )
}

export function NewSessionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(50);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  useEffect(() => {
    // Fetch patients on mount and whenever the modal is closed
    const allPatients = getPatients();
    setPatients(allPatients);
  }, [isPatientModalOpen]); // Re-fetch when modal closes

  const handlePatientCreated = (newPatientId: string) => {
    const allPatients = getPatients();
    setPatients(allPatients);
    setSelectedPatientId(newPatientId);
    setIsPatientModalOpen(false);
    toast({ title: "Éxito", description: "Nuevo paciente creado y seleccionado."});
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId);

    if (!patient || !sessionDate || duration < 1) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos correctamente.",
        variant: "destructive",
      });
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      patientName: `${patient.name} ${patient.lastName}`,
      professionalId: patient.assignedProfessional || "prof1",
      sessionDate: new Date(sessionDate).toISOString(),
      duration,
    };

    saveSession(newSession);
    toast({
      title: "Éxito",
      description: "Nueva sesión creada.",
    });
    router.push(`/sessions/${newSession.id}`);
  };

  return (
    <>
      <div className="p-6">
          <Card className="max-w-2xl mx-auto">
              <CardHeader>
                  <CardTitle>Crear Nueva Sesión</CardTitle>
                  <CardDescription>
                  Introduce los detalles de la nueva sesión.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="patient">Paciente *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                          <SelectTrigger id="patient">
                              <SelectValue placeholder="Selecciona un paciente" />
                          </SelectTrigger>
                          <SelectContent>
                              {patients.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} {p.lastName}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => setIsPatientModalOpen(true)}>Crear Nuevo</Button>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="sessionDate">Fecha de la Sesión *</Label>
                        <Input
                        id="sessionDate"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración (minutos) *</Label>
                        <Input
                        id="duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                        min="1"
                        required
                        />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Crear Sesión</Button>
                  </form>
              </CardContent>
          </Card>
      </div>
      
      {/* 
        This is a bit of a workaround. Ideally, the NewPatientForm would be a more reusable
        component that could signal its completion. For now, we just show it in a modal
        and refetch patients when the modal closes.
      */}
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent className="max-w-3xl">
           <NewPatientForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
