'use client';

import { useEffect, useMemo, useRef } from 'react';
import { TorusGeometry, type Group } from 'three';
import { elapsedFraction, fractionToAngle, splitTime } from '../clock-math';
import type { SceneProps } from './scene-types';
import { usePointerTilt } from './use-pointer-tilt';

const OUTER = 1.12;
const INNER = 0.82;
const TUBE = 0.045;

/** Remaining arc of the phase, drawn from 12 o'clock and shrinking clockwise. */
function PhaseRing({ elapsed, color }: { elapsed: number; color: string }) {
  const remainingAngle = fractionToAngle(1 - elapsed);
  const geometry = useMemo(
    () => new TorusGeometry(OUTER, TUBE, 14, 160, Math.max(0.001, remainingAngle)),
    [remainingAngle],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const head = Math.PI / 2 - fractionToAngle(elapsed);
  const showArc = remainingAngle > 0.01;

  return (
    <group>
      {showArc && (
        <mesh geometry={geometry} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={0.25} />
        </mesh>
      )}
      {showArc && (
        <>
          <mesh position={[0, OUTER, 0]}>
            <sphereGeometry args={[TUBE, 16, 12]} />
            <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[Math.cos(head) * OUTER, Math.sin(head) * OUTER, 0.02]}>
            <sphereGeometry args={[TUBE * 2.1, 20, 14]} />
            <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function OrbitScene({ timeLeft, total, palette, pointer, reduceMotion }: SceneProps) {
  const group = useRef<Group>(null);
  const accent = palette.warn ?? palette.accent;
  const elapsed = elapsedFraction(timeLeft, total);
  const { seconds } = splitTime(timeLeft);

  // The moon circles the inner track once a minute, counting down with the clock.
  const moon = Math.PI / 2 - fractionToAngle(1 - seconds / 60);

  usePointerTilt(group, pointer, { strength: 0.22, restX: -0.5, restY: 0, enabled: !reduceMotion });

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[OUTER, TUBE * 0.55, 8, 160]} />
        <meshStandardMaterial color={palette.ink} transparent opacity={0.16} roughness={0.8} />
      </mesh>
      <mesh>
        <torusGeometry args={[INNER, TUBE * 0.35, 8, 160]} />
        <meshStandardMaterial color={palette.ink} transparent opacity={0.16} roughness={0.8} />
      </mesh>
      <PhaseRing elapsed={elapsed} color={accent} />
      <mesh position={[Math.cos(moon) * INNER, Math.sin(moon) * INNER, 0.02]}>
        <sphereGeometry args={[0.065, 20, 14]} />
        <meshStandardMaterial color={palette.ink} roughness={0.35} />
      </mesh>
    </group>
  );
}
