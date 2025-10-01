"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { SessionDetailsClient } from "@/components/sessions/session-details-client";
import { getSessionById } from "@/data/sessions";
import { format } from "date-fns";
import type { Session } from '@/lib/types';

export default function SessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sessionData = getSessionById(params.id);
    if(sessionData) {
      setSession(sessionData);
    }
  }, [params.id]);

  const title = session
    ? `${session.patientName}`
    : "Detalles de la Sesión";
  
  const description = session
    ? `Sesión del ${format(new Date(session.sessionDate), "PPP")}`
    : `Cargando sesión ID: ${params.id}`;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
      />
      <SessionDetailsClient sessionId={params.id} />
    </>
  );
}
