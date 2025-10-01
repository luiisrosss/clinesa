"use client";

import type { Session } from "@/lib/types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

type MonthViewProps = {
  date: Date;
  sessions: Session[];
};

export function MonthView({ date, sessions }: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];


  const getSessionsForDay = (day: Date) => {
    return sessions
      .filter(s => new Date(s.sessionDate).toDateString() === day.toDateString())
      .sort((a,b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
  }

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
              "border-b border-r min-h-[120px] p-2 flex flex-col",
              !isSameMonth(day, monthStart) && "bg-muted/50 text-muted-foreground",
              isToday(day) && "bg-blue-50"
            )}
          >
            <time dateTime={format(day, "yyyy-MM-dd")} className={cn("font-semibold", isToday(day) && "text-primary")}>
              {format(day, "d")}
            </time>
            <ul className="mt-2 space-y-1 text-xs overflow-y-auto">
              {dailySessions.slice(0, 3).map(session => (
                <li key={session.id}>
                    <Link href={`/sessions/${session.id}`} className="block bg-primary/20 text-primary-foreground p-1 rounded-md hover:bg-primary/30 truncate">
                      <p className="font-semibold text-black">{session.patientName}</p>
                      <p className="text-gray-700">{format(new Date(session.sessionDate), "p", { locale: es })}</p>
                    </Link>
                </li>
              ))}
              {dailySessions.length > 3 && (
                <li className="text-center text-primary font-semibold cursor-pointer">+ {dailySessions.length - 3} más</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
