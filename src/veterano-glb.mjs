import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/loaders/GLTFLoader.js';

export const VETERANO_GLB_URL = new URL('../assets/models/veterano-rig-3d.glb',import.meta.url).href;

/**
 * Loads an actual glTF 2.0 skinned mesh with 16 bones and embedded clips.
 * The gameplay currently drives this skeleton with the same deterministic
 * procedural poses as the combat engine. We preserve the exported animation
 * clips on the model for use by other engines and further refinement.
 */
export async function loadVeteranoGLB({x=-1.23}={}){
  const gltf=await new GLTFLoader().loadAsync(VETERANO_GLB_URL);
  let skinned=null;
  gltf.scene.traverse(o=>{if(o.isSkinnedMesh){skinned=o;}});
  if(!skinned || !skinned.skeleton?.bones?.length) throw Error('GLB nao contem esqueleto humanoide.');
  const joints=Object.fromEntries(skinned.skeleton.bones.map(b=>[b.name,b]));
  for(const name of ['Pelvis','Spine','Head','LeadShoulder','LeadElbow','LeadWrist','RearShoulder','RearElbow','LeadHip','LeadKnee','RearHip','RearKnee']){
    if(!joints[name])throw Error('Osso ausente no GLB: '+name);
  }
  const root=new THREE.Group();root.name='VeteranoRealGLB';root.position.x=x;
  const bob=new THREE.Group();bob.name='JumpOffset';root.add(bob);bob.add(gltf.scene);
  skinned.castShadow=true;skinned.receiveShadow=true;skinned.frustumCulled=false;
  const rig={
    pelvisY:[joints.Pelvis,'position','y'],
    pelvisX:[joints.Pelvis,'position','x'],
    torsoZ:[joints.Spine,'rotation','z'],
    torsoY:[joints.Spine,'rotation','y'],
    headZ:[joints.Head,'rotation','z'],
    leadArmZ:[joints.LeadShoulder,'rotation','z'],
    rearArmZ:[joints.RearShoulder,'rotation','z'],
    leadElbowZ:[joints.LeadElbow,'rotation','z'],
    rearElbowZ:[joints.RearElbow,'rotation','z'],
    leadArmY:[joints.LeadShoulder,'rotation','y'],
    rearArmY:[joints.RearShoulder,'rotation','y'],
    leadHipZ:[joints.LeadHip,'rotation','z'],
    rearHipZ:[joints.RearHip,'rotation','z'],
    leadKneeZ:[joints.LeadKnee,'rotation','z'],
    rearKneeZ:[joints.RearKnee,'rotation','z']
  };
  const bind=Object.fromEntries(Object.entries(rig).map(([key,[bone,prop,axis]])=>[key,bone[prop][axis]]));
  function applyPose(p,dt=1/60){
    const alpha=1-Math.exp(-Math.max(0,Math.min(dt,.05))*24);
    for(const [key,[bone,prop,axis]] of Object.entries(rig)){
      bone[prop][axis]=THREE.MathUtils.lerp(bone[prop][axis],bind[key]+(p[key]??0),alpha);
    }
  }
  function setFacing(direction){root.rotation.y=direction<0?-.25:.23;}
  root.updateMatrixWorld(true);
  return {
    root,bob,mesh:skinned,bones:joints,
    pelvis:joints.Pelvis,torso:joints.Spine,head:joints.Head,glove:joints.LeadWrist,
    applyPose,setFacing,sourceGLB:VETERANO_GLB_URL,
    animations:gltf.animations,
    accent:new THREE.Color(0xb83843),dummy:false
  };
}
