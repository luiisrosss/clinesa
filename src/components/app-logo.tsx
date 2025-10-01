import { BrainCircuit } from 'lucide-react';

export function AppLogo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <BrainCircuit className="h-6 w-6" />
      <h1 className="text-xl font-bold font-headline text-foreground">
        Mindscribe
      </h1>
    </div>
  );
}
