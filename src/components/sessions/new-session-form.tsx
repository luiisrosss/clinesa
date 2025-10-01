"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/data/sessions";
import { getPatients } from "@/data/patients";
import type { Session, Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog } from "@/components/ui/dialog";
import { NewPatientForm } from "@/components/patients/new-patient-form";
import { format } from "date-fns";

type NewSessionFormProps = {
  initialDate?: Date;
  onSessionCreated?: () => void;
}

export function NewSessionForm({ initialDate, onSessionCreated }: NewSessionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [sessionDate, setSessionDate] = useState(format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [duration, setDuration] = useState(50);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  useEffect(() => {
    const allPatients = getPatients();
    setPatients(allPatients);
  }, [isPatientModalOpen]);

  useEffect(() => {
    if (initialDate) {
      setSessionDate(format(initialDate, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [initialDate]);


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

    if (onSessionCreated) {
      onSessionCreated();
    } else {
      router.push(`/sessions/${newSession.id}`);
    }
  };
  
  const justDate = sessionDate.split('T')[0];
  const justTime = sessionDate.split('T')[1];

  return (
    <>
      <div className="p-6">
          <Card className="max-w-2xl mx-auto border-0 shadow-none">
              <CardHeader>
                  <CardTitle>Crear Nueva Sesión</CardTitle>
                  <CardDescription>
                  Introduce los detalles de la nueva sesión.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                      <Label htmlFor="patient">Cliente *</Label>
                      <div className="flex gap-2">
                        <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
                          <SelectTrigger id="patient">
                              <SelectValue placeholder="Selecciona un cliente" />
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
                          value={justDate}
                          onChange={(e) => setSessionDate(`${e.target.value}T${justTime}`)}
                          required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sessionTime">Hora de la Sesión *</Label>
                        <Input
                          id="sessionTime"
                          type="time"
                          value={justTime}
                          onChange={(e) => setSessionDate(`${justDate}T${e.target.value}`)}
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
      
      <Dialog open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen}>
        <DialogContent className="max-w-3xl">
           <NewPatientForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
