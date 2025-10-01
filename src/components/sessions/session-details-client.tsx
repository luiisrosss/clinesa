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
import { Loader2, Mic, FileAudio, BrainCircuit, BarChart, FileText, Upload } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "audio/mpeg") {
      try {
        const audioDataUri = await fileToBase64(file);
        updateSession({ audioUrl: audioDataUri });
        toast({ title: "Audio uploaded successfully." });
      } catch (error) {
        toast({ title: "Failed to read audio file.", variant: "destructive" });
      }
    } else {
      toast({ title: "Please upload an MP3 file.", variant: "destructive" });
    }
  };

  const handleProcess = (action: 'transcribe' | 'analyze' | 'metrics') => {
    startTransition(async () => {
      if (!session) return;
      
      try {
        if (action === 'transcribe') {
          if (!session.audioUrl) {
            toast({ title: "No audio file to transcribe.", variant: "destructive" });
            return;
          }
          const result = await runTranscription({ audioDataUri: session.audioUrl });
          updateSession({ transcription: result.transcription });
          toast({ title: "Transcription complete." });
        } else if (action === 'analyze') {
          if (!session.transcription) {
            toast({ title: "No transcription to analyze.", variant: "destructive" });
            return;
          }
          const result = await runAnalysis({ transcript: session.transcription });
          updateSession({ analysis: result });
          toast({ title: "Analysis complete." });
        } else if (action === 'metrics') {
          if (!session.transcription) {
            toast({ title: "No transcription to analyze for metrics.", variant: "destructive" });
            return;
          }
          const result = await runMetrics({ transcript: session.transcription });
          updateSession({ metrics: result });
          toast({ title: "Metrics captured." });
        }
      } catch (error) {
        console.error(`${action} failed:`, error);
        toast({ title: `Failed to ${action}.`, description: "Please try again.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!session) {
    return <div className="text-center p-6">Session not found.</div>;
  }

  const chartData = session.metrics?.speakerTime ?? [];
  const chartConfig = {
    time: { label: "Time (s)", color: "hsl(var(--primary))" },
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Audio & Transcription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mic /> Audio & Transcription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-upload">Upload Session Audio (.mp3)</Label>
              <div className="flex gap-2">
                <Input id="audio-upload" type="file" accept=".mp3" onChange={handleFileUpload} className="flex-1" />
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
              Transcribe Audio
            </Button>
            {session.transcription && (
              <Card className="bg-muted/50">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileAudio/> Transcription</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap font-mono">{session.transcription}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI-Powered Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleProcess('analyze')} disabled={isPending || !session.transcription}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Session
            </Button>
            {session.analysis && (
              <div className="mt-4 space-y-4">
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm">{session.analysis.summary}</p>
                <h3 className="font-semibold">Key Discussion Points</h3>
                <p className="text-sm">{session.analysis.keyDiscussionPoints}</p>
                 <h3 className="font-semibold">Emotional Cues</h3>
                <p className="text-sm">{session.analysis.emotionalCues}</p>
                 <h3 className="font-semibold">Potential Key Metrics</h3>
                <p className="text-sm">{session.analysis.potentialKeyMetrics}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Metrics Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart /> Conversation Metrics</CardTitle>
          </CardHeader>
          <CardContent>
             <Button onClick={() => handleProcess('metrics')} disabled={isPending || !session.transcription}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Capture Metrics
            </Button>
            {session.metrics && (
              <div className="mt-4 space-y-4">
                 <h3 className="font-semibold">Speaker Time</h3>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <RechartsBarChart accessibilityLayer data={chartData}>
                      <XAxis dataKey="speaker" tickLine={false} axisLine={false} tickMargin={8} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="time" fill="var(--color-time)" radius={4} />
                    </RechartsBarChart>
                  </ChartContainer>
                <h3 className="font-semibold">Response Intensity</h3>
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

      {/* Notes Card */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText /> Session Notes</CardTitle>
            <CardDescription>Add your personal notes for this session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={session.notes}
              onChange={(e) => updateSession({ notes: e.target.value })}
              rows={15}
              placeholder="Type your notes here..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
