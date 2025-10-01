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

function NewPatientModal({ open, onOpenChange, onPatientCreated }: { open: boolean, onOpenChange: (open: boolean) => void, onPatientCreated: (patient: Patient) => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reasonForConsultation, setReasonForConsultation] = useState("");
  
  const handleSavePatient = () => {
    if (!name || !lastName || !phone || !email || !reasonForConsultation) {
       toast({ title: "Error", description: "Por favor, completa todos los campos.", variant: "destructive" });
       return;
    }
    const newPatient: Patient = {
        id: crypto.randomUUID(),
        name,
        lastName,
        phone,
        email,
        reasonForConsultation,
        registrationDate: new Date().toISOString(),
    };
    savePatient(newPatient);
    onPatientCreated(newPatient);
    onOpenChange(false);
    toast({ title: "Éxito", description: "Nuevo paciente creado y seleccionado."});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Paciente</DialogTitle>
          <DialogDescription>Añade un nuevo paciente y se seleccionará automáticamente para esta sesión.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
           <div className="space-y-2">
              <Label htmlFor="new-patient-name">Nombre</Label>
              <Input id="new-patient-name" value={name} onChange={e => setName(e.target.value)} />
           </div>
           <div className="space-y-2">
              <Label htmlFor="new-patient-lastName">Apellidos</Label>
              <Input id="new-patient-lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
           </div>
            <div className="space-y-2">
              <Label htmlFor="new-patient-phone">Teléfono</Label>
              <Input id="new-patient-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
           </div>
            <div className="space-y-2">
              <Label htmlFor="new-patient-email">Email</Label>
              <Input id="new-patient-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
           </div>
            <div className="space-y-2">
              <Label htmlFor="new-patient-reason">Motivo de Consulta</Label>
              <Input id="new-patient-reason" value={reasonForConsultation} onChange={e => setReasonForConsultation(e.target.value)} />
           </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSavePatient}>Guardar Paciente</Button>
        </DialogFooter>
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
    setPatients(getPatients());
  }, []);

  const handlePatientCreated = (newPatient: Patient) => {
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    setSelectedPatientId(newPatient.id);
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
      professionalId: "prof1", // Placeholder
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
                      <Label htmlFor="patient">Paciente</Label>
                      <div className="flex gap-2">
                        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
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
                        <Label htmlFor="sessionDate">Fecha de la Sesión</Label>
                        <Input
                        id="sessionDate"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración (minutos)</Label>
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
      <NewPatientModal open={isPatientModalOpen} onOpenChange={setIsPatientModalOpen} onPatientCreated={handlePatientCreated} />
    </>
  );
}
