import * as THREE from 'three';

/**
 * Veterano: MALHA 3D REAL, com triangulos, normais, pesos por vertice e 16 ossos.
 * A geometria e criada por codigo, nao sao sprites ou planos com imagens.
 * Referencia: fotos aprovadas (boné para tras, barba, jaqueta preta,
 * mochila, pano vermelho, calca larga e botas). Rosto e aproximacao,
 * nao fotogrametria nem o arquivo Meshy.
 */
const JOINTS=[
  ['Pelvis',-1,0,1.05,0],
  ['Spine',0,0,.12,0],
  ['Neck',1,0,.57,0],
  ['Head',2,0,.155,0],
  ['LeadShoulder',1,.305,.46,0],
  ['LeadElbow',4,0,-.315,0],
  ['LeadWrist',5,0,-.29,0],
  ['RearShoulder',1,-.305,.46,0],
  ['RearElbow',7,0,-.315,0],
  ['RearWrist',8,0,-.29,0],
  ['LeadHip',0,.19,-.10,.01],
  ['LeadKnee',10,0,-.45,0],
  ['LeadAnkle',11,0,-.46,0],
  ['RearHip',0,-.19,-.10,-.01],
  ['RearKnee',13,0,-.45,0],
  ['RearAnkle',14,0,-.46,0]
];
const basePositions=[];
for(let i=0;i<JOINTS.length;i++){
 const [,par,x,y,z]=JOINTS[i]; const p=par<0?[0,0,0]:basePositions[par];
 basePositions.push([p[0]+x,p[1]+y,p[2]+z]);
}
const MAT_COLORS={pele:0x98775f,peleEscura:0x88634d,preto:0x13161a,jaqueta:0x1b2026,
 casacoCostura:0x292e34,calca:0x16181b,dobra:0x222529,barba:0x7b7b7a,
 barbaEscura:0x454648,olho:0x191715,branco:0xd4c4ae,bone:0x101217,
 visor:0x67252f,mochila:0x191d22,mochilaBolso:0x272b30,cinza:0x515257,
 vermelho:0x8e2834,ziper:0x858990,sola:0x2e3338};
