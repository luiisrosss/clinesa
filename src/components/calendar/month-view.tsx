"use client";

import type { Session } from "@/lib/types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MonthViewProps = {
  date: Date;
  sessions: Session[];
  onSlotClick: (date: Date) => void;
};

export function MonthView({ date, sessions, onSlotClick }: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = add(startOfWeek(monthStart, { locale: es }), {days: 1});
  const endDate = add(endOfWeek(monthEnd, { locale: es }), {days: 1});

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];


  const getSessionsForDay = (day: Date) => {
    return sessions
      .filter(s => new Date(s.sessionDate).toDateString() === day.toDateString())
      .sort((a,b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
  }
  
  const handleDayClick = (day: Date) => {
    // Default to a reasonable time like 9 AM when creating from month view
    const clickedDate = setMinutes(setHours(day, 9), 0);
    onSlotClick(clickedDate);
  };


  return (
    <div className="grid grid-cols-7 flex-1">
      {/* Weekday headers */}
      {weekdays.map(day => (
        <div key={day} className="p-2 text-center font-semibold text-sm capitalize border-b border-r">
          {day}
        </div>
      ))}
      {/* Day cells */}
      {days.map(day => {
        const dailySessions = getSessionsForDay(day);
        return (
          <div
            key={day.toString()}
            className={cn(
              "border-b border-r min-h-[120px] p-2 flex flex-col cursor-pointer hover:bg-muted/50",
              !isSameMonth(day, monthStart) && "bg-muted/50 text-muted-foreground",
              isToday(day) && "bg-blue-50"
            )}
            onClick={() => handleDayClick(day)}
          >
            <time dateTime={format(day, "yyyy-MM-dd")} className={cn("font-semibold", isToday(day) && "text-primary")}>
              {format(day, "d")}
            </time>
            <ul className="mt-2 space-y-1 text-xs overflow-y-auto">
              {dailySessions.slice(0, 3).map(session => (
                <li key={session.id}>
                    <Link href={`/sessions/${session.id}`} onClick={(e) => e.stopPropagation()} className="block bg-primary text-primary-foreground p-1 rounded-md hover:bg-primary/90 truncate">
                      <p className="font-semibold">{session.patientName}</p>
                      <p className="text-primary-foreground/80">{format(new Date(session.sessionDate), "p", { locale: es })}</p>
                    </Link>
                </li>
              ))}
              {dailySessions.length > 3 && (
                <li className="text-center text-primary font-semibold cursor-pointer" onClick={(e) => e.stopPropagation()}>+ {dailySessions.length - 3} más</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
