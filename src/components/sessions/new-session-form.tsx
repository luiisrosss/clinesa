"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/data/sessions";
import type { Session } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function NewSessionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [patientName, setPatientName] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNumber, setSessionNumber] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !sessionDate || sessionNumber < 1) {
      toast({
        title: "Error",
        description: "Please fill out all fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      patientName,
      sessionDate,
      sessionNumber,
    };

    saveSession(newSession);
    toast({
      title: "Success",
      description: "New session created.",
    });
    router.push(`/sessions/${newSession.id}`);
  };

  return (
    <div className="p-6">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">Create New Session</CardTitle>
                <CardDescription>
                Enter the details for the new session record.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sessionDate">Session Date</Label>
                    <Input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sessionNumber">Session Number</Label>
                    <Input
                    id="sessionNumber"
                    type="number"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(parseInt(e.target.value, 10))}
                    min="1"
                    required
                    />
                </div>
                <Button type="submit" className="w-full">Create Session</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
