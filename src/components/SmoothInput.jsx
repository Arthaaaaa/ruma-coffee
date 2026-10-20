import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export default function SmoothInput({ className = '', wrapperClassName = '', style, type = 'text', onChange, onFocus, onBlur, onSelect, ...props }) {
  const inputRef = useRef(null);
  const measureRef = useRef(null);
  const caretX = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const springCaretX = useSpring(caretX, { stiffness: reducedMotion ? 10000 : 500, damping: 30, mass: 0.5 });
  const [focused, setFocused] = useState(false);
  const [caretVisible, setCaretVisible] = useState(false);

  const syncCaret = useCallback(() => {
    const input = inputRef.current;
    const measure = measureRef.current;
    if (!input || !measure || !['text', 'search', 'url', 'tel', 'password'].includes(input.type)) return;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    const text = input.type === 'password' ? '•'.repeat(start) : input.value.slice(0, start);
    const inputStyle = window.getComputedStyle(input);
    measure.style.font = inputStyle.font;
    measure.style.letterSpacing = inputStyle.letterSpacing;
    measure.style.fontFeatureSettings = inputStyle.fontFeatureSettings;
    measure.textContent = text || '\u200b';

    const paddingLeft = Number.parseFloat(inputStyle.paddingLeft) || 0;
    const paddingRight = Number.parseFloat(inputStyle.paddingRight) || 0;
    const wrap = input.parentElement.getBoundingClientRect();
    const field = input.getBoundingClientRect();
    const x = field.left - wrap.left + paddingLeft + measure.getBoundingClientRect().width - input.scrollLeft;
    caretX.set(Math.max(1, Math.min(wrap.width - paddingRight - 1, x)));
    setCaretVisible(start === end && document.activeElement === input);
  }, [caretX]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return undefined;
    const onSelectionChange = () => {
      if (document.activeElement === input) requestAnimationFrame(syncCaret);
    };
    const onResize = () => { if (document.activeElement === input) syncCaret(); };
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('resize', onResize);
    input.addEventListener('scroll', onResize);
    document.fonts?.addEventListener?.('loadingdone', onResize);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('resize', onResize);
      input.removeEventListener('scroll', onResize);
      document.fonts?.removeEventListener?.('loadingdone', onResize);
    };
  }, [syncCaret]);

  return <span className={`ruma-smooth-input ${wrapperClassName}`}>
    <input
      {...props}
      ref={inputRef}
      type={type}
      className={className}
      style={{ ...style, caretColor: 'transparent' }}
      onChange={(event) => { onChange?.(event); requestAnimationFrame(syncCaret); }}
      onFocus={(event) => { setFocused(true); onFocus?.(event); requestAnimationFrame(syncCaret); }}
      onBlur={(event) => { setFocused(false); setCaretVisible(false); onBlur?.(event); }}
      onSelect={(event) => { onSelect?.(event); requestAnimationFrame(syncCaret); }}
      onKeyUp={(event) => { props.onKeyUp?.(event); syncCaret(); }}
    />
    <span ref={measureRef} className="ruma-smooth-input__measure" aria-hidden="true" />
    <motion.span className="ruma-smooth-input__caret" style={{ x: springCaretX, opacity: focused && caretVisible ? 1 : 0 }} aria-hidden="true" />
  </span>;
}
