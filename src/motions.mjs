// Game/animation state is independent of rendering so motion timing can be tested.
export const ATTACKS = Object.freeze({
  jab:     { duration: 0.38, impact: 0.18, range: 1.55, damage: 5, knockback: 0.11, label: 'JAB' },
  heavy:   { duration: 0.74, impact: 0.40, range: 1.66, damage: 11, knockback: 0.25, label: 'DIRETO' },
  hook:    { duration: 0.61, impact: 0.32, range: 1.48, damage: 8, knockback: 0.17, label: 'GANCHO' },
  lowKick: { duration: 0.67, impact: 0.34, range: 1.98, damage: 8, knockback: 0.16, label: 'CHUTE BAIXO' },
  highKick:{ duration: 0.83, impact: 0.47, range: 1.93, damage: 12, knockback: 0.24, label: 'CHUTE ALTO' },
  special: { duration: 1.22, impact: 0.77, range: 2.33, damage: 22, knockback: 0.45, label: 'RUPTURA UMBRA' },
});

export const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
export const smooth = v => { const t=clamp(v); return t*t*(3-2*t); };
export const lerp = (a,b,t) => a + (b-a)*t;
export const pulse = (t, a, b, c, d) => smooth((t-a)/(b-a)) * (1-smooth((t-c)/(d-c)));

const NEUTRAL = Object.freeze({
  pelvisY: 0, pelvisX: 0, torsoZ: 0.04, torsoY: 0, headZ: -0.03,
  leadArmZ: 0.77, leadElbowZ: 1.36, rearArmZ: 0.98, rearElbowZ: 1.30,
  leadArmY: 0, rearArmY: 0, leadHipZ: -0.14, rearHipZ: 0.16,
  leadKneeZ: 0.21, rearKneeZ: 0.19,
});
export const neutralPose = () => ({...NEUTRAL});

// Each pose is rig-space and independent of framerate.
export function samplePose(name, time, duration=1, walkPhase=0) {
  const p=neutralPose(), t=clamp(time/Math.max(0.001,duration));
  if (name==='idle') {
    p.pelvisY=Math.sin(time*3.6)*0.015;
    p.torsoZ+=Math.sin(time*2.4)*0.015;
    p.leadArmZ+=Math.sin(time*2.4)*0.035;
    return p;
  }
  if (name==='walk') {
    const s=Math.sin(walkPhase), c=Math.cos(walkPhase);
    p.pelvisY=0.035*Math.abs(c);
    p.leadHipZ=-0.14+0.44*s; p.rearHipZ=0.16-0.44*s;
    p.leadKneeZ=0.20+Math.max(0,-s)*0.55;
    p.rearKneeZ=0.20+Math.max(0,s)*0.55;
    p.leadArmZ=0.77-0.22*s; p.rearArmZ=0.98+0.22*s;
    return p;
  }
  if (name==='crouch') {
    p.pelvisY=-0.30; p.torsoZ=0.17;
    p.leadHipZ=0.48; p.rearHipZ=-0.35;
    p.leadKneeZ=1.18; p.rearKneeZ=1.04;
    p.leadArmZ=1.06; p.rearArmZ=1.10;
    return p;
  }
  if (name==='block') {
    p.torsoZ=-0.12; p.headZ=0.11;
    p.leadArmZ=1.28; p.leadElbowZ=1.46;
    p.rearArmZ=1.20; p.rearElbowZ=1.43;
    p.leadHipZ=-0.24; p.rearHipZ=0.27;
    return p;
  }
  if (name==='jump') {
    const e=Math.sin(t*Math.PI);
    p.leadHipZ=0.34+0.26*e; p.rearHipZ=-0.27;
    p.leadKneeZ=0.95; p.rearKneeZ=0.86;
    p.leadArmZ=1.03; p.rearArmZ=1.02;
    return p;
  }
  if (name==='hit') {
    const x=pulse(t,0,0.14,0.44,0.96);
    p.torsoZ=-0.34*x; p.pelvisX=-0.11*x;
    p.headZ=0.25*x; p.leadArmZ-=0.45*x;
    return p;
  }
  if (name==='jab') {
    const x=pulse(t,0.12,0.39,0.54,0.99);
    p.leadArmZ=lerp(0.77,1.65,x);
    p.leadElbowZ=lerp(1.36,-0.06,x);
    p.torsoZ+=0.10*x; p.torsoY=-0.18*x; p.pelvisX=0.12*x;
  } else if (name==='heavy') {
    const pre=pulse(t,0.01,0.17,0.31,0.40);
    const x=pulse(t,0.31,0.52,0.63,0.99);
    p.torsoY=0.37*pre-0.56*x; p.torsoZ=-0.13*pre+0.17*x;
    p.rearArmZ=lerp(0.98,1.65,x); p.rearElbowZ=lerp(1.3,0.03,x);
    p.pelvisX=0.19*x; p.rearHipZ-=0.16*x;
  } else if (name==='hook') {
    const x=pulse(t,0.13,0.42,0.57,0.97);
    p.leadArmZ=1.52*x+0.77*(1-x);
    p.leadElbowZ=1.36+0.38*x;
    p.leadArmY=-1.06*x; p.torsoY=-0.64*x;
    p.pelvisX=0.10*x;
  } else if (name==='lowKick' || name==='highKick') {
    const x=pulse(t,0.11,0.45,0.61,0.98);
    const high=name==='highKick';
    p.leadHipZ=lerp(-0.14,high?1.64:1.22,x);
    p.leadKneeZ=lerp(0.21, high?-0.24:0.12,x);
    p.torsoZ=-0.24*x;
    p.rearArmZ=0.98+0.25*x;
    p.rearKneeZ=0.20+0.21*x;
    p.pelvisY=-0.025*x;
  } else if (name==='special') {
    const gather=pulse(t,0,0.24,0.50,0.67);
    const release=pulse(t,0.57,0.76,0.87,1);
    p.pelvisY=-0.22*gather;
    p.torsoY=0.57*gather-0.50*release;
    p.torsoZ=-0.14*gather+0.25*release;
    p.leadArmZ=0.22*gather+1.55*release+0.77*(1-gather)*(1-release);
    p.leadElbowZ=1.65*gather+0.12*release+1.36*(1-gather)*(1-release);
    p.rearArmZ=0.24*gather+1.67*release+0.98*(1-gather)*(1-release);
    p.rearElbowZ=1.77*gather+0.08*release+1.30*(1-gather)*(1-release);
    p.pelvisX=0.24*release;
  }
  return p;
}

export function isImpactFrame(previous, current, impact) {
  return previous < impact && current >= impact;
}
