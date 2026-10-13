/* ---- construction des formes en fil de fer ---- */

const box = (x, y, z, w, h, d) => ({
    V: [...Array(8)].map((_, i) => [x + (i & 1 ? w : -w) / 2, y + (i & 2 ? h : -h) / 2, z + (i & 4 ? d : -d) / 2]),
    E: [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]]
});
const pyr = (s, b, h) => ({
    V: [[-s,b,-s],[s,b,-s],[s,b,s],[-s,b,s],[0,b-h,0]],
    E: [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]]
});
const line = (a, b) => ({ V: [a, b], E: [[0, 1]] });
const merge = (...parts) => {
    const V = [], E = [];
    parts.forEach(o => { const n = V.length; V.push(...o.V); o.E.forEach(e => E.push([e[0] + n, e[1] + n])); });
    return { V, E };
};



// const AX = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
// function cross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
// function norm(a){ const l=Math.hypot(...a); return a.map(c=>c/l); }
// function needle(d, len, baseR, baseOffset = 0.12) {
//   d = norm(d);
//   const ref = Math.abs(d[1]) > 0.9 ? [1,0,0] : [0,1,0];
//   const u = norm(cross(d, ref)), v = norm(cross(u, d));
//   const corners = [[1,1],[1,-1],[-1,-1],[-1,1]];
//   const V = corners.map(([su, sv]) => [0,1,2].map(i => d[i]*baseOffset + su*baseR*u[i] + sv*baseR*v[i]));
//   V.push(d.map(c => c * len));
//   const E = [[0,1],[1,2],[2,3],[3,0],[0,4],[1,4],[2,4],[3,4]];
//   return { V, E };
// }
// const CORNERS = [[1,1,1],[1,1,-1],[1,-1,1],[1,-1,-1],[-1,1,1],[-1,1,-1],[-1,-1,1],[-1,-1,-1]];
// const star14 = () => merge(
//   ...AX.map(d => needle(d, 1.9, 0.3, 0.14)),
//   ...CORNERS.map(d => needle(d, 1.15, 0.18, 0.1))
// );

const POINTS = [
  [0.14, 0.3, 0.3],
  [0.14, -0.3, 0.3],
  [0.14, -0.3, -0.3],
  [0.14, 0.3, -0.3],
  [1.9, 0, 0],
  [-0.14, 0.3, -0.3],
  [-0.14, -0.3, -0.3],
  [-0.14, -0.3, 0.3],
  [-0.14, 0.3, 0.3],
  [-1.9, 0, 0],
  [0.3, 0.14, -0.3],
  [-0.3, 0.14, -0.3],
  [-0.3, 0.14, 0.3],
  [0.3, 0.14, 0.3],
  [0, 1.9, 0],
  [0.3, -0.14, 0.3],
  [-0.3, -0.14, 0.3],
  [-0.3, -0.14, -0.3],
  [0.3, -0.14, -0.3],
  [0, -1.9, 0],
  [-0.3, 0.3, 0.14],
  [-0.3, -0.3, 0.14],
  [0.3, -0.3, 0.14],
  [0.3, 0.3, 0.14],
  [0, 0, 1.9],
  [0.3, 0.3, -0.14],
  [0.3, -0.3, -0.14],
  [-0.3, -0.3, -0.14],
  [-0.3, 0.3, -0.14],
  [0, 0, -1.9],
  [-0.143, 0.205, 0.112],
  [0.004, -0.089, 0.258],
  [0.258, -0.089, 0.004],
  [0.112, 0.205, -0.143],
  [0.664, 0.664, 0.664],
  [0.112, 0.205, 0.143],
  [0.258, -0.089, -0.004],
  [0.004, -0.089, -0.258],
  [-0.143, 0.205, -0.112],
  [0.664, 0.664, -0.664],
  [0.004, 0.089, 0.258],
  [-0.143, -0.205, 0.112],
  [0.112, -0.205, -0.143],
  [0.258, 0.089, 0.004],
  [0.664, -0.664, 0.664],
  [0.258, 0.089, -0.004],
  [0.112, -0.205, 0.143],
  [-0.143, -0.205, -0.112],
  [0.004, 0.089, -0.258],
  [0.664, -0.664, -0.664],
  [-0.112, 0.205, -0.143],
  [-0.258, -0.089, 0.004],
  [-0.004, -0.089, 0.258],
  [0.143, 0.205, 0.112],
  [-0.664, 0.664, 0.664],
  [0.143, 0.205, -0.112],
  [-0.004, -0.089, -0.258],
  [-0.258, -0.089, -0.004],
  [-0.112, 0.205, 0.143],
  [-0.664, 0.664, -0.664],
  [-0.258, 0.089, 0.004],
  [-0.112, -0.205, -0.143],
  [0.143, -0.205, 0.112],
  [-0.004, 0.089, 0.258],
  [-0.664, -0.664, 0.664],
  [-0.004, 0.089, -0.258],
  [0.143, -0.205, -0.112],
  [-0.112, -0.205, 0.143],
  [-0.258, 0.089, -0.004],
  [-0.664, -0.664, -0.664]
];

