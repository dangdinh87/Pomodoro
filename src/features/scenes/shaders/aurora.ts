// Aurora curtains over a dark ridge line. Hue follows the timer mode.
const source = `
float ridge(float x, float seed, float base, float amp) {
  return base + amp * (fbm(vec2(x * 2.1 + seed, seed)) - 0.5) + 0.05 * (fbm(vec2(x * 7.0, seed * 3.0)) - 0.5);
}

vec3 scene(vec2 uv, vec2 p, float t) {
  // Only the upper curtain takes the mode colour; a full recolour turns the green into mud.
  vec3 accA = vec3(0.16, 0.92, 0.58);
  vec3 accB = mix(vec3(0.42, 0.34, 0.95), uTint, uFollow * 0.85);

  vec3 col = mix(vec3(0.035, 0.07, 0.11), vec3(0.004, 0.009, 0.03), pow(clamp(uv.y, 0.0, 1.0), 0.55));
  float sky = smoothstep(-0.05, 0.4, p.y);
  col += vec3(stars(p + vec2(t * 0.002, 0.0), 70.0, 0.05, t) + stars(p, 130.0, 0.04, t)) * sky * 0.9;

  vec3 glow = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x = p.x * (1.1 + fi * 0.25) + t * 0.025 * (1.0 + fi * 0.6);
    float wave = fbm(vec2(x * 1.5 + fi * 7.0, t * 0.04 + fi * 3.0));
    float base = 0.1 + fi * 0.08 + (wave - 0.5) * 0.34;
    float d = p.y - base;
    float body = smoothstep(-0.02, 0.05, d) * exp(-max(d, 0.0) * (4.2 - fi * 0.6));
    float rays = 0.5 + 0.5 * vnoise(vec2(p.x * 42.0 + fi * 13.0, t * 0.35 + fi));
    float lower = smoothstep(-0.03, 0.0, d);
    float inten = body * (0.35 + 0.65 * rays) * lower * (0.75 - fi * 0.14);
    glow += mix(accA, accB, clamp(d * 2.6 + fi * 0.18, 0.0, 1.0)) * inten;
  }
  col += glow * 1.15;

  float far = ridge(p.x, 3.0, -0.2, 0.2);
  float near = ridge(p.x * 1.15 + 4.0, 9.0, -0.33, 0.22);
  vec3 farCol = mix(vec3(0.012, 0.03, 0.05), accA * 0.08, 0.5);
  col = mix(col, farCol, smoothstep(0.006, -0.004, p.y - far));
  col += glow * 0.12 * smoothstep(0.006, -0.004, p.y - far) * 0.3;
  col = mix(col, vec3(0.003, 0.008, 0.014), smoothstep(0.006, -0.004, p.y - near));
  return col;
}
`;

export default source;
