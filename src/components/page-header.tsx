import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between pb-6 border-b", className)}>
      <div className="flex items-start gap-4">
        <SidebarTrigger className="hidden md:flex" />
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <div>{children}</div>}
    </header>
  );
}
