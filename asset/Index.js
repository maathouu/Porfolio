function MailClipboard() {
    const LINK = document.getElementById('MailCopyClipBoard');
    if (!LINK) return;

    const TOOLTIP = LINK.querySelector('.Tooltip');
    const ADDRESS = LINK.getAttribute('href').replace(/^mailto:/, '');  // Source unique : le href du lien
    const VISIBLE_TIME = 2000;                                          // Durée d'affichage de la confirmation (ms)
    const FADE_TIME = 300;                                              // A garder >= à la transition CSS de .Tooltip

    let hideTimer;
    let clearTimer;

    LINK.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            await navigator.clipboard.writeText(ADDRESS);
        } catch {
            // Presse-papiers indisponible (contexte non sécurisé, permission refusée) : on ouvre le client mail à la place
            window.location.href = LINK.href;
            return;
        }

        clearTimeout(hideTimer);
        clearTimeout(clearTimer);

        TOOLTIP.textContent = 'Adresse copiée';
        LINK.classList.add('is-copied');

        hideTimer = setTimeout(() => {
            LINK.classList.remove('is-copied');
            clearTimer = setTimeout(() => { TOOLTIP.textContent = ''; }, FADE_TIME);   // Vidé pour que le lecteur d'écran ré-annonce au prochain clic
        }, VISIBLE_TIME);
    });
}

MailClipboard();