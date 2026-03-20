import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/super-admin/AdminSidebar";
import Tenants from "./super-admin/Tenants";
import TenantForm from "./super-admin/TenantForm";
import TenantDetail from "./super-admin/TenantDetail";
import AdminDashboard from "./super-admin/AdminDashboard";
import Plans from "./super-admin/Plans";

export default function SuperAdmin() {
  return (
    <div className="bg-white text-gray-900 [&_*]:!border-gray-200">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-white px-4 gap-3">
              <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
            </header>
            <main className="flex-1 p-6 overflow-auto bg-gray-50">
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="tenants/novo" element={<TenantForm />} />
                <Route path="tenants/:id" element={<TenantDetail />} />
                <Route path="planos" element={<Plans />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
