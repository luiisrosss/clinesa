"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePatient } from "@/actions/patients";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type NewPatientFormProps = {
  onPatientSaved?: () => void;
}

export function NewPatientForm({ onPatientSaved }: NewPatientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Basic Info
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [alias, setAlias] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactPreference, setContactPreference] = useState<'phone' | 'email'>("email");

  // Consents
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentReminders, setConsentReminders] = useState(false);

  // Clinical
  const [reasonForConsultation, setReasonForConsultation] = useState("");
  const [currentRisk, setCurrentRisk] = useState<'none' | 'low' | 'medium' | 'high'>("none");
  const [allergies, setAllergies] = useState("");

  // Admin
  const [assignedProfessional, setAssignedProfessional] = useState("");
  const [referralSource, setReferralSource] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!name || !lastName || !phone || !email || !reasonForConsultation || !assignedProfessional) {
        toast({
          title: "Error",
          description: "Por favor, completa todos los campos obligatorios.",
          variant: "destructive",
        });
        return;
      }

      if (!consentDataProcessing) {
        toast({
          title: "Consentimiento Requerido",
          description: "Debes aceptar el consentimiento de tratamiento de datos.",
          variant: "destructive",
        });
        return;
      }

      const newPatient: Patient = {
        id: crypto.randomUUID(),
        registrationDate: new Date().toISOString(),
        // Basic
        name,
        lastName,
        birthDate,
        alias,
        // Contact
        phone,
        email,
        contactPreference,
        // Consents
        consentDataProcessing: { accepted: consentDataProcessing, date: new Date().toISOString(), documentVersion: '1.0' },
        consentReminders: { accepted: consentReminders, date: new Date().toISOString() },
        // Clinical
        reasonForConsultation,
        currentRisk,
        allergies,
        // Admin
        assignedProfessional,
        referralSource
      };

      await savePatient(newPatient);

      toast({
        title: "Éxito",
        description: "Nuevo cliente creado correctamente.",
      });

      if (onPatientSaved) {
        onPatientSaved();
      } else {
        router.push(`/patients`);
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear el cliente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto border-0 shadow-none">
        <CardHeader className="p-0">
          <CardTitle>Detalles del Cliente</CardTitle>
          <CardDescription>
            Completa la información para el nuevo cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Identification */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Identificación Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="alias">Alias (Opcional)</Label>
                    <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Iniciales o alias..."/>
                  </div>
                </div>
            </div>

            <Separator/>
            
            {/* Contact */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPreference">Preferencia de Contacto</Label>
                    <Select value={contactPreference} onValueChange={(value: 'phone' | 'email') => setContactPreference(value)}>
                      <SelectTrigger id="contactPreference">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </div>

            <Separator/>

            {/* Clinical Data */}
             <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos Clínicos</h3>
                <div className="space-y-2">
                  <Label htmlFor="reasonForConsultation">Motivo de la Consulta *</Label>
                  <Textarea
                    id="reasonForConsultation"
                    value={reasonForConsultation}
                    onChange={(e) => setReasonForConsultation(e.target.value)}
                    required
                    placeholder="Describe brevemente el motivo de la consulta..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor="currentRisk">Riesgo Actual *</Label>
                      <Select value={currentRisk} onValueChange={(value: 'none' | 'low' | 'medium' | 'high') => setCurrentRisk(value)} required>
                        <SelectTrigger id="currentRisk">
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          <SelectItem value="low">Bajo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias/Alertas Relevantes</Label>
                      <Input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Ej: Alergia a penicilina..."/>
                    </div>
                </div>
            </div>

            <Separator/>

            {/* Administration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Administración</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedProfessional">Profesional Asignado *</Label>
                    <Input id="assignedProfessional" value={assignedProfessional} onChange={(e) => setAssignedProfessional(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referralSource">Origen del Cliente</Label>
                    <Input id="referralSource" value={referralSource} onChange={(e) => setReferralSource(e.target.value)} placeholder="Web, recomendación..."/>
                  </div>
                </div>
            </div>

             <Separator/>

            {/* Consents */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Consentimientos y RGPD</h3>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="consentDataProcessing" checked={consentDataProcessing} onCheckedChange={(checked) => setConsentDataProcessing(Boolean(checked))} />
                    <Label htmlFor="consentDataProcessing" className="text-sm font-normal">
                      Acepto el tratamiento de mis datos personales según la política de privacidad. *
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="consentReminders" checked={consentReminders} onCheckedChange={(checked) => setConsentReminders(Boolean(checked))} />
                    <Label htmlFor="consentReminders" className="text-sm font-normal">
                      Acepto recibir recordatorios de citas por email/SMS.
                    </Label>
                </div>
            </div>

            <Button type="submit" className="w-full !mt-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cliente'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
