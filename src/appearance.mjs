import * as THREE from 'three';

/**
 * 2.5D, alpha-masked turntable appearance for the first Shadow Clash fighter.
 * This is not a Meshy mesh or a skeletal animation: the original pose sheet
 * provided still images; genuine joints require a textured, rigged GLB.
 * The underlying procedural fighter continues handling timing and hitboxes.
 */
export function attachVeteranoAppearance(fighter) {
  const names = ['guard', 'front', 'quarter_left', 'side_left', 'back', 'side_right'];
  const textureLoader = new THREE.TextureLoader();
  const materials = new Map();
  let loaded = 0;
  let inspection = false;
  let inspectionTime = 0;
  let failed = false;

  const avatar = new THREE.Mesh(
    new THREE.PlaneGeometry(0.87, 2.22),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.035 })
  );
  avatar.position.set(0, 1.11, 0.20);
  avatar.renderOrder = 3;
  fighter.bob.add(avatar);

  function applyView(name) {
    const material = materials.get(name) ?? materials.get('guard');
    if (material && avatar.material !== material) avatar.material = material;
  }

  function reveal() {
    if (!materials.has('guard')) return;
    // Keep the skeleton in the world for the combat calculations, but avoid
    // drawing a mismatched procedural mannequin through the faithful cutout.
    fighter.bob.traverse((o) => {
      if (o.isMesh && o !== avatar) o.visible = false;
    });
    avatar.visible = true;
    applyView('guard');
  }

  for (const name of names) {
    const url = new URL(`../assets/veterano/${name}.webp`, import.meta.url).href;
    textureLoader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture, color: 0xffffff, side: THREE.DoubleSide,
        transparent: true, alphaTest: 0.035, depthWrite: false,
      });
      materials.set(name, material);
      loaded++;
      reveal();
    }, undefined, (err) => {
      failed = true;
      console.warn(`Shadow Clash: não foi possível carregar a vista ${name}.`, err);
    });
  }

  function update({pose = 'idle', time = 0, dt = 1 / 60, facing = 1, actionProgress = 0} = {}) {
    if (!materials.has('guard')) return;
    if (inspection) inspectionTime += dt;
    // The root turns to the opponent; counter-rotate the illustration so its
    // shaded, alpha-masked face always remains readable from the gameplay camera.
    avatar.rotation.y = -fighter.root.rotation.y;
    let view = 'guard';
    if (inspection) {
      view = ['front', 'quarter_left', 'side_left', 'back', 'side_right', 'guard'][Math.floor(inspectionTime / 1.0) % 6];
    } else if (pose === 'walk') {
      view = facing >= 0 ? 'quarter_left' : 'side_left';
    } else if (pose === 'lowKick' || pose === 'highKick') {
      view = facing >= 0 ? 'side_right' : 'side_left';
    } else if (pose === 'block') {
      view = 'front';
    }
    applyView(view);
    const direction = facing < 0 && (view === 'front' || view === 'guard') ? -1 : 1;
    // Limited motion for preview/production blockout, not rigged limb animation.
    const phase = Math.sin(time * (pose === 'walk' ? 12 : 2.5));
    let lean = 0, shift = 0, scaleY = 1, scaleX = 1;
    if (pose === 'walk') { lean = 0.022 * phase; shift = 0.028 * phase; }
    else if (pose === 'crouch') { scaleY = 0.80; scaleX = 1.05; }
    else if (pose === 'jump') { lean = -0.07; }
    else if (pose === 'jab') { lean = -0.09 * Math.sin(actionProgress * Math.PI); shift = 0.08 * Math.sin(actionProgress * Math.PI); }
    else if (pose === 'heavy' || pose === 'hook') { lean = -0.16 * Math.sin(actionProgress * Math.PI); shift = 0.12 * Math.sin(actionProgress * Math.PI); }
    else if (pose === 'lowKick' || pose === 'highKick') { lean = 0.17 * Math.sin(actionProgress * Math.PI); }
    else if (pose === 'special') { scaleX = 1 + 0.08 * Math.sin(actionProgress * Math.PI); lean = -0.12 * Math.sin(actionProgress * Math.PI); }
    else if (pose === 'hit') { lean = 0.15 * Math.sin(actionProgress * Math.PI); }
    else { shift = 0.009 * phase; }
    avatar.rotation.z = THREE.MathUtils.lerp(avatar.rotation.z, lean * direction, Math.min(1, dt * 18));
    avatar.position.x = THREE.MathUtils.lerp(avatar.position.x, shift * direction, Math.min(1, dt * 16));
    avatar.scale.x = THREE.MathUtils.lerp(avatar.scale.x, scaleX * direction, Math.min(1, dt * 16));
    avatar.scale.y = THREE.MathUtils.lerp(avatar.scale.y, scaleY, Math.min(1, dt * 16));
    // The lower edge stays on the surface when the figure crouches.
    avatar.position.y = 1.11 * avatar.scale.y;
  }

  function setInspection(value) {
    inspection = Boolean(value);
    inspectionTime = 0;
    return inspection;
  }

  function toggleInspection() { return setInspection(!inspection); }

  return { update, toggleInspection, setInspection, isReady: () => materials.has('guard'), status: () => ({loaded, total: names.length, failed}) };
}