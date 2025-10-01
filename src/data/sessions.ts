"use client";

import type { Session } from "@/lib/types";

const SESSIONS_KEY = "clinesa-sessions";

const initialSessions: Session[] = [
    {
      id: "1",
      patientId: "p2",
      patientName: "Jane Smith",
      professionalId: "prof1",
      sessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 50,
      notes: {
        subjective: "Patient reports feeling less anxious this week.",
        objective: "Appeared calm and engaged during the session.",
        analysis: "Progressing well with anxiety management techniques.",
        plan: "Continue with mindfulness exercises and introduce thought records.",
      }
    },
    {
      id: "2",
      patientId: "p1",
      patientName: "Alex Doe",
      professionalId: "prof1",
      sessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 50,
      transcription: "Hello Alex, how have you been since our last session? ... I've been better, doctor. The breathing exercises have helped a lot. I only had one panic attack this week. ... That's wonderful to hear. Let's talk more about that.",
    }
];


export const getSessions = (): Session[] => {
  if (typeof window === "undefined") return [];
  try {
    const sessions = localStorage.getItem(SESSIONS_KEY);
    if (sessions) {
      return JSON.parse(sessions);
    } else {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
      return initialSessions;
    }
  } catch (error) {
    console.error("Failed to access localStorage:", error);
    return initialSessions;
  }
};

export const getSessionById = (id: string): Session | undefined => {
  if (typeof window === "undefined") return undefined;
  const sessions = getSessions();
  return sessions.find((session) => session.id === id);
};

export const saveSession = (updatedSession: Session): void => {
  if (typeof window === "undefined") return;
  const sessions = getSessions();
  const index = sessions.findIndex((session) => session.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = updatedSession;
  } else {
    sessions.push(updatedSession);
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};
