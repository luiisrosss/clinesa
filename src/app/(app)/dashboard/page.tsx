import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Welcome Back"
        description="Here's a quick overview of your practice."
      />
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Begin by creating a new session record or reviewing past sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
               <Button asChild className="w-full sm:w-auto">
                <Link href="/sessions/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Session
                </Link>
              </Button>
               <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href="/sessions">
                  View All Sessions
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Mindscribe helps you focus on your patients by automating transcription and providing AI-powered insights into your sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
