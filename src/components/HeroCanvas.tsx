'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/** Creates a gear-like torus-knot wireframe — evokes mechanical/engineering */
function createGearMesh(scene: THREE.Scene) {
  // Outer torusKnot — structural skeleton feel
  const gearGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 180, 20, 3, 5);
  const gearMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D4AF37'),
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const gear = new THREE.Mesh(gearGeo, gearMat);
  scene.add(gear);

  // Inner torus ring
  const ringGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 120);
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#A51C30'),
    transparent: true,
    opacity: 0.35,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  // Second ring, tilted
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.025, 12, 100),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#D4AF37'), transparent: true, opacity: 0.2 })
  );
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.z = Math.PI / 6;
  scene.add(ring2);

  return { gear, ring, ring2 };
}

/** Create floating circuit-board-style particles with connecting lines */
function createCircuitParticles(scene: THREE.Scene) {
  const COUNT = 160;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const palette = [
    new THREE.Color('#D4AF37'), // gold
    new THREE.Color('#A51C30'), // crimson
    new THREE.Color('#7eb3f9'), // cool blue
    new THREE.Color('#1C4B8C'), // navy
  ];

  for (let i = 0; i < COUNT; i++) {
    // Distribute on a sphere surface for even spread
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const r     = 3.5 + Math.random() * 2.5;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Connection lines between nearby particles
  const MAX_LINES = 220;
  const linePosArr   = new Float32Array(MAX_LINES * 6);
  const lineColorArr = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePosArr, 3));
  lineGeo.setAttribute('color',    new THREE.BufferAttribute(lineColorArr, 3));
  const lineMesh = new THREE.LineSegments(lineGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.15 })
  );
  scene.add(lineMesh);

  return { particles, mat, geo, lineGeo, linePosArr, lineColorArr };
}

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* Scene */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, el.clientWidth / el.clientHeight, 0.1, 1000);
    camera.position.z = 7;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // WebGL not available — silently skip the 3D canvas
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* Lighting */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const goldLight = new THREE.PointLight(0xD4AF37, 2, 20);
    goldLight.position.set(3, 3, 4);
    scene.add(goldLight);
    const crimsonLight = new THREE.PointLight(0xA51C30, 1.5, 20);
    crimsonLight.position.set(-3, -2, 3);
    scene.add(crimsonLight);

    /* Engineering geometry */
    const { gear, ring, ring2 } = createGearMesh(scene);
    const { particles, mat: particleMat, geo: particleGeo, lineGeo, linePosArr, lineColorArr } = createCircuitParticles(scene);

    const goldC   = new THREE.Color('#D4AF37');
    const crimsonC = new THREE.Color('#A51C30');

    /* Mouse parallax */
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 0.8;
      my = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    /* Resize */
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener('resize', onResize, { passive: true });

    /* Animation */
    let frame = 0;
    let animId: number;
    const MAX_LINES = 220;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;

      // Rotate torusKnot — slow, majestic
      gear.rotation.x += 0.004;
      gear.rotation.y += 0.003;

      // Rings drift
      ring.rotation.z  += 0.002;
      ring2.rotation.x += 0.001;
      ring2.rotation.y += 0.0015;

      // Particle cloud slow spin
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0003;

      // Pulsing opacity on gear
      (gear.material as THREE.MeshStandardMaterial).opacity = 0.12 + Math.sin(frame * 0.025) * 0.08;
      particleMat.opacity = 0.65 + Math.sin(frame * 0.018) * 0.3;

      // Camera parallax
      camera.position.x += (mx - camera.position.x) * 0.035;
      camera.position.y += (-my - camera.position.y) * 0.035;
      camera.lookAt(scene.position);

      // Rebuild connection lines every 20 frames
      if (frame % 20 === 0) {
        const pos = particleGeo.attributes.position.array as Float32Array;
        const COUNT = pos.length / 3;
        let ci = 0;

        for (let i = 0; i < COUNT && ci < MAX_LINES; i++) {
          for (let j = i + 1; j < COUNT && ci < MAX_LINES; j++) {
            const dx = pos[i*3]-pos[j*3], dy = pos[i*3+1]-pos[j*3+1], dz = pos[i*3+2]-pos[j*3+2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist < 1.8) {
              const b = ci * 6;
              linePosArr[b]=pos[i*3]; linePosArr[b+1]=pos[i*3+1]; linePosArr[b+2]=pos[i*3+2];
              linePosArr[b+3]=pos[j*3]; linePosArr[b+4]=pos[j*3+1]; linePosArr[b+5]=pos[j*3+2];
              const t = dist / 1.8;
              const lc = goldC.clone().lerp(crimsonC, t);
              lineColorArr[b]=lc.r; lineColorArr[b+1]=lc.g; lineColorArr[b+2]=lc.b;
              lineColorArr[b+3]=lc.r; lineColorArr[b+4]=lc.g; lineColorArr[b+5]=lc.b;
              ci++;
            }
          }
        }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate    = true;
        lineGeo.setDrawRange(0, ci * 2);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
