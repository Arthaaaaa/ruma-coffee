import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MenuPage from './Menu.jsx';
import SiteHeader from './SiteHeader.jsx';
import SplitText from './components/react-bits/SplitText.tsx';
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { siteUrl } from './lib/siteUrl.js';
const AdminDemoRoute = lazy(() => import('./admin/AdminDemo.jsx').then((module) => ({ default: module.AdminDemoRoute })));
import serialKopiCard from '../Home/Category-section/assets/card/serial kopi.webp';
import serialNonKopiCard from '../Home/Category-section/assets/card/serial non-kopi.webp';
import serialSquashCard from '../Home/Category-section/assets/card/serial squash.webp';
import serialSusuCard from '../Home/Category-section/assets/card/serial susu.webp';
import serialTehCard from '../Home/Category-section/assets/card/serial teh.webp';
import serialKenyangCard from '../Home/Category-section/assets/card food/serial kenyang.webp';
import serialCemilGurihCard from '../Home/Category-section/assets/card food/serial cemil gurih.webp';
import serialCemilManisCard from '../Home/Category-section/assets/card food/serial cemil manis.webp';
import serialDimsumCard from '../Home/Category-section/assets/card food/serial dimsum.webp';
import pauseIcon from '../Home/PilihKami-section/icons/PilihKami-section/icons/ruang untuk jeda icon.svg';
import meetingIcon from '../Home/PilihKami-section/icons/PilihKami-section/icons/tempat untuk bertemu icon.svg';
import menuIcon from '../Home/PilihKami-section/icons/PilihKami-section/icons/menu untuk menemani icon.svg';
import bubbleChatOne from '../Home/DariHati-section/bubblechat/bubblechat 1.webp';
import bubbleChatTwo from '../Home/DariHati-section/bubblechat/bubblechat 2.webp';
import bubbleChatThree from '../Home/DariHati-section/bubblechat/bubblechat 3.webp';
import bubbleChatFour from '../Home/DariHati-section/bubblechat/bubblechat 4.webp';
import onecupIcon from '../Home/PilihKami-section/icons/PilihKami-section/icons/pilihan satu cangkir icon.svg';
import aboutExterior from '../Home/AboutUs-section/assets/img/halaman ruma.webp';
import aboutInterior from '../Home/AboutUs-section/assets/img/indoor ruma.jpg';
import aboutCounter from '../Home/AboutUs-section/assets/img/kasir ruma.jpg';

const A = `${import.meta.env.BASE_URL}assets/`;
const loadingAnimation = `${A}ruma-loading.webp`;
const logoAnimation = `${A}ruma-logo-intro.webp`;
const logoFinalFrame = `${A}ruma-logo-intro-final.webp`;
const mapUrl = 'https://maps.google.com/?q=Ruma+Coffee%2C+Baleendah%2C+Bandung%2C+Jawa+Barat+40111';

function getRoute(pathname) {
  const base = import.meta.env.BASE_URL;
  const path = pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname;
  return path.startsWith('/projects/ruma-coffee/admin-demo') ? 'admin' : path === '/menu' ? 'menu' : 'home';
}

const drinks = [
  { name: 'Serial Kopi', items: [['Aren Latte', 'aren-latte-Dba9l82l.webp'], ['Lemon Coffee', 'lemon-coffee-CFICvXBv.webp'], ['Matcha Latte', 'matcha-latte-DVgaOEKo.webp'], ['Vanilla Latte', 'vanilla-latte-DMtXvjBl.webp']] },
  { name: 'Serial Non-Kopi', items: [['Dark Choco', 'dark-choco-kxvpftjW.webp'], ['Red Velvet', 'red-velvet-dVex4R-R.webp'], ['Taro', 'taro-CF5CmhTy.webp']] },
  { name: 'Serial Teh', items: [['Thai Tea', 'thaitea-DdjwyBec.webp'], ['Lemon Tea', 'lemon-tea-DenNAq7R.webp'], ['Ice Tea', 'ice-tea-RK1VxrvC.webp']] },
  { name: 'Serial Squash', items: [['Leci Squash', 'lecy-squash-ao9WYVxG.webp'], ['Mango Squash', 'mango-squash-C6PgaYzz.webp'], ['Strawberry Squash', 'strawberry-squash-CDRkASga.webp']] },
  { name: 'Serial Susu', items: [['Blueberry Milk', 'blueberry-milk-C2qf0h7j.webp'], ['Strawberry Milk', 'strawberry-milk-DyX8INrd.webp']] },
];

const foods = [
  { name: 'Serial Kenyang', items: [['Nasi Ayam', 'nasi-ayam-BtcRpuQF.webp'], ['Nasi Goreng', 'nasi-goreng-fXq2QEV6.webp']] },
  { name: 'Serial Cemil Gurih', items: [['Cireng Rujak', 'cireng-rujak-qJLbhZAq.webp'], ['Mix Platter', 'mix-platter-DprTB_lp.webp'], ['Sosis Kentang', 'sosis-kentang-CB0tKj4S.webp'], ['Tahu Lada Garam', 'tahu-lada-garam-CK7oI0HL.webp']] },
  { name: 'Serial Cemil Manis', items: [['Pisang Caramel', 'pisang-caramel-B7QNf17n.webp'], ['Pisang Keju', 'pisang-keju-BbzbDGOE.webp']] },
  { name: 'Serial Dimsum', items: [['Dimsum Ayam', 'dimsum-ayam-MddOws8S.webp']] },
];

const drinkCategoryCards = [
  { name: 'Serial Kopi', image: serialKopiCard },
  { name: 'Serial Non-Kopi', image: serialNonKopiCard },
  { name: 'Serial Teh', image: serialTehCard },
  { name: 'Serial Squash', image: serialSquashCard },
  { name: 'Serial Susu', image: serialSusuCard },
];

const foodCategoryCards = [
  { name: 'Serial Kenyang', image: serialKenyangCard },
  { name: 'Serial Cemil Gurih', image: serialCemilGurihCard },
  { name: 'Serial Cemil Manis', image: serialCemilManisCard },
  { name: 'Serial Dimsum', image: serialDimsumCard },
];

