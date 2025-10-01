import AppSidebar from "@/components/app-sidebar";
import { redirect } from "next/navigation";

// Placeholder for auth check
const isAuthenticated = true; 

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  if (!isAuthenticated) {
    redirect('/signin');
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
