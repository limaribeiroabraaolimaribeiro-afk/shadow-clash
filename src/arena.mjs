import * as THREE from 'three';

function add(parent, geo, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function box(parent, w, h, d, mat, x = 0, y = 0, z = 0) {
  return add(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
}

function postTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#09111a';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#d84a55';
  g.lineWidth = 12;
  g.strokeRect(10, 10, c.width - 20, c.height - 20);
  g.shadowColor = '#7ef0ff';
  g.shadowBlur = 28;
  g.fillStyle = '#dcf7ff';
  g.font = '900 104px system-ui, sans-serif';
  g.textAlign = 'center';
  g.fillText('SHADOW CLASH', c.width / 2, 118);
  g.shadowBlur = 0;
  g.fillStyle = '#b7d0db';
  g.font = '600 34px system-ui, sans-serif';
  g.fillText('RINGUE CENTRAL · TREINO', c.width / 2, 188);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createArena(scene) {
  scene.background = new THREE.Color(0x05070b);
  scene.fog = new THREE.FogExp2(0x05070b, 0.018);

  const ambient = new THREE.HemisphereLight(0x8bb7d8, 0x18120f, 1.0);
  scene.add(ambient);

  const key = new THREE.SpotLight(0xb9ebff, 150, 35, Math.PI / 7, 0.32, 1.6);
  key.position.set(-4.5, 9, 6);
  key.target.position.set(0, 1.2, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key, key.target);

  const rim = new THREE.SpotLight(0xffc36c, 120, 35, Math.PI / 6.5, 0.38, 1.4);
  rim.position.set(5.5, 8, 5);
  rim.target.position.set(0, 1.2, 0);
  scene.add(rim, rim.target);

  const fill = new THREE.PointLight(0x2bcde2, 18, 16, 2);
  fill.position.set(0, 3.2, -4.2);
  scene.add(fill);

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x101318, roughness: 0.92, metalness: 0.08 });
  const platformSide = new THREE.MeshStandardMaterial({ color: 0x151c24, roughness: 0.76, metalness: 0.14 });
  const canvasMat = new THREE.MeshStandardMaterial({ color: 0xb7c0c7, roughness: 0.82, metalness: 0.03 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x28313a, roughness: 0.68, metalness: 0.18 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x2f3944, roughness: 0.5, metalness: 0.55 });
  const ropeBlue = new THREE.MeshStandardMaterial({ color: 0x66dcea, roughness: 0.44, metalness: 0.15, emissive: 0x133a41, emissiveIntensity: 0.2 });
  const ropeRed = new THREE.MeshStandardMaterial({ color: 0xd95861, roughness: 0.44, metalness: 0.15, emissive: 0x3a1218, emissiveIntensity: 0.25 });
  const stairMat = new THREE.MeshStandardMaterial({ color: 0x20262d, roughness: 0.78, metalness: 0.2 });
  const crowdMat = new THREE.MeshStandardMaterial({ color: 0x0b1016, roughness: 0.96 });
  const screenMat = new THREE.MeshBasicMaterial({ map: postTexture() });

  box(scene, 30, 0.2, 24, floorMat, 0, -0.65, 0);

  // Main ring platform
  box(scene, 10.8, 0.55, 10.8, platformSide, 0, -0.12, 0);
  box(scene, 9.6, 0.12, 9.6, canvasMat, 0, 0.22, 0);
  box(scene, 10.1, 0.12, 10.1, edgeMat, 0, 0.14, 0);

  // Logo mat on canvas.
  const logoPlane = add(scene, new THREE.PlaneGeometry(3.8, 1.3), screenMat, 0, 0.285, 0);
  logoPlane.rotation.x = -Math.PI / 2;

  // Corner posts
  const corners = [
    [-4.45, -4.45],
    [4.45, -4.45],
    [-4.45, 4.45],
    [4.45, 4.45],
  ];
  for (const [cx, cz] of corners) {
    box(scene, 0.22, 2.2, 0.22, postMat, cx, 1.0, cz);
    box(scene, 0.34, 0.18, 0.34, edgeMat, cx, 2.05, cz);
  }

  // Ropes
  const ropeHeights = [0.65, 1.02, 1.38];
  const segments = [
    { a: [-4.32, -4.32], b: [4.32, -4.32] },
    { a: [4.32, -4.32], b: [4.32, 4.32] },
    { a: [4.32, 4.32], b: [-4.32, 4.32] },
    { a: [-4.32, 4.32], b: [-4.32, -4.32] },
  ];
  for (let i = 0; i < ropeHeights.length; i++) {
    const mat = i === 1 ? ropeBlue : ropeRed;
    for (const seg of segments) {
      const [ax, az] = seg.a;
      const [bx, bz] = seg.b;
      const length = Math.hypot(bx - ax, bz - az);
      const rope = add(scene, new THREE.CylinderGeometry(0.035, 0.035, length, 12), mat, (ax + bx) / 2, ropeHeights[i], (az + bz) / 2);
      rope.rotation.z = Math.PI / 2;
      rope.rotation.y = Math.atan2(bz - az, bx - ax);
    }
  }

  // Corner cushions
  const cushionMatBlue = new THREE.MeshStandardMaterial({ color: 0x38d0e1, roughness: 0.5, metalness: 0.08 });
  const cushionMatRed = new THREE.MeshStandardMaterial({ color: 0xe05665, roughness: 0.5, metalness: 0.08 });
  function cushions(x, z, sx, sz, mat) {
    for (const y of [0.68, 1.05, 1.41]) {
      const p = box(scene, 0.38, 0.11, 0.22, mat, x + 0.20 * sx, y, z + 0.20 * sz);
      p.rotation.y = Math.atan2(sz, sx);
    }
  }
  cushions(-4.32, -4.32, 1, 1, cushionMatBlue);
  cushions(4.32, 4.32, -1, -1, cushionMatBlue);
  cushions(4.32, -4.32, -1, 1, cushionMatRed);
  cushions(-4.32, 4.32, 1, -1, cushionMatRed);

  // Stairs
  for (let i = 0; i < 3; i++) {
    box(scene, 1.0 - i * 0.06, 0.12, 1.5, stairMat, -5.7 - i * 0.06, -0.47 + i * 0.12, 0);
  }

  // Apron lights and side objects
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const lamp = add(scene, new THREE.SphereGeometry(0.08, 12, 10), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x67eaff : 0xff6772 }), side * (2.0 + i * 0.95), 0.09, side * 5.12);
      lamp.scale.y = 0.75;
    }
  }

  // Score screens / banners around the ring.
  const banner1 = add(scene, new THREE.PlaneGeometry(6.4, 1.4), screenMat, 0, 4.4, -8.6);
  const banner2 = add(scene, new THREE.PlaneGeometry(4.8, 1.0), screenMat, -9.0, 3.8, 0);
  banner2.rotation.y = Math.PI / 2;

  // Crowd silhouettes / bleachers
  for (let row = 0; row < 4; row++) {
    const z = -8.8 - row * 1.0;
    box(scene, 13, 0.2, 1.0, stairMat, 0, -0.35 + row * 0.25, z);
    for (let i = 0; i < 16; i++) {
      const x = -6.5 + i * 0.86;
      const h = 0.55 + ((i + row) % 3) * 0.07;
      box(scene, 0.22, h, 0.18, crowdMat, x, 0.05 + h / 2 + row * 0.23, z + 0.18);
      add(scene, new THREE.SphereGeometry(0.10, 10, 10), crowdMat, x, 0.05 + h + row * 0.23, z + 0.18);
    }
  }

  // Spot rig above.
  box(scene, 10, 0.16, 0.16, edgeMat, 0, 7.2, -0.8);
  box(scene, 0.16, 0.16, 10, edgeMat, 0, 7.2, -0.8);

  const haze = add(scene, new THREE.PlaneGeometry(28, 18), new THREE.MeshBasicMaterial({ color: 0x162733, transparent: true, opacity: 0.08 }), 0, 4, -10);
  haze.rotation.x = 0.08;

  function update(dt) {
    banner1.material.map.offset.x = (banner1.material.map.offset.x + dt * 0.015) % 1;
    banner2.material.map.offset.x = (banner2.material.map.offset.x + dt * 0.022) % 1;
  }

  return { update };
}