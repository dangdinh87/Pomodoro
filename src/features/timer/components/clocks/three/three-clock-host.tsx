'use client';

import { useEffect, useLayoutEffect, useRef, type ComponentType } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { NoToneMapping, type PerspectiveCamera } from 'three';
import type { SceneId, SceneProps } from './scene-types';
import { Flip3dScene } from './scene-flip3d';
import { TomatoScene } from './scene-tomato';
import { OrbitScene } from './scene-orbit';
import { SolidScene } from './scene-solid';

const SCENES: Record<SceneId, { Scene: ComponentType<SceneProps>; bounds: [number, number] }> = {
  flip3d: { Scene: Flip3dScene, bounds: [5.2, 1.8] },
  tomato: { Scene: TomatoScene, bounds: [2.7, 2.7] },
  orbit: { Scene: OrbitScene, bounds: [2.7, 2.7] },
  solid: { Scene: SolidScene, bounds: [5.1, 2.1] },
};

const FOV = 30;

/** Frames the scene's bounding box whatever the canvas aspect. */
function FitCamera({ bounds }: { bounds: [number, number] }) {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const cam = get().camera as PerspectiveCamera;
    const tan = Math.tan((FOV * Math.PI) / 360);
    const byHeight = bounds[1] / 2 / tan;
    const byWidth = bounds[0] / 2 / (tan * (width / Math.max(1, height)));
    cam.position.z = Math.max(byHeight, byWidth);
    cam.updateProjectionMatrix();
    invalidate();
  }, [get, bounds, width, height, invalidate]);

  return null;
}

/** Pointer position over the canvas -> `pointer`, and wakes the demand loop. */
function PointerRig({ pointer, enabled }: Pick<SceneProps, 'pointer'> & { enabled: boolean }) {
  const dom = useThree((s) => s.gl.domElement);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      invalidate();
    };
    const leave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
      invalidate();
    };
    dom.addEventListener('pointermove', move);
    dom.addEventListener('pointerleave', leave);
    return () => {
      dom.removeEventListener('pointermove', move);
      dom.removeEventListener('pointerleave', leave);
    };
  }, [dom, enabled, invalidate, pointer]);

  return null;
}

/** The scene only changes once a second, so redraw on prop change instead of every frame. */
function Redraw({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => invalidate(), [invalidate, ...deps]);

  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [invalidate]);

  return null;
}

export interface ThreeClockHostProps extends SceneProps {
  scene: SceneId;
  onFail: () => void;
}

export default function ThreeClockHost({ scene, onFail, ...props }: ThreeClockHostProps) {
  const { Scene, bounds } = SCENES[scene];
  const failRef = useRef(onFail);
  useEffect(() => {
    failRef.current = onFail;
  }, [onFail]);

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: FOV, position: [0, 0, 8], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power', toneMapping: NoToneMapping }}
      aria-hidden="true"
      style={{ pointerEvents: props.reduceMotion ? 'none' : 'auto' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          failRef.current();
        });
      }}
    >
      <ambientLight intensity={Math.PI * 0.5} />
      <directionalLight position={[2.5, 3.5, 6]} intensity={Math.PI * 0.6} />
      <FitCamera bounds={bounds} />
      <Scene {...props} />
      <PointerRig pointer={props.pointer} enabled={!props.reduceMotion} />
      <Redraw deps={[props.timeLeft, props.total, props.palette, props.running]} />
    </Canvas>
  );
}