const heroDrinks = [
  { file: 'americano-DDQS2Kk-.webp', name: 'Americano dingin' },
  { file: 'matcha-COCACD8y.webp', name: 'Matcha latte dingin' },
  { file: 'coffee milk-CqiN21M0.webp', name: 'Kopi susu dingin' },
  { file: 'thaitea-DdjwyBec.webp', name: 'Thai tea dingin' },
];

function waitForHeroImages() {
  return Promise.all(heroDrinks.map(({ file }) => new Promise((resolve) => {
    const image = new Image();
    const finish = () => resolve();
    image.onload = finish;
    image.onerror = finish;
    image.src = `${A}${file}`;
    if (image.complete) finish();
  })));
}

const benefits = [
  { title: 'Ruang untuk jeda', copy: 'Singgah sebentar atau duduk lebih lama, sesuai waktumu.', icon: pauseIcon },
  { title: 'Pilihan satu cangkir', copy: 'Kopi, teh, squash, dan susu hadir untuk selera yang berbeda.', icon: onecupIcon },
  { title: 'Tempat untuk bertemu', copy: 'Berbagi meja, cerita, dan waktu dengan orang terdekat.', icon: meetingIcon },
  { title: 'Menu untuk menemani', copy: 'Minuman dan hidangan ringan untuk mengisi sela hari.', icon: menuIcon },
];

const splitTextProps = {
  effect: 'rise',
  splitType: 'chars',
  delay: 40,
  duration: 0.65,
  staggerFrom: 'random',
  trigger: 'view',
  hoverEffect: 'lift',
  loop: false,
  loopDelay: 1.5,
  mask: false,
  threshold: 0.1,
  rootMargin: '-100px',
  textAlign: 'center'
};

function IntroSequence() {
  const [phase, setPhase] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'loading'
  );
  const [loadingReady, setLoadingReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    if (phase === 'loading' && loadingReady) {
      const timer = window.setTimeout(() => setPhase('logo-loading'), 5200);
      return () => window.clearTimeout(timer);
    }
    if (phase === 'logo' && logoReady) {
      const timer = window.setTimeout(() => {
        waitForHeroImages().then(() => setPhase('revealing'));
      }, 4300);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [phase, loadingReady, logoReady]);

  if (phase === 'done') return null;

  return (
    <div
      className={`intro-sequence${phase === 'revealing' ? ' intro-sequence--revealing' : ''}`}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setPhase('done');
      }}
    >
      {phase !== 'revealing' && <img className={`intro-sequence__artwork${phase === 'loading' || phase === 'logo-loading' ? ' is-visible' : ''}`} src={loadingAnimation} alt="" onLoad={() => setLoadingReady(true)} onError={() => setPhase('logo-loading')} />}
      {(phase === 'logo-loading' || phase === 'logo') && <img className={`intro-sequence__artwork${phase === 'logo' ? ' is-visible' : ''}`} src={logoAnimation} alt="" onLoad={() => { setLogoReady(true); setPhase('logo'); }} onError={() => { waitForHeroImages().then(() => setPhase('revealing')); }} />}
      {phase === 'revealing' && <img className="intro-sequence__artwork is-visible" src={logoFinalFrame} alt="" />}
    </div>
  );
}

function AdminLoadingState() {
  return (
    <div className="admin-loading-state" role="status">
      <img src={loadingAnimation} className="admin-loading-state__artwork" alt="" />
      <span>Memuat dashboard…</span>
    </div>
  );
}

function LeafDivider({ className = '' }) {
  return <img className={`leaf-divider ${className}`} src={`${A}daun menjalar-BxMyafDX.svg`} alt="" aria-hidden="true" />;
}

function GooeyBlobs() {
  return <span className="gooey-button__blobs" aria-hidden="true"><span /><span /><span /></span>;
}

function KineticTextReveal({ text, className = '' }) {
  let wordIndex = 0;

  return (
    <span className={`kinetic-text ${className}`}>
      {text.split(/(\s+)/).map((part, index) => {
        if (/^\s+$/.test(part)) return <span key={`space-${index}`}>{part}</span>;
        const currentIndex = wordIndex++;
        return (
          <span className="kinetic-text__mask" key={`word-${index}`}>
            <span className="kinetic-text__word" style={{ '--kinetic-index': currentIndex }}>{part}</span>
          </span>
        );
      })}
    </span>
  );
}

function SplitHeading({ id, lines }) {
  return (
    <h2 id={id} aria-label={lines.join(' ')}>
      {lines.map((text, index) => (
        <SplitText {...splitTextProps} key={`${id}-${index}`} tag="span" className="split-heading-line" text={text} />
      ))}
    </h2>
  );
}

