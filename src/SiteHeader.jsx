import React from 'react';
import './site-header.css';
import { siteUrl } from './lib/siteUrl.js';

const A = `${import.meta.env.BASE_URL}assets/`;

export default function SiteHeader({ page, onNavigate, cartCount = 0, onCart }) {
  const navigate = (event, path, anchor = '') => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(path, anchor);
  };

  return (
    <header className="site-header">
      <a className="site-header__brand" href={siteUrl('/')} aria-label="Ruma Coffee, Home" onClick={(event) => navigate(event, '/', '#home')}>
        <img src={`${A}logo horizontal white.svg`} alt="Ruma Coffee" />
      </a>
      <nav aria-label="Navigasi utama">
        <a href={siteUrl('/')} aria-current={page === 'home' ? 'page' : undefined} onClick={(event) => navigate(event, '/', '#home')}>Home</a>
        <a href={siteUrl('/menu')} aria-current={page === 'menu' ? 'page' : undefined} onClick={(event) => navigate(event, '/menu', page === 'menu' ? '#catalog' : '')}>Menu</a>
        <a href={`${siteUrl('/')}#about`} onClick={(event) => navigate(event, '/', '#about')}>Our Story</a>
        <a href={`${siteUrl('/menu')}#stamps`} onClick={(event) => navigate(event, '/menu', '#stamps')}>Stamp</a>
      </nav>
      {page === 'menu' && <button className="site-header__cart" type="button" onClick={onCart}>Keranjang <span>{cartCount}</span></button>}
    </header>
  );
}
