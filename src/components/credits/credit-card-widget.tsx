'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getProfessionalCredits } from '@/actions/credits';
import { useToast } from '@/hooks/use-toast';

const PLAN_CREDITS_MONTHLY = {
  trial: 100, // Total, no mensual
  solo: 250,
  practice: 1200,
  professional: 3200,
};

export function CreditCardWidget() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<{
    balance: number;
    plan: string;
    totalPurchased: number;
  } | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        setLoading(true);
        const data = await getProfessionalCredits();
        setCredits(data);
      } catch (error) {
        console.error('Error fetching credits:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los créditos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Créditos IA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!credits) return null;

  const monthlyLimit = PLAN_CREDITS_MONTHLY[credits.plan as keyof typeof PLAN_CREDITS_MONTHLY] || 0;
  const percentage = monthlyLimit > 0 ? Math.min((credits.balance / monthlyLimit) * 100, 100) : 0;

  // Determinar color de la barra según porcentaje
  const getProgressColor = () => {
    if (percentage < 20) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const planNames: Record<string, string> = {
    trial: 'Trial',
    solo: 'Solo',
    practice: 'Practice',
    professional: 'Professional',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Créditos IA
        </CardTitle>
        <CardDescription>
          Plan {planNames[credits.plan] || credits.plan}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Disponibles</span>
            <span className="font-bold text-lg">{credits.balance}</span>
          </div>

          {monthlyLimit > 0 && (
            <>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {credits.balance} de {monthlyLimit} créditos {credits.plan === 'trial' ? 'totales' : 'mensuales'}
              </p>
            </>
          )}
        </div>

        {credits.balance < 50 && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Créditos bajos. Considera actualizar tu plan.
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href="/credits">
              <TrendingUp className="h-4 w-4" />
              Ver detalles
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>~ 1.3 créditos por minuto de transcripción</p>
        </div>
      </CardContent>
    </Card>
  );
}
