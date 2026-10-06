// Lo-fi sunset: layered hills drifting at different speeds. The sun and haze pick up the timer mode.
const source = `
float hill(float x, float seed, float base, float amp, float freq) {
  return base + amp * fbm(vec2(x * freq + seed, seed * 1.9));
}

vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 sunCol = mix(vec3(1.0, 0.62, 0.34), uTint * 1.15 + 0.1, uFollow * 0.35);
  vec3 haze = mix(vec3(0.98, 0.5, 0.42), sunCol, 0.5);
  vec3 top = mix(vec3(0.1, 0.07, 0.23), uTint * 0.22, uFollow * 0.3);
  vec3 mid = mix(vec3(0.5, 0.2, 0.42), haze * 0.7, 0.5);

  float h = clamp(uv.y, 0.0, 1.0);
  vec3 col = mix(haze, mid, smoothstep(0.1, 0.45, h));
  col = mix(col, top, smoothstep(0.4, 1.0, h));

  vec2 sunPos = vec2(0.05, 0.02);
  float sd = length(p - sunPos);
  col += sunCol * exp(-sd * 3.2) * 0.55;
  col = mix(col, sunCol * 1.15, smoothstep(0.115, 0.105, sd));

  float cl = fbm(vec2(p.x * 1.4 + t * 0.012, p.y * 7.0)) ;
  col += mix(haze, vec3(1.0), 0.3) * smoothstep(0.55, 0.85, cl) * smoothstep(0.0, 0.25, p.y) * smoothstep(0.5, 0.1, p.y) * 0.25;

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float k = fi / 4.0;
    float x = p.x + t * (0.004 + 0.006 * k) + fi * 3.0;
    float y = hill(x, 2.0 + fi * 5.3, -0.12 - k * 0.2 + (1.0 - k) * 0.06, 0.2 - k * 0.07, 0.9 + k * 0.8);
    vec3 layer = mix(mix(haze, mid, 0.4) * 0.65, vec3(0.05, 0.035, 0.12), k);
    layer = mix(layer, sunCol * 0.35, (1.0 - k) * 0.25);
    float edge = smoothstep(0.004, -0.002, p.y - y);
    float fogband = smoothstep(y - 0.18, y, p.y);
    layer = mix(layer, layer * 0.78, 1.0 - fogband);
    col = mix(col, layer, edge);
  }
  return col;
}
`;

export default source;
