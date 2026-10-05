"use client";
import { useEffect, useRef } from "react";

const VERTEX = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    vec2 flow_uv = p;
    float time = u_time * 0.4;

    for (float i = 1.0; i < 4.0; i++) {
      flow_uv *= rot(time * 0.1);
      flow_uv.x += sin(flow_uv.y * 2.0 * i + time) * 0.5;
      flow_uv.y += cos(flow_uv.x * 1.5 * i - time * 0.8) * 0.5;
    }

    float intensity = sin(flow_uv.x * 2.0 + flow_uv.y * 3.0) * 0.5 + 0.5;

    vec3 col_dark = vec3(0.03, 0.01, 0.0);
    vec3 col_mid = vec3(0.8, 0.3, 0.0);
    vec3 col_bright = vec3(1.0, 0.6, 0.2);

    vec3 fluid_color = mix(col_dark, col_mid, smoothstep(0.2, 0.6, intensity));
    fluid_color = mix(fluid_color, col_bright, smoothstep(0.7, 1.0, intensity));

    float gridSize = 6.0;
    vec2 grid_uv = gl_FragCoord.xy / gridSize;
    vec2 cell_uv = fract(grid_uv) - 0.5;

    float dist = length(cell_uv);
    float radius = intensity * 0.45;
    float dot_mask = smoothstep(radius, radius - 0.1, dist);

    vec3 final_color = mix(vec3(0.0), fluid_color, dot_mask);
    final_color += fluid_color * 0.12;

    gl_FragColor = vec4(final_color, 1.0);
  }
`;

const FRAME_MS = 1000 / 30; // cap at about 30 fps

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return; // falls back to the plain dark background

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]),
      gl.STATIC_DRAW
    );
    const position = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (seconds: number) => {
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, seconds);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let last = 0;
    let raf = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      draw((now - start) / 1000);
    };

    const onResize = () => {
      resize();
      if (reduceMotion) draw(8); // still frame
    };

    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };

    resize();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) {
      draw(8);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] print:hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}