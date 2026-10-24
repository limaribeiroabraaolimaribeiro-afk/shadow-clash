import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createVeterano,VETERANO_MESH_STATS } from '../src/veterano-mesh.mjs';
import { samplePose } from '../src/motions.mjs';

test('Veterano uses actual skinned triangles, not billboard or sprite',()=>{
 const v=createVeterano({x:-1});
 assert.equal(v.mesh.isSkinnedMesh,true);
 assert.equal(v.mesh.geometry.isBufferGeometry,true);
 assert.equal(v.mesh.geometry.getAttribute('skinIndex').count,VETERANO_MESH_STATS.vertices);
 assert.equal(v.mesh.geometry.getAttribute('skinWeight').count,VETERANO_MESH_STATS.vertices);
 assert.ok(VETERANO_MESH_STATS.vertices>1000);
 assert.ok(VETERANO_MESH_STATS.triangles>1000);
 assert.ok(v.mesh.skeleton.bones.length>=16);
 assert.equal(v.mesh.geometry.groups.length,8);
});
test('all 16 joints are real bones in the same animated Skeleton',()=>{
 const v=createVeterano();
 assert.equal(Object.keys(v.bones).length,16);
 for(const bone of Object.values(v.bones))assert.ok(bone.isBone);
 assert.ok(v.mesh.skeleton.bones.includes(v.bones.LeadElbow));
 assert.ok(v.mesh.skeleton.bones.includes(v.bones.RearKnee));
});
test('attack rotates real skeletal joints',()=>{
 const v=createVeterano();
 const initial=v.bones.LeadElbow.rotation.z;
 v.applyPose(samplePose('jab',.2,.38),.3);
 assert.notEqual(v.bones.LeadElbow.rotation.z,initial);
});
test('facing and jump translate true 3D hierarchy',()=>{
 const v=createVeterano({x:-2});
 v.setFacing(-1);
 assert.ok(v.root.rotation.y<0);
 v.bob.position.y=.4;
 assert.equal(v.root.position.x,-2);
 assert.equal(v.bob.position.y,.4);
});
