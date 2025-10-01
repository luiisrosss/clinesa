"use client";

import { useEffect, useState } from "react";
import { getSessions } from "@/data/sessions";
import { getPatients } from "@/data/patients";
import type { Patient, Session } from "@/lib/types";
import { add, sub, format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { NewSessionForm } from "@/components/sessions/new-session-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type View = "month" | "week" | "day";

export function CalendarClient() {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>();

  const fetchAndSetData = () => {
     const sessions = getSessions();
     const patients = getPatients();
     setAllSessions(sessions);
     setFilteredSessions(sessions);
     setPatients(patients);
  }

  useEffect(() => {
    fetchAndSetData();
  }, []);
  
  useEffect(() => {
    if (selectedPatientId === "all") {
      setFilteredSessions(allSessions);
    } else {
      setFilteredSessions(allSessions.filter(s => s.patientId === selectedPatientId));
    }
  }, [selectedPatientId, allSessions]);


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

  const handleSlotClick = (date: Date) => {
    setNewSessionDate(date);
    setIsNewSessionModalOpen(true);
  };
  
  const handleSessionCreated = () => {
    fetchAndSetData();
    setIsNewSessionModalOpen(false);
  };
  
  const handlePatientCreated = () => {
    fetchAndSetData();
  }

  const getHeaderDate = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    }
    if (view === "week") {
       const start = add(startOfWeek(currentDate, { locale: es }), {days: 1});
       const end = add(endOfWeek(currentDate, { locale: es }), {days: 1});
       return `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
    }
    return format(currentDate, "eeee, d 'de' MMMM 'de' yyyy", { locale: es });
  };
  

  return (
    <>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b flex-wrap gap-4">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatientId !== 'all' && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedPatientId('all')}>
                    <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant={view === 'month' ? 'default' : 'outline'} onClick={() => setView('month')}>Mes</Button>
              <Button variant={view === 'week' ? 'default' : 'outline'} onClick={() => setView('week')}>Semana</Button>
              <Button variant={view === 'day' ? 'default' : 'outline'} onClick={() => setView('day')}>Día</Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {view === 'month' && <MonthView date={currentDate} sessions={filteredSessions} onSlotClick={handleSlotClick} />}
          {view === 'week' && <WeekView date={currentDate} sessions={filteredSessions} onSlotClick={handleSlotClick} />}
          {view === 'day' && <DayView date={currentDate} sessions={filteredSessions} onSlotClick={handleSlotClick} />}
        </main>
      </div>

      <Dialog open={isNewSessionModalOpen} onOpenChange={setIsNewSessionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Sesión</DialogTitle>
          </DialogHeader>
          <NewSessionForm
            initialDate={newSessionDate}
            onSessionCreated={handleSessionCreated}
            onPatientCreated={handlePatientCreated}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
