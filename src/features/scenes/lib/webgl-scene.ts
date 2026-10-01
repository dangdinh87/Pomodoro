import { buildFragment, VERTEX_SHADER } from '../shaders/common';
import type { Rgb } from './mode-tint';

export interface SceneFrame {
  time: number;
  tint: Rgb;
  /** 0..1, how strongly the scene adopts the timer-mode colour. */
  follow: number;
  /** Multiplier on the final colour (1 = unchanged). */
  brightness: number;
}

const UNIFORMS = ['uTime', 'uRes', 'uTint', 'uFollow', 'uBright'] as const;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[scenes] shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** One fullscreen-triangle program per scene. Shared by the live background and the thumbnails. */
export class SceneRenderer {
  private readonly uniforms: Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

  private constructor(
    private readonly gl: WebGLRenderingContext,
    private readonly program: WebGLProgram,
    private readonly buffer: WebGLBuffer | null,
  ) {
    this.uniforms = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as SceneRenderer['uniforms'];
  }

  static create(canvas: HTMLCanvasElement, body: string, options?: { preserveDrawingBuffer?: boolean }): SceneRenderer | null {
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: options?.preserveDrawingBuffer ?? false,
    });
    if (!gl) return null;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, buildFragment(body));
    const program = gl.createProgram();
    if (!vs || !fs || !program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // One oversized triangle covers the viewport without a diagonal seam.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return new SceneRenderer(gl, program, buffer);
  }

  draw(width: number, height: number, frame: SceneFrame): void {
    const { gl, uniforms } = this;
    gl.viewport(0, 0, width, height);
    gl.uniform1f(uniforms.uTime, frame.time);
    gl.uniform2f(uniforms.uRes, width, height);
    gl.uniform3f(uniforms.uTint, frame.tint[0], frame.tint[1], frame.tint[2]);
    gl.uniform1f(uniforms.uFollow, frame.follow);
    gl.uniform1f(uniforms.uBright, frame.brightness);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    const { gl } = this;
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
