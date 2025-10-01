"use client";

import { useState } from "react";
import type { Session } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CalendarClient({ sessions }: { sessions: Session[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const sessionDates = sessions.map(s => new Date(s.sessionDate).toDateString());

  const sessionsForSelectedDay = date
    ? sessions.filter(
        s => new Date(s.sessionDate).toDateString() === date.toDateString()
      )
    : [];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              locale={es}
              modifiers={{
                hasSession: sessions.map(s => new Date(s.sessionDate)),
              }}
              modifiersStyles={{
                hasSession: {
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Sesiones para {date ? format(date, "PPP", { locale: es }) : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsForSelectedDay.length > 0 ? (
              <ul className="space-y-4">
                {sessionsForSelectedDay.map(session => (
                  <li key={session.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader className="p-4">
                         <CardTitle className="text-base flex justify-between items-center">
                            {session.patientName}
                             <Button asChild variant="ghost" size="icon">
                                <Link href={`/sessions/${session.id}`} aria-label={`View session with ${session.patientName}`}>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                         </CardTitle>
                         <CardDescription>
                            {format(new Date(session.sessionDate), "p", { locale: es })} - {session.duration} min
                         </CardDescription>
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No hay sesiones para este día.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