function RevealBadge({ children, className = '', delay = 0, tag: Tag = 'span' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduceMotion = useReducedMotion();

  return (
    <Tag
      ref={ref}
      className={`in-view-bounce${inView || reduceMotion ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--bounce-delay': `${reduceMotion ? 0 : delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function ScrollRevealWord({ word, index, count, progress, mode, inView, reduceMotion, effect, duration, stagger, baseOpacity, blurStrength, highlightColor }) {
  const span = Math.max(0.05, duration);
  const total = span + Math.max(0, count - 1) * Math.max(0, stagger);
  const start = index * Math.max(0, stagger) / total;
  const end = Math.min(1, start + span / total);
  const opacity = useTransform(progress, [start, Math.max(start + 0.001, end)], [baseOpacity, 1], { clamp: true });
  const blur = useTransform(progress, [start, Math.max(start + 0.001, end)], [blurStrength, 0], { clamp: true });
  const scrubFilter = useTransform(blur, (value) => `blur(${value.toFixed(2)}px)`);
  const y = useTransform(progress, [start, Math.max(start + 0.001, end)], [effect === 'rise' ? '0.8em' : '0em', '0em'], { clamp: true });

  if (mode === 'enter') {
    return (
      <motion.span
        className="scroll-reveal__word"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: baseOpacity, y: effect === 'rise' ? 18 : 0, filter: `blur(${blurStrength}px)` }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: baseOpacity, y: effect === 'rise' ? 18 : 0, filter: `blur(${blurStrength}px)` }}
        transition={{ duration: reduceMotion ? 0 : span, delay: reduceMotion ? 0 : index * Math.max(0, stagger), ease: 'easeOut' }}
        style={highlightColor ? { color: highlightColor } : undefined}
      >
        {word}
      </motion.span>
    );
  }

  return (
    <motion.span
      className="scroll-reveal__word"
      aria-hidden="true"
      style={reduceMotion ? { opacity: 1 } : { opacity, filter: scrubFilter, y }}
    >
      {word}
    </motion.span>
  );
}

function ScrollReveal({ text, className = '', tag: Tag = 'p', mode = 'scrub', splitBy = 'words', effect = 'fade', stagger = 0.05, duration = 0.8, baseOpacity = 0.1, baseRotation = 0, baseOffset = 0, enableBlur = true, blurStrength = 4, highlightColor = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 45%'] });
  const rotation = useTransform(scrollYProgress, [0, 1], [baseRotation, 0]);
  const tokens = text.split(/(\n|[^\S\n]+)/);
  const words = tokens.filter((part) => part && !/^\s+$/.test(part));
  const gap = splitBy === 'chars' ? 0.015 : stagger;
  const blur = enableBlur ? blurStrength : 0;
  const count = splitBy === 'chars' ? words.reduce((sum, item) => sum + Array.from(item).length, 0) : words.length;
  let wordIndex = 0;

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal ${className}`.trim()}
      aria-label={text.replace(/\s+/g, ' ').trim()}
      style={mode === 'scrub' && !reduceMotion && baseRotation ? { rotate: rotation } : undefined}
    >
      <span aria-hidden="true">
        {tokens.map((part, index) => {
          if (part === '\n') return <br key={`line-${index}`} />;
          if (/^\s+$/.test(part)) return part;
          const revealText = splitBy === 'chars' ? Array.from(part) : [part];
          return revealText.map((word, characterIndex) => (
            <ScrollRevealWord
              key={`${index}-${characterIndex}`}
              word={word}
              index={wordIndex++}
              count={count}
              progress={scrollYProgress}
              mode={mode}
              inView={inView}
              reduceMotion={reduceMotion}
              effect={effect}
              duration={duration}
              stagger={gap}
              baseOpacity={baseOpacity}
              blurStrength={blur}
              highlightColor={highlightColor}
            />
          ));
        })}
      </span>
    </Tag>
  );
}

function ScrollRevealImage({ src, alt = '', className = '', baseOpacity = 0.1, baseRotation = 3, blurStrength = 4 }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 45%'] });
  const opacity = useTransform(scrollYProgress, [0, 1], [baseOpacity, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [blurStrength, 0]);
  const filter = useTransform(blur, (value) => `blur(${value.toFixed(2)}px)`);
  const rotate = useTransform(scrollYProgress, [0, 1], [baseRotation, 0]);

  return <motion.img ref={ref} className={className} src={src} alt={alt} aria-hidden={alt ? undefined : true} style={reduceMotion ? { opacity: 1 } : { opacity, filter, rotate }} />;
}

function CraftScrollVideo() {
  const videoRef = React.useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = video?.closest('.craft');
    if (!video || !section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let animationFrame = 0;
    const syncFrame = () => {
      animationFrame = 0;
      if (!video.duration || !Number.isFinite(video.duration)) return;

      const bounds = section.getBoundingClientRect();
      const distance = bounds.height + window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / distance));
      const nextTime = progress * video.duration;

      if (Math.abs(video.currentTime - nextTime) > 1 / 60) video.currentTime = nextTime;
    };
    const scheduleSync = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(syncFrame);
    };

    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);
    video.addEventListener('loadedmetadata', scheduleSync);
    scheduleSync();

    return () => {
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      video.removeEventListener('loadedmetadata', scheduleSync);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <>
    <svg className="craft__filter-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="vine-black-key" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  3 3 3 0 -0.15" />
        </filter>
      </defs>
    </svg>
    <video ref={videoRef} className="craft__leaves" src={`${A}daun-menjalar-scroll.mp4`} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
  </>;
}

function useScrollParallax(imageRef, strength = 22, enabled = true) {
  useEffect(() => {
    const image = imageRef.current;
    if (!image || !enabled) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const panel = image.parentElement;
      if (!panel || reducedMotion.matches) {
        image.style.setProperty('--parallax-y', '0px');
        return;
      }

      const bounds = panel.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const distance = (bounds.top + bounds.height / 2 - window.innerHeight / 2)
        / (window.innerHeight / 2 + bounds.height / 2);
      const offset = Math.max(-1, Math.min(1, distance)) * strength * -1;
      image.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`);
    };
    const scheduleUpdate = () => {
      if (frame || reducedMotion.matches) return;
      frame = window.requestAnimationFrame(update);
    };
    const handleMotionChange = () => {
      if (reducedMotion.matches) image.style.setProperty('--parallax-y', '0px');
      else scheduleUpdate();
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    reducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      reducedMotion.removeEventListener('change', handleMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      image.style.removeProperty('--parallax-y');
    };
  }, [enabled, imageRef, strength]);
}

function useScrollReveal(sectionRef, enabled = true, rootMargin = '0px 0px -8% 0px') {
  const [revealState, setRevealState] = useState({ ready: false, visible: false });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setRevealState({ ready: true, visible: true });
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealState({ ready: true, visible: true });
        observer.disconnect();
      } else {
        setRevealState((current) => current.ready ? current : { ready: true, visible: false });
      }
    }, { threshold: 0.12, rootMargin });
    observer.observe(section);
    return () => observer.disconnect();
  }, [enabled, sectionRef, rootMargin]);

  return revealState;
}

