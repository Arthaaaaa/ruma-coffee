import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './menu.css';
import SiteHeader from './SiteHeader.jsx';
import TearButton from './components/kokonutui/tear-button.tsx';
import SmoothInput from './components/SmoothInput.jsx';

const A = '/assets/';
const filledStamp = new URL('../Global Assets/Stamp/filled stamp.svg', import.meta.url).href;
const emptyStamp = new URL('../Global Assets/Stamp/empty stamp.svg', import.meta.url).href;
const wonderingSticker = new URL('../Global Assets/Sticker/Wondering.svg', import.meta.url).href;
function GooeyBlobs() {
  return <span className="gooey-button__blobs" aria-hidden="true"><span /><span /><span /></span>;
}

const menu = [
  { id: 'aren', name: 'Ruma Aren Latte', category: 'Coffee', price: 28000, image: 'aren-latte-Dba9l82l.webp', description: 'Espresso dan manis gula aren untuk jeda yang akrab.', tags: ['Best Seller', 'Signature'], taste: 'Smooth · Sweet', coffee: true, iced: true, hot: true, milk: true, shot: true, pairing: 'Pisang Caramel' },
  { id: 'lemon-coffee', name: 'Lemon Coffee', category: 'Coffee', price: 26000, image: 'lemon-coffee-CFICvXBv.webp', description: 'Kopi dengan sentuhan citrus yang ringan.', tags: ['Signature', 'New'], taste: 'Bright · Fruity', coffee: true, iced: true, pairing: 'Cireng Rujak' },
  { id: 'vanilla', name: 'Vanilla Latte', category: 'Coffee', price: 28000, image: 'vanilla-latte-DMtXvjBl.webp', description: 'Espresso, susu, dan rasa vanilla yang lembut.', tags: ['Best Seller', 'Signature'], taste: 'Smooth · Sweet', coffee: true, iced: true, hot: true, milk: true, shot: true, pairing: 'Pisang Keju' },
  { id: 'matcha-latte', name: 'Matcha Latte', category: 'Non-Coffee', price: 30000, image: 'matcha-latte-DVgaOEKo.webp', description: 'Matcha dan susu untuk teman sore yang tenang.', tags: ['Signature'], taste: 'Earthy · Creamy', iced: true, hot: true, milk: true, pairing: 'Pisang Keju' },
  { id: 'americano', name: 'Americano', category: 'Coffee', price: 22000, image: 'americano-DDQS2Kk-.webp', description: 'Espresso dengan rasa kopi yang bersih dan tegas.', tags: ['Coffee'], taste: 'Bold', coffee: true, iced: true, hot: true, shot: true, pairing: 'Mix Platter' },
  { id: 'dark-choco', name: 'Dark Choco', category: 'Non-Coffee', price: 28000, image: 'dark-choco-kxvpftjW.webp', description: 'Cokelat pekat dengan tekstur yang lembut.', tags: ['Signature'], taste: 'Bold · Sweet', iced: true, hot: true, milk: true, pairing: 'Pisang Caramel' },
  { id: 'red-velvet', name: 'Red Velvet', category: 'Non-Coffee', price: 28000, image: 'red-velvet-dVex4R-R.webp', description: 'Minuman susu dengan rasa red velvet.', tags: [], taste: 'Creamy · Sweet', iced: true, hot: true, milk: true, pairing: 'Pisang Keju' },
  { id: 'taro', name: 'Taro', category: 'Non-Coffee', price: 26000, image: 'taro-CF5CmhTy.webp', description: 'Rasa taro manis dengan susu yang creamy.', tags: [], taste: 'Creamy · Sweet', iced: true, hot: true, milk: true, pairing: 'Pisang Caramel' },
  { id: 'thai-tea', name: 'Thai Tea', category: 'Tea', price: 24000, image: 'thaitea-DdjwyBec.webp', description: 'Teh susu dengan rasa yang khas.', tags: ['Best Seller'], taste: 'Sweet · Creamy', iced: true, hot: true, milk: true, pairing: 'Dimsum Ayam' },
  { id: 'lemon-tea', name: 'Lemon Tea', category: 'Tea', price: 22000, image: 'lemon-tea-DenNAq7R.webp', description: 'Teh dan citrus untuk rasa yang menyegarkan.', tags: [], taste: 'Bright · Refreshing', iced: true, hot: true, pairing: 'Tahu Lada Garam' },
  { id: 'ice-tea', name: 'Ice Tea', category: 'Tea', price: 16000, image: 'ice-tea-RK1VxrvC.webp', description: 'Teh dingin sederhana untuk menemani hidangan.', tags: [], taste: 'Light · Refreshing', iced: true, pairing: 'Cireng Rujak' },
  { id: 'lecy', name: 'Leci Squash', category: 'Non-Coffee', price: 24000, image: 'lecy-squash-ao9WYVxG.webp', description: 'Squash leci dengan rasa buah yang segar.', tags: ['New'], taste: 'Fruity · Refreshing', iced: true, caffeineFree: true, pairing: 'Mix Platter' },
  { id: 'mango', name: 'Mango Squash', category: 'Non-Coffee', price: 24000, image: 'mango-squash-C6PgaYzz.webp', description: 'Rasa mangga dalam minuman dingin yang ringan.', tags: [], taste: 'Fruity · Refreshing', iced: true, caffeineFree: true, pairing: 'Sosis Kentang', availability: 'sold-out' },
  { id: 'strawberry-squash', name: 'Strawberry Squash', category: 'Non-Coffee', price: 24000, image: 'strawberry-squash-CDRkASga.webp', description: 'Strawberry dengan sensasi squash yang segar.', tags: [], taste: 'Fruity · Refreshing', iced: true, caffeineFree: true, pairing: 'Mix Platter' },
  { id: 'blueberry', name: 'Blueberry Milk', category: 'Non-Coffee', price: 25000, image: 'blueberry-milk-C2qf0h7j.webp', description: 'Susu dengan rasa blueberry yang manis.', tags: [], taste: 'Fruity · Creamy', iced: true, caffeineFree: true, pairing: 'Pisang Keju' },
  { id: 'strawberry-milk', name: 'Strawberry Milk', category: 'Non-Coffee', price: 25000, image: 'strawberry-milk-DyX8INrd.webp', description: 'Susu dan strawberry untuk teman santai.', tags: [], taste: 'Fruity · Creamy', iced: true, caffeineFree: true, pairing: 'Pisang Caramel' },
  { id: 'cireng', name: 'Cireng Rujak', category: 'Food', price: 22000, image: 'cireng-rujak-qJLbhZAq.webp', description: 'Cireng dengan saus rujak.', tags: ['Best Seller'], taste: 'Savory · Spicy', food: true },
  { id: 'mix-platter', name: 'Mix Platter', category: 'Food', price: 32000, image: 'mix-platter-DprTB_lp.webp', description: 'Pilihan camilan gurih untuk berbagi.', tags: [], taste: 'Savory', food: true },
  { id: 'sosis', name: 'Sosis Kentang', category: 'Food', price: 25000, image: 'sosis-kentang-CB0tKj4S.webp', description: 'Sosis dan kentang untuk teman minum.', tags: [], taste: 'Savory', food: true },
  { id: 'tahu', name: 'Tahu Lada Garam', category: 'Food', price: 22000, image: 'tahu-lada-garam-CK7oI0HL.webp', description: 'Tahu gurih dengan lada dan garam.', tags: [], taste: 'Savory · Peppery', food: true },
  { id: 'pisang-caramel', name: 'Pisang Caramel', category: 'Food', price: 24000, image: 'pisang-caramel-B7QNf17n.webp', description: 'Pisang dengan sentuhan caramel.', tags: [], taste: 'Sweet', food: true },
  { id: 'pisang-keju', name: 'Pisang Keju', category: 'Food', price: 24000, image: 'pisang-keju-BbzbDGOE.webp', description: 'Pisang dan keju untuk camilan manis.', tags: [], taste: 'Sweet · Savory', food: true },
  { id: 'dimsum', name: 'Dimsum Ayam', category: 'Food', price: 28000, image: 'dimsum-ayam-MddOws8S.webp', description: 'Dimsum ayam untuk teman berbagi.', tags: [], taste: 'Savory', food: true },
  { id: 'lumpia', name: 'Lumpia Udang', category: 'Food', price: 28000, image: 'lumpia-udang-CK2Uvsva.webp', description: 'Lumpia udang dengan kulit yang renyah.', tags: [], taste: 'Savory', food: true },
  { id: 'nasi-ayam', name: 'Nasi Ayam', category: 'Food', price: 32000, image: 'nasi-ayam-BtcRpuQF.webp', description: 'Hidangan nasi ayam untuk jeda makan.', tags: [], taste: 'Savory', food: true },
  { id: 'nasi-goreng', name: 'Nasi Goreng', category: 'Food', price: 32000, image: 'nasi-goreng-fXq2QEV6.webp', description: 'Nasi goreng untuk menemani hari.', tags: [], taste: 'Savory', food: true },
];

