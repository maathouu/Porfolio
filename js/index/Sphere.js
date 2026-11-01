import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

const SPHERE_CONTAINER = document.getElementById("Sphere-Container");

function InitSphere()
{

    // =================================== [ FUNCTIONS ] ===================================

    function UpdateView()
    {
        const BOX = SPHERE_CONTAINER.getBoundingClientRect();
        const FULL_W = BOX.width;
        const FULL_H = BOX.height;
        if (FULL_W == 0 || FULL_H == 0)
        { return; }

        // Zone visible = intersection entre la boîte et la fenêtre (coordonnées relatives à la boîte)
        const VIEW_W = document.documentElement.clientWidth;
        const VIEW_H = document.documentElement.clientHeight;
        const X = Math.min(Math.max(0, -BOX.left), FULL_W - 1);
        const Y = Math.min(Math.max(0, -BOX.top), FULL_H - 1);
        const W = Math.max(1, Math.ceil(Math.min(BOX.right, VIEW_W) - Math.max(BOX.left, 0)));
        const H = Math.max(1, Math.ceil(Math.min(BOX.bottom, VIEW_H) - Math.max(BOX.top, 0)));

        const ASPECT = FULL_W / FULL_H;  // Ratio largeur par hauteur
        CAMERA.aspect = ASPECT;
        const HEIGHT_DISTANCE = (RADIUS * 1.2) / Math.tan(CAMERA.fov * Math.PI / 360);
        CAMERA.position.z = Math.max(HEIGHT_DISTANCE, HEIGHT_DISTANCE / ASPECT); // HEIGHT_DISTANCE / ASPECT = distance selon la largeur

        // Le rendu ne couvre que la zone visible
        CAMERA.setViewOffset(FULL_W, FULL_H, X, Y, W, H);
        CAMERA.updateProjectionMatrix();

        RENDERER.setSize(W, H);
        DOT_MATERIAL.size = DOT_SIZE * FULL_H / H;
        RENDERER.domElement.style.position = "absolute";
        RENDERER.domElement.style.left = X + "px";
        RENDERER.domElement.style.top = Y + "px";
    }

    function FibonacciSphere(Samples, Radius, Jitter)
    {
        const PTS = [];
        const PHI_GOLDEN = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < Samples; i++)
        {
            let Y = 1 - (i / (Samples - 1)) * 2;
            let Theta = PHI_GOLDEN * i;

            let Phi = Math.acos(Math.max(-1, Math.min(1, Y)));

            Phi += (Math.random() - 0.5) * Jitter;
            Theta += (Math.random() - 0.5) * Jitter * 1.6;

            Phi = Math.max(0.001, Math.min(Math.PI - 0.001, Phi));

            const SIN_PHI = Math.sin(Phi);

            PTS.push(new THREE.Vector3(
                SIN_PHI * Math.cos(Theta) * Radius,     // x
                Math.cos(Phi) * Radius,                 // y
                SIN_PHI * Math.sin(Theta) * Radius      // z
            ));
        }
        return PTS;
    }

    function MakeGlowTexture()
    {
        const SIZE = 128;
        const CANVAS = document.createElement("canvas");
        CANVAS.width = SIZE;
        CANVAS.height = SIZE;

        const CTX = CANVAS.getContext("2d");
        const GRADIENT = CTX.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);

        GRADIENT.addColorStop(0, "rgba(255,255,255,1)");
        GRADIENT.addColorStop(0.35, "rgba(255,255,255,0.7)");
        GRADIENT.addColorStop(1, "rgba(255,255,255,0)");

        CTX.fillStyle = GRADIENT;
        CTX.fillRect(0, 0, SIZE, SIZE);

        return new THREE.CanvasTexture(CANVAS);
    }

    function Animate()
    {
        requestAnimationFrame(Animate);
        GLOBE.rotation.y += 0.0006;
        RENDERER.render(SCENE, CAMERA);
    }

    // =================================== [ PARAM ] ===================================

    const NUM_POINTS            = 220;          // Nombre de points présents sur la sphère
    const RADIUS                = 1.7;          // Taille de la sphère
    const JITTER_AMOUNT         = 0.4;          // Dispersion des points selon leurs positions d'origine (0 = position d'origine)
    const DOT_SIZE              = 0.08;         // Taille des points
    const MAX_LINK_DIST         = 0.75;
    const MAX_LINKS_PER_POINT   = 4;

    const POINTS                = [];
    const LINE_POSITIONS        = [];

    // =================================== [ VARIABLES ] ===================================

    const COLOR     = getComputedStyle(document.documentElement).getPropertyValue("--second-color");
    const SCENE     = new THREE.Scene();    // Création de la scène 3D
    const CAMERA    = new THREE.PerspectiveCamera(45, SPHERE_CONTAINER.clientWidth / SPHERE_CONTAINER.clientHeight, 0.1, 1000); // Création de la vue
    const RENDERER  = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    RENDERER.setPixelRatio(Math.min(window.devicePixelRatio, 2));   // Plafonné à 2 : inutile et coûteux au-delà sur les écrans HiDPI

    SPHERE_CONTAINER.appendChild(RENDERER.domElement);

    const GLOBE = new THREE.Group();
    SCENE.add(GLOBE);

    POINTS.push(...FibonacciSphere(NUM_POINTS, RADIUS, JITTER_AMOUNT));

    const DOT_GEOMETRY = new THREE.BufferGeometry().setFromPoints(POINTS);

    const DOT_MATERIAL = new THREE.PointsMaterial(
    {
        color: COLOR,
        size: DOT_SIZE,
        map: MakeGlowTexture(),
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    GLOBE.add(new THREE.Points(DOT_GEOMETRY, DOT_MATERIAL));

    for (let i = 0; i < POINTS.length; i++)
    {
        const CANDIDATES = [];
        for (let j = 0; j < POINTS.length; j++)
        {
            if (i !== j)
            {
                const D = POINTS[i].distanceTo(POINTS[j]);
                if (D < MAX_LINK_DIST)
                { CANDIDATES.push({ Index: j, Distance: D }); }
            }
        }
        CANDIDATES.sort((A, B) => A.Distance - B.Distance);
        for (let k = 0; k < Math.min(MAX_LINKS_PER_POINT, CANDIDATES.length); k++)
        {
            const J = CANDIDATES[k].Index;
            if (J > i)
            { LINE_POSITIONS.push(POINTS[i].x, POINTS[i].y, POINTS[i].z, POINTS[J].x, POINTS[J].y, POINTS[J].z); }
        }
    }

    const LINE_GEOMETRY = new THREE.BufferGeometry();
    LINE_GEOMETRY.setAttribute("position", new THREE.Float32BufferAttribute(LINE_POSITIONS, 3));

    const LINE_MATERIAL = new THREE.LineBasicMaterial({ color: COLOR, transparent: true, opacity: 0.55 });
    GLOBE.add(new THREE.LineSegments(LINE_GEOMETRY, LINE_MATERIAL));

    UpdateView();
    Animate();

    // Un seul recalcul par frame pendant un redimensionnement (évite de réallouer le canvas à chaque évènement)
    let ResizePending = false;
    window.addEventListener("resize", () =>
    {
        if (ResizePending)
        { return; }

        ResizePending = true;
        requestAnimationFrame(() =>
        {
            ResizePending = false;
            UpdateView();
        });
    });
}

// =================================== [ INIT ] ===================================

InitSphere();