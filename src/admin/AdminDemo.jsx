import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import NumberFlow from '@number-flow/react';
import { CheckCircle, Download, Loader2 } from 'lucide-react';
import './admin.css';
import SmoothInput from '../components/SmoothInput.jsx';
import { categories, seedProducts } from './seed.js';
import { customerTotals, DemoStoreProvider, downloadCSV, formatDate, formatRupiah, isRecognized, ordersInRange, summarizeOrders, topProducts, useDemoStore } from './store.jsx';

const pageNames = { overview: 'Ringkasan', products: 'Produk', orders: 'Pesanan', reports: 'Laporan', customers: 'Pelanggan', settings: 'Pengaturan' };
const fulfillmentLabels = { pending: 'Menunggu', preparing: 'Disiapkan', ready: 'Siap', completed: 'Selesai', cancelled: 'Dibatalkan' };
const paymentLabels = { paid: 'Dibayar', pending: 'Menunggu', failed: 'Gagal', refunded: 'Dikembalikan' };
const transitions = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function Icon({ name }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    products: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21"/></>,
    orders: <><path d="M5 4h14v17H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    customers: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5.5a3 3 0 0 1 0 5.8M19 15a5 5 0 0 1 2 4v1"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 1 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 1 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 1 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 1 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z"/></>,
    collapse: <path d="m15 18-6-6 6-6"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Badge({ children, tone = '' }) {
  return <span className={`admin-badge ${tone ? `admin-badge--${tone}` : ''}`}>{children}</span>;
}

function Modal({ title, description, onClose, children, size = '' }) {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    const previousFocus = document.activeElement;
    const focusable = () => [...(dialogRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]') || [])];
    const autofocus = dialogRef.current?.querySelector('[autofocus]') || dialogRef.current?.querySelector('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
    if (autofocus) autofocus.focus(); else focusable()[0]?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0]; const last = items.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); previousFocus?.focus?.(); };
  }, []);
  return <div className="admin-modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className={`admin-modal ${size}`} role="dialog" aria-modal="true" aria-labelledby="admin-modal-title" aria-describedby={description ? 'admin-modal-description' : undefined}>
      <header className="admin-modal__head"><div><h2 id="admin-modal-title">{title}</h2>{description && <p id="admin-modal-description">{description}</p>}</div><button className="admin-icon-button" type="button" aria-label="Tutup dialog" onClick={onClose}>×</button></header>
      {children}
    </section>
  </div>;
}

function StatCard({ label, value, detail, tone = '' }) {
  return <article className={`admin-stat ${tone ? `admin-stat--${tone}` : ''}`}><span>{label}</span><strong><AnimatedNumber value={value} currency={label !== 'Pesanan dibayar' && label !== 'Pesanan diakui'}/></strong><small>{detail}</small></article>;
}

function AnimatedNumber({ value, currency = false }) {
  const target = Number(value) || 0;
  const ref = React.useRef(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  React.useEffect(() => {
    setDisplay(inView ? target : 0);
  }, [target, inView]);
  const accessibleValue = currency ? formatRupiah(target) : new Intl.NumberFormat('id-ID').format(target);
  return <span ref={ref} className="admin-animated-number" aria-label={accessibleValue}><NumberFlow value={display} locales="id-ID" format={{ maximumFractionDigits: 0 }} prefix={currency ? 'Rp ' : undefined}/></span>;
}

function PageTitle({ eyebrow, title, copy, action }) {
  return <div className="admin-page-title"><div><p className="admin-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div>{action && <div className="admin-page-title__action">{action}</div>}</div>;
}

function dateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function shiftMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
}

function dateLabel(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return value ? new Intl.DateTimeFormat('id-ID', options).format(parseLocalDate(value)) : '';
}

function initialDateRange() {
  const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - 29);
  return { start: dateInputValue(start), end: dateInputValue(end) };
}

