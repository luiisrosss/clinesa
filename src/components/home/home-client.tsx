"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, ClipboardList } from "lucide-react";

export function HomeClient() {
  return (
    <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Gestionar Clientes</CardTitle>
                    <CardDescription>Ver, editar o añadir nuevos clientes a tus registros.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/patients">
                            <Users className="mr-2" /> Ir a Clientes
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Gestionar Sesiones</CardTitle>
                    <CardDescription>Revisar, editar o crear nuevas sesiones para tus clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/sessions">
                            <ClipboardList className="mr-2" /> Ir a Sesiones
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
