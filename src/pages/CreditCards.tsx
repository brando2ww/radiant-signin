import { SessionNavBar } from "@/components/ui/sidebar";

export default function CreditCards() {
  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-8 ml-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Cartões de Crédito</h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões de crédito e acompanhe faturas.
          </p>
        </div>
      </main>
    </div>
  );
}
