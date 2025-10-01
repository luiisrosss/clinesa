"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatients } from "@/data/patients";
import type { Patient } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export function HomeClient() {
  const router = useRouter();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const patients = getPatients();
    setAllPatients(patients);
    setFilteredPatients(patients); 
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredPatients(allPatients);
    } else {
      setFilteredPatients(
        allPatients.filter((patient) =>
          `${patient.name} ${patient.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allPatients]);

  const getInitials = (name: string, lastName: string) => {
    const firstInitial = name.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-md">
        <div className="flex gap-4 mb-6">
          <Button asChild className="w-full">
            <Link href="/sessions/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Sesión
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Card className={`transition-all duration-300 ${isFocused || searchTerm ? 'shadow-lg' : ''}`}>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  className="pl-10 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click on results
                />
              </div>

              {(isFocused || searchTerm) && (
                <div className="mt-2 space-y-1">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <Link href={`/patients/${patient.id}`} key={patient.id} passHref>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 text-sm">
                              <AvatarFallback>
                                {getInitials(patient.name, patient.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.name} {patient.lastName}</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-center text-muted-foreground">
                      No se encontraron clientes.
                    </p>
                  )}
                   <div className="pt-2">
                     <Button variant="ghost" className="w-full" asChild>
                        <Link href="/patients/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear nuevo cliente
                        </Link>
                     </Button>
                   </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
