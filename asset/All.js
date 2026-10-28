const rootStyles = getComputedStyle(document.documentElement);
const MainColor = rootStyles.getPropertyValue('--main-color');
const SelectedSecondColor = rootStyles.getPropertyValue('--selected-second-color');

function HeaderSelected() 
{
    let HeaderLinkTag = document.getElementsByClassName("Header-Link");
    let CurrentPath = window.location.pathname;

    if (CurrentPath.endsWith("/")) 
    { CurrentPath += "index.html"; }

    for (let i = 0; i < HeaderLinkTag.length; i++) {
        const LINKPATH = new URL(HeaderLinkTag[i].href).pathname;
        if (LINKPATH == CurrentPath) 
        { HeaderLinkTag[i].setAttribute("aria-current", "page"); }   // Le style est géré en CSS (global.css)
    }
}
HeaderSelected();

// Meme si l'utilisateur enleve sa souris / seleciton du clavier pendant l'animation, celle ci continue jusqu'a la fin
function HeaderHover() 
{
    const LINKS = document.getElementsByClassName("Header-Link");

    for (const LINK of LINKS) 
    {
        if (LINK.getAttribute("aria-current") == "page")    // Si le link est deja souligne en permanence ( HeaderSelected )
        { continue; }

        let Hovered = false;                                // La souris est sur le lien
        let Focused = false;                                // Le lien a le focus clavier
        let Busy = false;                                   // Une animation (avant ou arriere) est en cours

        const Update = () => 
        {
            if (Busy)
            { return; }

            const WANTED = Hovered || Focused;
            if (WANTED == LINK.classList.contains("is-drawn")) 
            { return; }

            LINK.classList.toggle("is-drawn", WANTED);      // Animation en cours
            Busy = true;

            // Durée lue dans le CSS
            const DURATION = parseFloat(getComputedStyle(LINK, "::after").transitionDuration) * 1000;
            setTimeout(() => 
            {
                Busy = false;
                Update();                                   // Rattrape un survol / une sortie arrivé pendant l'animation
            }, DURATION + 20);
        };

        // Souris
        LINK.addEventListener("mouseenter", () => { Hovered = true;  Update(); });
        LINK.addEventListener("mouseleave", () => { Hovered = false; Update(); });
        // Clavier (via touche tab)
        LINK.addEventListener("focus",      () => { Focused = LINK.matches(":focus-visible"); Update(); });
        LINK.addEventListener("blur",       () => { Focused = false; Update(); });
    }
}
HeaderHover();