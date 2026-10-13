const SHAPES_PATH = "Projects/shapes/";

const SHAPES = {
    "None":{"V":[],"E":[]}};   // cache : nom -> {V, E} une fois charge
const LOADING = {};  // nom -> Promise en cours, pour ne pas charger 2 fois en parallele

function getShape(name) {
    if (SHAPES[name]) return;           // deja en cache, rien a faire
    if (LOADING[name]) return;          // deja en cours de chargement
    LOADING[name] = fetch(SHAPES_PATH + name + ".json")
        .then(r => r.json())
        .then(s => { SHAPES[name] = s; })
        .catch(err => console.error("forme introuvable :", name, err))
        .finally(() => { delete LOADING[name]; });
}

/* ---- rendu ---- */

const FG = getComputedStyle(document.documentElement).getPropertyValue("--second-color").trim() || "#fff";
const REDUCED = false;
// const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        const name = c.dataset.s;
        const st = c._st || (c._st = { rx: 0.3, ry: 0.5, d: 0 });
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
        if (!SHAPES[name]) { getShape(name); return; }  // pas encore chargee : on la demande, on saute cette image
        if (!st.d && !REDUCED) st.ry += 0.006;
        draw(c, SHAPES[name], st);
    });
    requestAnimationFrame(loop);
}