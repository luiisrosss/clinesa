"use client";

import type { Session } from "@/lib/types";
import { format, getHours, getMinutes, addHours, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DayViewProps = {
  date: Date;
  sessions: Session[];
  onSlotClick: (date: Date) => void;
};

export function DayView({ date, sessions, onSlotClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours

  const sessionsForDay = sessions.filter(
    s => new Date(s.sessionDate).toDateString() === date.toDateString()
  );

  const getPositionAndHeight = (session: Session) => {
    const sessionDate = new Date(session.sessionDate);
    const startHour = getHours(sessionDate);
    const startMinute = getMinutes(sessionDate);
    const durationMinutes = session.duration;

    const top = (startHour + startMinute / 60) * 60; // Position in minutes from top (60px per hour)
    const height = (durationMinutes / 60) * 60;

    return { top, height };
  };

  const handleSlotClick = (hour: number) => {
    const clickedDate = setMinutes(setHours(date, hour), 0);
    onSlotClick(clickedDate);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 grid grid-cols-1">
        <div className="p-2 border-b border-r text-center font-semibold">
           {format(date, "eeee, dd MMMM", { locale: es })}
        </div>
      </div>
      <div className="flex-1 relative overflow-auto">
        <div className="grid grid-cols-[60px_1fr] h-full">
          {/* Time column */}
          <div className="border-r">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] relative text-right pr-2 text-xs text-muted-foreground border-b">
                <span className="absolute -top-2 right-2">{format(addHours(new Date(), hour), 'ha')}</span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {/* Hour lines */}
            {hours.map(hour => (
              <div key={`line-${hour}`} className="h-[60px] border-b" />
            ))}
            
            {/* Empty slot creator */}
            {hours.map(hour => (
              <div 
                key={`slot-${hour}`} 
                className="h-[60px] absolute w-full cursor-pointer" 
                style={{ top: `${hour * 60}px`}}
                onClick={() => handleSlotClick(hour)}
              />
            ))}

            {/* Session Blocks */}
            {sessionsForDay.map(session => {
              const { top, height } = getPositionAndHeight(session);
              return (
                <Link key={session.id} href={`/sessions/${session.id}`} className="absolute w-full pr-2 z-10">
                   <Card 
                    className="absolute w-full bg-primary text-primary-foreground border-l-4 border-primary-foreground hover:bg-primary/90 cursor-pointer"
                    style={{ top: `${top}px`, height: `${height}px`, left: '0', right: '0' }}
                   >
                     <CardHeader className="p-2">
                       <CardTitle className="text-sm font-semibold truncate">{session.patientName}</CardTitle>
                       <CardDescription className="text-xs text-primary-foreground/80">{format(new Date(session.sessionDate), "p", { locale: es })} - {session.duration} min</CardDescription>
                     </CardHeader>
                   </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
