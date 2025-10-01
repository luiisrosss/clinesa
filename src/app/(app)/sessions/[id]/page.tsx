"use client";

import { useEffect, useState, use } from 'react';
import { PageHeader } from "@/components/page-header";
import { SessionDetailsClient } from "@/components/sessions/session-details-client";
import { getSessionById } from "@/actions/sessions";
import { format } from "date-fns";
import type { Session } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast();
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        const sessionData = await getSessionById(sessionId);
        if (sessionData) {
          setSession(sessionData);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la sesión.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, toast]);

  const title = session
    ? `${session.patientName}`
    : "Detalles de la Sesión";
  
  const description = session
    ? `Sesión del ${format(new Date(session.sessionDate), "PPP")}`
    : `Cargando sesión ID: ${sessionId}`;

  if (loading) {
    return (
      <>
        <PageHeader
          title="Detalles de la Sesión"
          description="Cargando..."
        />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
      />
      <SessionDetailsClient sessionId={sessionId} />
    </>
  );
}