const categories = ['All', 'Coffee', 'Non-Coffee', 'Tea', 'Signature', 'Food'];
const filters = ['Hot', 'Iced', 'Best Seller', 'New Arrival', 'Caffeine-Free'];
const vouchers = { RUMA10: { minimum: 50000, type: 'percent', value: 10 }, JEDA5: { minimum: 30000, type: 'fixed', value: 5000 } };
const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

function priceFor(product, options = {}) {
  return product.price + (options.size === 'Large' ? 5000 : 0) + (options.milk === 'Oat Milk' ? 6000 : 0) + (options.shot ? 5000 : 0);
}

function defaultOptions(product) {
  const temperature = product.food ? undefined : product.hot ? 'Hot' : 'Iced';
  return { temperature, size: product.food ? undefined : 'Regular', sugar: product.food ? undefined : 'Normal', ice: temperature === 'Iced' && product.iced ? 'Normal' : undefined, milk: product.milk ? 'Fresh Milk' : undefined, shot: false };
}

function orderLineText(line) {
  const product = line.product;
  return [line.options?.temperature, line.options?.size, product.milk ? line.options?.milk : null, line.options?.sugar, line.options?.ice === 'Normal' ? 'Normal ice' : line.options?.ice, line.options?.shot ? 'Extra shot' : null].filter(Boolean).join(' · ');
}

