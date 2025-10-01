'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, TrendingDown, Clock, Loader2, CreditCard } from 'lucide-react';
import { getProfessionalCredits, getCreditTransactions, getCreditStats } from '@/actions/credits';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PLAN_CREDITS_MONTHLY = {
  trial: 100,
  solo: 250,
  practice: 1200,
  professional: 3200,
};

const PLAN_NAMES: Record<string, string> = {
  trial: 'Trial',
  solo: 'Solo',
  practice: 'Practice',
  professional: 'Professional',
};

export default function CreditsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [creditsData, transactionsData, statsData] = await Promise.all([
          getProfessionalCredits(),
          getCreditTransactions(50),
          getCreditStats(),
        ]);

        setCredits(creditsData);
        setTransactions(transactionsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching credits data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de créditos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Créditos IA"
          description="Gestiona tus créditos para transcripción y análisis"
        />
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (!credits || !stats) return null;

  const monthlyLimit = PLAN_CREDITS_MONTHLY[credits.plan as keyof typeof PLAN_CREDITS_MONTHLY] || 0;
  const percentage = monthlyLimit > 0 ? Math.min((credits.balance / monthlyLimit) * 100, 100) : 0;

  const getTransactionIcon = (type: string) => {
    if (type === 'session_analysis') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  return (
    <>
      <PageHeader
        title="Créditos IA"
        description="Gestiona tus créditos para transcripción y análisis"
      />

      <div className="p-6 space-y-6">
        {/* Resumen de Créditos */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Actual</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits.balance}</div>
              <p className="text-xs text-muted-foreground">
                Plan {PLAN_NAMES[credits.plan]}
              </p>
              {monthlyLimit > 0 && (
                <div className="mt-4 space-y-2">
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {credits.balance} de {monthlyLimit} {credits.plan === 'trial' ? 'totales' : 'mensuales'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consumido</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsumed}</div>
              <p className="text-xs text-muted-foreground">
                Créditos usados desde el inicio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Añadido</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdded}</div>
              <p className="text-xs text-muted-foreground">
                Créditos recibidos por compras/renovaciones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Información y Acciones */}
        <Card>
          <CardHeader>
            <CardTitle>¿Necesitas más créditos?</CardTitle>
            <CardDescription>
              Los créditos se utilizan para transcribir y analizar sesiones con IA. Aproximadamente 1.3 créditos por minuto de audio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Planes disponibles:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Solo</strong>: 250 créditos/mes - €9/mes</li>
                <li>• <strong>Practice</strong>: 1,200 créditos/mes - €29/mes</li>
                <li>• <strong>Professional</strong>: 3,200 créditos/mes - €49/mes</li>
              </ul>
            </div>

            <Button disabled className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Comprar Créditos (Próximamente)
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              La funcionalidad de compra de créditos estará disponible próximamente
            </p>
          </CardContent>
        </Card>

        {/* Historial de Transacciones */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>
              {stats.transactionsCount} transacciones totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay transacciones aún</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.transactionType)}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(tx.amount)}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: {tx.balanceAfter}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
