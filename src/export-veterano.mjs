import * as THREE from 'three';
import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/exporters/GLTFExporter.js';
import { ATTACKS, samplePose } from './motions.mjs';

// Converts the same procedural fighting movements used by the game into
// native glTF animation tracks. The resulting GLB contains a skeleton,
// vertex-weighted mesh, materials and 12 named animation clips.
const AXES = {
 Pelvis:{x:'pelvisX',y:'pelvisY'},
 Spine:{z:'torsoZ',y:'torsoY'},
 Head:{z:'headZ'},
 LeadShoulder:{z:'leadArmZ',y:'leadArmY'},
 RearShoulder:{z:'rearArmZ',y:'rearArmY'},
 LeadElbow:{z:'leadElbowZ'},
 RearElbow:{z:'rearElbowZ'},
 LeadHip:{z:'leadHipZ'},
 RearHip:{z:'rearHipZ'},
 LeadKnee:{z:'leadKneeZ'},
 RearKnee:{z:'rearKneeZ'}
};
const DURATIONS={
 idle:1.8,walk:1.0,crouch:.55,block:.55,jump:.92,hit:.44,
 ...Object.fromEntries(Object.entries(ATTACKS).map(([key,a])=>[key,a.duration]))
};
function makeClip(name,duration){
 const fps=30,frames=Math.max(12,Math.round(duration*fps));
 const times=[],samples=[];
 for(let f=0;f<=frames;f++){
  const t=duration*f/frames;
  times.push(t);
  samples.push(samplePose(name,name==='idle'?t:name==='walk'?t:t,duration,t*10));
 }
 const tracks=[],q=new THREE.Quaternion(),e=new THREE.Euler();
 for(const [bone,fields] of Object.entries(AXES)){
  if(bone==='Pelvis'){
   const vals=[];
   for(const p of samples)vals.push(p.pelvisX??0,1.05+(p.pelvisY??0),0);
   tracks.push(new THREE.VectorKeyframeTrack('Pelvis.position',times,vals));
  }else{
   const vals=[];
   for(const p of samples){
    e.set(0,p[fields.y]??0,p[fields.z]??0,'XYZ');
    q.setFromEuler(e);vals.push(q.x,q.y,q.z,q.w);
   }
   tracks.push(new THREE.QuaternionKeyframeTrack(bone+'.quaternion',times,vals));
  }
 }
 return new THREE.AnimationClip(name,duration,tracks);
}
export const VETERANO_CLIPS=Object.freeze(Object.keys(DURATIONS));

export async function downloadVeteranoGLB(fighter){
 if(!fighter?.mesh?.isSkinnedMesh)throw Error('O Veterano nao possui uma malha 3D skinada.');
 const clips=Object.entries(DURATIONS).map(([key,d])=>makeClip(key,d));
 const exporter=new GLTFExporter();
 // Place the character in bind/rest pose when exporting; root position and
 // runtime poses are restored even if exporting raises an exception.
 const savedRoot=fighter.root.position.clone();
 const savedTurn=fighter.root.rotation.clone();
 const saved=Object.entries(fighter.bones).map(([name,b])=>({
  bone:b,position:b.position.clone(),rotation:b.rotation.clone()
 }));
 try{
  fighter.root.position.set(0,0,0);
  fighter.root.rotation.set(0,0,0);
  for(const entry of saved){
   entry.bone.rotation.set(0,0,0);
   if(entry.bone.name==='Pelvis')entry.bone.position.set(0,1.05,0);
  }
  fighter.root.updateMatrixWorld(true);
  const binary=await new Promise((resolve,reject)=>{
   exporter.parse(fighter.root,resolve,reject,{
    binary:true,trs:true,onlyVisible:true,
    animations:clips,includeCustomExtensions:false
   });
  });
  const blob=new Blob([binary],{type:'model/gltf-binary'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download='shadow-clash-veterano-rig-animacoes.glb';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  return blob.size;
 } finally{
  fighter.root.position.copy(savedRoot);
  fighter.root.rotation.copy(savedTurn);
  for(const state of saved){
   state.bone.position.copy(state.position);
   state.bone.rotation.copy(state.rotation);
  }
  fighter.root.updateMatrixWorld(true);
 }
}