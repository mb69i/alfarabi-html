// ── Alfarabi — Three.js Hero Canvas ──────────────────────────────
// AI Engineering themed: Neural network, data flow pulses, clean nodes

function initHeroCanvas(containerId) {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: window.innerWidth > 768, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const gold = new THREE.Color(0xD4AF37);
  const crimson = new THREE.Color(0xA51C30);
  const blue = new THREE.Color(0x4a8eff);
  const teal = new THREE.Color(0x34d399);

  // ═══════════════════════════════════════════════════════════════
  // 1. NEURAL NETWORK — Structured nodes + connections
  // ═══════════════════════════════════════════════════════════════
  const nnGroup = new THREE.Group();

  // Define neural network layers (input → hidden → output)
  const layers = [
    // Input layer (left)
    [
      { x: -4.5, y: 2.0, z: -1 },
      { x: -4.5, y: 0.7, z: -0.5 },
      { x: -4.5, y: -0.6, z: -1 },
      { x: -4.5, y: -1.9, z: -0.5 },
    ],
    // Hidden layer 1
    [
      { x: -1.8, y: 2.5, z: -0.8 },
      { x: -1.8, y: 1.0, z: -0.3 },
      { x: -1.8, y: -0.5, z: -0.6 },
      { x: -1.8, y: -2.0, z: -0.4 },
      { x: -1.8, y: -3.2, z: -0.9 },
    ],
    // Hidden layer 2
    [
      { x: 1.2, y: 2.2, z: -0.6 },
      { x: 1.2, y: 0.7, z: -0.4 },
      { x: 1.2, y: -0.8, z: -0.5 },
      { x: 1.2, y: -2.3, z: -0.7 },
    ],
    // Output layer (right)
    [
      { x: 4.0, y: 1.5, z: -0.8 },
      { x: 4.0, y: 0.0, z: -0.5 },
      { x: 4.0, y: -1.5, z: -0.7 },
    ],
  ];

  // Create nodes (neurons)
  const allNodes = [];
  const nodeColors = [gold, crimson, blue, teal];
  layers.forEach((layer, li) => {
    layer.forEach((pos, ni) => {
      // Outer ring (neuron border)
      const ringGeo = new THREE.RingGeometry(0.12, 0.15, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColors[li], transparent: true, opacity: 0.35, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(pos.x, pos.y, pos.z);
      nnGroup.add(ring);

      // Inner dot (neuron core)
      const dotGeo = new THREE.CircleGeometry(0.06, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: nodeColors[li], transparent: true, opacity: 0.5, side: THREE.DoubleSide
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(pos.x, pos.y, pos.z + 0.01);
      nnGroup.add(dot);

      allNodes.push({ pos, ring, dot, layerIdx: li, nodeIdx: ni });
    });
  });

  // Create connections between layers
  const connections = [];
  for (let li = 0; li < layers.length - 1; li++) {
    layers[li].forEach((fromPos, fi) => {
      layers[li + 1].forEach((toPos, ti) => {
        // Don't connect every node — skip some for cleanliness
        if ((fi + ti) % 3 === 2) return;

        const points = [
          new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z),
          new THREE.Vector3(toPos.x, toPos.y, toPos.z),
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: gold, transparent: true, opacity: 0.06
        });
        const line = new THREE.Line(lineGeo, lineMat);
        nnGroup.add(line);
        connections.push({ from: fromPos, to: toPos, line, mat: lineMat });
      });
    });
  }

  scene.add(nnGroup);

  // ═══════════════════════════════════════════════════════════════
  // 2. DATA FLOW PULSES — Particles traveling along connections
  // ═══════════════════════════════════════════════════════════════
  const pulses = [];
  const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);

  function spawnPulse() {
    if (connections.length === 0) return;
    const conn = connections[Math.floor(Math.random() * connections.length)];
    const pulseMat = new THREE.MeshBasicMaterial({
      color: [gold, blue, teal][Math.floor(Math.random() * 3)],
      transparent: true, opacity: 0.7
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.position.set(conn.from.x, conn.from.y, conn.from.z);
    scene.add(pulse);
    pulses.push({
      mesh: pulse, from: conn.from, to: conn.to,
      progress: 0, speed: 0.004 + Math.random() * 0.006,
      connMat: conn.mat
    });
  }

  // Spawn pulses (less frequently on mobile)
  const pulseInterval = window.innerWidth > 768 ? 400 : 800;
  setInterval(spawnPulse, pulseInterval);

  // ═══════════════════════════════════════════════════════════════
  // 3. CENTRAL AI BRAIN — Clean wireframe icosahedron
  // ═══════════════════════════════════════════════════════════════
  const brainGroup = new THREE.Group();
  brainGroup.position.set(0, 0.3, 0);

  // Outer wireframe
  const brainGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const brainMat = new THREE.MeshBasicMaterial({
    color: gold, wireframe: true, transparent: true, opacity: 0.05
  });
  const brain = new THREE.Mesh(brainGeo, brainMat);
  brainGroup.add(brain);

  // Inner sphere
  const innerGeo = new THREE.IcosahedronGeometry(0.7, 1);
  const innerMat = new THREE.MeshBasicMaterial({
    color: crimson, wireframe: true, transparent: true, opacity: 0.04
  });
  const innerBrain = new THREE.Mesh(innerGeo, innerMat);
  brainGroup.add(innerBrain);

  scene.add(brainGroup);

  // ═══════════════════════════════════════════════════════════════
  // 4. FLOATING CODE PARTICLES — Tiny ambient dots
  // ═══════════════════════════════════════════════════════════════
  const isMobile = window.innerWidth <= 768;
  const ambientCount = isMobile ? 20 : 40;
  const ambPos = new Float32Array(ambientCount * 3);
  const ambVel = [];
  for (let i = 0; i < ambientCount; i++) {
    ambPos[i * 3] = (Math.random() - 0.5) * 20;
    ambPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    ambPos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 3;
    ambVel.push({
      x: (Math.random() - 0.5) * 0.001,
      y: (Math.random() - 0.5) * 0.001,
      z: 0,
    });
  }
  const ambGeo = new THREE.BufferGeometry();
  ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPos, 3));
  const ambMat = new THREE.PointsMaterial({
    color: gold, size: 0.03, transparent: true, opacity: 0.25
  });
  const ambientParticles = new THREE.Points(ambGeo, ambMat);
  scene.add(ambientParticles);

  // ═══════════════════════════════════════════════════════════════
  // 5. CIRCUIT TRACES — Horizontal/vertical lines (PCB look)
  // ═══════════════════════════════════════════════════════════════
  const traceGroup = new THREE.Group();
  const traceConfigs = [
    [[-7, -3.5, -3], [-4.5, -3.5, -3], [-4.5, -1.5, -3]],
    [[5, 3, -3.5], [7, 3, -3.5], [7, 1, -3.5]],
    [[-6, 3.5, -4], [-3, 3.5, -4]],
    [[3.5, -3, -3], [6.5, -3, -3]],
    [[-5, -0.5, -4.5], [-5, 2.5, -4.5], [-3, 2.5, -4.5]],
  ];
  traceConfigs.forEach(pts => {
    const vectors = pts.map(p => new THREE.Vector3(...p));
    const geo = new THREE.BufferGeometry().setFromPoints(vectors);
    const mat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.05 });
    traceGroup.add(new THREE.Line(geo, mat));
    // Endpoint dots
    vectors.forEach(v => {
      const dGeo = new THREE.CircleGeometry(0.03, 8);
      const dMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const d = new THREE.Mesh(dGeo, dMat);
      d.position.copy(v);
      traceGroup.add(d);
    });
  });
  scene.add(traceGroup);

  // ═══════════════════════════════════════════════════════════════
  // INTERACTION + ANIMATION
  // ═══════════════════════════════════════════════════════════════
  let mouseX = 0, mouseY = 0, tMX = 0, tMY = 0;
  window.addEventListener('mousemove', (e) => {
    tMX = (e.clientX / window.innerWidth - 0.5) * 2;
    tMY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }, 150);
  }
  window.addEventListener('resize', onResize);

  // Pause when off-screen for better performance
  let isVisible = true;
  const visObserver = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  visObserver.observe(container);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // Skip rendering when canvas is off-screen
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    mouseX += (tMX - mouseX) * 0.03;
    mouseY += (tMY - mouseY) * 0.03;

    // Rotate brain slowly
    brain.rotation.y = t * 0.08;
    brain.rotation.x = Math.sin(t * 0.04) * 0.1;
    innerBrain.rotation.y = -t * 0.12;
    innerBrain.rotation.z = t * 0.06;

    // Brain breathing
    const b = 1 + Math.sin(t * 0.6) * 0.03;
    brainGroup.scale.set(b, b, b);

    // Pulse neuron nodes (staggered glow)
    allNodes.forEach((n, i) => {
      const glow = 0.3 + Math.sin(t * 1.2 + i * 0.8) * 0.2;
      n.dot.material.opacity = glow;
      n.ring.material.opacity = glow * 0.6;
      // Slight float
      n.ring.position.y = n.pos.y + Math.sin(t * 0.5 + i) * 0.05;
      n.dot.position.y = n.ring.position.y;
    });

    // Animate data pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;

      if (p.progress >= 1) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        pulses.splice(i, 1);
        continue;
      }

      // Lerp position
      p.mesh.position.x = p.from.x + (p.to.x - p.from.x) * p.progress;
      p.mesh.position.y = p.from.y + (p.to.y - p.from.y) * p.progress;
      p.mesh.position.z = p.from.z + (p.to.z - p.from.z) * p.progress;

      // Fade in/out
      const fade = p.progress < 0.2 ? p.progress / 0.2 : p.progress > 0.8 ? (1 - p.progress) / 0.2 : 1;
      p.mesh.material.opacity = fade * 0.7;

      // Brighten connection line as pulse passes
      p.connMat.opacity = 0.06 + fade * 0.08;
    }

    // Reset connection opacity (fade back)
    connections.forEach(c => {
      if (c.mat.opacity > 0.06) c.mat.opacity -= 0.002;
    });

    // Move ambient particles
    const aPos = ambientParticles.geometry.attributes.position.array;
    for (let i = 0; i < ambientCount; i++) {
      aPos[i * 3] += ambVel[i].x;
      aPos[i * 3 + 1] += ambVel[i].y;
      if (Math.abs(aPos[i * 3]) > 10) ambVel[i].x *= -1;
      if (Math.abs(aPos[i * 3 + 1]) > 6) ambVel[i].y *= -1;
    }
    ambientParticles.geometry.attributes.position.needsUpdate = true;

    // Camera parallax
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
}
