// ─── Al-Farabi AI Engineering Department — Unified 3D Neural Canvas ───
// Combines Neural Synapses, Gold Central Emblem & Dynamic Particles

function initHeroCanvas(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  // Clear previous canvas if any
  container.innerHTML = '';

  const isMobile = window.innerWidth < 768;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050b18, 0.06);

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.2 : 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x0B132B, 0.6));
  const goldLight = new THREE.PointLight(0xD4AF37, 1.8, 40);
  goldLight.position.set(2, 3, 4);
  scene.add(goldLight);

  const crimsonLight = new THREE.DirectionalLight(0xA51C30, 0.6);
  crimsonLight.position.set(-3, -2, 2);
  scene.add(crimsonLight);

  // ── 1. Gold Central Emblem Group ──
  const emblemGroup = new THREE.Group();
  
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xD4AF37,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xD4AF37,
    emissiveIntensity: 0.15
  });

  const wireMat1 = new THREE.MeshBasicMaterial({ color: 0xD4AF37, wireframe: true, transparent: true, opacity: 0.35 });
  const wireMat2 = new THREE.MeshBasicMaterial({ color: 0xD4AF37, wireframe: true, transparent: true, opacity: 0.2 });

  const torus1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.03, 16, 80), wireMat1);
  const torus2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.015, 16, 90), wireMat2);
  const octa = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), goldMat);

  emblemGroup.add(torus1);
  emblemGroup.add(torus2);
  emblemGroup.add(octa);
  emblemGroup.position.set(0, 0.2, -0.5);
  scene.add(emblemGroup);

  // ── 2. Neural Network Nodes & Connections ──
  const nnGroup = new THREE.Group();
  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
  const nodeTealMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  const nodes = [
    // Left cluster (input)
    { pos: new THREE.Vector3(-4.2, 1.8, -1), color: 'gold' },
    { pos: new THREE.Vector3(-4.0, 0.2, -0.5), color: 'gold' },
    { pos: new THREE.Vector3(-4.2, -1.4, -0.8), color: 'gold' },
    { pos: new THREE.Vector3(-2.2, 2.2, -0.6), color: 'teal' },
    { pos: new THREE.Vector3(-2.0, 0.6, -0.3), color: 'teal' },
    { pos: new THREE.Vector3(-2.1, -1.0, -0.5), color: 'teal' },
    // Right cluster (output)
    { pos: new THREE.Vector3(2.1, 2.0, -0.5), color: 'teal' },
    { pos: new THREE.Vector3(2.0, 0.4, -0.3), color: 'teal' },
    { pos: new THREE.Vector3(2.2, -1.2, -0.6), color: 'teal' },
    { pos: new THREE.Vector3(4.1, 1.6, -0.8), color: 'gold' },
    { pos: new THREE.Vector3(4.0, 0.0, -0.5), color: 'gold' },
    { pos: new THREE.Vector3(4.2, -1.5, -0.7), color: 'gold' }
  ];

  nodes.forEach(n => {
    const mesh = new THREE.Mesh(nodeGeo, n.color === 'teal' ? nodeTealMat : nodeMat);
    mesh.position.copy(n.pos);
    nnGroup.add(mesh);
  });

  // Synaptic Connection Lines
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    opacity: 0.12
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].pos.distanceTo(nodes[j].pos);
      if (dist < 2.8) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[i].pos, nodes[j].pos]);
        const line = new THREE.Line(lineGeo, lineMat);
        nnGroup.add(line);
      }
    }
  }
  scene.add(nnGroup);

  // ── 3. Dynamic Ambient Data Particles ──
  const pCount = isMobile ? 300 : 1200;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(pCount * 3);
  const pSpeeds = [];

  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3]     = (Math.random() - 0.5) * 16;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    pSpeeds.push({
      y: (Math.random() * 0.006) + 0.002,
      rot: (Math.random() - 0.5) * 0.004
    });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: isMobile ? 0.03 : 0.045,
    transparent: true,
    opacity: 0.45
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── 4. Mouse Tracking & Parallax ──
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── 5. Animation Loop ──
  let clock = new THREE.Clock();
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse parallax
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Rotate central emblem
    emblemGroup.rotation.x = targetY * 0.4 + Math.sin(elapsed * 0.4) * 0.15;
    emblemGroup.rotation.y = targetX * 0.5 + elapsed * 0.25;
    torus1.rotation.z = elapsed * 0.3;
    torus2.rotation.x = elapsed * 0.2;
    octa.rotation.y = -elapsed * 0.4;

    // Subtle drift on neural network
    nnGroup.rotation.y = targetX * 0.2;
    nnGroup.rotation.x = -targetY * 0.15;

    // Particle drift
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      pos[i * 3 + 1] += pSpeeds[i].y;
      if (pos[i * 3 + 1] > 6) pos[i * 3 + 1] = -6;
    }
    pGeo.attributes.position.needsUpdate = true;
    particles.rotation.y = elapsed * 0.03;

    renderer.render(scene, camera);
  }
  animate();

  // ── 6. Responsive Resize ──
  function onResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);
}

// Auto-run if canvas element exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hero-canvas')) {
    initHeroCanvas('hero-canvas');
  }
});
