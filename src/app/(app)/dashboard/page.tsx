'use client';

import { useEffect, useState } from 'react';
import { getSessions } from '@/actions/sessions';
import type { Session } from '@/lib/types';
import { isToday, parseISO } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ClipboardList, Users, Calendar, Loader2 } from 'lucide-react';
import { SessionCard } from '@/components/sessions/session-card';
import { CreditCardWidget } from '@/components/credits/credit-card-widget';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { toast } = useToast();
  const [todaysSessions, setTodaysSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const allSessions = await getSessions();
        const today = allSessions.filter(session => isToday(parseISO(session.sessionDate)));
        setTodaysSessions(today.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()));
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las sesiones.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  return (
    <>
      <PageHeader
        title="Bienvenido a Clinesa"
        description="Aquí tienes un resumen de tu día."
      />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda para Hoy
              </CardTitle>
              <CardDescription>
                Sesiones programadas para hoy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : todaysSessions.length > 0 ? (
                <div className="space-y-4">
                  {todaysSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tienes sesiones programadas para hoy.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/calendar">Ir al Calendario</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Widget de Créditos */}
          <CreditCardWidget />

          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button asChild className="w-full justify-start">
                  <Link href="/sessions/new">
                      <PlusCircle />
                      <span>Crear Nueva Sesión</span>
                  </Link>
              </Button>
               <Button asChild className="w-full justify-start">
                  <Link href="/patients/new">
                      <Users />
                      <span>Añadir Nuevo Cliente</span>
                  </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
