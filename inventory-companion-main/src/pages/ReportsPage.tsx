import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useInventory } from "@/context/InventoryContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { toast } from "sonner";

export default function ReportsPage() {
  const { products, purchases, sales, suppliers } = useInventory();
  const [tab, setTab] = useState("sales");

  const totalPurchases = purchases.reduce((s, p) => s + p.quantity * p.price, 0);
  const totalSales = sales.reduce((s, sa) => s + sa.quantity * sa.price, 0);
  const totalStock = products.reduce((s, p) => s + p.quantity, 0);

  const salesByProduct = sales.reduce<Record<string, number>>((acc, s) => {
    const name = products.find(p => p.id === s.productId)?.name || "Unknown";
    acc[name] = (acc[name] || 0) + s.quantity * s.price;
    return acc;
  }, {});
  const salesChartData = Object.entries(salesByProduct).map(([name, value]) => ({ name, value }));

  const purchasesBySupplier = purchases.reduce<Record<string, number>>((acc, p) => {
    const name = suppliers.find(s => s.id === p.supplierId)?.name || "Unknown";
    acc[name] = (acc[name] || 0) + p.quantity * p.price;
    return acc;
  }, {});
  const purchaseChartData = Object.entries(purchasesBySupplier).map(([name, value]) => ({ name, value }));

  const stockData = products.map(p => ({ name: p.name, quantity: p.quantity }));

  const monthlyData = [
    { month: "Jan", sales: 3100, purchases: 4200 },
    { month: "Feb", sales: 4800, purchases: 5500 },
    { month: "Mar", sales: totalSales, purchases: totalPurchases },
  ];

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(r => keys.map(k => r[k]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}.csv`;
    a.click();
    toast.success("Report exported");
  };

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Sales", value: `$${totalSales.toLocaleString()}`, color: "text-success" },
            { label: "Total Purchases", value: `$${totalPurchases.toLocaleString()}`, color: "text-primary" },
            { label: "Total Stock Units", value: totalStock, color: "text-warning" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Monthly trend */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Monthly Sales vs Purchases</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="hsl(160,60%,45%)" strokeWidth={2} dot={{ r: 4 }} name="Sales" />
              <Line type="monotone" dataKey="purchases" stroke="hsl(220,70%,50%)" strokeWidth={2} dot={{ r: 4 }} name="Purchases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="purchases">Purchase Report</TabsTrigger>
            <TabsTrigger value="stock">Stock Report</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV(sales.map(s => ({ date: s.date, product: products.find(p => p.id === s.productId)?.name, quantity: s.quantity, price: s.price, total: s.quantity * s.price })), "sales-report")}>
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold mb-4">Sales by Product</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesChartData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="value" fill="hsl(160,60%,45%)" radius={[4,4,0,0]} name="Revenue" /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">{["Date","Product","Qty","Price","Total"].map(h=><th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>{sales.map(s=><tr key={s.id} className="border-b border-border last:border-0"><td className="p-4">{s.date}</td><td className="p-4">{products.find(p=>p.id===s.productId)?.name}</td><td className="p-4">{s.quantity}</td><td className="p-4">${s.price.toFixed(2)}</td><td className="p-4 font-medium">${(s.quantity*s.price).toFixed(2)}</td></tr>)}</tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV(purchases.map(p => ({ date: p.date, supplier: suppliers.find(s => s.id === p.supplierId)?.name, product: products.find(pr => pr.id === p.productId)?.name, quantity: p.quantity, price: p.price, total: p.quantity * p.price })), "purchase-report")}>
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold mb-4">Purchases by Supplier</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={purchaseChartData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="value" fill="hsl(220,70%,50%)" radius={[4,4,0,0]} name="Cost" /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">{["Date","Supplier","Product","Qty","Price","Total"].map(h=><th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>{purchases.map(p=><tr key={p.id} className="border-b border-border last:border-0"><td className="p-4">{p.date}</td><td className="p-4">{suppliers.find(s=>s.id===p.supplierId)?.name}</td><td className="p-4">{products.find(pr=>pr.id===p.productId)?.name}</td><td className="p-4">{p.quantity}</td><td className="p-4">${p.price.toFixed(2)}</td><td className="p-4 font-medium">${(p.quantity*p.price).toFixed(2)}</td></tr>)}</tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => exportCSV(products.map(p => ({ name: p.name, category: p.category, quantity: p.quantity, price: p.price, supplier: suppliers.find(s => s.id === p.supplierId)?.name })), "stock-report")}>
                <Download className="h-4 w-4 mr-2" />Export CSV
              </Button>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h4 className="font-semibold mb-4">Current Stock Levels</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stockData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="quantity" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">{["Product","Category","Stock","Price","Supplier"].map(h=><th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}</tr></thead>
                <tbody>{products.map(p=><tr key={p.id} className={`border-b border-border last:border-0 ${p.quantity<10?"low-stock-row":""}`}><td className="p-4 font-medium">{p.name}</td><td className="p-4">{p.category}</td><td className="p-4">{p.quantity}</td><td className="p-4">${p.price.toFixed(2)}</td><td className="p-4">{suppliers.find(s=>s.id===p.supplierId)?.name}</td></tr>)}</tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
