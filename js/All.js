// =================================== [ HEADER ] ===================================

function HeaderSelected()
{
    const HEADER_LINKS = document.getElementsByClassName("Header-Link");
    let CurrentPath = window.location.pathname;

    if (CurrentPath.endsWith("/"))
    { CurrentPath += "index.html"; }

    for (let i = 0; i < HEADER_LINKS.length; i++)
    {
        const LINK_PATH = new URL(HEADER_LINKS[i].href).pathname;
        if (LINK_PATH == CurrentPath)
        { HEADER_LINKS[i].setAttribute("aria-current", "page"); }   // Le style est géré en CSS (global.css)
    }
}

// Même si l'utilisateur enlève sa souris / sa sélection clavier pendant l'animation, celle-ci continue jusqu'à la fin
function HeaderLinkHover(Link)
{
    if (Link.getAttribute("aria-current") == "page")       // Si le lien est déjà souligné en permanence (HeaderSelected)
    { return; }

    let Hovered = false;                                    // La souris est sur le lien
    let Focused = false;                                    // Le lien a le focus clavier
    let Busy = false;                                       // Une animation (avant ou arrière) est en cours

    function Update()
    {
        if (Busy)
        { return; }

        const WANTED = Hovered || Focused;
        if (WANTED == Link.classList.contains("is-drawn"))
        { return; }

        Link.classList.toggle("is-drawn", WANTED);          // Animation en cours
        Busy = true;

        // Durée lue dans le CSS
        const DURATION = parseFloat(getComputedStyle(Link, "::after").transitionDuration) * 1000;
        setTimeout(() =>
        {
            Busy = false;
            Update();                                       // Rattrape un survol / une sortie arrivé pendant l'animation
        }, DURATION + 20);
    }

    // Souris
    Link.addEventListener("mouseenter", () => { Hovered = true;  Update(); });
    Link.addEventListener("mouseleave", () => { Hovered = false; Update(); });
    // Clavier (via la touche tab)
    Link.addEventListener("focus",      () => { Focused = Link.matches(":focus-visible"); Update(); });
    Link.addEventListener("blur",       () => { Focused = false; Update(); });
}

function HeaderHover()
{
    const HEADER_LINKS = document.getElementsByClassName("Header-Link");

    for (const LINK of HEADER_LINKS)
    { HeaderLinkHover(LINK); }
}

// =================================== [ INIT ] ===================================

HeaderSelected();
HeaderHover();