function useAboutPhotoProgress(trackRef, enabled = true) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !enabled) return undefined;

    const layers = Array.from(track.querySelectorAll('.about__photo-layer'));
    const ranges = [[-0.1, 0], [0.34, 0.48], [0.68, 0.82]];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const paint = () => {
      frame = 0;
      if (reducedMotion.matches) {
        layers.forEach((layer) => { layer.style.clipPath = 'inset(0)'; });
        return;
      }

      const travel = Math.max(1, track.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / travel));
      layers.forEach((layer, index) => {
        const [start, end] = ranges[index];
        const linear = Math.min(1, Math.max(0, (progress - start) / (end - start)));
        const reveal = linear * linear * (3 - 2 * linear);
        layer.style.clipPath = `inset(${((1 - reveal) * 100).toFixed(2)}% 0 0)`;
      });
    };

    const schedulePaint = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const handleMotionChange = () => schedulePaint();

    paint();
    window.addEventListener('scroll', schedulePaint, { passive: true });
    window.addEventListener('resize', schedulePaint);
    reducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('scroll', schedulePaint);
      window.removeEventListener('resize', schedulePaint);
      reducedMotion.removeEventListener('change', handleMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      layers.forEach((layer) => { layer.style.removeProperty('clip-path'); });
    };
  }, [enabled, trackRef]);
}

function CraftTiltImage({ className, src, alt, imageClassName = '', cursorPreview = false }) {
  const [previewPoint, setPreviewPoint] = useState(null);

  function updateTilt(event) {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frame = event.currentTarget;
    const bounds = frame.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    if (cursorPreview) {
      const previewWidth = 180;
      const previewHeight = 224;
      let left = event.clientX + 18;
      let top = event.clientY + 18;
      if (left + previewWidth > window.innerWidth - 12) left = event.clientX - previewWidth - 18;
      if (top + previewHeight > window.innerHeight - 12) top = event.clientY - previewHeight - 18;
      setPreviewPoint({ left: Math.max(12, left), top: Math.max(12, top) });
    }

    frame.style.setProperty('--tilt-x', `${(x - 0.5) * 20}deg`);
    frame.style.setProperty('--tilt-y', `${(0.5 - y) * 20}deg`);
    frame.style.setProperty('--glare-x', `${x * 100}%`);
    frame.style.setProperty('--glare-y', `${y * 100}%`);
    frame.dataset.tiltActive = 'true';
  }

  function resetTilt(event) {
    const frame = event.currentTarget;
    frame.style.setProperty('--tilt-x', '0deg');
    frame.style.setProperty('--tilt-y', '0deg');
    frame.dataset.tiltActive = 'false';
    if (cursorPreview) setPreviewPoint(null);
  }

  return (
    <div className={`craft__tilt ${className}`} onPointerMove={updateTilt} onPointerLeave={resetTilt}>
      <img className={imageClassName} src={src} alt={alt} loading="lazy" />
      <span className="craft__tilt-glare" aria-hidden="true" />
      {cursorPreview && previewPoint && createPortal(
        <img className="community__cursor-preview" src={src} alt="" aria-hidden="true" style={{ left: `${previewPoint.left}px`, top: `${previewPoint.top}px` }} />,
        document.body,
      )}
    </div>
  );
}

function MagneticBubble({ className, src, alt }) {
  function moveWithPointer(event) {
    if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    event.currentTarget.style.setProperty('--magnet-x', `${x}px`);
    event.currentTarget.style.setProperty('--magnet-y', `${y}px`);
  }

  function resetMagnet(event) {
    event.currentTarget.style.setProperty('--magnet-x', '0px');
    event.currentTarget.style.setProperty('--magnet-y', '0px');
  }

  return <img className={`community__bubble ${className}`} src={src} alt={alt} loading="lazy" onPointerMove={moveWithPointer} onPointerLeave={resetMagnet} />;
}

function CommunityActions() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="community__actions" role="group" aria-label="Interaksi dengan momen Ruma">
      <button className={`community__action community__action--heart${liked ? ' is-active' : ''}`} type="button" aria-label={liked ? 'Batalkan suka' : 'Sukai momen ini'} aria-pressed={liked} onClick={() => setLiked((value) => !value)}>
        <svg className="community__icon-outline" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" /></svg>
        <svg className="community__icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 1.917a6.4 6.4 0 0 0-5.5 3.3 6.4 6.4 0 0 0-5.5-3.3A6.8 6.8 0 0 0 0 8.967c0 4.547 4.786 9.513 8.8 12.88a4.974 4.974 0 0 0 6.4 0C19.214 18.48 24 13.514 24 8.967a6.8 6.8 0 0 0-6.5-7.05Z" /></svg>
        <svg className="community__icon-celebrate" viewBox="0 0 100 100" aria-hidden="true"><polygon points="10,10 20,20" /><polygon points="10,50 20,50" /><polygon points="20,80 30,70" /><polygon points="90,10 80,20" /><polygon points="90,50 80,50" /><polygon points="80,80 70,70" /></svg>
      </button>
      <span className="community__action community__action--message" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M26 15.5a11 11 0 0 1-11 11 11.7 11.7 0 0 1-4.7-1l-6.3 1 1.2-5.8a11 11 0 1 1 20.8-5.2Z" /></svg></span>
      <span className="community__action community__action--send" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="m28 4-9.2 24-5-10.1L4 13 28 4Z" /><path d="m13.8 17.9 7.5-7.4" /></svg></span>
      <button className={`community__action community__action--save${saved ? ' is-active' : ''}`} type="button" aria-label={saved ? 'Hapus momen tersimpan' : 'Simpan momen'} aria-pressed={saved} onClick={() => setSaved((value) => !value)}>
        <svg className="community__icon-outline" viewBox="0 0 24 28" aria-hidden="true"><path d="M4 2h16v24l-8-5-8 5V2Z" /></svg>
        <svg className="community__icon-filled" viewBox="0 0 24 28" aria-hidden="true"><path d="M4 2h16v24l-8-5-8 5V2Z" /></svg>
      </button>
    </div>
  );
}

