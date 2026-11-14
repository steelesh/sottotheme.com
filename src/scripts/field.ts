const cell = 2;
const rate = 1000 / 30;
const rest = 8000;

const vertex = "attribute vec2 corner; void main() { gl_Position = vec4(corner, 0.0, 1.0); }";
const fragment = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 size;
uniform vec4 slab;
uniform vec4 calm;
uniform vec3 aim;
uniform vec3 tint;
uniform float time;
uniform float gain;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  float rise = (slab.y - p.y) / slab.w;
  float band = rise > 0.0 ? exp(-rise * 3.4) : max(exp(rise * 5.0), 0.6);
  float span = exp(-pow((p.x - slab.x) / (size.x * 0.52), 2.0) * 2.0);
  float cloud = noise(p / 64.0 + vec2(time * 0.05, -time * 0.035)) * 0.65 + noise(p / 24.0 - vec2(time * 0.04, 0.0)) * 0.35;
  float level = band * span * (0.5 + 0.65 * cloud) * gain;
  vec2 d = (p - aim.xy) / 44.0;
  level += exp(-dot(d, d)) * aim.z * (0.07 + 0.45 * level);
  level *= smoothstep(0.75, 1.5, length((p - calm.xy) / calm.zw));
  float lit = step(bayer4(p) + 0.09, level);
  float alpha = lit * (0.045 + 0.14 * min(level, 1.0));
  gl_FragColor = vec4(tint * alpha, alpha);
}`;

const canvas = document.querySelector<HTMLCanvasElement>(".field");
const hero = document.querySelector<HTMLElement>(".hero");
const slab = document.querySelector<HTMLElement>(".window");
const calm = document.querySelector<HTMLElement>(".brand");
const gl = canvas?.getContext("webgl", { antialias: false, depth: false, stencil: false, powerPreference: "low-power" });

function compile(context: WebGLRenderingContext, kind: number, source: string) {
  const shader = context.createShader(kind);
  if (!shader) return null;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  return context.getShaderParameter(shader, context.COMPILE_STATUS) ? shader : null;
}

function build(context: WebGLRenderingContext) {
  const program = context.createProgram();
  const shaders = [compile(context, context.VERTEX_SHADER, vertex), compile(context, context.FRAGMENT_SHADER, fragment)];
  if (!program || !shaders[0] || !shaders[1]) return null;
  context.attachShader(program, shaders[0]);
  context.attachShader(program, shaders[1]);
  context.linkProgram(program);
  return context.getProgramParameter(program, context.LINK_STATUS) ? program : null;
}

const program = gl ? build(gl) : null;

if (canvas && hero && slab && calm && gl && program) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const at = (name: string) => gl.getUniformLocation(program, name);
  const uniform = { size: at("size"), slab: at("slab"), calm: at("calm"), aim: at("aim"), tint: at("tint"), time: at("time"), gain: at("gain") };
  const styles = getComputedStyle(hero);
  const shades = new Map<string, number[]>();
  const shade = (role: string) => {
    const known = shades.get(role);
    if (known) return known;
    const hex = styles.getPropertyValue(`--${role}`).trim().slice(1);
    const rgb = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    shades.set(role, rgb);
    return rgb;
  };
  const tint = [...shade("voice")];
  const pointer = { x: 0, y: 0, goal: 0, ax: 0, ay: 0, force: 0 };
  const born = performance.now();
  let last = 0;
  let clock = 0;
  let until = 0;
  let running = false;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.bindAttribLocation(program, 0, "corner");
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const draw = (now: number) => {
    const seconds = (now - born) / 1000;
    const rise = Math.min(1, Math.max(0, (seconds - 0.7) / 2.6));
    const { left, top } = hero.getBoundingClientRect();
    pointer.ax += ((pointer.x - left) / cell - pointer.ax) * 0.16;
    pointer.ay += ((pointer.y - top) / cell - pointer.ay) * 0.16;
    pointer.force += (pointer.goal - pointer.force) * 0.08;
    const role = hero.querySelector<HTMLElement>(".swatch:is(:hover, :focus-visible)")?.dataset.role ?? hero.dataset.role ?? "voice";
    shade(role).forEach((value, index) => {
      tint[index] = still ? value : (tint[index] ?? value) + (value - (tint[index] ?? value)) * 0.1;
    });
    gl.uniform3f(uniform.tint, tint[0] ?? 1, tint[1] ?? 1, tint[2] ?? 1);
    gl.uniform1f(uniform.time, clock / 1000);
    gl.uniform1f(uniform.gain, still ? 1 : 1 - (1 - rise) ** 3);
    gl.uniform3f(uniform.aim, pointer.ax, pointer.ay, pointer.force);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const measure = () => {
    canvas.width = Math.ceil(hero.clientWidth / cell);
    canvas.height = Math.ceil(hero.clientHeight / cell);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniform.size, canvas.width, canvas.height);
    gl.uniform4f(
      uniform.slab,
      (slab.offsetLeft + slab.offsetWidth / 2) / cell,
      slab.offsetTop / cell,
      slab.offsetWidth / 2 / cell,
      (innerHeight * 0.24) / cell,
    );
    gl.uniform4f(
      uniform.calm,
      (calm.offsetLeft + calm.offsetWidth / 2) / cell,
      (calm.offsetTop + calm.offsetHeight / 2) / cell,
      calm.offsetWidth / 2 / cell,
      calm.offsetHeight / 2 / cell,
    );
    draw(performance.now());
  };

  const tick = (now: number) => {
    if (now - last >= rate) {
      clock += Math.min(now - last, 100);
      last = now;
      draw(now);
    }
    if (now < until) requestAnimationFrame(tick);
    else running = false;
  };

  const wake = () => {
    until = performance.now() + rest;
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  };

  new ResizeObserver(measure).observe(hero);

  if (still) {
    const redraw = () => requestAnimationFrame(draw);
    for (const type of ["pointerover", "pointerout", "click", "keyup", "focusin", "focusout"]) addEventListener(type, redraw, { passive: true });
  } else {
    wake();
    for (const type of ["pointermove", "pointerdown", "keydown", "focusin"]) addEventListener(type, wake, { passive: true });
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      addEventListener(
        "pointermove",
        (event) => {
          pointer.x = event.clientX;
          pointer.y = event.clientY;
          pointer.goal = 1;
        },
        { passive: true },
      );
      document.documentElement.addEventListener("pointerleave", () => {
        pointer.goal = 0;
      });
    }
  }
}
