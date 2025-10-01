"use client";

import { useEffect, useState, use } from 'react';
import { PageHeader } from "@/components/page-header";
import { SessionDetailsClient } from "@/components/sessions/session-details-client";
import { getSessionById } from "@/data/sessions";
import { format } from "date-fns";
import type { Session } from '@/lib/types';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (sessionId) {
      const sessionData = getSessionById(sessionId);
      if(sessionData) {
        setSession(sessionData);
      }
    }
  }, [sessionId]);

  const title = session
    ? `${session.patientName}`
    : "Detalles de la Sesión";
  
  const description = session
    ? `Sesión del ${format(new Date(session.sessionDate), "PPP")}`
    : `Cargando sesión ID: ${sessionId}`;

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
