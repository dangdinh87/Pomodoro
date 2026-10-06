'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ExtrudeGeometry, MeshStandardMaterial, Shape, type Group } from 'three';
import { segmentsForDigit, splitTime } from '../clock-math';
import type { SceneProps } from './scene-types';
import { usePointerTilt } from './use-pointer-tilt';

const LEN = 0.54;
const THICK = 0.17;
const DEPTH = 0.2;

function segmentGeometry() {
  const shape = new Shape();
  const h = THICK / 2;
  const l = LEN / 2;
  shape.moveTo(-l, 0);
  shape.lineTo(-l + h, h);
  shape.lineTo(l - h, h);
  shape.lineTo(l, 0);
  shape.lineTo(l - h, -h);
  shape.lineTo(-l + h, -h);
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -DEPTH / 2);
  return geo;
}

/** a, b, c, d, e, f, g as [x, y, vertical] inside a digit cell. */
const LAYOUT: [number, number, boolean][] = [
  [0, 0.73, false],
  [0.34, 0.37, true],
  [0.34, -0.37, true],
  [0, -0.73, false],
  [-0.34, -0.37, true],
  [-0.34, 0.37, true],
  [0, 0, false],
];

const X = [-1.75, -0.78, 0.78, 1.75];

export function SolidScene({ timeLeft, palette, pointer, reduceMotion }: SceneProps) {
  const group = useRef<Group>(null);
  const face = palette.warn ?? palette.ink;
  const side = palette.warn ?? palette.accent;

  const geometry = useMemo(() => segmentGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  // ExtrudeGeometry groups: 0 = front/back faces, 1 = sides. Ink face, accent depth.
  const { on, off } = useMemo(
    () => ({
      on: [
        new MeshStandardMaterial({ color: face, roughness: 0.4 }),
        new MeshStandardMaterial({ color: side, roughness: 0.45 }),
      ],
      off: [
        new MeshStandardMaterial({ color: face, roughness: 0.8, transparent: true, opacity: 0.07, depthWrite: false }),
        new MeshStandardMaterial({ color: face, roughness: 0.8, transparent: true, opacity: 0.07, depthWrite: false }),
      ],
    }),
    [face, side],
  );
  useEffect(
    () => () => {
      for (const m of [...on, ...off]) m.dispose();
    },
    [on, off],
  );

  usePointerTilt(group, pointer, { strength: 0.32, restX: 0.1, restY: -0.16, enabled: !reduceMotion });

  const { digits } = splitTime(timeLeft);

  return (
    <group ref={group}>
      {digits.map((d, di) => {
        const lit = segmentsForDigit(d);
        return (
          <group key={di} position={[X[di], 0, 0]}>
            {LAYOUT.map(([x, y, vertical], si) => (
              <mesh
                key={si}
                geometry={geometry}
                material={lit[si] ? on : off}
                position={[x, y, lit[si] ? 0 : -0.04]}
                rotation={[0, 0, vertical ? Math.PI / 2 : 0]}
              />
            ))}
          </group>
        );
      })}
      {[-0.22, 0.22].map((y) => (
        <mesh key={y} geometry={geometry} material={on} position={[0, y, 0]} scale={[0.2, 0.9, 1]} />
      ))}
    </group>
  );
}
