import { ReactNode } from "react";
import { SessionNavBar } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { MobileHeader } from "@/components/navigation/MobileHeader";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export function AppLayout({ children, className = "", hideHeader = false }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      {!hideHeader && <MobileHeader showNotifications={true} />}
      <SessionNavBar />
      <main className={`ml-0 lg:ml-[3.05rem] flex h-screen grow flex-col overflow-auto pb-24 lg:pb-0 ${hideHeader ? '' : 'pt-16'} lg:pt-0 ${className}`}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
