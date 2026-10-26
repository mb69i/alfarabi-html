'use client';

import dynamic from 'next/dynamic';
import styles from './HeroSection.module.css';

const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), { ssr: false });

/** Client shell that just renders the dynamic canvas + gradient overlays */
export default function HeroCanvasWrapper() {
  return (
    <>
      <HeroCanvas />
      <div className={styles.gradientBottom} aria-hidden="true" />
      <div className={styles.gradientTop}    aria-hidden="true" />
      <div className={styles.gradientLeft}   aria-hidden="true" />
    </>
  );
}
