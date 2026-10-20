import React from 'react';
import './site-header.css';

const A = '/assets/';

export default function SiteHeader({ page, onNavigate, cartCount = 0, onCart }) {
  const navigate = (event, path, anchor = '') => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path, anchor);
  };

  return (
    <header className="site-header">
      <a className="site-header__brand" href="/" aria-label="Ruma Coffee, Home" onClick={(event) => navigate(event, '/', '#home')}>
        <img src={`${A}logo horizontal white.svg`} alt="Ruma Coffee" />
      </a>
      <nav aria-label="Navigasi utama">
        <a href="/" aria-current={page === 'home' ? 'page' : undefined} onClick={(event) => navigate(event, '/', '#home')}>Home</a>
        <a href="/menu" aria-current={page === 'menu' ? 'page' : undefined} onClick={(event) => navigate(event, '/menu', page === 'menu' ? '#catalog' : '')}>Menu</a>
        <a href="/#about" onClick={(event) => navigate(event, '/', '#about')}>Our Story</a>
        <a href="/menu#stamps" onClick={(event) => navigate(event, '/menu', '#stamps')}>Stamp</a>
      </nav>
      {page === 'menu' && <button className="site-header__cart" type="button" onClick={onCart}>Keranjang <span>{cartCount}</span></button>}
    </header>
  );
}
