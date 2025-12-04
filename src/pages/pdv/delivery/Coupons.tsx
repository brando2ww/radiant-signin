import { CouponsTab } from "@/components/delivery/CouponsTab";

export default function DeliveryCoupons() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cupons de Desconto</h1>
        <p className="text-muted-foreground">Gerencie os cupons do delivery</p>
      </div>
      <CouponsTab />
    </div>
  );
}
