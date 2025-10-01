"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatients } from "@/data/patients";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarInput, useSidebar, SidebarMenuButton, SidebarMenuLabel } from "@/components/ui/sidebar";

export function SidebarSearch() {
  const router = useRouter();
  const { state: sidebarState } = useSidebar();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const patients = getPatients();
    setAllPatients(patients);
    setFilteredPatients(patients);
  }, []);

  useEffect(() => {
    if (sidebarState === 'collapsed') {
      setIsPopoverOpen(false);
      setSearchTerm('');
      return;
    }
    if (searchTerm === "") {
      setFilteredPatients(allPatients);
      setIsPopoverOpen(false);
    } else {
      setFilteredPatients(
        allPatients.filter((patient) =>
          `${patient.name} ${patient.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
      setIsPopoverOpen(true);
    }
  }, [searchTerm, allPatients, sidebarState]);
  
  const getInitials = (name: string, lastName: string) => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const handleLinkClick = (path: string) => {
    router.push(path);
    setSearchTerm("");
    setIsPopoverOpen(false);
  }

  const displayedPatients = filteredPatients.slice(0, 3);
  const hasMorePatients = filteredPatients.length > 3;

  if (sidebarState === "collapsed") {
    return (
      <SidebarMenuButton tooltip="Buscar cliente..." asChild>
        <button onClick={() => router.push('/patients')}>
            <Search />
            <SidebarMenuLabel>Buscar cliente</SidebarMenuLabel>
        </button>
      </SidebarMenuButton>
    )
  }

  return (
    <Popover open={isPopoverOpen && sidebarState === 'expanded'} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <SidebarInput
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if(searchTerm && sidebarState === 'expanded') setIsPopoverOpen(true)}}
              className="pl-9"
            />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[224px] p-0" align="start" side="right">
        <div className="divide-y divide-border rounded-lg bg-card">
            {displayedPatients.length > 0 ? (
            displayedPatients.map((patient) => (
                <div
                    key={patient.id}
                    onClick={() => handleLinkClick(`/patients`)}
                    className="flex items-center justify-between p-3 hover:bg-secondary cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 text-sm">
                            <AvatarFallback>
                            {getInitials(patient.name, patient.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm truncate">{patient.name} {patient.lastName}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
            ))
            ) : (
            <p className="p-4 text-sm text-center text-muted-foreground">
                No se encontraron clientes.
            </p>
            )}
            {hasMorePatients && (
                <div onClick={() => handleLinkClick('/patients')} className="p-3 text-sm text-center text-primary hover:bg-secondary cursor-pointer font-medium">
                    Ver más resultados
                </div>
            )}
            <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => handleLinkClick('/patients/new')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear nuevo cliente
                </Button>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
