import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  productId: string;
  quantity: number;
  price: number;
  date: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  date: string;
}

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  sales: Sale[];
  isLoggedIn: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addPurchase: (p: Omit<Purchase, "id">) => void;
  addSale: (s: Omit<Sale, "id">) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

const uid = () => crypto.randomUUID();

const INIT_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "TechParts Co.", contact: "555-0101", email: "info@techparts.com", address: "123 Industrial Ave" },
  { id: "s2", name: "Global Supply Ltd.", contact: "555-0202", email: "sales@globalsupply.com", address: "456 Commerce St" },
  { id: "s3", name: "Quality Materials Inc.", contact: "555-0303", email: "orders@qualitymaterials.com", address: "789 Factory Rd" },
];

const INIT_PRODUCTS: Product[] = [
  { id: "p1", name: "Wireless Mouse", category: "Electronics", price: 29.99, quantity: 45, supplierId: "s1" },
  { id: "p2", name: "USB-C Cable", category: "Accessories", price: 12.99, quantity: 8, supplierId: "s1" },
  { id: "p3", name: "Office Chair", category: "Furniture", price: 199.99, quantity: 15, supplierId: "s2" },
  { id: "p4", name: "Monitor Stand", category: "Accessories", price: 49.99, quantity: 3, supplierId: "s2" },
  { id: "p5", name: "Desk Lamp", category: "Furniture", price: 34.99, quantity: 22, supplierId: "s3" },
  { id: "p6", name: "Keyboard", category: "Electronics", price: 59.99, quantity: 5, supplierId: "s1" },
];

const INIT_PURCHASES: Purchase[] = [
  { id: "pu1", supplierId: "s1", productId: "p1", quantity: 50, price: 20, date: "2026-02-15" },
  { id: "pu2", supplierId: "s2", productId: "p3", quantity: 20, price: 150, date: "2026-02-20" },
  { id: "pu3", supplierId: "s1", productId: "p6", quantity: 30, price: 40, date: "2026-03-01" },
];

const INIT_SALES: Sale[] = [
  { id: "sa1", productId: "p1", quantity: 5, price: 29.99, date: "2026-03-02" },
  { id: "sa2", productId: "p3", quantity: 5, price: 199.99, date: "2026-03-05" },
  { id: "sa3", productId: "p6", quantity: 25, price: 59.99, date: "2026-03-08" },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("inv_logged") === "true");
  const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INIT_SUPPLIERS);
  const [purchases, setPurchases] = useState<Purchase[]>(INIT_PURCHASES);
  const [sales, setSales] = useState<Sale[]>(INIT_SALES);

  const login = useCallback((user: string, pass: string) => {
    if (user === "admin" && pass === "admin123") {
      setIsLoggedIn(true);
      localStorage.setItem("inv_logged", "true");
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem("inv_logged");
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts(prev => [...prev, { ...p, id: uid() }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(x => x.id !== id));
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, "id">) => {
    setSuppliers(prev => [...prev, { ...s, id: uid() }]);
  }, []);

  const updateSupplier = useCallback((s: Supplier) => {
    setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(x => x.id !== id));
  }, []);

  const addPurchase = useCallback((p: Omit<Purchase, "id">) => {
    setPurchases(prev => [...prev, { ...p, id: uid() }]);
    setProducts(prev => prev.map(x => x.id === p.productId ? { ...x, quantity: x.quantity + p.quantity } : x));
  }, []);

  const addSale = useCallback((s: Omit<Sale, "id">) => {
    setSales(prev => [...prev, { ...s, id: uid() }]);
    setProducts(prev => prev.map(x => x.id === s.productId ? { ...x, quantity: x.quantity - s.quantity } : x));
  }, []);

  return (
    <InventoryContext.Provider value={{
      products, suppliers, purchases, sales, isLoggedIn,
      login, logout, addProduct, updateProduct, deleteProduct,
      addSupplier, updateSupplier, deleteSupplier, addPurchase, addSale,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be inside InventoryProvider");
  return ctx;
}
