import { DataTemp } from "./GetJSON.js";

/*
    Champs attendus pour chaque projet dans GetJSON.js (Data[cle]) :
      Name             deja utilise
      PrimalCategorie  deja utilise
      Desc             texte de description                 (optionnel, "" par defaut)
      Tags             tableau de chaines                    (optionnel, [] par defaut)
      Link             URL du bouton "Voir le projet"        (optionnel, "#" par defaut)
      Shape            cle dans SHAPES ci-dessous             (optionnel : absent = pas d'objet 3D,
                        "web" | "arch" | "port" ...            le projet est traite comme "petit")
*/

const Data = await DataTemp;
const DataList = Data.List;

/* ================================================ ETAT ================================================ */

const State = { mode: "index", categorie: "All", sortAZ: false };
const MODES = { "Tab-1": "index", "Tab-2": "bands", "Tab-3": "bento" };

/* ================================================ FORMES 3D ================================================ */

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
const SHAPES = {
    web:  merge(box(.7,0,0,2.4,1.7,.14), line([-.5,-.5,.07],[1.9,-.5,.07]), box(-1.7,0,0,.8,.8,.8), line([-1.3,-.2,0],[-.5,-.2,0]), line([-1.3,.2,0],[-.5,.2,0])),
    arch: merge(pyr(1.6,1,2.6), pyr(.8,1,1.3), box(0,1.1,0,3.6,.1,3.6)),
    port: merge(box(-.3,-.9,0,2.6,.1,1.8), box(0,0,0,2.6,.1,1.8), box(.3,.9,0,2.6,.1,1.8))
};

