import * as THREE from 'three';
import { createArena } from './arena.mjs';
import { createFighter } from './fighter.mjs';
import { createVeterano, VETERANO_MESH_STATS } from './veterano-mesh.mjs';
import { downloadVeteranoGLB } from './export-veterano.mjs';
import { ATTACKS, samplePose, isImpactFrame, clamp } from './motions.mjs';

const $=id=>document.getElementById(id);
const canvas=$('scene');
let renderer;
try {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
} catch (err) {
  $('loading').innerHTML='<p>WebGL indisponível neste navegador. Ative a aceleração gráfica para jogar.</p>';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.37;
const scene=new THREE.Scene();
const arena=createArena(scene);
const camera=new THREE.PerspectiveCamera(40,1,.05,160);
const player=createVeterano({x:-1.23});
const enemy=createFighter({x:1.23,accent:0x48bfda,dummy:true});
scene.add(player.root,enemy.root);
let inspect3D=false;
function toggle3DView(){
 inspect3D=!inspect3D;
 $('view360')?.setAttribute('aria-pressed',String(inspect3D));
 $('view360')?.classList.toggle('active',inspect3D);
}
$('view360')?.addEventListener('click',toggle3DView);
$('exportGlb')?.addEventListener('click',async()=>{
 const b=$('exportGlb');if(b.disabled)return;
 b.disabled=true;b.textContent='GERANDO...';
 try{
  const size=await downloadVeteranoGLB(player);
  showFeedback('MODELO GLB EXPORTADO ('+Math.round(size/1024)+' KB)',2.0);
 }catch(error){
  console.error('Erro ao exportar o GLB',error);
  showFeedback('ERRO NO GLB — VER CONSOLE',2.3);
 }finally{b.disabled=false;b.textContent='GLB';}
});
console.info('Malha 3D do Veterano:',VETERANO_MESH_STATS);
const target=new THREE.Vector3();
const keys=new Set();
const tmp=new THREE.Vector3();
const effects=[];
const clock=new THREE.Clock();
const FX_GEO=new THREE.SphereGeometry(.13,12,8);
const RING_GEO=new THREE.RingGeometry(.33,.42,24);
let action={name:'idle',t:0,duration:0};
let opponentAction={name:'idle',t:0,duration:0};
let elapsed=0,walkPhase=0,jumpHeight=0,jumpVelocity=0;
let feedbackTime=0,combo=0,comboWindow=0,screenShake=0;
let playerHealth=100,enemyHealth=100,roundOver=false,roundEndTime=0;

function resize() {
  const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.fov=width<650?43:37;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);
resize();

function status(name, progress=0){
  const names={idle:'GUARDA',walk:'MOVIMENTAÇÃO',jump:'SALTO',crouch:'AGACHADO',block:'DEFESA',hit:'IMPACTO',
    jab:'JAB',heavy:'DIRETO PESADO',hook:'GANCHO',lowKick:'CHUTE BAIXO',highKick:'CHUTE ALTO',special:'RUPTURA UMBRA'};
  $('actionName').textContent=names[name]||'GUARDA';
  $('actionMeter').style.width=Math.round(clamp(progress)*100)+'%';
  $('comboText').textContent=combo>1?combo+' GOLPES CONECTADOS':'Aproxime-se e conecte os golpes.';
}
function showFeedback(message,seconds=.65){
  $('feedback').textContent=message;$('feedback').classList.add('show');feedbackTime=seconds;
}
function healthUpdate(){
  $('playerHealth').style.width=playerHealth+'%';
  $('enemyHealth').style.width=enemyHealth+'%';
  $('playerNumber').textContent=Math.ceil(playerHealth)+' / 100';
  $('enemyNumber').textContent=Math.ceil(enemyHealth)+' / 100';
}
function reset(){
  player.root.position.set(-1.23,0,0);enemy.root.position.set(1.23,0,0);
  inspect3D=false;
  $('view360')?.setAttribute('aria-pressed','false');
  $('view360')?.classList.remove('active');
  playerHealth=enemyHealth=100;roundOver=false;roundEndTime=0;
  action={name:'idle',t:0,duration:0};opponentAction={name:'idle',t:0,duration:0};
  jumpVelocity=jumpHeight=0;combo=0;comboWindow=0;screenShake=0;
  healthUpdate();showFeedback('ROUND 01 — LUTE!',1.1);
}
$('reset').addEventListener('click',reset);

function attack(name) {
  if(!ATTACKS[name]||roundOver||action.name!=='idle'||jumpHeight>.04)return;
  action={name,t:0,duration:ATTACKS[name].duration,hit:false};
  status(name,0);
}
function jump() {
  if(jumpHeight>.02||action.name!=='idle'||roundOver)return;
  jumpVelocity=4.8;
  action={name:'jump',t:0,duration:.92};
}
function onKeyDown(event) {
  const key=event.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))event.preventDefault();
  if(event.repeat && !['a','d','s','arrowleft','arrowright','arrowdown','i'].includes(key))return;
  keys.add(key);
  const moves={j:'jab',k:'heavy',h:'hook',l:'lowKick',o:'highKick',u:'special'};
  if(moves[key]&&!event.repeat)attack(moves[key]);
  if(key==='w'||key==='arrowup'||key===' ')jump();
  if(key==='r')reset();
  if(key==='v'&&!event.repeat)toggle3DView();
}
window.addEventListener('keydown',onKeyDown);
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
for(const button of document.querySelectorAll('[data-hold]')) {
  const key=button.dataset.hold;
  const down=e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);keys.add(key);button.classList.add('active');};
  const up=e=>{e.preventDefault();keys.delete(key);button.classList.remove('active');};
  button.addEventListener('pointerdown',down);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,up);
}
for(const button of document.querySelectorAll('[data-action]')) {
  button.addEventListener('pointerdown',e=>{
    e.preventDefault();const name=button.dataset.action;
    if(name==='jump')jump();else attack(name);
  });
}
function impactFx(contact,accent,intensity=1) {
  const material=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.88,depthWrite:false});
  const flash=new THREE.Mesh(FX_GEO,material);
  flash.position.copy(contact); flash.scale.setScalar(.9);scene.add(flash);
  effects.push({mesh:flash,material,life:.30,total:.30,kind:'flash',intensity});
  const ringMat=new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(RING_GEO,ringMat);
  ring.position.set(contact.x,.31,contact.z);ring.rotation.x=-Math.PI/2;
  scene.add(ring);
  effects.push({mesh:ring,material:ringMat,life:.53,total:.53,kind:'ring',intensity});
}
function hitTarget(attackName){
  const data=ATTACKS[attackName];
  const distance=Math.abs(player.root.position.x-enemy.root.position.x);
  if(distance>data.range){showFeedback('FORA DE ALCANCE',.36);combo=0;return;}
  enemyHealth=Math.max(0,enemyHealth-data.damage);
  enemy.root.position.x=Math.min(3.7,enemy.root.position.x+data.knockback);
  opponentAction={name:'hit',t:0,duration:.42};
  player.glove.getWorldPosition(tmp);
  tmp.x=(player.root.position.x+enemy.root.position.x)/2;
  tmp.y=attackName==='lowKick'?.72:(attackName==='highKick'?1.7:1.42);
  const color=attackName==='special'?0xef6174:0xb2f9ff;
  impactFx(tmp,color,attackName==='special'?2:1);
  screenShake=attackName==='special'?.36:.14;
  if(comboWindow>0)combo++;else combo=1;
  comboWindow=1.35;
  showFeedback(attackName==='special'?'RUPTURA UMBRA!':combo>1?combo+' HIT COMBO':'ACERTO!',.68);
  healthUpdate();
  if(enemyHealth<=0){roundOver=true;roundEndTime=2.8;showFeedback('VITÓRIA — VETERANO',2.8);}
}
function animatePlayer(dt){
  const moving=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
  const blocking=keys.has('i'),crouching=keys.has('s')||keys.has('arrowdown');
  let poseName='idle',t=elapsed,duration=1;
  if(action.name==='jump'){
    const previous=action.t;action.t+=dt;
    if(action.t>=action.duration && jumpHeight<=.02)action={name:'idle',t:0,duration:0};
    poseName='jump';t=previous;duration=.92;
  } else if(ATTACKS[action.name]) {
    const previous=action.t;action.t=Math.min(action.t+dt,action.duration);
    const data=ATTACKS[action.name];
    poseName=action.name;t=action.t;duration=data.duration;
    if(!action.hit&&isImpactFrame(previous,action.t,data.impact)){
      action.hit=true;
      if(!roundOver)hitTarget(action.name);
    }
    if(action.t>=data.duration)action={name:'idle',t:0,duration:0};
  } else if(blocking) {poseName='block';}
  else if(crouching) {poseName='crouch';}
  else if(moving!==0){poseName='walk';walkPhase+=dt*10.2;}
  if((poseName==='idle'||poseName==='walk')&&moving!==0&&!roundOver&&jumpHeight<=.02){
    player.root.position.x=clamp(player.root.position.x+moving*2.35*dt,-5.65,5.65);
  }
  if(jumpVelocity!==0||jumpHeight>0){
    jumpHeight+=jumpVelocity*dt;
    jumpVelocity-=11.9*dt;
    if(jumpHeight<0){jumpHeight=0;jumpVelocity=0;}
  }
  player.bob.position.y=jumpHeight;
  const p=samplePose(poseName,t,duration,walkPhase);
  player.applyPose(p,dt);
  const facing=player.root.position.x<enemy.root.position.x?1:-1;
  if(inspect3D)player.root.rotation.y+=dt*.8;else player.setFacing(facing);
  const gap=enemy.root.position.x-player.root.position.x;
  if(Math.abs(gap)<.78){
    player.root.position.x=enemy.root.position.x-Math.sign(gap||1)*.78;
  }
  status(poseName,ATTACKS[poseName]?t/duration:0);
}
function animateEnemy(dt){
  let name='idle',t=elapsed,duration=1;
  if(opponentAction.name==='hit'){
    opponentAction.t+=dt;t=opponentAction.t;duration=opponentAction.duration;name='hit';
    if(opponentAction.t>=opponentAction.duration)opponentAction={name:'idle',t:0,duration:0};
  }
  enemy.applyPose(samplePose(name,t,duration),dt);
  enemy.setFacing(enemy.root.position.x<player.root.position.x?1:-1);
}
function updateEffects(dt){
  for(let i=effects.length-1;i>=0;i--){
    const fx=effects[i];fx.life-=dt;
    const progress=1-clamp(fx.life/fx.total);
    fx.material.opacity=(1-progress)*.77;
    if(fx.kind==='ring')fx.mesh.scale.setScalar(1+progress*3.7*fx.intensity);
    else fx.mesh.scale.setScalar(1+progress*4.1*fx.intensity);
    if(fx.life<=0){scene.remove(fx.mesh);fx.material.dispose();effects.splice(i,1);}
  }
}
function render(){
  const dt=Math.min(clock.getDelta(),.05);
  elapsed+=dt;
  if(comboWindow>0)comboWindow-=dt;else if(combo>0)combo=0;
  if(feedbackTime>0){feedbackTime-=dt;if(feedbackTime<=0)$('feedback').classList.remove('show');}
  if(roundOver){roundEndTime-=dt;if(roundEndTime<=0)reset();}
  animatePlayer(dt);
  animateEnemy(dt);
  arena.update(dt);updateEffects(dt);
  const mid=(player.root.position.x+enemy.root.position.x)/2;
  const distance=Math.abs(enemy.root.position.x-player.root.position.x);
  const portrait=window.innerWidth<700;
  const desiredZ=(portrait?10.9:10.1)+Math.max(0,distance-2.5)*.97;
  target.set(mid*.65,1.77,desiredZ);
  camera.position.lerp(target,Math.min(1,dt*2.9));
  camera.position.x+=(Math.random()-.5)*screenShake;
  camera.position.y+=(Math.random()-.5)*screenShake*.7;
  screenShake*=Math.exp(-dt*16);
  camera.lookAt(mid*.65,1.20,0);
  renderer.render(scene,camera);
  requestAnimationFrame(render);
}
camera.position.set(0,1.77,10.9);
healthUpdate();
$('loading').classList.add('done');
showFeedback('VETERANO 3D · DISTRITO DAS SOMBRAS',1.8);
render();
