import { NavLink, useNavigate } from "react-router-dom";
import { useInventory } from "@/context/InventoryContext";
import {
  LayoutDashboard, Package, Users, ShoppingCart, TrendingUp,
  AlertTriangle, BarChart3, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/suppliers", icon: Users, label: "Suppliers" },
  { to: "/purchases", icon: ShoppingCart, label: "Purchases" },
  { to: "/sales", icon: TrendingUp, label: "Sales" },
  { to: "/low-stock", icon: AlertTriangle, label: "Low Stock" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export default function AppSidebar() {
  const { logout } = useInventory();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <span className="text-lg font-bold text-sidebar-accent-foreground tracking-tight">InvenTrack</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`
            }
            end={l.to === "/"}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-border rounded-lg p-2 shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-sidebar z-40 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {nav}
      </aside>
    </>
  );
}
