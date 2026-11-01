// =================================== [ GRILLE ] ===================================

function BackgroundGrid()
{
    const GRID = document.getElementById("Background-Grid");
    if (!GRID)
    { return; }

    // Pas de survol précis (écran tactile) : la grille reste statique, aucun écouteur n'est posé
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
    { return; }

    const MAIN = GRID.parentElement;
    const CURSOR = document.getElementById("Hud-Cursor");
    const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
    const SMOOTHING = 0.18;                 // Part de la distance rattrapée à chaque frame (1 = aucun retard sur le curseur)

    let PointerX = 0;                       // Curseur, en coordonnées fenêtre
    let PointerY = 0;
    let CurrentX = 0;                       // Position de la zone éclairée, en coordonnées de <main>
    let CurrentY = 0;
    let Running = false;                    // La boucle d'animation est en cours
    let FirstMove = true;                   // Premier mouvement après l'entrée dans la fenêtre : pas de glissement depuis l'ancienne position
    let LastReadout = "";

    function Step()
    {
        // Une seule lecture de géométrie par frame (le curseur est en coordonnées fenêtre, la grille en coordonnées de <main>)
        const BOX = MAIN.getBoundingClientRect();
        const TARGET_X = PointerX - BOX.left;
        const TARGET_Y = PointerY - BOX.top;

        if (FirstMove || REDUCED_MOTION.matches)
        {
            CurrentX = TARGET_X;
            CurrentY = TARGET_Y;
            FirstMove = false;
        }
        else
        {
            CurrentX += (TARGET_X - CurrentX) * SMOOTHING;
            CurrentY += (TARGET_Y - CurrentY) * SMOOTHING;
        }

        GRID.style.setProperty("--mx", CurrentX.toFixed(1) + "px");
        GRID.style.setProperty("--my", CurrentY.toFixed(1) + "px");

        if (CURSOR)
        {
            const READOUT = "x " + String(Math.round(PointerX)).padStart(4, "0") + "  y " + String(Math.round(PointerY)).padStart(4, "0");
            if (READOUT !== LastReadout)
            {
                CURSOR.textContent = READOUT;
                LastReadout = READOUT;
            }
        }

        // Au repos la boucle s'arrête : aucun coût tant que la souris ne bouge pas
        if (Math.abs(TARGET_X - CurrentX) < 0.5 && Math.abs(TARGET_Y - CurrentY) < 0.5)
        {
            Running = false;
            return;
        }
        requestAnimationFrame(Step);
    }

    document.addEventListener("pointermove", (Event) =>
    {
        if (Event.pointerType == "touch")
        { return; }

        PointerX = Event.clientX;
        PointerY = Event.clientY;
        GRID.classList.add("is-active");

        if (!Running)
        {
            Running = true;
            requestAnimationFrame(Step);
        }
    });

    document.documentElement.addEventListener("pointerleave", () =>
    {
        GRID.classList.remove("is-active");
        FirstMove = true;
    });
}

// =================================== [ HUD ] ===================================

// Heure d'Annecy (et non celle du visiteur), mise à jour à chaque seconde pile
function HudClock()
{
    const CLOCK = document.getElementById("Hud-Clock");
    if (!CLOCK)
    { return; }

    const FORMAT = new Intl.DateTimeFormat("fr-FR",
    {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        timeZoneName: "short"
    });

    function Tick()
    {
        CLOCK.textContent = FORMAT.format(new Date());
        setTimeout(Tick, 1000 - (Date.now() % 1000));   // Se recale sur la seconde suivante (pas de dérive)
    }
    Tick();
}

// =================================== [ INIT ] ===================================

BackgroundGrid();
HudClock();