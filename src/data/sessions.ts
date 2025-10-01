"use client";

import type { Session } from "@/lib/types";

const SESSIONS_KEY = "mindscribe-sessions";

const initialSessions: Session[] = [
    {
      id: "1",
      patientName: "Alex Doe",
      sessionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sessionNumber: 5,
      notes: "Patient shows significant progress in cognitive reframing techniques. Discussed childhood memories and their impact on current relationships. Mood appears elevated compared to previous sessions.",
    },
    {
      id: "2",
      patientName: "Jane Smith",
      sessionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sessionNumber: 12,
      notes: "Focus on anxiety management strategies. Patient reports experiencing fewer panic attacks. We practiced mindfulness and breathing exercises. Next session will explore exposure therapy.",
      transcription: "Hello Jane, how have you been since our last session? ... I've been better, doctor. The breathing exercises have helped a lot. I only had one panic attack this week. ... That's wonderful to hear. Let's talk more about that.",
    }
];


export const getSessions = (): Session[] => {
  if (typeof window === "undefined") return [];
  const sessions = localStorage.getItem(SESSIONS_KEY);
  if (sessions) {
    return JSON.parse(sessions);
  } else {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
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
