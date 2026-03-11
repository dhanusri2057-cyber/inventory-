import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PurchasesPage() {
  const { purchases, products, suppliers, addPurchase } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: "", productId: "", quantity: "", price: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPurchase({ supplierId: form.supplierId, productId: form.productId, quantity: Number(form.quantity), price: Number(form.price), date: new Date().toISOString().split("T")[0] });
    toast.success("Purchase recorded — stock updated");
    setOpen(false);
    setForm({ supplierId: "", productId: "", quantity: "", price: "" });
  };

  return (
    <DashboardLayout title="Purchases">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Purchase</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Purchase</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={form.productId} onValueChange={v => setForm(f => ({ ...f, productId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Quantity</Label><Input type="number" min="1" required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Unit Price ($)</Label><Input type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                </div>
                <Button type="submit" className="w-full">Record Purchase</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              {["Date", "Supplier", "Product", "Qty", "Unit Price", "Total"].map(h => <th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4">{p.date}</td>
                  <td className="p-4">{suppliers.find(s => s.id === p.supplierId)?.name}</td>
                  <td className="p-4">{products.find(pr => pr.id === p.productId)?.name}</td>
                  <td className="p-4">{p.quantity}</td>
                  <td className="p-4">${p.price.toFixed(2)}</td>
                  <td className="p-4 font-medium">${(p.quantity * p.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
