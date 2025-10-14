import { SessionNavBar } from "@/components/ui/sidebar";

export default function Calendar() {
  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-8 ml-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Agenda</h1>
          <p className="text-muted-foreground">
            Organize seus compromissos e eventos financeiros.
          </p>
        </div>
      </main>
    </div>
  );
}
