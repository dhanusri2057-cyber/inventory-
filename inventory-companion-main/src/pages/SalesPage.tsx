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

export default function SalesPage() {
  const { sales, products, addSale } = useInventory();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", quantity: "" });

  const selectedProduct = products.find(p => p.id === form.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (selectedProduct && qty > selectedProduct.quantity) {
      toast.error("Insufficient stock");
      return;
    }
    addSale({ productId: form.productId, quantity: qty, price: selectedProduct?.price || 0, date: new Date().toISOString().split("T")[0] });
    toast.success("Sale recorded — stock updated");
    setOpen(false);
    setForm({ productId: "", quantity: "" });
  };

  const totalRevenue = sales.reduce((s, sa) => s + sa.quantity * sa.price, 0);

  return (
    <DashboardLayout title="Sales">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="stat-card inline-flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <span className="text-xl font-bold text-success">${totalRevenue.toLocaleString()}</span>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Sale</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Sale</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={form.productId} onValueChange={v => setForm(f => ({ ...f, productId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" max={selectedProduct?.quantity || 999} required value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                {selectedProduct && form.quantity && (
                  <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
                    <p className="text-muted-foreground">Bill Summary</p>
                    <p>Product: <span className="font-medium">{selectedProduct.name}</span></p>
                    <p>Unit Price: <span className="font-medium">${selectedProduct.price.toFixed(2)}</span></p>
                    <p>Quantity: <span className="font-medium">{form.quantity}</span></p>
                    <p className="text-base font-bold pt-1 border-t border-border mt-2">Total: ${(Number(form.quantity) * selectedProduct.price).toFixed(2)}</p>
                  </div>
                )}
                <Button type="submit" className="w-full">Record Sale</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              {["Date", "Product", "Qty", "Unit Price", "Total"].map(h => <th key={h} className="p-4 text-left font-medium text-muted-foreground">{h}</th>)}
            </tr></thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="p-4">{s.date}</td>
                  <td className="p-4">{products.find(p => p.id === s.productId)?.name}</td>
                  <td className="p-4">{s.quantity}</td>
                  <td className="p-4">${s.price.toFixed(2)}</td>
                  <td className="p-4 font-medium">${(s.quantity * s.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
