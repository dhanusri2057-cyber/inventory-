import DashboardLayout from "@/components/DashboardLayout";
import { useInventory } from "@/context/InventoryContext";
import { AlertTriangle } from "lucide-react";

export default function LowStockPage() {
  const { products, suppliers } = useInventory();
  const lowStock = products.filter(p => p.quantity < 10);

  return (
    <DashboardLayout title="Low Stock Alert">
      <div className="space-y-4">
        {lowStock.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">All products are well-stocked! 🎉</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">{lowStock.length} product{lowStock.length > 1 ? "s" : ""} with stock below 10 units</span>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  {["Product", "Category", "Current Stock", "Price", "Supplier"].map(h => <th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {lowStock.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 low-stock-row">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4">{p.category}</td>
                      <td className="p-4 font-bold">{p.quantity}</td>
                      <td className="p-4">${p.price.toFixed(2)}</td>
                      <td className="p-4">{suppliers.find(s => s.id === p.supplierId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
