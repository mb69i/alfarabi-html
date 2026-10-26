'use client';

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: 'up' | 'left' | 'right' | 'none';
  style?: CSSProperties;
  threshold?: number;
}

export default function AnimateOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  style,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('aos-visible');
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const directionClass =
    direction === 'up'    ? 'aos-up' :
    direction === 'left'  ? 'aos-left' :
    direction === 'right' ? 'aos-right' : 'aos-none';

  return (
    <div
      ref={ref}
      className={`aos-base ${directionClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