const mats=[
 new THREE.MeshStandardMaterial({name:'pele',color:0xffffff,vertexColors:true,roughness:.86}),
 new THREE.MeshStandardMaterial({name:'jaqueta_impermeavel',color:0xffffff,vertexColors:true,roughness:.32,metalness:.2}),
 new THREE.MeshStandardMaterial({name:'calca_larga',color:0xffffff,vertexColors:true,roughness:.85}),
 new THREE.MeshStandardMaterial({name:'bone_mochila_botas',color:0xffffff,vertexColors:true,roughness:.61}),
 new THREE.MeshStandardMaterial({name:'barba_grisalha',color:0xffffff,vertexColors:true,roughness:.99}),
 new THREE.MeshStandardMaterial({name:'tecido_vermelho',color:0xffffff,vertexColors:true,roughness:.76}),
 new THREE.MeshStandardMaterial({name:'metal_detalhes',color:0xffffff,vertexColors:true,roughness:.4,metalness:.54}),
 new THREE.MeshStandardMaterial({name:'camiseta_cinza',color:0xffffff,vertexColors:true,roughness:.85})
];
const pos=[],vertexColor=[],jointAttr=[],weightAttr=[],groupIndices=Array.from({length:mats.length},()=>[]);
function vertex(bone,x,y,z,hex){
 const origin=basePositions[bone],c=new THREE.Color(hex);
 pos.push(x+origin[0],y+origin[1],z+origin[2]);
 vertexColor.push(c.r,c.g,c.b);jointAttr.push(bone,0,0,0);weightAttr.push(1,0,0,0);
}
function primitive(bone,mat,geometry,offset,scale,hex,rotation=[0,0,0]){
 const begin=pos.length/3;
 const tr=new THREE.Matrix4().compose(new THREE.Vector3(...offset),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));
 const a=geometry.attributes.position,tmp=new THREE.Vector3();
 for(let i=0;i<a.count;i++){tmp.fromBufferAttribute(a,i).applyMatrix4(tr);vertex(bone,tmp.x,tmp.y,tmp.z,hex);}
 const idx=geometry.getIndex(),out=groupIndices[mat];
 if(idx){for(let j=0;j<idx.count;j++)out.push(begin+idx.getX(j));}
 else{for(let j=0;j<a.count;j++)out.push(begin+j);}
}
const SPHERE=new THREE.SphereGeometry(1,20,14),BOX=new THREE.BoxGeometry(1,1,1);
function ell(b,m,at,scale,color){primitive(b,m,SPHERE,at,scale,color)}
function cube(b,m,at,scale,color,rot){primitive(b,m,BOX,at,scale,color,rot)}
function tube(b,m,p0,p1,r,color){
 const a=new THREE.Vector3(...p0),z=new THREE.Vector3(...p1);
 const delta=z.clone().sub(a),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
 const p=a.add(z).multiplyScalar(.5);
 const e=new THREE.Euler().setFromQuaternion(q);
 const g=new THREE.CylinderGeometry(r*.93,r,delta.length(),14,3);
 primitive(b,m,g,p.toArray(),[1,1,1],color,[e.x,e.y,e.z]);g.dispose();
}
// Anatomical clothing loft: variable elliptical sections, visible creases and seams.
function loft(b,m,rings,color,fold=.0,phase=0,steps=24){
 const start=pos.length/3;
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz,dx=0,dz=0]=rings[j];
  for(let i=0;i<steps;i++){
   const ang=i/steps*Math.PI*2;
   const wr=1+fold*(Math.sin(ang*7+j*.9+phase)*.6+Math.sin(ang*12-j*.7)*.25);
   vertex(b,dx+Math.cos(ang)*rx*wr,y,dz+Math.sin(ang)*rz*wr,color);
  }
 }
 const out=groupIndices[m];
 for(let j=0;j<rings.length-1;j++){
  for(let i=0;i<steps;i++){
   const a=start+j*steps+i,c=start+(j+1)*steps+i,ab=start+j*steps+(i+1)%steps,d=start+(j+1)*steps+(i+1)%steps;
   out.push(a,ab,c,ab,d,c);
  }
 }
 for(let i=1;i<steps-1;i++){
  out.push(start,start+i+1,start+i);
  const bottom=start+(rings.length-1)*steps;
  out.push(bottom,bottom+i,bottom+i+1);
 }
}
// Corpo, pescoço e jaqueta (silhueta normal, não musculosa).
loft(0,2,[[.09,.23,.14],[0,.262,.161],[-.16,.26,.164],[-.24,.22,.15]],MAT_COLORS.calca,.04);
loft(1,1,[[.69,.22,.14],[.60,.31,.205],[.45,.325,.215],[.25,.322,.210],
 [.03,.3,.20],[-.13,.288,.188],[-.17,.285,.186]],MAT_COLORS.jaqueta,.055,.6);
