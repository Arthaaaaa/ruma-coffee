export const STORAGE_KEY = 'ruma-coffee-admin-demo';
export const SCHEMA_VERSION = 1;

export const categories = ['Kopi', 'Non-kopi', 'Teh', 'Squash', 'Makanan'];

export const seedProducts = [
  ['p-aren', 'Aren Latte', 'Kopi', 24000, 38, 'aren-latte-Dba9l82l.webp'],
  ['p-americano', 'Americano', 'Kopi', 18000, 26, 'americano-DDQS2Kk-.webp'],
  ['p-lemon-coffee', 'Lemon Coffee', 'Kopi', 22000, 19, 'lemon-coffee-CFICvXBv.webp'],
  ['p-vanilla', 'Vanilla Latte', 'Kopi', 25000, 31, 'vanilla-latte-DMtXvjBl.webp'],
  ['p-matcha-latte', 'Matcha Latte', 'Non-kopi', 27000, 22, 'matcha-latte-DVgaOEKo.webp'],
  ['p-dark-choco', 'Dark Choco', 'Non-kopi', 24000, 18, 'dark-choco-kxvpftjW.webp'],
  ['p-red-velvet', 'Red Velvet', 'Non-kopi', 24000, 14, 'red-velvet-dVex4R-R.webp'],
  ['p-taro', 'Taro', 'Non-kopi', 23000, 17, 'taro-CF5CmhTy.webp'],
  ['p-thai-tea', 'Thai Tea', 'Teh', 20000, 28, 'thaitea-DdjwyBec.webp'],
  ['p-lemon-tea', 'Lemon Tea', 'Teh', 18000, 32, 'lemon-tea-DenNAq7R.webp'],
  ['p-ice-tea', 'Ice Tea', 'Teh', 12000, 45, 'ice-tea-RK1VxrvC.webp'],
  ['p-leci', 'Leci Squash', 'Squash', 21000, 15, 'lecy-squash-ao9WYVxG.webp'],
  ['p-mango', 'Mango Squash', 'Squash', 21000, 13, 'mango-squash-C6PgaYzz.webp'],
  ['p-strawberry-squash', 'Strawberry Squash', 'Squash', 22000, 16, 'strawberry-squash-CDRkASga.webp'],
  ['p-blueberry', 'Blueberry Milk', 'Non-kopi', 23000, 12, 'blueberry-milk-C2qf0h7j.webp'],
  ['p-strawberry-milk', 'Strawberry Milk', 'Non-kopi', 23000, 20, 'strawberry-milk-DyX8INrd.webp'],
  ['p-nasi-ayam', 'Nasi Ayam', 'Makanan', 28000, 21, 'nasi-ayam-BtcRpuQF.webp'],
  ['p-nasi-goreng', 'Nasi Goreng', 'Makanan', 26000, 25, 'nasi-goreng-fXq2QEV6.webp'],
  ['p-mix-platter', 'Mix Platter', 'Makanan', 32000, 11, 'mix-platter-DprTB_lp.webp'],
  ['p-dimsum', 'Dimsum Ayam', 'Makanan', 22000, 24, 'dimsum-ayam-MddOws8S.webp'],
].map(([id, name, category, price, stock, image], index) => ({
  id, name, category, price, stock, image,
  sku: `RMC-${String(index + 1).padStart(3, '0')}`,
  availability: stock > 0 ? 'Available' : 'Unavailable',
  createdAt: '2026-07-20T09:00:00.000Z',
}));

export const seedCustomers = [
  ['c-01', 'Nara Putri', 'nara.putri@example.test'], ['c-02', 'Raka Pradana', 'raka.pradana@example.test'],
  ['c-03', 'Dimas Setiawan', 'dimas.setiawan@example.test'], ['c-04', 'Sari Wulandari', 'sari.wulandari@example.test'],
  ['c-05', 'Bima Aditya', 'bima.aditya@example.test'], ['c-06', 'Alya Permata', 'alya.permata@example.test'],
  ['c-07', 'Fajar Ramadhan', 'fajar.ramadhan@example.test'], ['c-08', 'Intan Maharani', 'intan.maharani@example.test'],
  ['c-09', 'Galih Santoso', 'galih.santoso@example.test'], ['c-10', 'Mira Anggraini', 'mira.anggraini@example.test'],
  ['c-11', 'Rizky Hidayat', 'rizky.hidayat@example.test'], ['c-12', 'Tasya Amelia', 'tasya.amelia@example.test'],
  ['c-13', 'Yoga Saputra', 'yoga.saputra@example.test'], ['c-14', 'Citra Lestari', 'citra.lestari@example.test'],
  ['c-15', 'Arman Kurnia', 'arman.kurnia@example.test'], ['c-16', 'Dewi Kartika', 'dewi.kartika@example.test'],
].map(([id, name, email], index) => ({ id, name, email, joinedAt: `2026-0${(index % 3) + 7}-0${(index % 8) + 1}T09:00:00.000Z` }));

const paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'paid', 'failed'];
const fulfillmentStatuses = ['completed', 'completed', 'preparing', 'ready', 'pending', 'cancelled', 'completed'];

export function createSeedData() {
  const products = seedProducts.map((product) => ({ ...product }));
  const customers = seedCustomers.map((customer) => ({ ...customer }));
  const orders = Array.from({ length: 90 }, (_, index) => {
    const customer = customers[(index * 7 + 3) % customers.length];
    const first = products[(index * 5 + 1) % products.length];
    const second = products[(index * 3 + 8) % products.length];
    const items = [first, ...(index % 3 === 0 ? [second] : [])].map((product, lineIndex) => ({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.price,
      quantity: 1 + ((index + lineIndex) % 3),
    }));
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const fulfillmentStatus = fulfillmentStatuses[(index * 5 + 1) % fulfillmentStatuses.length];
    const paymentStatus = fulfillmentStatus === 'cancelled' ? 'refunded' : paymentStatuses[(index * 7 + 2) % paymentStatuses.length];
    const placed = new Date(Date.UTC(2026, 9, 18 - (index % 90), 9 + (index % 10), (index * 13) % 60));
    return {
      id: `ord-${String(index + 1).padStart(4, '0')}`,
      number: `RM-${String(260001 + index)}`,
      placedAt: placed.toISOString(),
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      paymentStatus,
      fulfillmentStatus,
      items,
      subtotal,
      discount: index % 5 === 0 ? 5000 : 0,
      total: Math.max(0, subtotal - (index % 5 === 0 ? 5000 : 0)),
      note: index % 9 === 0 ? 'Demo order for dine-in.' : '',
    };
  });
  return { schemaVersion: SCHEMA_VERSION, products, customers, orders };
}
