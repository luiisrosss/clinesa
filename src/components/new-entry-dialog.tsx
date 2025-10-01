"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, ClipboardList } from "lucide-react";

export function NewEntryDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Entrada</DialogTitle>
          <DialogDescription>
            ¿Qué te gustaría crear? Elige una de las siguientes opciones.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => handleNavigate("/patients/new")}
          >
            <Users className="h-8 w-8 mb-2" />
            <span>Nuevo Cliente</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col"
            onClick={() => handleNavigate("/sessions/new")}
          >
            <ClipboardList className="h-8 w-8 mb-2" />
            <span>Nueva Sesión</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
