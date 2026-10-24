import * as THREE from 'three';
import { neutralPose } from './motions.mjs';

const sphere = (rx,ry,rz,mat) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12),mat);
  m.scale.set(rx,ry,rz); m.castShadow=true; return m;
};
function cylinder(radTop,radBottom,height,mat,segments=12) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radTop,radBottom,height,segments),mat);
  m.castShadow=true; m.receiveShadow=true; return m;
}
function part(parent, geometry, material, x=0,y=0,z=0) {
  const m=new THREE.Mesh(geometry, material); m.position.set(x,y,z);
  m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function pivot(parent, x=0,y=0,z=0) {
  const p=new THREE.Group(); p.position.set(x,y,z);parent.add(p);return p;
}

/** Articulated placeholder avatar. Swap geometry for a skinned GLB when final model is ready. */
export function createFighter({accent=0xbc2839, x=0, dummy=false}={}) {
  const main=new THREE.Group(); main.position.x=x;
  const playerColor=new THREE.Color(accent);
  const cloth=new THREE.MeshStandardMaterial({color:dummy?0x304450:0x151b23,roughness:.7,metalness:.12});
  const dark=new THREE.MeshStandardMaterial({color:0x090e15,roughness:.82,metalness:.05});
  const jacket=new THREE.MeshStandardMaterial({color:dummy?0x315265:0x1d242e,metalness:.33,roughness:.47});
  const skin=new THREE.MeshStandardMaterial({color:dummy?0x836858:0x916b55,roughness:.86});
  const accentMat=new THREE.MeshStandardMaterial({color:playerColor,roughness:.73,metalness:.1});
  const steel=new THREE.MeshStandardMaterial({color:0x404951,metalness:.7,roughness:.4});
  const hair=new THREE.MeshStandardMaterial({color:dummy?0x17242b:0x313136,roughness:.96});
  const beard=new THREE.MeshStandardMaterial({color:dummy?0x18262a:0x53504e,roughness:1});
  const eyeMat=new THREE.MeshStandardMaterial({color:0x070b0e,roughness:.25});

  const bob=pivot(main);
  const pelvis=pivot(bob,0,1.08,0);
  const waist=sphere(.28,.20,.17,cloth); pelvis.add(waist);
  part(pelvis,new THREE.BoxGeometry(.61,.1,.34),accentMat,0,-.075,0);
  const torso=pivot(pelvis,0,.12,0);
  const coat=cylinder(.35,.28,.68,jacket); coat.position.y=.28; coat.scale.z=.70;torso.add(coat);
  const breast=sphere(.36,.23,.21,jacket);breast.position.y=.46;torso.add(breast);
  const vest=part(torso,new THREE.BoxGeometry(.17,.54,.04),dark,.045,.31,.20);
  vest.rotation.z=.08;
  part(torso,new THREE.BoxGeometry(.02,.50,.02),steel,-.03,.30,.24);
  part(torso,new THREE.BoxGeometry(.09,.48,.026),accentMat,.275,.31,.165).rotation.z=-.18;
  const scarf=part(pelvis,new THREE.BoxGeometry(.115,.56,.055),accentMat,-.19,-.32,.18);
  scarf.rotation.z=.19;
  const scarf2=part(pelvis,new THREE.BoxGeometry(.09,.43,.052),accentMat,-.32,-.27,.16);
  scarf2.rotation.z=.40;

  const neck=pivot(torso,0,.70,0);
  const neckMesh=cylinder(.105,.115,.15,skin);neckMesh.position.y=.06;neck.add(neckMesh);
  const head=pivot(neck,0,.16,0);
  head.add(sphere(.215,.26,.19,skin));
  const nose=sphere(.055,.082,.073,skin);nose.position.set(0,-.025,.191);head.add(nose);
  for (const dx of [-.085,.085]) {
    const eye=sphere(.034,.017,.022,eyeMat);eye.position.set(dx,.025,.182);head.add(eye);
    const brow=sphere(.072,.021,.028,hair);brow.position.set(dx,.085,.17);head.add(brow);
  }
  const facialHair=sphere(.196,.118,.183,beard);facialHair.position.y=-.153;head.add(facialHair);
  const mouth=sphere(.067,.013,.02,dark);mouth.position.set(0,-.12,.171);head.add(mouth);
  const cap=sphere(.235,.122,.206,dark);cap.position.y=.195;head.add(cap);
  const brim=part(head,new THREE.BoxGeometry(.23,.035,.15),dark,0,.185,-.23);
  brim.rotation.x=-.14;
  part(head,new THREE.BoxGeometry(.10,.045,.03),accentMat,0,.175,-.30);

  function makeArm(x,z,which) {
    const shoulder=pivot(torso,x,.54,z);
    shoulder.add(sphere(.155,.16,.16,jacket));
    const sleeve=cylinder(.13,.115,.32,jacket);sleeve.position.y=-.17; shoulder.add(sleeve);
    const elbow=pivot(shoulder,0,-.33,0);
    elbow.add(sphere(.12,.12,.12,cloth));
    const forearm=cylinder(.115,.085,.30,jacket);forearm.position.y=-.16;elbow.add(forearm);
    const wrist=pivot(elbow,0,-.32,0);
    wrist.add(sphere(.112,.10,.107,dark));
    const glove=sphere(.12,.115,.105,dark);glove.position.y=-.07;wrist.add(glove);
    part(wrist,new THREE.BoxGeometry(.21,.044,.22),accentMat,0,.02,0);
    for (let i=0;i<3;i++) {
      const finger=sphere(.027,.07,.030,skin);
      finger.position.set(-.064+i*.065,-.135,.026);wrist.add(finger);
    }
    return {shoulder,elbow,wrist};
  }
  const rearArm=makeArm(-.34,-.12,'rear');
  const leadArm=makeArm(.34,.19,'lead');

  function makeLeg(x,z) {
    const hip=pivot(pelvis,x,-.055,z);
    hip.add(sphere(.19,.16,.16,cloth));
    const thigh=cylinder(.175,.135,.43,cloth);thigh.position.y=-.22;hip.add(thigh);
    const knee=pivot(hip,0,-.43,0);
    knee.add(sphere(.136,.12,.135,cloth));
    part(knee,new THREE.BoxGeometry(.23,.18,.06),steel,0,-.04,.112);
    const shin=cylinder(.135,.105,.43,cloth);shin.position.y=-.23;knee.add(shin);
    const ankle=pivot(knee,0,-.46,0);
    const shoe=part(ankle,new THREE.BoxGeometry(.34,.18,.24),dark,.09,-.065,.015);
    shoe.castShadow=true;
    part(ankle,new THREE.BoxGeometry(.30,.04,.26),steel,.10,-.155,.014);
    return {hip,knee,ankle};
  }
  const rearLeg=makeLeg(-.20,-.08);
  const leadLeg=makeLeg(.20,.13);
  const current=neutralPose();
  const poseTargets={
    pelvisY: [pelvis,'position','y',1.08],
    pelvisX: [pelvis,'position','x',0],
    torsoZ: [torso,'rotation','z',0], torsoY: [torso,'rotation','y',0],
    headZ: [head,'rotation','z',0],
    leadArmZ:[leadArm.shoulder,'rotation','z',0],rearArmZ:[rearArm.shoulder,'rotation','z',0],
    leadElbowZ:[leadArm.elbow,'rotation','z',0],rearElbowZ:[rearArm.elbow,'rotation','z',0],
    leadArmY:[leadArm.shoulder,'rotation','y',0],rearArmY:[rearArm.shoulder,'rotation','y',0],
    leadHipZ:[leadLeg.hip,'rotation','z',0],rearHipZ:[rearLeg.hip,'rotation','z',0],
    leadKneeZ:[leadLeg.knee,'rotation','z',0],rearKneeZ:[rearLeg.knee,'rotation','z',0],
  };
  function applyPose(p,dt=1/60) {
    const alpha=1-Math.exp(-Math.max(0,dt)*28);
    for (const [key,[obj,type,axis,base]] of Object.entries(poseTargets)) {
      current[key]=THREE.MathUtils.lerp(current[key]??0,p[key]??0,alpha);
      obj[type][axis]=base+current[key];
    }
  }
  function setFacing(direction) {main.rotation.y=direction<0?Math.PI:0;}
  setFacing(dummy?-1:1);
  applyPose(neutralPose(),0.45);
  return {root:main,bob,pelvis,torso,head,leadArm,rearArm,leadLeg,rearLeg,
          glove:leadArm.wrist,applyPose,setFacing,accent:playerColor,dummy};
}
