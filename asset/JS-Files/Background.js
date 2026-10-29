// Fond de la page d'accueil : grille de points éclairée autour du curseur + infos techniques (HUD)

function BackgroundGrid() {
    const GRID = document.getElementById('Background-Grid');
    if (!GRID) return;

    // Pas de survol précis (écran tactile) : la grille reste statique, aucun écouteur n'est posé
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const MAIN = GRID.parentElement;
    const CURSOR = document.getElementById('Hud-Cursor');
    const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');
    const SMOOTHING = 0.18;                 // Part de la distance rattrapée à chaque frame (1 = aucun retard sur le curseur)

    let pointerX = 0;                       // Curseur, en coordonnées fenêtre
    let pointerY = 0;
    let currentX = 0;                       // Position de la zone éclairée, en coordonnées de <main>
    let currentY = 0;
    let running = false;                    // La boucle d'animation est en cours
    let firstMove = true;                   // Premier mouvement après l'entrée dans la fenêtre : pas de glissement depuis l'ancienne position
    let lastReadout = '';

    const Step = () => {
        // Une seule lecture de géométrie par frame (le curseur est en coordonnées fenêtre, la grille en coordonnées de <main>)
        const BOX = MAIN.getBoundingClientRect();
        const TARGETX = pointerX - BOX.left;
        const TARGETY = pointerY - BOX.top;

        if (firstMove || REDUCED_MOTION.matches) {
            currentX = TARGETX;
            currentY = TARGETY;
            firstMove = false;
        } else {
            currentX += (TARGETX - currentX) * SMOOTHING;
            currentY += (TARGETY - currentY) * SMOOTHING;
        }

        GRID.style.setProperty('--mx', currentX.toFixed(1) + 'px');
        GRID.style.setProperty('--my', currentY.toFixed(1) + 'px');

        if (CURSOR) {
            const READOUT = 'x ' + String(Math.round(pointerX)).padStart(4, '0') + '  y ' + String(Math.round(pointerY)).padStart(4, '0');
            if (READOUT !== lastReadout) {
                CURSOR.textContent = READOUT;
                lastReadout = READOUT;
            }
        }

        // Au repos la boucle s'arrête : aucun coût tant que la souris ne bouge pas
        if (Math.abs(TARGETX - currentX) < 0.5 && Math.abs(TARGETY - currentY) < 0.5) {
            running = false;
            return;
        }
        requestAnimationFrame(Step);
    };

    document.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;

        pointerX = e.clientX;
        pointerY = e.clientY;
        GRID.classList.add('is-active');

        if (!running) {
            running = true;
            requestAnimationFrame(Step);
        }
    });

    document.documentElement.addEventListener('pointerleave', () => {
        GRID.classList.remove('is-active');
        firstMove = true;
    });
}

// Heure d'Annecy (et non celle du visiteur), mise à jour à chaque seconde pile
function HudClock() {
    const CLOCK = document.getElementById('Hud-Clock');
    if (!CLOCK) return;

    const FORMAT = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short'
    });

    const Tick = () => {
        CLOCK.textContent = FORMAT.format(new Date());
        setTimeout(Tick, 1000 - (Date.now() % 1000));   // Se recale sur la seconde suivante (pas de dérive)
    };
    Tick();
}

BackgroundGrid();
HudClock();