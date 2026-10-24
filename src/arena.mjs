import * as THREE from 'three';

function rng(seed=12417) {
  let n=seed>>>0;
  return ()=> {n=(1664525*n+1013904223)>>>0; return n/4294967296;};
}
function mesh(parent,geo,mat,x,y,z) {
  const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z);
  m.receiveShadow=true;m.castShadow=true;parent.add(m);return m;
}
function box(parent,w,h,d,mat,x,y,z) {
  return mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
}
function signTexture(title,subtitle) {
  const c=document.createElement('canvas');c.width=1024;c.height=256;
  const g=c.getContext('2d');
  g.fillStyle='#0b1b25';g.fillRect(0,0,c.width,c.height);
  g.strokeStyle='#23d6dc';g.lineWidth=14;g.strokeRect(9,9,1006,238);
  g.shadowColor='#31e6e9';g.shadowBlur=35;
  g.font='900 110px system-ui,sans-serif';g.textAlign='center';
  g.fillStyle='#c4ffff';g.fillText(title,512,134);
  g.shadowBlur=0;g.font='35px system-ui,sans-serif';g.fillStyle='#d16868';g.fillText(subtitle,512,210);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
export function createArena(scene) {
  const random=rng();
  scene.background=new THREE.Color(0x070d16);
  scene.fog=new THREE.FogExp2(0x0b1d2c,.032);
  scene.add(new THREE.HemisphereLight(0x93c8e8,0x1e1825,1.12));
  const moon=new THREE.DirectionalLight(0xb6d5ef,1.85);
  moon.position.set(-3,12,8);moon.castShadow=true;
  moon.shadow.mapSize.set(1024,1024);
  moon.shadow.camera.left=-11;moon.shadow.camera.right=11;
  moon.shadow.camera.top=10;moon.shadow.camera.bottom=-10;
  moon.shadow.camera.near=1;moon.shadow.camera.far=35;
  moon.shadow.bias=-.0008;scene.add(moon);
  const lampA=new THREE.PointLight(0x46dbe8,16,12,2);lampA.position.set(-4.5,4.2,-1);scene.add(lampA);
  const lampB=new THREE.PointLight(0xffa44f,18,13,2);lampB.position.set(4.4,4.4,-1.8);scene.add(lampB);
  const asphalt=new THREE.MeshStandardMaterial({color:0x26333e,metalness:.31,roughness:.34});
  const curb=new THREE.MeshStandardMaterial({color:0x464f59,roughness:.85});
  const concrete=new THREE.MeshStandardMaterial({color:0x394552,roughness:.88});
  const wall=new THREE.MeshStandardMaterial({color:0x16222c,metalness:.2,roughness:.73});
  const glass=new THREE.MeshStandardMaterial({color:0x7eb5c5,emissive:0x2c738b,emissiveIntensity:.52});
  const metal=new THREE.MeshStandardMaterial({color:0x232e39,metalness:.65,roughness:.42});
  const emissiveBlue=new THREE.MeshStandardMaterial({color:0x9af9ff,emissive:0x39d9f0,emissiveIntensity:2.5});
  const emissiveOrange=new THREE.MeshStandardMaterial({color:0xffdb9e,emissive:0xff8b2e,emissiveIntensity:2.5});
  box(scene,15,.20,10,asphalt,0,-.15,0);
  box(scene,15,.22,1.75,curb,0,-.02,-4.4);
  for(let i=0;i<10;i++) {
    const x=-6.7+i*1.45;
    box(scene,.57,.012,.10,concrete,x,-.038,-2.35);
    box(scene,.12,.014,.31,concrete,x,-.037,2.2);
  }
  const puddleMat=new THREE.MeshPhysicalMaterial({color:0x488ea9,transparent:true,opacity:.26,metalness:.75,roughness:.12,depthWrite:false});
  for(let i=0;i<27;i++){
    const x=-6.8+random()*13.6,z=-3.1+random()*6.5;
    const p=mesh(scene,new THREE.CircleGeometry(.18+random()*.48,20),puddleMat,x,-.038,z);
    p.rotation.x=-Math.PI/2;p.scale.set(1.8,.45,1);
  }
  for(let layer=0;layer<3;layer++){
    for(let i=0;i<15;i++){
      const x=-20+i*2.85+random()*.7;
      const depth=-11-layer*4.2;
      const height=4+random()*9;
      const building=box(scene,2.3,height,2.8,wall,x,height/2-1.5,depth);
      if(layer===0){
        for(let floor=0;floor<Math.min(9,Math.floor(height));floor++){
          for(let col=0;col<3;col++){
            if(random()>.33)box(scene,.35,.44,.03,glass,x-.64+col*.64,floor*.93+.15,depth+1.42);
          }
        }
        box(scene,2.6,.06,3.02,metal,x,Math.max(.2,height-1.4),depth);
      }
      building.castShadow=false;
    }
  }
  box(scene,18,.29,1.25,metal,0,4.5,-7.0);
  for(let i=0;i<16;i++)box(scene,.07,.65,.07,metal,-8.7+i*1.14,4.94,-6.42);
  box(scene,18,.06,.07,metal,0,5.23,-6.4);
  for(const x of [-7.1,7.1])box(scene,.43,5.7,.45,concrete,x,2.85,-7.0);
  box(scene,3.6,1.5,1.5,metal,-1.5,.9,-5.85);
  box(scene,1.1,1.15,1.5,concrete,1.05,.75,-5.82);
  for (const xx of [-2.65,-.3,1.36]){
    const tire=mesh(scene,new THREE.CylinderGeometry(.37,.37,.20,14),wall,xx,.2,-5.08);
    tire.rotation.x=Math.PI/2;
  }
  for(let i=0;i<6;i++){
    const x=-6+i*2.36;
    box(scene,1.25,.78,.52,concrete,x,.39,-4.0);
    box(scene,1.08,.04,.035,metal,x,.6,-3.71);
  }
  function streetLight(x,col) {
    box(scene,.09,4.0,.09,metal,x,2,-2.75);
    box(scene,.70,.12,.26,metal,x+.29,4,-2.74);
    box(scene,.53,.03,.17,col,x+.27,3.93,-2.65);
  }
  streetLight(-5.2,emissiveBlue);streetLight(5.1,emissiveOrange);
  const billboard=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.88),new THREE.MeshBasicMaterial({map:signTexture('SHADOW CLASH','DISTRITO DAS SOMBRAS'),transparent:false}));
  billboard.position.set(3.2,5.8,-7.0);scene.add(billboard);
  const boundaryL=box(scene,.30,1.2,1.4,concrete,-7.5,.50,-.25);
  const boundaryR=box(scene,.30,1.2,1.4,concrete,7.5,.50,-.25);
  boundaryL.castShadow=boundaryR.castShadow=false;
  const count=560,positions=new Float32Array(count*3),speeds=new Float32Array(count);
  for(let i=0;i<count;i++){
    positions[i*3]=-10+random()*20;
    positions[i*3+1]=random()*9;
    positions[i*3+2]=-8+random()*13;
    speeds[i]=3.5+random()*5;
  }
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xa4d4e6,size:.035,transparent:true,opacity:.46,depthWrite:false}));
  scene.add(rain);
  function update(dt){
    for(let i=0;i<count;i++){
      positions[i*3+1]-=speeds[i]*dt;
      if(positions[i*3+1]<0) positions[i*3+1]=8.9;
    }
    rainGeo.attributes.position.needsUpdate=true;
  }
  return {update};
}
