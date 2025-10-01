"use client";

import { useEffect, useState, useTransition } from "react";
import { getSessionById, saveSession } from "@/data/sessions";
import { runTranscription, runAnalysis, runMetrics } from "@/lib/actions";
import { fileToBase64 } from "@/lib/utils";
import type { Session } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic, FileAudio, BrainCircuit, BarChart, Upload, StickyNote } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";


export function SessionDetailsClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const data = getSessionById(sessionId);
    if (data) {
      setSession(data);
    }
    setIsLoading(false);
  }, [sessionId]);

  const updateSession = (updatedFields: Partial<Session>) => {
    setSession(prev => {
      if (!prev) return null;
      const newSession = { ...prev, ...updatedFields };
      saveSession(newSession);
      return newSession;
    });
  };
  
  const updateNotes = (value: string) => {
    updateSession({ notes: value })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "audio/mpeg" || file.type === "audio/mp4" || file.type === "video/mp4")) {
      try {
        const audioDataUri = await fileToBase64(file);
        updateSession({ audioUrl: audioDataUri });
        toast({ title: "Audio subido con éxito." });
      } catch (error) {
        toast({ title: "Error al leer el archivo de audio.", variant: "destructive" });
      }
    } else {
      toast({ title: "Por favor, sube un archivo MP3 o MP4.", variant: "destructive" });
    }
  };

  const handleProcess = (action: 'transcribe' | 'analyze' | 'metrics') => {
    startTransition(async () => {
      if (!session) return;
      
      try {
        if (action === 'transcribe') {
          if (!session.audioUrl) {
            toast({ title: "No hay archivo de audio para transcribir.", variant: "destructive" });
            return;
          }
          const result = await runTranscription({ audioDataUri: session.audioUrl });
          updateSession({ transcription: result.transcription });
          toast({ title: "Transcripción completa." });
        } else if (action === 'analyze') {
          if (!session.transcription) {
            toast({ title: "No hay transcripción para analizar.", variant: "destructive" });
            return;
          }
          const result = await runAnalysis({ transcript: session.transcription });
          updateSession({ analysis: result });
          toast({ title: "Análisis completo." });
        } else if (action === 'metrics') {
          if (!session.transcription) {
            toast({ title: "No hay transcripción para analizar métricas.", variant: "destructive" });
            return;
          }
          const result = await runMetrics({ transcript: session.transcription });
          updateSession({ metrics: result });
          toast({ title: "Métricas capturadas." });
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
        toast({ title: `Error al ${action}.`, description: "Por favor, inténtalo de nuevo.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    return <div className="text-center p-6">Sesión no encontrada.</div>;
  }

  const chartData = session.metrics?.speakerTime ?? [];
  const chartConfig = {
    time: { label: "Time (s)", color: "hsl(var(--primary))" },
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        
        {/* Audio, Transcription & Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic /> Sesión</CardTitle>
            <CardDescription>Sube el audio, toma notas y analiza la sesión.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div>
              <Label htmlFor="notes" className="flex items-center gap-2 mb-2"><StickyNote /> Notas de la Sesión</Label>
              <Textarea id="notes" value={session.notes} onChange={e => updateNotes(e.target.value)} placeholder="Escribe tus notas aquí..." rows={8}/>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="audio-upload">Subir Audio (.mp3, .mp4)</Label>
              <div className="flex gap-2">
                <Input id="audio-upload" type="file" accept=".mp3,.mp4" onChange={handleFileUpload} className="flex-1" />
                <Button variant="outline" size="icon" className="h-10 w-10" asChild>
                  <Label htmlFor="audio-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </Label>
                </Button>
              </div>
            </div>
            {session.audioUrl && (
              <audio controls src={session.audioUrl} className="w-full" />
            )}
            <Button onClick={() => handleProcess('transcribe')} disabled={isPending || !session.audioUrl}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transcribir Audio
            </Button>
            {session.transcription && (
              <Card className="bg-muted/50 max-h-60 overflow-y-auto">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileAudio/> Transcripción</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap font-mono">{session.transcription}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* AI Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit /> Análisis con IA</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleProcess('analyze')} disabled={isPending || !session.transcription}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analizar Sesión
            </Button>
            {session.analysis && (
              <div className="mt-4 space-y-4 text-sm">
                <h3 className="font-semibold">Resumen</h3>
                <p>{session.analysis.summary}</p>
                <h3 className="font-semibold">Puntos Clave de Discusión</h3>
                <p>{session.analysis.keyDiscussionPoints}</p>
                 <h3 className="font-semibold">Señales Emocionales</h3>
                <p>{session.analysis.emotionalCues}</p>
                 <h3 className="font-semibold">Métricas Clave Potenciales</h3>
                <p>{session.analysis.potentialKeyMetrics}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart /> Métricas de Conversación</CardTitle>
          </CardHeader>
          <CardContent>
             <Button onClick={() => handleProcess('metrics')} disabled={isPending || !session.transcription}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Capturar Métricas
            </Button>
            {session.metrics && (
              <div className="mt-4 space-y-4">
                 <h3 className="font-semibold">Tiempo por Interlocutor</h3>
                  <ChartContainer config={chartConfig} className="h-[150px] w-full">
                    <RechartsBarChart accessibilityLayer data={chartData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="speaker" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="time" fill="var(--color-time)" radius={4} />
                    </RechartsBarChart>
                  </ChartContainer>
                <h3 className="font-semibold">Intensidad de Respuesta</h3>
                <ul className="text-sm list-disc pl-5">
                {session.metrics.responseIntensity.map(item => (
                  <li key={item.speaker}>{item.speaker}: {item.intensity}/10</li>
                ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
