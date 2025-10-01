import Link from "next/link";
import type { Session } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

type SessionCardProps = {
  session: Session;
};

export function SessionCard({ session }: SessionCardProps) {

  const getNotesPreview = (notes: string | object | undefined): string => {
    if (typeof notes === 'string') {
      return notes;
    }
    return "No hay notas para esta sesión todavía.";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {session.patientName} - {format(new Date(session.sessionDate), "PPP")}
        </CardTitle>
        <CardDescription>
          Duración: {session.duration} minutos
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
          {getNotesPreview(session.notes)}
        </p>
        <Button asChild variant="ghost" size="icon">
          <Link href={`/sessions/${session.id}`} aria-label={`View session with ${session.patientName}`}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
