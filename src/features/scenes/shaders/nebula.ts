// Slow domain-warped nebula with three parallax star layers. Hue follows the timer mode.
const source = `
vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 accA = mix(vec3(0.42, 0.24, 0.9), uTint, uFollow * 0.55);
  vec3 accB = mix(vec3(0.12, 0.55, 0.95), mix(uTint, uTint.zxy, 0.55), uFollow * 0.5);

  vec2 q = p * 1.7 + vec2(t * 0.012, -t * 0.006);
  float n1 = fbm(q + vec2(1.7, 9.2));
  float n2 = fbm(q * 1.4 + n1 * 2.2 - vec2(t * 0.02, 0.0));
  float n3 = fbm(q * 2.6 - n2 * 1.4 + t * 0.01);

  vec3 col = vec3(0.012, 0.014, 0.03);
  float cloud = smoothstep(0.32, 0.95, n2);
  col += accA * cloud * (0.16 + 0.4 * n1);
  col += accB * pow(n1 * n3, 1.8) * 1.2;
  col += mix(accA, accB, 0.5) * smoothstep(0.7, 1.0, n2 * n3 * 1.6) * 0.35;

  float s = 0.0;
  s += stars(p + vec2(t * 0.003, 0.0), 45.0, 0.08, t) * 0.7;
  s += stars(p + vec2(t * 0.006, 0.0) + 3.0, 85.0, 0.07, t) * 0.9;
  s += stars(p + vec2(t * 0.011, 0.0) + 7.0, 150.0, 0.05, t);
  col += vec3(0.8, 0.88, 1.0) * s * (1.0 - cloud * 0.5);
  return col;
}
`;

export default source;