function ProductDialog({ product, onClose, onAdd, initial }) {
  const [options, setOptions] = useState(initial?.options || defaultOptions(product));
  const [quantity, setQuantity] = useState(initial?.qty || 1);
  useEffect(() => {
    const key = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  if (!product) return null;
  const set = (key, value) => setOptions((current) => ({ ...current, [key]: value }));
  const selection = (label, key, values) => <fieldset className="menu-choice"><legend>{label} <span>Wajib dipilih</span></legend><div className="menu-choice__options">{values.map((value) => <button key={value} type="button" className={options[key] === value ? 'is-selected' : ''} aria-pressed={options[key] === value} onClick={() => key === 'temperature' ? setOptions((current) => ({ ...current, temperature: value, ice: value === 'Iced' ? current.ice || 'Normal' : undefined })) : set(key, value)}>{value}</button>)}</div></fieldset>;
  return <div className="menu-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="menu-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
    <button className="menu-dialog__close" type="button" aria-label="Tutup detail" onClick={onClose}>×</button>
    <img className="menu-dialog__image" src={A + product.image} alt={product.name} />
    <div className="menu-dialog__content"><p className="menu-kicker">{product.category} / {product.taste}</p><h2 id="product-dialog-title">{product.name}</h2><p>{product.description}</p>
      <p className="menu-ingredients">Data menu demo. Komposisi dapat diperbarui sesuai resep Ruma.</p>
      {!product.food && <>
        {selection('Suhu', 'temperature', [product.hot ? 'Hot' : null, 'Iced'].filter(Boolean))}
        {selection('Ukuran', 'size', ['Regular', 'Large'])}
        {product.milk && selection('Pilihan susu', 'milk', ['Fresh Milk', 'Oat Milk'])}
        {selection('Gula', 'sugar', ['Less sugar', 'Normal', 'Extra sweet'])}
        {options.temperature === 'Iced' && selection('Es', 'ice', ['No Ice', 'Less Ice', 'Normal'])}
        {product.shot && <label className="menu-add-on"><input type="checkbox" checked={options.shot} onChange={(event) => set('shot', event.target.checked)} /> Extra espresso shot <span>+{rupiah(5000)}</span></label>}
      </>}
      <label className="menu-note">Catatan untuk barista <textarea key={product.id} defaultValue={initial?.note || ''} maxLength={140} placeholder="Contoh: less ice, please" /></label>
      <div className="menu-dialog__actions"><div className="menu-quantity"><button type="button" aria-label="Kurangi jumlah" onClick={() => setQuantity((n) => Math.max(1, n - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Tambah jumlah" onClick={() => setQuantity((n) => n + 1)}>+</button></div><button className="menu-button menu-button--dark" type="button" disabled={product.availability === 'sold-out'} onClick={() => { const note = document.querySelector('.menu-note textarea')?.value || ''; onAdd(product, options, quantity, note); onClose(); }}>{product.availability === 'sold-out' ? 'SOLD OUT' : `${rupiah(priceFor(product, options) * quantity)} · ${initial ? 'Simpan perubahan' : 'Add to Cart'}`}</button></div>
    </div>
  </section></div>;
}

function ProductCard({ product, onCustomize, favorite, onFavorite, onQuickAdd }) {
  const tasteTags = product.taste.split('·').map((tag) => tag.trim()).filter(Boolean);
  const status = product.availability === 'sold-out' ? 'SOLD OUT · DEMO' : product.tags.includes('New') ? 'NEW' : product.tags.includes('Best Seller') ? 'BEST SELLER' : '';

  return <article className="menu-product">
    <div className="menu-product__photo"><img src={A + product.image} alt={product.name} loading="lazy" />
      {status && <span className={`menu-product__badge${product.availability === 'sold-out' ? ' menu-product__badge--sold' : product.tags.includes('New') ? ' menu-product__badge--new' : ''}`}>{status}</span>}
    </div>
    <button className={`community__action community__action--heart menu-favorite${favorite ? ' is-active' : ''}`} type="button" aria-label={favorite ? `Hapus ${product.name} dari favorit` : `Sukai ${product.name}`} aria-pressed={favorite} onClick={() => onFavorite(product.id)}>
      <svg className="community__icon-outline" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" /></svg>
      <svg className="community__icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 1.917a6.4 6.4 0 0 0-5.5 3.3 6.4 6.4 0 0 0-5.5-3.3A6.8 6.8 0 0 0 0 8.967c0 4.547 4.786 9.513 8.8 12.88a4.974 4.974 0 0 0 6.4 0C19.214 18.48 24 13.514 24 8.967a6.8 6.8 0 0 0-6.5-7.05Z" /></svg>
      <svg className="community__icon-celebrate" viewBox="0 0 100 100" aria-hidden="true"><polygon points="10,10 20,20" /><polygon points="10,50 20,50" /><polygon points="20,80 30,70" /><polygon points="90,10 80,20" /><polygon points="90,50 80,50" /><polygon points="80,80 70,70" /></svg>
    </button>
    <div className="menu-product__price-pocket"><span className="menu-product__price">{Math.round(product.price / 1000)}K</span></div>
    <div className="menu-product__info"><div className="menu-product__heading"><h3>{product.name}</h3><button className={`button button--clay gooey-button${product.food && product.availability !== 'sold-out' ? ' button--add' : ''}`} type="button" disabled={product.availability === 'sold-out'} onClick={() => product.food ? onQuickAdd(product) : onCustomize(product)}><span className="gooey-button__label">{product.availability === 'sold-out' ? 'SOLD OUT' : product.food ? 'Add' : 'Customize'}</span>{product.availability !== 'sold-out' && <GooeyBlobs />}</button></div><p>{product.description}</p><div className="menu-product__tags" aria-label={`Karakter rasa: ${tasteTags.join(', ')}`}><span>{product.category}</span>{tasteTags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
  </article>;
}

function Summary({ items, totals, onCheckout }) {
  return <div className="menu-summary"><div className="menu-summary__label"><span>Pesananmu</span><strong>{items.reduce((sum, line) => sum + line.qty, 0)} item</strong></div><div className="menu-summary__total"><span>Total demo</span><strong>{rupiah(totals.total)}</strong></div><button type="button" onClick={onCheckout} disabled={!items.length}>Lanjut ke checkout</button></div>;
}

function QuantityStepper({ value, onValueChange, min = 1, max = 99, name }) {
  return <div className="menu-quantity-stepper" aria-label={`Jumlah ${name}`}>
    <button type="button" onClick={() => onValueChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Kurangi ${name}`}>−</button>
    <span className="menu-quantity-stepper__value" aria-live="polite"><AnimatePresence mode="popLayout" initial={false}><motion.span key={value} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: .15, ease: 'easeOut' }}>{value}</motion.span></AnimatePresence></span>
    <button type="button" onClick={() => onValueChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Tambah ${name}`}>+</button>
  </div>;
}

function CartLine({ line, onQty, onRemove, onEdit }) {
  const amount = line.unit * line.qty;
  return <article className="menu-cart-line" key={line.key}>
    <img src={A + line.product.image} alt="" />
    <div className="menu-cart-line__copy"><h3>{line.product.name}</h3><p>{orderLineText(line)}</p>{line.note && <p>Catatan: {line.note}</p>}
      <strong className="menu-cart-line__price" aria-label={rupiah(amount)}><AnimatePresence mode="popLayout" initial={false}><motion.span key={amount} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: .15, ease: 'easeOut' }}>{rupiah(amount)}</motion.span></AnimatePresence></strong>
      <div className="menu-cart-line__controls"><QuantityStepper value={line.qty} onValueChange={(value) => onQty(line.key, value - line.qty)} name={line.product.name} /><button type="button" onClick={() => onEdit(line)}>Edit</button><button type="button" onClick={() => onRemove(line.key)}>Hapus</button></div>
    </div>
  </article>;
}

function CartPanel({ items, totals, voucher, voucherMessage, onVoucher, onClose, onQty, onRemove, onCheckout, onEdit }) {
  return <div className="menu-backdrop menu-backdrop--cart" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="menu-cart" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <header><div><p className="menu-kicker">Ruma / Pesanan</p><h2 id="cart-title">Keranjang <span>({items.reduce((sum, line) => sum + line.qty, 0)})</span></h2></div><button className="menu-dialog__close" type="button" aria-label="Tutup keranjang" onClick={onClose}>×</button></header>
    {!items.length ? <div className="menu-cart__empty"><img className="menu-empty-cup" src={wonderingSticker} alt="" /><h3>Belum ada yang dipilih.</h3><p>Ambil waktu untuk melihat menu, lalu kembali ke sini.</p><button type="button" className="menu-button menu-button--dark" onClick={onClose}>Kembali ke menu</button></div> : <>
      <div className="menu-cart__items">{items.map((line) => <CartLine key={line.key} line={line} onQty={onQty} onRemove={onRemove} onEdit={onEdit} />)}</div>
      <div className="menu-cart__extras"><p className="menu-kicker">Kode demo</p><TearButton className="menu-voucher-tear" tone="muted" icon={<span className="menu-voucher-icon">10%</span>} label="Voucher RUMA10" description={totals.subtotal >= vouchers.RUMA10.minimum ? 'Min. belanja Rp50.000' : 'Tambah pesanan hingga Rp50.000'} stubLabel="Sobek" confirmedLabel="Voucher digunakan" confirmedDescription="Diskon 10% diterapkan" resetAfter={0} disabled={totals.subtotal < vouchers.RUMA10.minimum || voucher.applied === 'RUMA10'} onConfirm={() => onVoucher('RUMA10')} /><p className="menu-voucher__hint">RUMA10 memberi potongan 10% untuk belanja minimal Rp50.000.</p><div className="menu-voucher"><label className="sr-only" htmlFor="voucher-code">Kode voucher demo</label><SmoothInput id="voucher-code" placeholder="Coba RUMA10 atau JEDA5" value={voucher.input} onChange={(event) => onVoucher({ ...voucher, input: event.target.value.toUpperCase() })} /><button type="button" onClick={() => onVoucher('apply')}>Pakai</button></div><p className="menu-feedback" role="status">{voucherMessage}</p><div className="menu-totals"><div><span>Subtotal</span><strong>{rupiah(totals.subtotal)}</strong></div><div><span>Diskon demo</span><strong>−{rupiah(totals.discount)}</strong></div><div><span>Pajak / layanan</span><strong>{rupiah(0)}</strong></div><div className="menu-totals__grand"><span>Total demo</span><strong>{rupiah(totals.total)}</strong></div></div><p className="menu-demo-note">Harga, promo, dan pesanan di halaman ini merupakan data demo.</p><button type="button" className="menu-button menu-button--dark menu-cart__checkout" onClick={onCheckout}>Pilih cara menikmati</button></div>
    </>}
  </aside></div>;
}

function ReceiptPrinterCard({ order, isPrinting }) {
  return <section className={`menu-receipt-printer${isPrinting ? ' is-printing' : ' is-printed'}`} aria-live="polite" aria-label="Pratinjau struk pesanan">
    <div className="menu-receipt-printer__head"><strong>Ruma Coffee</strong><span>{isPrinting ? 'Mencetak struk…' : order ? `Order ${order.id}` : 'Struk pesanan demo'}</span><i /></div>
    <div className="menu-receipt-printer__slot" />
    <div className="menu-receipt-printer__paper">
      {order ? <><strong className="menu-receipt-printer__title">RUMA COFFEE</strong><small>ORDER {order.id}</small><div className="menu-receipt-printer__rule" /><p><span>{order.service === 'Dine In' ? `Dine In · Meja ${order.table}` : `Takeaway · ${order.name}`}</span><b>{order.payment === 'Cash' ? 'Kasir' : 'QRIS'}</b></p>{order.items.map((line) => <p key={line.key}><span>{line.qty} × {line.product.name}</span><b>{rupiah(line.unit * line.qty)}</b></p>)}<div className="menu-receipt-printer__rule" /><p><span>Subtotal</span><b>{rupiah(order.subtotal)}</b></p>{order.discount > 0 && <p><span>Voucher {order.voucher}</span><b>−{rupiah(order.discount)}</b></p>}<p><span>Pajak / layanan</span><b>{rupiah(0)}</b></p><p className="menu-receipt-printer__total"><span>Total</span><b>{rupiah(order.total)}</b></p><small>Pesanan demo · Terima kasih sudah mampir.</small></> : <p className="menu-receipt-printer__placeholder">Struk demo akan dicetak setelah konfirmasi pesanan.</p>}
    </div>
  </section>;
}

export default function MenuPage({ onHome, onNavigate }) {
  const [category, setCategory] = useState('All');
  const [activeFilters, setActiveFilters] = useState([]);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editLine, setEditLine] = useState(null);
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [voucher, setVoucher] = useState({ input: '', applied: '' });
  const [voucherMessage, setVoucherMessage] = useState('Voucher hanya berlaku untuk pesanan demo.');
  const [spotlight, setSpotlight] = useState(0);
  const [spotlightPaused, setSpotlightPaused] = useState(false);
  const [view, setView] = useState('catalog');
  const [service, setService] = useState('Dine In');
  const [table, setTable] = useState(new URLSearchParams(window.location.search).get('table')?.match(/^\d{1,3}$/)?.[0] || '12');
  const [name, setName] = useState('Demo');
  const [pickup, setPickup] = useState('ASAP');
  const [payment, setPayment] = useState('Cash');
  const [order, setOrder] = useState(null);
  const [paid, setPaid] = useState(false);
  const [orderStep, setOrderStep] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  const signatures = menu.filter((item) => item.tags.includes('Signature'));
  useEffect(() => {
    if (spotlightPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setSpotlight((index) => (index + 1) % signatures.length), 6500);
    return () => window.clearInterval(timer);
  }, [signatures.length, spotlightPaused]);
  const featured = [signatures[(spotlight - 1 + signatures.length) % signatures.length], signatures[spotlight], signatures[(spotlight + 1) % signatures.length]];
  const visible = useMemo(() => menu.filter((item) => {
    const categoryMatch = category === 'All' || (category === 'Signature' ? item.tags.includes('Signature') : item.category === category);
    const searchMatch = `${item.name} ${item.description} ${item.category} ${item.taste}`.toLowerCase().includes(query.trim().toLowerCase());
    const filterMatch = activeFilters.every((filter) => filter === 'Hot' ? item.hot : filter === 'Iced' ? item.iced : filter === 'Best Seller' ? item.tags.includes(filter) : filter === 'New Arrival' ? item.tags.includes('New') : item.caffeineFree);
    return categoryMatch && searchMatch && filterMatch;
  }), [category, activeFilters, query]);
  const subtotal = items.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const voucherData = vouchers[voucher.applied];
  const discount = voucherData && subtotal >= voucherData.minimum ? Math.min(subtotal, voucherData.type === 'percent' ? Math.floor(subtotal * voucherData.value / 100) : voucherData.value) : 0;
  const totals = { subtotal, discount, total: subtotal - discount };

  const addItem = (product, options = {}, qty = 1, note = '') => {
    if (product.availability === 'sold-out') return;
    const unit = priceFor(product, options);
    const config = JSON.stringify({ options, note });
    const key = `${product.id}:${config}`;
    if (editLine) {
      setItems((current) => [...current.filter((line) => line.key !== editLine.key && line.key !== key), { key, product, options, qty, note, unit: product.food ? product.price : unit }]);
      setEditLine(null);
      return;
    }
    setItems((current) => current.some((line) => line.key === key) ? current.map((line) => line.key === key ? { ...line, qty: line.qty + qty } : line) : [...current, { key, product, options, qty, note, unit }]);
  };
  const quickAdd = (product) => addItem(product);
  const updateQty = (key, step) => setItems((current) => current.flatMap((line) => line.key !== key ? [line] : line.qty + step < 1 ? [] : [{ ...line, qty: line.qty + step }]));
  const applyVoucher = (value) => {
    if (typeof value === 'object') { setVoucher(value); return false; }
    const code = (value === 'apply' ? voucher.input : value).trim().toUpperCase();
    if (!vouchers[code]) { setVoucherMessage('Kode demo tidak ditemukan. Periksa kembali penulisannya.'); setVoucher((current) => ({ ...current, applied: '' })); return false; }
    if (subtotal < vouchers[code].minimum) { setVoucherMessage(`Subtotal belum mencapai ${rupiah(vouchers[code].minimum)}.`); setVoucher((current) => ({ ...current, input: code, applied: '' })); return false; }
    setVoucher({ input: code, applied: code }); setVoucherMessage(`Voucher demo ${code} diterapkan.`); return true;
  };
  const placeOrder = () => {
    if (!items.length || (service === 'Dine In' && !/^\d{1,3}$/.test(table)) || (service === 'Takeaway' && !name.trim())) return;
    const nextOrder = { id: `RM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, items: [...items], service, table, name: name.trim(), pickup, payment, subtotal: totals.subtotal, discount: totals.discount, voucher: voucher.applied, total: totals.total };
    setOrder(nextOrder);
    setPaid(payment === 'Cash');
    setOrderStep(0);
    if (payment === 'QRIS') setView('payment');
    else { setIsPrinting(true); window.setTimeout(() => { setIsPrinting(false); setView('confirmation'); }, 1900); }
  };

  return <div className="menu-page">
    <svg className="gooey-filter-defs" aria-hidden="true" focusable="false"><defs><filter id="gooey-button-filter"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></defs></svg>
    <SiteHeader page="menu" onNavigate={onNavigate} cartCount={items.reduce((sum, line) => sum + line.qty, 0)} onCart={() => setCartOpen(true)} />
    {view === 'catalog' && <>
      <main id="home">
        <section className="menu-hero" aria-labelledby="menu-hero-title"><div className="menu-hero__copy"><p className="menu-kicker">Ruma Coffee / Menu</p><h1 id="menu-hero-title">Hari boleh<br /><em>pelan-pelan.</em></h1><p>Ambil jeda sebentar. Ada cangkir yang menunggu untuk menemani waktumu.</p><div className="menu-hero__actions"><a className="button button--clay gooey-button" href="#catalog"><span className="gooey-button__label">Explore Menu</span><GooeyBlobs /></a><a className="menu-text-link" href="#signature">Discover Signature <span aria-hidden="true">↘</span></a></div><span className="menu-hero__aside">Ruang kecil<br />untuk kembali.</span></div><div className="menu-hero__image"><img src={`${A}aren-latte-Dba9l82l.webp`} alt="Ruma Aren Latte" /><span className="menu-hero__image-tag">A familiar kind of pause</span><span className="menu-hero__image-index">01 / 05</span></div></section>
        <section className="menu-signature" id="signature" aria-labelledby="signature-title"><div className="menu-section-heading"><div><p className="menu-kicker">Yang paling dekat dengan Ruma</p><h2 id="signature-title">Signature,<br /><em>with a little story.</em></h2></div><p>Rasa yang akrab untuk menemani waktu tanpa terburu-buru.</p></div><div className="menu-spotlight" onMouseEnter={() => setSpotlightPaused(true)} onMouseLeave={() => setSpotlightPaused(false)} onFocusCapture={() => setSpotlightPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSpotlightPaused(false); }}><div className="menu-spotlight__preview">{featured.map((product, index) => <button key={product.id} className={`menu-spotlight__item menu-spotlight__item--${index}`} type="button" onClick={() => setSelected(product)} aria-label={`Lihat ${product.name}`}><img src={A + product.image} alt="" /></button>)}</div><div className="menu-spotlight__detail"><span>0{spotlight + 1} / 0{signatures.length}</span><h3>{signatures[spotlight].name}</h3><p>{signatures[spotlight].description}</p><button type="button" className="menu-text-link" onClick={() => setSelected(signatures[spotlight])}>Lihat detail <span aria-hidden="true">↗</span></button><div className="menu-spotlight__controls"><button className="button button--clay gooey-button" type="button" aria-label="Signature sebelumnya" onClick={() => setSpotlight((spotlight - 1 + signatures.length) % signatures.length)}><span className="gooey-button__label">←</span><GooeyBlobs /></button><button className="button button--clay gooey-button" type="button" aria-label="Signature berikutnya" onClick={() => setSpotlight((spotlight + 1) % signatures.length)}><span className="gooey-button__label">→</span><GooeyBlobs /></button></div></div></div></section>
        <section className="menu-catalog" id="catalog" aria-labelledby="catalog-title"><div className="menu-section-heading menu-section-heading--catalog"><div><p className="menu-kicker">Dibuat untuk jeda yang berbeda</p><h2 id="catalog-title">Temukan<br /><em>yang kamu mau.</em></h2></div><p>Harga yang tampil adalah data demo dan dapat diperbarui oleh Ruma.</p></div><label className="menu-search"><span aria-hidden="true">⌕</span><span className="sr-only">Cari menu</span><SmoothInput type="search" placeholder="Cari kopi, teh, atau teman ngemil" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>/</kbd></label>
          <div className="menu-categories" role="group" aria-label="Kategori menu">{categories.map((item) => <button type="button" key={item} className={category === item ? 'is-selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="menu-filters" role="group" aria-label="Filter menu">{filters.map((item) => <button type="button" key={item} className={activeFilters.includes(item) ? 'is-selected' : ''} aria-pressed={activeFilters.includes(item)} onClick={() => setActiveFilters((current) => current.includes(item) ? current.filter((filter) => filter !== item) : [...current, item])}>{item}</button>)}</div>
          <div className="menu-grid" aria-live="polite">{visible.map((product) => <ProductCard key={product.id} product={product} onCustomize={setSelected} onQuickAdd={quickAdd} favorite={favorites.includes(product.id)} onFavorite={(id) => setFavorites((current) => current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id])} />)}</div>
          {!visible.length && <div className="menu-empty"><span className="menu-kicker">Belum ketemu</span><h3>Coba pencarian atau filter lain.</h3><p>Hasil berubah sesuai kategori, kata yang kamu tulis, dan filter aktif.</p><button type="button" onClick={() => { setCategory('All'); setActiveFilters([]); setQuery(''); }}>Hapus semua filter</button></div>}
          {(query || category !== 'All' || activeFilters.length > 0) && <button className="menu-clear-filters" type="button" onClick={() => { setCategory('All'); setActiveFilters([]); setQuery(''); }}>Hapus filter aktif</button>}
        </section>
        <section className="menu-pairings"><div><p className="menu-kicker">Pasangan yang pas</p><h2>Something good<br /><em>for the table.</em></h2></div><div className="menu-pairings__copy"><p>Ruma Aren Latte dengan Pisang Caramel, atau Matcha Latte dengan Pisang Keju. Rekomendasi sederhana dari menu yang tersedia.</p><button type="button" className="menu-pairing-link" onClick={() => setSelected(menu.find((item) => item.id === 'pisang-caramel'))}>Lihat Pisang Caramel <span className="menu-pairing-link__arrow" aria-hidden="true">↗</span></button></div></section>
        <section className="menu-recommendations" aria-labelledby="menu-recommendations-title"><div><p className="menu-kicker">Your next coffee</p><h2 id="menu-recommendations-title">Untuk slow<br /><em>morning.</em></h2><p>Pilihan ringan dari menu Ruma untuk menemani pagi yang tenang.</p></div><div className="menu-recommendation-list">{[menu[0], menu[2], menu[4]].map((product) => <button type="button" key={product.id} onClick={() => setSelected(product)}><img src={A + product.image} alt="" /><span>{product.name}</span><small>{product.taste}</small></button>)}</div></section>
        <section className="menu-demo-band" id="stamps"><div><p className="menu-kicker">Sedikit teman untuk kunjungan berikutnya</p><h2>Setiap mampir,<br /><em>ada cerita baru.</em></h2><p>Contoh kode voucher: RUMA10 untuk subtotal minimal Rp50.000, atau JEDA5 untuk subtotal minimal Rp30.000. Keduanya simulasi.</p></div><div className="menu-stamps" aria-label="Kartu stamp demo, progres 3 dari 8"><span>DEMO</span><div>{Array.from({ length: 8 }, (_, index) => <span className="menu-stamps__stamp" key={index}><img src={index < 3 ? filledStamp : emptyStamp} alt="" /></span>)}</div><strong>3 / 8</strong><small>Contoh progres, tidak tersimpan.</small></div></section>
      </main>
      {items.length > 0 && <Summary items={items} totals={totals} onCheckout={() => { setCartOpen(true); }} />}
    </>}
    {view === 'checkout' && <main className="menu-flow"><p className="menu-kicker">Ruma / Checkout demo</p><h1>Bagaimana<br /><em>kamu menikmati?</em></h1><div className="menu-flow__grid"><section className="menu-checkout-form"><div className="menu-service-switch"><button type="button" className={service === 'Dine In' ? 'is-selected' : ''} onClick={() => setService('Dine In')}>Dine In</button><button type="button" className={service === 'Takeaway' ? 'is-selected' : ''} onClick={() => setService('Takeaway')}>Takeaway</button></div>{service === 'Dine In' ? <><label>Nomor meja<SmoothInput inputMode="numeric" value={table} onChange={(event) => setTable(event.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="Contoh: 12" /></label><button className="menu-text-link" type="button" onClick={() => setTable(String(1 + Math.floor(Math.random() * 20)))}>Isi nomor meja demo</button><p className="menu-demo-note">Nomor meja simulasi. Pemindai QR tidak terhubung.</p></> : <><label>Nama pemesan<SmoothInput value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Nama untuk pesanan" /></label><label>Waktu pengambilan<select value={pickup} onChange={(event) => setPickup(event.target.value)}><option>ASAP</option><option>15 menit lagi</option><option>30 menit lagi</option></select></label><p className="menu-demo-note">Perkiraan pickup simulasi, bukan estimasi operasional.</p></>}<h2>Pembayaran demo</h2><div className="menu-payment-options">{['Cash', 'QRIS'].map((method) => <button type="button" className={payment === method ? 'is-selected' : ''} onClick={() => setPayment(method)} key={method}><strong>{method === 'Cash' ? 'Cash di kasir' : 'QRIS demo'}</strong><small>{method === 'Cash' ? 'Bayar langsung saat tiba.' : 'Tampilkan QR placeholder.'}</small></button>)}</div></section><aside className="menu-checkout-summary"><h2>Ringkasan</h2>{items.map((line) => <div className="menu-checkout-item" key={line.key}><span>{line.qty} × {line.product.name}<small>{orderLineText(line)}</small></span><strong>{rupiah(line.unit * line.qty)}</strong></div>)}<div className="menu-totals"><div><span>Subtotal</span><strong>{rupiah(totals.subtotal)}</strong></div><div><span>Voucher demo</span><strong>−{rupiah(totals.discount)}</strong></div><div><span>Pajak / layanan</span><strong>{rupiah(0)}</strong></div><div className="menu-totals__grand"><span>Total</span><strong>{rupiah(totals.total)}</strong></div></div><button className="menu-button menu-button--dark" type="button" onClick={() => setView('catalog')}>Kembali ke menu</button><button className="menu-button menu-button--clay" type="button" disabled={isPrinting || !items.length || (service === 'Dine In' ? !/^\d{1,3}$/.test(table) : !name.trim())} onClick={placeOrder}>{isPrinting ? 'Mencetak struk…' : 'Konfirmasi pesanan demo'}</button></aside><ReceiptPrinterCard order={order} isPrinting={isPrinting} /></div></main>}
    {view === 'payment' && order && <main className="menu-order-screen"><p className="menu-kicker">Langkah pembayaran / simulasi saja</p><h1>QR ini bukan<br /><em>untuk membayar.</em></h1><div className="menu-payment-demo"><div className="menu-fake-qr" aria-hidden="true">{Array.from({ length: 81 }, (_, i) => <i className={(i * 7 + i % 5) % 3 === 0 ? 'is-on' : ''} key={i} />)}</div><strong>DEMO - QR ini tidak dapat digunakan untuk pembayaran</strong><p>Simulasi QRIS untuk pratinjau alur. Tidak terhubung ke bank, dompet digital, atau pembayaran nyata.</p><button className="menu-button menu-button--dark" type="button" onClick={() => { setPaid(true); setView('confirmation'); }}>Simulasikan pembayaran berhasil</button></div><button className="menu-text-link" type="button" onClick={() => setView('checkout')}>Kembali ke checkout</button></main>}
    {view === 'confirmation' && order && <main className="menu-order-screen"><p className="menu-kicker">Terima kasih sudah mampir ke Ruma</p><h1>Pesananmu<br /><em>sudah tercatat.</em></h1><section className="menu-order-card menu-order-card--receipt"><ReceiptPrinterCard order={order} isPrinting={false} /><p className="menu-demo-note">Struk ini hanya untuk identifikasi pesanan simulasi, belum terhubung ke kasir.</p>{order.payment === 'Cash' && paid && <button type="button" className="menu-text-link" onClick={() => setPaid(false)}>Simulasikan pembayaran di kasir</button>}<h2>Status pesanan demo</h2><ol className="menu-tracker">{['Menunggu konfirmasi', 'Sedang dibuat', order.service === 'Dine In' ? 'Siap disajikan' : 'Siap diambil', 'Selesai'].map((step, index) => <li className={index <= orderStep ? 'is-done' : ''} key={step}><i>{index < orderStep ? '✓' : index + 1}</i><span>{step}</span></li>)}</ol><button type="button" className="menu-button menu-button--clay" disabled={orderStep >= 3} onClick={() => setOrderStep((value) => Math.min(3, value + 1))}>Simulasikan tahap berikutnya</button><button type="button" className="menu-text-link" onClick={() => { setView('catalog'); setItems([]); setVoucher({ input: '', applied: '' }); setOrder(null); }}>Kembali ke menu</button></section></main>}
    <footer className="menu-footer"><a href="/" onClick={(event) => { event.preventDefault(); onHome(); }}>Ruma Coffee</a><span>Ruang untuk jeda.</span><small>Harga dan interaksi menu adalah simulasi frontend.</small></footer>
    {selected && <ProductDialog key={selected.id} product={selected} initial={editLine} onClose={() => { setSelected(null); setEditLine(null); }} onAdd={addItem} />}
    {cartOpen && <CartPanel items={items} totals={totals} voucher={voucher} voucherMessage={voucherMessage} onVoucher={applyVoucher} onClose={() => setCartOpen(false)} onQty={updateQty} onRemove={(key) => setItems((current) => current.filter((line) => line.key !== key))} onEdit={(line) => { setCartOpen(false); setEditLine(line); setSelected(line.product); }} onCheckout={() => { if (items.length) { setCartOpen(false); setView('checkout'); } }} />}
    {items.length > 0 && !cartOpen && view === 'catalog' && <div className="menu-mobile-cart"><span>{items.reduce((sum, line) => sum + line.qty, 0)} item · {rupiah(totals.total)}</span><button type="button" onClick={() => setCartOpen(true)}>Buka keranjang</button></div>}
  </div>;
}
