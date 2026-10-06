'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, type Group, type Mesh } from 'three';
import { remainingFraction, wedgeScales } from '../clock-math';
import type { SceneProps } from './scene-types';
import { usePointerTilt } from './use-pointer-tilt';

const WEDGES = 12;
const LEAF = '#4d8c3a';
const STEM = '#3b6b2c';

function Wedge({ index, target, color }: { index: number; target: number; color: Color }) {
  const mesh = useRef<Mesh>(null);
  const current = useRef(target);
  const phiLength = (Math.PI * 2) / WEDGES;

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const diff = target - current.current;
    if (Math.abs(diff) < 0.002) {
      current.current = target;
    } else {
      current.current += diff * 0.2;
      state.invalidate();
    }
    const s = Math.max(0.0001, current.current);
    m.scale.setScalar(s);
    m.visible = current.current > 0.002;
  });

  return (
    <mesh ref={mesh} rotation={[0, 0, 0]}>
      <sphereGeometry args={[1, 1, 7, index * phiLength, phiLength]} />
      <meshStandardMaterial
        color={color}
        flatShading
        roughness={0.38}
        metalness={0}
        side={DoubleSide}
      />
    </mesh>
  );
}

export function TomatoScene({ timeLeft, total, palette, pointer, reduceMotion }: SceneProps) {
  const group = useRef<Group>(null);
  const base = palette.warn ?? palette.accent;

  const colors = useMemo(() => {
    const a = new Color(base);
    const b = new Color(base).offsetHSL(0, 0, -0.06);
    return Array.from({ length: WEDGES }, (_, i) => (i % 2 === 0 ? a : b));
  }, [base]);
  const core = useMemo(() => new Color(base).offsetHSL(0, -0.05, -0.2), [base]);

  const remaining = remainingFraction(timeLeft, total);
  const scales = wedgeScales(remaining, WEDGES);
  const calyx = Math.max(0.0001, Math.min(1, remaining * 10));

  usePointerTilt(group, pointer, { strength: 0.2, restX: 0.95, restY: 0, enabled: !reduceMotion });

  return (
    <group ref={group} scale={1.05}>
      <mesh>
        <sphereGeometry args={[0.55, 14, 10]} />
        <meshStandardMaterial color={core} flatShading roughness={0.7} />
      </mesh>
      {scales.map((s, i) => (
        <Wedge key={i} index={i} target={s} color={colors[i]} />
      ))}
      <group position={[0, 0.98 * calyx, 0]} scale={calyx}>
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]} position={[0, 0.02, 0]}>
            <group rotation={[0, 0, -1.2]} position={[0.22, 0, 0]}>
              <mesh>
                <coneGeometry args={[0.13, 0.5, 4]} />
                <meshStandardMaterial color={LEAF} flatShading roughness={0.8} />
              </mesh>
            </group>
          </mesh>
        ))}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 0.3, 6]} />
          <meshStandardMaterial color={STEM} flatShading roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
