import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useInventory, Supplier } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useInventory();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", email: "", address: "" });

  const resetForm = () => { setForm({ name: "", contact: "", email: "", address: "" }); setEditing(null); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name: s.name, contact: s.contact, email: s.email, address: s.address }); setOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { updateSupplier({ ...form, id: editing.id }); toast.success("Supplier updated"); }
    else { addSupplier(form); toast.success("Supplier added"); }
    setOpen(false); resetForm();
  };

  return (
    <DashboardLayout title="Suppliers">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Supplier</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {(["name", "contact", "email", "address"] as const).map(f => (
                  <div key={f} className="space-y-2">
                    <Label className="capitalize">{f}</Label>
                    <Input required value={form[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))} type={f === "email" ? "email" : "text"} />
                  </div>
                ))}
                <Button type="submit" className="w-full">{editing ? "Update" : "Add"} Supplier</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                {["Name", "Contact", "Email", "Address", ""].map(h => <th key={h} className={`p-4 font-medium text-muted-foreground ${h === "" ? "text-right" : "text-left"}`}>{h}</th>)}
              </tr></thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4">{s.contact}</td>
                    <td className="p-4">{s.email}</td>
                    <td className="p-4">{s.address}</td>
                    <td className="p-4 text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { deleteSupplier(s.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
