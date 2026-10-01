'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { Mesh, MeshLambertMaterial, OrthographicCamera } from 'three';
import { Cube } from '@phosphor-icons/react/dist/ssr';

import { useI18n } from '@/contexts/i18n-context';
import { GameFrame } from './game-overlay';
import { prefersReducedMotion, useGameSession, type GameProps, type GameStatus } from './game-kit';
import { placeSlab, slideSpeed } from './stack-logic';

const BASE = 3;
const H = 0.55;
const RANGE = 5.2;

interface Layer {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
  color: string;
}
interface Piece extends Layer {
  id: number;
  born: number;
}

function layerColor(i: number): string {
  return `hsl(${(205 + i * 13) % 360}, 55%, 58%)`;
}

interface Slider {
  axis: 'x' | 'z';
  pos: number;
  dir: 1 | -1;
  w: number;
  d: number;
  over: boolean;
}

interface SceneApi {
  place: () => void;
  reset: () => void;
}

function FitCamera() {
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- three.js camera is mutable by design
    camera.zoom = Math.min(width / 12.5, height / 13);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

function FallingPiece({ piece, reduced }: { piece: Piece; reduced: boolean }) {
  const ref = useRef<Mesh>(null);
  const vy = useRef(0);
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    vy.current -= 22 * Math.min(dt, 0.05);
    mesh.position.y += vy.current * Math.min(dt, 0.05);
    mesh.rotation.z += 0.9 * Math.min(dt, 0.05);
  });
  if (reduced) return null;
  return (
    <mesh ref={ref} position={[piece.x, piece.y, piece.z]}>
      <boxGeometry args={[piece.w, H, piece.d]} />
      <meshLambertMaterial color={piece.color} />
    </mesh>
  );
}

function StackScene({
  apiRef,
  statusRef,
  onScore,
  onPerfect,
  onOver,
}: {
  apiRef: RefObject<SceneApi | null>;
  statusRef: RefObject<GameStatus>;
  onScore: (n: number) => void;
  onPerfect: (streak: number) => void;
  onOver: (n: number) => void;
}) {
  const camera = useThree((s) => s.camera);
  const [layers, setLayers] = useState<Layer[]>([{ x: 0, z: 0, w: BASE, d: BASE, y: 0, color: layerColor(0) }]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const movingRef = useRef<Mesh>(null);
  const matRef = useRef<MeshLambertMaterial>(null);
  const top = useRef<Layer>(layers[0]);
  const slider = useRef<Slider>({ axis: 'x', pos: -RANGE, dir: 1, w: BASE, d: BASE, over: false });
  const level = useRef(0);
  const streak = useRef(0);
  const pieceId = useRef(0);
  const [reduced] = useState(prefersReducedMotion);

  const spawn = useCallback((from: Layer, lvl: number) => {
    const startNeg = lvl % 4 < 2;
    slider.current = { axis: lvl % 2 === 0 ? 'x' : 'z', pos: startNeg ? -RANGE : RANGE, dir: startNeg ? 1 : -1, w: from.w, d: from.d, over: false };
    matRef.current?.color.set(layerColor(lvl + 1));
  }, []);

  useEffect(() => {
    spawn(top.current, 0);
  }, [spawn]);

  useEffect(() => {
    apiRef.current = {
      reset: () => {
        const base: Layer = { x: 0, z: 0, w: BASE, d: BASE, y: 0, color: layerColor(0) };
        top.current = base;
        level.current = 0;
        streak.current = 0;
        setLayers([base]);
        setPieces([]);
        spawn(base, 0);
      },
      place: () => {
        const s = slider.current;
        const prev = top.current;
        if (statusRef.current !== 'playing' || s.over) return;
        const onX = s.axis === 'x';
        const res = placeSlab(onX ? { c: prev.x, s: prev.w } : { c: prev.z, s: prev.d }, { c: s.pos, s: onX ? s.w : s.d });
        const now = performance.now();
        const y = (level.current + 1) * H;
        const color = layerColor(level.current + 1);

        if (res.kind === 'miss') {
          s.over = true;
          setPieces((p) => [...p.filter((x) => now - x.born < 2500), { id: ++pieceId.current, born: now, x: onX ? s.pos : prev.x, z: onX ? prev.z : s.pos, w: s.w, d: s.d, y, color }]);
          onOver(level.current);
          return;
        }

        const next: Layer = onX
          ? { x: res.kept.c, z: prev.z, w: res.kept.s, d: prev.d, y, color }
          : { x: prev.x, z: res.kept.c, w: prev.w, d: res.kept.s, y, color };
        top.current = next;
        level.current += 1;
        streak.current = res.perfect ? streak.current + 1 : 0;
        setLayers((l) => [...l, next]);
        setPieces((p) => {
          const alive = p.filter((x) => now - x.born < 2500);
          if (!res.cut) return alive;
          const piece: Piece = onX
            ? { id: ++pieceId.current, born: now, x: res.cut.c, z: prev.z, w: res.cut.s, d: prev.d, y, color }
            : { id: ++pieceId.current, born: now, x: prev.x, z: res.cut.c, w: prev.w, d: res.cut.s, y, color };
          return [...alive, piece];
        });
        onScore(level.current);
        if (res.perfect) onPerfect(streak.current);
        spawn(next, level.current);
      },
    };
  }, [apiRef, spawn, statusRef, onScore, onPerfect, onOver]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = slider.current;
    const mesh = movingRef.current;
    if (statusRef.current === 'playing' && !s.over) {
      s.pos += s.dir * slideSpeed(level.current) * dt;
      if (s.pos > RANGE) {
        s.pos = RANGE;
        s.dir = -1;
      } else if (s.pos < -RANGE) {
        s.pos = -RANGE;
        s.dir = 1;
      }
    }
    if (mesh) {
      const prev = top.current;
      mesh.visible = !s.over;
      mesh.position.set(s.axis === 'x' ? s.pos : prev.x, (level.current + 1) * H, s.axis === 'z' ? s.pos : prev.z);
      mesh.scale.set(s.w, 1, s.d);
    }
    const targetY = level.current * H;
    const k = reduced ? 1 : Math.min(1, dt * 3.5);
    camera.position.set(10, camera.position.y + (targetY + 10 - camera.position.y) * k, 10);
    camera.lookAt(0, camera.position.y - 10, 0);
  });

  return (
    <>
      <FitCamera />
      <ambientLight intensity={1.15} />
      <directionalLight position={[6, 12, 4]} intensity={1.5} />
      {layers.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, l.z]}>
          <boxGeometry args={[l.w, H, l.d]} />
          <meshLambertMaterial color={l.color} />
        </mesh>
      ))}
      <mesh ref={movingRef}>
        <boxGeometry args={[1, H, 1]} />
        <meshLambertMaterial ref={matRef} color={layerColor(1)} />
      </mesh>
      {pieces.map((p) => (
        <FallingPiece key={p.id} piece={p} reduced={reduced} />
      ))}
    </>
  );
}

