import { useEffect, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const liquidFragSource = `#version 300 es
#ifdef GL_ES
precision highp float;
#else
precision mediump float;
#endif

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m*m; m = m*m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

vec2 get_img_uv() {
  vec2 img_uv = vUv;
  img_uv -= .5;
  if (u_ratio > u_img_ratio) {
    img_uv.x = img_uv.x * u_ratio / u_img_ratio;
  } else {
    img_uv.y = img_uv.y * u_img_ratio / u_ratio;
  }
  img_uv += .5;
  img_uv.y = 1. - img_uv.y;
  return img_uv;
}

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
  float ch = c2;
  float border = 0.;
  float blur = u_patternBlur + extra_blur;
  ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
  border = w[0];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  b = smoothstep(.2, .8, b);
  border = w[0] + .4 * (1. - b) * w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + .5 * (1. - b) * w[1];
  ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
  return ch;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
  float a = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
  a *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
  return a;
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;
  float diagonal = uv.x - uv.y;
  float t = .001 * mod(u_time, 10000.0);
  vec2 img_uv = get_img_uv();
  vec4 img = texture(u_image_texture, img_uv);
  vec3 color = vec3(0.);
  float opacity = 1.;
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));
  float edge = img.r;
  vec2 grad_uv = uv - .5;
  float dist = length(grad_uv + vec2(0., .2 * diagonal));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
  float bulge = pow(1.8 * dist, 1.2);
  bulge = 1. - bulge;
  bulge *= pow(uv.y, .3);
  float cycle_width = u_patternScale;
  float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
  float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
  opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
  opacity *= get_img_frame_alpha(img_uv, 0.01);
  float noise = snoise(uv - t);
  edge += (1. - edge) * u_liquid * noise;
  float refr = clamp(1. - bulge, 0., 1.);
  float dir = grad_uv.x + diagonal;
  dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
  bulge *= clamp(pow(uv.y, .1), .3, 1.);
  dir *= (.1 + (1.1 - edge) * bulge);
  dir *= smoothstep(1., .7, edge);
  dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
  dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
  dir *= (.5 + .5 * pow(uv.y, 2.));
  dir *= cycle_width;
  dir -= t;
  float refr_r = refr + .03 * bulge * noise;
  float refr_b = 1.3 * refr;
  refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
  refr_r -= diagonal;
  refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
  refr_b -= .2 * edge;
  refr_r *= u_refraction;
  refr_b *= u_refraction;
  vec3 w = vec3(thin_strip_1_ratio * cycle_width, thin_strip_2_ratio * cycle_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
  float stripe_r = mod(dir + refr_r, 1.);
  float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);
  float stripe_g = mod(dir, 1.);
  float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);
  float stripe_b = mod(dir - refr_b, 1.);
  float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);
  color = vec3(r, g, b) * opacity;
  fragColor = vec4(color, opacity);
}`;

function generateTextImageData(text: string, iconChar?: string): ImageData {
  const fontSize = 48;
  const fontWeight = 700;
  const fontFamily = "'DM Sans', 'Arial', sans-serif";

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = tempCtx.measureText(text);
  const textWidth = Math.ceil(metrics.width);

  const iconWidth = iconChar ? fontSize * 0.7 : 0;
  const gap = iconChar ? 12 : 0;
  const totalW = textWidth + iconWidth + gap + 80;
  const totalH = Math.ceil(fontSize * 2.2);

  const canvas = document.createElement("canvas");
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, totalW, totalH);

  const roundR = totalH * 0.35;
  ctx.beginPath();
  ctx.moveTo(roundR, 4);
  ctx.lineTo(totalW - roundR, 4);
  ctx.quadraticCurveTo(totalW - 4, 4, totalW - 4, roundR);
  ctx.lineTo(totalW - 4, totalH - roundR);
  ctx.quadraticCurveTo(totalW - 4, totalH - 4, totalW - roundR, totalH - 4);
  ctx.lineTo(roundR, totalH - 4);
  ctx.quadraticCurveTo(4, totalH - 4, 4, totalH - roundR);
  ctx.lineTo(4, roundR);
  ctx.quadraticCurveTo(4, 4, roundR, 4);
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const contentStart = (totalW - textWidth - iconWidth - gap) / 2;
  if (iconChar) {
    ctx.font = `400 ${fontSize * 0.65}px ${fontFamily}`;
    ctx.fillText(iconChar, contentStart + iconWidth / 2, totalH / 2);
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillText(text, contentStart + iconWidth + gap + textWidth / 2, totalH / 2);

  const shapeData = ctx.getImageData(0, 0, totalW, totalH);
  const d = shapeData.data;
  const shapeMask = new Uint8Array(totalW * totalH);

  for (let i = 0; i < totalW * totalH; i++) {
    const idx = i * 4;
    const r = d[idx], g = d[idx + 1], b = d[idx + 2], a = d[idx + 3];
    shapeMask[i] = (r < 128 && g < 128 && b < 128 && a > 128) ? 1 : 0;
  }

  const boundaryMask = new Uint8Array(totalW * totalH);
  for (let y = 0; y < totalH; y++) {
    for (let x = 0; x < totalW; x++) {
      const idx = y * totalW + x;
      if (!shapeMask[idx]) continue;
      for (let ny = y - 1; ny <= y + 1; ny++) {
        for (let nx = x - 1; nx <= x + 1; nx++) {
          if (nx < 0 || nx >= totalW || ny < 0 || ny >= totalH || !shapeMask[ny * totalW + nx]) {
            boundaryMask[idx] = 1;
            break;
          }
        }
        if (boundaryMask[idx]) break;
      }
    }
  }

  const u = new Float32Array(totalW * totalH);
  const newU = new Float32Array(totalW * totalH);
  const C = 0.01;
  const ITERATIONS = 150;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let y = 0; y < totalH; y++) {
      for (let x = 0; x < totalW; x++) {
        const idx = y * totalW + x;
        if (!shapeMask[idx] || boundaryMask[idx]) { newU[idx] = 0; continue; }
        let sum = 0;
        if (x + 1 < totalW && shapeMask[idx + 1]) sum += u[idx + 1];
        if (x - 1 >= 0 && shapeMask[idx - 1]) sum += u[idx - 1];
        if (y + 1 < totalH && shapeMask[idx + totalW]) sum += u[idx + totalW];
        if (y - 1 >= 0 && shapeMask[idx - totalW]) sum += u[idx - totalW];
        newU[idx] = (C + sum) / 4;
      }
    }
    u.set(newU);
  }

  let maxVal = 0;
  for (let i = 0; i < u.length; i++) if (u[i] > maxVal) maxVal = u[i];

  const outImg = ctx.createImageData(totalW, totalH);
  const alpha = 2;
  for (let i = 0; i < totalW * totalH; i++) {
    const px = i * 4;
    if (!shapeMask[i]) {
      outImg.data[px] = 255;
      outImg.data[px + 1] = 255;
      outImg.data[px + 2] = 255;
      outImg.data[px + 3] = 255;
    } else {
      const raw = maxVal > 0 ? u[i] / maxVal : 0;
      const gray = 255 * (1 - Math.pow(raw, alpha));
      outImg.data[px] = gray;
      outImg.data[px + 1] = gray;
      outImg.data[px + 2] = gray;
      outImg.data[px + 3] = 255;
    }
  }

  return outImg;
}