loft(1,7,[[-.14,.274,.184],[-.18,.268,.18],[-.23,.252,.17]],MAT_COLORS.cinza);
loft(1,1,[[.72,.144,.123],[.68,.174,.143],[.61,.18,.146]],MAT_COLORS.casacoCostura,.05);
cube(1,6,[0,.30,.206],[.015,.47,.014],MAT_COLORS.ziper);
cube(1,1,[-.085,.3,.204],[.036,.44,.014],MAT_COLORS.casacoCostura,[0,0,-.18]);
cube(1,1,[.085,.3,.204],[.036,.43,.014],MAT_COLORS.casacoCostura,[0,0,.16]);
for(let s of [-1,1])cube(1,6,[s*.205,.10,.18],[.10,.014,.018],MAT_COLORS.ziper,[0,0,s*.18]);
// Mochila tridimensional com bolsos, zíper e alças.
ell(1,3,[-.023,.28,-.278],[.268,.379,.124],MAT_COLORS.mochila);
cube(1,3,[-.02,.31,-.397],[.40,.39,.047],MAT_COLORS.mochilaBolso);
cube(1,3,[-.02,.17,-.427],[.34,.24,.023],MAT_COLORS.mochila);
cube(1,6,[-.02,.38,-.428],[.23,.014,.01],MAT_COLORS.ziper);
for(const s of [-1,1]){
 tube(1,3,[s*.215,.59,.045],[s*.225,.06,.11],.027,MAT_COLORS.mochilaBolso);
 cube(1,6,[s*.216,.22,.116],[.05,.027,.018],MAT_COLORS.ziper);
}
// Rosto tridimensional: mandíbula, orelhas, nariz, bochechas, olhos, sobrancelhas e barba.
tube(2,0,[0,-.05,0],[0,.16,0],.086,MAT_COLORS.pele);
ell(3,0,[0,.032,0],[.177,.225,.170],MAT_COLORS.pele);
ell(3,0,[0,-.064,.064],[.154,.143,.12],MAT_COLORS.peleEscura);
ell(3,4,[0,-.116,.094],[.155,.089,.096],MAT_COLORS.barba);
ell(3,4,[0,-.154,.113],[.086,.060,.071],MAT_COLORS.barbaEscura);
ell(3,0,[0,-.03,.174],[.046,.071,.049],MAT_COLORS.pele);
ell(3,0,[0,-.073,.202],[.047,.025,.028],MAT_COLORS.pele);
for(const s of [-1,1]){
 ell(3,0,[s*.15,-.01,-.006],[.038,.065,.045],MAT_COLORS.pele);
 ell(3,0,[s*.068,.037,.155],[.057,.033,.026],MAT_COLORS.peleEscura);
 ell(3,0,[s*.065,.04,.179],[.032,.015,.011],MAT_COLORS.branco);
 ell(3,7,[s*.064,.040,.191],[.013,.015,.008],MAT_COLORS.olho);
 ell(3,4,[s*.068,.083,.178],[.071,.014,.013],MAT_COLORS.barbaEscura);
 ell(3,4,[s*.075,-.117,.12],[.076,.051,.05],MAT_COLORS.barba);
 ell(3,4,[s*.055,-.093,.179],[.052,.019,.015],MAT_COLORS.barbaEscura);
}
ell(3,0,[0,-.111,.181],[.059,.010,.01],MAT_COLORS.peleEscura);
// Boné preto virado para TRÁS com aba vinho.
ell(3,3,[0,.19,-.014],[.198,.099,.184],MAT_COLORS.bone);
ell(3,3,[0,.148,-.180],[.167,.026,.09],MAT_COLORS.bone);
cube(3,5,[0,.138,-.239],[.17,.016,.115],MAT_COLORS.visor,[.09,0,0]);
cube(3,6,[0,.139,.183],[.097,.018,.015],MAT_COLORS.ziper);
// Mangas separadas por ossos no ombro/cotovelo/punho.
for(const [a,b,c,s] of [[4,5,6,1],[7,8,9,-1]]){
 ell(a,1,[0,0,0],[.153,.152,.139],MAT_COLORS.jaqueta);
 loft(a,1,[[.055,.140,.134],[0,.145,.13],[-.1,.141,.127],
  [-.21,.13,.121],[-.30,.119,.115],[-.344,.117,.11]],MAT_COLORS.jaqueta,.065,s);
 ell(b,1,[0,-.01,0],[.124,.114,.120],MAT_COLORS.casacoCostura);
 loft(b,1,[[.028,.116,.112],[-.05,.132,.119],[-.16,.126,.117],
  [-.25,.108,.104],[-.30,.10,.10]],MAT_COLORS.jaqueta,.066,1.2);
 cube(c,3,[0,0,0],[.145,.065,.14],MAT_COLORS.casacoCostura);
 ell(c,0,[0,-.078,.014],[.092,.092,.079],MAT_COLORS.pele);
 for(let k=0;k<4;k++){
  const x=(k-1.5)*.038;
  tube(c,0,[x,-.12,.06],[x,-.19+Math.abs(k-1.5)*.01,.081],.016,MAT_COLORS.pele);
 }
 tube(c,0,[s*.075,-.08,.02],[s*.139,-.115,.080],.022,MAT_COLORS.pele);
}
// Fita de tecido vermelho segurada pela mão, e NÃO luvas de luta.
loft(6,5,[[-.12,.027,.021],[-.23,.029,.023],[-.42,.019,.017],
 [-.63,.013,.013]],MAT_COLORS.vermelho,.16,2,12);