function HeroDrinkCarousel() {
  const [order, setOrder] = useState(heroDrinks);
  const [phase, setPhase] = useState('idle');
  const transitionDuration = 1300;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let transitionTimeout;
    let resetTimeout;
    const interval = window.setInterval(() => {
      setPhase('moving');
      transitionTimeout = window.setTimeout(() => {
        setOrder((current) => [...current.slice(1), current[0]]);
        setPhase('reset');
        resetTimeout = window.setTimeout(() => setPhase('idle'), 50);
      }, transitionDuration);
    }, 4200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(transitionTimeout);
      window.clearTimeout(resetTimeout);
    };
  }, []);

  const slots = phase === 'moving'
    ? ['off-left', 'left', 'center', 'right']
    : ['left', 'center', 'right', 'off-right'];

  return (
    <div className="hero__drinks" role="group" aria-label="Minuman pilihan Ruma Coffee" aria-roledescription="carousel">
      {order.map((drink, index) => (
        <img
          key={drink.file}
          className={`hero__drink hero__drink--${slots[index]}${phase === 'reset' ? ' hero__drink--reset' : ''}`}
          src={`${A}${drink.file}`}
          alt={drink.name}
          aria-hidden={slots[index].startsWith('off')}
          fetchPriority={index < 3 ? 'high' : 'auto'}
          draggable="false"
        />
      ))}
    </div>
  );
}

