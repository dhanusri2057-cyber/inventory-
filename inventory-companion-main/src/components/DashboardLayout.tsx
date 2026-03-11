import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

export default function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold text-foreground pl-10 lg:pl-0">{title}</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
