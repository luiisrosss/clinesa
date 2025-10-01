"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePatient } from "@/data/patients";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function NewPatientForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reasonForConsultation, setReasonForConsultation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastName || !phone || !email || !reasonForConsultation) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      });
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
    toast({
      title: "Éxito",
      description: "Nuevo paciente creado.",
    });
    router.push(`/patients`);
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Paciente</CardTitle>
          <CardDescription>
            Completa la información para el nuevo paciente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reasonForConsultation">Motivo de la Consulta</Label>
              <Textarea
                id="reasonForConsultation"
                value={reasonForConsultation}
                onChange={(e) => setReasonForConsultation(e.target.value)}
                required
                placeholder="Describe brevemente el motivo de la consulta..."
              />
            </div>
            <Button type="submit" className="w-full">Guardar Paciente</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
