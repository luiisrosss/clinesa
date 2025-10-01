"use client";

import { useEffect, useState } from "react";
import { getSessions } from "@/data/sessions";
import type { Session } from "@/lib/types";
import { add, sub, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, format, isEqual, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "day";

export function CalendarClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handlePrev = () => {
    if (view === "month") {
      setCurrentDate(sub(currentDate, { months: 1 }));
    } else if (view === "week") {
      setCurrentDate(sub(currentDate, { weeks: 1 }));
    } else {
      setCurrentDate(sub(currentDate, { days: 1 }));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(add(currentDate, { months: 1 }));
    } else if (view === "week") {
      setCurrentDate(add(currentDate, { weeks: 1 }));
    } else {
      setCurrentDate(add(currentDate, { days: 1 }));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderDate = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    }
    if (view === "week") {
       const start = startOfWeek(currentDate, { locale: es });
       const end = endOfWeek(currentDate, { locale: es });
       return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
    }
    return format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: es }),
    end: endOfWeek(currentDate, { locale: es }),
  });


  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleToday}>Hoy</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold capitalize">
            {getHeaderDate()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView('month')}>Mes</Button>
          <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')}>Semana</Button>
          <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => setView('day')}>Día</Button>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        {view === 'month' && <MonthView date={currentDate} sessions={sessions} />}
        {view === 'week' && <WeekView date={currentDate} sessions={sessions} />}
        {view === 'day' && <DayView date={currentDate} sessions={sessions} />}
      </main>

    </div>
  );
}
