/**
 * Shared GLSL (WebGL1 / ES 1.00) for every scene. A scene file exports only a body that defines
 *   vec3 scene(vec2 uv, vec2 p, float t)
 * where uv is 0..1 (y up) and p is centred, aspect-corrected (y spans -0.5..0.5).
 */

export const VERTEX_SHADER = `attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime;
uniform vec2 uRes;
uniform vec3 uTint;
uniform float uFollow;
uniform float uBright;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float hash31(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
                mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y);
  float b = mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
                mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y);
  return mix(a, b, f.z);
}
float fbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s;
}
float fbm3(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * noise3(p);
    p = p * 2.07 + vec3(11.3, 5.1, 7.7);
    a *= 0.5;
  }
  return s;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
// Twinkling point stars on a cell grid; density = share of cells holding a star.
float stars(vec2 p, float scale, float density, float t) {
  vec2 g = p * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash21(id);
  vec2 o = (hash22(id + 7.0) - 0.5) * 0.5;
  float d = length(f - o);
  float on = step(1.0 - density, h);
  float tw = 0.65 + 0.35 * sin(t * (0.8 + 2.0 * h) + h * 40.0);
  return on * smoothstep(0.16 + 0.12 * h, 0.0, d) * tw * (0.35 + 0.65 * fract(h * 91.7));
}
`;

const TAIL = `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 c = scene(uv, p, uTime);
  vec2 v = uv - 0.5;
  c *= 1.0 - 0.55 * dot(v, v);
  c *= uBright;
  c += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`;

export function buildFragment(body: string): string {
  return HEAD + body + TAIL;
}
