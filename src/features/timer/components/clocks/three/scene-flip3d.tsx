'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, SRGBColorSpace, type Group, type MeshStandardMaterial } from 'three';
import { splitTime } from '../clock-math';
import type { SceneProps } from './scene-types';
import { usePointerTilt } from './use-pointer-tilt';

const CARD_W = 1;
const CARD_H = 1.36;
const FLIP_SECONDS = 0.42;
const PX_W = 256;
const PX_H = Math.round(PX_W * CARD_H);

interface DigitTextures {
  top: CanvasTexture[];
  bottom: CanvasTexture[];
}

function makeTextures(card: string, ink: string, font: string): DigitTextures {
  const top: CanvasTexture[] = [];
  const bottom: CanvasTexture[] = [];
  const face = document.createElement('canvas');
  face.width = PX_W;
  face.height = PX_H;
  const fctx = face.getContext('2d');
  const half = PX_H / 2;
  for (let d = 0; d < 10; d++) {
    const halves = Array.from({ length: 2 }, () => {
      const c = document.createElement('canvas');
      c.width = PX_W;
      c.height = half;
      return c;
    });
    if (fctx) {
      fctx.clearRect(0, 0, PX_W, PX_H);
      fctx.fillStyle = card;
      fctx.beginPath();
      fctx.roundRect(0, 0, PX_W, PX_H, 26);
      fctx.fill();
      fctx.fillStyle = ink;
      fctx.font = `700 ${Math.round(PX_H * 0.74)}px ${font}`;
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText(String(d), PX_W / 2, PX_H / 2 + PX_H * 0.035);
      halves[0].getContext('2d')?.drawImage(face, 0, 0, PX_W, half, 0, 0, PX_W, half);
      halves[1].getContext('2d')?.drawImage(face, 0, half, PX_W, half, 0, 0, PX_W, half);
    }
    for (const [i, list] of [top, bottom].entries()) {
      const t = new CanvasTexture(halves[i]);
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      list.push(t);
    }
  }
  return { top, bottom };
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function FlipCard({
  x,
  value,
  tex,
  reduceMotion,
  edge,
  accent,
}: {
  x: number;
  value: number;
  tex: DigitTextures;
  reduceMotion: boolean;
  edge: string;
  accent: string;
}) {
  const flap = useRef<Group>(null);
  const topMat = useRef<MeshStandardMaterial>(null);
  const bottomMat = useRef<MeshStandardMaterial>(null);
  const frontMat = useRef<MeshStandardMaterial>(null);
  const backMat = useRef<MeshStandardMaterial>(null);
  const shown = useRef(value);
  const progress = useRef(1);

  const settle = (v: number) => {
    if (topMat.current) topMat.current.map = tex.top[v];
    if (bottomMat.current) bottomMat.current.map = tex.bottom[v];
    if (frontMat.current) frontMat.current.map = tex.top[v];
    if (flap.current) flap.current.rotation.x = 0;
    for (const m of [topMat, bottomMat, frontMat, backMat]) if (m.current) m.current.needsUpdate = true;
  };

  // Textures are rebuilt when colours change: re-apply the current digit to them.
  useEffect(() => {
    settle(shown.current);
    if (backMat.current) backMat.current.map = tex.bottom[shown.current];
    progress.current = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex]);

  useEffect(() => {
    if (value === shown.current) return;
    const prev = shown.current;
    shown.current = value;
    if (reduceMotion) {
      settle(value);
      if (backMat.current) backMat.current.map = tex.bottom[value];
      return;
    }
    if (topMat.current) topMat.current.map = tex.top[value];
    if (bottomMat.current) bottomMat.current.map = tex.bottom[prev];
    if (frontMat.current) frontMat.current.map = tex.top[prev];
    if (backMat.current) backMat.current.map = tex.bottom[value];
    for (const m of [topMat, bottomMat, frontMat, backMat]) if (m.current) m.current.needsUpdate = true;
    progress.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  useFrame((state, delta) => {
    if (progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / FLIP_SECONDS);
    if (flap.current) flap.current.rotation.x = easeInOut(progress.current) * Math.PI;
    if (progress.current >= 1) settle(shown.current);
    else state.invalidate();
  });

  const quarter = CARD_H / 4;
  const mat = { roughness: 0.55, metalness: 0, alphaTest: 0.4 } as const;

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0, -0.07]}>
        <boxGeometry args={[CARD_W + 0.05, CARD_H + 0.05, 0.1]} />
        <meshStandardMaterial color={edge} roughness={0.7} />
      </mesh>
      <mesh position={[0, quarter, 0]}>
        <planeGeometry args={[CARD_W, CARD_H / 2]} />
        <meshStandardMaterial ref={topMat} map={tex.top[value]} {...mat} />
      </mesh>
      <mesh position={[0, -quarter, 0]}>
        <planeGeometry args={[CARD_W, CARD_H / 2]} />
        <meshStandardMaterial ref={bottomMat} map={tex.bottom[value]} {...mat} />
      </mesh>
      <group ref={flap} position={[0, 0, 0.006]}>
        <mesh position={[0, quarter, 0]}>
          <planeGeometry args={[CARD_W, CARD_H / 2]} />
          <meshStandardMaterial ref={frontMat} map={tex.top[value]} {...mat} />
        </mesh>
        <mesh position={[0, quarter, 0]} rotation={[Math.PI, 0, 0]}>
          <planeGeometry args={[CARD_W, CARD_H / 2]} />
          <meshStandardMaterial ref={backMat} map={tex.bottom[value]} {...mat} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[CARD_W + 0.05, 0.014, 0.012]} />
        <meshStandardMaterial color={edge} roughness={0.8} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (CARD_W / 2 + 0.015), 0, 0.012]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.07, 14]} />
          <meshStandardMaterial color={accent} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

const X = [-1.9, -0.8, 0.8, 1.9];

export function Flip3dScene({ timeLeft, palette, fontFamily, pointer, reduceMotion }: SceneProps) {
  const group = useRef<Group>(null);
  const tint = palette.warn ?? palette.ink;
  const accent = palette.warn ?? palette.accent;

  const tex = useMemo(() => makeTextures(palette.card, tint, fontFamily), [palette.card, tint, fontFamily]);
  useEffect(
    () => () => {
      for (const t of [...tex.top, ...tex.bottom]) t.dispose();
    },
    [tex],
  );

  usePointerTilt(group, pointer, { strength: 0.18, restX: -0.05, restY: 0, enabled: !reduceMotion });

  const { digits } = splitTime(timeLeft);
  const dotColor = useMemo(() => new Color(accent), [accent]);

  return (
    <group ref={group}>
      {digits.map((d, i) => (
        <FlipCard key={i} x={X[i]} value={d} tex={tex} reduceMotion={reduceMotion} edge={palette.edge} accent={accent} />
      ))}
      {[-0.2, 0.2].map((y) => (
        <mesh key={y} position={[0, y, 0.02]}>
          <sphereGeometry args={[0.055, 16, 12]} />
          <meshStandardMaterial color={dotColor} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}
