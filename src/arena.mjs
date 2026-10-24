import * as THREE from 'three';

// Arena 01: DISTRITO DAS SOMBRAS.
// Rua industrial molhada e iluminacao azul/ambar, conforme a arte aprovada.
// Nenhum ringue, cordas, postes de boxe ou plataforma elevada.
function rng(seed=24910){let s=seed>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296);}
const random=rng();
function mesh(parent,geometry,material,x=0,y=0,z=0,cast=true){
 const m=new THREE.Mesh(geometry,material);
 m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;
}
function box(p,w,h,d,mat,x,y,z,cast=true){
 return mesh(p,new THREE.BoxGeometry(w,h,d),mat,x,y,z,cast);
}
function signTexture(){
 const c=document.createElement('canvas');c.width=1024;c.height=256;
 const g=c.getContext('2d');g.fillStyle='#0d2028';g.fillRect(0,0,1024,256);
 g.strokeStyle='#4ac6d5';g.lineWidth=11;g.strokeRect(7,7,1010,242);
 g.fillStyle='#baf4ff';g.shadowColor='#6de0ea';g.shadowBlur=30;
 g.font='900 88px system-ui';g.textAlign='center';g.fillText('SHADOW CLASH',512,119);
 g.shadowBlur=0;g.fillStyle='#f3b490';g.font='30px system-ui';
 g.fillText('DISTRITO DAS SOMBRAS',512,190);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
export function createArena(scene){
 scene.background=new THREE.Color(0x091521);
 scene.fog=new THREE.FogExp2(0x102535,.023);
 scene.add(new THREE.HemisphereLight(0x91b4d4,0x1c1517,1.55));
 const moon=new THREE.DirectionalLight(0xcbe8f8,2.25);
 moon.position.set(-2,12,8);moon.castShadow=true;
 moon.shadow.mapSize.set(1024,1024);
 moon.shadow.camera.left=-11;moon.shadow.camera.right=11;
 moon.shadow.camera.top=9;moon.shadow.camera.bottom=-9;
 moon.shadow.camera.near=.1;moon.shadow.camera.far=35;
 moon.shadow.bias=-.0005;scene.add(moon);
 const cyan=new THREE.PointLight(0x3fd4df,34,13,2);cyan.position.set(-5.1,4,-2.2);scene.add(cyan);
 const amber=new THREE.PointLight(0xffae63,35,14,2);amber.position.set(5.2,4,-2.5);scene.add(amber);
 const street=new THREE.MeshPhysicalMaterial({color:0x29333c,metalness:.6,roughness:.25,clearcoat:.65,clearcoatRoughness:.2});
 const gray=new THREE.MeshStandardMaterial({color:0x515861,roughness:.88});
 const dark=new THREE.MeshStandardMaterial({color:0x1a2732,roughness:.89,metalness:.12});
 const iron=new THREE.MeshStandardMaterial({color:0x33434d,roughness:.45,metalness:.7});
 const glassBlue=new THREE.MeshStandardMaterial({color:0x78bad1,emissive:0x298ca8,emissiveIntensity:1.25,roughness:.22});
 const glassAmber=new THREE.MeshStandardMaterial({color:0xeac19b,emissive:0xed9f52,emissiveIntensity:1.0,roughness:.22});
 const rainPuddle=new THREE.MeshPhysicalMaterial({color:0x79b4c9,transparent:true,opacity:.23,roughness:.06,metalness:.55,depthWrite:false});
 const lightBlue=new THREE.MeshBasicMaterial({color:0xc0ffff});
 const lightGold=new THREE.MeshBasicMaterial({color:0xffd5a6});

 // A malha da pista ocupa Y=0 — os pes dos lutadores e as hitboxes ficam no mesmo piso.
 box(scene,22,.22,16,street,0,-.115,0);
 box(scene,22,.26,1.4,gray,0,-.055,-6.85);
 box(scene,22,.26,.85,gray,0,-.075,6.4);
 for(let i=0;i<9;i++){
  box(scene,.7,.012,.13,gray,-8.2+i*2.0,.002,-2.7,false);
  box(scene,.11,.013,.42,gray,-8+i*1.96,.003,3.65,false);
 }
 // Estruturas de esgoto e reflexos d'agua.
 for(let i=0;i<38;i++){
  const x=-10+random()*20,z=-6+random()*11;
  const p=mesh(scene,new THREE.CircleGeometry(.17+random()*.4,20),rainPuddle,x,.008,z,false);
  p.rotation.x=-Math.PI/2;p.scale.set(1.3+random(),.42+random()*.22,1);
 }
 for(let i=0;i<3;i++){
  const x=-7.2+i*6.6;
  const drain=box(scene,.6,.006,.16,iron,x,.008,3.6,false);
  for(let j=0;j<5;j++)box(scene,.028,.007,.17,dark,x-.24+j*.12,.013,3.6,false);
 }
 // O corredor de luta fica vazio; arquitetura concentrada nos lados e fundo.
 for(const side of [-1,1]){
  for(let layer=0;layer<3;layer++){
   const depth=-7.9-layer*4.3;
   for(let i=0;i<3;i++){
    const x=side*(7.8+i*3.4),h=6+random()*8;
    const facade=box(scene,2.9,h,3.8,(layer+i)%2?dark:iron,x,h/2-.65,depth,false);
    for(let row=0;row<Math.floor(h*.85);row++){
     for(let col=-1;col<=1;col++){
      if(random()<.42)continue;
      box(scene,.34,.44,.028,random()<.23?glassAmber:glassBlue,x+col*.72,.3+row*.93,depth+1.92,false);
     }
    }
    if(layer===0){
     for(let y=0;y<3;y++){
      box(scene,2.15,.08,.67,iron,x,1.65+y*1.36,depth+2.12,false);
      for(let k=0;k<4;k++)box(scene,.025,.48,.025,gray,x-.8+k*.53,1.92+y*1.36,depth+2.5,false);
     }
    }
    facade.castShadow=false;
   }
  }
 }
 // Distancia e silhuetas metropolitanas acima da rua.
 for(let i=0;i<24;i++){
  const x=-21+i*1.9,h=6+random()*20;
  box(scene,1.65,h,2.1,dark,x,h/2-2.1,-32-random()*7,false);
 }
 // Caminhao bloqueando a rua, totalmente atras dos personagens.
 const truck=new THREE.Group();truck.position.set(-.85,0,-8.45);scene.add(truck);
 box(truck,4.2,2.0,1.63,iron,-.9,1.43,0);
 box(truck,1.30,1.63,1.65,gray,2.0,1.1,0);
 box(truck,.86,.56,.02,glassBlue,2.2,1.48,.84,false);
 box(truck,6.15,.15,1.82,dark,.38,.47,0);
 for(let i=0;i<3;i++){
  const wheel=mesh(truck,new THREE.CylinderGeometry(.4,.4,.22,16),dark,-2.3+i*2.07,.33,.9);
  wheel.rotation.x=Math.PI/2;
 }
 // Barreiras, caixas e cones fora da area de confronto.
 for(let i=0;i<6;i++){
  const x=-8.6+i*3.3;
  const b=box(scene,1.28,.65,.7,gray,x,.36,-5.7);
  b.rotation.y=(i%2?-.075:.075);
  for(let s=0;s<2;s++)box(scene,.4,.07,.02,iron,x-.24+s*.47,.56,-5.345,false);
 }
 for(let i=0;i<11;i++){
  const x=-8.5+random()*17,z=-6.4-random()*2;
  const w=.45+random()*.3,h=.4+random()*.55;
  box(scene,w,h,.53,iron,x,h/2,z);
 }
 // Passarela metalica e cabos altos cruzam a rua.
 box(scene,18,.26,1.42,iron,0,5.18,-12.3,false);
 for(let i=0;i<15;i++)box(scene,.035,.63,.04,gray,-8.45+i*1.2,5.58,-11.60,false);
 box(scene,18,.04,.05,gray,0,5.99,-11.56,false);
 for(const side of [-1,1]){
  box(scene,.4,5.1,.5,gray,side*8.6,2.6,-12.25,false);
  box(scene,.08,4.1,.08,iron,side*6.35,2,-4.6,false);
  box(scene,.73,.11,.28,iron,side*6.1,4.1,-4.6,false);
  box(scene,.60,.025,.18,side===1?lightGold:lightBlue,side*6.1,4.02,-4.43,false);
 }
 const banner=new THREE.Mesh(new THREE.PlaneGeometry(3.9,.98),new THREE.MeshBasicMaterial({map:signTexture(),side:THREE.DoubleSide}));
 banner.position.set(2.0,5.64,-12.15);scene.add(banner);
 const steamMaterial=new THREE.MeshBasicMaterial({color:0x99c0cc,transparent:true,opacity:.055,depthWrite:false});
 const steam=[];
 for(const px of [-6,6])for(let i=0;i<4;i++){
  const puff=mesh(scene,new THREE.SphereGeometry(.25+i*.11,9,7),steamMaterial,px,.18+i*.40,-4.6,false);
  steam.push({puff,offset:i*.6});
 }
 const count=300,positions=new Float32Array(count*3),speeds=new Float32Array(count);
 for(let i=0;i<count;i++){
  positions[i*3]=-11+random()*22;positions[i*3+1]=random()*9;positions[i*3+2]=-12+random()*18;
  speeds[i]=3.2+random()*5;
 }
 const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const rain=new THREE.Points(rainGeometry,new THREE.PointsMaterial({color:0xb6ddea,size:.036,transparent:true,opacity:.46,depthWrite:false}));
 scene.add(rain);
 let time=0;
 return {update(dt){
  time+=dt;
  for(let i=0;i<count;i++){
   positions[i*3+1]-=speeds[i]*dt;if(positions[i*3+1]<0)positions[i*3+1]=8.9;
  }
  rainGeometry.attributes.position.needsUpdate=true;
  for(const s of steam){
   s.puff.position.y=.18+s.offset+Math.sin(time*.68+s.offset)*.13;
  }
 }};
}
