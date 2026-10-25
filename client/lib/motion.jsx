import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

/*
 * Atelier Motors motion system.
 *
 * - Lenis provides inertial smooth scrolling (the feel used by most award-winning parallax sites).
 * - A single scroll loop measures registered "scenes" and writes normalised CSS variables onto them.
 *   All visual parallax lives in CSS (style.css) as transforms driven by those variables, so the
 *   work stays on the compositor and every effect degrades to a neutral resting state without JS.
 *
 * Variables written on every [data-scene] element:
 *   --progress  0 → 1   scene enters at the bottom of the viewport → leaves at the top
 *   --center   +1 → -1  scene centre below the viewport centre → above it (0 = centred)
 *   --enter     0 → 1   scene top travels from the viewport bottom to 25% from the top
 *   --exit      0 → 1   scene top travels from the viewport top until the scene has scrolled away
 *   --pin       0 → 1   progress through a tall sticky scene (height − viewport)
 * On <html>: --page-progress 0 → 1 for the reading-progress bar.
 */

const scenes = new Set();
let lenis = null;
let frameRequested = false;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

function writeVar(el, name, value) {
  const next = value.toFixed(4);
  if (el.style.getPropertyValue(name) !== next) el.style.setProperty(name, next);
}

function measure() {
  frameRequested = false;
  const vh = window.innerHeight || 1;
  const root = document.documentElement;
  const scrollY = window.scrollY;
  const scrollHeight = root.scrollHeight;
  const scrollable = Math.max(1, scrollHeight - vh);
  const pageProgress = clamp(scrollY / scrollable);

  // Phase 1: Batch all DOM reads first to eliminate layout thrashing
  const updates = [];
  for (const el of scenes) {
    const rect = el.getBoundingClientRect();
    // Skip scenes far outside the viewport; their last written state is already at rest.
    if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) continue;

    updates.push({
      el,
      progress: clamp((vh - rect.top) / (vh + rect.height)),
      center: clamp((rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2), -1, 1),
      enter: clamp((vh - rect.top) / (vh * 0.75)),
      exit: clamp(-rect.top / Math.max(1, rect.height)),
      pin: clamp(-rect.top / Math.max(1, rect.height - vh)),
    });
  }

  // Phase 2: Batch all DOM writes together
  writeVar(root, '--page-progress', pageProgress);
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    writeVar(u.el, '--progress', u.progress);
    writeVar(u.el, '--center', u.center);
    writeVar(u.el, '--enter', u.enter);
    writeVar(u.el, '--exit', u.exit);
    writeVar(u.el, '--pin', u.pin);
  }
}

function requestMeasure() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(measure);
}

/** Smooth-scrolls to a selector or element, using Lenis when it is running. */
export function scrollToTarget(target, offset = -24) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/** Boots smooth scrolling and the scene loop. Call once from the app root. */
export function useScrollMotion() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const reduced = prefersReducedMotion();
    document.documentElement.classList.toggle('motion-reduced', reduced);
    if (reduced) return undefined;

    let bodyObserver;
    try {
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.12,
        wheelMultiplier: 1.0,
        anchors: { offset: -24, duration: 1.2 },
      });
      lenis.on('scroll', requestMeasure);

      // Modals lock the body; pause inertia so the page underneath stays put.
      bodyObserver = new MutationObserver(() => {
        if (document.body.style.overflow === 'hidden') lenis?.stop();
        else lenis?.start();
      });
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    } catch {
      lenis = null;
    }

    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);
    requestMeasure();

    return () => {
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      bodyObserver?.disconnect();
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

/** Registers an element as a parallax scene; returns a ref to attach. */
export function useScene() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    scenes.add(el);
    requestMeasure();
    return () => scenes.delete(el);
  }, []);
  return ref;
}

/* ---------- Reveal on enter ---------- */

let revealObserver = null;
const revealCallbacks = new WeakMap();

function observeReveal(el, onVisible) {
  if (typeof IntersectionObserver === 'undefined') {
    onVisible();
    return () => {};
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealCallbacks.get(entry.target)?.();
          revealObserver.unobserve(entry.target);
          revealCallbacks.delete(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
  }
  revealCallbacks.set(el, onVisible);
  revealObserver.observe(el);
  return () => {
    revealObserver?.unobserve(el);
    revealCallbacks.delete(el);
  };
}

function useRevealed(immediate) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (immediate) {
      // Next frame so the hidden state paints first and the transition plays.
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    return observeReveal(el, () => setVisible(true));
  }, [immediate]);
  return [ref, visible];
}

/** Fades and lifts its content into place when scrolled into view. */
export function Reveal({ as: Tag = 'div', delay = 0, immediate = false, variant = 'up', className = '', style, children, ...rest }) {
  const [ref, visible] = useRevealed(immediate);
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ...style, '--delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Splits heading text into masked words that slide up in sequence.
 * Plain strings are split per word; elements (e.g. <em>, <br />) are kept whole.
 */
export function RevealWords({ as: Tag = 'span', delay = 0, stagger = 55, immediate = false, className = '', children, ...rest }) {
  const [ref, visible] = useRevealed(immediate);
  const [done, setDone] = useState(false);
  let index = 0;

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => setDone(true), 1300);
    return () => clearTimeout(timer);
  }, [visible]);

  const renderWord = (content, key) => {
    const i = index++;
    return (
      <span key={key} className="word-mask">
        <span className="word" style={{ '--delay': `${delay + i * stagger}ms` }}>{content}</span>
      </span>
    );
  };

  const parts = [];
  Children.toArray(children).forEach((child, childIndex) => {
    if (typeof child === 'string' || typeof child === 'number') {
      String(child)
        .split(/(\s+)/)
        .forEach((token, tokenIndex) => {
          if (!token) return;
          if (/^\s+$/.test(token)) parts.push(' ');
          else parts.push(renderWord(token, `${childIndex}-${tokenIndex}`));
        });
    } else if (isValidElement(child) && child.type === 'br') {
      parts.push(cloneElement(child, { key: `br-${childIndex}` }));
    } else {
      parts.push(renderWord(child, `el-${childIndex}`));
    }
  });

  return (
    <Tag ref={ref} className={`reveal-words ${visible ? 'is-visible' : ''} ${done ? 'is-done' : ''} ${className}`} {...rest}>
      {parts}
    </Tag>
  );
}
