/* Sfondo "4D": shader WebGL fisso dietro tutta la pagina.
   Tre strati con parallasse (nebulosa lontana, aurora media, polvere vicina) + piano a griglia in prospettiva.
   Lo scroll sposta gli strati a velocità diverse e fa ruotare lentamente la palette tra i capitoli.
   DPR massimo 2, mezza risoluzione, si ferma quando la scheda non è visibile. */
(function () {
  const FRAG = `
precision highp float;
uniform vec2 uR; uniform float uT; uniform vec2 uM; uniform float uS; uniform float uP; uniform float uV;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1.0,0.0)), u.x), mix(h(i+vec2(0.0,1.0)), h(i+vec2(1.0,1.0)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) { v += a * n(p); p = r * p * 2.03 + 3.1; a *= 0.5; } return v; }
vec3 pal(float k){
  vec3 cy = vec3(0.133, 0.89, 1.0), vi = vec3(0.545, 0.42, 1.0), te = vec3(0.10, 0.75, 0.70), ma = vec3(0.70, 0.36, 0.95);
  k = fract(k);
  if (k < 0.25) return mix(cy, vi, k * 4.0);
  if (k < 0.5) return mix(vi, te, (k - 0.25) * 4.0);
  if (k < 0.75) return mix(te, ma, (k - 0.5) * 4.0);
  return mix(ma, cy, (k - 0.75) * 4.0);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uR;
  float asp = uR.x / uR.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * uR) / uR.y;
  vec2 m = (uM - 0.5) * vec2(asp, 1.0);
  float t = uT * 0.05;
  vec3 night = vec3(0.035, 0.05, 0.105);
  vec3 col = night;
  float hue = uP * 0.75;

  /* strato lontano: nebulosa, parallasse lenta */
  vec2 pf = p + vec2(0.0, uS * 0.1) + m * 0.04;
  float neb = fbm(pf * 1.1 + vec2(t * 0.6, -t * 0.4));
  col += pal(hue + 0.1) * 0.10 * smoothstep(0.35, 0.85, neb);
  col += pal(hue + 0.35) * 0.07 * smoothstep(0.5, 0.95, fbm(pf * 0.7 - vec2(t * 0.3, 0.0)));

  /* strato medio: nastri di aurora */
  vec2 pm = p + vec2(0.0, uS * 0.3) + m * 0.09;
  float mi = exp(-dot(p - m, p - m) * 3.0);
  vec2 w = pm + 0.3 * vec2(fbm(pm * 0.8 + vec2(t, 0.0)), fbm(pm * 0.8 + vec2(4.0, -t))) - 0.15;
  w += (p - m) * 0.14 * mi;
  float str = 0.55 + 0.45 * fbm(vec2(w.x * 7.0 + w.y * 2.0, t * 3.0));
  float y1 = mod(w.y + 0.6, 1.6) - 0.6;
  float d1 = y1 - (0.16 * sin(w.x * 1.7 + t * 2.2) + 0.1 * sin(w.x * 3.1 - t * 1.3) + 0.12);
  float d2 = y1 - (0.12 * sin(w.x * 2.2 - t * 1.7 + 1.3) - 0.24);
  float r1 = exp(-d1 * d1 * 20.0), r2 = exp(-d2 * d2 * 32.0);
  float boost = 1.0 + min(abs(uV), 1.0) * 0.5;
  col += pal(hue + 0.05 + w.x * 0.08) * r1 * str * 0.55 * boost;
  col += pal(hue + 0.3 - w.x * 0.06) * r2 * str * 0.38;
  col += vec3(1.0) * pow(r1 * str, 7.0) * 0.12;

  /* piano a griglia in prospettiva, in basso */
  float hz = -0.18;
  if (p.y < hz) {
    float dz = 1.0 / (hz - p.y + 0.02);
    vec2 g = vec2(p.x * dz * 0.9, dz + uS * 1.6 + t * 2.0);
    vec2 gl = abs(fract(g) - 0.5);
    float line = smoothstep(0.48, 0.5, max(gl.x, gl.y));
    float fade = smoothstep(0.0, 0.35, hz - p.y) * smoothstep(9.0, 2.0, dz);
    col += pal(hue + 0.15) * line * fade * 0.16;
  }

  /* strato vicino: polvere di stelle, parallasse veloce */
  vec2 ps = p * 9.0 + vec2(0.0, uS * 6.0) + m * 1.0;
  vec2 cell = floor(ps); vec2 fr = fract(ps) - 0.5;
  float rnd = h(cell);
  if (rnd > 0.9) {
    vec2 off = vec2(h(cell + 1.7), h(cell + 3.1)) - 0.5;
    vec2 dd = fr - off * 0.6; dd.y /= 1.0 + min(abs(uV), 1.0) * 5.0;
    float d = length(dd);
    float tw = 0.5 + 0.5 * sin(uT * (0.6 + rnd * 1.5) + rnd * 40.0);
    col += mix(vec3(0.6, 0.95, 1.0), vec3(0.8, 0.7, 1.0), h(cell + 9.0)) * smoothstep(0.08, 0.0, d) * (0.35 + 0.65 * tw) * 0.8;
  }

  /* luce del mouse */
  float md = length(p - m);
  col += pal(hue + 0.12) * 0.14 * exp(-md * md * 3.0);

  /* vignetta */
  float v = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(asp, 1.0) * 0.9));
  col = mix(night, col, 0.35 + 0.65 * v);
  col += (h(gl_FragCoord.xy + fract(uT)) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;
  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';

  function Aurora(canvas, opts) {
    opts = opts || {};
    this.c = canvas; this.scale = opts.scale || 0.5; this.static = !!opts.static;
    this.t0 = performance.now(); this.m = [0.6, 0.55]; this.mt = [0.6, 0.55];
    this.s = 0; this.st = 0; this.v = 0; this.p = 0; this.pt = 0; this.raf = 0;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) { document.documentElement.classList.add('no-gl'); return; }
    this.gl = gl;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {}; ['uR', 'uT', 'uM', 'uS', 'uP', 'uV'].forEach((k) => { this.u[k] = gl.getUniformLocation(pr, k); });
    this.loop = this.loop.bind(this); this.resize = this.resize.bind(this);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.stop(); this.gl = null; document.documentElement.classList.add('no-gl'); });
    window.addEventListener('resize', this.resize);
    if (!this.static) window.addEventListener('pointermove', (e) => { this.mt = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight]; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); else if (!this.static) this.start(); });
    this.resize();
    if (this.static) this.draw(18); else this.start();
  }
  Aurora.prototype.setScroll = function (screens, prog) { this.st = screens; this.pt = prog; if (this.static) { this.s = screens; this.p = prog; this.draw(18); } };
  Aurora.prototype.resize = function () {
    if (!this.gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2) * this.scale;
    const w = Math.max(2, Math.round(window.innerWidth * dpr)), hh = Math.max(2, Math.round(window.innerHeight * dpr));
    if (this.c.width !== w || this.c.height !== hh) { this.c.width = w; this.c.height = hh; this.gl.viewport(0, 0, w, hh); }
    if (!this.raf) this.draw(18);
  };
  Aurora.prototype.draw = function (t) {
    const gl = this.gl; if (!gl) return;
    this.m[0] += (this.mt[0] - this.m[0]) * 0.04; this.m[1] += (this.mt[1] - this.m[1]) * 0.04;
    const ds = (this.st - this.s) * 0.08; this.s += ds; this.v += (ds * 12 - this.v) * 0.1; this.p += (this.pt - this.p) * 0.05;
    gl.uniform2f(this.u.uR, this.c.width, this.c.height); gl.uniform1f(this.u.uT, t);
    gl.uniform2f(this.u.uM, this.m[0], this.m[1]); gl.uniform1f(this.u.uS, this.s); gl.uniform1f(this.u.uP, this.p); gl.uniform1f(this.u.uV, this.v);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  Aurora.prototype.loop = function (now) { this.draw((now - this.t0) / 1000); this.raf = requestAnimationFrame(this.loop); };
  Aurora.prototype.start = function () { if (!this.raf && this.gl) this.raf = requestAnimationFrame(this.loop); };
  Aurora.prototype.stop = function () { cancelAnimationFrame(this.raf); this.raf = 0; };
  window.Aurora = Aurora;
})();
