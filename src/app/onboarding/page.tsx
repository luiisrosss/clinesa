'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (isLoaded && user) {
        // Pre-llenar con datos de Clerk
        setName(user.fullName || '');

        // Verificar si ya tiene perfil
        try {
          const response = await fetch('/api/professional/check');
          const data = await response.json();

          if (data.exists) {
            // Ya tiene perfil, redirigir al dashboard
            router.push('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        } finally {
          setChecking(false);
        }
      }
    };

    checkExistingProfile();
  }, [isLoaded, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el perfil');
      }

      toast({
        title: '¡Bienvenido a Clinesa!',
        description: 'Tu cuenta trial ha sido activada con 100 créditos.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Estás a un paso de comenzar tu trial gratuito de 14 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Juan Pérez"
                required
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm">
              <h4 className="font-semibold mb-2">Tu trial incluye:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ 100 créditos para análisis IA</li>
                <li>✓ Hasta 3 pacientes</li>
                <li>✓ 50 MB de almacenamiento</li>
                <li>✓ 14 días sin compromiso</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Comenzar trial gratuito'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