export function StackGame(props: GameProps) {
  const { t } = useI18n();
  const session = useGameSession(props);
  const { statusRef, setScore, finish, status } = session;
  const api = useRef<SceneApi | null>(null);
  const [perfect, setPerfect] = useState(0);
  const [height, setHeight] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const onScore = useCallback(
    (n: number) => {
      setScore(n);
      setHeight(n);
    },
    [setScore],
  );
  const onPerfect = useCallback((streak: number) => {
    setPerfect(streak);
    timers.current.push(setTimeout(() => setPerfect(0), 900));
  }, []);
  const onOver = useCallback(
    (n: number) => {
      timers.current.push(setTimeout(() => finish(n), 750));
    },
    [finish],
  );

  const place = useCallback(() => api.current?.place(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      if (statusRef.current !== 'playing') return;
      e.preventDefault();
      place();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [place, statusRef]);

  const begin = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    api.current?.reset();
    setScore(0);
    setHeight(0);
    setPerfect(0);
    session.start();
  };

  return (
    <GameFrame
      title={t('arcadeGames.stack.title')}
      icon={Cube}
      description={t('arcadeGames.stack.instructions')}
      hint={t('arcadeGames.stack.hint')}
      session={session}
      onRestart={begin}
      onStart={begin}
      scoreLabel={t('arcadeGames.stack.floors')}
      overSummary={
        <p className="text-sm text-ink-secondary" suppressHydrationWarning>
          {t('arcadeGames.stack.summary', { floors: height })}
        </p>
      }
    >
      <div className="relative min-h-0 flex-1 touch-none select-none bg-surface-raised" onPointerDown={place}>
        <Canvas orthographic dpr={[1, 1.5]} camera={{ position: [10, 10, 10], zoom: 40, near: -50, far: 100 }} gl={{ antialias: true }}>
          <StackScene apiRef={api} statusRef={statusRef} onScore={onScore} onPerfect={onPerfect} onOver={onOver} />
        </Canvas>
        {perfect > 0 && status === 'playing' && (
          <div className="pointer-events-none absolute inset-x-0 top-6 text-center font-heading text-xl font-bold text-ink" aria-live="polite" suppressHydrationWarning>
            {perfect > 1 ? t('arcadeGames.stack.perfectCombo', { n: perfect }) : t('arcadeGames.stack.perfect')}
          </div>
        )}
      </div>
    </GameFrame>
  );
}
