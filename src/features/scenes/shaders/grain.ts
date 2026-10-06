// Soft grain: slow colour fields on a dark paper stock. The cleanest option for text-heavy sessions.
const source = `
vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 base = mix(vec3(0.075, 0.075, 0.085), uTint * 0.1 + 0.035, uFollow * 0.7);
  vec3 hueA = mix(vec3(0.3, 0.32, 0.45), uTint, uFollow * 0.6);
  vec3 hueB = mix(vec3(0.42, 0.34, 0.3), mix(uTint, uTint.yzx, 0.5), uFollow * 0.6);

  vec3 col = base;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(t * 0.05 + fi * 2.1) * 0.55, cos(t * 0.043 + fi * 1.3) * 0.32);
    float d = length((p - c) * vec2(0.8, 1.1));
    float a = exp(-d * d * (2.6 + fi * 0.6));
    col += mix(hueA, hueB, fi / 2.0) * a * 0.32;
  }

  float fibre = fbm(p * vec2(60.0, 4.0) + 3.0) * fbm(p * vec2(3.0, 50.0) + 8.0);
  col *= 0.94 + 0.12 * fibre * 2.0;

  float frame = floor(t * 14.0);
  float g = hash21(gl_FragCoord.xy + frame * 17.0) - 0.5;
  col += g * 0.055;
  return col;
}
`;

export default source;
