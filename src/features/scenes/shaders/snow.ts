// Snowfall at dusk: four depth layers, the nearest ones soft and out of focus.
const source = `
float flakes(vec2 p, float scale, float speed, float size, float blur, float seed, float t) {
  vec2 q = p * scale;
  q.y += t * speed;
  q.x += sin(t * 0.25 + seed) * 0.6 + t * speed * 0.12;
  vec2 id = floor(q);
  vec2 f = fract(q);
  float acc = 0.0;
  for (int oy = -1; oy <= 1; oy++) {
    for (int ox = -1; ox <= 1; ox++) {
      vec2 o = vec2(float(ox), float(oy));
      vec2 cid = id + o;
      vec2 h = hash22(cid + seed);
      vec2 c = o + vec2(0.2 + 0.6 * h.x + sin(t * (0.5 + h.y) + h.x * 20.0) * 0.12, 0.2 + 0.6 * h.y);
      float d = length(f - c);
      float r = size * (0.5 + 0.8 * hash21(cid + 9.0 + seed));
      acc += smoothstep(r, r * (1.0 - blur), d) * step(0.35, hash21(cid + 4.0 + seed));
    }
  }
  return acc;
}

vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 skyTop = mix(vec3(0.05, 0.08, 0.17), uTint * 0.25, uFollow * 0.35);
  vec3 skyLow = mix(vec3(0.17, 0.23, 0.36), uTint * 0.5 + 0.12, uFollow * 0.3);
  vec3 col = mix(skyLow, skyTop, smoothstep(-0.2, 0.55, p.y));

  float far = fbm(vec2(p.x * 2.4 + 5.0, 0.0));
  float ridge = -0.3 + 0.1 * far;
  col = mix(col, vec3(0.1, 0.14, 0.22), smoothstep(0.004, -0.004, p.y - ridge));
  float near = -0.4 + 0.05 * sin(p.x * 3.0 + 1.0) + 0.03 * sin(p.x * 7.0);
  col = mix(col, vec3(0.2, 0.26, 0.37), smoothstep(0.004, -0.004, p.y - near));

  float s = 0.0;
  s += flakes(p, 22.0, 0.6, 0.12, 0.5, 1.0, t) * 0.55;
  s += flakes(p, 13.0, 0.9, 0.14, 0.45, 5.0, t) * 0.75;
  s += flakes(p, 7.0, 1.4, 0.16, 0.7, 9.0, t) * 0.55;
  s += flakes(p, 3.2, 2.0, 0.2, 0.95, 13.0, t) * 0.3;
  col += vec3(0.88, 0.94, 1.0) * s;
  return col;
}
`;

export default source;
