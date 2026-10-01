// Rain running down a window, refracting blurred city lights.
const source = `
vec3 bokehLayer(vec2 q, float scale, float seed, float t) {
  vec2 g = q * scale;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec3 acc = vec3(0.0);
  for (int oy = -1; oy <= 1; oy++) {
    for (int ox = -1; ox <= 1; ox++) {
      vec2 o = vec2(float(ox), float(oy));
      vec2 cid = id + o;
      float h = hash21(cid + seed);
      vec2 c = (hash22(cid + seed * 1.7) - 0.5) * 0.7 + o;
      float r = 0.2 + 0.22 * hash21(cid + 3.1 + seed);
      float d = length(f - c);
      float body = smoothstep(r, r * 0.25, d) * 0.5;
      float rim = smoothstep(r * 0.55, r * 0.95, d) * smoothstep(r, r * 0.9, d) * 0.22;
      vec3 tint = h < 0.4 ? vec3(1.0, 0.6, 0.26) : (h < 0.65 ? vec3(0.96, 0.32, 0.42) : (h < 0.85 ? vec3(0.3, 0.7, 1.0) : vec3(1.0, 0.88, 0.66)));
      float live = step(0.4, hash21(cid + 11.0 + seed)) * (0.8 + 0.2 * sin(t * 0.4 + h * 30.0));
      acc += tint * (body + rim) * live;
    }
  }
  return acc;
}

vec3 city(vec2 q, float t) {
  vec3 col = mix(vec3(0.07, 0.085, 0.15), vec3(0.012, 0.016, 0.04), clamp(q.y + 0.5, 0.0, 1.0));
  float zone = 0.1 + 0.9 * smoothstep(0.1, -0.32, q.y);
  col += bokehLayer(q + vec2(0.0, 0.1), 4.5, 1.0, t) * 0.7 * zone;
  col += bokehLayer(q + vec2(0.31, 0.0), 8.0, 7.0, t) * 0.45 * zone;
  col += bokehLayer(q + vec2(0.7, -0.2), 2.6, 15.0, t) * 0.4 * smoothstep(0.0, -0.4, q.y);
  col += vec3(0.5, 0.28, 0.2) * exp(-pow((q.y + 0.33) * 5.0, 2.0)) * 0.12;
  return col;
}

// xy = refraction offset in screen space, z = drop/trail mask
vec3 drops(vec2 p, float t) {
  vec3 res = vec3(0.0);
  for (int l = 0; l < 2; l++) {
    float fl = float(l);
    float sc = 5.0 + fl * 4.5;
    vec2 q = p * sc;
    vec2 id = floor(q);
    vec2 f = fract(q) - 0.5;
    float h = hash21(id + fl * 31.0);
    float ph = fract(t * (0.045 + 0.05 * h) + h * 7.0);
    float y = (0.5 - ph) * 0.9;
    float wob = (h - 0.5) * 0.3 + sin(t * 0.8 + h * 20.0) * 0.02;
    vec2 d = f - vec2(wob, y);
    float on = step(0.4, hash21(id + 5.0 + fl));
    float len = length(d * vec2(1.0, 0.8));
    float drop = smoothstep(0.13, 0.1, len) * on;
    float trail = smoothstep(0.03, 0.0, abs(f.x - wob)) * step(y, f.y) * smoothstep(0.5, y, f.y) * on;
    res.xy += -d / sc * 3.2 * drop;
    res.z = max(res.z, max(drop, trail * 0.35));
  }
  float tiny = smoothstep(0.0, 0.03, vnoise(p * 80.0 + 5.0) - 0.78);
  res.z = max(res.z, tiny * 0.5);
  res.xy += (vec2(vnoise(p * 80.0), vnoise(p * 80.0 + 9.0)) - 0.5) * tiny * 0.02;
  return res;
}

vec3 scene(vec2 uv, vec2 p, float t) {
  vec3 dr = drops(p, t);
  vec3 col = city(p + dr.xy, t);
  col *= 1.0 + dr.z * 0.5;
  col += vec3(0.75, 0.85, 1.0) * pow(dr.z, 5.0) * 0.07;
  col = mix(col, vec3(luma(col)) * vec3(0.8, 0.9, 1.1), 0.12);
  return col;
}
`;

export default source;
