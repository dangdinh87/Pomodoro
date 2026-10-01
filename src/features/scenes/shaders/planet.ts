// A slowly turning planet with a lit rim, over a quiet star field. Atmosphere follows the timer mode.
const source = `
vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 atmo = mix(vec3(0.35, 0.65, 1.0), uTint, uFollow);
  vec3 landA = mix(vec3(0.16, 0.3, 0.42), uTint * 0.45, uFollow * 0.6);
  vec3 landB = mix(vec3(0.72, 0.62, 0.5), mix(uTint, vec3(1.0), 0.55), uFollow * 0.5);

  vec3 col = vec3(0.006, 0.008, 0.02) + vec3(0.01, 0.014, 0.03) * (1.0 - uv.y);
  float s = stars(p + vec2(t * 0.002, 0.0), 60.0, 0.07, t) * 0.8 + stars(p + 4.0, 120.0, 0.05, t);
  col += vec3(0.85, 0.9, 1.0) * s;

  vec2 c = vec2(0.34, -0.22);
  float R = 0.4;
  vec2 q = (p - c) / R;
  float r = length(q);
  vec3 L = normalize(vec3(-0.65, 0.45, 0.6));

  if (r < 1.0) {
    float z = sqrt(1.0 - r * r);
    vec3 n = vec3(q, z);
    float a = t * 0.035;
    vec3 rn = vec3(n.x * cos(a) + n.z * sin(a), n.y, -n.x * sin(a) + n.z * cos(a));
    float tilt = 0.35;
    rn = vec3(rn.x, rn.y * cos(tilt) - rn.z * sin(tilt), rn.y * sin(tilt) + rn.z * cos(tilt));
    float h = fbm3(rn * 2.6 + 3.0);
    float bands = 0.5 + 0.5 * sin(rn.y * 7.0 + h * 5.0);
    vec3 surf = mix(landA, landB, smoothstep(0.35, 0.75, h * 0.6 + bands * 0.4));
    surf = mix(surf, vec3(0.92, 0.95, 1.0), smoothstep(0.78, 0.95, abs(rn.y)) * 0.7);
    float cloud = smoothstep(0.52, 0.8, fbm3(rn * 4.2 + vec3(t * 0.01, 0.0, 0.0)));
    surf = mix(surf, vec3(1.0), cloud * 0.3);
    float diff = clamp(dot(n, L), 0.0, 1.0);
    float wrap = smoothstep(-0.1, 0.55, dot(n, L));
    vec3 planet = surf * (0.05 + 1.05 * wrap) + atmo * pow(1.0 - z, 3.0) * (0.25 + 0.9 * diff);
    col = mix(col, planet, smoothstep(1.0, 0.985, r));
  }
  float halo = exp(-(r - 1.0) * 7.0) * step(1.0, r);
  vec2 dir = normalize(q + 0.0001);
  float side = clamp(dot(dir, normalize(L.xy)) * 0.5 + 0.55, 0.0, 1.0);
  col += atmo * halo * side * 0.35;
  return col;
}
`;

export default source;
