// Fireflies drifting between layered tree silhouettes. Glow colour follows the timer mode.
const source = `
float trunks(vec2 p, float scale, float seed, float thick) {
  float x = p.x * scale + seed * 4.0;
  float id = floor(x);
  float f = fract(x) - 0.5;
  float h = hash11(id + seed);
  float on = step(0.3, h);
  float c = (hash11(id * 1.7 + seed) - 0.5) * 0.5;
  float w = thick * (0.5 + h);
  return on * smoothstep(w + 0.01, w, abs(f - c));
}

vec3 flies(vec2 p, float scale, float seed, float t, vec3 glow) {
  vec2 g = p * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash21(id + seed);
  float on = step(0.55, h);
  vec2 o = vec2(sin(t * (0.2 + 0.2 * h) + h * 40.0), cos(t * (0.25 + 0.15 * h) + h * 23.0)) * 0.3;
  float d = length(f - o);
  float blink = pow(0.5 + 0.5 * sin(t * (0.5 + h) + h * 60.0), 3.0);
  return glow * on * blink * (exp(-d * d * 260.0) * 1.2 + exp(-d * d * 28.0) * 0.12);
}

vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 glow = mix(vec3(0.75, 1.0, 0.32), uTint * 0.8 + vec3(0.25, 0.3, 0.1), uFollow);
  vec3 col = mix(vec3(0.03, 0.07, 0.07), vec3(0.008, 0.02, 0.03), clamp(uv.y, 0.0, 1.0));
  col += vec3(0.04, 0.09, 0.08) * exp(-pow((p.y + 0.05) * 3.0, 2.0));

  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float k = fi / 2.0;
    float sc = 3.2 + fi * 2.2;
    float sway = sin(t * 0.07 + fi) * 0.004;
    float tr = trunks(vec2(p.x + t * 0.003 * (1.0 + fi) + sway, p.y), sc, fi * 11.0, 0.05 + fi * 0.03);
    vec3 shade = mix(vec3(0.03, 0.06, 0.06), vec3(0.004, 0.012, 0.014), k);
    float canopy = smoothstep(0.1 - fi * 0.05, 0.5, p.y + 0.15 * fbm(vec2(p.x * 3.0 + fi * 5.0, 0.0)));
    float mask = max(tr, canopy * 0.85 * step(0.0, p.y));
    col = mix(col, shade, mask * (0.55 + 0.45 * k));
    col = mix(col, vec3(0.02, 0.05, 0.05), 0.12 * (1.0 - k) * (1.0 - mask));
  }

  float ground = smoothstep(-0.3, -0.5, p.y);
  col = mix(col, vec3(0.004, 0.01, 0.012), ground);
  col += vec3(0.05, 0.09, 0.08) * fbm(vec2(p.x * 3.0 + t * 0.01, p.y * 6.0)) * smoothstep(-0.05, -0.3, p.y) * 0.4;

  vec3 fl = flies(p + vec2(0.0, t * 0.004), 7.0, 1.0, t, glow) * 0.7;
  fl += flies(p * 1.0 + vec2(0.4, 0.2), 12.0, 7.0, t * 1.1, glow) * 0.5;
  fl += flies(p + vec2(0.2, -t * 0.003), 4.5, 19.0, t * 0.8, glow);
  col += fl * smoothstep(0.45, -0.35, p.y);
  return col;
}
`;

export default source;
