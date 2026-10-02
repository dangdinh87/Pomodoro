import { MODE_TINTS } from './mode-tint';
import type { SceneMeta } from './scene-registry';
import { SceneRenderer } from './webgl-scene';

const WIDTH = 480;
const HEIGHT = 270;

const cache = new Map<string, Promise<string | null>>();
// Thumbnails render one at a time so the picker never holds more than one extra GL context.
let queue: Promise<unknown> = Promise.resolve();

async function renderStill(scene: SceneMeta): Promise<string | null> {
  const { default: body } = await scene.load();
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const renderer = SceneRenderer.create(canvas, body, { preserveDrawingBuffer: true });
  if (!renderer) return null;
  renderer.draw(WIDTH, HEIGHT, { time: scene.stillTime, tint: MODE_TINTS.focus, follow: 0, brightness: 1 });
  // toBlob encodes off the main thread; toDataURL blocked it for every card.
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  renderer.dispose();
  return blob ? URL.createObjectURL(blob) : null;
}

/** Waits for a quiet moment so shader compiles never land on an animation frame. */
const idle = () =>
  new Promise<void>((resolve) =>
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(() => resolve(), { timeout: 600 })
      : setTimeout(resolve, 50),
  );

/** Still preview of a scene as an object URL (null when WebGL is unavailable). Cached for the session. */
export function getSceneThumbnail(scene: SceneMeta): Promise<string | null> {
  let hit = cache.get(scene.id);
  if (!hit) {
    hit = queue
      .then(idle)
      .then(() => renderStill(scene))
      .catch(() => null);
    queue = hit;
    cache.set(scene.id, hit);
  }
  return hit;
}
