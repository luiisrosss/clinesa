"use client";

import { useEffect, useState } from "react";
import { getSessions } from "@/actions/sessions";
import type { Session } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { SessionCard } from "@/components/sessions/session-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const allSessions = await getSessions();
        const sortedSessions = allSessions.sort(
          (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        );
        setSessions(sortedSessions);
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
        title="Patient Sessions"
        description="Review and manage all your session records."
      >
        <Button asChild>
          <Link href="/sessions/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Session
          </Link>
        </Button>
      </PageHeader>
      <div className="p-6 flex-1 overflow-auto">
        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
          ) : (
            <p className="text-muted-foreground text-center">No sessions found.</p>
          )}
        </div>
      </div>
    </>
  );
}