function CategoryGroup({ title, items, icon, expanded, onToggle }) {
  const isDrinkGroup = title === 'Minuman';
  const isFoodGroup = title === 'Makanan';

  return (
    <section className={`menu-group ${title === 'Makanan' ? 'menu-group--food' : ''} ${isDrinkGroup ? 'menu-group--drinks' : ''}`} aria-labelledby={`${title.toLowerCase()}-title`}>
      <div className="menu-group__heading">
        {title === 'Makanan' && <button className="text-link gooey-button" onClick={onToggle} aria-expanded={expanded}><span className="gooey-button__label">Selengkapnya ›</span><GooeyBlobs /></button>}
        <h3 id={`${title.toLowerCase()}-title`}>
          <img src={`${A}${icon}`} alt="" aria-hidden="true" />{title}
        </h3>
        {title === 'Minuman' && <button className="text-link gooey-button" onClick={onToggle} aria-expanded={expanded}><span className="gooey-button__label">Selengkapnya ›</span><GooeyBlobs /></button>}
      </div>
      {isDrinkGroup ? (
        <>
          <img className="menu-group__spotlight" src={`${A}americano-DDQS2Kk-.webp`} alt="" aria-hidden="true" />
          <div className="category-marquee" aria-label="Kategori minuman" aria-roledescription="carousel">
            <div className="category-marquee__track">
              {[false, true].map((isDuplicate) => (
                <div className="category-marquee__set" key={String(isDuplicate)} aria-hidden={isDuplicate}>
                  {drinkCategoryCards.map((category) => (
                    <article className="category category--asset" key={category.name}>
                      <img className="category__card-image" src={category.image} alt="" loading={isDuplicate ? 'lazy' : 'eager'} />
                      <h4>{category.name}</h4>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {expanded && <div className="category-marquee__products">{items.map((category) => <div key={category.name}><strong>{category.name}</strong><ul>{category.items.map(([name]) => <li key={name}>{name}</li>)}</ul></div>)}</div>}
        </>
      ) : isFoodGroup ? (
        <>
          <img className="menu-group__spotlight menu-group__spotlight--food" src={`${A}dimsum-ayam-MddOws8S.webp`} alt="" aria-hidden="true" />
          <div className="category-marquee" aria-label="Kategori makanan" aria-roledescription="carousel">
            <div className="category-marquee__track category-marquee__track--reverse">
              {[false, true].map((isDuplicate) => (
                <div className="category-marquee__set" key={String(isDuplicate)} aria-hidden={isDuplicate}>
                  {foodCategoryCards.map((category) => (
                    <article className="category category--asset" key={category.name}>
                      <img className="category__card-image" src={category.image} alt="" loading={isDuplicate ? 'lazy' : 'eager'} />
                      <h4>{category.name}</h4>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {expanded && <div className="category-marquee__products">{items.map((category) => <div key={category.name}><strong>{category.name}</strong><ul>{category.items.map(([name]) => <li key={name}>{name}</li>)}</ul></div>)}</div>}
        </>
      ) : (
        <div className="category-grid">
          {items.map((category) => (
            <article className="category" key={category.name}>
              <div className="category__image" aria-hidden="true">
                {category.items.slice(0, 3).map(([name, file], index) => (
                  <img key={name} src={`${A}${file}`} alt="" style={{ '--item-index': index }} loading="lazy" />
                ))}
              </div>
              <h4>{category.name}</h4>
              {expanded && <ul className="category__list">{category.items.map(([name]) => <li key={name}>{name}</li>)}</ul>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function App() {
  const [openMenu, setOpenMenu] = useState(null);
  const [appLocation, setAppLocation] = useState(() => ({
    pathname: window.location.pathname,
    hash: window.location.hash,
  }));
  const route = getRoute(appLocation.pathname);
  const [communityVisible, setCommunityVisible] = useState(false);
  const communityRef = React.useRef(null);
  const previousPathnameRef = useRef(null);
  const aboutTrackRef = useRef(null);
  const visitImageRef = useRef(null);
  const aboutFirstMarkerRef = useRef(null);
  const aboutSecondMarkerRef = useRef(null);
  const aboutThirdMarkerRef = useRef(null);
  const visitSectionRef = useRef(null);
  const aboutFirstReveal = useScrollReveal(aboutFirstMarkerRef, route === 'home', '-44% 0px -44% 0px');
  const aboutSecondReveal = useScrollReveal(aboutSecondMarkerRef, route === 'home', '-44% 0px -44% 0px');
  const aboutThirdReveal = useScrollReveal(aboutThirdMarkerRef, route === 'home', '-44% 0px -44% 0px');
  const visitReveal = useScrollReveal(visitSectionRef, route === 'home');
  useAboutPhotoProgress(aboutTrackRef, route === 'home');
  useScrollParallax(visitImageRef, 22, route === 'home');
  const toggleMenu = (menu) => setOpenMenu((current) => current === menu ? null : menu);

  useLayoutEffect(() => {
    const { history } = window;
    const supportsScrollRestoration = 'scrollRestoration' in history;
    const previousScrollRestoration = supportsScrollRestoration ? history.scrollRestoration : undefined;
    if (supportsScrollRestoration) history.scrollRestoration = 'manual';

    const syncLocation = () => {
      const nextLocation = { pathname: window.location.pathname, hash: window.location.hash };
      setAppLocation((current) =>
        current.pathname === nextLocation.pathname && current.hash === nextLocation.hash ? current : nextLocation,
      );
    };

    window.addEventListener('popstate', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      if (supportsScrollRestoration) history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    const routeChanged = previousPathnameRef.current !== appLocation.pathname;
    previousPathnameRef.current = appLocation.pathname;
    if (routeChanged) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (!appLocation.hash) return undefined;
    const anchor = appLocation.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [appLocation.pathname, appLocation.hash]);

  const navigate = (path, anchor = '') => {
    const href = `${siteUrl(path)}${anchor}`;
    const currentPathname = window.location.pathname;
    const nextLocation = new URL(href, window.location.href);
    window.history.pushState({}, '', href);

    if (nextLocation.pathname !== currentPathname) {
      setAppLocation({ pathname: nextLocation.pathname, hash: nextLocation.hash });
    } else if (anchor) {
      window.setTimeout(() => {
        document.getElementById(anchor.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  useEffect(() => {
    const section = communityRef.current;
    if (!section) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setCommunityVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCommunityVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (route === 'menu') return <><IntroSequence /><MenuPage onHome={(anchor) => navigate('/', anchor)} onNavigate={navigate} /></>;
  if (route === 'admin') return <><IntroSequence /><Suspense fallback={<AdminLoadingState />}><AdminDemoRoute /></Suspense></>;

  return (
    <>
      <IntroSequence />
      <svg className="gooey-filter-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey-button-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <SiteHeader page="home" onNavigate={navigate} />
      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero__gradient" aria-hidden="true" />
          <div className="hero__brand">
            <LeafDivider />
            <img src={`${A}logo vertical colored-BKs3bmJh.svg`} alt="Ruma Coffee" />
            <LeafDivider className="leaf-divider--flip" />
          </div>
          <div className="hero__headline" id="hero-title">
            <SplitText {...splitTextProps} tag="p" text="MORE THAN" />
            <SplitText {...splitTextProps} tag="h1" text="COFFEE" />
          </div>
          <HeroDrinkCarousel />
          <div className="hero__promise">
            <div className="hero__promise-content">
              <h2>
                <span className="hero__promise-line">A <span>PLACE</span></span>
                <span className="hero__promise-line hero__promise-line--second"><span className="hero__promise-to">TO</span>COME <span>HOME</span></span>
              </h2>
              <img src={`${A}coffee beans-Dp4H_XDE.webp`} alt="Biji kopi" />
            </div>
          </div>
        </section>

        <section className="about" id="about" aria-labelledby="about-title">
          <div ref={aboutTrackRef} className="about__scroll-track">
            <div className="about__sticky-stage">
              <div className="about__photo-stack">
                <div className="about__photo-layer about__photo-layer--first">
                  <img className="about__image" src={aboutExterior} alt="Teras Ruma Coffee di bawah pepohonan" fetchPriority="high" />
                  <div className="about__shade" />
                </div>
                <div className="about__photo-layer about__photo-layer--second">
                  <img className="about__image" src={aboutInterior} alt="Area duduk dan ruang dalam Ruma Coffee" loading="lazy" />
                  <div className="about__shade" />
                </div>
                <div className="about__photo-layer about__photo-layer--third">
                  <img className="about__image" src={aboutCounter} alt="Bar kopi dan mesin espresso di Ruma Coffee" loading="lazy" />
                  <div className="about__shade" />
                </div>
              </div>
              <div className="about__copy-stack">
                <div className={`about__copy-block about__copy-block--first${aboutFirstReveal.visible ? ' is-revealed' : ''}`}>
                  <p className="eyebrow"><KineticTextReveal text="About Us" /></p>
                  <h2 id="about-title"><KineticTextReveal text="In a world that never slows down, everyone deserves a place to pause." /></h2>
                </div>
                <div className={`about__copy-block about__copy-block--story${aboutSecondReveal.visible ? ' is-revealed' : ''}`}>
                  <p><KineticTextReveal text="Ruma Coffee was born from a simple belief: coffee is more than just a drink. It’s a reason to connect, a moment to breathe, and a little reminder that you don’t always have to keep going." /></p>
                </div>
                <div className={`about__copy-block about__copy-block--notes${aboutThirdReveal.visible ? ' is-revealed' : ''}`}>
                  <div className="about__notes" role="group" aria-label="Suasana di Ruma Coffee">
                    <span><KineticTextReveal text="No rush." /></span>
                    <span><KineticTextReveal text="No pressure." /></span>
                    <span><KineticTextReveal text="Just good coffee and a space to feel at home." /></span>
                  </div>
                </div>
              </div>
            </div>
            <span ref={aboutFirstMarkerRef} className="about__step-marker about__step-marker--first" aria-hidden="true" />
            <span ref={aboutSecondMarkerRef} className="about__step-marker about__step-marker--second" aria-hidden="true" />
            <span ref={aboutThirdMarkerRef} className="about__step-marker about__step-marker--third" aria-hidden="true" />
          </div>
        </section>

        <section className="menu-section" id="menu" aria-labelledby="menu-title">
          <div className="section-heading">
            <RevealBadge className="section-tag" delay={1500}>Kategori</RevealBadge>
            <SplitHeading id="menu-title" lines={['FAVORIT-MU', 'ADA DI SINI']} />
          </div>
          <CategoryGroup title="Minuman" items={drinks} icon="cup-minuman.svg" expanded={openMenu === 'drinks'} onToggle={() => toggleMenu('drinks')} />
          <CategoryGroup title="Makanan" items={foods} icon="sendokgarpu-makanan.svg" expanded={openMenu === 'foods'} onToggle={() => toggleMenu('foods')} />
        </section>

        <section className="craft" id="craft" aria-labelledby="craft-title">
          <div className="section-heading section-heading--wide">
            <RevealBadge className="section-tag" delay={1500}>Our Craft</RevealBadge>
            <SplitHeading id="craft-title" lines={['Made WITH Care', 'Served WITH Heart']} />
          </div>
          <div className="craft__content">
            <CraftTiltImage className="craft__beans" src={`${A}showup-coffeebeans-ytDfeKBY.webp`} alt="Biji kopi pilihan di tangan barista Ruma" />
            <CraftScrollVideo />
            <div className="craft__story craft__story--intro">
              <p>Bagi kami, kopi yang baik dimulai dari perhatian pada setiap detail. Dari karakter biji kopi, presisi proses penyeduhan, hingga cangkir yang akhirnya sampai di tanganmu.</p>
              <p>Tapi lebih dari soal rasa, kami percaya setiap cangkir punya ceritanya sendiri. Tentang obrolan yang tak terburu-buru, ide yang perlahan menemukan bentuknya, atau sekadar jeda kecil di tengah hari yang panjang.</p>
            </div>
            <div className="craft__story craft__story--closing">
              <p className="craft__closing">Di Ruma, kami membuat kopi dengan sepenuh hati agar kamu selalu punya alasan untuk berhenti sejenak dan merasa pulang.</p>
              <a className="button button--clay gooey-button" href="#menu"><span className="gooey-button__label">Explore our menu</span><GooeyBlobs /></a>
            </div>
            <CraftTiltImage className="craft__brew" src={`${A}brewing-ritual-SaYFQF19.webp`} alt="Barista menuang kopi dengan metode seduh manual" />
          </div>
        </section>

        <section className="why" aria-labelledby="why-title">
          <div className="section-heading">
            <RevealBadge className="section-tag" delay={1500}>Pilih Ruma</RevealBadge>
            <SplitHeading id="why-title" lines={['KENAPA HARUS', 'RUMA?']} />
          </div>
          <div className="benefit-grid">
            {benefits.map(({ title, copy, icon }) => <article className="benefit" key={title}>
              <img className="cup-mark" src={icon} alt="" aria-hidden="true" />
              <h3>{title}</h3><p>{copy}</p>
            </article>)}
          </div>
        </section>

        <section className="statement" aria-label="Pengingat Ruma Coffee">
          <RevealBadge className="outline-note outline-note--one">Otentik</RevealBadge>
          <RevealBadge className="outline-note outline-note--two" delay={160}>Nikmat</RevealBadge>
          <RevealBadge className="outline-note outline-note--three" delay={320}>Nyaman</RevealBadge>
          <RevealBadge className="outline-note outline-note--four" delay={480}>Pilih Kami</RevealBadge>
          <ScrollRevealImage className="statement__logo" src={`${A}logo vertical white.svg`} />
          <ScrollReveal
            tag="p"
            text={'ADA HAL-HAL YANG ABADI.\nNAMUN, BAD MOOD SEBELUM MULAI KERJA SEHARUSNYA TIDAK MENJADI SALAH SATUNYA.'}
            splitBy="words"
            effect="fade"
            mode="scrub"
            stagger={0.05}
            duration={0.8}
            baseOpacity={0.1}
            baseRotation={3}
            baseOffset={0}
            enableBlur
            blurStrength={4}
          />
          <ScrollReveal
            tag="strong"
            text="TAKE YOUR COFFEE AT RUMA."
            highlightColor="#a27b5c"
            mode="enter"
            splitBy="words"
            effect="rise"
            stagger={0.155}
            duration={0.6}
            baseOpacity={0.15}
            baseRotation={0}
            baseOffset={0}
            enableBlur
            blurStrength={4}
          />
        </section>

        <section ref={communityRef} className={`community${communityVisible ? ' is-visible' : ''}`} aria-labelledby="community-title">
          <div className="community__intro">
            <div className="section-heading section-heading--left">
              <RevealBadge className="section-tag" delay={1500}>Ruma Coffee</RevealBadge>
              <SplitHeading id="community-title" lines={['MOMEN', 'DI RUMA']} />
            </div>
            <div className="community__bubble-stack" aria-label="Cerita pengunjung Ruma">
              <MagneticBubble className="community__bubble--one" src={bubbleChatOne} alt="Testimoni @aqilaa: kopi susu Ruma terasa creamy, bold, dan jadi teman saat kuliah atau kerja." />
              <MagneticBubble className="community__bubble--two" src={bubbleChatTwo} alt="Testimoni @arthurr: suasana Ruma nyaman untuk bekerja atau mengobrol lama." />
              <MagneticBubble className="community__bubble--three" src={bubbleChatThree} alt="Testimoni @sisill: pelayanan Ruma cepat dan membuatnya ingin kembali." />
              <MagneticBubble className="community__bubble--four" src={bubbleChatFour} alt="Testimoni @claraa: kopi Ruma enak dan pelayanannya ramah." />
            </div>
            <CommunityActions />
          </div>
          <div className="community__photos" role="group" aria-label="Momen bersama di Ruma Coffee">
            <div className="community__photo-slot community__photo-slot--one">
              <CraftTiltImage className="community__photo" src={`${A}solo-peace-DQGo7RfD.webp`} alt="Pengunjung menikmati waktu di area luar Ruma Coffee" cursorPreview />
            </div>
            <div className="community__photo-slot community__photo-slot--two">
              <CraftTiltImage className="community__photo" src={`${A}trio-BnN88KgO.webp`} alt="Tiga teman menikmati minuman bersama di Ruma Coffee" cursorPreview />
            </div>
            <div className="community__photo-slot community__photo-slot--three">
              <CraftTiltImage className="community__photo" src={`${A}duo-bucin-Dzv70CKO.webp`} alt="Dua pengunjung duduk bersama di area Ruma Coffee" cursorPreview />
            </div>
            <div className="community__photo-slot community__photo-slot--four">
              <CraftTiltImage className="community__photo" src={`${A}solo-mirror-D0VYjjCd.webp`} alt="Pengunjung berfoto di area Ruma Coffee" cursorPreview />
            </div>
          </div>
        </section>

        <section ref={visitSectionRef} className={`visit${visitReveal.ready ? ' is-reveal-ready' : ''}${visitReveal.visible ? ' is-revealed' : ''}`} id="visit" aria-labelledby="visit-title">
          <div className="section-heading">
            <RevealBadge className="section-tag" delay={1500}>Location</RevealBadge>
            <SplitHeading id="visit-title" lines={['COME', 'FIND US']} />
          </div>
          <div className={`visit__panel${visitReveal.visible ? ' is-revealed' : ''}`}>
            <img ref={visitImageRef} src={`${A}inside-ZkAodWe1.webp`} alt="Ruang dalam Ruma Coffee dengan area duduk dan tanaman" loading="lazy" />
            <div className="visit__shade" />
            <div className="visit__copy">
              <h3><KineticTextReveal text="A Little Place to Feel at Home." /></h3>
              <p><KineticTextReveal text="Hari yang panjang, obrolan yang belum selesai, atau keinginan sederhana untuk menikmati kopi dengan tenang. Apa pun alasanmu, selalu ada ruang untuk mengambil jeda di Ruma." /></p>
              <p><KineticTextReveal text="Mampir sebentar atau tinggal lebih lama. Kami akan menyambutmu sebagaimana adanya." /></p>
              <a className="button button--outline-light gooey-button" href={mapUrl} target="_blank" rel="noreferrer"><span className="gooey-button__label"><KineticTextReveal text="Get Direction" /></span><GooeyBlobs /></a>
              <span className="hours"><KineticTextReveal text="Opening Hours : 09:00 - 23:00" /></span>
            </div>
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <h2 id="closing-title" aria-label="TAKE A DEEP BREATH YOU'RE HOME">
            <SplitText {...splitTextProps} tag="span" className="split-heading-line closing__title-lines" text="TAKE A" />
            <SplitText {...splitTextProps} tag="span" className="split-heading-line closing__title-lines" text="DEEP BREATH" />
            <SplitText {...splitTextProps} tag="span" className="split-heading-line closing__accent" text="YOU'RE HOME" />
          </h2>
          <ScrollReveal tag="p" text={'Nikmati jedanya. Rasakan hangatnya. Temukan kembali dirimu,\nsatu cangkir dalam satu waktu.'} splitBy="words" effect="fade" mode="scrub" stagger={0.05} duration={0.8} baseOpacity={0.1} baseRotation={3} baseOffset={0} enableBlur blurStrength={4} />
          <div className="closing__links">
            <a className="button button--outline gooey-button" href={mapUrl} target="_blank" rel="noreferrer"><span className="gooey-button__label">Find Your Way to RUMA</span><GooeyBlobs /></a>
            <a className="button button--outline gooey-button" href={siteUrl('/menu')} onClick={(event) => { event.preventDefault(); navigate('/menu'); }}><span className="gooey-button__label">Explore Our Menu</span><GooeyBlobs /></a>
          </div>
        </section>

        <footer className="footer">
          <div className="footer__main">
            <div className="footer__brand">
              <a href="#home" aria-label="Ruma Coffee, kembali ke atas"><img src={`${A}logo horizontal white.svg`} alt="Ruma Coffee" /></a>
              <h2>FOLLOW OUR DAYS:</h2>
              <ul className="footer__social" aria-hidden="true">
                <li className="footer__social-item footer__social-item--instagram">
                  <span className="footer__social-icon"><span className="footer__social-fill" /><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="footer__social-dot" cx="18" cy="6" r="1" /></svg></span>
                  <span className="footer__social-tooltip">Instagram</span>
                </li>
                <li className="footer__social-item footer__social-item--tiktok">
                  <span className="footer__social-icon"><span className="footer__social-fill" /><img src={`${A}tiktok-UdvBcV-V.svg`} alt="" /></span>
                  <span className="footer__social-tooltip">TikTok</span>
                </li>
                <li className="footer__social-item footer__social-item--email">
                  <span className="footer__social-icon"><span className="footer__social-fill" /><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg></span>
                  <span className="footer__social-tooltip">Email</span>
                </li>
                <li className="footer__social-item footer__social-item--whatsapp">
                  <span className="footer__social-icon"><span className="footer__social-fill" /><svg viewBox="0 0 24 24"><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.8Z" /><path d="M8.4 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.5.9 1.3 1.7 2.3 2.2.3.2.5.2.7-.1l.8-.9c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .3-.2 1.2-.7 1.6-.5.5-1.2.7-2 .6-1.1-.1-2.5-.8-3.7-1.8-1-.9-2-2.1-2.4-3.4-.4-1.2-.1-2.3.3-3.3Z" /></svg></span>
                  <span className="footer__social-tooltip">WhatsApp</span>
                </li>
              </ul>
            </div>
            <nav className="footer__nav" aria-label="Navigasi footer">
              <h2>EXPLORE:</h2>
              <a href="#about">Our Story</a><a href="#craft">Our Craft</a><a href={siteUrl('/menu')} onClick={(event) => { event.preventDefault(); navigate('/menu'); }}>Menu &amp; Order</a><a href="#visit">Visit Us</a>
            </nav>
            <div className="footer__contact">
              <h2>COME BY:</h2>
              <p>Baleendah, Bandung<br />Jawa Barat, 40111</p>
              <p>09:00 - 23:00 WIB</p>
            </div>
          </div>
          <div className="footer__base"><span>© 2026 Ruma Coffee. Made with care.</span><a href="#home">Kembali ke atas ↑</a></div>
        </footer>
      </main>
    </>
  );
}

export default App;
