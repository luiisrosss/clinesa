"use client";

import type { Session } from "@/lib/types";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getHours, getMinutes, isToday, addHours, add, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WeekViewProps = {
  date: Date;
  sessions: Session[];
  onSlotClick: (date: Date) => void;
};

export function WeekView({ date, sessions, onSlotClick }: WeekViewProps) {
  const weekStart = add(startOfWeek(date, { locale: es }), {days: 1});
  const weekEnd = add(endOfWeek(date, { locale: es }), {days: 1});
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPositionAndHeight = (session: Session) => {
    const sessionDate = new Date(session.sessionDate);
    const startHour = getHours(sessionDate);
    const startMinute = getMinutes(sessionDate);
    const durationMinutes = session.duration;

    const top = (startHour + startMinute / 60) * 60; // Position in minutes from top
    const height = (durationMinutes / 60) * 60;

    return { top, height };
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const clickedDate = setMinutes(setHours(day, hour), 0);
    onSlotClick(clickedDate);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-shrink-0 grid grid-cols-[60px_repeat(7,1fr)]">
        <div className="border-r"></div>
        {days.map(day => (
          <div key={day.toISOString()} className={cn("p-2 border-b border-r text-center font-semibold", isToday(day) && "bg-blue-50 text-primary")}>
            <p className="text-sm capitalize">{format(day, "eee", { locale: es })}</p>
            <p className="text-2xl">{format(day, "d")}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-[60px_repeat(7,1fr)] overflow-auto">
        {/* Time Column */}
        <div className="border-r">
          {hours.map(hour => (
            <div key={hour} className="h-[60px] relative text-right pr-2 text-xs text-muted-foreground border-b">
              <span className="absolute -top-2 right-2">{format(addHours(new Date(), hour), 'ha')}</span>
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {days.map(day => {
          const sessionsForDay = sessions.filter(s => new Date(s.sessionDate).toDateString() === day.toDateString());
          return (
            <div key={`day-col-${day.toISOString()}`} className="relative border-r">
              {/* Hour lines */}
              {hours.map(hour => (
                <div key={`line-${hour}-${day.toISOString()}`} className="h-[60px] border-b" />
              ))}

               {/* Empty slot creator */}
              {hours.map(hour => (
                <div 
                  key={`slot-${hour}-${day.toISOString()}`}
                  className="h-[60px] absolute w-full cursor-pointer" 
                  style={{ top: `${hour * 60}px` }}
                  onClick={() => handleSlotClick(day, hour)}
                />
              ))}

              {/* Session Blocks */}
              {sessionsForDay.map(session => {
                const { top, height } = getPositionAndHeight(session);
                return (
                  <Link key={session.id} href={`/sessions/${session.id}`} className="absolute w-full pr-1 z-10" onClick={(e) => e.stopPropagation()}>
                    <Card 
                      className="absolute w-full bg-primary text-primary-foreground border-l-2 border-primary-foreground hover:bg-primary/90 cursor-pointer"
                      style={{ top: `${top}px`, height: `${height}px`, left: '0', right: '0' }}
                    >
                      <CardHeader className="p-1">
                        <CardTitle className="text-xs font-semibold truncate">{session.patientName}</CardTitle>
                        <CardDescription className="text-xs text-primary-foreground/80">{format(new Date(session.sessionDate), "p", { locale: es })}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
