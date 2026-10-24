import test from 'node:test';
import assert from 'node:assert/strict';
import {ATTACKS, samplePose, neutralPose, isImpactFrame, clamp} from '../src/motions.mjs';

test('every attack has a valid timing, range and damage', () => {
  for (const [key, a] of Object.entries(ATTACKS)) {
    assert.ok(a.duration > a.impact, key);
    assert.ok(a.range > 0 && a.damage > 0, key);
  }
});
test('all animation poses remain finite throughout timeline', () => {
  for (const name of ['idle','walk','crouch','block','jump','hit', ...Object.keys(ATTACKS)]) {
    for (let i=0;i<=100;i++) {
      const pose=samplePose(name,i/100,1,i/10);
      for (const [field,value] of Object.entries(pose)) assert.ok(Number.isFinite(value), `${name}.${field}`);
    }
  }
});
test('neutral pose is newly allocated and clamps behave', () => {
  const a=neutralPose(); a.headZ=9;
  assert.notEqual(neutralPose().headZ,9);
  assert.equal(clamp(-5),0);
  assert.equal(clamp(5),1);
});
test('impact triggers exactly on crossing the attack impact time', () => {
  assert.equal(isImpactFrame(.15,.18,.18),true);
  assert.equal(isImpactFrame(.18,.19,.18),false);
  assert.equal(isImpactFrame(.11,.15,.18),false);
});
