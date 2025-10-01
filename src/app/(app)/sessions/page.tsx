"use client";

import { useEffect, useState } from "react";
import { getSessions } from "@/data/sessions";
import type { Session } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { SessionCard } from "@/components/sessions/session-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const sortedSessions = getSessions().sort(
      (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
    setSessions(sortedSessions);
  }, []);

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
          {sessions.length > 0 ? (
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
