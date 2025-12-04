import { ReactNode } from "react";
import { SessionNavBar } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className = "" }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-row">
      <SessionNavBar />
      <main className={`ml-0 lg:ml-[3.05rem] flex h-screen grow flex-col overflow-auto pb-24 lg:pb-0 ${className}`}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
