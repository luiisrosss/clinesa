"use client";

import { useEffect, useState } from "react";
import type { Session } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getSessions } from "@/data/sessions";

export function CalendarClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const sessionsForSelectedDay = date
    ? sessions.filter(
        s => new Date(s.sessionDate).toDateString() === date.toDateString()
      )
    : [];

  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
                month: "space-y-4 w-full",
                table: "w-full border-collapse",
                head_row: "flex justify-between",
                head_cell: "text-muted-foreground rounded-md w-full justify-between",
                row: "flex w-full mt-2 justify-between",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full",
                day: "h-14 w-full p-1 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
                day_today: "bg-accent text-accent-foreground rounded-md",
              }}
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
          </Card>
        </div>
        <div className="lg:col-span-1 flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>
                Sesiones para {date ? format(date, "PPP", { locale: es }) : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
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
                <p className="text-muted-foreground text-sm h-full flex items-center justify-center">No hay sesiones para este día.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}