function DateRangePicker({ dates, onDatesChange, open, setOpen }) {
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const dayRefs = React.useRef(new Map());
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const earliest = new Date(today); earliest.setDate(earliest.getDate() - 89);
  const minDate = dateInputValue(earliest);
  const maxDate = dateInputValue(today);
  const selectedStart = dates.start || '';
  const selectedEnd = dates.end || '';
  const [displayMonth, setDisplayMonth] = useState(() => monthStart(selectedStart ? parseLocalDate(selectedStart) : today));
  const [focusedDate, setFocusedDate] = useState(selectedStart || maxDate);
  const minMonth = monthStart(earliest);
  const maxMonth = monthStart(today);
  const firstDate = selectedStart ? dateLabel(selectedStart) : 'Pilih tanggal';
  const rangeLabel = selectedEnd ? `${firstDate} – ${dateLabel(selectedEnd)}` : selectedStart ? `${firstDate} – pilih tanggal akhir` : 'Pilih rentang tanggal';

  React.useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  React.useEffect(() => {
    if (open) window.requestAnimationFrame(() => dayRefs.current.get(focusedDate)?.focus());
  }, [open, focusedDate]);

  const openCalendar = () => {
    const nextStart = selectedStart || maxDate;
    setDisplayMonth(monthStart(parseLocalDate(nextStart)));
    setFocusedDate(nextStart);
    setOpen(true);
  };

  const selectDate = (value) => {
    if (!selectedStart || selectedEnd || value < selectedStart) {
      onDatesChange({ start: value, end: '' });
      setFocusedDate(value);
      return;
    }
    onDatesChange({ start: selectedStart, end: value });
    setFocusedDate(value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const focusDate = (date) => {
    const value = dateInputValue(date);
    if (value < minDate || value > maxDate) return;
    setFocusedDate(value);
    const targetMonth = monthStart(date);
    const secondMonth = shiftMonth(displayMonth, 1);
    if (targetMonth < displayMonth) setDisplayMonth(targetMonth);
    else if (targetMonth > secondMonth) setDisplayMonth(shiftMonth(targetMonth, -1));
  };

  const moveMonth = (amount) => {
    const next = shiftMonth(displayMonth, amount);
    if (next < minMonth || next > maxMonth) return;
    setDisplayMonth(next);
    const first = next < minMonth ? minMonth : next;
    const focus = dateInputValue(first < earliest ? earliest : first);
    setFocusedDate(focus);
  };

  const handleDateKeyDown = (event, date) => {
    let delta = 0;
    if (event.key === 'ArrowLeft') delta = -1;
    else if (event.key === 'ArrowRight') delta = 1;
    else if (event.key === 'ArrowUp') delta = -7;
    else if (event.key === 'ArrowDown') delta = 7;
    else if (event.key === 'Home') delta = -((date.getDay() + 6) % 7);
    else if (event.key === 'End') delta = 6 - ((date.getDay() + 6) % 7);
    if (delta) {
      event.preventDefault();
      const next = new Date(date); next.setDate(next.getDate() + delta);
      focusDate(next);
    }
  };

  const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const renderMonth = (month, offset) => {
    const year = month.getFullYear(); const monthIndex = month.getMonth();
    const first = new Date(year, monthIndex, 1, 12);
    const leading = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cells = Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - leading + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth ? new Date(year, monthIndex, dayNumber, 12) : null;
    });
    return <section className={`admin-calendar-month ${offset ? 'is-second' : ''}`} key={`${year}-${monthIndex}`} aria-label={new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(month)}>
      <h3>{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(month)}</h3>
      <div className="admin-calendar-grid" role="grid" aria-label={new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(month)}>
        <div className="admin-calendar-weekdays" role="row">{weekdays.map((weekday) => <span role="columnheader" key={weekday}>{weekday}</span>)}</div>
        {Array.from({ length: 6 }, (_, row) => <div className="admin-calendar-week" role="row" key={row}>{cells.slice(row * 7, row * 7 + 7).map((date, column) => {
          if (!date) return <span className="admin-calendar-empty" role="gridcell" aria-hidden="true" key={`empty-${row}-${column}`}/>;
          const value = dateInputValue(date);
          const isStart = value === selectedStart;
          const isEnd = Boolean(selectedEnd) && value === selectedEnd;
          const inRange = Boolean(selectedStart && selectedEnd && value > selectedStart && value < selectedEnd);
          const disabled = value < minDate || value > maxDate;
          return <button ref={(node) => { if (node) dayRefs.current.set(value, node); else dayRefs.current.delete(value); }} className={`admin-calendar-day ${isStart ? 'is-range-start' : ''} ${isEnd ? 'is-range-end' : ''} ${inRange ? 'is-in-range' : ''} ${value === maxDate ? 'is-today' : ''}`} type="button" role="gridcell" key={value} aria-label={dateLabel(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={isStart || isEnd} aria-current={value === maxDate ? 'date' : undefined} disabled={disabled} tabIndex={focusedDate === value ? 0 : -1} onClick={() => selectDate(value)} onFocus={() => setFocusedDate(value)} onKeyDown={(event) => handleDateKeyDown(event, date)}>{date.getDate()}</button>;
        })}</div>)}
      </div>
    </section>;
  };

  return <div className="admin-date-picker" ref={rootRef}>
    <button ref={triggerRef} className="admin-date-picker__trigger" type="button" aria-label={`Pilih rentang tanggal: ${rangeLabel}`} aria-haspopup="dialog" aria-expanded={open} aria-controls="admin-date-range-calendar" onClick={() => open ? setOpen(false) : openCalendar()}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M6.5 3.5v3M13.5 3.5v3M3 8.5h14"/></svg>
      <span>{rangeLabel}</span>
      <svg className="admin-date-picker__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
    </button>
    {open && <div id="admin-date-range-calendar" className="admin-calendar-popover" role="dialog" aria-label="Pilih rentang tanggal" aria-modal="false">
      <header className="admin-calendar-head"><p>{selectedStart && !selectedEnd ? 'Pilih tanggal akhir' : 'Pilih tanggal mulai dan akhir'}</p><div><button type="button" aria-label="Bulan sebelumnya" onClick={() => moveMonth(-1)} disabled={displayMonth <= minMonth}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5"/></svg></button><button type="button" aria-label="Bulan berikutnya" onClick={() => moveMonth(1)} disabled={displayMonth >= maxMonth}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg></button></div></header>
      <div className="admin-calendar-months">{renderMonth(displayMonth, 0)}{renderMonth(shiftMonth(displayMonth, 1), 1)}</div>
      <footer className="admin-calendar-footer"><span>{selectedStart && selectedEnd ? `${dateLabel(selectedStart)} – ${dateLabel(selectedEnd)}` : 'Rentang tanggal maksimal 90 hari'}</span><button type="button" onClick={() => { onDatesChange(initialDateRange()); setOpen(false); triggerRef.current?.focus(); }}>30 hari terakhir</button></footer>
    </div>}
  </div>;
}

function AdminSelect({ value, onChange, options, label, className = '' }) {
  const controlId = React.useId();
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const optionRefs = React.useRef([]);
  const closeTimer = React.useRef(null);
  const typeahead = React.useRef('');
  const typeaheadTimer = React.useRef(null);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [position, setPosition] = useState(null);

  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMounted(false), 240);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const openMenu = (index = selectedIndex, focusOption = false) => {
    window.clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const viewportPadding = 12;
      const width = Math.min(Math.max(rect.width, 190), window.innerWidth - viewportPadding * 2);
      const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding));
      const preferredHeight = Math.min(288, options.length * 42 + 10);
      const below = window.innerHeight - rect.bottom - viewportPadding;
      const above = rect.top - viewportPadding;
      const openAbove = below < preferredHeight && above > below;
      const maxHeight = Math.max(84, Math.min(288, (openAbove ? above : below) - 7));
      setPosition({ top: openAbove ? Math.max(viewportPadding, rect.top - maxHeight - 7) : rect.bottom + 7, left, width, maxHeight, origin: openAbove ? 'bottom center' : 'top center' });
    }
    const nextIndex = (index + options.length) % options.length;
    setActiveIndex(nextIndex);
    setMounted(true);
    setOpen(true);
    if (focusOption) window.requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus());
  };
  const moveActive = (index) => {
    const nextIndex = (index + options.length) % options.length;
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.focus();
  };
  const choose = (option) => {
    onChange(option.value);
    closeMenu();
  };

  React.useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) closeMenu(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
      if (event.key === 'Tab') closeMenu(false);
    };
    const dismissForViewportChange = () => closeMenu(false);
    const dismissForPageScroll = (event) => {
      if (!menuRef.current?.contains(event.target)) closeMenu(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', dismissForViewportChange);
    window.addEventListener('scroll', dismissForPageScroll, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', dismissForViewportChange);
      window.removeEventListener('scroll', dismissForPageScroll, true);
    };
  }, [open]);
  React.useEffect(() => () => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(typeaheadTimer.current);
  }, []);

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(selectedIndex, true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) closeMenu(false); else openMenu(selectedIndex, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      openMenu(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      openMenu(options.length - 1, true);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead.current += event.key.toLocaleLowerCase();
      window.clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = window.setTimeout(() => { typeahead.current = ''; }, 600);
      const match = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(typeahead.current));
      if (match >= 0) openMenu(match, true);
    }
  };

  return <div className="admin-select-control" ref={rootRef}>
    <button ref={triggerRef} className={`admin-select-trigger ${className}`} type="button" aria-label={`${label}: ${options[selectedIndex]?.label || ''}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={controlId} onClick={() => open ? closeMenu(false) : openMenu()} onKeyDown={handleTriggerKeyDown}>
      <span>{options[selectedIndex]?.label || ''}</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
    </button>
    {mounted && position && createPortal(<div ref={menuRef} id={controlId} className={`admin-range-menu admin-select-menu ${open ? 'is-open' : 'is-closing'}`} role="listbox" aria-label={label} aria-hidden={!open} style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight, transformOrigin: position.origin }} onAnimationEnd={(event) => { if (event.target === event.currentTarget && !open) setMounted(false); }}>
      {options.map((option, index) => <button key={option.value} ref={(node) => { optionRefs.current[index] = node; }} className={`admin-range-option ${value === option.value ? 'is-selected' : ''} ${activeIndex === index ? 'is-active' : ''}`} type="button" role="option" aria-selected={value === option.value} tabIndex={open && activeIndex === index ? 0 : -1} style={{ '--range-stagger': index }} onPointerDown={(event) => {
        if (event.button !== 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
        event.currentTarget.classList.remove('is-pressed');
        void event.currentTarget.offsetWidth;
        event.currentTarget.classList.add('is-pressed');
      }} onAnimationEnd={(event) => { if (event.animationName === 'admin-range-ripple') event.currentTarget.classList.remove('is-pressed'); }} onClick={() => choose(option)} onFocus={() => setActiveIndex(index)} onKeyDown={(event) => {
        if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(index + 1); }
        if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(index - 1); }
        if (event.key === 'Home') { event.preventDefault(); moveActive(0); }
        if (event.key === 'End') { event.preventDefault(); moveActive(options.length - 1); }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          typeahead.current += event.key.toLocaleLowerCase();
          window.clearTimeout(typeaheadTimer.current);
          typeaheadTimer.current = window.setTimeout(() => { typeahead.current = ''; }, 600);
          const match = options.findIndex((item) => item.label.toLocaleLowerCase().startsWith(typeahead.current));
          if (match >= 0) { event.preventDefault(); moveActive(match); }
        }
      }}><span>{option.label}</span>{value === option.value && <svg className="admin-range-check" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3.2 3.2L13 4.5"/></svg>}</button>)}
    </div>, document.body)}
  </div>;
}

function RangeSelect({ value, onChange, dates, onDatesChange }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const options = [
    { value: '7', label: '7 hari terakhir' },
    { value: '30', label: '30 hari terakhir' },
    { value: '90', label: '90 hari terakhir' },
    { value: 'all', label: 'Semua waktu' },
    { value: 'custom', label: 'Rentang tanggal' },
  ];
  return <div className={`admin-range-control ${value === 'custom' ? 'is-custom' : ''}`}>
    <label className="admin-field admin-range"><span>Periode</span><AdminSelect className="admin-range-trigger" label="Periode" value={value} options={options} onChange={(next) => { onChange(next); setCalendarOpen(next === 'custom'); }}/></label>
    {value === 'custom' && <DateRangePicker dates={dates} onDatesChange={onDatesChange} open={calendarOpen} setOpen={setCalendarOpen}/>}
  </div>;
}

function filterOrdersByRange(orders, range, dates) {
  if (range !== 'custom') return ordersInRange(orders, range);
  if (!dates?.start || !dates?.end || dates.start > dates.end) return [];
  const start = new Date(`${dates.start}T00:00:00`).getTime();
  const end = new Date(`${dates.end}T23:59:59.999`).getTime();
  return orders.filter((order) => {
    const placed = new Date(order.placedAt).getTime();
    return placed >= start && placed <= end;
  });
}

function SalesChart({ orders, range, dates }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const points = useMemo(() => {
    const startDate = range === 'custom' && dates?.start ? new Date(`${dates.start}T00:00:00`) : new Date();
    const days = range === 'custom' ? (dates?.start && dates?.end && dates.start <= dates.end ? Math.min(90, Math.floor((new Date(`${dates.end}T00:00:00`) - startDate) / 86400000) + 1) : 0) : range === 'all' ? 90 : Math.min(Number(range), 90);
    const result = Array.from({ length: days }, (_, index) => {
      const date = new Date(startDate); date.setHours(0, 0, 0, 0);
      if (range !== 'custom') date.setDate(date.getDate() - (days - index - 1));
      else date.setDate(date.getDate() + index);
      return { date, value: 0 };
    });
    const byDate = new Map(result.map((point) => [point.date.toDateString(), point]));
    orders.filter(isRecognized).forEach((order) => {
      const key = new Date(order.placedAt).toDateString();
      if (byDate.has(key)) byDate.get(key).value += order.total;
    });
    return result;
  }, [orders, range, dates]);
  const max = Math.max(10000, ...points.map((point) => point.value));
  const labels = [points[0], points[Math.floor((points.length - 1) / 2)], points.at(-1)].filter(Boolean);
  const rangeLabel = range === 'custom' ? `${dates?.start || 'tanggal awal'} sampai ${dates?.end || 'tanggal akhir'}` : range === 'all' ? 'periode yang tersedia' : `${range} hari terakhir`;
  const activePoint = activeIndex == null ? null : points[activeIndex];
  const tooltipLeft = activeIndex == null || points.length === 0 ? 50 : Math.min(88, Math.max(12, ((activeIndex + 0.5) / points.length) * 100));
  const barGap = points.length > 40 ? 1 : points.length > 20 ? 2 : 4;
  const handleChartKeyDown = (event) => {
    if (points.length === 0) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveIndex((current) => current == null ? (event.key === 'ArrowRight' ? 0 : points.length - 1) : Math.max(0, Math.min(points.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1))));
    }
    if (event.key === 'Escape') setActiveIndex(null);
  };
  return <div className="admin-chart" role="group" aria-label={`Grafik batang penjualan yang diakui selama ${rangeLabel}`}>
    <div className="admin-chart__summary"><span>Penjualan diakui</span><strong><AnimatedNumber value={points.reduce((sum, point) => sum + point.value, 0)} currency/></strong></div>
    <div className="admin-chart__plot" role="group" tabIndex={0} aria-label="Grafik harian. Gunakan panah kiri dan kanan untuk melihat nilai tiap tanggal." aria-describedby={activePoint ? 'admin-chart-tooltip' : undefined} onKeyDown={handleChartKeyDown} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null); }}>
      <div className="admin-chart__y-labels" aria-hidden="true"><span>{formatRupiah(max)}</span><span>{formatRupiah(Math.round(max * .66))}</span><span>{formatRupiah(Math.round(max * .33))}</span><span>Rp0</span></div>
      <div className={`admin-chart__bars${activePoint ? ' has-active' : ''}`} style={{ '--bar-gap': `${barGap}px` }} onPointerLeave={() => setActiveIndex(null)}>
        {activePoint && <span className="admin-chart__crosshair" aria-hidden="true" style={{ left: `${tooltipLeft}%` }} />}
        {points.map((point, index) => <span key={`${point.date.toISOString()}-${point.value}`} className={`admin-chart__bar${activeIndex === index ? ' is-active' : ''}`} style={{ height: `${Math.max(point.value ? 2 : 0.5, (point.value / max) * 100)}%`, '--bar-index': index }} title={`${formatDate(point.date, { day: 'numeric', month: 'long' })}: ${formatRupiah(point.value)}`} onPointerEnter={() => setActiveIndex(index)} />)}
        {activePoint && <span className="admin-chart__tooltip" id="admin-chart-tooltip" role="tooltip" style={{ left: `${tooltipLeft}%` }}><span>{formatDate(activePoint.date, { day: 'numeric', month: 'long' })}</span><strong>{formatRupiah(activePoint.value)}</strong></span>}
      </div>
    </div>
    <div className="admin-chart__labels">{labels.map((point, index) => <span key={`${point.date.toISOString()}-${index}`}>{formatDate(point.date, { day: 'numeric', month: 'short' })}</span>)}</div>
  </div>;
}

function EmptyState({ title, copy, action }) {
  return <div className="admin-empty"><span className="admin-empty__mark" aria-hidden="true">R</span><h3>{title}</h3><p>{copy}</p>{action}</div>;
}

function Pager({ page, pages, onChange, label }) {
  if (pages <= 1) return null;
  return <div className="admin-pager"><span>{label}</span><div><button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">‹</button><span>Halaman {page} dari {pages}</span><button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Halaman berikutnya">›</button></div></div>;
}

function ProductForm({ product, products, onSave, onClose }) {
  const [fields, setFields] = useState(product || { name: '', sku: '', category: categories[0], price: '', stock: '', image: seedProducts[0].image, availability: 'Available' });
  const [errors, setErrors] = useState({});
  const set = (key, value) => setFields((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!fields.name.trim()) next.name = 'Masukkan nama produk.';
    if (fields.sku && !/^[A-Za-z0-9-]{3,20}$/.test(fields.sku)) next.sku = 'SKU berisi 3–20 huruf, angka, atau tanda hubung.';
    if (fields.sku.trim() && products.some((item) => item.sku.toLowerCase() === fields.sku.trim().toLowerCase() && item.id !== product?.id)) next.sku = 'SKU ini sudah dipakai produk lain.';
    if (!Number.isFinite(Number(fields.price)) || Number(fields.price) < 1000) next.price = 'Harga minimal Rp1.000.';
    if (!Number.isInteger(Number(fields.stock)) || Number(fields.stock) < 0) next.stock = 'Stok harus berupa bilangan bulat nol atau lebih.';
    if (Number(fields.stock) === 0 && fields.availability === 'Available') next.stock = 'Produk tanpa stok harus ditandai tidak tersedia.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...fields, name: fields.name.trim(), sku: fields.sku.trim().toUpperCase() || product?.sku || '', price: Number(fields.price), stock: Number(fields.stock) });
  };
  return <form className="admin-form" onSubmit={submit} noValidate>
    <div className="admin-form-grid"><label className="admin-field"><span>Nama produk</span><SmoothInput autoFocus value={fields.name} onChange={(event) => set('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'product-name-error' : undefined}/>{errors.name && <small id="product-name-error" className="admin-error">{errors.name}</small>}</label>
      <label className="admin-field"><span>SKU <em>opsional</em></span><SmoothInput value={fields.sku} onChange={(event) => set('sku', event.target.value)} placeholder="Dibuat otomatis bila kosong" aria-invalid={Boolean(errors.sku)} aria-describedby={errors.sku ? 'product-sku-error' : undefined}/>{errors.sku && <small id="product-sku-error" className="admin-error">{errors.sku}</small>}</label>
      <label className="admin-field"><span>Kategori</span><AdminSelect label="Kategori produk" value={fields.category} onChange={(value) => set('category', value)} options={categories.map((category) => ({ value: category, label: category }))}/></label>
      <label className="admin-field"><span>Harga (Rp)</span><input type="number" min="1000" step="1000" value={fields.price} onChange={(event) => set('price', event.target.value)} aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? 'product-price-error' : undefined}/>{errors.price && <small id="product-price-error" className="admin-error">{errors.price}</small>}</label>
      <label className="admin-field"><span>Stok</span><input type="number" min="0" step="1" value={fields.stock} onChange={(event) => { set('stock', event.target.value); if (Number(event.target.value) === 0) set('availability', 'Unavailable'); }} aria-invalid={Boolean(errors.stock)} aria-describedby={errors.stock ? 'product-stock-error' : undefined}/>{errors.stock && <small id="product-stock-error" className="admin-error">{errors.stock}</small>}</label>
      <label className="admin-field"><span>Ketersediaan</span><AdminSelect label="Ketersediaan produk" value={fields.availability} onChange={(value) => set('availability', value)} options={[{ value: 'Available', label: 'Available' }, { value: 'Unavailable', label: 'Unavailable' }]}/></label>
      <label className="admin-field admin-field--wide"><span>Foto produk</span><AdminSelect label="Foto produk" value={fields.image} onChange={(value) => set('image', value)} options={seedProducts.map((item) => ({ value: item.image, label: item.name }))}/></label>
    </div>
    <footer className="admin-form__actions"><button className="admin-button admin-button--quiet" type="button" onClick={onClose}>Batal</button><button className="admin-button admin-button--primary" type="submit">{product ? 'Simpan perubahan' : 'Buat produk'}</button></footer>
  </form>;
}

function OverviewPage({ setPage }) {
  const { data } = useDemoStore();
  const [range, setRange] = useState('30');
  const [dates, setDates] = useState(initialDateRange);
  const rangeOrders = filterOrdersByRange(data.orders, range, dates);
  const stats = summarizeOrders(rangeOrders);
  const leaders = topProducts(rangeOrders).slice(0, 5);
  const recent = [...rangeOrders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 5);
  return <>
    <PageTitle eyebrow="Ruma Coffee / Demo" title="Ringkasan" copy="Pantau pesanan dan penjualan dari dataset demo yang sama." action={<RangeSelect value={range} onChange={setRange} dates={dates} onDatesChange={setDates}/>}/>
    <div className="admin-stat-grid">
      <StatCard label="Penjualan kotor" value={stats.grossSales} detail="Total pesanan, kecuali yang dibatalkan"/>
      <StatCard label="Penjualan diakui" value={stats.recognizedSales} detail="Lunas dan selesai" tone="accent"/>
      <StatCard label="Pesanan dibayar" value={stats.paidOrders} detail={`${stats.completedOrders} pesanan selesai`}/>
      <StatCard label="Nilai rata-rata" value={stats.averageOrderValue} detail="Per pesanan lunas dan selesai"/>
    </div>
    <section className="admin-panel admin-overview-chart"><header className="admin-panel__head"><div><p className="admin-eyebrow">Aktivitas</p><h2>Penjualan yang diakui</h2><p>Nilai harian dari pesanan lunas dan selesai. Pesanan batal tidak dihitung.</p></div><span className="admin-definition">Definisi penjualan</span></header><SalesChart orders={rangeOrders} range={range} dates={dates}/></section>
    <div className="admin-two-col">
      <section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Menu</p><h2>Produk terlaris</h2><p>Diurutkan dari jumlah unit pada pesanan diakui.</p></div><button className="admin-text-button" type="button" onClick={() => setPage('products')}>Lihat produk</button></header>
        {leaders.length ? <ol className="admin-top-list">{leaders.map((item, index) => <li key={item.id}><span className="admin-top-list__rank">0{index + 1}</span><div><strong>{item.name}</strong><small>{item.quantity} unit terjual</small></div><b>{formatRupiah(item.sales)}</b></li>)}</ol> : <EmptyState title="Belum ada penjualan diakui" copy="Pesanan lunas dan selesai akan tampil di sini."/>}
      </section>
      <section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Perlu perhatian</p><h2>Status pesanan</h2><p>Semua status pesanan pada periode terpilih.</p></div><button className="admin-text-button" type="button" onClick={() => setPage('orders')}>Buka pesanan</button></header>
        <div className="admin-status-summary">{[['Menunggu', stats.pendingOrders], ['Selesai', stats.completedOrders], ['Dibatalkan', stats.cancelledOrders]].map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
        <h3 className="admin-subheading">Pesanan terbaru</h3>
        <div className="admin-recent-list">{recent.map((order) => <div key={order.id}><div><strong>{order.number}</strong><small>{order.customerName} · {formatDate(order.placedAt)}</small></div><div><Badge tone={order.fulfillmentStatus}>{fulfillmentLabels[order.fulfillmentStatus]}</Badge><strong>{formatRupiah(order.total)}</strong></div></div>)}</div>
      </section>
    </div>
    <p className="admin-footnote">Aktif: {data.products.filter((product) => product.availability === 'Available').length} produk. Nilai seluruh kartu mengikuti data demo bersama.</p>
  </>;
}

function ProductsPage({ notify }) {
  const { data, addProduct, editProduct, deleteProduct } = useDemoStore();
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('all'); const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('name'); const [direction, setDirection] = useState(1); const [page, setPage] = useState(1); const [editing, setEditing] = useState(undefined); const [deleting, setDeleting] = useState(null);
  const pageSize = 8;
  const filtered = useMemo(() => data.products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(query.trim().toLowerCase()) && (category === 'all' || product.category === category) && (availability === 'all' || product.availability === availability)).sort((a, b) => (typeof a[sort] === 'string' ? a[sort].localeCompare(b[sort], 'id') : a[sort] - b[sort]) * direction), [data.products, query, category, availability, sort, direction]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  const updateSort = (key) => { setDirection(sort === key ? direction * -1 : 1); setSort(key); setPage(1); };
  const sortButton = (key, text) => <button type="button" className="admin-sort" onClick={() => updateSort(key)}>{text}{sort === key ? (direction === 1 ? ' ↑' : ' ↓') : ''}</button>;
  return <>
    <PageTitle eyebrow="Katalog" title="Produk" copy="Kelola daftar, harga, dan stok produk demo." action={<button className="admin-button admin-button--primary" type="button" onClick={() => setEditing(null)}>Tambah produk</button>}/>
    <section className="admin-panel admin-table-panel">
      <div className="admin-toolbar"><label className="admin-search"><span className="sr-only">Cari produk</span><SmoothInput value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama atau SKU"/></label><label className="admin-field"><span className="sr-only">Kategori</span><AdminSelect label="Filter kategori produk" value={category} onChange={(value) => { setCategory(value); setPage(1); }} options={[{ value: 'all', label: 'Semua kategori' }, ...categories.map((item) => ({ value: item, label: item }))]}/></label><label className="admin-field"><span className="sr-only">Ketersediaan</span><AdminSelect label="Filter ketersediaan produk" value={availability} onChange={(value) => { setAvailability(value); setPage(1); }} options={[{ value: 'all', label: 'Semua ketersediaan' }, { value: 'Available', label: 'Available' }, { value: 'Unavailable', label: 'Unavailable' }]}/></label><span className="admin-result-count">{filtered.length} produk</span></div>
      {shown.length ? <><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Produk</th><th>{sortButton('sku', 'SKU')}</th><th>Kategori</th><th>{sortButton('price', 'Harga')}</th><th>{sortButton('stock', 'Stok')}</th><th>Ketersediaan</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{shown.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img src={`/assets/${product.image}`} alt=""/><strong>{product.name}</strong></div></td><td>{product.sku}</td><td>{product.category}</td><td>{formatRupiah(product.price)}</td><td>{product.stock}</td><td><Badge tone={product.availability === 'Available' ? 'success' : 'muted'}>{product.availability === 'Available' ? 'Tersedia' : 'Tidak tersedia'}</Badge></td><td><div className="admin-row-actions"><button type="button" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}>Edit</button><button type="button" onClick={() => setDeleting(product)} aria-label={`Hapus ${product.name}`}>Hapus</button></div></td></tr>)}</tbody></table></div><Pager page={page} pages={pages} onChange={setPage} label={`Menampilkan ${shown.length} dari ${filtered.length} produk`}/></> : <EmptyState title={query || category !== 'all' || availability !== 'all' ? 'Produk tidak ditemukan' : 'Katalog kosong'} copy={query || category !== 'all' || availability !== 'all' ? 'Coba ubah kata pencarian atau filter.' : 'Tambahkan produk pertama ke katalog demo.'} action={!filtered.length && !query ? <button className="admin-button admin-button--primary" type="button" onClick={() => setEditing(null)}>Tambah produk</button> : null}/>}
    </section>
    {editing !== undefined && <Modal title={editing ? 'Edit produk' : 'Produk baru'} description="Perubahan hanya berlaku pada data demo yang tersimpan di browser ini." onClose={() => setEditing(undefined)}><ProductForm product={editing || undefined} products={data.products} onClose={() => setEditing(undefined)} onSave={(values) => { if (editing) editProduct(editing.id, values); else addProduct(values); setEditing(undefined); notify(editing ? 'Perubahan produk disimpan.' : 'Produk baru ditambahkan.'); }}/></Modal>}
    {deleting && <Modal title="Hapus produk?" description={`${deleting.name} akan dihapus dari katalog. Snapshot nama dan harga pesanan lama tetap tersimpan.`} onClose={() => setDeleting(null)}><div className="admin-confirm-actions"><button className="admin-button admin-button--quiet" type="button" onClick={() => setDeleting(null)}>Batal</button><button className="admin-button admin-button--danger" type="button" onClick={() => { deleteProduct(deleting.id); setDeleting(null); notify('Produk dihapus dari katalog demo.'); }}>Hapus produk</button></div></Modal>}
  </>;
}

function OrderDetails({ order, onClose, onUpdate, notify }) {
  const nextStatuses = transitions[order.fulfillmentStatus] || [];
  return <Modal title={`Pesanan ${order.number}`} description={`Dibuat ${formatDate(order.placedAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Data transaksi simulasi`} onClose={onClose} size="admin-modal--wide">
    <div className="admin-order-detail"><div className="admin-detail-grid"><div><span>Pelanggan</span><strong>{order.customerName}</strong><small>{order.customerEmail}</small></div><div><span>Pembayaran</span><Badge tone={order.paymentStatus}>{paymentLabels[order.paymentStatus]}</Badge></div><div><span>Pemenuhan</span><Badge tone={order.fulfillmentStatus}>{fulfillmentLabels[order.fulfillmentStatus]}</Badge></div></div>
      <h3>Item pesanan</h3><div className="admin-order-lines">{order.items.map((item, index) => <div key={`${item.productId}-${index}`}><span><strong>{item.name}</strong><small>{item.quantity} × {formatRupiah(item.unitPrice)} · Harga saat dipesan</small></span><b>{formatRupiah(item.unitPrice * item.quantity)}</b></div>)}</div>
      <div className="admin-order-totals"><div><span>Subtotal</span><b>{formatRupiah(order.subtotal)}</b></div><div><span>Diskon demo</span><b>−{formatRupiah(order.discount)}</b></div><div className="admin-order-totals__grand"><span>Total simulasi</span><b>{formatRupiah(order.total)}</b></div></div>
      {order.note && <p className="admin-order-note">Catatan: {order.note}</p>}
      <div className="admin-transition-box"><div><strong>Perbarui status demo</strong><small>Status pembayaran dan pemenuhan dicatat terpisah. Tidak ada provider pembayaran yang dihubungi.</small></div><div className="admin-transition-actions">{order.paymentStatus === 'pending' && order.fulfillmentStatus !== 'cancelled' && <button className="admin-button admin-button--quiet" type="button" onClick={() => { onUpdate({ paymentStatus: 'paid' }); notify('Status pembayaran demo diperbarui.'); onClose(); }}>Tandai dibayar</button>}{nextStatuses.map((status) => <button key={status} className={`admin-button ${status === 'cancelled' ? 'admin-button--danger' : 'admin-button--primary'}`} type="button" onClick={() => { const paymentStatus = status === 'cancelled' && order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus; onUpdate({ fulfillmentStatus: status, paymentStatus }); notify(status === 'cancelled' ? 'Pesanan demo dibatalkan.' : `Pesanan demo ditandai ${fulfillmentLabels[status].toLowerCase()}.`); onClose(); }}>{status === 'cancelled' ? 'Batalkan' : `Tandai ${fulfillmentLabels[status].toLowerCase()}`}</button>)}</div></div>
    </div>
  </Modal>;
}

function OrdersPage({ notify }) {
  const { data, updateOrder } = useDemoStore();
  const [query, setQuery] = useState(''); const [payment, setPayment] = useState('all'); const [fulfillment, setFulfillment] = useState('all'); const [range, setRange] = useState('90'); const [sort, setSort] = useState('placedAt'); const [direction, setDirection] = useState(-1); const [page, setPage] = useState(1); const [selected, setSelected] = useState(null);
  const [dates, setDates] = useState(initialDateRange);
  const pageSize = 10;
  const filtered = useMemo(() => filterOrdersByRange(data.orders, range, dates).filter((order) => `${order.number} ${order.customerName} ${order.customerEmail}`.toLowerCase().includes(query.trim().toLowerCase()) && (payment === 'all' || order.paymentStatus === payment) && (fulfillment === 'all' || order.fulfillmentStatus === fulfillment)).sort((a, b) => (sort === 'total' ? a.total - b.total : a.placedAt.localeCompare(b.placedAt)) * direction), [data.orders, query, payment, fulfillment, range, dates, sort, direction]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  const setFilter = (fn) => (event) => { fn(event.target.value); setPage(1); };
  return <>
    <PageTitle eyebrow="Operasional" title="Pesanan" copy="Tinjau transaksi demo dan catat perubahan status secara terpisah."/>
    <section className="admin-panel admin-table-panel"><div className="admin-toolbar"><label className="admin-search"><span className="sr-only">Cari pesanan</span><SmoothInput value={query} onChange={setFilter(setQuery)} placeholder="Cari nomor atau pelanggan"/></label><label className="admin-field"><span className="sr-only">Status pembayaran</span><AdminSelect label="Filter status pembayaran" value={payment} onChange={(value) => { setPayment(value); setPage(1); }} options={[{ value: 'all', label: 'Semua pembayaran' }, ...Object.entries(paymentLabels).map(([key, label]) => ({ value: key, label }))]}/></label><label className="admin-field"><span className="sr-only">Status pemenuhan</span><AdminSelect label="Filter status pesanan" value={fulfillment} onChange={(value) => { setFulfillment(value); setPage(1); }} options={[{ value: 'all', label: 'Semua status pesanan' }, ...Object.entries(fulfillmentLabels).map(([key, label]) => ({ value: key, label }))]}/></label><RangeSelect value={range} onChange={(next) => { setRange(next); setPage(1); }} dates={dates} onDatesChange={(next) => { setDates(next); setPage(1); }}/><span className="admin-result-count">{filtered.length} pesanan</span></div>
      {shown.length ? <><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Pesanan</th><th>{<button type="button" className="admin-sort" onClick={() => { setDirection(sort === 'placedAt' ? direction * -1 : -1); setSort('placedAt'); }}>Tanggal{sort === 'placedAt' ? (direction < 0 ? ' ↓' : ' ↑') : ''}</button>}</th><th>Pelanggan</th><th>{<button type="button" className="admin-sort" onClick={() => { setDirection(sort === 'total' ? direction * -1 : 1); setSort('total'); }}>Total{sort === 'total' ? (direction < 0 ? ' ↓' : ' ↑') : ''}</button>}</th><th>Pembayaran</th><th>Status pesanan</th><th></th></tr></thead><tbody>{shown.map((order) => <tr key={order.id}><td><button className="admin-table-link" type="button" onClick={() => setSelected(order)}>{order.number}</button></td><td>{formatDate(order.placedAt)}</td><td>{order.customerName}</td><td>{formatRupiah(order.total)}</td><td><Badge tone={order.paymentStatus}>{paymentLabels[order.paymentStatus]}</Badge></td><td><Badge tone={order.fulfillmentStatus}>{fulfillmentLabels[order.fulfillmentStatus]}</Badge></td><td><button className="admin-row-view" type="button" onClick={() => setSelected(order)}>Detail</button></td></tr>)}</tbody></table></div><Pager page={page} pages={pages} onChange={setPage} label={`Menampilkan ${shown.length} dari ${filtered.length} pesanan`}/></> : <EmptyState title={query || payment !== 'all' || fulfillment !== 'all' ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'} copy="Ubah filter atau rentang tanggal untuk melihat pesanan demo lain."/>}
    </section>
    <p className="admin-footnote">Semua pembayaran dan perubahan status di sini adalah simulasi. Tidak ada transaksi nyata.</p>
    {selected && <OrderDetails order={data.orders.find((order) => order.id === selected.id) || selected} onClose={() => setSelected(null)} onUpdate={(changes) => updateOrder(selected.id, changes)} notify={notify}/>}
  </>;
}

function ReportDownloadButton({ onDownload }) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const timers = React.useRef({ interval: 0, reset: 0 });

  React.useEffect(() => () => {
    window.clearInterval(timers.current.interval);
    window.clearTimeout(timers.current.reset);
  }, []);

  const handleDownload = () => {
    if (status !== 'idle') return;
    setStatus('downloading');
    setProgress(0);
    let next = 0;
    timers.current.interval = window.setInterval(() => {
      next = Math.min(next + 20, 100);
      setProgress(next);
      if (next < 100) return;

      window.clearInterval(timers.current.interval);
      try {
        onDownload();
        setStatus('downloaded');
        timers.current.reset = window.setTimeout(() => {
          setStatus('idle');
          setProgress(0);
        }, 1400);
      } catch {
        setStatus('idle');
        setProgress(0);
      }
    }, 55);
  };

  const busy = status === 'downloading';
  return <>
    <button className={`admin-button admin-button--primary admin-download-button ${busy ? 'is-downloading' : ''}`} type="button" onClick={handleDownload} disabled={busy} aria-busy={busy}>
      {busy && <span className="admin-download-button__progress" style={{ width: `${progress}%` }} aria-hidden="true"/>}
      <span className="admin-download-button__content">
        {busy ? <><Loader2 className="admin-download-button__icon is-spinning" aria-hidden="true"/>Menyiapkan CSV {progress}%</> : status === 'downloaded' ? <><CheckCircle className="admin-download-button__icon" aria-hidden="true"/>CSV diunduh</> : <><Download className="admin-download-button__icon" aria-hidden="true"/>Unduh CSV</>}
      </span>
    </button>
    <span className="sr-only" role="status">{busy ? 'Menyiapkan file CSV.' : status === 'downloaded' ? 'File CSV berhasil diunduh.' : ''}</span>
  </>;
}

function ReportsPage() {
  const { data } = useDemoStore();
  const [range, setRange] = useState('30');
  const [dates, setDates] = useState(initialDateRange);
  const orders = filterOrdersByRange(data.orders, range, dates); const stats = summarizeOrders(orders);
  const recognized = orders.filter(isRecognized);
  const byProduct = topProducts(orders).slice(0, 8);
  const byCategory = categories.map((category) => {
    const items = recognized.flatMap((order) => order.items.filter((item) => item.category === category));
    return { category, total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) };
  }).filter((row) => row.total).sort((a, b) => b.total - a.total);
  const exportReport = () => downloadCSV(`ruma-laporan-${range === 'custom' ? `${dates.start}-${dates.end}` : `${range}hari`}.csv`, [
    ['Tanggal', 'Nomor pesanan', 'Pelanggan demo', 'Pembayaran', 'Status pesanan', 'Subtotal', 'Diskon', 'Total', 'Diakui'],
    ...orders.map((order) => [formatDate(order.placedAt), order.number, order.customerName, paymentLabels[order.paymentStatus], fulfillmentLabels[order.fulfillmentStatus], order.subtotal, order.discount, order.total, isRecognized(order) ? 'Ya' : 'Tidak']),
  ]);
  return <>
    <PageTitle eyebrow="Analisis" title="Laporan" copy="Ringkasan penjualan dan status berdasarkan dataset demo." action={<div className="admin-title-actions"><RangeSelect value={range} onChange={setRange} dates={dates} onDatesChange={setDates}/><ReportDownloadButton onDownload={exportReport}/></div>}/>
    <div className="admin-stat-grid admin-stat-grid--three"><StatCard label="Penjualan kotor" value={stats.grossSales} detail="Total pesanan kecuali dibatalkan"/><StatCard label="Penjualan diakui" value={stats.recognizedSales} detail="Lunas dan selesai" tone="accent"/><StatCard label="Pesanan diakui" value={stats.recognizedOrderCount} detail="Pembayaran lunas, pemenuhan selesai"/></div>
    <section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Tren</p><h2>Penjualan per hari</h2><p>Hanya pesanan lunas dan selesai yang masuk ke tren.</p></div></header><SalesChart orders={orders} range={range} dates={dates}/></section>
    <div className="admin-two-col admin-report-lists"><section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Komposisi</p><h2>Penjualan per kategori</h2><p>Dihitung dari snapshot produk pada pesanan yang diakui.</p></div></header>{byCategory.length ? <div className="admin-bar-list">{byCategory.map((row, index) => <div key={row.category}><div><strong>{row.category}</strong><b>{formatRupiah(row.total)}</b></div><span><i style={{ '--bar-width': `${Math.max(5, (row.total / byCategory[0].total) * 100)}%`, '--bar-index': index }}/></span></div>)}</div> : <EmptyState title="Belum ada penjualan diakui" copy="Data kategori muncul setelah ada pesanan lunas dan selesai."/>}</section>
      <section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Produk</p><h2>Penjualan per produk</h2><p>Jumlah unit dan nilai historis transaksi.</p></div></header>{byProduct.length ? <div className="admin-report-product-list">{byProduct.map((product) => <div key={product.id}><strong>{product.name}</strong><span>{product.quantity} unit</span><b>{formatRupiah(product.sales)}</b></div>)}</div> : <EmptyState title="Belum ada data produk" copy="Pesanan yang diakui akan mengisi laporan ini."/>}</section></div>
    <section className="admin-panel admin-order-status-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Operasional</p><h2>Status pesanan</h2><p>Semua pesanan pada periode yang dipilih.</p></div></header><div className="admin-status-summary">{[['Selesai', stats.completedOrders], ['Menunggu', stats.pendingOrders], ['Dibatalkan', stats.cancelledOrders]].map(([label, count]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div></section>
  </>;
}

function CustomersPage() {
  const { data } = useDemoStore(); const totals = customerTotals(data.orders);
  const [query, setQuery] = useState(''); const [page, setPage] = useState(1); const [selected, setSelected] = useState(null); const pageSize = 8;
  const filtered = data.customers.filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  const customer = selected && data.customers.find((item) => item.id === selected);
  const related = customer ? data.orders.filter((order) => order.customerId === customer.id).sort((a, b) => b.placedAt.localeCompare(a.placedAt)) : [];
  return <>
    <PageTitle eyebrow="Relasi" title="Pelanggan" copy="Identitas di halaman ini dibuat khusus untuk demo. Nilai belanja memakai pesanan lunas dan selesai."/>
    <section className="admin-panel admin-table-panel"><div className="admin-toolbar"><label className="admin-search"><span className="sr-only">Cari pelanggan</span><SmoothInput value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari nama atau email demo"/></label><span className="admin-result-count">{filtered.length} pelanggan demo</span></div>
      {shown.length ? <><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Nama</th><th>Email fiktif</th><th>Pesanan diakui</th><th>Total belanja diakui</th><th></th></tr></thead><tbody>{shown.map((person) => { const total = totals.get(person.id) || { count: 0, spending: 0 }; return <tr key={person.id}><td><strong>{person.name}</strong></td><td>{person.email}</td><td>{total.count}</td><td>{formatRupiah(total.spending)}</td><td><button className="admin-row-view" type="button" onClick={() => setSelected(person.id)}>Lihat detail</button></td></tr>; })}</tbody></table></div><Pager page={page} pages={pages} onChange={setPage} label={`Menampilkan ${shown.length} dari ${filtered.length} pelanggan`}/></> : <EmptyState title="Pelanggan tidak ditemukan" copy="Coba nama atau alamat email demo lain."/>}
    </section>
    {customer && <Modal title={customer.name} description={`Profil simulasi · Bergabung ${formatDate(customer.joinedAt)}`} onClose={() => setSelected(null)} size="admin-modal--wide"><div className="admin-customer-detail"><div className="admin-detail-grid"><div><span>Email demo</span><strong>{customer.email}</strong></div><div><span>Pesanan lunas dan selesai</span><strong>{(totals.get(customer.id) || { count: 0 }).count}</strong></div><div><span>Total belanja diakui</span><strong>{formatRupiah((totals.get(customer.id) || { spending: 0 }).spending)}</strong></div></div><h3>Riwayat pesanan</h3>{related.length ? <div className="admin-customer-orders">{related.map((order) => <div key={order.id}><div><strong>{order.number}</strong><small>{formatDate(order.placedAt)} · {order.items.length} jenis item</small></div><div><Badge tone={order.fulfillmentStatus}>{fulfillmentLabels[order.fulfillmentStatus]}</Badge><b>{formatRupiah(order.total)}</b></div></div>)}</div> : <p className="admin-soft-copy">Belum ada pesanan demo untuk pelanggan ini.</p>}</div></Modal>}
  </>;
}

function SettingsPage({ notify }) {
  const { data, persisted, reset, setNotice } = useDemoStore(); const [confirm, setConfirm] = useState(false);
  return <>
    <PageTitle eyebrow="Preferensi" title="Pengaturan" copy="Informasi toko dan opsi untuk sesi demo ini."/>
    <div className="admin-settings-grid"><section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Profil toko</p><h2>Ruma Coffee</h2><p>Informasi contoh untuk tampilan admin.</p></div></header><dl className="admin-settings-list"><div><dt>Nama toko</dt><dd>Ruma Coffee</dd></div><div><dt>Alamat</dt><dd>Baleendah, Bandung, Jawa Barat</dd></div><div><dt>Jam operasional</dt><dd>09.00–23.00 WIB</dd></div><div><dt>Mode</dt><dd><Badge tone="success">Demo publik</Badge></dd></div></dl></section>
      <section className="admin-panel"><header className="admin-panel__head"><div><p className="admin-eyebrow">Data browser</p><h2>Sesi demo</h2><p>Perubahan disimpan secara lokal pada browser ini.</p></div></header><div className="admin-persistence"><span className={`admin-persistence__mark ${persisted ? 'is-ready' : ''}`} aria-hidden="true"/><div><strong>{persisted ? 'Penyimpanan lokal aktif' : 'Sesi sementara'}</strong><p>{persisted ? 'Data demo bertahan setelah halaman dimuat ulang di browser ini.' : 'Browser tidak mengizinkan penyimpanan lokal. Demo tetap bisa digunakan sampai tab ditutup.'}</p></div></div><div className="admin-data-counts"><div><strong>{data.products.length}</strong><span>Produk</span></div><div><strong>{data.orders.length}</strong><span>Pesanan</span></div><div><strong>{data.customers.length}</strong><span>Pelanggan demo</span></div></div><button className="admin-button admin-button--danger" type="button" onClick={() => setConfirm(true)}>Reset data demo</button></section></div>
    <section className="admin-demo-explainer"><div><span className="admin-demo-label">DEMO MODE</span><h2>Data contoh, tindakan simulasi</h2><p>Nama pelanggan, produk, dan pesanan di sini adalah data fiktif. Tidak ada akun admin sungguhan, pembayaran, atau sistem toko yang terhubung. Perubahan hanya memengaruhi data demo pada browser ini.</p></div></section>
    {confirm && <Modal title="Reset data demo?" description="Semua produk yang ditambahkan atau diedit akan dikembalikan ke dataset contoh awal. Tindakan ini tidak dapat dibatalkan." onClose={() => setConfirm(false)}><div className="admin-confirm-actions"><button className="admin-button admin-button--quiet" type="button" onClick={() => setConfirm(false)}>Batal</button><button className="admin-button admin-button--danger" type="button" onClick={() => { reset(); setConfirm(false); notify('Data demo dikembalikan ke dataset awal.'); }}>Reset data</button></div></Modal>}
  </>;
}

export default function AdminDemo() {
  const [page, setPage] = useState('overview'); const [navOpen, setNavOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const [toast, setToast] = useState('');
  const toastTimer = React.useRef(0);
  const { notice, setNotice } = useDemoStore();
  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Admin demo | Ruma Coffee';
    return () => { document.title = previousTitle; window.clearTimeout(toastTimer.current); };
  }, []);
  const notify = (message) => { setToast(message); window.clearTimeout(toastTimer.current); toastTimer.current = window.setTimeout(() => setToast(''), 3500); };
  const pages = { overview: <OverviewPage setPage={setPage}/>, products: <ProductsPage notify={notify}/>, orders: <OrdersPage notify={notify}/>, reports: <ReportsPage/>, customers: <CustomersPage/>, settings: <SettingsPage notify={notify}/> };
  return <div className={`admin-app ${collapsed ? 'is-collapsed' : ''}`}>
    <aside className={`admin-sidebar ${navOpen ? 'is-open' : ''}`}>
      <div className="admin-sidebar__header"><a className="admin-brand" href="/" aria-label="Kembali ke situs Ruma Coffee"><img className="admin-brand__wide" src="/assets/logo horizontal colored.svg" alt="Ruma Coffee"/><img className="admin-brand__compact" src="/assets/logo vertical colored.svg" alt=""/></a><button className="admin-sidebar-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Lebarkan menu" : "Ciutkan menu"} title={collapsed ? "Lebarkan menu" : "Ciutkan menu"}><Icon name="collapse"/></button></div>
      <div className="admin-sidebar__caption">TOKO</div>
      <nav aria-label="Navigasi admin">{Object.entries(pageNames).map(([key, label]) => <button className={`admin-nav-link ${page === key ? 'is-active' : ''}`} type="button" key={key} onClick={() => { setPage(key); setNavOpen(false); }} aria-label={collapsed ? label : undefined} title={collapsed ? label : undefined} aria-current={page === key ? 'page' : undefined}><Icon name={key}/><span>{label}</span></button>)}</nav>
      <div className="admin-sidebar__bottom"><span className="admin-demo-label">{collapsed ? 'DEMO' : 'DEMO MODE'}</span><p>Data dan transaksi pada dashboard ini disimulasikan.</p><a href="/" className="admin-back-link"><span aria-hidden="true">←</span><span>Lihat situs publik</span></a></div>
    </aside>
    {navOpen && <button type="button" className="admin-nav-backdrop" aria-label="Tutup menu navigasi" onClick={() => setNavOpen(false)}/>}
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" type="button" aria-expanded={navOpen} onClick={() => setNavOpen((value) => !value)}><span aria-hidden="true">☰</span> Menu</button><div className="admin-breadcrumb"><span>Ruma Coffee</span><span aria-hidden="true">/</span><strong>{pageNames[page]}</strong></div><span className="admin-topbar__demo">DEMO MODE</span><a className="admin-topbar__site" href="/">Situs publik</a></header>
      <div className="admin-content">{notice && <div className="admin-inline-notice" role="status"><span>{notice}</span><button type="button" aria-label="Tutup pemberitahuan" onClick={() => setNotice('')}>×</button></div>}{pages[page]}</div>
    </main>
    {toast && <div className="admin-toast" role="status" aria-live="polite">{toast}</div>}
  </div>;
}

export function AdminDemoRoute() {
  return <DemoStoreProvider><AdminDemo/></DemoStoreProvider>;
}
