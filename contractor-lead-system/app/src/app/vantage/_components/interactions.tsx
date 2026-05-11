'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* Cursor-following radial gradient — disabled on touch */
export function CursorGlow({
  children,
  color = 'rgba(251, 191, 36, 0.08)',
  size = 400,
}: {
  children: ReactNode;
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hover capability check
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const leave = () => setPos(null);

    el.addEventListener('mousemove', handle);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', handle);
      el.removeEventListener('mouseleave', leave);
    };
  }, [enabled]);

  return (
    <div ref={ref} className="relative">
      {children}
      {enabled && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-0"
          style={{
            left: (pos?.x ?? -9999) - size / 2,
            top: (pos?.y ?? -9999) - size / 2,
            width: size,
            height: size,
            background: `radial-gradient(circle, ${color}, transparent 65%)`,
            opacity: pos ? 1 : 0,
            transition: 'opacity 200ms ease-out',
          }}
        />
      )}
    </div>
  );
}

/* 3D tilt toward cursor — max 4 degrees, disabled on touch */
export function TiltCard({
  children,
  className,
  max = 4,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1400px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      el.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
    };

    el.addEventListener('mousemove', handle);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', handle);
      el.removeEventListener('mouseleave', reset);
      cancelAnimationFrame(raf);
    };
  }, [max]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `transform 320ms ${SPRING}`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

/* Pass-through (was FadeUp; kept as no-op for callers).
   Removed scroll-triggered hide because SSR opacity:0 stuck
   when client JS didn't hydrate fast enough. */
export function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* MouseLight — page-wide warm halo that eases toward the
   cursor. Renders ABOVE content (z-40) with screen blend so
   it casts warm light without obscuring readability.
   pointer-events-none. Disabled on touch / reduced motion. */
export function MouseLight({
  size = 800,
  color = 'rgba(251,191,36,0.40)',
  inner = 'rgba(255,138,76,0.22)',
  damping = 0.12,
}: {
  size?: number;
  color?: string;
  inner?: string;
  damping?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hover + motion check
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const move = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      currentX += (targetX - currentX) * damping;
      currentY += (targetY - currentY) * damping;
      el.style.transform = `translate3d(${currentX - size / 2}px, ${currentY - size / 2}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, [enabled, damping, size]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      ref={ref}
      className="pointer-events-none fixed left-0 top-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, ${inner} 35%, transparent 65%)`,
        mixBlendMode: 'screen',
        willChange: 'transform',
        zIndex: 40,
      }}
    />
  );
}

/* HoverSpot — cursor-tracking soft spotlight on hover.
   Wraps a card and renders a warm amber radial that follows
   the cursor inside it. Disabled on touch devices. */
export function HoverSpot({
  children,
  className,
  size = 320,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe hover capability check
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setPos({ x, y }));
    };
    const leave = () => setPos(null);
    el.addEventListener('mousemove', handle);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', handle);
      el.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      {enabled && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-0 transition-opacity duration-300"
          style={{
            left: (pos?.x ?? -9999) - size / 2,
            top: (pos?.y ?? -9999) - size / 2,
            width: size,
            height: size,
            background: `radial-gradient(circle, rgba(251,191,36,0.10), transparent 65%)`,
            opacity: pos ? 1 : 0,
            mixBlendMode: 'screen',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* Routed tab navigation. Tabs are <Link>s; the active one is
   detected by matching `active` to the tab's `href`. Sliding
   underline animates between active states.

   Use this when you want each tab to be its own route. */
export function RoutedTabs({
  tabs,
  active,
}: {
  tabs: { label: string; href: string; subtitle?: string }[];
  active: string;
}) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto border-b border-white/[0.05] bg-white/[0.015] px-1.5"
    >
      {tabs.map((t) => {
        const selected = t.href === active;
        return (
          <a
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={selected}
            className={`vantage-tab group relative flex flex-col items-start whitespace-nowrap px-4 py-3 transition-colors ${
              selected ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">
              {t.label}
            </span>
            {t.subtitle && (
              <span className="mt-0.5 text-[11px] font-normal normal-case tracking-normal text-zinc-500">
                {t.subtitle}
              </span>
            )}
            <span
              aria-hidden
              className={`absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 transition-all duration-300 ${
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
              }`}
              style={{
                boxShadow: selected ? '0 0 12px rgba(251,191,36,0.4)' : undefined,
              }}
            />
          </a>
        );
      })}
    </div>
  );
}

/* Tabbed sections for compact data cards. Renders a tab bar
   plus one panel at a time. */
export function TabbedSections({
  tabs,
}: {
  tabs: { label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  const groupId = useId();

  return (
    <div>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-white/[0.04] bg-white/[0.015] px-2"
      >
        {tabs.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.label}
              role="tab"
              type="button"
              id={`${groupId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${groupId}-panel-${i}`}
              onClick={() => setActive(i)}
              className={`relative whitespace-nowrap px-3 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                selected
                  ? 'text-amber-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
              <span
                aria-hidden
                className={`absolute inset-x-2 -bottom-px h-px transition-opacity ${
                  selected ? 'bg-amber-400 opacity-90' : 'opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${groupId}-panel-${i}`}
          aria-labelledby={`${groupId}-tab-${i}`}
          hidden={i !== active}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
