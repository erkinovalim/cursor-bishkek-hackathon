"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  vec3 orangeYellow(float t, vec2 uv) {
    vec3 deepOrange = vec3(1.0, 0.35, 0.05);
    vec3 brightOrange = vec3(1.0, 0.55, 0.08);
    vec3 gold = vec3(1.0, 0.78, 0.15);
    vec3 yellow = vec3(1.0, 0.92, 0.35);

    float wave1 = sin(uv.x * 2.8 + t * 0.7) * cos(uv.y * 2.2 - t * 0.5);
    float wave2 = sin(length(uv + vec2(sin(t * 0.3), cos(t * 0.4))) * 3.5 - t);
    float wave3 = cos(uv.x * 1.5 - uv.y * 2.0 + t * 0.9);

    float blend = wave1 * 0.35 + wave2 * 0.4 + wave3 * 0.25;
    blend = blend * 0.5 + 0.5;

    vec3 col = mix(deepOrange, brightOrange, smoothstep(0.0, 0.4, blend));
    col = mix(col, gold, smoothstep(0.35, 0.7, blend));
    col = mix(col, yellow, smoothstep(0.65, 1.0, blend));

    float glow = exp(-length(uv) * 0.35) * 0.15;
    col += vec3(1.0, 0.9, 0.5) * glow;

    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
    vec3 col = orangeYellow(uTime, uv);

    float vignette = 1.0 - length(uv) * 0.12;
    col *= clamp(vignette, 0.75, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
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

export function GradientShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "uTime");
    const resLoc = gl.getUniformLocation(program, "uResolution");

    let raf = 0;
    const start = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }

    function draw() {
      const t = (performance.now() - start) / 1000;
      gl!.useProgram(program);
      gl!.uniform1f(timeLoc, t);
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
      gl!.enableVertexAttribArray(posLoc);
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
