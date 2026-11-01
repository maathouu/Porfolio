function MailClipboard() 
{
    const LINK = document.getElementById('MailCopyClipBoard');

    const TOOLTIP = LINK.querySelector('.Tooltip');
    const ADDRESS = LINK.getAttribute('href').replace(/^mailto:/, '');  // Source unique : le href du lien
    const VISIBLE_TIME = 2000;                                          // Durée d'affichage de la confirmation (ms)
    const FADE_TIME = 300;                                              // A garder >= à la transition CSS de .Tooltip

    let HideTimer;
    let ClearTimer;

    async function CopyMail(Event)
    {
        Event.preventDefault();

        try 
        { await navigator.clipboard.writeText(ADDRESS); } 
        catch 
        {
            window.location.href = LINK.href;                           // Presse-papiers indisponible (contexte non sécurisé, permission refusée) : on ouvre le client mail à la place
            return;
        }

        clearTimeout(HideTimer);
        clearTimeout(ClearTimer);

        TOOLTIP.textContent = 'Adresse copiée';
        LINK.classList.add('is-copied');

        HideTimer = setTimeout(() => 
        {
            LINK.classList.remove('is-copied');
            ClearTimer = setTimeout(() => { TOOLTIP.textContent = ''; }, FADE_TIME);   // Vidé pour que le lecteur d'écran ré-annonce au prochain clic
        }, VISIBLE_TIME);
    }

    LINK.addEventListener('click',CopyMail);
}

MailClipboard();