interface LiquidMetalButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
  speed?: number;
}

export default function LiquidMetalButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  testId,
  speed = 0.25,
}: LiquidMetalButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const rafRef = useRef(0);
  const totalTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const textureRef = useRef<WebGLTexture | null>(null);
  const webglReady = useRef(false);

  const setupCanvas = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uniforms.u_ratio) gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const createShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fs = createShader(liquidFragSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const uLocs: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uLocs[info.name] = gl.getUniformLocation(program, info.name);
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    if (uLocs.u_patternScale) gl.uniform1f(uLocs.u_patternScale, 2);
    if (uLocs.u_refraction) gl.uniform1f(uLocs.u_refraction, 0.006);
    if (uLocs.u_edge) gl.uniform1f(uLocs.u_edge, 0.5);
    if (uLocs.u_patternBlur) gl.uniform1f(uLocs.u_patternBlur, 0.005);
    if (uLocs.u_liquid) gl.uniform1f(uLocs.u_liquid, 0.07);

    glRef.current = gl;
    uniformsRef.current = uLocs;

    const imgData = generateTextImageData(label);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (uLocs.u_ratio) gl.uniform1f(uLocs.u_ratio, canvas.width / canvas.height);
    if (uLocs.u_img_ratio) gl.uniform1f(uLocs.u_img_ratio, imgData.width / imgData.height);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgData.width, imgData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
    if (uLocs.u_image_texture) gl.uniform1i(uLocs.u_image_texture, 0);
    textureRef.current = texture;
    webglReady.current = true;

    let stopped = false;
    const animate = (time: number) => {
      if (stopped) return;
      rafRef.current = requestAnimationFrame(animate);

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      totalTimeRef.current += dt * speed;
      const normTime = totalTimeRef.current % 10000;

      if (uLocs.u_time) gl.uniform1f(uLocs.u_time, normTime);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    rafRef.current = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => setupCanvas());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (textureRef.current) gl.deleteTexture(textureRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(vBuffer);
    };
  }, [label, speed, setupCanvas]);

  return (
    <button
      ref={containerRef}
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden rounded-xl transition-transform duration-200"
      style={{
        width: "100%",
        height: "44px",
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full rounded-xl"
        style={{ pointerEvents: "none" }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center gap-2 text-[12px] font-semibold pointer-events-none"
        style={{
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          mixBlendMode: "difference",
          zIndex: 1,
        }}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{label}</span>
      </span>
    </button>
  );
}