// Calças pretas largas com pregas que acompanham joelhos e tornozelos.
for(const [a,b,c,s] of [[10,11,12,1],[13,14,15,-1]]){
 ell(a,2,[0,-.02,0],[.18,.155,.155],MAT_COLORS.calca);
 loft(a,2,[[.06,.198,.168],[-.05,.208,.17],[-.16,.198,.167],
  [-.28,.184,.16],[-.40,.174,.15],[-.50,.17,.144]],MAT_COLORS.calca,.09,s);
 ell(b,2,[0,-.01,0],[.170,.105,.14],MAT_COLORS.dobra);
 loft(b,2,[[.04,.165,.146],[-.09,.167,.144],[-.24,.156,.14],
  [-.38,.151,.137],[-.49,.145,.131]],MAT_COLORS.calca,.10,s+1);
 ell(c,3,[0,-.016,0],[.132,.164,.124],MAT_COLORS.preto);
 cube(c,3,[0,-.08,.082],[.216,.177,.344],MAT_COLORS.preto);
 cube(c,3,[0,-.17,.091],[.233,.032,.375],MAT_COLORS.sola);
 for(let k=0;k<3;k++)cube(c,6,[0,-.012-.03*k,.252],[.097,.008,.009],MAT_COLORS.ziper);
}
// Real indexed triangle geometry with per-vertex bone influences.
const geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
geometry.setAttribute('color',new THREE.Float32BufferAttribute(vertexColor,3));
geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(jointAttr,4));
geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weightAttr,4));
const all=[];let cursor=0;
for(let i=0;i<groupIndices.length;i++){
 const group=groupIndices[i]; all.push(...group);geometry.addGroup(cursor,group.length,i);cursor+=group.length;
}
geometry.setIndex(all);geometry.computeVertexNormals();geometry.computeBoundingSphere();
export const VETERANO_MESH_STATS=Object.freeze({
 vertices:pos.length/3,triangles:all.length/3,joints:JOINTS.length,materials:mats.length
});
export function createVeterano({x=0}={}){
 const root=new THREE.Group();root.name='VeteranoRoot';root.position.x=x;
 const bob=new THREE.Group();bob.name='JumpOffset';root.add(bob);
 const bones=JOINTS.map(([name,,tx,ty,tz])=>{
  const bone=new THREE.Bone();bone.name=name;bone.position.set(tx,ty,tz);return bone;
 });
 JOINTS.forEach(([,parent],i)=>parent<0?bob.add(bones[i]):bones[parent].add(bones[i]));
 bob.updateMatrixWorld(true);
 const mesh=new THREE.SkinnedMesh(geometry,mats);mesh.name='VeteranoReal3D';
 mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
 bob.add(mesh);root.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(bones));
 const joints=Object.fromEntries(bones.map(b=>[b.name,b]));
 const targets={
  pelvisY:[joints.Pelvis,'position','y',1.05],pelvisX:[joints.Pelvis,'position','x',0],
  torsoZ:[joints.Spine,'rotation','z',0],torsoY:[joints.Spine,'rotation','y',0],
  headZ:[joints.Head,'rotation','z',0],
  leadArmZ:[joints.LeadShoulder,'rotation','z',0],
  rearArmZ:[joints.RearShoulder,'rotation','z',0],
  leadElbowZ:[joints.LeadElbow,'rotation','z',0],
  rearElbowZ:[joints.RearElbow,'rotation','z',0],
  leadArmY:[joints.LeadShoulder,'rotation','y',0],
  rearArmY:[joints.RearShoulder,'rotation','y',0],
  leadHipZ:[joints.LeadHip,'rotation','z',0],rearHipZ:[joints.RearHip,'rotation','z',0],
  leadKneeZ:[joints.LeadKnee,'rotation','z',0],rearKneeZ:[joints.RearKnee,'rotation','z',0]
 };
 function applyPose(pose,dt=1/60){
  const alpha=1-Math.exp(-Math.min(.05,Math.max(0,dt))*26);
  for(const [key,[joint,type,axis,base]] of Object.entries(targets)){
   joint[type][axis]=THREE.MathUtils.lerp(joint[type][axis],base+(pose[key]??0),alpha);
  }
  // Opposed shoulder turn preserves depth in all 3D attacks.
  joints.RearShoulder.rotation.x=THREE.MathUtils.lerp(joints.RearShoulder.rotation.x,-.10,alpha);
  joints.LeadShoulder.rotation.x=THREE.MathUtils.lerp(joints.LeadShoulder.rotation.x,.10,alpha);
 }
 function setFacing(direction){root.rotation.y=direction<0?-.27:.27;}
 return {root,bob,mesh,bones:joints,glove:joints.LeadWrist,
   pelvis:joints.Pelvis,torso:joints.Spine,head:joints.Head,
   applyPose,setFacing,dummy:false,accent:new THREE.Color(0xbd3346)};
}