const q = POINTS.map(([x, y, z]) => { /* ... même projection qu'avant ... */ });
q.forEach(p => g.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5)); // juste les points, pas de lignes

const SHAPES = {
    arch: merge(pyr(1.6,1,2.6), pyr(.8,1,1.3), box(0,1.1,0,3.6,.1,3.6)),
    port: merge(box(-.3,-.9,0,2.6,.1,1.8), box(0,0,0,2.6,.1,1.8), box(.3,.9,0,2.6,.1,1.8))
};

/* ---- rendu ---- */

const FG = getComputedStyle(document.documentElement).getPropertyValue("--second-color").trim() || "#fff";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

function draw(c, S, st) {
    const g = c.getContext("2d"), W = c.width, H = c.height, K = H * 0.17;
    const cx = Math.cos(st.rx), sx = Math.sin(st.rx), cy = Math.cos(st.ry), sy = Math.sin(st.ry);
    g.clearRect(0, 0, W, H);
    const q = S.V.map(([x, y, z]) => {
        const X = x * cy + z * sy, Z0 = -x * sy + z * cy;
        const Y = y * cx - Z0 * sx, Z = y * sx + Z0 * cx, k = 6 / (6 + Z);
        return [W / 2 + X * K * k, H / 2 + Y * K * k, Z];
    });
    g.strokeStyle = g.fillStyle = FG;
    g.lineWidth = 1.6;
    S.E.forEach(([a, b]) => {
        g.globalAlpha = Math.max(0.15, Math.min(0.95, 0.6 - (q[a][2] + q[b][2]) / 2 * 0.14));
        g.beginPath(); g.moveTo(q[a][0], q[a][1]); g.lineTo(q[b][0], q[b][1]); g.stroke();
    });
    g.globalAlpha = 1;
    q.forEach(p => g.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5));
}

export function loop() {
    
    document.querySelectorAll("canvas[data-s]").forEach(c => {
        const st = c._st || (c._st = { rx: -0.4, ry: 0.7, d: 0 });
        if (!c._b) {
            c._b = 1;
            c.onpointerdown = e => { st.d = 1; st.x = e.clientX; st.y = e.clientY; c.setPointerCapture(e.pointerId); };
            c.onpointermove = e => {
                if (!st.d) return;
                st.ry += (e.clientX - st.x) * 0.01;
                st.rx = Math.max(-1.4, Math.min(1.4, st.rx + (e.clientY - st.y) * 0.01));
                st.x = e.clientX; st.y = e.clientY;
            };
            c.onpointerup = c.onpointercancel = () => { st.d = 0; };
        }
        if (!st.d && !REDUCED) st.ry += 0.006;
        draw(c, SHAPES[c.dataset.s], st);
    });

    requestAnimationFrame(loop);
}