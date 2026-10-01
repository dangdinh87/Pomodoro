// Night sea under a low moon.
const source = `
vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 moonCol = mix(vec3(0.85, 0.92, 1.0), uTint * 0.4 + 0.65, uFollow * 0.5);
  vec2 moon = vec2(0.17, 0.2);
  float horizon = -0.06;

  vec3 col;
  if (p.y > horizon) {
    float h = (p.y - horizon) / (0.5 - horizon);
    col = mix(vec3(0.06, 0.1, 0.17), vec3(0.008, 0.015, 0.04), pow(h, 0.6));
    col += vec3(stars(p, 90.0, 0.045, t) + stars(p + 5.0, 150.0, 0.03, t)) * smoothstep(0.12, 0.5, h) * 0.8;
    float md = length(p - moon);
    col += moonCol * exp(-md * 6.0) * 0.18;
    col = mix(col, moonCol, smoothstep(0.034, 0.03, md));
  } else {
    float d = horizon - p.y;
    float persp = 1.0 / (d + 0.05);
    vec2 sp = vec2(p.x * persp * 0.55, persp * 0.7 - t * 0.12);
    float w = vnoise(sp * vec2(2.2, 5.0)) * 0.6 + vnoise(sp * vec2(5.0, 11.0) + t * 0.15) * 0.4;
    vec3 deep = vec3(0.012, 0.03, 0.06);
    vec3 near = vec3(0.02, 0.06, 0.1);
    col = mix(vec3(0.05, 0.09, 0.15), mix(near, deep, smoothstep(0.1, 0.5, d)), smoothstep(0.0, 0.1, d));
    float spread = mix(0.1, 0.9, smoothstep(0.0, 0.5, d));
    float column = exp(-pow(abs(p.x - moon.x) / spread * 4.0, 1.4));
    float glint = smoothstep(0.52, 0.85, w) * column;
    col += moonCol * glint * (0.7 + 0.8 * smoothstep(0.0, 0.4, d)) * 0.9;
    col += vec3(0.1, 0.16, 0.24) * smoothstep(0.55, 0.9, w) * 0.2;
    col = mix(col, vec3(0.07, 0.11, 0.18), exp(-d * 18.0) * 0.8);
  }
  return col;
}
`;

export default source;