// La couleur du trait vient de --second-color, comme tout le reste du site
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
function loop() {
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

/* ================================================ GABARITS HTML ================================================ */

const TagsHTML = tags => `<div class="Project-Tags">${(tags || []).map(x => `<span class="Project-Tag">${x}</span>`).join("")}</div>`;
const StageHTML = shape => shape ? `<div class="Project-Stage"><canvas data-s="${shape}" width="720" height="500" aria-label="Objet 3D du projet, glisser pour le faire tourner"></canvas><span class="Project-Hint">Glisse pour faire tourner</span></div>` : "";
const InfoHTML = (P, big) => `<span class="Project-Meta">${P.PrimalCategorie}</span><h3 class="Project-Title${big ? " Big" : ""}">${P.Name}</h3><p class="Project-Desc">${P.Desc || ""}</p>${TagsHTML(P.Tags)}<a class="Btn_1 Btn-Common" href="${P.Link || "#"}"><span>Voir le projet →</span></a>`;

/* ================================================ LISTE FILTREE / TRIEE ================================================ */

function CurrentList() {
    let L = DataList.filter(k => State.categorie === "All" || Data[k].PrimalCategorie === State.categorie);
    if (State.sortAZ) L = [...L].sort((a, b) => Data[a].Name.localeCompare(Data[b].Name, "fr"));
    return L;
}

/* ================================================ RENDU : INDEX ================================================ */

function RenderIndex(L) {
    const viewer = document.getElementById("Project-Viewer");
    viewer.innerHTML = `<section></section><aside></aside>`;
    const section = viewer.querySelector("section");
    L.forEach((name, i) => {
        const div = document.createElement("div");
        div.className = "Pro-View-Name" + (i === 0 ? " active" : "");
        div.dataset.name = name;
        div.dataset.categorie = Data[name].PrimalCategorie;
        div.innerHTML = `<h3>${Data[name].Name}</h3><p>${Data[name].PrimalCategorie}</p>`;
        div.addEventListener("mouseover", ProjectNameSelector);
        section.appendChild(div);
    });
    if (L.length) RenderAside(L[0]);
}

function RenderAside(name) {
    const aside = document.querySelector("#Project-Viewer > aside");
    if (!aside) return;
    const P = Data[name];
    aside.innerHTML = StageHTML(P.Shape) + InfoHTML(P, true);
}

function ProjectNameSelector(Event) {
    for (const Element of Event.currentTarget.parentElement.children) {
        if (Element.classList.contains("active")) {
            if (Element.dataset.name !== Event.currentTarget.dataset.name) Element.classList.remove("active");
        } else if (Event.currentTarget.dataset.name === Element.dataset.name) {
            Element.classList.add("active");
        }
    }
    RenderAside(Event.currentTarget.dataset.name);
}

/* ================================================ RENDU : BANDES ================================================ */

function RenderBands(L) {
    const viewer = document.getElementById("Project-Viewer");
    const big = L.filter(k => Data[k].Shape), small = L.filter(k => !Data[k].Shape);
    let h = big.map(k => `<div class="Pro-View-Band">${StageHTML(Data[k].Shape)}<div class="Pro-View-Col">${InfoHTML(Data[k], true)}</div></div>`).join("");
    if (small.length) {
        h += (big.length ? `<p class="Pro-View-Sub">Autres projets</p>` : "") +
             small.map(k => `<a class="Pro-View-Row" href="${Data[k].Link || "#"}"><h3 class="Project-Title">${Data[k].Name}</h3><p class="Project-Desc">${Data[k].Desc || ""}</p>${TagsHTML(Data[k].Tags)}</a>`).join("");
    }
    viewer.innerHTML = h;
}

/* ================================================ RENDU : BENTO ================================================ */

function RenderBento(L) {
    const viewer = document.getElementById("Project-Viewer");
    viewer.innerHTML = `<div id="Pro-View-Bento">${L.map(k => {
        const P = Data[k], big = !!P.Shape;
        return `<article class="Pro-View-Card${big ? " Big" : ""}">${StageHTML(P.Shape)}<div class="Pro-View-Card-Body">${InfoHTML(P, false)}</div></article>`;
    }).join("")}</div>`;
}

/* ================================================ RENDU GLOBAL ================================================ */

function Render() {
    const viewer = document.getElementById("Project-Viewer");
    const L = CurrentList();
    viewer.className = "mode-" + State.mode;
    if (!L.length) { viewer.innerHTML = `<p class="Project-Desc">Aucun projet dans cette categorie.</p>`; return; }
    if (State.mode === "index") RenderIndex(L);
    else if (State.mode === "bands") RenderBands(L);
    else RenderBento(L);
}

/* ================================================ INI ================================================ */

function ProjectCategorieIni() {
    const ParentElement = document.getElementById("Project-Finder-Group");
    const List = ["All"];
    for (const Element of DataList) {
        if (!List.includes(Data[Element].PrimalCategorie)) {
            ParentElement.innerHTML += '<button class="Btn_2 Project-Finder-Group-Btn" name="' + Data[Element].PrimalCategorie + '">' + Data[Element].PrimalCategorie + '</button>';
            List.push(Data[Element].PrimalCategorie);
        }
    }
    document.querySelectorAll(".Project-Finder-Group-Btn").forEach(btn => btn.addEventListener("click", E => ProjectCategorieSelector(E, List, SetCategorie)));
}

/* ================================================ CALL FUNCTION ================================================ */

function SetCategorie(Event) {
    State.categorie = Event.target.name;
    Render();
}

function SortProject(Event) {
    State.sortAZ = Event.target.classList.contains("active");
    Render();
}

function SetDisplay(Event) {
    State.mode = MODES[Event.target.name];
    Render();
}

/* ================================================ FUNCTION ================================================ */

function ProjectCategorieSelector(Event, List, Func, mode = false) {
    for (const Element of Event.target.parentElement.children) {
        if (List.includes(Element.name) && Element.classList.value.includes("active") && (List.length === 1 || Element.name !== Event.target.name)) {
            Element.classList.remove("active");
            if (mode) { Func(Event); }
        } else if (List.includes(Element.name) && Event.target.name === Element.name) {
            Element.classList.add("active");
            Func(Event);
        }
    }
}

/* ================================================ LOAD INI ================================================ */

ProjectCategorieIni();
Render();
loop();

/* ================================================ ADD LISTENER ================================================ */

document.getElementById("Project-Finder-ToolBox-Order").addEventListener("click",
    (E) => { ProjectCategorieSelector(E, ["Order"], SortProject, true); });
document.querySelectorAll(".Project-Finder-ToolBox-Btn").forEach(btn => btn.addEventListener("click",
    (E) => { ProjectCategorieSelector(E, ["Tab-1", "Tab-2", "Tab-3"], SetDisplay); }));

document.getElementsByClassName("Project-Finder-Group-Btn")[0].classList.add("active");
document.getElementsByClassName("Project-Finder-ToolBox-Btn")[0].classList.add("active");