import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Tenants from "./super-admin/Tenants";
import TenantForm from "./super-admin/TenantForm";
import TenantDetail from "./super-admin/TenantDetail";

export default function SuperAdmin() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Super Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/novo" element={<TenantForm />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="*" element={<Navigate to="tenants" replace />} />
        </Routes>
      </main>
    </div>
  );
}
