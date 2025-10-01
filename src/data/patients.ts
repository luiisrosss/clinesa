"use client";

import type { Patient } from "@/lib/types";

const PATIENTS_KEY = "clinesa-patients";

const initialPatients: Patient[] = [
    {
      id: "p1",
      name: "Alex",
      lastName: "Doe",
      phone: "555-0101",
      email: "alex.doe@example.com",
      registrationDate: new Date().toISOString(),
      reasonForConsultation: "Anxiety and stress at work.",
      currentRisk: 'low',
    },
    {
      id: "p2",
      name: "Jane",
      lastName: "Smith",
      phone: "555-0102",
      email: "jane.smith@example.com",
      registrationDate: new Date().toISOString(),
      reasonForConsultation: "Relationship issues.",
      currentRisk: 'none',
    }
];


export const getPatients = (): Patient[] => {
  if (typeof window === "undefined") return [];
  try {
    const patients = localStorage.getItem(PATIENTS_KEY);
    if (patients) {
      return JSON.parse(patients);
    } else {
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(initialPatients));
      return initialPatients;
    }
  } catch (error) {
    console.error("Failed to access localStorage:", error);
    return initialPatients;
  }
};

export const getPatientById = (id: string): Patient | undefined => {
  if (typeof window === "undefined") return undefined;
  const patients = getPatients();
  return patients.find((patient) => patient.id === id);
};

export const savePatient = (updatedPatient: Patient): void => {
  if (typeof window === "undefined") return;
  const patients = getPatients();
  const index = patients.findIndex((patient) => patient.id === updatedPatient.id);
  if (index !== -1) {
    patients[index] = updatedPatient;
  } else {
    patients.push(updatedPatient);
  }
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
};
