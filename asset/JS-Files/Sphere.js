import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js";

const SPHERECONTAINER = document.getElementById("Sphere-Container");

function InitSphere() {

    // =================================== [ FUNCTIONS ] ===================================

    function updateView() {
        const BOX = SPHERECONTAINER.getBoundingClientRect();
        const FULLW = BOX.width;
        const FULLH = BOX.height;
        if (FULLW == 0 || FULLH == 0) return;

        // Zone visible = intersection entre la boite et la fenetre (coordonnées relatives à la boite)
        const VIEWW = document.documentElement.clientWidth;
        const VIEWH = document.documentElement.clientHeight;
        const X = Math.min(Math.max(0,-BOX.left),FULLW - 1);
        const Y = Math.min(Math.max(0,-BOX.top),FULLH - 1);
        const W = Math.max(1,Math.ceil(Math.min(BOX.right,VIEWW) - Math.max(BOX.left,0)));
        const H = Math.max(1,Math.ceil(Math.min(BOX.bottom,VIEWH) - Math.max(BOX.top,0)));

        const ASPECT = FULLW / FULLH;  // Ratio largeur par hauteur
        CAMERA.aspect = ASPECT;
        const HEIGHTDISTANCE = (RADIUS * 1.2) / Math.tan(CAMERA.fov * Math.PI / 360);
        CAMERA.position.z = Math.max(HEIGHTDISTANCE,HEIGHTDISTANCE / ASPECT); // HEIGHTDISTANCE / ASPECT = widthdistance

        // Le rendu ne couvre que la zone visible
        CAMERA.setViewOffset(FULLW,FULLH,X,Y,W,H);
        CAMERA.updateProjectionMatrix();

        RENDERER.setSize(W,H);
        DOTMATERIAL.size = DOT_SIZE * FULLH / H;
        RENDERER.domElement.style.position = "absolute";
        RENDERER.domElement.style.left = X + "px";
        RENDERER.domElement.style.top = Y + "px";
    }

    function fibonacciSphere(samples,radius,jitter) {
        const PTS = [];
        const PHIGOLDEN = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < samples; i++) {
            let y = 1 - (i / (samples - 1)) * 2;
            let theta = PHIGOLDEN * i;

            let phi = Math.acos(Math.max(-1, Math.min(1, y)));

            phi += (Math.random() - 0.5) * jitter;
            theta += (Math.random() - 0.5) * jitter * 1.6;

            phi = Math.max(0.001,Math.min(Math.PI - 0.001, phi));

            const SINPHI = Math.sin(phi);

            PTS.push(new THREE.Vector3(
                SINPHI * Math.cos(theta) * radius,  // x
                Math.cos(phi) * radius,             // yj
                SINPHI * Math.sin(theta) * radius   // z
            ));
        }
        return PTS;
    }

    function makeGlowTexture() {
        const SIZE = 128;
        const CANVAS = document.createElement("canvas");
        CANVAS.width = SIZE;
        CANVAS.height = SIZE;

        const CTX = CANVAS.getContext("2d");
        const GRADIENT = CTX.createRadialGradient(SIZE / 2,SIZE / 2,0,SIZE / 2,SIZE / 2,SIZE / 2);

        GRADIENT.addColorStop(0,"rgba(255,255,255,1)");
        GRADIENT.addColorStop(0.35,"rgba(255,255,255,0.7)");
        GRADIENT.addColorStop(1,"rgba(255,255,255,0)");

        CTX.fillStyle = GRADIENT;
        CTX.fillRect(0,0,SIZE,SIZE);

        return new THREE.CanvasTexture(CANVAS);
    }

    function animate() {
        requestAnimationFrame(animate);
        GLOBE.rotation.y += 0.0006;
        RENDERER.render(SCENE,CAMERA);
    }

    // =================================== [ PARAM ] ===================================

    const NUM_POINTS = 220;     // Nombres de points présents sur la sphere
    const RADIUS = 1.7;         // Taille de la sphere
    const JITTER_AMOUNT = 0.4;  // Dispersion des points celon leurs positions d"origine (0 = position d"origine)
    const DOT_SIZE = 0.08;      // Taille des points
    const POINTS = [];

    const MAX_LINK_DIST = 0.75;
    const MAX_LINKS_PER_POINT = 4;
    const LINEPOSITIONS = [];

    // =================================== [ VARIABLES ] ===================================

    const SCENE = new THREE.Scene();    // Creation de la scene 3D
    const CAMERA = new THREE.PerspectiveCamera(45,SPHERECONTAINER.clientWidth / SPHERECONTAINER.clientHeight,0.1,1000); // Creation de la vue
    
    // Camera.position.z = 5;

    const RENDERER = new THREE.WebGLRenderer({antialias:true,alpha:true});

    RENDERER.setPixelRatio(Math.min(window.devicePixelRatio,2));   // Plafonné à 2 : inutile et couteux au dela sur les écrans HiDPI

    SPHERECONTAINER.appendChild(RENDERER.domElement);

    const GLOBE = new THREE.Group();
    SCENE.add(GLOBE);

    POINTS.push(...fibonacciSphere(NUM_POINTS,RADIUS,JITTER_AMOUNT));

    const DOTGEOMETRY = new THREE.BufferGeometry().setFromPoints(POINTS);

    const DOTMATERIAL = new THREE.PointsMaterial(
    {
        color: 0xffffff,
        size: DOT_SIZE,
        map: makeGlowTexture(),
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    GLOBE.add(new THREE.Points(DOTGEOMETRY,DOTMATERIAL));


    for ( let i = 0; i < POINTS.length; i++ ) 
    {
        const CANDIDATES = [];
        for ( let j = 0; j < POINTS.length; j++ ) 
        {
            if ( i !== j ) 
            {
                const D = POINTS[i].distanceTo(POINTS[j]);
                if (D < MAX_LINK_DIST) 
                { CANDIDATES.push({j,D}); }
            }
        }
        CANDIDATES.sort((a, b) => a.D - b.D);
        for (let k = 0; k < Math.min(MAX_LINKS_PER_POINT,CANDIDATES.length); k++) 
        {
            const J = CANDIDATES[k].j;
            if ( J > i ) 
            { LINEPOSITIONS.push(POINTS[i].x,POINTS[i].y,POINTS[i].z,POINTS[J].x,POINTS[J].y,POINTS[J].z); }
        }
    }

    const LINEGEOMETRY = new THREE.BufferGeometry();
    LINEGEOMETRY.setAttribute("position",new THREE.Float32BufferAttribute(LINEPOSITIONS,3));

    const LINEMATERIAL = new THREE.LineBasicMaterial({color: 0xffffff,transparent: true,opacity: 0.55});
    GLOBE.add(new THREE.LineSegments(LINEGEOMETRY,LINEMATERIAL));

    updateView();
    animate();

    // Un seul recalcul par frame pendant un redimensionnement (évite de réallouer le canvas à chaque évènement)
    let resizePending = false;
    window.addEventListener("resize", () => 
    {
        if (resizePending) return;
        resizePending = true;
        requestAnimationFrame(() => 
        {
            resizePending = false;
            updateView();
        });
    });
}

InitSphere();