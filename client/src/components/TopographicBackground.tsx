import { useEffect, useRef } from "react";
import * as THREE from "three";

type TopographicBackgroundProps = {
  interactive?: boolean;
  bgColor?: string;
  position?: "fixed" | "absolute";
  sizeExtra?: number;
  onFirstFrame?: () => void;
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform vec3 u_bgColor;
  uniform float u_hasBg;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.45;
      frequency *= 2.0;
    }
    return value;
  }

  float contourLine(float height, float spacing, float thickness) {
    float line = abs(fract(height / spacing + 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, thickness, line);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 p = uv * aspect;

    float t = u_time * 0.02;

    vec2 mouseOffset = vec2(0.0);
    if (u_mouse.x != 0.0 || u_mouse.y != 0.0) {
      vec2 mPos = (uv - 0.5) * aspect - u_mouse * 0.5 * aspect;
      float mouseDist = length(mPos);
      float falloff = exp(-mouseDist * 5.0);
      float ripple = sin(mouseDist * 10.0 - u_time * 1.2) * falloff * 0.04;
      mouseOffset = normalize(mPos + 0.001) * ripple;
    }

    vec2 samplePos = p * 1.6 + vec2(t * 0.3, t * 0.2) + mouseOffset;

    float height = fbm(samplePos);
    height += 0.2 * snoise(samplePos * 0.4 + vec2(t * 0.1, -t * 0.08));

    float majorLine = contourLine(height, 0.15, 0.008);
    float minorLine = contourLine(height, 0.05, 0.004);

    float tonalNoise = snoise(samplePos * 0.25 + vec2(t * 0.06, t * 0.09)) * 0.5 + 0.5;

    vec3 dark = u_color * 0.78;
    vec3 light = mix(u_color, vec3(1.0), 0.28);
    vec3 lineColor;
    if (tonalNoise < 0.4) {
      lineColor = mix(dark, u_color, tonalNoise / 0.4);
    } else if (tonalNoise < 0.7) {
      lineColor = mix(u_color, light, (tonalNoise - 0.4) / 0.3);
    } else {
      lineColor = mix(light, u_color, (tonalNoise - 0.7) / 0.3);
    }

    float combinedLine = min(majorLine * 0.85 + minorLine * 0.35, 1.0);

    float alpha = combinedLine * 0.70;

    alpha *= smoothstep(0.0, 0.15, uv.x) * smoothstep(0.0, 0.15, 1.0 - uv.x);
    alpha *= smoothstep(0.0, 0.1, uv.y) * smoothstep(0.0, 0.1, 1.0 - uv.y);

    if (u_hasBg > 0.5) {
      gl_FragColor = vec4(mix(u_bgColor, lineColor, alpha), 1.0);
    } else {
      gl_FragColor = vec4(lineColor, alpha);
    }
  }
`;

function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

export default function TopographicBackground({ interactive = true, bgColor, position = "fixed", sizeExtra = 0, onFirstFrame }: TopographicBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const interactiveRef = useRef(interactive);

  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) return;

    const color = hexToVec3("#2e6884");

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    const initW = window.innerWidth + sizeExtra * 2;
    const initH = window.innerHeight + sizeExtra * 2;
    renderer.setSize(initW, initH);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const bg = bgColor ? hexToVec3(bgColor) : [1, 1, 1] as [number, number, number];
    const uniforms = {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_resolution: { value: new THREE.Vector2(initW * dpr, initH * dpr) },
      u_color: { value: new THREE.Vector3(color[0], color[1], color[2]) },
      u_bgColor: { value: new THREE.Vector3(bg[0], bg[1], bg[2]) },
      u_hasBg: { value: bgColor ? 1.0 : 0.0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: !bgColor,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onResize = () => {
      const w = window.innerWidth + sizeExtra * 2;
      const h = window.innerHeight + sizeExtra * 2;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w * dpr, h * dpr);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);

    const startTime = performance.now();

    let stopped = false;
    let firstFrameFired = false;

    const animate = () => {
      if (stopped) return;
      rafRef.current = requestAnimationFrame(animate);

      if (interactiveRef.current) {
        uniforms.u_time.value = (performance.now() - startTime) * 0.001;
      }

      if (interactiveRef.current) {
        smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * 0.05;
        smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * 0.05;
        uniforms.u_mouse.value.set(smoothMouseRef.current.x, smoothMouseRef.current.y);
      }

      try {
        renderer.render(scene, camera);
        if (!firstFrameFired) {
          firstFrameFired = true;
          onFirstFrame?.();
        }
      } catch {
        stopped = true;
        cancelAnimationFrame(rafRef.current);
      }
    };

    renderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      stopped = true;
      cancelAnimationFrame(rafRef.current);
    });

    animate();

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${position === "fixed" ? "fixed" : "absolute"} inset-0 pointer-events-none`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
