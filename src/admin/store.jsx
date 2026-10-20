import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedData, SCHEMA_VERSION, STORAGE_KEY } from './seed.js';

const DemoContext = createContext(null);

function loadInitial() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: createSeedData(), persisted: true };
    const parsed = JSON.parse(saved);
    const validCollections = Array.isArray(parsed?.products) && Array.isArray(parsed?.customers) && Array.isArray(parsed?.orders);
    const validProducts = validCollections && parsed.products.every((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(item.price) && Number.isInteger(item.stock));
    const validCustomers = validCollections && parsed.customers.every((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.email === 'string');
    const validOrders = validCollections && parsed.orders.every((item) => item && typeof item.id === 'string' && typeof item.number === 'string' && Array.isArray(item.items) && Number.isFinite(item.total) && item.items.every((line) => typeof line.name === 'string' && Number.isFinite(line.unitPrice) && Number.isInteger(line.quantity)));
    if (parsed?.schemaVersion !== SCHEMA_VERSION || !validProducts || !validCustomers || !validOrders) {
      return { data: createSeedData(), persisted: true, recovered: true };
    }
    return { data: parsed, persisted: true };
  } catch {
    return { data: createSeedData(), persisted: false, recovered: true };
  }
}

export function DemoStoreProvider({ children }) {
  const [initial] = useState(loadInitial);
  const [data, setData] = useState(initial.data);
  const [persisted, setPersisted] = useState(initial.persisted);
  const [notice, setNotice] = useState(initial.recovered ? 'Stored demo data could not be read. A fresh sample dataset is in use.' : '');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setPersisted(true);
    } catch {
      setPersisted(false);
    }
  }, [data]);

  const update = (change) => setData((current) => change(current));
  const actions = useMemo(() => ({
    addProduct(product) {
      update((current) => {
        let skuNumber = 1;
        while (current.products.some((item) => item.sku === `RMC-${String(skuNumber).padStart(3, '0')}`)) skuNumber += 1;
        return { ...current, products: [{ ...product, id: `p-${Date.now()}-${current.products.length}`, sku: product.sku || `RMC-${String(skuNumber).padStart(3, '0')}`, createdAt: new Date().toISOString() }, ...current.products] };
      });
    },
    editProduct(id, changes) {
      update((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, ...changes } : product) }));
    },
    deleteProduct(id) {
      // Order items store immutable name and price snapshots, so removing a catalog entry keeps history intact.
      update((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }));
    },
    updateOrder(id, changes) {
      update((current) => ({ ...current, orders: current.orders.map((order) => order.id === id ? { ...order, ...changes, updatedAt: new Date().toISOString() } : order) }));
    },
    reset() {
      const fresh = createSeedData();
      setData(fresh);
      setNotice('Demo data has been reset to the original sample dataset.');
    },
    setNotice,
  }), []);

  const value = useMemo(() => ({ data, persisted, notice, ...actions }), [data, persisted, notice, actions]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoStore() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemoStore must be used inside DemoStoreProvider');
  return value;
}

export function isRecognized(order) {
  return order.fulfillmentStatus === 'completed' && order.paymentStatus === 'paid';
}

export function summarizeOrders(orders) {
  const active = orders.filter((order) => order.fulfillmentStatus !== 'cancelled');
  const recognized = orders.filter(isRecognized);
  const count = recognized.length;
  const revenue = (list) => list.reduce((sum, order) => sum + order.total, 0);
  return {
    grossSales: revenue(active),
    recognizedSales: revenue(recognized),
    paidOrders: orders.filter((order) => order.paymentStatus === 'paid').length,
    completedOrders: orders.filter((order) => order.fulfillmentStatus === 'completed').length,
    pendingOrders: orders.filter((order) => order.fulfillmentStatus === 'pending').length,
    cancelledOrders: orders.filter((order) => order.fulfillmentStatus === 'cancelled').length,
    averageOrderValue: count ? Math.round(revenue(recognized) / count) : 0,
    recognizedOrderCount: count,
  };
}

export function ordersInRange(orders, range) {
  if (range === 'all') return orders;
  const days = Number(range);
  const edge = new Date();
  edge.setDate(edge.getDate() - days);
  return orders.filter((order) => new Date(order.placedAt) >= edge);
}

export function topProducts(orders) {
  const totals = new Map();
  orders.filter(isRecognized).forEach((order) => order.items.forEach((item) => {
    const current = totals.get(item.productId) || { name: item.name, quantity: 0, sales: 0 };
    current.quantity += item.quantity;
    current.sales += item.unitPrice * item.quantity;
    totals.set(item.productId, current);
  }));
  return [...totals.entries()].map(([id, item]) => ({ id, ...item })).sort((a, b) => b.quantity - a.quantity);
}

export function customerTotals(orders) {
  return orders.reduce((totals, order) => {
    if (isRecognized(order)) {
      const total = totals.get(order.customerId) || { count: 0, spending: 0 };
      total.count += 1;
      total.spending += order.total;
      totals.set(order.customerId, total);
    }
    return totals;
  }, new Map());
}

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
}

export function formatDate(value, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(value));
}

export function downloadCSV(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
