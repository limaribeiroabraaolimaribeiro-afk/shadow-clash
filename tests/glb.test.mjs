import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const glb=new URL('../assets/models/veterano-rig-3d.glb',import.meta.url);
const jpg=new URL('../assets/arena/rua-industrial-aprovada.jpg',import.meta.url);

test('modelo 3D e um GLB valido com pele e esqueleto',()=>{
  const data=readFileSync(glb);
  assert.equal(data.toString('ascii',0,4),'glTF');
  assert.equal(data.readUInt32LE(4),2);
  assert.equal(data.readUInt32LE(8),data.length);
  const jsonBytes=data.readUInt32LE(12);
  assert.equal(data.toString('ascii',16,20),'JSON');
  const asset=JSON.parse(data.toString('utf8',20,20+jsonBytes));
  assert.ok(asset.meshes?.length>0,'missing mesh');
  assert.equal(asset.skins?.[0]?.joints.length,16,'16 humanoid joints');
  assert.ok(asset.animations?.length>=12,'12 separate combat animations');
  const attributes=asset.meshes[0].primitives[0].attributes;
  assert.ok(attributes.POSITION!==undefined);
  assert.ok(attributes.NORMAL!==undefined);
  assert.ok(attributes.JOINTS_0!==undefined);
  assert.ok(attributes.WEIGHTS_0!==undefined);
  assert.ok(asset.accessors[attributes.POSITION].count>10000,'actual 3D vertices');
  for(const name of ['idle_guard','walk_forward','jab','heavy','hook','lowKick','highKick','block','jump','hit','special']){
    assert.ok(asset.animations.some(a=>a.name===name),'missing clip '+name);
  }
});

test('arena aprovada foi incluida como textura JPEG',()=>{
  const data=readFileSync(jpg);
  assert.ok(data.length>40000);
  assert.equal(data[0],0xff);assert.equal(data[1],0xd8);
  assert.equal(data[data.length-2],0xff);assert.equal(data[data.length-1],0xd9);
});
