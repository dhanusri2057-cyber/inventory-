import DashboardLayout from "@/components/DashboardLayout";
import { useInventory } from "@/context/InventoryContext";
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = [
  "hsl(220, 70%, 50%)", "hsl(160, 60%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)", "hsl(0, 72%, 51%)"
];

export default function DashboardPage() {
  const { products, suppliers, purchases, sales } = useInventory();
  const navigate = useNavigate();

  const lowStock = products.filter(p => p.quantity < 10);
  const totalPurchaseValue = purchases.reduce((s, p) => s + p.quantity * p.price, 0);
  const totalSalesValue = sales.reduce((s, sa) => s + sa.quantity * sa.price, 0);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Suppliers", value: suppliers.length, icon: Users, color: "text-accent" },
    { label: "Total Purchases", value: `$${totalPurchaseValue.toLocaleString()}`, icon: ShoppingCart, color: "text-warning" },
    { label: "Total Sales", value: `$${totalSalesValue.toLocaleString()}`, icon: TrendingUp, color: "text-success" },
  ];

  const categoryData = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.quantity;
    return acc;
  }, {});
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  const monthlyData = [
    { month: "Jan", purchases: 4200, sales: 3100 },
    { month: "Feb", purchases: 5500, sales: 4800 },
    { month: "Mar", purchases: totalPurchaseValue, sales: totalSalesValue },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <div
            className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4 cursor-pointer hover:bg-destructive/15 transition-colors"
            onClick={() => navigate("/low-stock")}
          >
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low on stock!
            </span>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4 text-foreground">Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="purchases" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Purchases" />
                <Bar dataKey="sales" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4 text-foreground">Stock by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
